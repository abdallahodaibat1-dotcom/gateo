'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Loader2, CheckCircle2, Store, ArrowLeft, ShieldCheck, Briefcase } from 'lucide-react';

export default function BusinessApplySentPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-12 min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="w-full max-w-lg mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-8 sm:p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <Store className="w-5 h-5 text-primary" />
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  تم استلام طلبك التجاري
                </h1>
              </div>

              <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
                حسابك التجاري قيد المراجعة الآن. سنقوم بإخطارك فور الموافقة عليه وإتاحته للعملاء.
              </p>

              <div className="bg-slate-50 border border-border rounded-md p-5 mb-8 text-right">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-surface text-primary flex items-center justify-center shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-base">حالة المراجعة</h2>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      فريقنا يقوم بمراجعة البيانات المقدمة للتأكد من اكتمالها قبل النشر.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/business-dashboard')}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  لوحة التحكم
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
