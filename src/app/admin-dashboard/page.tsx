'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Building2,
  FileText,
  CalendarDays,
  Flag,
  MessageCircle,
  MessageSquareQuote,
  Clock,
  AlertCircle,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Hourglass,
  Settings,
  Inbox,
  Tags,
  Briefcase,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useCurrency } from '@/hooks/useCurrency';

interface DashboardStats {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  totalBusinesses: number;
  pendingBusinesses: number;
  activeBusinesses: number;
  rejectedBusinesses: number;
  totalPosts: number;
  totalBookings: number;
  pendingBookings: number;
  totalReports: number;
  pendingReports: number;
  totalGroups: number;
  totalReviews: number;
}

interface TrendPoint {
  date: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  trends: {
    users: TrendPoint[];
    businesses: TrendPoint[];
  };
  recent: {
    users: any[];
    businesses: any[];
    reports: any[];
    bookings: any[];
  };
}

const statCards = [
  { key: 'totalUsers' as const, label: 'المستخدمين', sub: 'newUsersLast7Days', subLabel: 'جديد هذا الأسبوع', icon: Users, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/users' },
  { key: 'totalBusinesses' as const, label: 'الأعمال', sub: 'pendingBusinesses', subLabel: 'طلب معلق', icon: Building2, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/businesses' },
  { key: 'totalPosts' as const, label: 'المنشورات', icon: FileText, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/posts' },
  { key: 'totalBookings' as const, label: 'الحجوزات', sub: 'pendingBookings', subLabel: 'قيد الانتظار', icon: CalendarDays, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/bookings' },
  { key: 'totalReports' as const, label: 'البلاغات', sub: 'pendingReports', subLabel: 'بلاغ معلق', icon: Flag, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/reports' },
  { key: 'totalGroups' as const, label: 'المجموعات', icon: MessageCircle, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/groups' },
  { key: 'totalReviews' as const, label: 'التقييمات', icon: MessageSquareQuote, color: 'text-primary', bg: 'bg-primary/10', href: '/admin-dashboard/reviews' },
];

const quickActions = [
  { name: 'طلبات الانضمام', desc: 'مراجعة الأعمال الجديدة', href: '/admin-dashboard/applications', icon: Inbox, color: 'bg-primary/10 text-primary' },
  { name: 'إعدادات المنصة', desc: 'التحكم بالإعدادات العامة', href: '/admin-dashboard/settings', icon: Settings, color: 'bg-primary/10 text-primary' },
  { name: 'الفئات والتصنيفات', desc: 'إدارة أقسام المنصة', href: '/admin-dashboard/categories', icon: Tags, color: 'bg-primary/10 text-primary' },
];

export default function AdminDashboardPage() {
  const { format, convert } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded-md" />
            <Skeleton className="w-64 h-4 rounded-md" />
          </div>
          <Skeleton className="w-40 h-5 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-5">
              <Skeleton className="w-10 h-10 rounded-lg mb-4" />
              <Skeleton className="w-16 h-7 rounded-md mb-2" />
              <Skeleton className="w-24 h-4 rounded-md" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="w-32 h-4 rounded-md" />
                <Skeleton className="w-48 h-3 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6">
            <Skeleton className="w-full h-48 rounded-md" />
          </div>
          <div className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-12 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-muted">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          type="button"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة تحكم المشرف</h1>
          <p className="text-muted text-sm mt-1">نظرة شاملة وإدارة كاملة لمنصة Gateo</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock className="w-4 h-4" />
          آخر تحديث: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(stats?.pendingBusinesses || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Hourglass className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                {stats?.pendingBusinesses} طلب عمل بانتظار المراجعة
              </p>
              <p className="text-xs text-amber-700 mt-0.5">يرجى مراجعة الطلبات والاعتماد أو الرفض</p>
            </div>
            <Link
              href="/admin-dashboard/applications"
              className="px-4 py-2 rounded-md bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              مراجعة الآن
            </Link>
          </motion.div>
        )}

        {(stats?.pendingReports || 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">
                {stats?.pendingReports} بلاغ بحاجة للمراجعة
              </p>
              <p className="text-xs text-red-700 mt-0.5">تحقق من المحتوى المخالف والتصرف</p>
            </div>
            <Link
              href="/admin-dashboard/reports"
              className="px-4 py-2 rounded-md bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              مراجعة الآن
            </Link>
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const value = stats?.[card.key] ?? 0;
          const subValue = card.sub ? stats?.[card.sub as keyof DashboardStats] : null;
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={card.href}
                className="block bg-surface rounded-lg border border-border shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg ${card.bg} ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-foreground">{value.toLocaleString('ar-SA')}</div>
                  <div className="text-sm text-muted mt-0.5">{card.label}</div>
                  {subValue !== null && (
                    <div className="text-xs mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-muted">
                      {Number(subValue) > 0 ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-muted" />}
                      {Number(subValue).toLocaleString('ar-SA')} {card.subLabel}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
            >
              <Link
                href={action.href}
                className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{action.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{action.desc}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300 mr-auto" />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Trends + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 bg-surface rounded-lg border border-border shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-foreground">مؤشر النمو (آخر 7 أيام)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> مستخدمين</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> أعمال</span>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {data?.trends?.users?.map((point, i) => {
              const max = Math.max(
                ...(data?.trends?.users?.map((p) => p.count) || [1]),
                ...(data?.trends?.businesses?.map((p) => p.count) || [1]),
                1
              );
              const userHeight = max ? (point.count / max) * 100 : 0;
              const bizHeight = max ? ((data?.trends?.businesses?.[i]?.count || 0) / max) * 100 : 0;
              return (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-0.5 h-36">
                    <div
                      className="w-1.5 bg-primary rounded-t-sm"
                      style={{ height: `${Math.max(userHeight, 4)}%` }}
                      title={`مستخدمين: ${point.count}`}
                    />
                    <div
                      className="w-1.5 bg-slate-400 rounded-t-sm"
                      style={{ height: `${Math.max(bizHeight, 4)}%` }}
                      title={`أعمال: ${data?.trends?.businesses?.[i]?.count || 0}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{formatDateShort(point.date)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Pending Businesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-surface rounded-lg border border-border shadow-sm"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">طلبات الأعمال المعلقة</h2>
            <Link href="/admin-dashboard/applications" className="text-sm text-primary hover:text-primary-dark font-medium">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data?.recent?.businesses?.length ? (
              data.recent.businesses.map((biz) => (
                <div key={biz.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-foreground text-sm font-bold">
                    {biz.name?.charAt(0) || '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{biz.name || 'عمل تجاري'}</div>
                    <div className="text-xs text-muted truncate">{biz.city || 'غير محدد'}</div>
                  </div>
                  <StatusBadge status={biz.status || 'PENDING'} />
                </div>
              ))
            ) : (
              <EmptyState icon={Building2} title="لا يوجد طلبات معلقة" className="border-0 bg-transparent" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-surface rounded-lg border border-border shadow-sm"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">أحدث المستخدمين</h2>
            <Link href="/admin-dashboard/users" className="text-sm text-primary hover:text-primary-dark font-medium">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data?.recent?.users?.length ? (
              data.recent.users.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-foreground text-sm font-bold">
                    {user.name?.charAt(0) || '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{user.name || 'مستخدم'}</div>
                    <div className="text-xs text-muted truncate">{user.email}</div>
                  </div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Users} title="لا يوجد مستخدمين جدد" className="border-0 bg-transparent" />
            )}
          </div>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-surface rounded-lg border border-border shadow-sm"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">أحدث البلاغات</h2>
            <Link href="/admin-dashboard/reports" className="text-sm text-primary hover:text-primary-dark font-medium">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data?.recent?.reports?.length ? (
              data.recent.reports.map((report) => (
                <div key={report.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-foreground text-sm font-bold">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      بلاغ {report.type === 'POST' ? 'منشور' : report.type === 'USER' ? 'مستخدم' : report.type === 'BUSINESS' ? 'عمل تجاري' : report.type === 'COMMENT' ? 'تعليق' : report.type}
                    </div>
                    <StatusBadge status={report.status || 'PENDING'} />
                  </div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(report.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Flag} title="لا يوجد بلاغات جديدة" className="border-0 bg-transparent" />
            )}
          </div>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-surface rounded-lg border border-border shadow-sm"
        >
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">أحدث الحجوزات</h2>
            <Link href="/admin-dashboard/bookings" className="text-sm text-primary hover:text-primary-dark font-medium">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data?.recent?.bookings?.length ? (
              data.recent.bookings.map((booking) => (
                <div key={booking.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-foreground text-sm font-bold">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      حجز بقيمة {format(convert(booking.totalPrice || 0))}
                    </div>
                    <StatusBadge status={booking.status || 'PENDING'} />
                  </div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(booking.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={CalendarDays} title="لا يوجد حجوزات جديدة" className="border-0 bg-transparent" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
