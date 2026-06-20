'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  Shield,
  User,
  ChevronRight,
  ChevronLeft,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  accountType: string;
  createdAt: string;
  _count: {
    posts: number;
    bookings: number;
    reviews: number;
    followers: number;
    following: number;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('q', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteId));
        setDeleteId(null);
      }
    } catch (e) {
      console.error(e);
    }
    setDeleteLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (e) {
      console.error(e);
    }
    setRoleLoadingId(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المستخدمين</h1>
          <p className="text-muted text-sm mt-1">إدارة حسابات المستخدمين والأدوار</p>
        </div>
        <div className="text-sm text-muted flex items-center gap-2">
          <Users className="w-4 h-4" />
          {users.length} مستخدم
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            id="search"
            type="text"
            placeholder="البحث بالاسم أو البريد أو الهاتف..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <select
          id="roleFilter"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">كل الأدوار</option>
          <option value="USER">مستخدم</option>
          <option value="ADMIN">مشرف</option>
          <option value="MODERATOR">مشرف محتوى</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border">
                <th className="text-right px-4 py-3 font-semibold text-foreground">المستخدم</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الدور</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">المنشورات</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الحجوزات</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">تاريخ الانضمام</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || '/logo/favicon.svg'}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                      <div>
                        <div className="font-medium text-foreground">{user.name || 'مستخدم'}</div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {roleLoadingId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <select
                        aria-label="تغيير الدور"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="USER">مستخدم</option>
                        <option value="ADMIN">مشرف</option>
                        <option value="MODERATOR">مشرف محتوى</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{user._count.posts}</td>
                  <td className="px-4 py-3 text-muted">{user._count.bookings}</td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${user.id}`}
                        target="_blank"
                        aria-label="عرض الملف الشخصي"
                        className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <User className="w-4 h-4" />
                      </Link>
                      {user.role === 'ADMIN' && (
                        <span className="p-1.5 rounded-md text-primary" title="مشرف">
                          <Shield className="w-4 h-4" />
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteId(user.id)}
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

        {!loading && users.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={AlertCircle}
              title="لا توجد نتائج"
              description="لا يوجد مستخدمون مطابقون للبحث."
            />
          </div>
        )}

        {/* Pagination */}
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

      <ConfirmModal
        isOpen={!!deleteId}
        title="حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
