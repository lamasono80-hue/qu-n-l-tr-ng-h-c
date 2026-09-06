import { pool } from '../../config/database';
import { SkillProficiency, SkillCategory, UpdateProfileDto } from './profile.validation';

export interface StudentProfileRow {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  campus: string | null;
  major: string | null;
  year_of_study: number | null;
  bio: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined from users
  email?: string;
  role?: string;
  user_status?: string;
}

export interface ProfileSkillItem {
  skill_id: string;
  name: string;
  proficiency_level: SkillProficiency;
}

export interface ProfileCourseItem {
  course_id: string;
  course_code: string;
  course_name: string;
}

export interface MasterSkillRow {
  id: string;
  name: string;
  category: SkillCategory;
  is_system_standard: boolean;
  created_at: Date;
}

export interface MasterCourseRow {
  id: string;
  course_code: string;
  course_name: string;
  created_at: Date;
}

export class ProfileRepository {
  async findByUserId(userId: string): Promise<StudentProfileRow | null> {
    const res = await pool.query<StudentProfileRow>(
      `SELECT p.*, u.email, u.role, u.status AS user_status
       FROM student_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  async findById(profileId: string): Promise<StudentProfileRow | null> {
    const res = await pool.query<StudentProfileRow>(
      `SELECT p.*, u.email, u.role, u.status AS user_status
       FROM student_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [profileId]
    );
    return res.rows[0] || null;
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<StudentProfileRow | null> {
    const setClauses: string[] = [];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (data.full_name !== undefined) {
      setClauses.push(`full_name = $${paramIndex++}`);
      params.push(data.full_name);
    }
    if (data.avatar_url !== undefined) {
      setClauses.push(`avatar_url = $${paramIndex++}`);
      params.push(data.avatar_url);
    }
    if (data.campus !== undefined) {
      setClauses.push(`campus = $${paramIndex++}`);
      params.push(data.campus);
    }
    if (data.major !== undefined) {
      setClauses.push(`major = $${paramIndex++}`);
      params.push(data.major);
    }
    if (data.year_of_study !== undefined) {
      setClauses.push(`year_of_study = $${paramIndex++}`);
      params.push(data.year_of_study);
    }
    if (data.bio !== undefined) {
      setClauses.push(`bio = $${paramIndex++}`);
      params.push(data.bio);
    }
    if (data.github_url !== undefined) {
      setClauses.push(`github_url = $${paramIndex++}`);
      params.push(data.github_url);
    }
    if (data.linkedin_url !== undefined) {
      setClauses.push(`linkedin_url = $${paramIndex++}`);
      params.push(data.linkedin_url);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    const queryText = `
      UPDATE student_profiles
      SET ${setClauses.join(', ')}
      WHERE user_id = $1
      RETURNING *;
    `;

    const res = await pool.query<StudentProfileRow>(queryText, params);
    return res.rows[0] || null;
  }

  async getSkillsByProfileId(profileId: string): Promise<ProfileSkillItem[]> {
    const res = await pool.query<ProfileSkillItem>(
      `SELECT ps.skill_id, s.name, ps.proficiency_level
       FROM profile_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.profile_id = $1
       ORDER BY s.name ASC;`,
      [profileId]
    );
    return res.rows;
  }

  async getCoursesByProfileId(profileId: string): Promise<ProfileCourseItem[]> {
    const res = await pool.query<ProfileCourseItem>(
      `SELECT pc.course_id, c.course_code, c.course_name
       FROM profile_courses pc
       JOIN courses c ON pc.course_id = c.id
       WHERE pc.profile_id = $1
       ORDER BY c.course_code ASC;`,
      [profileId]
    );
    return res.rows;
  }

  async validateSkillIdsExist(skillIds: string[]): Promise<boolean> {
    if (skillIds.length === 0) return true;
    const res = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM skills WHERE id = ANY($1::uuid[])`,
      [skillIds]
    );
    return parseInt(res.rows[0].count, 10) === skillIds.length;
  }

  async validateCourseIdsExist(courseIds: string[]): Promise<boolean> {
    if (courseIds.length === 0) return true;
    const res = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM courses WHERE id = ANY($1::uuid[])`,
      [courseIds]
    );
    return parseInt(res.rows[0].count, 10) === courseIds.length;
  }

  async replaceSkills(
    profileId: string,
    skills: Array<{ skill_id: string; proficiency_level: SkillProficiency }>
  ): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM profile_skills WHERE profile_id = $1`, [profileId]);

      for (const item of skills) {
        await client.query(
          `INSERT INTO profile_skills (profile_id, skill_id, proficiency_level)
           VALUES ($1, $2, $3);`,
          [profileId, item.skill_id, item.proficiency_level]
        );
      }

      await client.query('COMMIT');
      return skills.length;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async replaceCourses(profileId: string, courseIds: string[]): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM profile_courses WHERE profile_id = $1`, [profileId]);

      for (const courseId of courseIds) {
        await client.query(
          `INSERT INTO profile_courses (profile_id, course_id)
           VALUES ($1, $2);`,
          [profileId, courseId]
        );
      }

      await client.query('COMMIT');
      return courseIds.length;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async searchSkills(q?: string, category?: SkillCategory): Promise<MasterSkillRow[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (q) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${q}%`);
    }

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const queryText = `
      SELECT id, name, category, is_system_standard, created_at
      FROM skills
      ${whereClause}
      ORDER BY is_system_standard DESC, name ASC;
    `;

    const res = await pool.query<MasterSkillRow>(queryText, params);
    return res.rows;
  }

  async searchCourses(q?: string): Promise<MasterCourseRow[]> {
    const params: unknown[] = [];
    let whereClause = '';

    if (q) {
      whereClause = `WHERE course_code ILIKE $1 OR course_name ILIKE $1`;
      params.push(`%${q}%`);
    }

    const queryText = `
      SELECT id, course_code, course_name, created_at
      FROM courses
      ${whereClause}
      ORDER BY course_code ASC;
    `;

    const res = await pool.query<MasterCourseRow>(queryText, params);
    return res.rows;
  }
}

export const profileRepository = new ProfileRepository();
