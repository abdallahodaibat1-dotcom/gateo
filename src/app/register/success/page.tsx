'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, Mail, Sparkles, ShieldCheck } from 'lucide-react';

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Subtle primary blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="inline-flex items-center">
          <img src="/logo/logo-full.svg" alt="Gateo" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px]">
          <ShieldCheck className="w-3 h-3 text-primary" />
          حساب موثوق
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface rounded-lg border border-border shadow-sm p-8 text-center">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-sm"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-3">
              تم إنشاء حسابك بنجاح!
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-6">
              مرحباً بك في <span className="font-bold text-primary">Gateo</span>. أصبح بإمكانك الآن تسجيل الدخول واستكشاف مجتمعنا.
            </p>

            {/* Info cards */}
            <div className="space-y-3 mb-8 text-right">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">تأكد من بريدك الإلكتروني</p>
                  <p className="text-[11px] text-muted">قد تحتاج إلى تأكيد حسابك عبر الرابط المرسل.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">ابدأ رحلتك</p>
                  <p className="text-[11px] text-muted">سجّل الدخول الآن واختر اهتماماتك وابني شبكتك.</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary-dark hover:shadow-md transition-all"
            >
              تسجيل الدخول
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="inline-block mt-4 text-xs text-muted hover:text-primary transition-colors"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-slate-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-muted">
            <div className="text-center sm:text-right">© {new Date().getFullYear()} Gateo. لمن هم فوق 18 سنة.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
