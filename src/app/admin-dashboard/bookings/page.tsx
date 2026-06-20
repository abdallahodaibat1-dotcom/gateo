'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Edit3,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Booking {
  id: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; phone: string | null };
  business: { id: string; name: string | null; logo: string | null };
  service: { id: string; name: string | null; price: number };
}

const statusOptions = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_BUSINESS', 'NO_SHOW'];
const paymentOptions = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPayment, setEditPayment] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBookings(data.bookings);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setEditLoading(true);
    try {
      const body: any = {};
      if (editStatus) body.status = editStatus;
      if (editPayment) body.paymentStatus = editPayment;
      const res = await fetch(`/api/admin/bookings/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === editId ? data.booking : b)));
        setEditId(null);
      }
    } catch (e) {}
    setEditLoading(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'معلق',
      CONFIRMED: 'مؤكد',
      COMPLETED: 'مكتمل',
      CANCELLED_BY_USER: 'ملغي من المستخدم',
      CANCELLED_BY_BUSINESS: 'ملغي من العمل',
      NO_SHOW: 'لم يحضر',
    };
    return map[s] || s;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الحجوزات</h1>
          <p className="text-muted text-sm mt-1">إدارة حجوزات المنصة</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">كل الحالات</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold text-foreground">الخدمة</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">العميل</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">العمل التجاري</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الدفع</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">السعر</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">التاريخ</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{booking.service?.name || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">{booking.user?.name || '—'}</div>
                    <div className="text-xs text-muted">{booking.user?.phone || booking.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-foreground">{booking.business?.name || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} label={statusLabel(booking.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {booking.totalPrice?.toLocaleString('ar-SA')} ر.س
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(booking.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditId(booking.id); setEditStatus(booking.status); setEditPayment(booking.paymentStatus); }}
                        aria-label="تعديل"
                        className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(booking.id)}
                        aria-label="حذف"
                        className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={CalendarDays}
              title="لا توجد حجوزات"
              description="لم يتم إنشاء أي حجوزات بعد."
            />
          </div>
        )}

        {!loading && totalPages > 1 && (
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
      </div>

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditId(null)}>
          <div className="bg-surface rounded-lg shadow-xl border border-border w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">تعديل الحجز</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editStatus" className="block text-sm font-medium text-foreground mb-1">حالة الحجز</label>
                <select
                  id="editStatus"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="editPayment" className="block text-sm font-medium text-foreground mb-1">حالة الدفع</label>
                <select
                  id="editPayment"
                  value={editPayment}
                  onChange={(e) => setEditPayment(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {paymentOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditId(null)}
                className="flex-1 px-4 py-2.5 rounded-md border border-border text-foreground font-medium hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                disabled={editLoading}
                className="flex-1 px-4 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {editLoading ? 'جاري...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف الحجز"
        message="هل أنت متأكد من حذف هذا الحجز؟"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
