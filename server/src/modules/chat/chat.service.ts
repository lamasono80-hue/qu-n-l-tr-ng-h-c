import { chatRepository, ConversationDetailRow, MessageRow } from './chat.repository';
import { SendMessageDto, ListMessagesQueryDto } from './chat.validation';
import { profileRepository } from '../profile/profile.repository';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

export class ChatService {
  /**
   * API-CHAT-01: List Active Conversations
   */
  async listConversations(userId: string) {
    const rows = await chatRepository.listConversationsForUser(userId);

    const formatted = rows.map((r) => ({
      id: r.id,
      match_type: r.match_type,
      peer: {
        user_id: r.peer_user_id,
        full_name: r.peer_full_name || '',
        avatar_url: r.peer_avatar_url || null,
      },
      last_message: r.last_msg_id
        ? {
            content: r.last_msg_content || '',
            sent_at: r.last_msg_sent_at ? r.last_msg_sent_at.toISOString() : r.created_at.toISOString(),
            is_self: r.last_msg_sender_id === userId,
          }
        : null,
      created_at: r.created_at.toISOString(),
    }));

    return formatted;
  }

  /**
   * API-CHAT-02: Get Conversation Message History
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    query: ListMessagesQueryDto
  ) {
    // 1. Verify conversation existence
    const conv = await chatRepository.findConversationById(conversationId);
    if (!conv) {
      throw new NotFoundError('Không tìm thấy cuộc trò chuyện', 'CONVERSATION_NOT_FOUND');
    }

    // 2. Authorization check: participant membership
    if (conv.user_one_id !== userId && conv.user_two_id !== userId) {
      throw new ForbiddenError(
        'Bạn không có quyền truy cập cuộc trò chuyện này.',
        'NOT_CONVERSATION_PARTICIPANT'
      );
    }

    // 3. Retrieve messages
    const { rows, total } = await chatRepository.listMessages(conversationId, query);

    const formatted = rows.map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      content: m.content,
      sent_at: m.sent_at.toISOString(),
      is_self: m.sender_id === userId,
    }));

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      data: formatted,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: totalPages,
      },
    };
  }

  /**
   * API-CHAT-03: Send Text Message (FR-CHAT-003, FR-CHAT-007)
   */
  async sendMessage(conversationId: string, senderId: string, dto: SendMessageDto) {
    // 1. Verify conversation existence
    const conv = await chatRepository.findConversationById(conversationId);
    if (!conv) {
      throw new NotFoundError('Không tìm thấy cuộc trò chuyện', 'CONVERSATION_NOT_FOUND');
    }

    // 2. Authorization check: participant membership
    if (conv.user_one_id !== senderId && conv.user_two_id !== senderId) {
      throw new ForbiddenError(
        'Bạn không có quyền gửi tin nhắn vào cuộc trò chuyện này.',
        'NOT_CONVERSATION_PARTICIPANT'
      );
    }

    // 3. Determine peer ID
    const peerId = conv.user_one_id === senderId ? conv.user_two_id : conv.user_one_id;

    // 4. Fetch sender name for notification
    const senderProfile = await profileRepository.findByUserId(senderId);

    // 5. Create message
    const msg = await chatRepository.createMessage(
      conversationId,
      senderId,
      dto.content,
      peerId,
      senderProfile?.full_name
    );

    return {
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      content: msg.content,
      sent_at: msg.sent_at.toISOString(),
    };
  }
}

export const chatService = new ChatService();
