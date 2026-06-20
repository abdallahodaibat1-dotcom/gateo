'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TicketPercent,
  RefreshCw,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value?: number | null;
  maxUses?: number | null;
  usedCount: number;
  minOrderAmount?: number | null;
  validFrom: string;
  validUntil?: string | null;
  isActive: boolean;
  _count?: { usages: number };
}

const typeOptions = [
  { value: 'PERCENTAGE', label: 'نسبة مئوية' },
  { value: 'FIXED', label: 'مبلغ ثابت' },
  { value: 'FREE_SHIPPING', label: 'شحن مجاني' },
  { value: 'FREE_ADS', label: 'إعلان مجاني' },
];

function formatMoney(amount?: number | null) {
  if (amount == null) return '—';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

function formatDate(date?: string | null) {
  if (!date) return 'غير محدد';
  return new Date(date).toLocaleDateString('ar-SA');
}

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    maxUses: '',
    minOrderAmount: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/finance/coupons');
      if (!res.ok) throw new Error('فشل في تحميل الكوبونات');
      const json = await res.json();
      setCoupons(json.coupons || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.code) {
      showToast('أدخل كود الكوبون', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: form.value ? Number(form.value) : null,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          validFrom: form.validFrom || new Date().toISOString(),
          validUntil: form.validUntil || null,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء الكوبون');
      showToast('تم إنشاء الكوبون بنجاح', 'success');
      setModalOpen(false);
      setForm({ code: '', type: 'PERCENTAGE', value: '', maxUses: '', minOrderAmount: '', validFrom: '', validUntil: '', isActive: true });
      fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء إنشاء الكوبون', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TicketPercent className="w-6 h-6 text-primary" />
            الكوبونات
          </h1>
          <p className="text-sm text-muted mt-1">إدارة أكواد الخصم والعروض</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            كوبون جديد
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : coupons.length === 0 ? (
        <EmptyState icon={TicketPercent} title="لا توجد كوبونات" description="أضف كوبون خصم جديد." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{c.code}</h3>
                    <p className="text-xs text-muted">{typeOptions.find((o) => o.value === c.type)?.label || c.type}</p>
                  </div>
                  <Badge variant={c.isActive ? 'success' : 'muted'}>{c.isActive ? 'نشط' : 'معطل'}</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted">القيمة: <span className="font-medium text-foreground">{c.type === 'PERCENTAGE' ? `${c.value}%` : formatMoney(c.value)}</span></p>
                  <p className="text-muted">الاستخدام: <span className="font-medium text-foreground">{c.usedCount} / {c.maxUses || '∞'}</span></p>
                  <p className="text-muted">الحد الأدنى للطلب: <span className="font-medium text-foreground">{formatMoney(c.minOrderAmount)}</span></p>
                  <p className="text-muted">صالح حتى: <span className="font-medium text-foreground">{formatDate(c.validUntil)}</span></p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="كوبون جديد" size="md">
        <div className="space-y-4">
          <Input label="الكود" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: SUMMER2025" />
          <Select label="النوع" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input label="القيمة" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0.00" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="أقصى عدد استخدام" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="اختياري" />
            <Input label="الحد الأدنى للطلب" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="اختياري" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="تاريخ البدء" type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
            <Input label="تاريخ الانتهاء" type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            نشط
          </label>
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
