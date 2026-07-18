'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/ui/Toast';
import { loadWizardData, saveWizardData } from '@/lib/ai-wizard/types';
import { BusinessAnalysisOutput } from '@/lib/ai/schemas/business-analysis-schema';

const ANALYSIS_STEPS = [
  'تحليل النشاط',
  'فهم الخدمات',
  'تحديد الجمهور',
  'تحليل المنافسين',
  'اختيار التصميم الأنسب',
  'اختيار نظام الألوان',
  'اختيار الخطوط',
  'تحديد الصفحات المناسبة',
  'كتابة المحتوى',
  'إنشاء الصور المقترحة',
  'تجهيز الموقع',
];

export default function AiAnalyzePage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [visibleSteps, setVisibleSteps] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/business/apply/ai-analyze');
      return;
    }
    if (status === 'loading') return;

    const data = loadWizardData();
    if (!data.businessName) {
      router.push('/business/apply/ai-wizard');
      return;
    }

    let stepInterval: NodeJS.Timeout;
    let mounted = true;

    const runAnalysis = async () => {
      try {
        stepInterval = setInterval(() => {
          setVisibleSteps((prev) => {
            if (prev >= ANALYSIS_STEPS.length) {
              clearInterval(stepInterval);
              return prev;
            }
            return prev + 1;
          });
        }, 450);

        const res = await fetch('/api/ai/analyze-business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || result.error || 'فشل التحليل');
        }

        const analysis: BusinessAnalysisOutput = result.analysis;
        const updatedData = { ...data, analysis };
        saveWizardData(updatedData);

        if (mounted) {
          setVisibleSteps(ANALYSIS_STEPS.length);
          setTimeout(() => {
            router.push('/business/apply/ai-proposal');
          }, 900);
        }
      } catch (err) {
        clearInterval(stepInterval);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'فشل التحليل');
          showToast('فشل التحليل الذكي، يرجى المحاولة مرة أخرى', 'error');
        }
      }
    };

    runAnalysis();

    return () => {
      mounted = false;
      clearInterval(stepInterval);
    };
  }, [status, router, showToast]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ أثناء التحليل</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/business/apply/ai-wizard')}
              className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition"
            >
              العودة للمعالج
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
            يقوم الذكاء الاصطناعي بتحليل نشاطك
          </h1>
          <p className="text-gray-600">
            هذا قد يستغرق بضع ثوانٍ...
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
          {ANALYSIS_STEPS.map((step, index) => {
            const isVisible = index < visibleSteps;
            const isCurrent = index === visibleSteps - 1;
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: isVisible ? 1 : 0.35,
                  x: 0,
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isCurrent ? 'bg-violet-50' : ''
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isVisible
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
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
      </main>
    </div>
  );
}
