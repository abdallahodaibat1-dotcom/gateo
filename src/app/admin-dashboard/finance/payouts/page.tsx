'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';

interface Commission {
  id: string;
  amount: number;
  currency: string;
  referenceType: string;
  referenceId: string;
  status: string;
  description?: string | null;
  createdAt: string;
  rule: { id: string; name: string };
  business?: { id: string; name: string; logo: string | null } | null;
  user?: { id: string; name: string | null; email: string | null } | null;
}

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'PENDING', label: 'مستحقة' },
  { value: 'DEDUCTED', label: 'مخصومة' },
  { value: 'PAID', label: 'مدفوعة' },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminPayoutsPage() {
  const { showToast } = useToast();
  const { format, convert } = useCurrency();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusTotals, setStatusTotals] = useState<{ status: string; total: number }[]>([]);

  const fetchData = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/finance/payouts?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في تحميل المدفوعات');
      const json = await res.json();
      setCommissions(json.commissions || []);
      setStatusTotals(json.statusTotals || []);
      setTotalPages(json.pagination?.pages || 1);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل المدفوعات');
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

  const handlePay = async (commissionId: string) => {
    try {
      const res = await fetch('/api/admin/finance/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionId }),
      });
      if (!res.ok) throw new Error('فشل في تسديد العمولة');
      showToast('تم تسديد العمولة بنجاح', 'success');
      fetchData(page);
    } catch (e) {
      showToast('حدث خطأ أثناء التسديد', 'error');
    }
  };

  const filtered = commissions.filter((c) => {
    const term = search.trim();
    if (!term) return true;
    const name = c.business?.name || c.user?.name || '';
    const email = c.user?.email || '';
    return name.includes(term) || email.includes(term) || c.id.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            المدفوعات للأعمال
          </h1>
          <p className="text-sm text-muted mt-1">تتبع عمولات الأعمال والمدفوعات المستحقة</p>
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

      <div className="grid md:grid-cols-3 gap-4">
        {statusTotals.map((s, i) => (
          <motion.div key={s.status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
            <Card>
              <p className="text-sm text-muted">{statusOptions.find((o) => o.value === s.status)?.label || s.status}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{format(convert(s.total))}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالنشاط أو المستخدم" className="pr-10" />
          </div>
          <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Filter} title="لا توجد عمولات" description="لا توجد عمولات مطابقة للبحث." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="text-right px-4 py-3 font-semibold text-foreground">النشاط / المستخدم</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">القاعدة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المرجع</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">التاريخ</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-foreground font-medium">{c.business?.name || c.user?.name || '—'}</div>
                      <div className="text-xs text-muted">{c.user?.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{format(convert(c.amount))}</td>
                    <td className="px-4 py-3 text-muted">{c.rule.name}</td>
                    <td className="px-4 py-3 text-muted">{c.referenceType} • {c.referenceId.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === 'PAID' ? 'success' : c.status === 'DEDUCTED' ? 'warning' : 'muted'}>
                        {statusOptions.find((o) => o.value === c.status)?.label || c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      {c.status !== 'PAID' ? (
                        <Button size="sm" leftIcon={<CheckCircle className="w-3.5 h-3.5" />} onClick={() => handlePay(c.id)}>
                          تسديد
                        </Button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
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
    </div>
  );
}
