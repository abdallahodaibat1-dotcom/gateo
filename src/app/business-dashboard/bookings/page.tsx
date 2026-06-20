'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays,
  Clock,
  Phone,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
  totalPrice: number | null;
  paymentStatus: string;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null; phone: string | null; email: string | null } | null;
  service: { id: string; name: string; price: number | null; duration: number | null } | null;
}

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED_BY_USER' | 'CANCELLED_BY_BUSINESS' | 'NO_SHOW';

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED_BY_USER: 'ملغي من العميل',
  CANCELLED_BY_BUSINESS: 'ملغي من العمل',
  NO_SHOW: 'لم يحضر',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED_BY_USER: 'bg-surface text-muted border-border',
  CANCELLED_BY_BUSINESS: 'bg-red-50 text-red-700 border-red-200',
  NO_SHOW: 'bg-surface text-muted border-border',
};

const tabs: { key: BookingStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'PENDING', label: 'قيد الانتظار' },
  { key: 'CONFIRMED', label: 'مؤكد' },
  { key: 'COMPLETED', label: 'مكتمل' },
  { key: 'CANCELLED_BY_BUSINESS', label: 'ملغي' },
];

export default function BusinessBookingsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BookingStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBusinessId();
  }, []);

  const fetchBusinessId = async () => {
    try {
      const res = await fetch('/api/businesses/my');
      if (res.ok) {
        const data = await res.json();
        setBusinessId(data.business.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookings = useCallback(
    async (pageNum: number, statusFilter?: BookingStatus | 'ALL') => {
      if (!businessId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(pageNum));
        params.set('limit', '12');
        if (statusFilter && statusFilter !== 'ALL') {
          params.set('status', statusFilter);
        }

        const res = await fetch(`/api/businesses/${businessId}/bookings?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (pageNum === 1) {
            setBookings(data.bookings);
          } else {
            setBookings((prev) => [...prev, ...data.bookings]);
          }
          setHasMore(data.pagination.page < data.pagination.pages);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [businessId]
  );

  useEffect(() => {
    if (businessId) {
      setPage(1);
      fetchBookings(1, activeTab);
    }
  }, [businessId, activeTab, fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        showToast('فشل في تحديث الحالة', 'error');
      }
    } catch (e) {
      showToast('فشل في تحديث الحالة', 'error');
    } finally {
      setUpdatingId(null);
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

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-1 flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:text-foreground hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={booking.user?.avatar || '/logo/favicon.svg'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {booking.user?.name || 'عميل'}
                    </h3>
                    {booking.service && (
                      <p className="text-xs text-muted mt-0.5">{booking.service.name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      {booking.user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${statusColors[booking.status]}`}
                >
                  {statusLabels[booking.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  {formatDate(booking.date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  {booking.time}
                </div>
                {booking.service?.duration && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    {booking.service.duration} دقيقة
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  {booking.totalPrice || booking.service?.price
                    ? `${Number(booking.totalPrice ?? booking.service?.price ?? 0).toFixed(0)} ر.س`
                    : '—'}
                </div>
              </div>

              {booking.notes && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-foreground border border-border">
                  <span className="font-medium text-foreground">ملاحظات: </span>
                  {booking.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                      disabled={updatingId === booking.id}
                      className="px-4 py-2 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تأكيد
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'CANCELLED_BY_BUSINESS')}
                      disabled={updatingId === booking.id}
                      className="px-4 py-2 rounded-md bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      إلغاء
                    </button>
                  </>
                )}
                {booking.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                      disabled={updatingId === booking.id}
                      className="px-4 py-2 rounded-md bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      إكمال
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'NO_SHOW')}
                      disabled={updatingId === booking.id}
                      className="px-4 py-2 rounded-md bg-surface text-foreground text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      لم يحضر
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="لا توجد حجوزات"
          description="سيظهر هنا كل حجوزات عملائك"
        />
      )}

      {/* Load More */}
      {hasMore && bookings.length > 0 && (
        <div className="flex justify-center py-4">
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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton circle className="w-12 h-12" />
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                </div>
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
