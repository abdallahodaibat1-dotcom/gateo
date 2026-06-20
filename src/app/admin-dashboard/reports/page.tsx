'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Loader2,
  AlertCircle,
  Users,
  Building2,
  FileText,
  CalendarDays,
  Flag,
  Download,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';

type ReportType = 'users' | 'businesses' | 'content' | 'bookings' | 'reports';

interface ReportData {
  summary: Record<string, number>;
  timeSeries?: { date: string; count: number }[];
  postsTimeSeries?: { date: string; count: number }[];
  commentsTimeSeries?: { date: string; count: number }[];
  likesTimeSeries?: { date: string; count: number }[];
  revenueTimeSeries?: { date: string; count: number }[];
  byAccountType?: { name: string; count: number }[];
  byRole?: { name: string; count: number }[];
  byStatus?: { name: string; count: number }[];
  byType?: { name: string; count: number }[];
  byCategory?: { name: string; count: number }[];
  byCity?: { name: string; count: number }[];
  topCities?: { name: string; count: number }[];
  topBusinesses?: { name: string; bookings: number; revenue: number }[];
}

const tabs: { key: ReportType; label: string; icon: React.ElementType }[] = [
  { key: 'users', label: 'المستخدمون', icon: Users },
  { key: 'businesses', label: 'الأعمال', icon: Building2 },
  { key: 'content', label: 'المحتوى', icon: FileText },
  { key: 'bookings', label: 'الحجوزات', icon: CalendarDays },
  { key: 'reports', label: 'البلاغات', icon: Flag },
];

const COLORS = ['#1e40af', '#3b82f6', '#0f766e', '#059669', '#d97706', '#dc2626', '#6366f1', '#64748b'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

function toCSV(data: Record<string, unknown>[]) {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('users');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/admin/categories?limit=1000')
      .then((r) => r.json())
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('type', activeTab);
      params.set('from', from);
      params.set('to', to);
      if (categoryId) params.set('categoryId', categoryId);
      if (city) params.set('city', city);
      const res = await fetch(`/api/admin/reports/analytics?${params.toString()}`);
      if (!res.ok) throw new Error('فشل في تحميل التقرير');
      const json = await res.json();
      setData(json.data);
    } catch {
      setError('حدث خطأ أثناء تحميل التقرير');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, from, to, categoryId, city]);

  const exportCSV = () => {
    if (!data) return;
    let rows: Record<string, unknown>[] = [];

    if (activeTab === 'users') {
      rows = data.timeSeries?.map((item) => ({ التاريخ: item.date, 'عدد المستخدمين': item.count })) || [];
    } else if (activeTab === 'businesses') {
      rows = data.timeSeries?.map((item) => ({ التاريخ: item.date, 'عدد الأعمال': item.count })) || [];
    } else if (activeTab === 'content') {
      rows =
        data.postsTimeSeries?.map((item, i) => ({
          التاريخ: item.date,
          المنشورات: item.count,
          التعليقات: data.commentsTimeSeries?.[i]?.count || 0,
          الإعجابات: data.likesTimeSeries?.[i]?.count || 0,
        })) || [];
    } else if (activeTab === 'bookings') {
      rows =
        data.timeSeries?.map((item, i) => ({
          التاريخ: item.date,
          'عدد الحجوزات': item.count,
          الإيرادات: data.revenueTimeSeries?.[i]?.count || 0,
        })) || [];
    } else if (activeTab === 'reports') {
      rows = data.timeSeries?.map((item) => ({ التاريخ: item.date, 'عدد البلاغات': item.count })) || [];
    }

    const csv = toCSV(rows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${activeTab}-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryCards = useMemo(() => {
    if (!data) return [];
    switch (activeTab) {
      case 'users':
        return [
          { label: 'إجمالي المستخدمين', value: data.summary.total },
          { label: 'مستخدمين عاديين', value: data.byRole?.find((r) => r.name === 'USER')?.count || 0 },
          { label: 'مشرفين', value: data.byRole?.find((r) => r.name === 'ADMIN')?.count || 0 },
        ];
      case 'businesses':
        return [
          { label: 'إجمالي الأعمال', value: data.summary.total },
          { label: 'موثقة', value: data.summary.verified },
          { label: 'غير موثقة', value: data.summary.unverified },
        ];
      case 'content':
        return [
          { label: 'المنشورات', value: data.summary.totalPosts },
          { label: 'التعليقات', value: data.summary.totalComments },
          { label: 'الإعجابات', value: data.summary.totalLikes },
        ];
      case 'bookings':
        return [
          { label: 'إجمالي الحجوزات', value: data.summary.total },
          { label: 'إجمالي الإيرادات', value: data.summary.totalRevenue },
        ];
      case 'reports':
        return [{ label: 'إجمالي البلاغات', value: data.summary.total }];
      default:
        return [];
    }
  }, [data, activeTab]);

  const timeSeriesData = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'content') {
      return (
        data.postsTimeSeries?.map((item, i) => ({
          date: item.date,
          المنشورات: item.count,
          التعليقات: data.commentsTimeSeries?.[i]?.count || 0,
          الإعجابات: data.likesTimeSeries?.[i]?.count || 0,
        })) || []
      );
    }
    if (activeTab === 'bookings') {
      return (
        data.timeSeries?.map((item, i) => ({
          date: item.date,
          الحجوزات: item.count,
          الإيرادات: data.revenueTimeSeries?.[i]?.count || 0,
        })) || []
      );
    }
    return data.timeSeries?.map((item) => ({ date: item.date, count: item.count })) || [];
  }, [data, activeTab]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-2 flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="from" className="text-xs font-bold text-muted">من</label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="to" className="text-xs font-bold text-muted">إلى</label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          {activeTab === 'businesses' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="categoryId" className="text-xs font-bold text-muted">الفئة</label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none min-w-[160px]"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city" className="text-xs font-bold text-muted">المدينة</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: عمّان"
                  className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              onClick={exportCSV}
              disabled={!data || loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              تصدير CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-2">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-4 bg-surface rounded-lg border border-border shadow-sm p-5">
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="bg-surface rounded-lg border border-border shadow-sm p-5"
              >
                <p className="text-sm text-muted">{card.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {card.value.toLocaleString('ar-SA')}
                </p>
              </div>
            ))}
          </div>

          {/* Time Series Chart */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-6">التطور عبر الزمن</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'content' || activeTab === 'bookings' ? (
                  <LineChart data={timeSeriesData as any}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      labelFormatter={(label) => formatDate(label as string)}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    {activeTab === 'content' ? (
                      <>
                        <Line type="monotone" dataKey="المنشورات" stroke="#1e40af" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="التعليقات" stroke="#0f766e" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="الإعجابات" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </>
                    ) : (
                      <>
                        <Line type="monotone" dataKey="الحجوزات" stroke="#1e40af" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="الإيرادات" stroke="#059669" strokeWidth={2} dot={false} />
                      </>
                    )}
                  </LineChart>
                ) : (
                  <LineChart data={timeSeriesData as any}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      labelFormatter={(label) => formatDate(label as string)}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name={tabs.find((t) => t.key === activeTab)?.label}
                      stroke="#1e40af"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status / Type distribution */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="font-bold text-foreground mb-6">
                {activeTab === 'users' ? 'توزيع المستخدمين حسب النوع' : activeTab === 'reports' ? 'البلاغات حسب النوع' : 'التوزيع حسب الحالة'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        activeTab === 'users'
                          ? data.byAccountType
                          : activeTab === 'reports'
                          ? data.byType
                          : data.byStatus
                      }
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {(activeTab === 'users'
                        ? data.byAccountType
                        : activeTab === 'reports'
                        ? data.byType
                        : data.byStatus
                      )?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category / City / Top list */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="font-bold text-foreground mb-6">
                {activeTab === 'users'
                  ? 'أكثر المدن تسجيلاً'
                  : activeTab === 'businesses'
                  ? 'الفئات الأكثر'
                  : activeTab === 'bookings'
                  ? 'أكثر الأعمال حجزاً'
                  : activeTab === 'reports'
                  ? 'البلاغات حسب الحالة'
                  : 'التوزيع'}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      activeTab === 'users'
                        ? data.topCities
                        : activeTab === 'businesses'
                        ? data.byCategory
                        : activeTab === 'bookings'
                        ? data.topBusinesses?.map((b) => ({ name: b.name, count: b.bookings }))
                        : activeTab === 'reports'
                        ? data.byStatus
                        : []
                    }
                    layout="vertical"
                    margin={{ left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#1e40af" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Link to content reports */}
          {activeTab === 'reports' && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center justify-between">
              <p className="text-sm text-amber-800">لمراجعة تفاصيل البلاغات الفردية اضغط هنا</p>
              <Link
                href="/admin-dashboard/reports/items"
                className="px-4 py-2 rounded-md bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
              >
                مراجعة البلاغات
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
