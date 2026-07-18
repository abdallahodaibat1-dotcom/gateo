'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2,
  Globe,
  Layout,
  FileText,
  Palette,
  Type,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Wand2,
  Images,
  Paintbrush,
  Edit3,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/Toast';
import { loadWizardData, clearWizardData, saveWizardData } from '@/lib/ai-wizard/types';

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  cover?: string;
  category?: { name: string };
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    homeTemplate: string;
  };
  pages: { slug: string; title: string; isVisible: boolean }[];
  assets: { type: string; url: string }[];
}

function getInitialData() {
  return loadWizardData();
}

export default function AiReviewPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [data] = useState(getInitialData);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/business/apply/ai-review');
      return;
    }
    if (status === 'loading') return;

    if (!data.generatedBusinessId) {
      router.push('/business/apply/ai-build');
      return;
    }

    fetch(`/api/businesses/${data.generatedBusinessId}`)
      .then((res) => res.json())
      .then((d) => {
        setBusiness(d.business || null);
      })
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));
  }, [status, router, data.generatedBusinessId]);

  const handleApprove = () => {
    if (!business) return;
    clearWizardData();
    showToast('تم اعتماد الموقع بنجاح', 'success');
    window.open(`/business/${business.slug}/home`, '_blank');
    router.push('/business-dashboard/website');
  };

  const handleDelete = async () => {
    if (!business) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('فشل حذف الموقع');
      }
      // Keep wizard answers but remove generated business info so user can rebuild
      const currentData = loadWizardData();
      saveWizardData({
        ...currentData,
        generatedBusinessId: undefined,
        generatedSlug: undefined,
        analysis: undefined,
        selectedDesignId: undefined,
      });
      showToast('تم التراجع عن إنشاء الموقع', 'success');
      router.push('/business/apply/ai-proposal');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل التراجع', 'error');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">لم يتم العثور على بيانات الموقع.</p>
          <button
            onClick={() => router.push('/business/apply/ai-wizard')}
            className="mt-4 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition"
          >
            إعادة البدء
          </button>
        </main>
      </div>
    );
  }

  const visiblePages = business.pages.filter((p) => p.isVisible);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            الموقع جاهز للمراجعة
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
          <p className="text-gray-600">راجع التفاصيل قبل اعتماد الموقع.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="aspect-video bg-gray-100 relative">
              {business.cover ? (
                <img
                  src={business.cover}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: business.theme?.primaryColor || '#7c3aed' }}
                >
                  {business.name}
                </div>
              )}
            </div>            
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">معاينة الصفحة الرئيسية</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{business.description}</p>
              <a
                href={`/business/${business.slug}/home`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-violet-600 font-medium hover:underline"
              >
                <Globe className="w-4 h-4" />
                فتح المعاينة
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">الهوية البصرية</h2>
            <div className="space-y-4">
              <IdentityItem
                icon={Palette}
                label="الألوان"
                value={
                  <div className="flex items-center gap-2">
                    <ColorDot color={business.theme?.primaryColor || '#7c3aed'} />
                    <ColorDot color={business.theme?.secondaryColor || '#ec4899'} />
                    <ColorDot color={business.theme?.accentColor || '#f59e0b'} />
                  </div>
                }
              />
              <IdentityItem icon={Type} label="الخط" value={business.theme?.fontFamily || 'Cairo'} />
              <IdentityItem icon={Layout} label="قالب الصفحة الرئيسية" value={business.theme?.homeTemplate || 'default'} />
              <IdentityItem icon={FileText} label="عدد الصفحات" value={`${visiblePages.length} صفحة`} />
              <IdentityItem icon={Images} label="عدد الصور" value={`${business.assets.length} صورة`} />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">الصفحات</h2>
          <div className="flex flex-wrap gap-2">
            {visiblePages.map((page) => (
              <span
                key={page.slug}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm"
              >
                {page.title}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-10"
        >
          <ActionButton
            icon={Edit3}
            label="تعديل المحتوى"
            onClick={() => router.push('/business-dashboard/website/pages')}
          />
          <ActionButton
            icon={Wand2}
            label="تغيير التصميم"
            onClick={() => router.push('/business-dashboard/website/theme')}
          />
          <ActionButton
            icon={Images}
            label="تغيير الصور"
            onClick={() => router.push('/business-dashboard/website')}
          />
          <ActionButton
            icon={Paintbrush}
            label="تغيير الألوان"
            onClick={() => router.push('/business-dashboard/website/theme')}
          />
          <ActionButton
            icon={RefreshCw}
            label="إعادة التحليل"
            onClick={() => router.push('/business/apply/ai-analyze')}
          />
          <ActionButton
            icon={Wand2}
            label="إعادة إنشاء الموقع"
            onClick={() => router.push('/business/apply/ai-build')}
          />
          <ActionButton
            icon={Trash2}
            label="تراجع عن إنشاء الموقع"
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          />
        </motion.div>

        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-right" dir="rtl">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">تراجع عن إنشاء الموقع</h3>
              </div>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف هذا الموقع؟ سيتم حذف جميع الصفحات والمحتوى والصور بشكل نهائي.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  نعم، احذف الموقع
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
          >
            خروج بدون اعتماد
          </button>
          <button
            onClick={() => router.push('/business-dashboard/website/theme')}
            className="px-8 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
          >
            تعديل في المحرر
          </button>
          <button
            onClick={handleApprove}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition"
          >
            <CheckCircle className="w-5 h-5" />
            اعتماد الموقع
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}

function IdentityItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-gray-500">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="w-6 h-6 rounded-full border border-gray-200 inline-block"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const variantClasses =
    variant === 'danger'
      ? 'border-red-200 bg-white hover:border-red-400 hover:bg-red-50 text-red-700'
      : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50';
  const iconColor = variant === 'danger' ? 'text-red-600' : 'text-violet-600';
  const labelColor = variant === 'danger' ? 'text-red-700' : 'text-gray-700';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition text-center ${variantClasses}`}
    >
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
    </button>
  );
}
