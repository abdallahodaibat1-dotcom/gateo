'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface FinancialAccount {
  id: string;
  type: string;
  currency: string;
  balance: number;
  isActive: boolean;
}

interface FinancialTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  referenceType?: string | null;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string;
}

const accountTypeLabels: Record<string, string> = {
  CASH: 'نقدي',
  HOLD: 'مجمد',
  EARNINGS: 'أرباح',
  COMMISSION: 'عمولة',
  REWARDS: 'مكافآت',
  ADS_CREDIT: 'رصيد إعلاني',
};

const transactionTypeLabels: Record<string, string> = {
  DEPOSIT: 'إيداع',
  WITHDRAWAL: 'سحب',
  TRANSFER: 'تحويل',
  HOLD: 'تجميد',
  RELEASE: 'إ release',
  REFUND: 'استرداد',
  COMMISSION: 'عمولة',
  FEE: 'رسوم',
  REWARD: 'مكافأة',
};

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  COMPLETED: 'مكتمل',
  FAILED: 'فاشل',
  REVERSED: 'مستعاد',
};

const statusVariant: Record<string, 'warning' | 'success' | 'danger' | 'muted'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
  REVERSED: 'muted',
};

function formatMoney(amount: number | string | null | undefined, currency?: string) {
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

export default function WalletPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('BANK');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        fetch('/api/finance/accounts'),
        fetch('/api/finance/transactions?limit=20'),
      ]);
      if (!accountsRes.ok) throw new Error('فشل في تحميل الحسابات');
      if (!transactionsRes.ok) throw new Error('فشل في تحميل العمليات');
      const accountsData = await accountsRes.json();
      const transactionsData = await transactionsRes.json();
      setAccounts(accountsData.accounts || []);
      setTransactions(transactionsData.transactions || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل بيانات المحفظة');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      showToast('أدخل مبلغاً صحيحاً', 'error');
      return;
    }
    setDepositLoading(true);
    try {
      const res = await fetch('/api/finance/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'USD' }),
      });
      if (!res.ok) throw new Error('فشل الإيداع');
      showToast('تم إيداع المبلغ بنجاح', 'success');
      setDepositOpen(false);
      setDepositAmount('');
      await fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء الإيداع', 'error');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      showToast('أدخل مبلغاً صحيحاً', 'error');
      return;
    }
    if (!withdrawDetails.trim()) {
      showToast('أدخل تفاصيل طريقة السحب', 'error');
      return;
    }
    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/finance/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          method: withdrawMethod,
          methodDetails: withdrawDetails,
        }),
      });
      if (!res.ok) throw new Error('فشل طلب السحب');
      showToast('تم إرسال طلب السحب بنجاح', 'success');
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
      await fetchData();
    } catch (e) {
      showToast('حدث خطأ أثناء طلب السحب', 'error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-10 min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary" />
                محفظتي المالية
              </h1>
              <p className="text-sm text-muted mt-1">إدارة حساباتك والعمليات المالية</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
                تحديث
              </Button>
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setDepositOpen(true)}>
                إيداع
              </Button>
              <Button variant="outline" leftIcon={<Minus className="w-4 h-4" />} onClick={() => setWithdrawOpen(true)}>
                طلب سحب
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {accounts.length === 0 && !error && (
              <Card className="md:col-span-3">
                <EmptyState
                  icon={Wallet}
                  title="لا توجد حسابات مالية"
                  description="ستظهر حساباتك المالية هنا بمجرد إنشائها."
                />
              </Card>
            )}
            {accounts.map((account, i) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        account.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-muted border-slate-200'
                      }`}
                    >
                      {account.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatMoney(account.balance, account.currency === 'USD' ? '$' : account.currency)}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    {accountTypeLabels[account.type] || account.type} • {account.currency}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <h2 className="text-lg font-bold text-foreground mb-4">العمليات الأخيرة</h2>
            {transactions.length === 0 ? (
              <EmptyState
                icon={RefreshCw}
                title="لا توجد عمليات"
                description="ستظهر عملياتك المالية الأخيرة هنا."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border">
                      <th className="text-right px-4 py-3 font-semibold text-foreground">النوع</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">المرجع</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">الوصف</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((t) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {t.type === 'DEPOSIT' ? (
                              <ArrowDownLeft className="w-4 h-4 text-success" />
                            ) : t.type === 'WITHDRAWAL' ? (
                              <ArrowUpRight className="w-4 h-4 text-danger" />
                            ) : null}
                            <span className="text-foreground">
                              {transactionTypeLabels[t.type] || t.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {formatMoney(t.amount, t.currency === 'USD' ? '$' : t.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              statusVariant[t.status]
                                ? {
                                    warning: 'bg-amber-50 text-amber-700 border-amber-200',
                                    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                    danger: 'bg-red-50 text-red-700 border-red-200',
                                    muted: 'bg-slate-100 text-muted border-slate-200',
                                  }[statusVariant[t.status]]
                                : 'bg-slate-100 text-muted border-slate-200'
                            }`}
                          >
                            {statusLabels[t.status] || t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {t.referenceType ? `${t.referenceType} ${t.referenceId ? `• ${t.referenceId.slice(0, 8)}` : ''}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted max-w-xs truncate">{t.description || '—'}</td>
                        <td className="px-4 py-3 text-muted text-xs">{formatDate(t.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Modal isOpen={depositOpen} onClose={() => setDepositOpen(false)} title="إيداع في المحفظة" size="sm">
        <div className="space-y-4">
          <Input
            label="المبلغ"
            type="number"
            min={1}
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="0.00"
          />
          <p className="text-xs text-muted">هذا إيداع تجريبي لأغراض الاختبار.</p>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setDepositOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" isLoading={depositLoading} onClick={handleDeposit}>
            إيداع
          </Button>
        </div>
      </Modal>

      <Modal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="طلب سحب" size="sm">
        <div className="space-y-4">
          <Input
            label="المبلغ"
            type="number"
            min={1}
            step="0.01"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="0.00"
          />
          <label className="block text-sm font-medium text-foreground">طريقة السحب</label>
          <select
            value={withdrawMethod}
            onChange={(e) => setWithdrawMethod(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            <option value="BANK">تحويل بنكي</option>
            <option value="CLIQ">كليك (Cliq)</option>
            <option value="PAYPAL">باي بال</option>
          </select>
          <Input
            label="تفاصيل الحساب"
            value={withdrawDetails}
            onChange={(e) => setWithdrawDetails(e.target.value)}
            placeholder="مثال: رقم الآيبان / اسم الحساب"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => setWithdrawOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" isLoading={withdrawLoading} onClick={handleWithdraw}>
            إرسال الطلب
          </Button>
        </div>
      </Modal>
    </>
  );
}
