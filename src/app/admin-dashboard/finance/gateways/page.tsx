'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
  Plus,
  Power,
  PowerOff,
} from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface Gateway {
  id: string;
  code: string;
  name: string;
  nameAr?: string | null;
  isActive: boolean;
  isDefault: boolean;
  countries?: string | null;
  currencies?: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function AdminGatewaysPage() {
  const { showToast } = useToast();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    nameAr: '',
    countries: '',
    currencies: '',
    isActive: true,
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/finance/gateways');
      if (!res.ok) throw new Error('فشل في تحميل البوابات');
      const json = await res.json();
      setGateways(json.gateways || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل بوابات الدفع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.code || !form.name) {
      showToast('أدخل البيانات المطلوبة', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/gateways', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          name: form.name,
          nameAr: form.nameAr || undefined,
          countries: form.countries || undefined,
          currencies: form.currencies || undefined,
          isActive: form.isActive,
          isDefault: form.isDefault,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء البوابة');
      showToast('تم إنشاء البوابة بنجاح', 'success');
      setModalOpen(false);
      setForm({ code: '', name: '', nameAr: '', countries: '', currencies: '', isActive: true, isDefault: false });
      fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء إنشاء البوابة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (gateway: Gateway) => {
    try {
      const res = await fetch(`/api/admin/finance/gateways/${gateway.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !gateway.isActive }),
      });
      if (!res.ok) throw new Error('فشل في التحديث');
      showToast('تم تحديث الحالة', 'success');
      fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء التحديث', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            بوابات الدفع
          </h1>
          <p className="text-sm text-muted mt-1">إدارة بوابات الدفع والتحصيل</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            إضافة بوابة
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
      ) : gateways.length === 0 ? (
        <EmptyState icon={CreditCard} title="لا توجد بوابات" description="أضف بوابة دفع جديدة للبدء." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((g, i) => (
            <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{g.nameAr || g.name}</h3>
                    <p className="text-xs text-muted">{g.code}</p>
                  </div>
                  <div className="flex gap-1">
                    {g.isDefault && <Badge variant="primary">افتراضي</Badge>}
                    <Badge variant={g.isActive ? 'success' : 'muted'}>{g.isActive ? 'نشط' : 'معطل'}</Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-muted">الدول: {g.countries || 'الكل'}</p>
                  <p className="text-muted">العملات: {g.currencies || 'الكل'}</p>
                  <p className="text-muted">الترتيب: {g.sortOrder}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={g.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    onClick={() => toggleStatus(g)}
                  >
                    {g.isActive ? 'تعطيل' : 'تفعيل'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="إضافة بوابة دفع" size="md">
        <div className="space-y-4">
          <Input label="الرمز" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: stripe" />
          <Input label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: Stripe" />
          <Input label="الاسم بالعربية" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="اختياري" />
          <Input label="الدول" value={form.countries} onChange={(e) => setForm({ ...form, countries: e.target.value })} placeholder="مثال: SA,JO,UAE" />
          <Input label="العملات" value={form.currencies} onChange={(e) => setForm({ ...form, currencies: e.target.value })} placeholder="مثال: USD,SAR" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              نشط
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              افتراضي
            </label>
          </div>
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
