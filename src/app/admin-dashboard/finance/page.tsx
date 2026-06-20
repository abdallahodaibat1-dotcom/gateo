'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Percent,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';

interface RevenueItem {
  type: string;
  total: number;
}

interface RevenueData {
  invoicesByType: RevenueItem[];
  paymentsTotal: number;
  pendingWithdrawals: number;
  commissionsTotal: number;
}

const invoiceTypeLabels: Record<string, string> = {
  SUBSCRIPTION: 'اشتراكات',
  BOOKING: 'حجوزات',
  MARKETPLACE: 'متجر',
  AD: 'إعلانات',
  SERVICE: 'خدمات',
  FEE: 'رسوم',
};

function formatMoney(amount: number | string | null | undefined) {
  const value = Number(amount || 0);
  return `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
}

export default function AdminFinancePage() {
  const { showToast } = useToast();
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/finance/revenue');
      if (!res.ok) throw new Error('فشل في تحميل الإيرادات');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل بيانات الإيرادات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const netRevenue = (data?.paymentsTotal || 0) - (data?.commissionsTotal || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            المالية
          </h1>
          <p className="text-sm text-muted mt-1">نظرة عامة على الإيرادات والمدفوعات والعمولات</p>
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

      {loading || !data ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatMoney(data.paymentsTotal)}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">صافي الإيرادات</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatMoney(netRevenue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50">
                  <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">السحوبات المعلقة</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatMoney(data.pendingWithdrawals)}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50">
                  <ArrowUpRight className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">إجمالي العمولات</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{formatMoney(data.commissionsTotal)}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Percent className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      <Card>
        <h2 className="text-lg font-bold text-foreground mb-4">الإيرادات حسب النوع</h2>
        {loading || !data ? (
          <Skeleton className="h-48 w-full" />
        ) : data.invoicesByType.length === 0 ? (
          <EmptyState icon={Banknote} title="لا توجد فواتير بعد" description="ستظهر الإيرادات هنا عند بدء العمليات المالية." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="text-right px-4 py-3 font-semibold text-foreground">النوع</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">النسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.invoicesByType.map((item) => {
                  const percent = data.paymentsTotal > 0 ? (item.total / data.paymentsTotal) * 100 : 0;
                  return (
                    <tr key={item.type} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-foreground">{invoiceTypeLabels[item.type] || item.type}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatMoney(item.total)}</td>
                      <td className="px-4 py-3 text-muted">{percent.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
