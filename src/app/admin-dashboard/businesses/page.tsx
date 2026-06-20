'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  ChevronRight,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  name: string | null;
  status: string;
  isVerified: boolean;
  city: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null };
  category: { id: string; name: string | null };
  _count: { services: number; reviews: number; bookings: number; posts: number };
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [verifyLoadingId, setVerifyLoadingId] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('q', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/businesses?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBusinesses(data.businesses);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الأعمال');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setBusinesses((prev) => prev.filter((b) => b.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  const handleVerify = async (id: string, verify: boolean) => {
    setVerifyLoadingId(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verify, status: verify ? 'ACTIVE' : 'PENDING' }),
      });
      if (res.ok) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === id ? { ...b, isVerified: verify, status: verify ? 'ACTIVE' : 'PENDING' } : b))
        );
      }
    } catch (e) {}
    setVerifyLoadingId(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الأعمال التجارية</h1>
          <p className="text-muted text-sm mt-1">مراجعة وتوثيق حسابات الأعمال</p>
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
            id="search"
            type="text"
            placeholder="البحث بالاسم أو المدينة..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">كل الحالات</option>
          <option value="PENDING">بانتظار المراجعة</option>
          <option value="ACTIVE">نشط</option>
          <option value="REJECTED">مرفوض</option>
          <option value="SUSPENDED">موقوف</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold text-foreground">العمل التجاري</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">المالك</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الخدمات</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الحجوزات</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {businesses.map((biz) => (
                <motion.tr
                  key={biz.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{biz.name || 'عمل تجاري'}</div>
                        <div className="text-xs text-muted">{biz.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={biz.status} />
                      {biz.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          موثق
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground text-sm">{biz.user?.name || '—'}</div>
                    <div className="text-xs text-muted">{biz.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{biz._count.services}</td>
                  <td className="px-4 py-3 text-muted">{biz._count.bookings}</td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(biz.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/business/${biz.id}`}
                        target="_blank"
                        aria-label="عرض"
                        className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {verifyLoadingId === biz.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : !biz.isVerified ? (
                        <button
                          onClick={() => handleVerify(biz.id, true)}
                          aria-label="توثيق"
                          className="p-1.5 rounded-md text-muted hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(biz.id, false)}
                          aria-label="إلغاء التوثيق"
                          className="p-1.5 rounded-md text-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(biz.id)}
                        aria-label="حذف"
                        className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && businesses.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={Building2}
              title="لا توجد نتائج"
              description="لا توجد أعمال تجارية مطابقة للبحث."
            />
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="الصفحة السابقة"
              className="p-2 rounded-md border border-border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
              className="p-2 rounded-md border border-border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف العمل التجاري"
        message="هل أنت متأكد من حذف هذا العمل التجاري؟ سيتم حذف جميع البيانات المرتبطة به."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
