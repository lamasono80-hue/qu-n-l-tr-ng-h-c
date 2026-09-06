import { pool } from '../../config/database';
import {
  ModerationEntityType,
  ListUsersQueryDto,
  AdminUserStatus,
  TargetUserStatus,
} from './admin.validation';

export interface SystemStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  active_project_posts: number;
  active_study_requests: number;
  active_skill_listings: number;
  total_matches_formed: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  major: string | null;
  role: string;
  status: AdminUserStatus;
  created_at: Date;
}

export interface StandardSkillRow {
  id: string;
  name: string;
  category: string;
  is_system_standard: boolean;
}

export interface StandardCourseRow {
  id: string;
  course_code: string;
  course_name: string;
}

export class AdminRepository {
  /**
   * API-ADM-01: Get System Analytics & Dashboard Stats
   */
  async getSystemStats(): Promise<SystemStats> {
    const [
      totalUsersRes,
      activeUsersRes,
      suspendedUsersRes,
      activeProjectsRes,
      activeStudyRes,
      activeSkillRes,
      totalMatchesRes,
    ] = await Promise.all([
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users;`),
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users WHERE status = 'ACTIVE';`),
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users WHERE status = 'SUSPENDED';`),
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM project_posts WHERE status = 'OPEN';`),
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM study_requests WHERE status = 'OPEN';`),
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM skill_listings WHERE status = 'OPEN';`),
      pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM conversations;`),
    ]);

    return {
      total_users: parseInt(totalUsersRes.rows[0].count, 10),
      active_users: parseInt(activeUsersRes.rows[0].count, 10),
      suspended_users: parseInt(suspendedUsersRes.rows[0].count, 10),
      active_project_posts: parseInt(activeProjectsRes.rows[0].count, 10),
      active_study_requests: parseInt(activeStudyRes.rows[0].count, 10),
      active_skill_listings: parseInt(activeSkillRes.rows[0].count, 10),
      total_matches_formed: parseInt(totalMatchesRes.rows[0].count, 10),
    };
  }

  /**
   * API-ADM-02: List & Search User Accounts
   */
  async listUsers(
    query: ListUsersQueryDto
  ): Promise<{ rows: AdminUserRow[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.status) {
      conditions.push(`u.status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (query.search) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR sp.full_name ILIKE $${paramIndex})`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total count
    const countSql = `
      SELECT COUNT(*)::text AS count
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      ${whereClause};
    `;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        u.id, u.email, u.role, u.status, u.created_at,
        sp.full_name, sp.major
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<AdminUserRow>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }

  async findUserById(userId: string): Promise<{ id: string; email: string; role: string; status: string } | null> {
    const res = await pool.query<{ id: string; email: string; role: string; status: string }>(
      `SELECT id, email, role, status FROM users WHERE id = $1;`,
      [userId]
    );
    return res.rows[0] || null;
  }

  /**
   * API-ADM-03: Update User Account Status + Atomic Moderation Audit Log (BR-007)
   */
  async updateUserStatus(
    userId: string,
    newStatus: TargetUserStatus,
    adminId: string,
    reason: string
  ): Promise<{ user_id: string; new_status: TargetUserStatus }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update user status
      await client.query(
        `UPDATE users
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2;`,
        [newStatus, userId]
      );

      // 2. Insert audit log
      await client.query(
        `INSERT INTO account_moderation_logs (
          admin_id, target_entity_type, target_entity_id, action, reason
         ) VALUES ($1, 'USER', $2, 'UPDATE_STATUS', $3);`,
        [adminId, userId, reason]
      );

      await client.query('COMMIT');
      return { user_id: userId, new_status: newStatus };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * API-ADM-04: Soft Moderation Removal of Violating Listing (BR-009)
   */
  async softRemoveListing(
    entityType: ModerationEntityType,
    entityId: string,
    adminId: string,
    reason: string
  ): Promise<{ entity_type: ModerationEntityType; entity_id: string; status: string; moderated_at: Date } | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let updateSql = '';
      if (entityType === 'PROJECT_POST') {
        updateSql = `UPDATE project_posts SET status = 'REMOVED_BY_ADMIN', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, updated_at;`;
      } else if (entityType === 'STUDY_REQUEST') {
        updateSql = `UPDATE study_requests SET status = 'REMOVED_BY_ADMIN', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, updated_at;`;
      } else if (entityType === 'SKILL_LISTING') {
        updateSql = `UPDATE skill_listings SET status = 'REMOVED_BY_ADMIN', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, updated_at;`;
      }

      const updateRes = await client.query<{ id: string; updated_at: Date }>(updateSql, [entityId]);
      if (updateRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const moderatedAt = updateRes.rows[0].updated_at;

      // Atomic audit log insertion
      await client.query(
        `INSERT INTO account_moderation_logs (
          admin_id, target_entity_type, target_entity_id, action, reason
         ) VALUES ($1, $2, $3, 'SOFT_REMOVE', $4);`,
        [adminId, entityType, entityId, reason]
      );

      await client.query('COMMIT');
      return {
        entity_type: entityType,
        entity_id: entityId,
        status: 'REMOVED_BY_ADMIN',
        moderated_at: moderatedAt,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * API-ADM-05: Add System Standard Skill
   */
  async addStandardSkill(name: string, category: string): Promise<StandardSkillRow> {
    const checkRes = await pool.query<{ id: string }>(
      `SELECT id FROM skills WHERE name = $1;`,
      [name]
    );

    if (checkRes.rows.length > 0) {
      throw new Error('SKILL_ALREADY_EXISTS');
    }

    const insertRes = await pool.query<StandardSkillRow>(
      `INSERT INTO skills (name, category, is_system_standard)
       VALUES ($1, $2, TRUE)
       RETURNING id, name, category, is_system_standard;`,
      [name, category]
    );

    return insertRes.rows[0];
  }

  /**
   * API-ADM-06: Add Standard Course to Catalog
   */
  async addStandardCourse(courseCode: string, courseName: string): Promise<StandardCourseRow> {
    const checkRes = await pool.query<{ id: string }>(
      `SELECT id FROM courses WHERE course_code = $1;`,
      [courseCode]
    );

    if (checkRes.rows.length > 0) {
      throw new Error('COURSE_ALREADY_EXISTS');
    }

    const insertRes = await pool.query<StandardCourseRow>(
      `INSERT INTO courses (course_code, course_name)
       VALUES ($1, $2)
       RETURNING id, course_code, course_name;`,
      [courseCode, courseName]
    );

    return insertRes.rows[0];
  }
}

export const adminRepository = new AdminRepository();
