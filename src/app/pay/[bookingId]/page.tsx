'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { CreditCard, Wallet, Banknote, ArrowRight, CheckCircle, Loader2, FileX } from 'lucide-react';

interface Booking {
  id: string;
  totalPrice: number | null;
  status: string;
  paymentStatus: string;
  business: { id: string; name: string; logo: string | null };
  service: { id: string; name: string; price: number | null } | null;
}

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState<'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'CASH'>('CARD');
  const { showToast } = useToast();
  const { format, convert } = useCurrency();

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.booking) {
          setBooking(data.booking);
        }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    if (!booking) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Number(booking.totalPrice || booking.service?.price || 0),
          method,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/bookings'), 2000);
      } else {
        showToast(data.error || 'فشل في معالجة الدفع', 'error');
      }
    } catch {
      showToast('حدث خطأ في الاتصال', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <EmptyState
            icon={FileX}
            title="الحجز غير موجود"
            description="تأكدي من رقم الحجز أو العودة لقائمة الحجوزات"
            actionLabel="العودة للحجوزات"
            onAction={() => router.push('/bookings')}
          />
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-surface rounded-lg border border-border shadow-sm text-center p-8 max-w-sm w-full">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">تم الدفع بنجاح!</h1>
          <p className="text-muted">سيتم تحويلك إلى صفحة الحجوزات...</p>
        </div>
      </main>
    );
  }

  const amount = Number(booking.totalPrice || booking.service?.price || 0);

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Link href="/bookings" className="inline-flex items-center gap-2 text-muted hover:text-primary-dark mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة للحجوزات
        </Link>

        <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-6">
          <h1 className="text-xl font-bold text-foreground mb-1">إتمام الدفع</h1>
          <p className="text-muted text-sm">{booking.business.name}</p>
          {booking.service && (
            <p className="text-muted/80 text-sm">{booking.service.name}</p>
          )}
          <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted">المبلغ المستحق</p>
            <p className="text-3xl font-bold text-primary">{format(convert(amount))}</p>
          </div>
        </div>

        <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-6">
          <h2 className="font-bold text-foreground mb-4">اختر طريقة الدفع</h2>
          <div className="space-y-3">
            {[
              { id: 'CARD' as const, label: 'بطاقة ائتمان / مدى', icon: CreditCard },
              { id: 'APPLE_PAY' as const, label: 'Apple Pay', icon: Wallet },
              { id: 'GOOGLE_PAY' as const, label: 'Google Pay', icon: Wallet },
              { id: 'CASH' as const, label: 'الدفع عند الزيارة', icon: Banknote },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  method === m.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                <m.icon className="w-5 h-5" />
                <span className="font-medium">{m.label}</span>
                {method === m.id && <CheckCircle className="w-5 h-5 mr-auto text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={processing || amount <= 0}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-md bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              دفع {format(convert(amount))}
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted mt-4">
          الدفع آمن ومشفر. في الوضع الحالي يتم محاكاة الدفع بدون خصم فعلي.
        </p>
      </div>
    </main>
  );
}
