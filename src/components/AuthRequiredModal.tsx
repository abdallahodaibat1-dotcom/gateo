'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'يجب تسجيل الدخول',
  description = 'للحفاظ على أمان حسابات مستخدمي المنصة، يُرجى تسجيل الدخول أو إنشاء حساب جديد للمتابعة.',
}: AuthRequiredModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50"
          >
            <div className="bg-surface rounded-lg shadow-lg p-6 text-center relative overflow-hidden border border-border">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-muted hover:bg-slate-200 transition"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed mb-6">{description}</p>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark transition"
                >
                  تسجيل الدخول
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-primary text-primary px-4 py-3 text-sm font-bold hover:bg-primary/5 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
