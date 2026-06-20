'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2, Send, ArrowRight, CheckCheck, Check, ImageIcon, Trash2, MoreHorizontal, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

interface ConversationParticipant {
  id: string;
  userId: string;
  user: { id: string; name: string | null; avatar: string | null };
}

interface Message {
  id: string;
  content: string | null;
  type: string;
  mediaUrl: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  senderId: string;
  isDeleted: boolean;
  sender: { id: string; name: string | null; avatar: string | null };
}

interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  image: string | null;
  participants: ConversationParticipant[];
}

export default function ConversationChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchConversation = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
      } else if (res.status === 404) {
        router.push('/conversations');
      }
    } catch (e) {
      console.error(e);
    }
  }, [id, router]);

  const fetchMessages = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const res = await fetch(`/api/conversations/${id}/messages?page=${pageNum}&limit=30`);
        if (res.ok) {
          const data = await res.json();
          if (append) {
            setMessages((prev) => [...data.messages, ...prev]);
          } else {
            setMessages(data.messages);
          }
          setHasMore(data.pagination.page < data.pagination.pages);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [id]
  );

  const markAsRead = useCallback(async () => {
    try {
      await fetch(`/api/conversations/${id}/read`, { method: 'PUT' });
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    if (status === 'authenticated' && id) {
      setLoading(true);
      Promise.all([fetchConversation(), fetchMessages(1)]).then(() => {
        setLoading(false);
        markAsRead();
      });
    }
  }, [status, id, fetchConversation, fetchMessages, markAsRead]);

  // Poll for new messages
  useEffect(() => {
    if (status !== 'authenticated' || !id) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${id}/messages?page=1&limit=30`);
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = data.messages.filter((m: Message) => !existingIds.has(m.id));
            if (newMessages.length > 0) {
              markAsRead();
              return [...prev, ...newMessages];
            }
            return prev;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [status, id, markAsRead]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (!loading && messages.length > 0 && page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, messages.length, page]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'TEXT' }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMessages(nextPage, true);
    setLoadingMore(false);
  };

  const handleDeleteConversation = async () => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذه المحادثة؟', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/conversations');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getOtherParticipant = (conv: Conversation | null) => {
    if (!conv) return null;
    return conv.participants.find((p) => p.userId !== session?.user?.id)?.user;
  };

  const getConversationName = (conv: Conversation | null) => {
    if (!conv) return '';
    if (conv.isGroup) return conv.name || 'مجموعة';
    const other = getOtherParticipant(conv);
    return other?.name || 'مستخدم';
  };

  const getConversationImage = (conv: Conversation | null) => {
    if (!conv) return '/logo/favicon.svg';
    if (conv.isGroup) return conv.image || '/logo/favicon.svg';
    const other = getOtherParticipant(conv);
    return other?.avatar || '/logo/favicon.svg';
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return 'اليوم';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'أمس';
    return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isOwnMessage = (msg: Message) => msg.senderId === session?.user?.id;

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

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
      <main className="pt-16 pb-0 min-h-screen bg-slate-50 flex flex-col">
        <div className="max-w-xl mx-auto w-full flex-1 flex flex-col bg-surface shadow-sm border-x border-border">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-16 z-10">
            <div className="flex items-center gap-3">
              <Link
                href="/conversations"
                className="lg:hidden p-2 -mr-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="العودة للمحادثات"
              >
                <ArrowRight className="w-5 h-5 text-foreground" />
              </Link>
              <img
                src={getConversationImage(conversation)}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
              <div>
                <h2 className="font-semibold text-sm text-foreground">{getConversationName(conversation)}</h2>
                <p className="text-xs text-muted">
                  {conversation?.isGroup
                    ? `${conversation.participants.length} مشارك`
                    : 'نشط الآن'}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                aria-label="خيارات المحادثة"
              >
                <MoreHorizontal className="w-5 h-5 text-muted" />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute left-0 top-full mt-1 bg-surface rounded-lg shadow-lg border border-border py-1 min-w-[160px] z-20"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDeleteConversation();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف المحادثة
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[60vh] max-h-[calc(100vh-180px)]"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-muted" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">ابدأ المحادثة</h2>
                <p className="text-muted text-sm">أرسلي أول رسالة لتبدئي التواصل</p>
              </div>
            ) : (
              <>
                {hasMore && (
                  <div className="flex justify-center py-2">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="text-xs text-primary hover:text-primary-dark font-medium disabled:opacity-50"
                    >
                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحميل رسائل أقدم'}
                    </button>
                  </div>
                )}

                {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                  <div key={dateKey} className="space-y-3">
                    <div className="flex justify-center">
                      <span className="text-[10px] text-muted bg-slate-100 px-3 py-1 rounded-full">
                        {formatDate(dateKey)}
                      </span>
                    </div>
                    {dateMessages.map((msg) => {
                      const own = isOwnMessage(msg);
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${own ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[75%] ${
                              own
                                ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                : 'bg-slate-100 text-foreground rounded-2xl rounded-tl-sm'
                            } px-4 py-2.5`}
                          >
                            {msg.isDeleted ? (
                              <p className="text-sm opacity-60 italic">تم حذف الرسالة</p>
                            ) : msg.type === 'IMAGE' && msg.mediaUrl ? (
                              <img
                                src={msg.mediaUrl}
                                alt="صورة"
                                className="rounded-lg max-w-full max-h-64 object-cover"
                              />
                            ) : msg.type === 'VIDEO' && msg.mediaUrl ? (
                              <video
                                src={msg.mediaUrl}
                                controls
                                className="rounded-lg max-w-full max-h-64"
                              />
                            ) : msg.type === 'LOCATION' ? (
                              <a
                                href={`https://maps.google.com/?q=${msg.lat},${msg.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm underline opacity-90 flex items-center gap-1"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                عرض الموقع
                              </a>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            )}
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                own ? 'justify-start' : 'justify-end'
                              }`}
                            >
                              <span
                                className={`text-[10px] ${
                                  own ? 'text-blue-100' : 'text-muted'
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </span>
                              {own && (
                                <CheckCheck className="w-3 h-3 text-blue-200" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-surface sticky bottom-0">
            <div className="flex items-center gap-2">
              <button
                className="p-2.5 rounded-md text-muted hover:text-primary hover:bg-primary/5 transition-colors flex-shrink-0"
                aria-label="إرسال صورة (قريباً)"
                title="إرسال صورة (قريباً)"
                disabled
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="اكتب رسالة..."
                  className="w-full px-4 py-2.5 rounded-full border border-border text-sm text-foreground bg-slate-50 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                  dir="rtl"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="p-2.5 rounded-md bg-primary text-white shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-40 flex-shrink-0"
                aria-label="إرسال"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <ConfirmDialog />
    </>
  );
}
