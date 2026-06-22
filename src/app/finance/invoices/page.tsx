'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  currency: string;
  status: string;
  dueDate?: string | null;
  paidAt?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
  lineItems: InvoiceLineItem[];
}

const statusLabels: Record<string, string> = {
  DRAFT: 'مسودة',
  ISSUED: 'مصدرة',
  PAID: 'مدفوعة',
  OVERDUE: 'متأخرة',
  CANCELLED: 'ملغاة',
  REFUNDED: 'مستردة',
};

const statusVariant: Record<string, 'warning' | 'success' | 'danger' | 'muted' | 'primary'> = {
  DRAFT: 'muted',
  ISSUED: 'primary',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'muted',
  REFUNDED: 'warning',
};

const typeLabels: Record<string, string> = {
  SUBSCRIPTION: 'اشتراك',
  AD: 'إعلان',
  MARKETPLACE: 'متجر',
  BOOKING: 'حجز',
  SERVICE: 'خدمة',
  FEE: 'رسوم',
};

function formatDate(date?: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function InvoicesPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { format, convert } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchInvoices();
    }
  }, [status, router, page]);

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/invoices?page=${page}&limit=12`);
      if (!res.ok) throw new Error('فشل في تحميل الفواتير');
      const data = await res.json();
      setInvoices(data.invoices || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const totalUnpaid = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-10 min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
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
                <FileText className="w-6 h-6 text-primary" />
                فواتيري
              </h1>
              <p className="text-sm text-muted mt-1">متابعة فواتيرك ومدفوعاتك</p>
            </div>
            <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchInvoices}>
              تحديث
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-3 gap-4 mb-6"
          >
            <Card>
              <div className="text-sm text-muted">إجمالي الفواتير</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {format(convert(invoices.reduce((sum, inv) => sum + Number(inv.total), 0)))}
              </div>
            </Card>
            <Card>
              <div className="text-sm text-muted">الفواتير المدفوعة</div>
              <div className="text-2xl font-bold text-success mt-1">
                {format(convert(invoices.filter((inv) => inv.status === 'PAID').reduce((sum, inv) => sum + Number(inv.total), 0)))}
              </div>
            </Card>
            <Card>
              <div className="text-sm text-muted">المبالغ المستحقة</div>
              <div className="text-2xl font-bold text-danger mt-1">{format(convert(totalUnpaid))}</div>
            </Card>
          </motion.div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Card>
            {invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="لا توجد فواتير"
                description="ستظهر فواتيرك هنا بمجرد إصدارها."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-border">
                        <th className="text-right px-4 py-3 font-semibold text-foreground">رقم الفاتورة</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">النوع</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">المبلغ</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">تاريخ الإصدار</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">تاريخ الاستحقاق</th>
                        <th className="text-right px-4 py-3 font-semibold text-foreground">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.map((invoice) => (
                        <motion.tr
                          key={invoice.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3 text-muted">{typeLabels[invoice.type] || invoice.type}</td>
                          <td className="px-4 py-3 text-foreground font-medium">
                            {format(convert(invoice.total))}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                statusVariant[invoice.status]
                                  ? {
                                      primary: 'bg-primary/10 text-primary border-primary/20',
                                      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                      warning: 'bg-amber-50 text-amber-700 border-amber-200',
                                      danger: 'bg-red-50 text-red-700 border-red-200',
                                      muted: 'bg-slate-100 text-muted border-slate-200',
                                    }[statusVariant[invoice.status]]
                                  : 'bg-slate-100 text-muted border-slate-200'
                              }`}
                            >
                              {statusLabels[invoice.status] || invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted text-xs">{formatDate(invoice.createdAt)}</td>
                          <td className="px-4 py-3 text-muted text-xs">{formatDate(invoice.dueDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {invoice.pdfUrl && (
                                <a
                                  href={invoice.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                  aria-label="تحميل PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="الصفحة السابقة"
                      className="p-2 rounded-md border border-border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted px-3">
                      صفحة {page} من {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      aria-label="الصفحة التالية"
                      className="p-2 rounded-md border border-border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
