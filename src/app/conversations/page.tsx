'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { EmptyState, Skeleton } from '@/components/ui';
import { Loader2, MessageCircle, Search, X, Users, Trash2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

interface ConversationParticipant {
  id: string;
  userId: string;
  user: { id: string; name: string | null; avatar: string | null };
}

interface LastMessage {
  id: string;
  content: string | null;
  type: string;
  mediaUrl: string | null;
  createdAt: string;
  senderId: string;
  isDeleted: boolean;
}

interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: LastMessage[];
  _count: { messages: number };
  unreadCount: number;
}

interface SuggestedUser {
  id: string;
  name: string | null;
  avatar: string | null;
}

export default function ConversationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SuggestedUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations?limit=50');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (e) {
      console.error('Failed to fetch conversations:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConversations();
      const interval = setInterval(fetchConversations, 15000);
      return () => clearInterval(interval);
    }
  }, [status, fetchConversations]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const createConversation = async (userId: string) => {
    setCreating(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: [userId], isGroup: false }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewChat(false);
        setSearchQuery('');
        setSearchResults([]);
        router.push(`/conversations/${data.conversation.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const deleteConversation = async (id: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذه المحادثة؟', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.userId !== session?.user?.id)?.user;
  };

  const getConversationName = (conv: Conversation) => {
    if (conv.isGroup) return conv.name || 'مجموعة';
    const other = getOtherParticipant(conv);
    return other?.name || 'مستخدم';
  };

  const getConversationImage = (conv: Conversation) => {
    if (conv.isGroup) return conv.image || '/logo/favicon.svg';
    const other = getOtherParticipant(conv);
    return other?.avatar || '/logo/favicon.svg';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} يوم`;
    return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const getMessagePreview = (msg: LastMessage | undefined) => {
    if (!msg) return 'لا توجد رسائل';
    if (msg.isDeleted) return 'تم حذف الرسالة';
    if (msg.type === 'IMAGE') return 'صورة';
    if (msg.type === 'VIDEO') return 'فيديو';
    if (msg.type === 'AUDIO') return 'رسالة صوتية';
    if (msg.type === 'LOCATION') return 'موقع';
    if (msg.type === 'FILE') return 'ملف';
    return msg.content || '';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden min-h-[70vh]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-border">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                المحادثات
              </h1>
              <button
                onClick={() => setShowNewChat(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors"
              >
                <Users className="w-4 h-4" />
                محادثة جديدة
              </button>
            </div>

            {loading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton circle className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-1/3 h-4" />
                      <Skeleton className="w-2/3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="لا توجد محادثات"
                description="ابدأ محادثة جديدة مع جهات الاتصال"
                actionLabel="بدء محادثة"
                onAction={() => setShowNewChat(true)}
                className="min-h-[50vh]"
              />
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => {
                  const lastMessage = conversation.messages[0];
                  const isOwnLastMessage = lastMessage?.senderId === session?.user?.id;

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors ${
                        conversation.unreadCount > 0 ? 'bg-primary/5' : ''
                      }`}
                    >
                      <Link
                        href={`/conversations/${conversation.id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={getConversationImage(conversation)}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-border"
                          />
                          {conversation.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface">
                              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {getConversationName(conversation)}
                            </span>
                            {lastMessage && (
                              <span className="text-xs text-muted flex-shrink-0 mr-2">
                                {formatDate(lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isOwnLastMessage && (
                              <CheckCheck className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                            )}
                            <p
                              className={`text-sm truncate ${
                                conversation.unreadCount > 0
                                  ? 'text-foreground font-medium'
                                  : 'text-muted'
                              }`}
                            >
                              {getMessagePreview(lastMessage)}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={() => deleteConversation(conversation.id)}
                        className="p-2 rounded-md text-muted hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        aria-label="حذف المحادثة"
                        title="حذف المحادثة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNewChat(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">محادثة جديدة</h2>
                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="ابحث عن مستخدم..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    dir="rtl"
                  />
                </div>

                {searchLoading && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}

                {!searchLoading && searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-6 text-muted text-sm">لا توجد نتائج</div>
                )}

                <div className="mt-3 space-y-1 max-h-[300px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => createConversation(user.id)}
                      disabled={creating}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors text-right"
                    >
                      <img
                        src={user.avatar || '/logo/favicon.svg'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <span className="font-medium text-sm text-foreground">{user.name || 'مستخدم'}</span>
                    </button>
                  ))}
                </div>

                {!searchQuery && (
                  <div className="text-center py-6 text-muted text-sm">
                    اكتب اسم المستخدم للبحث
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog />
    </>
  );
}
