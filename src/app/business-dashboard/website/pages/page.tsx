'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  FileStack,
  Plus,
  Trash2,
  Home,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useConfirm } from '@/hooks/useConfirm';

interface Business {
  id: string;
  slug: string;
}

interface BusinessPage {
  id: string;
  slug: string;
  title: string;
  isHomePage: boolean;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function PagesListPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [pages, setPages] = useState<BusinessPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newPage, setNewPage] = useState({ slug: '', title: '' });
  const [creating, setCreating] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const businessRes = await fetch('/api/businesses/my');
      if (!businessRes.ok) {
        if (businessRes.status === 404) {
          router.push('/business/apply');
          return;
        }
        throw new Error('فشل في جلب بيانات النشاط');
      }
      const businessData = await businessRes.json();
      setBusiness(businessData.business);

      const pagesRes = await fetch(`/api/businesses/${businessData.business.id}/pages`);
      if (!pagesRes.ok) throw new Error('فشل في جلب الصفحات');
      const pagesData = await pagesRes.json();
      setPages(pagesData.pages);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newPage.slug || !newPage.title) return;
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: newPage.slug,
          title: newPage.title,
          sortOrder: pages.length * 10,
        }),
      });
      if (!res.ok) throw new Error('فشل في إنشاء الصفحة');
      setNewPage({ slug: '', title: '' });
      setSuccess('تم إنشاء الصفحة بنجاح');
      await fetchData();
    } catch (e) {
      setError('فشل في إنشاء الصفحة');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!business) return;
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذه الصفحة؟' });
    if (!ok) return;
    setDeletingId(pageId);
    setError('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/pages/${pageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('فشل في حذف الصفحة');
      setSuccess('تم حذف الصفحة بنجاح');
      await fetchData();
    } catch (e) {
      setError('فشل في حذف الصفحة');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisibility = async (page: BusinessPage) => {
    if (!business) return;
    try {
      const res = await fetch(`/api/businesses/${business.id}/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !page.isVisible }),
      });
      if (!res.ok) throw new Error('فشل في تحديث الصفحة');
      await fetchData();
    } catch (e) {
      setError('فشل في تحديث حالة الظهور');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/business-dashboard/website"
            className="p-2 rounded-md bg-surface border border-border hover:bg-slate-50 transition-colors"
            aria-label="العودة"
          >
            <ArrowRight className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileStack className="w-6 h-6 text-primary" />
              صفحات الموقع
            </h1>
            <p className="text-muted text-sm">أضف ورتّب صفحات موقعك الإضافية.</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-danger/5 border border-danger/10 rounded-lg p-4 flex items-center gap-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/5 border border-success/10 rounded-lg p-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6"
      >
        <h3 className="font-bold text-foreground mb-4">إضافة صفحة جديدة</h3>
        <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="العنوان (مثال: من نحن)"
            value={newPage.title}
            onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
            className="px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
          />
          <input
            type="text"
            placeholder="الرابط (مثال: about)"
            value={newPage.slug}
            onChange={(e) => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
            className="px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors dir-ltr"
          />
          <button
            type="submit"
            disabled={creating || !newPage.title || !newPage.slug}
            className="px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            إضافة
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-foreground">الصفحات الحالية</h3>
        </div>
        {pages.length === 0 ? (
          <EmptyState
            icon={FileStack}
            title="لا توجد صفحات بعد"
            description="أنشئ أول صفحة إضافية لموقعك أدناه"
            className="border-none bg-transparent"
          />
        ) : (
          <div className="divide-y divide-border">
            {pages.map((page) => (
              <div key={page.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {page.isHomePage ? (
                    <Home className="w-5 h-5 text-primary" />
                  ) : (
                    <FileStack className="w-5 h-5 text-muted" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{page.title}</div>
                  <div className="text-xs text-muted dir-ltr">/{page.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  {page.isHomePage ? (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">الرئيسية</span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleVisibility(page)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-muted hover:text-foreground transition-colors"
                        aria-label={page.isVisible ? 'إخفاء' : 'إظهار'}
                        title={page.isVisible ? 'إخفاء' : 'إظهار'}
                      >
                        {page.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <Link
                        href={`/business-dashboard/website/pages/${page.id}`}
                        className="px-3 py-1.5 rounded-lg text-sm text-foreground hover:bg-slate-100 transition-colors"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id)}
                        disabled={deletingId === page.id}
                        className="p-2 rounded-lg hover:bg-danger/5 text-muted hover:text-danger transition-colors disabled:opacity-60"
                        aria-label="حذف"
                      >
                        {deletingId === page.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
