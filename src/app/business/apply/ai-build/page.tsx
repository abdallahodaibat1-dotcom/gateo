'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, X, Store, Trash2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/Toast';
import { loadWizardData, saveWizardData } from '@/lib/ai-wizard/types';

const BUILD_STEPS = [
  'إنشاء الهيكل الأساسي',
  'توليد المحتوى',
  'اختيار الألوان والخطوط',
  'تجهيز الصفحات',
  'جلب الصور المناسبة',
  'معالجة الصور',
  'حفظ البيانات',
  'تجهيز المعاينة',
];

export default function AiBuildPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [visibleSteps, setVisibleSteps] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [existingBusinessId, setExistingBusinessId] = useState<string | null>(null);
  const [existingBusinessName, setExistingBusinessName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [buildAttempt, setBuildAttempt] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/business/apply/ai-build');
      return;
    }
    if (status === 'loading') return;

    const data = loadWizardData();
    if (!data.analysis || !data.selectedDesignId) {
      router.push('/business/apply/ai-proposal');
      return;
    }

    let stepInterval: NodeJS.Timeout;
    let mounted = true;

    const runBuild = async () => {
      try {
        stepInterval = setInterval(() => {
          setVisibleSteps((prev) => {
            if (prev >= BUILD_STEPS.length) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 700);

        const res = await fetch('/api/ai/generate-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: data.businessName,
            categoryId: data.categoryId === 'other' ? undefined : data.categoryId,
            city: data.city,
            language: data.language,
            description: data.description,
            brandStyle: data.personality,
            websiteType: data.analysis?.websiteType || 'INTRO',
            allowReferenceExtraction: false,
            allowAiImageGeneration: true,
            wizardData: data,
          }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || result.error || 'فشل إنشاء الموقع');
        }

        const updatedData = {
          ...data,
          generatedBusinessId: result.businessId,
          generatedSlug: result.slug,
        };
        saveWizardData(updatedData);

        if (mounted) {
          setVisibleSteps(BUILD_STEPS.length);
          setCompleted(true);
          setTimeout(() => {
            router.push('/business/apply/ai-review');
          }, 900);
        }
      } catch (err) {
        clearInterval(stepInterval);
        if (mounted) {
          const message = err instanceof Error ? err.message : 'فشل إنشاء الموقع';
          setError(message);
          showToast('فشل إنشاء الموقع، يرجى المحاولة مرة أخرى', 'error');
        }
      }
    };

    const checkExistingAndBuild = async () => {
      try {
        const myRes = await fetch('/api/businesses/my');
        if (myRes.ok) {
          const myData = await myRes.json();
          if (myData?.business?.id) {
            if (mounted) {
              setExistingBusinessId(myData.business.id);
              setExistingBusinessName(myData.business.name || '');
            }
            return;
          }
        }
        await runBuild();
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'فشل التحقق من النشاط الحالي');
        }
      }
    };

    checkExistingAndBuild();

    return () => {
      mounted = false;
      clearInterval(stepInterval);
    };
  }, [status, router, showToast, buildAttempt]);

  const handleDeleteAndRebuild = async () => {
    if (!existingBusinessId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/businesses/${existingBusinessId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حذف النشاط الحالي');
      }
      showToast('تم حذف النشاط الحالي، سيتم إعادة إنشاء الموقع', 'success');
      setExistingBusinessId(null);
      setExistingBusinessName('');
      setShowDeleteConfirm(false);
      setError('');
      setVisibleSteps(0);
      setBuildAttempt((prev) => prev + 1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل الحذف', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (existingBusinessId) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">لديك نشاط تجاري بالفعل</h2>
            <p className="text-gray-600 mb-6">
              النظام يسمح بنشاط تجاري واحد لكل حساب.{' '}
              {existingBusinessName && (
                <span className="block mt-1 font-medium text-gray-800">{existingBusinessName}</span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 text-gray-500 hover:text-red-600 rounded-xl font-medium transition"
              >
                إلغاء وخروج
              </button>
              <button
                onClick={() => router.push('/business-dashboard')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                لوحة التحكم
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                <Trash2 className="w-4 h-4" />
                حذف وإنشاء موقع جديد
              </button>
            </div>
          </div>

          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-right" dir="rtl">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-lg font-bold">حذف النشاط الحالي</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  هل أنت متأكد من حذف{' '}
                  <strong>{existingBusinessName || 'النشاط الحالي'}</strong>؟ سيتم حذف جميع الصفحات والمحتوى والصور بشكل نهائي.
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
                    onClick={handleDeleteAndRebuild}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    نعم، احذف وأعد الإنشاء
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ أثناء إنشاء الموقع</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/business/apply/ai-proposal')}
              className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition"
            >
              العودة للاقتراحات
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 mb-6">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            جاري إنشاء موقعك
          </h1>
          <p className="text-gray-600">
            {completed ? 'تم الإنشاء، جاري التحويل...' : 'نقوم بتجهيز كل التفاصيل...'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
          {BUILD_STEPS.map((step, index) => {
            const isVisible = index < visibleSteps;
            const isCurrent = index === visibleSteps - 1;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0.35, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isCurrent ? 'bg-violet-50' : ''
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isVisible ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isVisible ? (
                    <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 7L5.5 10.5L12 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`font-medium ${
                    isCurrent ? 'text-violet-900' : isVisible ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>

        {!completed && !error && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <X className="w-4 h-4" />
              إلغاء وخروج
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
