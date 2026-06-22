'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Loader2, Send, CheckCheck, ImageIcon, Video, MapPin, X, Trash2,
  Reply, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { compressImage, compressVideo } from '@/lib/media-compression';

interface GroupMessage {
  id: string;
  content: string | null;
  type: string;
  mediaUrl: string | null;
  lat: number | null;
  lng: number | null;
  replyToId: string | null;
  mentions: string | null;
  isDeleted: boolean;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string | null; avatar: string | null };
}

interface GroupMember {
  user: { id: string; name: string | null; avatar: string | null };
  role: string;
}

interface GroupChatProps {
  groupId: string;
  members: GroupMember[];
  isAdmin: boolean;
}

export default function GroupChat({ groupId, members, isAdmin }: GroupChatProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentUserId = session?.user?.id;

  const getInputValue = () => textareaRef.current?.value || '';
  const setInputValue = (val: string) => {
    if (textareaRef.current) textareaRef.current.value = val;
  };

  const fetchMessages = useCallback(async (pageNum: number, append = false) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages?page=${pageNum}&limit=30`);
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
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    fetchMessages(1).then(() => setLoading(false));
  }, [fetchMessages]);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/messages?page=1&limit=30`);
        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = data.messages.filter((m: GroupMessage) => !existingIds.has(m.id));
            if (newMessages.length > 0) return [...prev, ...newMessages];
            return prev;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (!loading && messages.length > 0 && page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, messages.length, page]);

  const handleSend = async () => {
    const content = getInputValue().trim();
    if (!content || sending) return;
    setSendError('');
    setSending(true);

    // Parse mentions
    const mentionRegex = /@([^\s]+)/g;
    const mentions: Array<{ userId: string; name: string; position: number }> = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedUser = members.find((m) => m.user.name === match![1]);
      if (mentionedUser) {
        mentions.push({ userId: mentionedUser.user.id, name: match![1], position: match!.index });
      }
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: 'TEXT',
          replyToId: replyTo?.id || undefined,
          mentions: mentions.length > 0 ? mentions : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setReplyTo(null);
        setInputValue('');
        setShowMentions(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      } else {
        const err = await res.json().catch(() => ({ error: 'فشل الإرسال' }));
        setSendError(err.error || 'فشل الإرسال');
      }
    } catch (e) {
      console.error(e);
      setSendError('فشل الاتصال بالخادم');
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

  const handleDelete = async (msgId: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذه الرسالة؟', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/groups/${groupId}/messages/${msgId}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, isDeleted: true, content: null, mediaUrl: null } : m))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMediaUpload = async (file: File, type: 'IMAGE' | 'VIDEO') => {
    if (!file) return;
    const allowedImage = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideo = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (type === 'IMAGE' && !allowedImage.includes(file.type)) {
      showToast('صيغة الصورة غير مدعومة', 'error');
      return;
    }
    if (type === 'VIDEO' && !allowedVideo.includes(file.type)) {
      showToast('صيغة الفيديو غير مدعومة', 'error');
      return;
    }
    const maxSize = type === 'IMAGE' ? undefined : 100;
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      showToast(`الحد الأقصى ${maxSize} ميجابايت`, 'error');
      return;
    }
    setUploadingMedia(true);
    setSendError('');
    try {
      let uploadFile = file;
      if (type === 'IMAGE') {
        uploadFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
          maxSizeBytes: 4 * 1024 * 1024,
        });
      } else if (type === 'VIDEO') {
        uploadFile = await compressVideo(file, {
          maxWidth: 1280,
          maxHeight: 720,
          maxRate: '2M',
        });
      }
      const formData = new FormData();
      formData.append('file', uploadFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        showToast(uploadData.error || 'فشل رفع الملف', 'error');
        return;
      }
      const msgRes = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          mediaUrl: uploadData.url,
          content: type === 'IMAGE' ? 'صورة' : 'فيديو',
        }),
      });
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages((prev) => [...prev, msgData.message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } else {
        const err = await msgRes.json().catch(() => ({ error: 'فشل إرسال الرسالة' }));
        showToast(err.error || 'فشل إرسال الرسالة', 'error');
      }
    } catch {
      showToast('فشل الرفع أو الإرسال', 'error');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSendLocation = async () => {
    if (!navigator.geolocation) {
      showToast('المتصفح لا يدعم تحديد الموقع', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/groups/${groupId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'LOCATION',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              content: 'موقعي الحالي',
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setMessages((prev) => [...prev, data.message]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          } else {
            const err = await res.json().catch(() => ({ error: 'فشل إرسال الموقع' }));
            showToast(err.error || 'فشل إرسال الموقع', 'error');
          }
        } catch (e) {
          console.error(e);
          showToast('فشل إرسال الموقع', 'error');
        }
      },
      () => showToast('لم نتمكن من تحديد موقعك', 'error')
    );
  };

  const onTextareaInput = () => {
    const val = getInputValue();
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt === val.length - 1) {
      setShowMentions(true);
      setMentionQuery('');
    } else if (lastAt !== -1 && !val.slice(lastAt + 1).includes(' ')) {
      setShowMentions(true);
      setMentionQuery(val.slice(lastAt + 1));
    } else {
      setShowMentions(false);
    }
    // Auto-resize
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  const insertMention = (name: string) => {
    const val = getInputValue();
    const lastAt = val.lastIndexOf('@');
    const before = val.slice(0, lastAt);
    const newVal = before + '@' + name + ' ';
    setInputValue(newVal);
    setShowMentions(false);
    textareaRef.current?.focus();
    // Trigger resize
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  const isOwnMessage = (msg: GroupMessage) => msg.senderId === currentUserId;

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

  const groupedMessages = messages.reduce<Record<string, GroupMessage[]>>((acc, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  const mentionCandidates = members.filter((m) =>
    m.user.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const renderContent = (msg: GroupMessage) => {
    if (!msg.content) return null;
    const parts = msg.content.split(/(@[^\s]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-primary-light font-semibold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] min-h-[400px] bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        dir="rtl"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="ابدأ المحادثة الجماعية"
            description="شارك آرائك ونصائحك مع أعضاء المجموعة"
            className="border-none bg-transparent"
          />
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
                  const showSender = !own;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${own ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {showSender && (
                          <img
                            src={msg.sender.avatar || '/logo/favicon.svg'}
                            alt={msg.sender.name || ''}
                            className="w-7 h-7 rounded-full object-cover border border-border bg-surface flex-shrink-0 mb-1"
                          />
                        )}
                        <div className="flex flex-col gap-1">
                          {showSender && (
                            <span className="text-[10px] text-muted mr-1">{msg.sender.name || 'مستخدم'}</span>
                          )}
                          <div
                            className={`relative px-4 py-2.5 ${
                              own
                                ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                                : 'bg-slate-100 text-foreground rounded-2xl rounded-tl-sm'
                            }`}
                          >
                            {msg.replyToId && (
                              <div className={`text-[10px] mb-1 px-2 py-0.5 rounded ${own ? 'bg-white/20 text-white/90' : 'bg-slate-200 text-muted'}`}>
                                رد على رسالة
                              </div>
                            )}

                            {msg.isDeleted ? (
                              <p className="text-sm opacity-60 italic">تم حذف الرسالة</p>
                            ) : msg.type === 'IMAGE' && msg.mediaUrl ? (
                              <img
                                src={msg.mediaUrl}
                                alt="صورة مرسلة في المحادثة"
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
                                {renderContent(msg)}
                              </p>
                            )}

                            {!msg.isDeleted && (
                              <div className={`absolute top-1 ${own ? 'left-1' : 'right-1'} opacity-0 hover:opacity-100 transition-opacity`}>
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  className={`p-1 rounded ${own ? 'text-white/70 hover:text-white' : 'text-muted hover:text-foreground'}`}
                                  aria-label="رد"
                                  title="رد"
                                >
                                  <Reply className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <div className={`flex items-center gap-1 mt-1 ${own ? 'justify-start' : 'justify-end'}`}>
                              <span className={`text-[10px] ${own ? 'text-white/80' : 'text-muted'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {own && <CheckCheck className="w-3 h-3 text-white/70" />}
                            </div>
                          </div>
                        </div>
                        {own && (
                          <img
                            src={session?.user?.image || '/logo/favicon.svg'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-border bg-surface flex-shrink-0 mb-1"
                          />
                        )}
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

      {/* Reply bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-slate-50 border-t border-border flex items-center gap-2"
          >
            <div className="flex-1 text-xs text-muted truncate">
              <span className="text-primary font-medium">رد على:</span>{' '}
              {replyTo.content || (replyTo.type === 'IMAGE' ? 'صورة' : replyTo.type === 'VIDEO' ? 'فيديو' : 'رسالة')}
            </div>
            <button
              onClick={() => setReplyTo(null)}
              aria-label="إلغاء الرد"
              className="p-1 rounded-full hover:bg-slate-200"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {sendError && (
        <div className="px-4 py-2 bg-danger/5 border-t border-danger/10 text-xs text-danger text-center">
          {sendError}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-surface relative">
        {/* Mention dropdown */}
        <AnimatePresence>
          {showMentions && mentionCandidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-surface rounded-lg shadow-lg border border-border max-h-40 overflow-y-auto z-20"
            >
              {mentionCandidates.map((m) => (
                <button
                  key={m.user.id}
                  onClick={() => insertMention(m.user.name || 'مستخدم')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors text-right"
                >
                  <img
                    src={m.user.avatar || '/logo/favicon.svg'}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-border"
                  />
                  <span className="text-sm text-foreground">{m.user.name || 'مستخدم'}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* Media buttons */}
          <div className="flex items-center gap-1 pb-1">
            <label
              aria-label="إرفاق صورة"
              className="relative cursor-pointer p-2 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMediaUpload(file, 'IMAGE');
                  e.target.value = '';
                }}
                disabled={uploadingMedia}
              />
              {uploadingMedia ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageIcon className="w-5 h-5" />}
            </label>
            <label
              aria-label="إرفاق فيديو"
              className="relative cursor-pointer p-2 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
            >
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMediaUpload(file, 'VIDEO');
                  e.target.value = '';
                }}
                disabled={uploadingMedia}
              />
              <Video className="w-5 h-5" />
            </label>
            <button
              onClick={handleSendLocation}
              className="p-2 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
              aria-label="إرسال موقع"
              title="إرسال موقع"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>

          {/* Textarea — UNCONTROLLED for RTL reliability */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              defaultValue=""
              onInput={onTextareaInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب رسالة... استخدمي @ لإشارة عضو"
              className="w-full px-4 py-2.5 rounded-2xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-surface placeholder:text-slate-400 resize-none overflow-hidden block"
              style={{ minHeight: '42px', maxHeight: '120px', height: '42px' }}
              dir="auto"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            aria-label="إرسال"
            className="p-2.5 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 flex-shrink-0 mb-0.5"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}
