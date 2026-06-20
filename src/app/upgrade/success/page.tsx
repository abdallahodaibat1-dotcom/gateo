'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Loader2,
  Sparkles,
  Building2,
  Store,
  User,
  ArrowLeft,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function UpgradeSuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const userName = session?.user?.name?.split(' ')[0] || 'محترفنا';

  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-12 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome / Congratulations */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white shadow-md mb-6">
              <Crown className="w-9 h-9" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              أهلاً بك في مجتمع المحترفين، {userName}
            </h1>
            <p className="text-muted max-w-lg mx-auto leading-relaxed">
              تمت ترقية حسابك بنجاح. نحن سعداء بانضمامك إلينا، ونقدّم لك خدمات
              تجارية مصممة لتعزيز حضورك ونمو أعمالك.
            </p>
          </motion.div>

          {/* Business services options */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">الخدمات التجارية</h2>
                  <p className="text-xs text-muted">اختر الخطوة التالية التي تناسب أهدافك</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Option 1: Join Business Directory */}
              <Link
                href="/professional/apply"
                className="group relative flex flex-col items-start p-5 rounded-lg border border-border bg-slate-50/50 hover:bg-surface hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">الانضمام لدليل المحترفين</h3>
                <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                  أنشئ ملفك المهني الشخصي واعرض مهاراتك وخدماتك للعملاء والشركات.
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary-dark">
                  التقديم الآن
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Option 2: Register Business Activity */}
              <Link
                href="/upgrade?phase=business"
                className="group relative flex flex-col items-start p-5 rounded-lg border border-border bg-slate-50/50 hover:bg-surface hover:border-secondary/30 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">إنشاء موقعك الإلكتروني حسب تخصصك</h3>
                <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                  حوّل حسابك إلى حساب أعمال/شركة واستفد من أدوات إدارة النشاط والحجوزات.
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary group-hover:text-secondary-light">
                  متابعة التسجيل
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Option 3: Personal Use */}
              <Link
                href="/feed"
                className="group relative flex flex-col items-start p-5 rounded-lg border border-border bg-slate-50/50 hover:bg-surface hover:border-accent/30 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">استخدام شخصي</h3>
                <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                  استمتع بالحساب الاحترافي للتواصل والاستكشاف دون الحاجة لإضافة نشاط تجاري الآن.
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent group-hover:text-warning">
                  استكشاف المنصة
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            <div className="px-6 pb-6">
              <div className="rounded-lg bg-success/5 border border-success/10 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <p className="text-sm text-success leading-relaxed">
                  يمكنك اختيار أحد الخيارات الثلاثة الآن أو لاحقاً من خلال قائمة الحساب. جميع
                  خياراتك محفوظة ومتاحة دائماً.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </>
  );
}
