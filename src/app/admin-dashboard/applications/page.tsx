'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Building2,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  ChevronLeft,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useConfirm } from '@/hooks/useConfirm';

interface BusinessApplication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  businessType: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
  } | null;
  category: { id: string; name: string } | null;
  subcategories: { id: string; name: string; slug: string }[] | null;
  customSubcategories: string[] | null;
  // توافقية مؤقتة مع الحقول الفردية القديمة
  subcategory?: { id: string; name: string } | null;
  customSubcategory?: string | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [processing, setProcessing] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/businesses/applications?status=${statusFilter}&limit=100`);
      if (!res.ok) throw new Error('فشل في تحميل الطلبات');
      const data = await res.json();
      setApplications(data.businesses || []);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
          isVerified: action === 'approve',
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'فشل في تنفيذ الإجراء');
      if (!res.ok) throw new Error('فشل في تنفيذ الإجراء');
      await fetchApplications();
    } catch (e) {
      setError('حدث خطأ أثناء تنفيذ الإجراء');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذا الطلب نهائياً؟' });
    if (!ok) return;
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في الحذف');
      await fetchApplications();
    } catch (e) {
      setError('حدث خطأ أثناء الحذف');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = applications.filter((a) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      a.name?.toLowerCase().includes(term) ||
      a.user?.name?.toLowerCase().includes(term) ||
      a.user?.email?.toLowerCase().includes(term) ||
      a.city?.toLowerCase().includes(term) ||
      a.category?.name?.toLowerCase().includes(term)
    );
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">طلبات الانضمام</h1>
          <p className="text-muted text-sm mt-1">مراجعة واعتماد طلبات الأعمال والشركات</p>
        </div>
        <button
          onClick={fetchApplications}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-surface text-sm font-medium text-foreground hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث باسم النشاط، صاحبه، البريد، المدينة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pr-10 pl-8 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 min-w-[160px]"
            >
              <option value="PENDING">معلقة</option>
              <option value="ACTIVE">معتمدة</option>
              <option value="REJECTED">مرفوضة</option>
              <option value="">الكل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton circle className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="لا توجد طلبات"
          description="لا توجد طلبات مطابقة للفلتر المحدد"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  {/* Business Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {app.name?.charAt(0) || '؟'}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{app.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={app.status} />
                            {app.isVerified && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                <CheckCircle2 className="w-3 h-3" />
                                موثق
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/business/${app.id}`}
                        target="_blank"
                        className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                      >
                        عرض الموقع
                        <ChevronLeft className="w-3 h-3" />
                      </Link>
                    </div>

                    {app.description && (
                      <p className="text-sm text-muted mt-3 line-clamp-2">{app.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {app.category && (
                        <div className="flex items-start gap-2 text-sm text-muted">
                          <Briefcase className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate">{app.category.name}</span>
                            {(app.subcategories ?? []).map((sub) => (
                              <span
                                key={sub.id}
                                className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs"
                              >
                                {sub.name}
                              </span>
                            ))}
                            {(app.customSubcategories ?? []).map((name, idx) => (
                              <span
                                key={`custom-${idx}`}
                                className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {app.city && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <MapPin className="w-4 h-4 text-muted" />
                          <span className="truncate">{app.city}</span>
                        </div>
                      )}
                      {app.businessType && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Building2 className="w-4 h-4 text-muted" />
                          <span>{app.businessType === 'COMPANY' ? 'شركة' : 'فردي'}</span>
                        </div>
                      )}
                      {app.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Phone className="w-4 h-4 text-muted" />
                          <span className="truncate" dir="ltr">{app.phone}</span>
                        </div>
                      )}
                      {app.email && (
                        <div className="flex items-center gap-2 text-sm text-muted">
                          <Mail className="w-4 h-4 text-muted" />
                          <span className="truncate">{app.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <CalendarDays className="w-4 h-4 text-muted" />
                        <span>{formatDate(app.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="lg:w-64 p-4 rounded-lg bg-slate-50 border border-border">
                    <p className="text-xs font-bold text-muted mb-3 uppercase tracking-wide">صاحب الطلب</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                        {app.user?.name?.charAt(0) || app.user?.email?.charAt(0) || '؟'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{app.user?.name || 'مستخدم'}</p>
                        <p className="text-xs text-muted truncate">{app.user?.email || 'لا يوجد بريد'}</p>
                      </div>
                    </div>
                    {app.user?.phone && (
                      <p className="text-xs text-muted mt-2 flex items-center gap-1" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {app.user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {app.status === 'PENDING' && (
                <div className="px-5 py-3 bg-slate-50 border-t border-border flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleAction(app.id, 'approve')}
                    disabled={processing === app.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {processing === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    اعتماد الطلب
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'reject')}
                    disabled={processing === app.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    رفض الطلب
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    disabled={processing === app.id}
                    className="mr-auto inline-flex items-center gap-2 px-3 py-2 rounded-md text-muted text-xs font-medium hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    حذف نهائي
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
