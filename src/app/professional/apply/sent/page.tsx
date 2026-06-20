'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  Loader2,
  CheckCircle2,
  User,
  Briefcase,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function ProfessionalApplySentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleApprove = async () => {
    if (!session?.user?.id) return;
    setApproving(true);
    try {
      // Confirm the profile should be publicly listed on the gateway.
      await fetch('/api/professionals/confirm-public', { method: 'POST' });
    } catch {
      // Even if the confirmation call fails, we still redirect to the profile
      // so the user is not stuck.
    } finally {
      router.push(`/profile/${session.user.id}`);
    }
  };

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

              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                مرحباً بك في دليل المحترفين
              </h1>

              <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
                تم استلام ملفك المهني بنجاح وهو قيد المراجعة الآن. بمجرد الموافقة عليه سيكون متاحاً للعملاء والشركات في دليل الأعمال.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="bg-slate-50 border border-border rounded-md p-5 mb-8 text-right"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-surface text-primary flex items-center justify-center shadow-sm shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground text-base">طلب الموافقة بالنشر</h2>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      هل توافق على نشر ملفك المهني في دليل الأعمال العام بعد اكتمال المراجعة؟
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {approving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4" />
                        أوافق على النشر
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${session?.user?.id}`)}
                    disabled={approving}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-surface border border-border text-foreground text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <User className="w-4 h-4" />
                    لاحقاً
                  </button>
                </div>
              </motion.div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                سيتم إشعارك فور الموافقة على طلبك
              </div>

              <button
                type="button"
                onClick={() => router.push(`/profile/${session?.user?.id}`)}
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-dark transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة إلى الملف الشخصي
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
