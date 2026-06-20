'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface StoryItem {
  id: string;
  mediaUrl: string;
  type: 'IMAGE' | 'VIDEO';
  duration: number;
  createdAt: string;
  isViewed: boolean;
}

interface StoryGroup {
  user: { id: string; name: string | null; avatar: string | null };
  stories: StoryItem[];
  hasUnviewed: boolean;
}

const STORY_DURATION = 5000; // 5 seconds for images

export default function StoriesPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
        <Skeleton className="w-full max-w-md h-[80vh] rounded-lg" />
      </div>
    }>
      <StoriesViewer />
    </Suspense>
  );
}

function StoriesViewer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const progressRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((data) => {
        const storyGroups: StoryGroup[] = data.stories || [];
        setGroups(storyGroups);
        setLoading(false);

        if (targetUserId) {
          const idx = storyGroups.findIndex((g) => g.user.id === targetUserId);
          if (idx !== -1) setCurrentGroupIndex(idx);
        }
      })
      .catch(() => setLoading(false));
  }, [targetUserId]);

  const currentGroup = groups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  const markViewed = useCallback(async (storyId: string) => {
    try {
      await fetch(`/api/stories/${storyId}/view`, { method: 'PUT' });
    } catch {}
  }, []);

  const goNext = useCallback(() => {
    if (!currentGroup) return;
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex((i) => i + 1);
      setProgress(0);
      progressRef.current = 0;
    } else if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((i) => i + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
      progressRef.current = 0;
    } else {
      router.push('/feed');
    }
  }, [currentGroup, currentStoryIndex, currentGroupIndex, groups.length, router]);

  const goPrev = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((i) => i - 1);
      setProgress(0);
      progressRef.current = 0;
    } else if (currentGroupIndex > 0) {
      const prevGroup = groups[currentGroupIndex - 1];
      setCurrentGroupIndex((i) => i - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
      progressRef.current = 0;
    }
  }, [currentStoryIndex, currentGroupIndex, groups]);

  // Progress animation
  useEffect(() => {
    if (!currentStory || paused) return;

    const duration = currentStory.type === 'VIDEO' && videoRef.current
      ? videoRef.current.duration * 1000
      : STORY_DURATION;

    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      progressRef.current += delta;
      const pct = Math.min((progressRef.current / duration) * 100, 100);
      setProgress(pct);

      if (progressRef.current >= duration) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentStory, paused, goNext]);

  // Mark as viewed when story changes
  useEffect(() => {
    if (currentStory && !currentStory.isViewed) {
      markViewed(currentStory.id);
    }
  }, [currentStory, markViewed]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') router.push('/feed');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
        <Skeleton className="w-full max-w-md h-[80vh] rounded-lg" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4">
        <EmptyState
          icon={Film}
          title="لا توجد قصص حالياً"
          description="يمكنك العودة إلى الخلاصة لاستكشاف المحتوى."
          actionLabel="العودة للخلاصة"
          onAction={() => router.push('/feed')}
          className="w-full max-w-sm bg-surface border-border"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        type="button"
        onClick={() => router.push('/feed')}
        aria-label="إغلاق القصص"
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <AnimatePresence mode="wait">
        {currentGroup && currentStory && (
          <motion.div
            key={`${currentGroup.user.id}-${currentStory.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full max-w-md mx-auto"
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3">
              {currentGroup.stories.map((s, i) => (
                <div key={s.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{
                      width: i < currentStoryIndex ? '100%' : i === currentStoryIndex ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* User info */}
            <div className="absolute top-6 left-0 right-0 z-20 flex items-center gap-3 px-4">
              <img
                src={currentGroup.user.avatar || '/logo/favicon.svg'}
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white/50 object-cover"
              />
              <span className="text-white font-medium text-sm drop-shadow">
                {currentGroup.user.name || 'مستخدم'}
              </span>
              <span className="text-white/60 text-xs mr-auto drop-shadow">
                {new Date(currentStory.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>

            {/* Media */}
            <div className="w-full h-full flex items-center justify-center">
              {currentStory.type === 'VIDEO' ? (
                <video
                  ref={videoRef}
                  src={currentStory.mediaUrl}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted={false}
                  onEnded={goNext}
                />
              ) : (
                <img
                  src={currentStory.mediaUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Tap zones */}
            <div className="absolute inset-0 z-10 flex">
              <div className="flex-1" onClick={goPrev} />
              <div className="flex-1" onClick={goNext} />
            </div>

            {/* Navigation arrows (visible on desktop) */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="القصة السابقة"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="القصة التالية"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
