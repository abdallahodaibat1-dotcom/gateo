'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Plus,
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
import { useCurrency } from '@/hooks/useCurrency';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  referenceType?: string | null;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string;
  account: {
    id: string;
    type: string;
    currency: string;
    user: { id: string; name: string | null; email: string | null };
  };
}

const transactionTypes = [
  { value: '', label: 'كل الأنواع' },
  { value: 'DEPOSIT', label: 'إيداع' },
  { value: 'WITHDRAWAL', label: 'سحب' },
  { value: 'TRANSFER', label: 'تحويل' },
  { value: 'HOLD', label: 'تجميد' },
  { value: 'RELEASE', label: 'إ release' },
  { value: 'REFUND', label: 'استرداد' },
  { value: 'COMMISSION', label: 'عمولة' },
  { value: 'FEE', label: 'رسوم' },
  { value: 'REWARD', label: 'مكافأة' },
];

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'FAILED', label: 'فاشل' },
  { value: 'REVERSED', label: 'مستعاد' },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminTransactionsPage() {
  const { showToast } = useToast();
  const { format, convert } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    type: 'DEPOSIT',
    amount: '',
    currency: 'USD',
    referenceType: '',
    referenceId: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '20');
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/finance/transactions?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في تحميل العمليات');
      const json = await res.json();
      setTransactions(json.transactions || []);
      setTotalPages(json.pagination?.pages || 1);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل العمليات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSubmit = async () => {
    const amount = Number(form.amount);
    if (!form.userId || !amount || amount <= 0) {
      showToast('أدخل بيانات صحيحة', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          type: form.type,
          amount,
          currency: form.currency,
          referenceType: form.referenceType || undefined,
          referenceId: form.referenceId || undefined,
          description: form.description || undefined,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء العملية');
      showToast('تم إنشاء العملية بنجاح', 'success');
      setModalOpen(false);
      setForm({ userId: '', type: 'DEPOSIT', amount: '', currency: 'USD', referenceType: '', referenceId: '', description: '' });
      fetchData(page);
    } catch (e) {
      showToast('حدث خطأ أثناء إنشاء العملية', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = transactions.filter((t) => {
    const term = search.trim();
    if (!term) return true;
    const userName = t.account.user.name || '';
    const userEmail = t.account.user.email || '';
    return userName.includes(term) || userEmail.includes(term) || t.id.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">العمليات المالية</h1>
          <p className="text-sm text-muted mt-1">مراجعة وإدارة العمليات المالية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => fetchData(page)}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            معاملة يدوية
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
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالمستخدم أو الرقم التعريفي"
              className="pr-10"
            />
          </div>
          <div className="flex gap-2">
            <Select options={transactionTypes} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Filter} title="لا توجد عمليات" description="لا توجد عمليات مالية مطابقة للبحث." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المستخدم</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">النوع</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المرجع</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-foreground font-medium">{t.account.user.name || '—'}</div>
                      <div className="text-xs text-muted">{t.account.user.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.type === 'DEPOSIT' ? <ArrowDownLeft className="w-4 h-4 text-success" /> : <ArrowUpRight className="w-4 h-4 text-danger" />}
                        <span>{transactionTypes.find((x) => x.value === t.type)?.label || t.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{format(convert(t.amount))}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status === 'COMPLETED' ? 'success' : t.status === 'FAILED' ? 'danger' : t.status === 'PENDING' ? 'warning' : 'muted'}>
                        {statusOptions.find((x) => x.value === t.status)?.label || t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.referenceType ? `${t.referenceType} • ${t.referenceId?.slice(0, 8)}` : '—'}</td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(t.createdAt)}</td>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="معاملة يدوية" size="md">
        <div className="space-y-4">
          <Input label="معرف المستخدم" value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="usr_..." />
          <Select label="نوع العملية" options={transactionTypes.filter((o) => o.value)} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="المبلغ" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            <Input label="العملة" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="نوع المرجع" value={form.referenceType} onChange={(e) => setForm({ ...form, referenceType: e.target.value })} placeholder="مثال: BOOKING" />
            <Input label="رقم المرجع" value={form.referenceId} onChange={(e) => setForm({ ...form, referenceId: e.target.value })} placeholder="id" />
          </div>
          <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف المعاملة" />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" isLoading={submitting} onClick={handleSubmit}>
            حفظ
          </Button>
        </div>
      </Modal>
    </div>
  );
}
