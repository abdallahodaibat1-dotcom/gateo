'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? '' : 'الرابط غير صالح أو منتهي الصلاحية');
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (!/[A-Z]/.test(pass)) return 'يجب إضافة حرف إنجليزي كبير مثل A أو B';
    if (!/[a-z]/.test(pass)) return 'يجب إضافة حرف إنجليزي صغير مثل a أو b';
    if (!/[0-9]/.test(pass)) return 'يجب إضافة رقم واحد على الأقل';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!token) {
      setError('الرابط غير صالح');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ');

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-lg border border-border shadow-sm p-8">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <img
                src="/logo/logo-full.svg"
                alt="Gateo"
                className="h-12 mx-auto mb-4"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">إعادة تعيين كلمة المرور</h1>
            <p className="text-sm text-muted mt-1">أدخل كلمة مرور جديدة قوية لحماية حسابك</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-md bg-primary/10 text-primary text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            اختاري كلمة مرور قوية
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600 text-center">{error}</div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-emerald-700 font-medium">تم تغيير كلمة المرور بنجاح</p>
              <p className="text-sm text-muted">سيتم تحويلك إلى صفحة تسجيل الدخول...</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark">
                <ArrowLeft className="w-4 h-4" />
                تسجيل الدخول الآن
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface pr-11 pl-11 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-muted">
                  <li className={newPassword.length >= 8 ? 'text-emerald-600' : ''}>• 8 أحرف على الأقل</li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-emerald-600' : ''}>• حرف إنجليزي كبير (A-Z)</li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-emerald-600' : ''}>• حرف إنجليزي صغير (a-z)</li>
                  <li className={/[0-9]/.test(newPassword) ? 'text-emerald-600' : ''}>• رقم واحد</li>
                </ul>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface pr-11 pl-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  <>
                    حفظ كلمة المرور الجديدة
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
