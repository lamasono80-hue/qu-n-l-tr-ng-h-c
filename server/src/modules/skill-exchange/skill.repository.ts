import { pool } from '../../config/database';
import {
  CreateSkillListingDto,
  ListSkillListingsQueryDto,
  ListMySkillResponsesQueryDto,
  SkillListingType,
  SkillProficiencyLevel,
  SkillListingStatus,
  SkillResponseStatus,
} from './skill.validation';

export interface SkillListingRow {
  id: string;
  author_id: string;
  type: SkillListingType;
  skill_name: string;
  proficiency_level: SkillProficiencyLevel;
  format: string | null;
  availability: string | null;
  description: string;
  status: SkillListingStatus;
  created_at: Date;
  updated_at: Date;
  // Author info
  author_full_name?: string;
  author_avatar_url?: string | null;
  author_campus?: string | null;
  author_major?: string | null;
}

export interface SkillResponseRow {
  id: string;
  listing_id: string;
  responder_id: string;
  proposal_note: string | null;
  status: SkillResponseStatus;
  created_at: Date;
  updated_at: Date;
}

export class SkillRepository {
  async listSkillListings(
    query: ListSkillListingsQueryDto,
    currentUserId?: string
  ): Promise<{ rows: SkillListingRow[]; total: number }> {
    const conditions: string[] = ["sl.status != 'REMOVED_BY_ADMIN'"];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.is_mine && currentUserId) {
      conditions.push(`sl.author_id = $${paramIndex++}`);
      params.push(currentUserId);
    }

    if (query.status) {
      conditions.push(`sl.status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (query.type) {
      conditions.push(`sl.type = $${paramIndex++}`);
      params.push(query.type);
    }

    if (query.proficiency_level) {
      conditions.push(`sl.proficiency_level = $${paramIndex++}`);
      params.push(query.proficiency_level);
    }

    if (query.search) {
      conditions.push(`(sl.skill_name ILIKE $${paramIndex} OR sl.description ILIKE $${paramIndex})`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total count
    const countSql = `
      SELECT COUNT(*)::text AS count
      FROM skill_listings sl
      ${whereClause};
    `;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        sl.id, sl.author_id, sl.type, sl.skill_name, sl.proficiency_level,
        sl.format, sl.availability, sl.description, sl.status, sl.created_at, sl.updated_at,
        sp.full_name AS author_full_name,
        sp.avatar_url AS author_avatar_url,
        sp.campus AS author_campus,
        sp.major AS author_major
      FROM skill_listings sl
      JOIN student_profiles sp ON sl.author_id = sp.user_id
      ${whereClause}
      ORDER BY sl.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<SkillListingRow>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }

  async findById(listingId: string): Promise<SkillListingRow | null> {
    const res = await pool.query<SkillListingRow>(
      `SELECT
        sl.id, sl.author_id, sl.type, sl.skill_name, sl.proficiency_level,
        sl.format, sl.availability, sl.description, sl.status, sl.created_at, sl.updated_at,
        sp.full_name AS author_full_name,
        sp.avatar_url AS author_avatar_url,
        sp.campus AS author_campus,
        sp.major AS author_major
       FROM skill_listings sl
       JOIN student_profiles sp ON sl.author_id = sp.user_id
       WHERE sl.id = $1 AND sl.status != 'REMOVED_BY_ADMIN'`,
      [listingId]
    );
    return res.rows[0] || null;
  }

  async hasUserResponded(listingId: string, userId: string): Promise<boolean> {
    const res = await pool.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM skill_responses
         WHERE listing_id = $1 AND responder_id = $2
       ) AS exists;`,
      [listingId, userId]
    );
    return res.rows[0].exists;
  }

  /**
   * BR-002: Create Skill Listing with User-Row Locking Transaction
   */
  async createSkillListing(
    authorId: string,
    dto: CreateSkillListingDto
  ): Promise<{ id: string; status: string; created_at: Date }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Lock user row to prevent race conditions on BR-002
      await client.query(`SELECT id FROM users WHERE id = $1 FOR UPDATE;`, [authorId]);

      // 2. Count active skill listings
      const countRes = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM skill_listings WHERE author_id = $1 AND status = 'OPEN';`,
        [authorId]
      );
      const activeCount = parseInt(countRes.rows[0].count, 10);

      if (activeCount >= 5) {
        throw new Error('QUOTA_EXCEEDED');
      }

      // 3. Insert skill listing
      const listingRes = await client.query<{ id: string; status: string; created_at: Date }>(
        `INSERT INTO skill_listings (
          author_id, type, skill_name, proficiency_level, format, availability, description, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN')
         RETURNING id, status, created_at;`,
        [
          authorId,
          dto.type,
          dto.skill_name,
          dto.proficiency_level,
          dto.format || null,
          dto.availability || null,
          dto.description,
        ]
      );

      await client.query('COMMIT');
      return listingRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async closeSkillListing(listingId: string, authorId: string): Promise<boolean> {
    const res = await pool.query(
      `UPDATE skill_listings
       SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND author_id = $2
       RETURNING id;`,
      [listingId, authorId]
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Submit Skill Exchange Proposal + Dispatch Notification
   */
  async createResponse(
    listingId: string,
    responderId: string,
    proposalNote?: string,
    listingAuthorId?: string,
    listingSkillName?: string
  ): Promise<{ id: string; status: string; created_at: Date }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const respRes = await client.query<{ id: string; status: string; created_at: Date }>(
        `INSERT INTO skill_responses (listing_id, responder_id, proposal_note, status)
         VALUES ($1, $2, $3, 'PENDING')
         RETURNING id, status, created_at;`,
        [listingId, responderId, proposalNote || null]
      );

      const createdResp = respRes.rows[0];

      if (listingAuthorId) {
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'SKILL_PROPOSAL', 'Đề xuất trao đổi kỹ năng mới', $2, $3);`,
          [
            listingAuthorId,
            `Có sinh viên gửi đề xuất trao đổi kỹ năng "${listingSkillName || 'Bài đăng của bạn'}"`,
            `/skill-exchange/${listingId}`,
          ]
        );
      }

      await client.query('COMMIT');
      return createdResp;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findResponseWithListingDetails(responseId: string) {
    const res = await pool.query<{
      id: string;
      listing_id: string;
      responder_id: string;
      proposal_note: string | null;
      status: SkillResponseStatus;
      listing_author_id: string;
      listing_skill_name: string;
      listing_status: SkillListingStatus;
    }>(
      `SELECT
        sr.id, sr.listing_id, sr.responder_id, sr.proposal_note, sr.status,
        sl.author_id AS listing_author_id, sl.skill_name AS listing_skill_name, sl.status AS listing_status
       FROM skill_responses sr
       JOIN skill_listings sl ON sr.listing_id = sl.id
       WHERE sr.id = $1;`,
      [responseId]
    );
    return res.rows[0] || null;
  }

  /**
   * BR-006: Resolve Skill Response (ACCEPT / DECLINE) + Trusted Write Path Conversation Unlock
   * Enforces Canonical participant order: u1 = min(author_id, responder_id), u2 = max(author_id, responder_id)
   */
  async resolveResponse(
    responseId: string,
    action: 'ACCEPT' | 'DECLINE',
    respDetails: {
      listing_id: string;
      responder_id: string;
      listing_author_id: string;
      listing_skill_name: string;
    }
  ): Promise<{ status: string; conversation_id?: string }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (action === 'ACCEPT') {
        // 1. Update response status
        await client.query(
          `UPDATE skill_responses
           SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1;`,
          [responseId]
        );

        // 2. BR-006 Trusted Write Path: Create/Reuse 1-to-1 conversation with canonical ordering
        const u1 =
          respDetails.listing_author_id < respDetails.responder_id
            ? respDetails.listing_author_id
            : respDetails.responder_id;
        const u2 =
          respDetails.listing_author_id < respDetails.responder_id
            ? respDetails.responder_id
            : respDetails.listing_author_id;

        const convRes = await client.query<{ id: string }>(
          `INSERT INTO conversations (user_one_id, user_two_id, match_type, match_source_id)
           VALUES ($1, $2, 'SKILL_EXCHANGE', $3)
           ON CONFLICT (user_one_id, user_two_id) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
           RETURNING id;`,
          [u1, u2, respDetails.listing_id]
        );

        const conversationId = convRes.rows[0].id;

        // 3. Notification for responder
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'PROPOSAL_ACCEPTED', 'Đề xuất trao đổi kỹ năng được chấp nhận', $2, $3);`,
          [
            respDetails.responder_id,
            `Đề xuất trao đổi cho kỹ năng "${respDetails.listing_skill_name}" đã được chấp nhận. Bạn có thể bắt đầu nhắn tin trao đổi.`,
            `/chat?conversation_id=${conversationId}`,
          ]
        );

        await client.query('COMMIT');
        return { status: 'ACCEPTED', conversation_id: conversationId };
      } else {
        // DECLINE
        await client.query(
          `UPDATE skill_responses
           SET status = 'DECLINED', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1;`,
          [responseId]
        );

        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'PROPOSAL_DECLINED', 'Đề xuất trao đổi kỹ năng bị từ chối', $2, $3);`,
          [
            respDetails.responder_id,
            `Đề xuất trao đổi cho kỹ năng "${respDetails.listing_skill_name}" đã bị từ chối.`,
            `/skill-exchange/${respDetails.listing_id}`,
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

  async listMyResponses(
    userId: string,
    query: ListMySkillResponsesQueryDto
  ): Promise<{
    rows: Array<{
      id: string;
      status: SkillResponseStatus;
      proposal_note: string | null;
      responded_at: Date;
      listing_id: string;
      listing_type: SkillListingType;
      listing_skill_name: string;
      author_name: string;
    }>;
    total: number;
  }> {
    const conditions: string[] = ['sr.responder_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (query.status) {
      conditions.push(`sr.status = $${paramIndex++}`);
      params.push(query.status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // 1. Total count
    const countSql = `SELECT COUNT(*)::text AS count FROM skill_responses sr ${whereClause};`;
    const countRes = await pool.query<{ count: string }>(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Data rows
    const offset = (query.page - 1) * query.limit;
    const dataSql = `
      SELECT
        sr.id, sr.status, sr.proposal_note, sr.created_at AS responded_at,
        sl.id AS listing_id, sl.type AS listing_type, sl.skill_name AS listing_skill_name,
        sp.full_name AS author_name
      FROM skill_responses sr
      JOIN skill_listings sl ON sr.listing_id = sl.id
      JOIN student_profiles sp ON sl.author_id = sp.user_id
      ${whereClause}
      ORDER BY sr.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const dataParams = [...params, query.limit, offset];
    const dataRes = await pool.query<{
      id: string;
      status: SkillResponseStatus;
      proposal_note: string | null;
      responded_at: Date;
      listing_id: string;
      listing_type: SkillListingType;
      listing_skill_name: string;
      author_name: string;
    }>(dataSql, dataParams);

    return { rows: dataRes.rows, total };
  }
}

export const skillRepository = new SkillRepository();
