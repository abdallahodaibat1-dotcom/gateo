'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
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

interface TaxRate {
  id: string;
  countryCode: string;
  name: string;
  rate: number;
  type: string;
  isActive: boolean;
}

const typeOptions = [
  { value: 'VAT', label: 'ضريبة القيمة المضافة' },
  { value: 'SALES', label: 'ضريبة المبيعات' },
  { value: 'LOCAL', label: 'ضريبة محلية' },
];

export default function AdminTaxesPage() {
  const { showToast } = useToast();
  const [taxes, setTaxes] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    countryCode: '',
    name: '',
    rate: '',
    type: 'VAT',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/finance/taxes');
      if (!res.ok) throw new Error('فشل في تحميل الضرائب');
      const json = await res.json();
      setTaxes(json.taxes || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الضرائب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const rate = Number(form.rate);
    if (!form.countryCode || !form.name || rate < 0 || rate > 100) {
      showToast('أدخل بيانات صحيحة', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/taxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: form.countryCode,
          name: form.name,
          rate,
          type: form.type,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error('فشل في حفظ الضريبة');
      showToast('تم حفظ الضريبة بنجاح', 'success');
      setModalOpen(false);
      setForm({ countryCode: '', name: '', rate: '', type: 'VAT', isActive: true });
      fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء حفظ الضريبة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            الضرائب
          </h1>
          <p className="text-sm text-muted mt-1">إدارة معدلات الضريبة حسب الدولة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            ضريبة جديدة
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
      ) : taxes.length === 0 ? (
        <EmptyState icon={Receipt} title="لا توجد ضرائب" description="أضف معدل ضريبة جديد." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxes.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted">{t.countryCode} • {typeOptions.find((o) => o.value === t.type)?.label || t.type}</p>
                  </div>
                  <Badge variant={t.isActive ? 'success' : 'muted'}>{t.isActive ? 'نشطة' : 'معطلة'}</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-primary">{t.rate}%</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="ضريبة جديدة" size="md">
        <div className="space-y-4">
          <Input label="رمز الدولة" value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} placeholder="مثال: JO" maxLength={2} />
          <Input label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: ضريبة القيمة المضافة" />
          <Select label="النوع" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <Input label="المعدل (%)}" type="number" min={0} max={100} step="0.01" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="0.00" />
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
