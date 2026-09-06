import { pool } from '../../config/database';
import {
  CreateStudyRequestDto,
  ListStudyRequestsQueryDto,
  ListMyStudyConnectionsQueryDto,
  StudyMode,
  StudyRequestStatus,
  StudyConnectionStatus,
} from './study.validation';

export interface StudyRequestRow {
  id: string;
  author_id: string;
  course_id: string;
  topic: string;
  study_mode: StudyMode;
  availability: string;
  description: string | null;
  status: StudyRequestStatus;
  created_at: Date;
  updated_at: Date;
  // Course info
  course_code?: string;
  course_name?: string;
  // Author info
  author_full_name?: string;
  author_avatar_url?: string | null;
  author_campus?: string | null;
  author_major?: string | null;
}

export interface StudyConnectionRow {
  id: string;
  request_id: string;
  requester_id: string;
  note: string | null;
  status: StudyConnectionStatus;
  created_at: Date;
  updated_at: Date;
}

export class StudyRepository {
  async listStudyRequests(
    query: ListStudyRequestsQueryDto,
    currentUserId?: string
  ): Promise<{ rows: StudyRequestRow[]; total: number }> {
    const conditions: string[] = ["sr.status != 'REMOVED_BY_ADMIN'"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.is_mine && currentUserId) {
      conditions.push(`sr.author_id = $${paramIndex++}`);
      params.push(currentUserId);
    }

    if (query.status) {
      conditions.push(`sr.status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (query.course_id) {
      conditions.push(`sr.course_id = $${paramIndex++}`);
      params.push(query.course_id);
    }

    if (query.study_mode) {
      conditions.push(`sr.study_mode = $${paramIndex++}`);
      params.push(query.study_mode);
    }

    if (query.search) {
      conditions.push(`(sr.topic ILIKE $${paramIndex} OR sr.description ILIKE $${paramIndex} OR c.course_code ILIKE $${paramIndex} OR c.course_name ILIKE $${paramIndex})`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total count
    const countSql = `
      SELECT COUNT(*)::text AS count
      FROM study_requests sr
      JOIN courses c ON sr.course_id = c.id
      ${whereClause};
    `;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        sr.id, sr.author_id, sr.course_id, sr.topic, sr.study_mode,
        sr.availability, sr.description, sr.status, sr.created_at, sr.updated_at,
        c.course_code, c.course_name,
        sp.full_name AS author_full_name,
        sp.avatar_url AS author_avatar_url,
        sp.campus AS author_campus,
        sp.major AS author_major
      FROM study_requests sr
      JOIN courses c ON sr.course_id = c.id
      JOIN student_profiles sp ON sr.author_id = sp.user_id
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<StudyRequestRow>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }

  async findById(requestId: string): Promise<StudyRequestRow | null> {
    const res = await pool.query<StudyRequestRow>(
      `SELECT
        sr.id, sr.author_id, sr.course_id, sr.topic, sr.study_mode,
        sr.availability, sr.description, sr.status, sr.created_at, sr.updated_at,
        c.course_code, c.course_name,
        sp.full_name AS author_full_name,
        sp.avatar_url AS author_avatar_url,
        sp.campus AS author_campus,
        sp.major AS author_major
       FROM study_requests sr
       JOIN courses c ON sr.course_id = c.id
       JOIN student_profiles sp ON sr.author_id = sp.user_id
       WHERE sr.id = $1 AND sr.status != 'REMOVED_BY_ADMIN'`,
      [requestId]
    );
    return res.rows[0] || null;
  }

  async hasUserConnected(requestId: string, userId: string): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM study_connections
         WHERE request_id = $1 AND requester_id = $2
       ) AS exists;`,
      [requestId, userId]
    );
    return res.rows[0].exists;
  }

  /**
   * BR-002: Create Study Buddy Request with User-Row Locking Transaction
   */
  async createStudyRequest(
    authorId: string,
    dto: CreateStudyRequestDto
  ): Promise<{ id: string; status: string; created_at: Date }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock user row to prevent race conditions on BR-002
      await client.query(`SELECT id FROM users WHERE id = $1 FOR UPDATE;`, [authorId]);

      // 2. Count active study requests
      const countRes = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM study_requests WHERE author_id = $1 AND status = 'OPEN';`,
        [authorId]
      );
      const activeCount = parseInt(countRes.rows[0].count, 10);

      if (activeCount >= 5) {
        throw new Error('QUOTA_EXCEEDED');
      }

      // 3. Insert study request
      const reqRes = await client.query<{ id: string; status: string; created_at: Date }>(
        `INSERT INTO study_requests (
          author_id, course_id, topic, study_mode, availability, description, status
         ) VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
         RETURNING id, status, created_at;`,
        [authorId, dto.course_id, dto.topic, dto.study_mode, dto.availability, dto.description || null]
      );

      await client.query('COMMIT');
      return reqRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async closeStudyRequest(requestId: string, authorId: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE study_requests
       SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND author_id = $2
       RETURNING id;`,
      [requestId, authorId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Submit Study Connection Request + Dispatch Notification
   */
  async createConnection(
    requestId: string,
    requesterId: string,
    note?: string,
    requestAuthorId?: string,
    requestTopic?: string
  ): Promise<{ id: string; status: string; created_at: Date }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const connRes = await client.query<{ id: string; status: string; created_at: Date }>(
        `INSERT INTO study_connections (request_id, requester_id, note, status)
         VALUES ($1, $2, $3, 'PENDING')
         RETURNING id, status, created_at;`,
        [requestId, requesterId, note || null]
      );

      const createdConn = connRes.rows[0];

      if (requestAuthorId) {
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'STUDY_CONNECTION', 'Yêu cầu kết nối học tập mới', $2, $3);`,
          [
            requestAuthorId,
            `Có sinh viên muốn kết nối cùng học tập với bạn trong chủ đề "${requestTopic || 'Yêu cầu của bạn'}"`,
            `/study-buddy/${requestId}`,
          ]
        );
      }

      await client.query('COMMIT');
      return createdConn;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listConnectionsForRequest(requestId: string) {
    const res = await pool.query<{
      id: string;
      status: StudyConnectionStatus;
      note: string | null;
      requested_at: Date;
      user_id: string;
      full_name: string;
      avatar_url: string | null;
      campus: string | null;
      major: string | null;
      year_of_study: number | null;
    }>(
      `SELECT
        sc.id, sc.status, sc.note, sc.created_at AS requested_at,
        sp.user_id, sp.full_name, sp.avatar_url, sp.campus, sp.major, sp.year_of_study
       FROM study_connections sc
       JOIN student_profiles sp ON sc.requester_id = sp.user_id
       WHERE sc.request_id = $1
       ORDER BY sc.created_at DESC;`,
      [requestId]
    );
    return res.rows;
  }

  async findConnectionWithRequestDetails(connectionId: string) {
    const res = await pool.query<{
      id: string;
      request_id: string;
      requester_id: string;
      note: string | null;
      status: StudyConnectionStatus;
      request_author_id: string;
      request_topic: string;
      request_status: StudyRequestStatus;
      course_code: string;
    }>(
      `SELECT
        sc.id, sc.request_id, sc.requester_id, sc.note, sc.status,
        sr.author_id AS request_author_id, sr.topic AS request_topic, sr.status AS request_status,
        c.course_code
       FROM study_connections sc
       JOIN study_requests sr ON sc.request_id = sr.id
       JOIN courses c ON sr.course_id = c.id
       WHERE sc.id = $1;`,
      [connectionId]
    );
    return res.rows[0] || null;
  }

  /**
   * BR-006: Resolve Study Connection (ACCEPT / DECLINE) + Trusted Write Path Conversation Unlock
   */
  async resolveConnection(
    connectionId: string,
    action: 'ACCEPT' | 'DECLINE',
    connDetails: {
      request_id: string;
      requester_id: string;
      request_author_id: string;
      request_topic: string;
    }
  ): Promise<{ status: string; conversation_id?: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (action === 'ACCEPT') {
        // 1. Update connection status
        await client.query(
          `UPDATE study_connections
           SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1;`,
          [connectionId]
        );

        // 2. BR-006 Trusted Write Path: Create/Reuse 1-to-1 conversation
        const u1 = connDetails.request_author_id < connDetails.requester_id ? connDetails.request_author_id : connDetails.requester_id;
        const u2 = connDetails.request_author_id < connDetails.requester_id ? connDetails.requester_id : connDetails.request_author_id;

        const convRes = await client.query<{ id: string }>(
          `INSERT INTO conversations (user_one_id, user_two_id, match_type, match_source_id)
           VALUES ($1, $2, 'STUDY_BUDDY', $3)
           ON CONFLICT (user_one_id, user_two_id) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
           RETURNING id;`,
          [u1, u2, connDetails.request_id]
        );

        const conversationId = convRes.rows[0].id;

        // 3. Notification for requester
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'CONNECTION_ACCEPTED', 'Yêu cầu kết nối học tập được chấp nhận', $2, $3);`,
          [
            connDetails.requester_id,
            `Yêu cầu kết nối cho chủ đề "${connDetails.request_topic}" đã được chấp nhận. Bạn có thể bắt đầu nhắn tin trao đổi.`,
            `/chat?conversation_id=${conversationId}`,
          ]
        );

        await client.query('COMMIT');
        return { status: 'ACCEPTED', conversation_id: conversationId };
      } else {
        // DECLINE
        await client.query(
          `UPDATE study_connections
           SET status = 'DECLINED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1;`,
          [connectionId]
        );

        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'CONNECTION_DECLINED', 'Yêu cầu kết nối học tập bị từ chối', $2, $3);`,
          [
            connDetails.requester_id,
            `Yêu cầu kết nối cho chủ đề "${connDetails.request_topic}" đã bị từ chối.`,
            `/study-buddy/${connDetails.request_id}`,
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

  async listMyConnections(
    userId: string,
    query: ListMyStudyConnectionsQueryDto
  ): Promise<{
    rows: Array<{
      id: string;
      status: StudyConnectionStatus;
      note: string | null;
      requested_at: Date;
      request_id: string;
      request_topic: string;
      course_code: string;
      author_name: string;
    }>;
    total: number;
  }> {
    const conditions: string[] = ['sc.requester_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (query.status) {
      conditions.push(`sc.status = $${paramIndex++}`);
      params.push(query.status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Total count
    const countSql = `SELECT COUNT(*)::text AS count FROM study_connections sc ${whereClause};`;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        sc.id, sc.status, sc.note, sc.created_at AS requested_at,
        sr.id AS request_id, sr.topic AS request_topic,
        c.course_code,
        sp.full_name AS author_name
      FROM study_connections sc
      JOIN study_requests sr ON sc.request_id = sr.id
      JOIN courses c ON sr.course_id = c.id
      JOIN student_profiles sp ON sr.author_id = sp.user_id
      ${whereClause}
      ORDER BY sc.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<{
      id: string;
      status: StudyConnectionStatus;
      note: string | null;
      requested_at: Date;
      request_id: string;
      request_topic: string;
      course_code: string;
      author_name: string;
    }>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }
}

export const studyRepository = new StudyRepository();
