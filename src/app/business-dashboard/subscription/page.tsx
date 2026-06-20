'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
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
}

interface BusinessSubscription {
  id: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  autoRenew: boolean;
  plan: SubscriptionPlan;
}

interface SubscriptionResponse {
  subscription: BusinessSubscription | null;
  plans: SubscriptionPlan[];
}

function formatMoney(amount: number | string | null | undefined) {
  const value = Number(amount || 0);
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BusinessSubscriptionPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscriptions/business');
      if (!res.ok) throw new Error('فشل في تحميل بيانات الاشتراك');
      const json = await res.json();
      setData({ subscription: json.subscription || null, plans: json.plans || [] });
    } catch (e) {
      setError('حدث خطأ أثناء تحميل بيانات الاشتراك');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribeLoading(true);
    try {
      const res = await fetch('/api/subscriptions/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      if (!res.ok) throw new Error('فشل الاشتراك');
      showToast('تم الاشتراك في الخطة بنجاح', 'success');
      setSelectedPlan(null);
      await fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء الاشتراك', 'error');
    } finally {
      setSubscribeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const activePlans = data?.plans.filter((p) => p.isActive) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            الاشتراك
          </h1>
          <p className="text-sm text-muted mt-1">إدارة اشتراك نشاطك التجاري</p>
        </div>
        <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
          تحديث
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {data?.subscription ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 w-fit">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">
                  الخطة الحالية: {data.subscription.plan.nameAr || data.subscription.plan.name}
                </h2>
                <p className="text-sm text-muted mt-1">{data.subscription.plan.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>يبدأ: {formatDate(data.subscription.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Calendar className="w-4 h-4" />
                    <span>ينتهي: {formatDate(data.subscription.expiresAt)}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      data.subscription.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-muted border-slate-200'
                    }`}
                  >
                    {data.subscription.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  {data.subscription.autoRenew && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                      تجديد تلقائي
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right md:text-left">
                <div className="text-2xl font-bold text-primary">
                  {formatMoney(data.subscription.plan.price)}
                </div>
                <div className="text-xs text-muted">كل {data.subscription.plan.duration} يوم</div>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <EmptyState
            icon={CreditCard}
            title="لا يوجد اشتراك نشط"
            description="اختر إحدى الخطط أدناه للاشتراك."
          />
        </Card>
      )}

      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">الخطط المتاحة</h2>
        {activePlans.length === 0 ? (
          <Card>
            <EmptyState icon={CreditCard} title="لا توجد خطط متاحة" description="ستظهر خطط الاشتراك هنا قريباً." />
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {activePlans.map((plan, i) => {
              const isCurrent = data?.subscription?.plan.id === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Card className={`h-full flex flex-col ${isCurrent ? 'border-primary/30' : ''}`}>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{plan.nameAr || plan.name}</h3>
                      <p className="text-sm text-muted mt-1 min-h-[40px]">{plan.description}</p>
                      <div className="mt-4 mb-4">
                        <span className="text-3xl font-bold text-primary">{formatMoney(plan.price)}</span>
                        <span className="text-sm text-muted"> / {plan.duration} يوم</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length === 0 && (
                          <li className="text-sm text-muted">لا توجد مميزات محددة</li>
                        )}
                      </ul>
                    </div>
                    <Button
                      className="w-full mt-6"
                      disabled={isCurrent}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {isCurrent ? 'الخطة الحالية' : 'اشترك الآن'}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title="تأكيد الاشتراك"
        size="sm"
      >
        {selectedPlan && (
          <div className="space-y-4">
            <p className="text-foreground">
              سيتم الاشتراك في خطة{' '}
              <strong>{selectedPlan.nameAr || selectedPlan.name}</strong> بمبلغ{' '}
              <strong>{formatMoney(selectedPlan.price)}</strong> لمدة {selectedPlan.duration} يوم.
            </p>
            <p className="text-sm text-muted">سيتم إنشاء فاتورة وخصم المبلغ من رصيدك.</p>
          </div>
        )}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setSelectedPlan(null)}>
            إلغاء
          </Button>
          <Button className="flex-1" isLoading={subscribeLoading} onClick={handleSubscribe}>
            تأكيد الاشتراك
          </Button>
        </div>
      </Modal>
    </div>
  );
}
