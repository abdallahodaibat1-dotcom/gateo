'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Heart, MessageCircle, Eye, Loader2, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

interface Post {
  id: string;
  content: string | null;
  images: any;
  video: string | null;
  createdAt: string;
  _count: { likes: number; comments: number; views: number; shares: number };
}

interface Business {
  id: string;
  posts: Post[];
}

export default function BusinessPostsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/businesses/my');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data.business);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذا المنشور؟' });
    if (!ok) return;
    setDeletingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setBusiness((prev) =>
          prev ? { ...prev, posts: prev.posts.filter((p) => p.id !== postId) } : null
        );
      } else {
        showToast('فشل في حذف المنشور', 'error');
      }
    } catch (e) {
      showToast('فشل في حذف المنشور', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getPostImage = (post: Post) => {
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-28 h-10 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
              <Skeleton className="w-full aspect-square" />
              <div className="p-4 space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-foreground">المنشورات ({business.posts.length})</h2>
        <Link
          href="/create-post"
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          منشور جديد
        </Link>
      </div>

      {business.posts.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
          <EmptyState
            icon={FileText}
            title="لا توجد منشورات"
            description="شارك محتوى يجذب عملائك ويزيد من تفاعلهم"
          />
          <div className="flex justify-center mt-4">
            <Link
              href="/create-post"
              className="px-6 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              أول منشور
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {business.posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden group"
            >
              <Link href={`/post/${post.id}`} className="block">
                {getPostImage(post) ? (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getPostImage(post)!}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : post.video ? (
                  <div className="aspect-square bg-gray-900 flex items-center justify-center">
                    <video src={post.video} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-50 flex items-center justify-center p-6">
                    <p className="text-sm text-muted text-center line-clamp-4">{post.content}</p>
                  </div>
                )}
              </Link>
              <div className="p-4">
                <p className="text-sm text-foreground line-clamp-2 mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      {post._count.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                      {post._count.comments}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label="حذف المنشور"
                      title="حذف"
                    >
                      {deletingId === post.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
