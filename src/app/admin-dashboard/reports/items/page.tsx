'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Trash2,
  Flag,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Report {
  id: string;
  type: string;
  reason: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; name: string | null; email: string | null; avatar: string | null };
  reported: { id: string; name: string | null; email: string | null; avatar: string | null };
}

const typeLabels: Record<string, string> = {
  POST: 'منشور',
  USER: 'مستخدم',
  BUSINESS: 'عمل تجاري',
  COMMENT: 'تعليق',
  MESSAGE: 'رسالة',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resolveLoadingId, setResolveLoadingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setReports(data.reports);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البلاغات');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  const handleStatus = async (id: string, status: string) => {
    setResolveLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      }
    } catch (e) {}
    setResolveLoadingId(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">البلاغات</h1>
          <p className="text-muted text-sm mt-1">مراجعة البلاغات ومعالجتها</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">كل الحالات</option>
          <option value="PENDING">معلق</option>
          <option value="REVIEWING">قيد المراجعة</option>
          <option value="RESOLVED">تم الحل</option>
          <option value="DISMISSED">مرفوض</option>
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">
                      بلاغ {typeLabels[report.type] || report.type}
                    </div>
                    <div className="text-xs text-muted">{formatDate(report.createdAt)}</div>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted w-16">المدّعي:</span>
                  <div className="flex items-center gap-2">
                    <img src={report.reporter?.avatar || '/logo/favicon.svg'} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-sm text-foreground">{report.reporter?.name || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted w-16">المبلّغ عنه:</span>
                  <div className="flex items-center gap-2">
                    <img src={report.reported?.avatar || '/logo/favicon.svg'} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-sm text-foreground">{report.reported?.name || '—'}</span>
                  </div>
                </div>
                {report.reason && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-foreground">
                    {report.reason}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {resolveLoadingId === report.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <>
                    {report.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleStatus(report.id, 'RESOLVED')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        حل البلاغ
                      </button>
                    )}
                    {report.status !== 'DISMISSED' && (
                      <button
                        onClick={() => handleStatus(report.id, 'DISMISSED')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-foreground hover:bg-slate-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        رفض
                      </button>
                    )}
                    {report.status !== 'REVIEWING' && report.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleStatus(report.id, 'REVIEWING')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        مراجعة
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setDeleteId(report.id)}
                  aria-label="حذف"
                  className="mr-auto p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                <Skeleton circle className="w-9 h-9" />
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

      {!loading && reports.length === 0 && (
        <EmptyState
          icon={Flag}
          title="لا توجد بلاغات"
          description="لا توجد بلاغات مطابقة للفلتر المحدد."
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
        title="حذف البلاغ"
        message="هل أنت متأكد من حذف هذا البلاغ؟"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
