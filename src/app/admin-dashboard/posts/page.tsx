'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  Eye,
  FileText,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Post {
  id: string;
  content: string | null;
  images: any;
  video: string | null;
  isPublic: boolean;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null } | null;
  business: { id: string; name: string | null; logo: string | null } | null;
  _count: { comments: number; likes: number };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (searchUser) params.set('userId', searchUser);
      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل المنشورات');
    } finally {
      setLoading(false);
    }
  }, [page, searchUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const authorName = (post: Post) => post.user?.name || post.business?.name || 'مستخدم';
  const authorAvatar = (post: Post) => post.user?.avatar || post.business?.logo || '/logo/favicon.svg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المنشورات</h1>
          <p className="text-muted text-sm mt-1">إدارة ومراقبة محتوى المنصة</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            id="searchUser"
            type="text"
            placeholder="معرف المستخدم (userId)..."
            value={searchUser}
            onChange={(e) => { setSearchUser(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={authorAvatar(post)} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                  <div>
                    <div className="font-medium text-sm text-foreground">{authorName(post)}</div>
                    <div className="text-xs text-muted">{formatDate(post.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/post/${post.id}`}
                    target="_blank"
                    aria-label="عرض"
                    className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(post.id)}
                    aria-label="حذف"
                    className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {post.content && (
                <p className="mt-3 text-sm text-foreground leading-relaxed line-clamp-3">{post.content}</p>
              )}

              {Array.isArray(post.images) && post.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {post.images.slice(0, 3).map((img: string, i: number) => (
                    <img key={i} src={img} alt="محتوى المنشور" className="w-full h-20 object-cover rounded-md" />
                  ))}
                </div>
              )}

              {post.video && (
                <div className="mt-3 text-xs text-primary bg-primary/10 rounded-md px-3 py-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  يحتوي على فيديو
                </div>
              )}

              <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                <span>{post._count.likes} إعجاب</span>
                <span>{post._count.comments} تعليق</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.isPublic ? 'bg-success/10 text-success' : 'bg-slate-100 text-foreground'}`}>
                  {post.isPublic ? 'عام' : 'خاص'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton circle className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <EmptyState
          icon={FileText}
          title="لا توجد منشورات"
          description="لا توجد منشورات مطابقة للبحث."
        />
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="الصفحة السابقة"
            className="p-2 rounded-md border border-border bg-surface hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted px-3">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="الصفحة التالية"
            className="p-2 rounded-md border border-border bg-surface hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف المنشور"
        message="هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
