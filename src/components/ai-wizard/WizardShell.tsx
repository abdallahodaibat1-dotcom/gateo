'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, X } from 'lucide-react';
import { WizardProgress } from './WizardProgress';

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  children: ReactNode;
  onNext: () => void;
  onPrev: () => void;
  onCancel?: () => void;
  canNext: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
}

export function WizardShell({
  currentStep,
  totalSteps,
  labels,
  children,
  onNext,
  onPrev,
  onCancel,
  canNext,
  isLast,
  isSubmitting,
}: WizardShellProps) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">إنشاء موقع بالذكاء الاصطناعي</span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              إلغاء وخروج
            </button>
          )}
        </div>

        <WizardProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          labels={labels}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentStep === 1 || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ArrowRight className="w-5 h-5" />
            السابق
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canNext || isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري...
              </>
            ) : isLast ? (
              <>
                <CheckCircle className="w-5 h-5" />
                إنهاء
              </>
            ) : (
              <>
                التالي
                <ArrowLeft className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
