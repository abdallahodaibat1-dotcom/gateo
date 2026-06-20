'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import EmojiPicker from '@/components/EmojiPicker';
import ShareModal from '@/components/ShareModal';
import { Skeleton } from '@/components/ui';
import { Loader2, Heart, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
  _count: { replies: number; likes: number };
  replies?: Comment[];
  isLiked?: boolean;
}

interface Post {
  id: string;
  content: string | null;
  images: any;
  video: string | null;
  location: string | null;
  createdAt: string;
  isPublic: boolean;
  isLiked: boolean;
  isSaved: boolean;
  user: { id: string; name: string | null; avatar: string | null } | null;
  business: { id: string; name: string | null; logo: string | null } | null;
  _count: { likes: number; comments: number };
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else if (res.status === 404) {
        router.push('/feed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [data.comment, ...prev]);
        setCommentText('');
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments + 1 },
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim(), parentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), data.comment], _count: { ...c._count, replies: c._count.replies + 1 } }
              : c
          )
        );
        setReplyText('');
        setReplyTo(null);
        if (post) {
          setPost({
            ...post,
            _count: { ...post._count, comments: post._count.comments + 1 },
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, isLiked: data.liked, _count: { ...c._count, likes: data.likesCount } } : c
          )
        );
      }
    } catch {}
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ي`;
    return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const onEmojiSelect = (emoji: string) => {
    if (replyTo) {
      setReplyText((prev) => prev + emoji);
      replyInputRef.current?.focus();
    } else {
      setCommentText((prev) => prev + emoji);
      commentInputRef.current?.focus();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 pt-20">
          <div className="max-w-xl mx-auto px-4">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton circle className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <Skeleton className="w-full h-48" />
              <div className="flex gap-3">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-20 h-8" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!post) return null;

  return (
    <>
      <Navbar />
      <main className="pt-16 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto">
          <PostCard post={post} currentUserId={session?.user?.id} />

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Divider */}
            <div className="flex items-center gap-3 px-4 py-3">
              <MessageCircle className="w-4 h-4 text-muted" />
              <span className="text-sm font-semibold text-foreground">
                التعليقات ({post._count.comments})
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Comment Input */}
            {session?.user?.id && (
              <div className="px-4 py-3 flex gap-3 items-start">
                <img
                  src={session.user.image || '/logo/favicon.svg'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0 mt-1"
                />
                <div className="flex-1">
                  <div className="relative">
                    <label htmlFor="comment-input" className="sr-only">أضف تعليقاً</label>
                    <textarea
                      id="comment-input"
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="أضف تعليقاً..."
                      rows={1}
                      className="w-full resize-none bg-surface border border-border rounded-md text-[15px] text-foreground placeholder:text-muted py-2 px-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitComment();
                        }
                      }}
                    />
                    <div className="absolute left-2 bottom-2 flex items-center gap-1">
                      <EmojiPicker onEmojiSelect={onEmojiSelect} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !commentText.trim()}
                      className="text-xs font-bold text-primary hover:text-primary-dark disabled:text-muted transition-colors px-2 py-1"
                    >
                      {submittingComment ? 'جاري النشر...' : 'نشر'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="px-4">
              {comments.length === 0 && (
                <div className="py-10 text-center">
                  <MessageCircle className="w-10 h-10 text-border mx-auto mb-2" />
                  <p className="text-muted text-sm">لا توجد تعليقات بعد</p>
                  <p className="text-muted/70 text-xs mt-1">كني أول من يعلق</p>
                </div>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="py-3">
                  <div className="flex gap-3">
                    <img
                      src={comment.user.avatar || '/logo/favicon.svg'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="inline-block">
                        <div className="bg-slate-50 rounded-2xl rounded-tr-sm px-4 py-2 border border-border">
                          <div className="font-bold text-sm text-foreground">{comment.user.name || 'مستخدم'}</div>
                          <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 mr-3">
                        <span className="text-[11px] text-muted">{formatDate(comment.createdAt)}</span>
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`text-[11px] font-bold transition-colors ${
                            comment.isLiked ? 'text-danger' : 'text-muted hover:text-danger'
                          }`}
                        >
                          {comment._count.likes > 0 ? `${comment._count.likes} ` : ''}إعجاب
                        </button>
                        <button
                          onClick={() => {
                            setReplyTo(comment.id);
                            setReplyText('');
                          }}
                          className="text-[11px] font-bold text-muted hover:text-primary transition-colors"
                        >
                          رد
                        </button>
                      </div>

                      {/* Reply Input */}
                      <AnimatePresence>
                        {replyTo === comment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 mr-4"
                          >
                            <div className="flex gap-2 items-start">
                              <img
                                src={session?.user?.image || '/logo/favicon.svg'}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover border border-border flex-shrink-0 mt-1"
                              />
                              <div className="flex-1 relative">
                                <label htmlFor={`reply-input-${comment.id}`} className="sr-only">رد على {comment.user.name || 'مستخدم'}</label>
                                <textarea
                                  id={`reply-input-${comment.id}`}
                                  ref={replyInputRef}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`رد على ${comment.user.name || 'مستخدم'}...`}
                                  rows={1}
                                  autoFocus
                                  className="w-full resize-none bg-surface border border-border rounded-md text-sm text-foreground placeholder:text-muted py-1.5 px-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSubmitReply(comment.id);
                                    }
                                  }}
                                />
                                <div className="absolute left-2 bottom-1">
                                  <EmojiPicker onEmojiSelect={onEmojiSelect} />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-1 mr-8">
                              <button
                                onClick={() => setReplyTo(null)}
                                className="text-[11px] font-bold text-muted hover:text-foreground px-2 py-1"
                              >
                                إلغاء
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyText.trim()}
                                className="text-[11px] font-bold text-primary hover:text-primary-dark disabled:text-muted px-2 py-1"
                              >
                                نشر
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 mr-4">
                          <button
                            onClick={() =>
                              setExpandedReplies((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))
                            }
                            className="flex items-center gap-1 text-xs text-muted hover:text-foreground mb-2"
                          >
                            {expandedReplies[comment.id] ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                إخفاء الردود
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                عرض {comment._count.replies} {comment._count.replies === 1 ? 'رد' : 'ردود'}
                              </>
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedReplies[comment.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2"
                              >
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <img
                                      src={reply.user.avatar || '/logo/favicon.svg'}
                                      alt=""
                                      className="w-6 h-6 rounded-full object-cover border border-border flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                      <div className="bg-slate-50 rounded-2xl rounded-tr-sm px-3 py-1.5 inline-block border border-border">
                                        <div className="font-bold text-xs text-foreground">{reply.user.name || 'مستخدم'}</div>
                                        <p className="text-xs text-foreground mt-0.5">{reply.content}</p>
                                      </div>
                                      <div className="flex items-center gap-3 mt-0.5 mr-2">
                                        <span className="text-[10px] text-muted">{formatDate(reply.createdAt)}</span>
                                        <button className="text-[10px] font-bold text-muted hover:text-danger">
                                          إعجاب
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        postId={post.id}
        postContent={post.content}
      />
    </>
  );
}
