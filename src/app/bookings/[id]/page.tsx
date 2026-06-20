'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Skeleton } from '@/components/ui';
import {
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Store,
  ChevronRight,
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  CreditCard,
  Edit3,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED_BY_USER' | 'CANCELLED_BY_BUSINESS' | 'NO_SHOW';

interface BookingDetail {
  id: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes: string | null;
  totalPrice: number | null;
  paymentStatus: string;
  paymentId: string | null;
  createdAt: string;
  business: {
    id: string;
    name: string;
    logo: string | null;
    city: string | null;
    phone: string | null;
    userId: string;
  };
  service: {
    id: string;
    name: string;
    price: number | null;
    duration: number | null;
  } | null;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    phone: string | null;
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

const statusIcons: Record<BookingStatus, React.ReactNode> = {
  PENDING: <AlertCircle className="w-5 h-5 text-amber-500" />,
  CONFIRMED: <CheckCircle className="w-5 h-5 text-blue-500" />,
  COMPLETED: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  CANCELLED_BY_USER: <XCircle className="w-5 h-5 text-slate-400" />,
  CANCELLED_BY_BUSINESS: <XCircle className="w-5 h-5 text-red-400" />,
  NO_SHOW: <AlertCircle className="w-5 h-5 text-slate-400" />,
};

const paymentLabels: Record<string, string> = {
  UNPAID: 'غير مدفوع',
  PAID: 'مدفوع',
  REFUNDED: 'مسترجع',
  FAILED: 'فشل الدفع',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ date: '', time: '', notes: '' });
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking);
        setEditForm({
          date: data.booking.date ? data.booking.date.split('T')[0] : '',
          time: data.booking.time || '',
          notes: data.booking.notes || '',
        });
      } else if (res.status === 404) {
        router.push('/bookings');
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'فشل في تحميل تفاصيل الحجز');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBooking();
    }
  }, [status, fetchBooking]);

  const isOwner = session?.user?.id === booking?.user?.id;
  const isBusinessOwner = session?.user?.id === booking?.business?.userId;
  const isAdmin = session?.user?.role === 'ADMIN';

  const handleCancel = async () => {
    if (!booking) return;
    const ok = await confirm({ title: 'هل أنت متأكد من إلغاء هذا الحجز؟' });
    if (!ok) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED_BY_USER' }),
      });
      if (res.ok) {
        await fetchBooking();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'فشل في إلغاء الحجز', 'error');
      }
    } catch (e) {
      showToast('فشل في إلغاء الحجز', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    if (!booking) return;
    const ok = await confirm({ title: `هل أنت متأكد من تغيير الحالة إلى "${statusLabels[newStatus]}"؟` });
    if (!ok) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchBooking();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'فشل في تحديث الحالة', 'error');
      }
    } catch (e) {
      showToast('فشل في تحديث الحالة', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const body: Record<string, any> = {};
      if (editForm.date) body.date = new Date(editForm.date).toISOString();
      if (editForm.time) body.time = editForm.time;
      if (editForm.notes !== undefined) body.notes = editForm.notes;

      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchBooking();
        setIsEditing(false);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'فشل في تحديث الحجز', 'error');
      }
    } catch (e) {
      showToast('فشل في تحديث الحجز', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20 px-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">حدث خطأ</h2>
            <p className="text-muted mb-6">{error}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchBooking}
                className="px-5 py-2.5 rounded-md bg-slate-100 text-foreground font-medium hover:bg-slate-200 transition-colors"
              >
                إعادة المحاولة
              </button>
              <Link
                href="/bookings"
                className="px-5 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors"
              >
                العودة للحجوزات
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!booking) return null;

  const canCancel = isOwner && (booking.status === 'PENDING' || booking.status === 'CONFIRMED');
  const canManageStatus = (isBusinessOwner || isAdmin) && booking.status !== 'CANCELLED_BY_USER' && booking.status !== 'CANCELLED_BY_BUSINESS';
  const canEdit = isOwner && booking.status === 'PENDING';

  const businessActions: BookingStatus[] = [];
  if (canManageStatus) {
    if (booking.status === 'PENDING') businessActions.push('CONFIRMED', 'CANCELLED_BY_BUSINESS');
    if (booking.status === 'CONFIRMED') businessActions.push('COMPLETED', 'NO_SHOW', 'CANCELLED_BY_BUSINESS');
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted">
            <Link href="/bookings" className="hover:text-primary transition-colors">
              حجوزاتي
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">تفاصيل الحجز</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status Card */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                {statusIcons[booking.status]}
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-foreground">حجز #{booking.id.slice(-6).toUpperCase()}</h1>
                  <span
                    className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColors[booking.status]}`}
                  >
                    {statusLabels[booking.status]}
                  </span>
                </div>
                {canEdit && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-md text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                    aria-label="تعديل"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-date" className="block text-sm font-medium text-foreground mb-1.5">التاريخ</label>
                        <input
                          id="edit-date"
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-time" className="block text-sm font-medium text-foreground mb-1.5">الوقت</label>
                        <input
                          id="edit-time"
                          type="time"
                          value={editForm.time}
                          onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="edit-notes" className="block text-sm font-medium text-foreground mb-1.5">ملاحظات</label>
                      <textarea
                        id="edit-notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        حفظ
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            date: booking.date ? booking.date.split('T')[0] : '',
                            time: booking.time || '',
                            notes: booking.notes || '',
                          });
                        }}
                        className="px-5 py-2.5 rounded-md bg-slate-100 text-foreground font-medium hover:bg-slate-200 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-muted">التاريخ:</span>
                      <span className="text-foreground font-medium mr-auto">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-muted">الوقت:</span>
                      <span className="text-foreground font-medium mr-auto">{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-muted">حالة الدفع:</span>
                      <span className="text-foreground font-medium mr-auto">
                        {paymentLabels[booking.paymentStatus] || booking.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-muted">تاريخ الإنشاء:</span>
                      <span className="text-foreground font-medium mr-auto">
                        {new Date(booking.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Business Card */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">تفاصيل العمل</h2>
              <Link href={`/business/${booking.business.id}`} className="flex items-center gap-4 mb-4">
                <img
                  src={booking.business.logo || '/logo/favicon.svg'}
                  alt={booking.business.name}
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
                <div>
                  <h3 className="font-bold text-foreground">{booking.business.name}</h3>
                  <div className="flex items-center gap-1 text-primary text-sm mt-1">
                    <Store className="w-4 h-4" />
                    عرض صفحة العمل
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
              <div className="space-y-2">
                {booking.business.city && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <MapPin className="w-4 h-4 text-muted" />
                    {booking.business.city}
                  </div>
                )}
                {booking.business.phone && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="w-4 h-4 text-muted" />
                    <a href={`tel:${booking.business.phone}`} className="hover:text-primary transition-colors">
                      {booking.business.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Service Card */}
            {booking.service && (
              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">الخدمة</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{booking.service.name}</h3>
                    {booking.service.duration && (
                      <p className="text-sm text-muted mt-1">{booking.service.duration} دقيقة</p>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {Number(booking.totalPrice ?? booking.service.price ?? 0).toFixed(0)} ر.س
                  </div>
                </div>
              </div>
            )}

            {/* Customer Card (for business owner) */}
            {(isBusinessOwner || isAdmin) && booking.user && (
              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">العميلة</h2>
                <div className="flex items-center gap-3">
                  <img
                    src={booking.user.avatar || '/logo/favicon.svg'}
                    alt={booking.user.name || ''}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{booking.user.name || 'مستخدم'}</h3>
                    {booking.user.phone && (
                      <a href={`tel:${booking.user.phone}`} className="text-sm text-muted hover:text-primary transition-colors">
                        {booking.user.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && !isEditing && (
              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">ملاحظات</h2>
                <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">الإجراءات</h2>
              <div className="flex flex-wrap gap-3">
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-md bg-danger/10 text-danger font-medium hover:bg-danger/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    إلغاء الحجز
                  </button>
                )}

                {businessActions.map((actionStatus) => (
                  <button
                    key={actionStatus}
                    onClick={() => handleStatusUpdate(actionStatus)}
                    disabled={actionLoading}
                    className={`px-5 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                      actionStatus === 'CANCELLED_BY_BUSINESS'
                        ? 'bg-danger/10 text-danger hover:bg-danger/20'
                        : actionStatus === 'COMPLETED'
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {statusLabels[actionStatus]}
                  </button>
                ))}

                {isOwner && booking.paymentStatus === 'UNPAID' && booking.status !== 'CANCELLED_BY_USER' && booking.status !== 'CANCELLED_BY_BUSINESS' && (
                  <Link
                    href={`/pay/${booking.id}`}
                    className="px-5 py-2.5 rounded-md bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    ادفع الآن
                  </Link>
                )}

                {isOwner && booking.status === 'COMPLETED' && (
                  <Link
                    href={`/business/${booking.business.id}`}
                    className="px-5 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <Store className="w-4 h-4" />
                    تقييم العمل
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <ConfirmDialog />
    </>
  );
}
