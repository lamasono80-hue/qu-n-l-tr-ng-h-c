import { pool } from '../../config/database';
import {
  CreateProjectDto,
  ListProjectsQueryDto,
  ListMyApplicationsQueryDto,
  ProjectCategory,
  ProjectStatus,
  ApplicationStatus,
} from './project.validation';

export interface ProjectPostRow {
  id: string;
  author_id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  total_slots: number;
  accepted_slots: number;
  deadline: string;
  status: ProjectStatus;
  created_at: Date;
  updated_at: Date;
  // Author metadata
  author_full_name?: string;
  author_major?: string;
  author_avatar_url?: string | null;
}

export interface ProjectRequiredSkill {
  skill_id: string;
  name: string;
}

export interface ProjectApplicationRow {
  id: string;
  post_id: string;
  applicant_id: string;
  intro_note: string | null;
  status: ApplicationStatus;
  created_at: Date;
  updated_at: Date;
}

export class ProjectRepository {
  async listProjects(
    query: ListProjectsQueryDto,
    currentUserId?: string
  ): Promise<{ rows: ProjectPostRow[]; total: number }> {
    const conditions: string[] = ["p.status != 'REMOVED_BY_ADMIN'"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.is_mine && currentUserId) {
      conditions.push(`p.author_id = $${paramIndex++}`);
      params.push(currentUserId);
    }

    if (query.status) {
      conditions.push(`p.status = $${paramIndex++}`);
      params.push(query.status);
    }

    // BR-005 Deadline Enforce for OPEN status
    if (query.status === 'OPEN') {
      conditions.push(`p.deadline >= CURRENT_DATE`);
    }

    if (query.category) {
      conditions.push(`p.category = $${paramIndex++}`);
      params.push(query.category);
    }

    if (query.skill_id) {
      conditions.push(
        `EXISTS (SELECT 1 FROM project_post_skills pps WHERE pps.post_id = p.id AND pps.skill_id = $${paramIndex++})`
      );
      params.push(query.skill_id);
    }

    if (query.search) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total Count
    const countSql = `SELECT COUNT(*)::text AS count FROM project_posts p ${whereClause};`;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Paginated rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        p.id, p.author_id, p.title, p.description, p.category,
        p.total_slots, p.accepted_slots, TO_CHAR(p.deadline, 'YYYY-MM-DD') AS deadline,
        p.status, p.created_at, p.updated_at,
        sp.full_name AS author_full_name,
        sp.major AS author_major,
        sp.avatar_url AS author_avatar_url
      FROM project_posts p
      JOIN student_profiles sp ON p.author_id = sp.user_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<ProjectPostRow>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }

  async findById(postId: string): Promise<ProjectPostRow | null> {
    const res = await pool.query<ProjectPostRow>(
      `SELECT
        p.id, p.author_id, p.title, p.description, p.category,
        p.total_slots, p.accepted_slots, TO_CHAR(p.deadline, 'YYYY-MM-DD') AS deadline,
        p.status, p.created_at, p.updated_at,
        sp.full_name AS author_full_name,
        sp.major AS author_major,
        sp.avatar_url AS author_avatar_url
       FROM project_posts p
       JOIN student_profiles sp ON p.author_id = sp.user_id
       WHERE p.id = $1 AND p.status != 'REMOVED_BY_ADMIN'`,
      [postId]
    );
    return res.rows[0] || null;
  }

  async getRequiredSkills(postId: string): Promise<ProjectRequiredSkill[]> {
    const res = await pool.query<ProjectRequiredSkill>(
      `SELECT pps.skill_id, s.name
       FROM project_post_skills pps
       JOIN skills s ON pps.skill_id = s.id
       WHERE pps.post_id = $1
       ORDER BY s.name ASC;`,
      [postId]
    );
    return res.rows;
  }

  async hasUserApplied(postId: string, userId: string): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM project_applications
         WHERE post_id = $1 AND applicant_id = $2
       ) AS exists;`,
      [postId, userId]
    );
    return res.rows[0].exists;
  }

  /**
   * BR-002: Create Project Post within a Transaction using User Row Locking
   */
  async createProject(authorId: string, dto: CreateProjectDto): Promise<{ id: string; status: string; created_at: Date }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock user row to serialize concurrent post creation
      await client.query(`SELECT id FROM users WHERE id = $1 FOR UPDATE;`, [authorId]);

      // 2. Check active post count for author
      const countRes = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM project_posts WHERE author_id = $1 AND status = 'OPEN';`,
        [authorId]
      );
      const activeCount = parseInt(countRes.rows[0].count, 10);

      if (activeCount >= 5) {
        throw new Error('QUOTA_EXCEEDED');
      }

      // 3. Insert project post
      const postRes = await client.query<{ id: string; status: string; created_at: Date }>(
        `INSERT INTO project_posts (
          author_id, title, description, category, total_slots, accepted_slots, deadline, status
         ) VALUES ($1, $2, $3, $4, $5, 0, $6, 'OPEN')
         RETURNING id, status, created_at;`,
        [authorId, dto.title, dto.description, dto.category, dto.total_slots, dto.deadline]
      );

      const createdPost = postRes.rows[0];

      // 4. Batch insert required skills
      for (const skillId of dto.skill_ids) {
        await client.query(
          `INSERT INTO project_post_skills (post_id, skill_id) VALUES ($1, $2);`,
          [createdPost.id, skillId]
        );
      }

      await client.query('COMMIT');
      return createdPost;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async closeProject(postId: string, authorId: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE project_posts
       SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND author_id = $2
       RETURNING id;`,
      [postId, authorId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Submit Project Application and Dispatch In-App Notification
   */
  async createApplication(
    postId: string,
    applicantId: string,
    introNote?: string,
    postAuthorId?: string,
    postTitle?: string
  ): Promise<{ id: string; status: string; created_at: Date }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const appRes = await client.query<{ id: string; status: string; created_at: Date }>(
        `INSERT INTO project_applications (post_id, applicant_id, intro_note, status)
         VALUES ($1, $2, $3, 'PENDING')
         RETURNING id, status, created_at;`,
        [postId, applicantId, introNote || null]
      );

      const createdApp = appRes.rows[0];

      // Dispatch notification to post author if author is known
      if (postAuthorId) {
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'PROJECT_APPLICATION', 'Đơn ứng tuyển mới', $2, $3);`,
          [
            postAuthorId,
            `Có ứng viên mới nộp đơn ứng tuyển vào dự án "${postTitle || 'Dự án của bạn'}"`,
            `/projects/${postId}/applications`,
          ]
        );
      }

      await client.query('COMMIT');
      return createdApp;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listApplicationsForPost(postId: string) {
    const res = await pool.query<{
      id: string;
      status: ApplicationStatus;
      intro_note: string | null;
      applied_at: Date;
      user_id: string;
      full_name: string;
      major: string | null;
      avatar_url: string | null;
    }>(
      `SELECT
        a.id, a.status, a.intro_note, a.created_at AS applied_at,
        sp.user_id, sp.full_name, sp.major, sp.avatar_url
       FROM project_applications a
       JOIN student_profiles sp ON a.applicant_id = sp.user_id
       WHERE a.post_id = $1
       ORDER BY a.created_at DESC;`,
      [postId]
    );

    return res.rows;
  }

  async findApplicationWithPostDetails(applicationId: string) {
    const res = await pool.query<{
      id: string;
      post_id: string;
      applicant_id: string;
      intro_note: string | null;
      status: ApplicationStatus;
      post_author_id: string;
      post_title: string;
      total_slots: number;
      accepted_slots: number;
      post_status: ProjectStatus;
    }>(
      `SELECT
        a.id, a.post_id, a.applicant_id, a.intro_note, a.status,
        p.author_id AS post_author_id, p.title AS post_title,
        p.total_slots, p.accepted_slots, p.status AS post_status
       FROM project_applications a
       JOIN project_posts p ON a.post_id = p.id
       WHERE a.id = $1;`,
      [applicationId]
    );
    return res.rows[0] || null;
  }

  /**
   * BR-006: Resolve Application (Accept / Decline) + Trusted Write Path Conversation Unlock
   */
  async resolveApplication(
    applicationId: string,
    action: 'ACCEPT' | 'DECLINE',
    appDetails: {
      post_id: string;
      applicant_id: string;
      post_author_id: string;
      post_title: string;
    }
  ): Promise<{ status: string; conversation_id?: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (action === 'ACCEPT') {
        // 1. Lock project post row
        const postLockRes = await client.query<{
          total_slots: number;
          accepted_slots: number;
          status: ProjectStatus;
        }>(
          `SELECT total_slots, accepted_slots, status FROM project_posts WHERE id = $1 FOR UPDATE;`,
          [appDetails.post_id]
        );

        const currentPost = postLockRes.rows[0];
        if (!currentPost || currentPost.status !== 'OPEN' || currentPost.accepted_slots >= currentPost.total_slots) {
          throw new Error('POST_ALREADY_FULL');
        }

        // 2. Update application status to ACCEPTED
        await client.query(
          `UPDATE project_applications
           SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1;`,
          [applicationId]
        );

        // 3. Atomically increment accepted_slots and conditionally mark post FULL
        const newAcceptedSlots = currentPost.accepted_slots + 1;
        const newStatus: ProjectStatus = newAcceptedSlots >= currentPost.total_slots ? 'FULL' : 'OPEN';

        await client.query(
          `UPDATE project_posts
           SET accepted_slots = $1, status = $2, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3;`,
          [newAcceptedSlots, newStatus, appDetails.post_id]
        );

        // 4. BR-006 Trusted Write Path: Create/Reuse 1-to-1 conversation
        const u1 = appDetails.post_author_id < appDetails.applicant_id ? appDetails.post_author_id : appDetails.applicant_id;
        const u2 = appDetails.post_author_id < appDetails.applicant_id ? appDetails.applicant_id : appDetails.post_author_id;

        const convRes = await client.query<{ id: string }>(
          `INSERT INTO conversations (user_one_id, user_two_id, match_type, match_source_id)
           VALUES ($1, $2, 'PROJECT_MATCH', $3)
           ON CONFLICT (user_one_id, user_two_id) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
           RETURNING id;`,
          [u1, u2, appDetails.post_id]
        );

        const conversationId = convRes.rows[0].id;

        // 5. Create notification for applicant
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'APPLICATION_ACCEPTED', 'Đơn ứng tuyển được chấp nhận', $2, $3);`,
          [
            appDetails.applicant_id,
            `Đơn ứng tuyển vào dự án "${appDetails.post_title}" đã được chấp nhận. Bạn có thể bắt đầu nhắn tin trao đổi.`,
            `/chat?conversation_id=${conversationId}`,
          ]
        );

        await client.query('COMMIT');
        return { status: 'ACCEPTED', conversation_id: conversationId };
      } else {
        // DECLINE action
        await client.query(
          `UPDATE project_applications
           SET status = 'DECLINED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1;`,
          [applicationId]
        );

        // Create notification for applicant
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'APPLICATION_DECLINED', 'Đơn ứng tuyển bị từ chối', $2, $3);`,
          [
            appDetails.applicant_id,
            `Đơn ứng tuyển vào dự án "${appDetails.post_title}" đã bị từ chối.`,
            `/projects/${appDetails.post_id}`,
          ]
        );

        await client.query('COMMIT');
        return { status: 'DECLINED' };
      }
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listMyApplications(
    userId: string,
    query: ListMyApplicationsQueryDto
  ): Promise<{
    rows: Array<{
      id: string;
      status: ApplicationStatus;
      intro_note: string | null;
      applied_at: Date;
      resolved_at: Date | null;
      project_id: string;
      project_title: string;
      project_category: ProjectCategory;
      project_author_name: string;
    }>;
    total: number;
  }> {
    const conditions: string[] = ['a.applicant_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (query.status) {
      conditions.push(`a.status = $${paramIndex++}`);
      params.push(query.status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Total count
    const countSql = `SELECT COUNT(*)::text AS count FROM project_applications a ${whereClause};`;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        a.id, a.status, a.intro_note, a.created_at AS applied_at,
        CASE WHEN a.status IN ('ACCEPTED', 'DECLINED') THEN a.updated_at ELSE NULL END AS resolved_at,
        p.id AS project_id, p.title AS project_title, p.category AS project_category,
        sp.full_name AS project_author_name
      FROM project_applications a
      JOIN project_posts p ON a.post_id = p.id
      JOIN student_profiles sp ON p.author_id = sp.user_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<{
      id: string;
      status: ApplicationStatus;
      intro_note: string | null;
      applied_at: Date;
      resolved_at: Date | null;
      project_id: string;
      project_title: string;
      project_category: ProjectCategory;
      project_author_name: string;
    }>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }
}

export const projectRepository = new ProjectRepository();
