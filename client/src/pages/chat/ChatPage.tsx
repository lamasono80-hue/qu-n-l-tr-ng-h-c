import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, Search } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { ConversationItem, ChatMessage } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('conversation_id');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);

  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      setIsLoadingConvs(true);
      const res = await chatService.getConversations();
      if (res.data) {
        setConversations(res.data);
        if (!activeConvId && res.data.length > 0) {
          setSearchParams({ conversation_id: res.data[0].id });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      setIsLoadingMsgs(true);
      const res = await chatService.getMessages(convId, 1, 50);
      if (res.data) {
        setMessages(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !inputContent.trim() || isSending) return;

    const trimmed = inputContent.trim();
    setInputContent('');

    try {
      setIsSending(true);
      const res = await chatService.sendMessage(activeConvId, trimmed);
      if (res.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: res.data!.id,
            sender_id: res.data!.sender_id,
            content: res.data!.content,
            sent_at: res.data!.sent_at,
            is_self: true,
          },
        ]);
        fetchConversations();
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const filteredConversations = conversations.filter((c) =>
    c.peer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-6.5rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex">
      <div
        className={`w-full lg:w-80 shrink-0 border-r border-slate-200 flex flex-col ${
          activeConvId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-3.5 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm cuộc trò chuyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingConvs ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Không tìm thấy cuộc trò chuyện nào.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSearchParams({ conversation_id: c.id })}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                    isActive ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  {c.peer.avatar_url ? (
                    <img src={c.peer.avatar_url} alt={c.peer.full_name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {c.peer.full_name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{c.peer.full_name}</h4>
                      <span className="text-[10px] text-slate-400">
                        {c.last_message?.sent_at
                          ? new Date(c.last_message.sent_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                    <Badge variant="slate" size="sm" className="mt-1 text-[9px]">
                      {c.match_type === 'PROJECT_MATCH' ? 'Dự án' : c.match_type === 'STUDY_BUDDY' ? 'Bạn học' : 'Kỹ năng'}
                    </Badge>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {c.last_message ? (c.last_message.is_self ? `Bạn: ${c.last_message.content}` : c.last_message.content) : 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col bg-slate-50/50 ${
          !activeConvId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            <div className="p-3.5 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSearchParams({})}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {activeConversation.peer.avatar_url ? (
                  <img src={activeConversation.peer.avatar_url} alt={activeConversation.peer.full_name} className="w-9 h-9 rounded-xl object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {activeConversation.peer.full_name[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeConversation.peer.full_name}</h3>
                  <Badge variant="blue" size="sm" className="text-[9px]">
                    {activeConversation.match_type === 'PROJECT_MATCH' ? 'Kết nối Dự án' : activeConversation.match_type === 'STUDY_BUDDY' ? 'Kết nối Bạn học' : 'Trao đổi Kỹ năng'}
                  </Badge>
                </div>
              </div>
              <Link to={`/profile/${activeConversation.peer.user_id}`}>
                <Button variant="outline" size="sm" className="text-xs">Xem hồ sơ</Button>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {isLoadingMsgs ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-48 rounded-2xl" />
                  <Skeleton className="h-10 w-64 ml-auto rounded-2xl" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.is_self ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        m.is_self
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-none'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(m.sent_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                maxLength={1000}
                placeholder="Nhập tin nhắn (tối đa 1000 ký tự - FR-CHAT-007)..."
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="submit" disabled={!inputContent.trim() || isSending} size="md" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Chưa chọn cuộc trò chuyện"
              description="Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin trao đổi."
            />
          </div>
        )}
      </div>
    </div>
  );
};
