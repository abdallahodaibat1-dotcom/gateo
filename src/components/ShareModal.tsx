'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Link2, Check, MessageCircle, Send, Users,
  Copy, ExternalLink, Globe, Hash, ArrowLeft
} from 'lucide-react';
import EmptyState from './ui/EmptyState';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postContent?: string | null;
}

export default function ShareModal({ isOpen, onClose, postId, postContent }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showSendList, setShowSendList] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/post/${postId}`
    : `/post/${postId}`;

  const shareText = postContent
    ? `${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}`
    : 'شاهد هذا المنشور على Gateo';

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowSendList(false);
      return;
    }
    // Fetch conversations for "Send in message"
    fetch('/api/conversations?limit=20')
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations?.filter((c: any) => !c.isGroup) || []);
      })
      .catch(() => {});
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Gateo',
          text: shareText,
          url: postUrl,
        });
      }
    } catch {}
  };

  const handleSendToConversation = async (conversationId: string) => {
    setSendingTo(conversationId);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postUrl }),
      });
      if (res.ok) {
        setShowSendList(false);
        onClose();
      }
    } catch {}
    setSendingTo(null);
  };

  const shareOptions = [
    {
      name: 'نسخ الرابط',
      icon: copied ? Check : Copy,
      color: copied ? 'text-success' : 'text-muted',
      bg: copied ? 'bg-success/10' : 'bg-slate-100',
      onClick: handleCopy,
    },
    {
      name: 'مشاركة',
      icon: ExternalLink,
      color: 'text-primary',
      bg: 'bg-primary/10',
      onClick: handleShareNative,
    },
    {
      name: 'إرسال في رسالة',
      icon: Send,
      color: 'text-primary',
      bg: 'bg-primary/10',
      onClick: () => setShowSendList(true),
    },
    {
      name: 'واتساب',
      icon: MessageCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + postUrl)}`, '_blank'),
    },
    {
      name: 'تويتر / X',
      icon: Hash,
      color: 'text-sky-500',
      bg: 'bg-sky-50',
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, '_blank'),
    },
    {
      name: 'فيسبوك',
      icon: Globe,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank'),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-base text-foreground">
                {showSendList ? 'إرسال إلى' : 'مشاركة المنشور'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {showSendList ? (
              <div className="px-5 pb-6 max-h-[60vh] overflow-y-auto">
                <button
                  onClick={() => setShowSendList(false)}
                  className="mb-4 text-sm text-primary font-medium hover:text-primary-dark flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  رجوع
                </button>
                {conversations.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="لا توجد محادثات متاحة"
                    description="ابدأ محادثة جديدة لمشاركة هذا المنشور"
                  />
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv: any) => {
                      const otherUser = conv.participants?.find((p: any) => p.user.id !== conv.currentUserId)?.user || conv.participants?.[0]?.user;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handleSendToConversation(conv.id)}
                          disabled={sendingTo === conv.id}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-right disabled:opacity-50"
                        >
                          <img
                            src={otherUser?.avatar || '/logo/favicon.svg'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-border"
                          />
                          <div className="flex-1 text-right">
                            <div className="font-medium text-sm text-foreground">{otherUser?.name || 'مستخدم'}</div>
                            <div className="text-xs text-muted">{conv.lastMessage?.slice(0, 30) || ''}</div>
                          </div>
                          {sendingTo === conv.id ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Share Options Grid */}
                <div className="px-5 pb-4 grid grid-cols-4 gap-3">
                  {shareOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={option.onClick}
                      className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full ${option.bg} flex items-center justify-center`}>
                        <option.icon className={`w-5 h-5 ${option.color}`} />
                      </div>
                      <span className="text-[11px] font-medium text-muted">{option.name}</span>
                    </button>
                  ))}
                </div>

                {/* Invite Friends */}
                <div className="mx-5 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-sm text-foreground">ادعُ أصدقائك</div>
                      <div className="text-xs text-muted">شارك Gateo مع من تحب</div>
                    </div>
                    <button
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('انضم إلي على Gateo! ' + (typeof window !== 'undefined' ? window.location.origin : ''))}`, '_blank')}
                      className="px-4 py-2 rounded-md bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-colors"
                    >
                      دعوة
                    </button>
                  </div>
                </div>

                {/* Link Preview */}
                <div className="mx-5 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-border">
                    <Link2 className="w-4 h-4 text-muted flex-shrink-0" />
                    <span className="flex-1 text-xs text-muted truncate text-right">{postUrl}</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs font-bold text-primary hover:text-primary-dark"
                    >
                      {copied ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
