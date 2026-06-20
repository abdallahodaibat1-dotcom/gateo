'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Star,
  Scissors,
  TrendingUp,
  Clock,
  ChevronLeft,
  Plus,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  name: string;
  avgRating: number;
  reviewCount: number;
  _count: { reviews: number; bookings: number };
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  price: number | null;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  totalPrice: number | null;
  user: { id: string; name: string | null; avatar: string | null; phone: string | null } | null;
  service: { id: string; name: string; price: number | null; duration: number | null } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null } | null;
}

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED_BY_USER: 'ملغي من العميل',
  CANCELLED_BY_BUSINESS: 'ملغي من العمل',
  NO_SHOW: 'لم يحضر',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED_BY_USER: 'bg-surface text-muted',
  CANCELLED_BY_BUSINESS: 'bg-red-50 text-red-700',
  NO_SHOW: 'bg-surface text-muted',
};

export default function BusinessDashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

        const [bookingsRes, reviewsRes] = await Promise.all([
          fetch(`/api/businesses/${id}/bookings?limit=5`),
          fetch(`/api/businesses/${id}/reviews?limit=5`),
        ]);

        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setBookings(bData.bookings);
        }
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          setReviews(rData.reviews);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  const stats = business
    ? [
        {
          label: 'إجمالي الحجوزات',
          value: business._count.bookings,
          icon: CalendarDays,
          color: 'text-primary',
          bg: 'bg-primary/10',
          href: '/business-dashboard/bookings',
        },
        {
          label: 'التقييمات',
          value: business._count.reviews,
          icon: Star,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          href: '/business-dashboard/reviews',
        },
        {
          label: 'الخدمات',
          value: business.services.length,
          icon: Scissors,
          color: 'text-secondary',
          bg: 'bg-secondary/10',
          href: '/business-dashboard/services',
        },
        {
          label: 'متوسط التقييم',
          value: business.avgRating.toFixed(1),
          icon: TrendingUp,
          color: 'text-success',
          bg: 'bg-success/10',
          href: '/business-dashboard/reviews',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-4 h-4" />
              </div>
              <Skeleton className="w-16 h-7 mb-2" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <Skeleton className="w-28 h-5" />
              <Skeleton className="w-20 h-4" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <Skeleton circle className="w-10 h-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-48 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5">
              <Skeleton className="w-28 h-5 mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-10 rounded-md" />
                ))}
              </div>
            </div>
            <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
                <Skeleton className="w-28 h-5" />
                <Skeleton className="w-20 h-4" />
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
          >
            <Link
              href={stat.href}
              className="block bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ChevronLeft className="w-4 h-4 text-muted" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted mt-0.5">{stat.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="lg:col-span-2 bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
        >
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">آخر الحجوزات</h2>
            <Link
              href="/business-dashboard/bookings"
              className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {bookings.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={CalendarDays}
                  title="لا توجد حجوزات بعد"
                  description="ستظهر هنا آخر حجوزات عملائك"
                />
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-4 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                  <img
                    src={booking.user?.avatar || '/logo/favicon.svg'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {booking.user?.name || 'عميل'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[booking.status]}`}>
                        {statusLabels[booking.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString('ar-SA')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {booking.time}
                      </span>
                      {booking.service && <span>{booking.service.name}</span>}
                    </div>
                  </div>
                  {booking.totalPrice ? (
                    <div className="text-sm font-bold text-primary">
                      {Number(booking.totalPrice).toFixed(0)} ر.س
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5"
          >
            <h2 className="font-bold text-foreground mb-4">إجراءات سريعة</h2>
            <div className="space-y-2">
              <Link
                href="/business-dashboard/services"
                className="flex items-center gap-3 p-3 rounded-md bg-slate-50 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                إضافة خدمة جديدة
              </Link>
              <Link
                href="/create-post"
                className="flex items-center gap-3 p-3 rounded-md bg-slate-50 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                منشور جديد
              </Link>
              <Link
                href={`/business/${business.id}/edit`}
                className="flex items-center gap-3 p-3 rounded-md bg-slate-50 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                إعدادات النشاط
              </Link>
            </div>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground">آخر التقييمات</h2>
              <Link
                href="/business-dashboard/reviews"
                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
              >
                عرض الكل
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {reviews.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={Star}
                    title="لا توجد تقييمات بعد"
                    description="ستظهر هنا آخر تقييمات العملاء"
                  />
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={review.user?.avatar || '/logo/favicon.svg'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {review.user?.name || 'مستخدم'}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted leading-relaxed mr-10">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
