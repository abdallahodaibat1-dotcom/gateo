'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Trash2,
  MessageCircle,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isPublic: boolean;
  category: string | null;
  createdAt: string;
  _count: { members: number; posts: number };
}

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await fetch(`/api/admin/groups?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setGroups(data.groups);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل المجموعات');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/groups/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المجموعات</h1>
          <p className="text-muted text-sm mt-1">إدارة مجموعات المنصة</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="h-24 bg-gradient-to-br from-primary/80 to-primary" />
            <div className="px-4 pb-4">
              <div className="relative -mt-8 mb-3">
                <img
                  src={group.image || '/logo/favicon.svg'}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border-4 border-surface shadow-lg bg-surface"
                />
              </div>
              <h3 className="font-bold text-foreground">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-muted mt-1 line-clamp-2">{group.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {group._count.members} عضو
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {group._count.posts} منشور
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <StatusBadge status={group.isPublic} label={group.isPublic ? 'عامة' : 'خاصة'} />
                <div className="flex items-center gap-1">
                  <Link
                    href={`/groups/${group.id}`}
                    target="_blank"
                    aria-label="عرض"
                    className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(group.id)}
                    aria-label="حذف"
                    className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
              <Skeleton className="h-24 w-full" />
              <div className="px-4 pb-4 pt-10 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && groups.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="لا توجد مجموعات"
          description="لم يتم إنشاء أي مجموعات بعد."
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
        title="حذف المجموعة"
        message="هل أنت متأكد من حذف هذه المجموعة؟ سيتم حذف جميع المنشورات والأعضاء المرتبطين."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
