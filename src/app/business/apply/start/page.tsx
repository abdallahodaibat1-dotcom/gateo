'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Hammer,
  ArrowLeft,
  Loader2,
  Store,
  LayoutDashboard,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/Toast';

interface ExistingBusiness {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function ApplyStartPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [existingBusiness, setExistingBusiness] = useState<ExistingBusiness | null>(null);
  const [checking, setChecking] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/business/apply/start');
      return;
    }
    if (status === 'loading') return;

    fetch('/api/businesses/my')
      .then((res) => {
        if (res.status === 404) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.business) {
          setExistingBusiness(data.business);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [status, router]);

  const handleDeleteAndRestart = async () => {
    if (!existingBusiness) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/businesses/${existingBusiness.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حذف النشاط الحالي');
      }
      showToast('تم حذف النشاط الحالي، يمكنك إنشاء موقع جديد الآن', 'success');
      setExistingBusiness(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل الحذف', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (status === 'loading' || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ابدأ رحلة إنشاء موقعك
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            اختر الطريقة التي تناسبك. نوصي بالذكاء الاصطناعي لإنشاء موقع احترافي خلال دقائق.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {existingBusiness ? (
            <motion.div
              key="existing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-amber-200 p-8 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Store className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  لديك نشاط تجاري بالفعل
                </h2>
                <p className="text-gray-600 mb-6">
                  النظام يسمح بنشاط تجاري واحد لكل حساب. لإنشاء موقع جديد بالذكاء الاصطناعي، يجب حذف النشاط الحالي أولاً أو الانتقال إلى لوحة التحكم.
                </p>

                <div className="bg-gray-50 rounded-2xl p-5 mb-8 inline-block w-full">
                  <div className="text-sm text-gray-500 mb-1">النشاط الحالي</div>
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {existingBusiness.name}
                  </div>
                  <div className="text-sm text-violet-600">gateo.com/b/{existingBusiness.slug}</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/business-dashboard')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    الذهاب إلى لوحة التحكم
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                    حذف النشاط وإنشاء موقع جديد
                  </button>
                </div>
              </div>

              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                >
                  <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-right">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="text-lg font-bold">حذف النشاط الحالي</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      هل أنت متأكد من حذف <strong>{existingBusiness.name}</strong>؟ سيتم حذف جميع الصفحات والمحتوى والصور بشكل نهائي.
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
                        onClick={handleDeleteAndRestart}
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
            </motion.div>
          ) : (
            <motion.div
              key="choices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >

          {/* AI Option — Recommended */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/business/apply/ai-wizard">
              <div className="group relative h-full bg-white rounded-3xl shadow-sm border-2 border-violet-200 hover:border-violet-500 transition-all duration-300 hover:shadow-xl p-8 flex flex-col">
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    موصى به
                  </span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  إنشاء موقع بالذكاء الاصطناعي
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  أجب عن بعض الأسئلة، وسنقوم بإنشاء موقع احترافي متكامل خلال دقائق مع محتوى وتصميم وصور جاهزة للتعديل.
                </p>

                <div className="flex items-center gap-2 text-violet-600 font-semibold group-hover:gap-3 transition-all">
                  ابدأ الآن
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Manual Option */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/business/apply">
              <div className="group h-full bg-white rounded-3xl shadow-sm border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg p-8 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Hammer className="w-8 h-8 text-gray-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  بناء الموقع يدويًا
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  ابدأ من قالب فارغ وقم ببناء موقعك بنفسك. الخيار المناسب إذا كنت تفضل التحكم الكامل في كل تفصيلة.
                </p>

                <div className="flex items-center gap-2 text-gray-600 font-semibold group-hover:gap-3 transition-all">
                  البناء اليدوي
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 mt-10 text-sm"
        >
          يمكنك تعديل أي عنصر لاحقًا بغض النظر عن الطريقة التي تختارها.
        </motion.p>
      </main>
    </div>
  );
}
