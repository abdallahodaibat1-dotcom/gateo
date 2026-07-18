'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart, MessageCircle, Bookmark, Share2, MapPin, MoreHorizontal,
  Trash2, Volume2, VolumeX, Play, Send, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ShareModal from './ShareModal';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

interface PostCardProps {
  post: {
    id: string;
    content?: string | null;
    images?: any;
    video?: string | null;
    location?: string | null;
    createdAt: string;
    postType?: string;
    isLiked?: boolean;
    isSaved?: boolean;
    isPublic: boolean;
    user?: { id: string; name: string | null; avatar: string | null } | null;
    business?: { id: string; name: string | null; logo: string | null } | null;
    _count?: { likes: number; comments: number; views?: number; shares?: number };
  };
  onLike?: (postId: string, liked: boolean) => void;
  onSave?: (postId: string, saved: boolean) => void;
  onDelete?: (postId: string) => void;
  onRequireAuth?: () => void;
  currentUserId?: string;
}

export default function PostCard({ post, onLike, onSave, onDelete, onRequireAuth, currentUserId }: PostCardProps) {
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [saved, setSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [viewCount, setViewCount] = useState(post._count?.views || 0);
  const [shareCount, setShareCount] = useState(post._count?.shares || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewTrackedRef = useRef(false);

  const images: string[] = Array.isArray(post.images) ? post.images : [];
  const authorName = post.user?.name || post.business?.name || 'مستخدم';
  const authorAvatar = post.user?.avatar || post.business?.logo || '/logo/favicon.svg';
  const authorId = post.user?.id || post.business?.id || '';
  const isOwner = currentUserId && (post.user?.id === currentUserId);
  const isReel = post.postType === 'REEL';

  useEffect(() => {
    if (!isReel || !videoRef.current) return;
    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setVideoPlaying(true);
          trackView();
        } else {
          video.pause();
          setVideoPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [isReel]);

  const trackView = () => {
    if (viewTrackedRef.current) return;
    if (typeof window === 'undefined') return;
    const viewedKey = `viewed_posts`;
    try {
      const viewed = JSON.parse(localStorage.getItem(viewedKey) || '[]') as string[];
      if (viewed.includes(post.id)) return;
      viewed.push(post.id);
      localStorage.setItem(viewedKey, JSON.stringify(viewed));
      viewTrackedRef.current = true;
      fetch(`/api/posts/${post.id}/view`, { method: 'POST' }).catch(() => {});
      setViewCount((prev) => prev + 1);
    } catch {
      // ignore localStorage errors
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      onRequireAuth?.();
      return;
    }
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
        onLike?.(post.id, data.liked);
      }
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!currentUserId) {
      onRequireAuth?.();
      return;
    }
    try {
      const res = await fetch(`/api/posts/${post.id}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        onSave?.(post.id, data.saved);
      }
    } catch (e) {}
  };

  const handleShare = async () => {
    setShareCount((prev) => prev + 1);
    fetch(`/api/posts/${post.id}/share`, { method: 'POST' }).catch(() => {});
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذا المنشور؟', variant: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(post.id);
    } catch (e) {}
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

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/profile/${authorId}`} className="flex items-center gap-3">
            <div className="relative">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
              />
              {isReel && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                  <Play className="w-2 h-2 text-white fill-current" />
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">{authorName}</div>
              <div className="text-[11px] text-muted">
                {formatDate(post.createdAt)}
                {isReel && <span className="mr-1.5 text-primary font-semibold">• ريل</span>}
              </div>
            </div>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="خيارات"
            >
              <MoreHorizontal className="w-5 h-5 text-muted" />
            </button>
            {showMenu && (
              <div className="absolute left-0 top-full mt-1 bg-surface rounded-lg shadow-xl border border-border py-1.5 min-w-[150px] z-20">
                {isOwner && (
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                )}
                <button
                  onClick={() => { setShowMenu(false); setShareOpen(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-slate-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  مشاركة
                </button>
                <button
                  onClick={() => { setShowMenu(false); }}
                  className="w-full px-4 py-2.5 text-sm text-muted hover:bg-slate-100 transition-colors text-right"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <div className="px-4 pb-2.5">
            <p className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {/* Reel Video */}
        {isReel && post.video && (
          <div className="relative flex justify-center bg-black">
            <div className="relative w-full max-w-[400px] aspect-[9/16]">
              <video
                ref={videoRef}
                src={post.video}
                className="w-full h-full object-cover"
                loop
                playsInline
                muted={muted}
                preload="metadata"
              />
              <button
                onClick={() => setMuted((m) => !m)}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
                aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              {!videoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                  <Play className="w-14 h-14 text-white opacity-80 fill-current" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images */}
        {!isReel && images.length > 0 && (
          <div className="relative bg-black">
            <img
              src={images[imageIndex]}
              alt=""
              className="max-w-full max-h-[600px] object-contain mx-auto"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  disabled={imageIndex === 0}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 backdrop-blur text-white disabled:opacity-0 transition-opacity"
                  aria-label="الصورة السابقة"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageIndex((i) => Math.min(images.length - 1, i + 1))}
                  disabled={imageIndex === images.length - 1}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 backdrop-blur text-white disabled:opacity-0 transition-opacity"
                  aria-label="الصورة التالية"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${
                        i === imageIndex ? 'w-4 bg-white' : 'w-1 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Regular Video */}
        {!isReel && post.video && images.length === 0 && (
          <div className="bg-black">
            <video
              ref={videoRef}
              src={post.video}
              controls
              className="w-full aspect-video"
              onPlay={trackView}
            />
          </div>
        )}

        {/* Location */}
        {post.location && (
          <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {post.location}
          </div>
        )}

        {/* Actions Bar */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors ${
                  liked ? 'text-danger' : 'text-foreground hover:text-muted'
                }`}
                aria-label={liked ? 'إلغاء الإعجاب' : 'إعجاب'}
              >
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              </button>
              <Link href={`/post/${post.id}`} className="p-2 rounded-full text-foreground hover:text-muted transition-colors" aria-label="التعليقات">
                <MessageCircle className="w-6 h-6" />
              </Link>
              <button
                onClick={() => {
                  if (!currentUserId) {
                    onRequireAuth?.();
                    return;
                  }
                  setShareOpen(true);
                  handleShare();
                }}
                className="p-2 rounded-full text-foreground hover:text-muted transition-colors"
                aria-label="مشاركة"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`p-2 rounded-full transition-colors ${
                saved ? 'text-amber-500' : 'text-foreground hover:text-muted'
              }`}
              aria-label={saved ? 'إلغاء الحفظ' : 'حفظ'}
            >
              <Bookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats, Likes & Caption */}
        <div className="px-4 pb-1">
          <div className="flex items-center gap-3 text-sm text-muted mb-2">
            {likeCount > 0 && (
              <span>{likeCount.toLocaleString('ar-SA')} إعجاب</span>
            )}
            {viewCount > 0 && (
              <span>{viewCount.toLocaleString('ar-SA')} مشاهدة</span>
            )}
            {shareCount > 0 && (
              <span>{shareCount.toLocaleString('ar-SA')} مشاركة</span>
            )}
            {post._count && post._count.comments > 0 && (
              <Link href={`/post/${post.id}`} className="hover:text-foreground">
                {post._count.comments} {post._count.comments === 1 ? 'تعليق' : 'تعليقات'}
              </Link>
            )}
          </div>
        </div>

        {/* Add comment teaser */}
        <Link href={`/post/${post.id}`} className="flex items-center gap-2 px-4 pb-3">
          <span className="text-sm text-muted">أضف تعليقاً...</span>
        </Link>
      </motion.article>

      {/* Divider between posts */}
      <div className="h-2 bg-slate-50" />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        postId={post.id}
        postContent={post.content}
      />
      <ConfirmDialog />
    </>
  );
}
