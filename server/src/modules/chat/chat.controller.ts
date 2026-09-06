import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { chatService } from './chat.service';
import {
  validateUuidParam,
  validateSendMessage,
  validateListMessagesQuery,
} from './chat.validation';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class ChatController {
  /**
   * API-CHAT-01: List Active Conversations
   * GET /api/v1/conversations
   */
  async listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const data = await chatService.listConversations(req.user.userId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-CHAT-02: Get Conversation Message History
   * GET /api/v1/conversations/:id/messages
   */
  async getConversationMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const conversationId = validateUuidParam(req.params.id, 'id');
      const queryDto = validateListMessagesQuery(req.query);
      const result = await chatService.getConversationMessages(
        conversationId,
        req.user.userId,
        queryDto
      );
      return sendSuccess(res, result.data, undefined, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  /**
   * API-CHAT-03: Send Text Message
   * POST /api/v1/conversations/:id/messages
   */
  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const conversationId = validateUuidParam(req.params.id, 'id');
      const dto = validateSendMessage(req.body);
      const data = await chatService.sendMessage(conversationId, req.user.userId, dto);
      return sendSuccess(res, data, 'Gửi tin nhắn thành công', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
