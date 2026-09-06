import { pool } from '../../config/database';
import { ListMessagesQueryDto } from './chat.validation';

export interface ConversationDetailRow {
  id: string;
  user_one_id: string;
  user_two_id: string;
  match_type: 'PROJECT_MATCH' | 'STUDY_BUDDY' | 'SKILL_EXCHANGE';
  match_source_id: string;
  created_at: Date;
  last_message_at: Date;
  peer_user_id: string;
  peer_full_name: string;
  peer_avatar_url: string | null;
  last_msg_id: string | null;
  last_msg_sender_id: string | null;
  last_msg_content: string | null;
  last_msg_sent_at: Date | null;
}

export interface ConversationRow {
  id: string;
  user_one_id: string;
  user_two_id: string;
  match_type: 'PROJECT_MATCH' | 'STUDY_BUDDY' | 'SKILL_EXCHANGE';
  match_source_id: string;
  created_at: Date;
  last_message_at: Date;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: Date;
}

export class ChatRepository {
  /**
   * API-CHAT-01: List active 1-to-1 conversations for authenticated user
   */
  async listConversationsForUser(userId: string): Promise<ConversationDetailRow[]> {
    const sql = `
      SELECT
        c.id, c.user_one_id, c.user_two_id, c.match_type, c.match_source_id,
        c.created_at, c.last_message_at,
        peer_p.user_id AS peer_user_id,
        peer_p.full_name AS peer_full_name,
        peer_p.avatar_url AS peer_avatar_url,
        lm.id AS last_msg_id,
        lm.sender_id AS last_msg_sender_id,
        lm.content AS last_msg_content,
        lm.sent_at AS last_msg_sent_at
      FROM conversations c
      JOIN student_profiles peer_p ON peer_p.user_id = (
        CASE WHEN c.user_one_id = $1 THEN c.user_two_id ELSE c.user_one_id END
      )
      LEFT JOIN LATERAL (
        SELECT id, sender_id, content, sent_at
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY sent_at DESC
        LIMIT 1
      ) lm ON true
      WHERE c.user_one_id = $1 OR c.user_two_id = $1
      ORDER BY c.last_message_at DESC;
    `;

    const res = await pool.query<ConversationDetailRow>(sql, [userId]);
    return res.rows;
  }

  async findConversationById(conversationId: string): Promise<ConversationRow | null> {
    const res = await pool.query<ConversationRow>(
      `SELECT id, user_one_id, user_two_id, match_type, match_source_id, created_at, last_message_at
       FROM conversations
       WHERE id = $1;`,
      [conversationId]
    );
    return res.rows[0] || null;
  }

  async countMessages(conversationId: string): Promise<number> {
    const res = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM messages WHERE conversation_id = $1;`,
      [conversationId]
    );
    return parseInt(res.rows[0].count, 10);
  }

  async listMessages(
    conversationId: string,
    query: ListMessagesQueryDto
  ): Promise<{ rows: MessageRow[]; total: number }> {
    const total = await this.countMessages(conversationId);
    const offset = (query.page - 1) * query.limit;

    const res = await pool.query<MessageRow>(
      `SELECT id, conversation_id, sender_id, content, sent_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY sent_at ASC
       LIMIT $2 OFFSET $3;`,
      [conversationId, query.limit, offset]
    );

    return { rows: res.rows, total };
  }

  /**
   * API-CHAT-03: Send text message and update last_message_at
   */
  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    peerId: string,
    senderName?: string
  ): Promise<MessageRow> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert message
      const msgRes = await client.query<MessageRow>(
        `INSERT INTO messages (conversation_id, sender_id, content, sent_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id, conversation_id, sender_id, content, sent_at;`,
        [conversationId, senderId, content]
      );

      const createdMsg = msgRes.rows[0];

      // 2. Update conversation last_message_at
      await client.query(
        `UPDATE conversations
         SET last_message_at = CURRENT_TIMESTAMP
         WHERE id = $1;`,
        [conversationId]
      );

      // 3. Dispatch in-app notification for peer
      if (peerId) {
        await client.query(
          `INSERT INTO notifications (recipient_id, type, title, content, target_url)
           VALUES ($1, 'NEW_MESSAGE', 'Tin nhắn mới', $2, $3);`,
          [
            peerId,
            `${senderName || 'Bạn cùng kết nối'} đã gửi một tin nhắn mới cho bạn.`,
            `/chat?conversation_id=${conversationId}`,
          ]
        );
      }

      await client.query('COMMIT');
      return createdMsg;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export const chatRepository = new ChatRepository();
