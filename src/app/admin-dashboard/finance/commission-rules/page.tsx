'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Percent,
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

interface Category {
  id: string;
  name: string;
}

interface CommissionRule {
  id: string;
  name: string;
  appliesTo: string;
  type: string;
  value: number;
  minAmount?: number | null;
  maxAmount?: number | null;
  isActive: boolean;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  _count?: { commissions: number };
}

const appliesToOptions = [
  { value: 'bookings', label: 'الحجوزات' },
  { value: 'marketplace', label: 'المتجر' },
  { value: 'services', label: 'الخدمات' },
  { value: 'ads', label: 'الإعلانات' },
  { value: 'all', label: 'الكل' },
];

const typeOptions = [
  { value: 'PERCENTAGE', label: 'نسبة مئوية' },
  { value: 'FIXED', label: 'مبلغ ثابت' },
  { value: 'TIERED', label: 'متدرج' },
];

function formatMoney(amount?: number | null) {
  if (amount == null) return '—';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

export default function AdminCommissionRulesPage() {
  const { showToast } = useToast();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    appliesTo: 'bookings',
    categoryId: '',
    subcategoryId: '',
    type: 'PERCENTAGE',
    value: '',
    minAmount: '',
    maxAmount: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rulesRes, catsRes] = await Promise.all([
        fetch('/api/admin/finance/commission-rules'),
        fetch('/api/categories'),
      ]);
      if (!rulesRes.ok) throw new Error('فشل في تحميل القواعد');
      const rulesJson = await rulesRes.json();
      const catsJson = await catsRes.json();
      setRules(rulesJson.rules || []);
      setCategories(catsJson.categories || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const value = Number(form.value);
    if (!form.name || !value || value < 0) {
      showToast('أدخل بيانات صحيحة', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/commission-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          appliesTo: form.appliesTo,
          categoryId: form.categoryId || null,
          subcategoryId: form.subcategoryId || null,
          type: form.type,
          value,
          minAmount: form.minAmount ? Number(form.minAmount) : null,
          maxAmount: form.maxAmount ? Number(form.maxAmount) : null,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء القاعدة');
      showToast('تم إنشاء قاعدة العمولة', 'success');
      setModalOpen(false);
      setForm({
        name: '',
        appliesTo: 'bookings',
        categoryId: '',
        subcategoryId: '',
        type: 'PERCENTAGE',
        value: '',
        minAmount: '',
        maxAmount: '',
        isActive: true,
      });
      fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء إنشاء القاعدة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" />
            قواعد العمولة
          </h1>
          <p className="text-sm text-muted mt-1">إدارة نسب وأنواع العمولات المطبقة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            قاعدة جديدة
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
      ) : rules.length === 0 ? (
        <EmptyState icon={Percent} title="لا توجد قواعد" description="أضف قاعدة عمولة جديدة." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rules.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{r.name}</h3>
                    <p className="text-xs text-muted">
                      {appliesToOptions.find((o) => o.value === r.appliesTo)?.label || r.appliesTo}
                      {r.category ? ` • ${r.category.name}` : ''}
                    </p>
                  </div>
                  <Badge variant={r.isActive ? 'success' : 'muted'}>{r.isActive ? 'نشطة' : 'معطلة'}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted">النوع</p>
                    <p className="font-medium text-foreground">{typeOptions.find((o) => o.value === r.type)?.label || r.type}</p>
                  </div>
                  <div>
                    <p className="text-muted">القيمة</p>
                    <p className="font-medium text-foreground">
                      {r.type === 'PERCENTAGE' ? `${r.value}%` : formatMoney(r.value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">الحد الأدنى</p>
                    <p className="font-medium text-foreground">{formatMoney(r.minAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted">الحد الأقصى</p>
                    <p className="font-medium text-foreground">{formatMoney(r.maxAmount)}</p>
                  </div>
                </div>
                <div className="mt-4 text-xs text-muted">عدد العمولات: {r._count?.commissions || 0}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="قاعدة عمولة جديدة" size="md">
        <div className="space-y-4">
          <Input label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: عمولة الحجوزات" />
          <Select label="تنطبق على" options={appliesToOptions} value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value })} />
          <Select
            label="الفئة (اختياري)"
            options={[{ value: '', label: 'الكل' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          />
          <Select label="نوع العمولة" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input label="القيمة" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0.00" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="الحد الأدنى" type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} placeholder="اختياري" />
            <Input label="الحد الأقصى" type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })} placeholder="اختياري" />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            نشطة
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
