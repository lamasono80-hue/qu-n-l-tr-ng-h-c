import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// 1. API-CHAT-01: List Active Conversations
router.get('/', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  chatController.listConversations(req, res, next)
);

// 2. API-CHAT-02: Get Conversation Message History
router.get('/:id/messages', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  chatController.getConversationMessages(req, res, next)
);

// 3. API-CHAT-03: Send Text Message
router.post('/:id/messages', authenticate, requireRole(['STUDENT']), (req, res, next) =>
  chatController.sendMessage(req, res, next)
);

export const chatRoutes = router;
