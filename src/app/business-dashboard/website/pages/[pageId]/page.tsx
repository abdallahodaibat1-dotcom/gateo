'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Save,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  slug: string;
}

interface BusinessPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  isVisible: boolean;
  isHomePage: boolean;
  sortOrder: number;
}

export default function PageEditorPage() {
  const router = useRouter();
  const params = useParams<{ pageId: string }>();
  const { pageId } = params;

  const [business, setBusiness] = useState<Business | null>(null);
  const [page, setPage] = useState<BusinessPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [pageId]);

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

      const pageRes = await fetch(`/api/businesses/${businessData.business.id}/pages/${pageId}`);
      if (!pageRes.ok) throw new Error('فشل في جلب الصفحة');
      const pageData = await pageRes.json();
      setPage(pageData.page);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business || !page) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          content: page.content,
          isVisible: page.isVisible,
          sortOrder: page.sortOrder,
        }),
      });
      if (!res.ok) throw new Error('فشل في حفظ الصفحة');
      setSuccess('تم حفظ الصفحة بنجاح');
    } catch (e) {
      setError('فشل في حفظ الصفحة');
    } finally {
      setSaving(false);
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
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/business-dashboard/website/pages"
            className="p-2 rounded-md bg-surface border border-border hover:bg-slate-50 transition-colors"
            aria-label="العودة"
          >
            <ArrowRight className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              تعديل الصفحة
            </h1>
            <p className="text-muted text-sm">{page.title}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ
        </button>
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
        className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="page-title" className="block text-sm text-muted mb-1">عنوان الصفحة</label>
            <input
              id="page-title"
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="page-slug" className="block text-sm text-muted mb-1">الرابط</label>
            <input
              id="page-slug"
              type="text"
              value={page.slug}
              onChange={(e) =>
                setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
              }
              disabled={page.isHomePage}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors dir-ltr disabled:bg-slate-100"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="page-order" className="block text-sm text-muted mb-1">الترتيب</label>
            <input
              id="page-order"
              type="number"
              value={page.sortOrder}
              onChange={(e) => setPage({ ...page, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={page.isVisible}
                onChange={(e) => setPage({ ...page, isVisible: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:border-primary"
              />
              ظاهر في الموقع
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="page-content" className="block text-sm text-muted mb-1">المحتوى</label>
          <textarea
            id="page-content"
            value={page.content || ''}
            onChange={(e) => setPage({ ...page, content: e.target.value })}
            rows={16}
            className="w-full px-4 py-3 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
            placeholder="اكتب محتوى الصفحة هنا..."
          />
        </div>

        <div className="text-xs text-muted">
          ملاحظة: المحتوى يُعرض كنص بسيط حالياً. سيُدعم تنسيق HTML والـ Markdown مستقبلاً.
        </div>
      </motion.div>
    </div>
  );
}
