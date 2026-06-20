'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ChevronRight, ChevronLeft, Filter } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

const actionLabels: Record<string, string> = {
  ADMIN_LOGIN: 'تسجيل دخول',
  ADMIN_LOGOUT: 'تسجيل خروج',
  BUSINESS_APPROVED: 'اعتماد عمل',
  BUSINESS_REJECTED: 'رفض عمل',
  BUSINESS_DELETED: 'حذف عمل',
  BUSINESS_UPDATED: 'تحديث عمل',
  USER_SUSPENDED: 'تعليق مستخدم',
  USER_ACTIVATED: 'تفعيل مستخدم',
  USER_DELETED: 'حذف مستخدم',
  USER_UPDATED: 'تحديث مستخدم',
  POST_DELETED: 'حذف منشور',
  POST_HIDDEN: 'إخفاء منشور',
  REPORT_RESOLVED: 'حل بلاغ',
  REPORT_DISMISSED: 'رفض بلاغ',
  SETTINGS_UPDATED: 'تحديث إعدادات',
  CATEGORY_CREATED: 'إنشاء فئة',
  CATEGORY_UPDATED: 'تحديث فئة',
  CATEGORY_DELETED: 'حذف فئة',
};

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { id: string; name: string | null; email: string; avatar: string | null };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (actionFilter) params.set('action', actionFilter);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في تحميل السجل');
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch {
      setError('حدث خطأ أثناء تحميل سجل المراجعة');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, from, to]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="actionFilter" className="text-xs font-bold text-muted flex items-center gap-1">
              <Filter className="w-3 h-3" />
              الإجراء
            </label>
            <select
              id="actionFilter"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-w-[180px]"
            >
              <option value="">كل الإجراءات</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="from" className="text-xs font-bold text-muted">من</label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="to" className="text-xs font-bold text-muted">إلى</label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 mr-auto"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-right font-bold text-muted">التاريخ</th>
                <th className="px-4 py-3 text-right font-bold text-muted">المشرف</th>
                <th className="px-4 py-3 text-right font-bold text-muted">الإجراء</th>
                <th className="px-4 py-3 text-right font-bold text-muted">الكيان</th>
                <th className="px-4 py-3 text-right font-bold text-muted">IP</th>
                <th className="px-4 py-3 text-right font-bold text-muted">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {log.admin.name?.charAt(0) || log.admin.email?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{log.admin.name || 'مشرف'}</p>
                        <p className="text-xs text-muted">{log.admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {log.entityType ? `${log.entityType}${log.entityId ? ` / ${log.entityId.slice(-8)}` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted font-mono text-xs" dir="ltr">{log.ipAddress || '—'}</td>
                  <td className="px-4 py-3 text-muted max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                </motion.tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <EmptyState
                      icon={AlertCircle}
                      title="لا توجد سجلات مراجعة"
                      description="لا توجد سجلات مطابقة للفلاتر المحددة."
                    />
                  </td>
                </tr>
              )}
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
      </div>

      {totalPages > 1 && (
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
    </div>
  );
}
