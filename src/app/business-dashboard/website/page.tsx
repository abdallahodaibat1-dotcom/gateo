'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  Globe,
  Palette,
  FileStack,
  ExternalLink,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface ThemeSummary {
  presetId: string | null;
  primaryColor: string;
  secondaryColor: string;
  isPublished: boolean;
}

interface PageSummary {
  id: string;
  slug: string;
  title: string;
  isHomePage: boolean;
  isVisible: boolean;
}

export default function WebsiteDashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [theme, setTheme] = useState<ThemeSummary | null>(null);
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      const [themeRes, pagesRes] = await Promise.all([
        fetch(`/api/businesses/${businessData.business.id}/theme`),
        fetch(`/api/businesses/${businessData.business.id}/pages`),
      ]);

      if (themeRes.ok) {
        const themeData = await themeRes.json();
        setTheme(themeData.theme);
      }

      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData.pages);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!business) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/theme/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('فشل في توليد الموقع');
      const data = await res.json();
      setTheme(data.theme);
      setSuccess('تم توليد الموقع بنجاح');
      await fetchData();
    } catch (e) {
      setError('فشل في توليد الموقع');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="w-40 h-7" />
              <Skeleton className="w-64 h-4" />
            </div>
            <Skeleton className="w-28 h-10 rounded-md" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <Skeleton className="w-12 h-12 rounded-lg mb-4" />
              <Skeleton className="w-32 h-5 mb-2" />
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-3/4 h-4 mb-4" />
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>
        <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
          <Skeleton className="w-32 h-5 mb-4" />
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!business) return null;

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/business/${business.slug}`;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              إدارة الموقع
            </h1>
            <p className="text-muted mt-1">
              خصّص مظهر موقعك وأضف صفحات إضافية لتقديم تجربة فريدة لعملائك.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/business/${business.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-md bg-slate-50 text-foreground text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              عرض الموقع
            </Link>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/business-dashboard/website/theme">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-6 hover:border-primary/30 transition-colors h-full"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">المظهر والألوان</h3>
            <p className="text-sm text-muted mb-4">
              اختر قالباً ذكياً أو خصّص الألوان والخط والأقسام بنفسك.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: theme?.primaryColor || '#1e40af' }}
              />
              <span
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: theme?.secondaryColor || '#0f766e' }}
              />
              <span className="text-xs text-muted mr-auto">
                {theme?.presetId ? 'قالب مخصص' : 'الإعدادات الافتراضية'}
              </span>
            </div>
          </motion.div>
        </Link>

        <Link href="/business-dashboard/website/pages">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-6 hover:border-primary/30 transition-colors h-full"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <FileStack className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">الصفحات</h3>
            <p className="text-sm text-muted mb-4">
              أضف صفحات مثل "من نحن" أو "العروض" ورتّبها في قائمة الموقع.
            </p>
            <span className="text-xs text-muted">
              {pages.length} صفحة{pages.length !== 1 ? 'ات' : ''}
            </span>
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="bg-surface rounded-lg border border-border shadow-sm p-6"
        >
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-bold text-foreground mb-1">توليد ذكي</h3>
          <p className="text-sm text-muted mb-4">
            دع النظام يقترح مظهراً وصفحات أولية بناءً على تصنف نشاطك.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            توليد موقعي
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6"
      >
        <h3 className="font-bold text-foreground mb-4">رابط الموقع</h3>
        <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-border">
          <Globe className="w-5 h-5 text-muted" />
          <span className="text-sm text-foreground dir-ltr text-left flex-1 truncate">{publicUrl}</span>
          <Link
            href={`/business/${business.slug}`}
            target="_blank"
            className="text-sm text-primary font-medium hover:text-primary-dark flex items-center gap-1"
          >
            زيارة
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
