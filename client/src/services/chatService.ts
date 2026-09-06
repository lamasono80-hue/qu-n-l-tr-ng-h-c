// chatService.ts
import { apiRequest } from './apiClient';
import { ConversationItem, ChatMessage } from '../types';

export const chatService = {
  // API-CHAT-01
  getConversations: () => apiRequest<ConversationItem[]>('/conversations'),

  // API-CHAT-02
  getMessages: (conversationId: string, page: number = 1, limit: number = 30) =>
    apiRequest<ChatMessage[]>(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),

  // API-CHAT-03
  sendMessage: (conversationId: string, content: string) =>
    apiRequest<ChatMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};
