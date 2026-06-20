'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Trash2,
  Star,
  MessageSquareQuote,
  ChevronRight,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
  business: { id: string; name: string | null; logo: string | null };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setReviews(data.reviews);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">التقييمات</h1>
          <p className="text-muted text-sm mt-1">إدارة تقييمات المستخدمين</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.user?.avatar || '/logo/favicon.svg'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <div className="font-medium text-sm text-foreground">{review.user?.name || 'مستخدم'}</div>
                    <div className="text-xs text-muted">{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/business/${review.business?.id}`}
                    target="_blank"
                    aria-label="عرض العمل التجاري"
                    className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(review.id)}
                    aria-label="حذف"
                    className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground">{review.rating}/5</span>
              </div>

              {review.comment && (
                <p className="mt-3 text-sm text-foreground leading-relaxed bg-slate-50 rounded-lg p-3">
                  {review.comment}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>على</span>
                <span className="font-medium text-foreground">{review.business?.name || 'عمل تجاري'}</span>
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

      {!loading && reviews.length === 0 && (
        <EmptyState
          icon={Star}
          title="لا توجد تقييمات"
          description="لم يتم إضافة أي تقييمات بعد."
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
        title="حذف التقييم"
        message="هل أنت متأكد من حذف هذا التقييم؟"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
