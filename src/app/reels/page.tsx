'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/ui/EmptyState';
import { Loader2, Heart, MessageCircle, Bookmark, Share2, Volume2, VolumeX, Film, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Reel {
  id: string;
  content: string | null;
  video: string | null;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
  user: { id: string; name: string | null; avatar: string | null } | null;
  business: { id: string; name: string; logo: string | null } | null;
  _count: { likes: number; comments: number };
}

export default function ReelsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [mutedMap, setMutedMap] = useState<Record<string, boolean>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchReels = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10&type=REEL`);
      if (res.ok) {
        const data = await res.json();
        const newReels: Reel[] = data.posts || [];
        if (pageNum === 1) {
          setReels(newReels);
          if (newReels.length > 0) setActiveReelId(newReels[0].id);
        } else {
          setReels((prev) => [...prev, ...newReels]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);

        // Init maps
        const newLiked: Record<string, boolean> = {};
        const newLikeCount: Record<string, number> = {};
        const newMuted: Record<string, boolean> = {};
        newReels.forEach((r) => {
          newLiked[r.id] = r.isLiked;
          newLikeCount[r.id] = r._count.likes;
          newMuted[r.id] = true;
        });
        setLikedMap((prev) => ({ ...prev, ...newLiked }));
        setLikeCountMap((prev) => ({ ...prev, ...newLikeCount }));
        setMutedMap((prev) => ({ ...prev, ...newMuted }));
      }
    } catch (e) {
      console.error('Failed to fetch reels:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  // Intersection observer to auto-play visible reel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const reelId = entry.target.getAttribute('data-reel-id');
          if (!reelId) return;
          const video = entry.target.querySelector('video') as HTMLVideoElement;
          if (entry.isIntersecting) {
            setActiveReelId(reelId);
            video?.play().catch(() => {});
          } else {
            video?.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    const items = document.querySelectorAll('[data-reel-id]');
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [reels]);

  const handleLike = async (reelId: string) => {
    try {
      const res = await fetch(`/api/posts/${reelId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikedMap((prev) => ({ ...prev, [reelId]: data.liked }));
        setLikeCountMap((prev) => ({
          ...prev,
          [reelId]: data.liked ? (prev[reelId] || 0) + 1 : Math.max(0, (prev[reelId] || 0) - 1),
        }));
      }
    } catch {}
  };

  const toggleMute = (reelId: string) => {
    setMutedMap((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReels(nextPage);
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
      <main className="pt-16 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto px-4">
          {reels.map((reel) => {
            const author = reel.user || reel.business;
            const isActive = activeReelId === reel.id;
            const liked = likedMap[reel.id];
            const likeCount = likeCountMap[reel.id] || 0;
            const muted = mutedMap[reel.id] !== false;

            return (
              <motion.div
                key={reel.id}
                data-reel-id={reel.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full aspect-[9/16] max-h-[85vh] rounded-lg border border-border shadow-sm overflow-hidden bg-black mb-4"
              >
                {/* Video */}
                {reel.video && (
                  <video
                    src={reel.video}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={muted}
                    preload="metadata"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                  <h1 className="text-white font-bold text-lg drop-shadow">الريلز</h1>
                  <button
                    onClick={() => toggleMute(reel.id)}
                    aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
                    className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                  >
                    {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Right actions */}
                <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
                  <button
                    onClick={() => handleLike(reel.id)}
                    aria-label={liked ? 'إلغاء الإعجاب' : 'إعجاب'}
                    className="flex flex-col items-center gap-1"
                  >
                    <Heart
                      className={`w-8 h-8 transition-colors ${
                        liked ? 'text-red-500 fill-current' : 'text-white'
                      }`}
                    />
                    <span className="text-white text-xs font-medium drop-shadow">
                      {likeCount > 0 ? likeCount : ''}
                    </span>
                  </button>
                  <button
                    aria-label="التعليقات"
                    className="flex flex-col items-center gap-1"
                  >
                    <MessageCircle className="w-8 h-8 text-white" />
                  </button>
                  <button
                    aria-label="حفظ"
                    className="flex flex-col items-center gap-1"
                  >
                    <Bookmark className="w-7 h-7 text-white" />
                  </button>
                  <button
                    aria-label="مشاركة"
                    className="flex flex-col items-center gap-1"
                  >
                    <Share2 className="w-7 h-7 text-white" />
                  </button>
                </div>

                {/* Bottom info */}
                <div className="absolute left-0 right-16 bottom-4 px-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={(reel.user?.avatar || reel.business?.logo || '/logo/favicon.svg')}
                      alt=""
                      className="w-10 h-10 rounded-full border border-white/50 object-cover"
                    />
                    <span className="text-white font-medium text-sm drop-shadow">
                      {author?.name || 'مستخدم'}
                    </span>
                  </div>
                  {reel.content && (
                    <p className="text-white text-sm leading-relaxed drop-shadow line-clamp-3">
                      {reel.content}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Load more */}
          {hasMore && reels.length > 0 && (
            <div className="flex justify-center py-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-md bg-surface border border-border text-foreground font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحميل المزيد'}
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && reels.length === 0 && (
            <div className="pt-8">
              <EmptyState
                icon={Film}
                title="لا توجد ريلز بعد"
                description="كني أول من ينشر ريل"
                actionLabel="إنشاء ريل"
                onAction={() => router.push('/create-post')}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
