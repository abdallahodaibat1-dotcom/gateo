'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Star,
  TrendingUp,
  Scissors,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useCurrency } from '@/hooks/useCurrency';

interface Business {
  id: string;
  name: string;
  avgRating: number;
  reviewCount: number;
  _count: { reviews: number; bookings: number };
  services: { id: string; name: string }[];
  createdAt: string;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  totalPrice: number | null;
}

export default function BusinessAnalyticsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { format, convert } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const businessRes = await fetch('/api/businesses/my');
      if (businessRes.ok) {
        const businessData = await businessRes.json();
        setBusiness(businessData.business);
        const id = businessData.business.id;

        const bookingsRes = await fetch(`/api/businesses/${id}/bookings?limit=100`);
        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setBookings(bData.bookings);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5">
              <Skeleton className="w-10 h-10 rounded-lg mb-3" />
              <Skeleton className="w-16 h-7 mb-2" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6">
            <Skeleton className="w-32 h-5 mb-6" />
            <div className="flex items-end gap-3 h-48">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <Skeleton className="w-full h-full rounded-t-lg" />
                  <Skeleton className="w-8 h-3" />
                  <Skeleton className="w-6 h-3" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6">
            <Skeleton className="w-32 h-5 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <Skeleton className="w-full h-2.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6">
          <Skeleton className="w-full h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!business) return null;

  // Compute stats
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === 'CANCELLED_BY_USER' || b.status === 'CANCELLED_BY_BUSINESS'
  ).length;

  // Group bookings by month
  const monthlyData: Record<string, number> = {};
  bookings.forEach((b) => {
    const d = new Date(b.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = (monthlyData[key] || 0) + 1;
  });
  const sortedMonths = Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMonthly = Math.max(...sortedMonths.map(([, v]) => v), 1);

  // Status breakdown
  const statusData = [
    { label: 'مكتمل', value: completedBookings, color: 'bg-green-400' },
    { label: 'مؤكد', value: confirmedBookings, color: 'bg-blue-400' },
    { label: 'قيد الانتظار', value: pendingBookings, color: 'bg-yellow-400' },
    { label: 'ملغي', value: cancelledBookings, color: 'bg-red-400' },
  ];
  const totalStatus = statusData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'إجمالي الحجوزات',
            value: business._count.bookings,
            icon: CalendarDays,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'الإيرادات',
            value: format(convert(totalRevenue)),
            icon: TrendingUp,
            color: 'text-success',
            bg: 'bg-success/10',
          },
          {
            label: 'التقييمات',
            value: business._count.reviews,
            icon: Star,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
          },
          {
            label: 'الخدمات',
            value: business.services.length,
            icon: Scissors,
            color: 'text-secondary',
            bg: 'bg-secondary/10',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5"
          >
            <div className={`p-2.5 rounded-lg ${stat.bg} w-fit mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6"
        >
          <h3 className="font-bold text-foreground mb-6">الحجوزات الشهرية</h3>
          {sortedMonths.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="لا توجد بيانات كافية"
              description="ستظهر هنا إحصائيات الحجوزات الشهرية"
            />
          ) : (
            <div className="flex items-end gap-3 h-48">
              {sortedMonths.map(([month, count]) => {
                const [year, mon] = month.split('-');
                const label = new Date(Number(year), Number(mon) - 1).toLocaleDateString('ar-SA', {
                  month: 'short',
                });
                const height = `${(count / maxMonthly) * 100}%`;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-t-lg relative h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg"
                      />
                    </div>
                    <span className="text-xs text-muted">{label}</span>
                    <span className="text-xs font-bold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6"
        >
          <h3 className="font-bold text-foreground mb-6">حالة الحجوزات</h3>
          {totalStatus <= 1 && bookings.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="لا توجد بيانات كافية"
              description="ستظهر هنا توزيع حالات الحجوزات"
            />
          ) : (
            <div className="space-y-4">
              {statusData.map((item) => {
                const pct = (item.value / totalStatus) * 100;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className="text-sm font-medium text-foreground">
                        {item.value} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Rating Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:text-right">
            <div className="text-4xl font-bold text-foreground">{business.avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center sm:justify-start gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(business.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                />
              ))}
            </div>
            <div className="text-sm text-muted mt-1">{business.reviewCount} تقييم</div>
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center border border-border">
                <div className="text-xl font-bold text-foreground">{completedBookings}</div>
                <div className="text-xs text-muted mt-1">حجوزات مكتملة</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center border border-border">
                <div className="text-xl font-bold text-foreground">{pendingBookings}</div>
                <div className="text-xs text-muted mt-1">قيد الانتظار</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center border border-border">
                <div className="text-xl font-bold text-foreground">{confirmedBookings}</div>
                <div className="text-xs text-muted mt-1">حجوزات مؤكدة</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center border border-border">
                <div className="text-xl font-bold text-foreground">{cancelledBookings}</div>
                <div className="text-xs text-muted mt-1">ملغاة</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
