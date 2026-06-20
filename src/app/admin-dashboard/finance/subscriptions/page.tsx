'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  RefreshCw,
  AlertCircle,
  Plus,
  Users,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
  _count?: { subscriptions: number };
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

export default function AdminSubscriptionsPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    price: '',
    duration: '30',
    features: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/finance/subscriptions');
      if (!res.ok) throw new Error('فشل في تحميل الخطط');
      const json = await res.json();
      setPlans(json.plans || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل خطط الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const price = Number(form.price);
    const duration = Number(form.duration);
    if (!form.name || !price || !duration) {
      showToast('أدخل البيانات المطلوبة', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          nameAr: form.nameAr || undefined,
          description: form.description || undefined,
          price,
          duration,
          features: form.features.split('\n').map((l) => l.trim()).filter(Boolean),
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء الخطة');
      showToast('تم إنشاء الخطة بنجاح', 'success');
      setModalOpen(false);
      setForm({ name: '', nameAr: '', description: '', price: '', duration: '30', features: '', isActive: true });
      fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء إنشاء الخطة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            خطط الاشتراك
          </h1>
          <p className="text-sm text-muted mt-1">إدارة خطط اشتراكات الأعمال</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
            تحديث
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
            خطة جديدة
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
      ) : plans.length === 0 ? (
        <EmptyState icon={Crown} title="لا توجد خطط" description="أضف خطة اشتراك جديدة." />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
              <Card className="h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{p.nameAr || p.name}</h3>
                    <p className="text-xs text-muted">{p.duration} يوم</p>
                  </div>
                  <Badge variant={p.isActive ? 'success' : 'muted'}>{p.isActive ? 'نشطة' : 'معطلة'}</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-primary">{formatMoney(p.price)}</p>
                  <p className="text-sm text-muted mt-1">{p.description || '—'}</p>
                </div>
                <ul className="mt-4 space-y-1 text-sm text-foreground flex-1">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted">
                  <Users className="w-4 h-4" />
                  {p._count?.subscriptions || 0} مشترك
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="خطة اشتراك جديدة" size="md">
        <div className="space-y-4">
          <Input label="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: Business" />
          <Input label="الاسم بالعربية" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <Input label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="السعر" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            <Input label="المدة (يوم)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">المميزات (سطر لكل ميزة)</label>
            <textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none min-h-[100px] resize-y"
              placeholder="مثال:\nدعم فوري\nتقارير متقدمة"
            />
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
