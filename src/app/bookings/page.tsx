'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { EmptyState, Skeleton } from '@/components/ui';
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  XCircle,
  ChevronLeft,
  Store,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';
import { useCurrency } from '@/hooks/useCurrency';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED_BY_USER' | 'CANCELLED_BY_BUSINESS' | 'NO_SHOW';

interface Booking {
  id: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes: string | null;
  totalPrice: number | null;
  paymentStatus: string;
  createdAt: string;
  business: {
    id: string;
    name: string;
    logo: string | null;
    city: string | null;
    phone: string | null;
  };
  service: {
    id: string;
    name: string;
    price: number | null;
    duration: number | null;
  } | null;
}

const statusLabels: Record<BookingStatus, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED_BY_USER: 'ملغي من العميل',
  CANCELLED_BY_BUSINESS: 'ملغي من العمل',
  NO_SHOW: 'لم يحضر',
};

const statusColors: Record<BookingStatus, string> = {
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-success/10 text-success border-success/20',
  CANCELLED_BY_USER: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED_BY_BUSINESS: 'bg-red-50 text-red-700 border-red-200',
  NO_SHOW: 'bg-slate-100 text-slate-500 border-slate-200',
};

const tabs: { key: BookingStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'PENDING', label: 'قيد الانتظار' },
  { key: 'CONFIRMED', label: 'مؤكد' },
  { key: 'COMPLETED', label: 'مكتمل' },
  { key: 'CANCELLED_BY_USER', label: 'ملغي' },
  { key: 'CANCELLED_BY_BUSINESS', label: 'ملغي من العمل' },
];

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const { format, convert } = useCurrency();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchBookings = useCallback(async (pageNum: number, statusFilter?: BookingStatus | 'ALL') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '12');
      if (statusFilter && statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/bookings?${params}`);
      if (!res.ok) throw new Error('فشل في تحميل الحجوزات');

      const data = await res.json();
      if (pageNum === 1) {
        setBookings(data.bookings);
      } else {
        setBookings((prev) => [...prev, ...data.bookings]);
      }
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      setPage(1);
      fetchBookings(1, activeTab);
    }
  }, [status, activeTab, fetchBookings]);

  const handleCancel = async (bookingId: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من إلغاء هذا الحجز؟' });
    if (!ok) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED_BY_USER' }),
      });
      if (res.ok) {
        fetchBookings(1, activeTab);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'فشل في إلغاء الحجز', 'error');
      }
    } catch (e) {
      showToast('فشل في إلغاء الحجز', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBookings(nextPage, activeTab);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">حجوزاتي</h1>
            <Link
              href="/businesses"
              className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              استكشفي الأعمال
            </Link>
          </div>

          {/* Tabs */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-1 mb-6 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bookings List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {bookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/business/${booking.business.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={booking.business.logo || '/logo/favicon.svg'}
                          alt={booking.business.name}
                          className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">{booking.business.name}</h3>
                          {booking.service && (
                            <p className="text-xs text-muted truncate">{booking.service.name}</p>
                          )}
                        </div>
                      </Link>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${statusColors[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {booking.time}
                      </div>
                      {booking.business.city && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          {booking.business.city}
                        </div>
                      )}
                      {booking.business.phone && (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Phone className="w-4 h-4 text-primary" />
                          {booking.business.phone}
                        </div>
                      )}
                    </div>

                    {(booking.totalPrice || booking.service?.price) && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-muted">
                          {booking.service?.duration ? `${booking.service.duration} دقيقة` : '\u00A0'}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {format(convert(booking.totalPrice ?? booking.service?.price ?? 0))}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex-1 px-4 py-2.5 rounded-md bg-slate-50 text-foreground text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                      >
                        التفاصيل
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2.5 rounded-md bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          إلغاء
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {!loading && bookings.length === 0 && !error && (
            <EmptyState
              icon={Calendar}
              title="لا توجد حجوزات"
              description="ابدأ بحجز موعدك الأول مع أفضل الأعمال"
              actionLabel="تصفحي الأعمال"
              onAction={() => router.push('/businesses')}
              className="mt-8"
            />
          )}

          {/* Load More */}
          {hasMore && bookings.length > 0 && (
            <div className="flex justify-center py-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 rounded-md bg-surface border border-border text-foreground font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحميل المزيد'}
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && bookings.length === 0 && (
            <div className="space-y-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-1/3 h-4" />
                      <Skeleton className="w-1/4 h-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <ConfirmDialog />
    </>
  );
}
