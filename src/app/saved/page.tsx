'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { EmptyState, Skeleton } from '@/components/ui';
import { Loader2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

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
  savedAt: string;
}

export default function SavedPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchSavedPosts();
    }
  }, [status]);

  const fetchSavedPosts = async () => {
    try {
      const res = await fetch('/api/saved-posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4">
            <div className="p-4 flex items-center gap-3 border-b border-border">
              <Bookmark className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-bold text-foreground">المنشورات المحفوظة</h1>
            </div>
          </div>

          {loading ? (
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
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState
                icon={Bookmark}
                title="لا توجد منشورات محفوظة"
                description="احفظي المنشورات التي تعجبك للرجوع إليها لاحقاً"
              />
            </motion.div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={session?.user?.id}
                  onSave={handleUnsave}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
