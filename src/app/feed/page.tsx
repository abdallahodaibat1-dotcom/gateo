'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UpgradePrompt from '@/components/UpgradePrompt';
import PostCard from '@/components/PostCard';
import StoriesBar from '@/components/StoriesBar';
import FeedProfileSidebar from '@/components/FeedLeftSidebar';
import FeedNewsSidebar from '@/components/FeedRightSidebar';
import AdBanner from '@/components/AdBanner';
import AdSidebar from '@/components/AdSidebar';
import FeedAdCard from '@/components/FeedAdCard';
import { EmptyState, Skeleton } from '@/components/ui';
import { Loader2, Image as ImageIcon, Video, CalendarDays, Film, Inbox } from 'lucide-react';

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
  _count: { likes: number; comments: number; views: number; shares: number };
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
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
      <main className="pt-20 lg:pt-24 pb-10 min-h-screen bg-slate-50">
        <UpgradePrompt />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
              <div className="sticky top-24">
                <FeedNewsSidebar />
              </div>
            </div>

            {/* Center Feed */}
            <div className="lg:col-span-6 xl:col-span-6">
              {/* Hero Ad */}
              <AdBanner />

              {/* Create Post */}
              <div className="bg-surface rounded-lg border border-border shadow-sm p-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={session?.user?.image || '/logo/favicon.svg'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex-1 text-right px-4 py-2.5 rounded-md border border-border text-muted text-sm hover:bg-slate-50 transition-colors"
                  >
                    ابدأ منشوراً...
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-primary" />
                    صورة
                  </button>
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <Video className="w-4 h-4 text-primary" />
                    فيديو
                  </button>
                  <button
                    onClick={() => router.push('/create-post?type=reel')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <Film className="w-4 h-4 text-primary" />
                    ريل
                  </button>
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <CalendarDays className="w-4 h-4 text-primary" />
                    حدث
                  </button>
                </div>
              </div>

              {/* Stories */}
              <div className="mb-4 bg-surface rounded-lg border border-border shadow-sm">
                <StoriesBar />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted">المنشورات</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {loading && posts.length === 0 && (
                  <div className="bg-surface rounded-lg border border-border shadow-sm p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton circle className="w-10 h-10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-20 h-3" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-40" />
                    <div className="flex gap-3">
                      <Skeleton className="w-20 h-8" />
                      <Skeleton className="w-20 h-8" />
                      <Skeleton className="w-20 h-8" />
                    </div>
                  </div>
                )}
                {posts.map((post, index) => (
                  <div key={post.id}>
                    <PostCard
                      post={post}
                      currentUserId={session?.user?.id}
                      onDelete={handleDelete}
                    />
                    {index === 2 && <FeedAdCard key="ad-1" />}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {!loading && posts.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  title="لا توجد منشورات بعد"
                  description="ابدأ بمتابعة مستخدمين أو أنشئ أول منشور"
                  actionLabel="إنشاء منشور"
                  onAction={() => router.push('/create-post')}
                />
              )}

              {/* Load More */}
              {hasMore && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-md bg-surface border border-border text-foreground font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
              <div className="sticky top-24 space-y-4">
                <AdSidebar />
                <FeedProfileSidebar />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
