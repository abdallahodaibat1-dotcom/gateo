'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  methodDetails: any;
  status: string;
  notes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; phone: string | null };
}

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING', label: 'معلقة' },
  { value: 'APPROVED', label: 'معتمدة' },
  { value: 'REJECTED', label: 'مرفوضة' },
];

const methodLabels: Record<string, string> = {
  BANK: 'تحويل بنكي',
  CLIQ: 'كليك',
  PAYPAL: 'باي بال',
};

function formatMoney(amount: number | string, currency?: string) {
  const value = Number(amount || 0);
  const symbol = currency === 'USD' || !currency ? '$' : currency === 'SAR' ? 'ر.س' : currency;
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminWithdrawalsPage() {
  const { showToast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/finance/withdrawals?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في تحميل طلبات السحب');
      const json = await res.json();
      setWithdrawals(json.withdrawals || []);
      setTotalPages(json.pagination?.pages || 1);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل طلبات السحب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openReview = (w: Withdrawal) => {
    setSelected(w);
    setReviewStatus('APPROVED');
    setNotes('');
    setReviewOpen(true);
  };

  const handleReview = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: selected.id, status: reviewStatus, notes }),
      });
      if (!res.ok) throw new Error('فشل في مراجعة الطلب');
      showToast(reviewStatus === 'APPROVED' ? 'تم اعتماد السحب' : 'تم رفض السحب', 'success');
      setReviewOpen(false);
      fetchData(page);
    } catch (e) {
      showToast('حدث خطأ أثناء المراجعة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = withdrawals.filter((w) => {
    const term = search.trim();
    if (!term) return true;
    const name = w.user.name || '';
    const email = w.user.email || '';
    return name.includes(term) || email.includes(term) || w.id.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Banknote className="w-6 h-6 text-primary" />
            طلبات السحب
          </h1>
          <p className="text-sm text-muted mt-1">مراجعة ومعالجة طلبات سحب الأرصدة</p>
        </div>
        <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => fetchData(page)}>
          تحديث
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالمستخدم" className="pr-10" />
          </div>
          <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Filter} title="لا توجد طلبات" description="لا توجد طلبات سحب مطابقة." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المستخدم</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">الطريقة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">تاريخ الطلب</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((w) => (
                  <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-foreground font-medium">{w.user.name || '—'}</div>
                      <div className="text-xs text-muted">{w.user.email || w.user.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatMoney(w.amount, w.currency)}</td>
                    <td className="px-4 py-3 text-muted">{methodLabels[w.method] || w.method}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          w.status === 'APPROVED' ? 'success' : w.status === 'REJECTED' ? 'danger' : 'warning'
                        }
                      >
                        {statusOptions.find((x) => x.value === w.status)?.label || w.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(w.createdAt)}</td>
                    <td className="px-4 py-3">
                      {w.status === 'PENDING' ? (
                        <Button size="sm" onClick={() => openReview(w)}>
                          مراجعة
                        </Button>
                      ) : (
                        <span className="text-xs text-muted">{formatDate(w.reviewedAt)}</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              السابق
            </Button>
            <span className="text-sm text-muted">
              صفحة {page} من {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              التالي
            </Button>
          </div>
        )}
      </Card>

      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="مراجعة طلب السحب" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
              <p>
                <span className="text-muted">المستخدم:</span>{' '}
                <span className="font-medium">{selected.user.name || '—'}</span>
              </p>
              <p>
                <span className="text-muted">المبلغ:</span>{' '}
                <span className="font-medium">{formatMoney(selected.amount, selected.currency)}</span>
              </p>
              <p>
                <span className="text-muted">الطريقة:</span>{' '}
                <span className="font-medium">{methodLabels[selected.method] || selected.method}</span>
              </p>
              <p>
                <span className="text-muted">التفاصيل:</span>{' '}
                <span className="font-medium">{JSON.stringify(selected.methodDetails)}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">القرار</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus('APPROVED')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    reviewStatus === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-surface border-border text-foreground hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  اعتماد
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus('REJECTED')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    reviewStatus === 'REJECTED'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-surface border-border text-foreground hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </button>
              </div>
            </div>
            <Input
              label="ملاحظات"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظات للمستخدم (اختياري)"
            />
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setReviewOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" isLoading={submitting} onClick={handleReview}>
            تأكيد
          </Button>
        </div>
      </Modal>
    </div>
  );
}
