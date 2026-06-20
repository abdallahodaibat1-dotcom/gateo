'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, TrendingUp, UserCheck, Award, ArrowLeft } from 'lucide-react';

interface ProfileCompletionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  completionPercent: number;
}

const checklist = [
  { label: 'صورة شخصية', threshold: 15 },
  { label: 'نبذة عنك', threshold: 30 },
  { label: 'المدينة والدولة', threshold: 50 },
  { label: 'تاريخ الميلاد', threshold: 60 },
  { label: 'الجنس والاهتمامات', threshold: 90 },
  { label: 'رابط موقعك', threshold: 100 },
];

export default function ProfileCompletionPrompt({
  isOpen,
  onClose,
  completionPercent,
}: ProfileCompletionPromptProps) {
  const nextStep = checklist.find((item) => completionPercent < item.threshold);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-primary px-6 py-6 text-white text-center">
                <button
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-bold">استكمل ملفك الشخصي</h2>
                <p className="text-xs text-white/80 mt-1">
                  كلما اكتمل ملفك، زادت فرص ظهورك وتواصلك
                </p>
              </div>

              <div className="p-6">
                {/* Progress */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-muted">مستوى الاستكمال</span>
                    <span className="font-bold text-primary">{completionPercent}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>

                {/* Next step hint */}
                {nextStep && (
                  <div className="mb-5 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground">الخطوة التالية</p>
                      <p className="text-xs text-muted">أضف {nextStep.label} لرفع مستوى اكتمال حسابك</p>
                    </div>
                  </div>
                )}

                {/* Upgrade CTA */}
                <div className="mb-5 p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">ترقية إلى حساب احترافي</h3>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">
                        احصل على مزايا إضافية، وحلول حجز، وواجهة عمل مميزة لنشاطك.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link
                    href="/upgrade"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-1 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary-dark transition"
                  >
                    ترقية الحساب
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-sm font-medium text-muted hover:text-foreground transition"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
