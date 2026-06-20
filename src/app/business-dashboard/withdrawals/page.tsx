'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
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
  amount: number;
  currency: string;
  method: string;
  methodDetails: any;
  status: string;
  notes?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

const methodOptions = [
  { value: 'BANK', label: 'تحويل بنكي' },
  { value: 'CLIQ', label: 'كليك (Cliq)' },
  { value: 'PAYPAL', label: 'باي بال' },
];

const statusLabels: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
};

function formatMoney(amount: number | string, currency?: string) {
  const value = Number(amount || 0);
  const symbol = currency === 'USD' || !currency ? '$' : currency === 'SAR' ? 'ر.س' : currency;
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BusinessWithdrawalsPage() {
  const { showToast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/finance/wallet/withdraw?page=${currentPage}&limit=20`);
      if (!res.ok) throw new Error('فشل في تحميل السحوبات');
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
  }, []);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      showToast('أدخل مبلغاً صحيحاً', 'error');
      return;
    }
    if (!details.trim()) {
      showToast('أدخل تفاصيل الحساب', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/finance/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: value,
          currency: 'USD',
          method,
          methodDetails: { details },
        }),
      });
      if (!res.ok) throw new Error('فشل في إرسال الطلب');
      showToast('تم إرسال طلب السحب بنجاح', 'success');
      setModalOpen(false);
      setAmount('');
      setDetails('');
      setPage(1);
      fetchData(1);
    } catch (e) {
      showToast('حدث خطأ أثناء إرسال الطلب', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === 'REJECTED') return <XCircle className="w-4 h-4 text-danger" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Banknote className="w-6 h-6 text-primary" />
            السحوبات
          </h1>
          <p className="text-sm text-muted mt-1">طلب سحب أرباحك ومراجعة حالة الطلبات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => fetchData(page)}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            طلب سحب
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : withdrawals.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="لا توجد طلبات سحب"
            description="أرسل طلب سحب جديد لاستلام أرباحك."
            actionLabel="طلب سحب"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">الطريقة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">التفاصيل</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.map((w) => (
                  <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{formatMoney(w.amount, w.currency)}</td>
                    <td className="px-4 py-3 text-muted">{methodOptions.find((o) => o.value === w.method)?.label || w.method}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={w.status === 'APPROVED' ? 'success' : w.status === 'REJECTED' ? 'danger' : 'warning'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {statusIcon(w.status)}
                        {statusLabels[w.status] || w.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate">{w.methodDetails?.details || JSON.stringify(w.methodDetails)}</td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(w.createdAt)}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="طلب سحب جديد" size="sm">
        <div className="space-y-4">
          <Input
            label="المبلغ"
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <Select
            label="طريقة السحب"
            options={methodOptions}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          />
          <Input
            label="تفاصيل الحساب"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="مثال: رقم الآيبان / اسم الحساب / alias Cliq"
          />
          <p className="text-xs text-muted">سيتم مراجعة طلبك من قبل الإدارة وتنفيذه خلال 3-5 أيام عمل.</p>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" isLoading={submitting} onClick={handleSubmit}>
            إرسال الطلب
          </Button>
        </div>
      </Modal>
    </div>
  );
}
