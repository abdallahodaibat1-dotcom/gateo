'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AppleSignInButton from '@/components/AppleSignInButton';

const TABS = [
  { key: 'email', label: 'البريد', icon: Mail },
  { key: 'phone', label: 'الهاتف', icon: Phone },
];

const FOOTER_LINKS = [
  { label: 'الخصوصية', href: '/privacy' },
  { label: 'الشروط', href: '/terms' },
  { label: 'المحتوى', href: '/content-policy' },
  { label: 'المساعدة', href: '/help' },
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'email' | 'phone'>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v: string) => /^[0-9]{9,15}$/.test(v.replace(/\D/g, ''));

  const sendOtp = async () => {
    if (!isValidPhone(phone)) { setError('أدخل رقم هاتف صحيح'); return; }
    setError('');
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إرسال الرمز');
      setOtpSent(true);
      setInfo(data.message || 'تم إرسال رمز التحقق');
      setOtpCountdown(60);
      const timer = setInterval(() => {
        setOtpCountdown((prev) => { if (prev <= 1) clearInterval(timer); return prev - 1; });
      }, 1000);
    } catch (e: any) { setError(e.message); }
    finally { setOtpLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (tab === 'email') {
        if (!isValidEmail(email)) { setError('أدخل بريد إلكتروني صحيح'); setLoading(false); return; }
        if (password.length < 6) { setError('أدخل كلمة المرور'); setLoading(false); return; }
        console.log('[LOGIN DEBUG] signing in with:', { emailOrPhone: email.trim(), passwordLength: password.length });
        const result = await signIn('credentials', { emailOrPhone: email.trim(), password, redirect: false, callbackUrl: '/' });
        console.log('[LOGIN DEBUG] result:', result);
        if (result?.error) {
          setError('البريد أو كلمة المرور غير صحيحة. إذا كان هذا حساب مشرف، استخدم بوابة الإدارة.');
          return;
        }
      } else {
        if (!isValidPhone(phone)) { setError('أدخل رقم هاتف صحيح'); setLoading(false); return; }
        if (otp.length !== 6) { setError('أدخل رمز التحقق'); setLoading(false); return; }
        const result = await signIn('phone-otp', { phone: phone.trim(), otp, redirect: false, callbackUrl: '/' });
        if (result?.error) { setError('رمز التحقق غير صحيح'); return; }
      }
      router.push('/');
      router.refresh();
    } catch { setError('حدث خطأ في الاتصال'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 bg-surface border-b border-border">
        <Link href="/" className="inline-flex items-center gap-2">
          <img src="/logo/logo-full.svg" alt="Gateo" className="h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-xl font-bold text-primary hidden sm:block">Gateo</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs">
          <ShieldCheck className="w-3 h-3" />
          دخول آمن
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Welcome — hidden on small screens */}
          <div className="hidden lg:block text-right">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-3">
                اكتشف عالم <span className="text-primary">الأعمال</span>
              </h1>
              <p className="text-sm text-muted leading-relaxed mb-5 max-w-md">
                تواصل مع أفضل الشركات والمحترفين. تسوّق بأمان وانضم لمجتمع موثوق للأعمال والخدمات.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-foreground text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>حسابات موثقة</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-foreground text-xs">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>دخول بالبريد أو الهاتف</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface rounded-xl shadow-lg border border-border p-5 sm:p-8 w-full max-w-[440px] mx-auto lg:max-w-none"
          >
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-foreground">تسجيل الدخول</h2>
              <p className="text-sm text-muted mt-1">أهلاً بك في Gateo</p>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-danger text-center" role="alert">{error}</div>}
            {info && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-sm text-success text-center" role="status">{info}</div>}

            <div className="flex bg-slate-100 rounded-lg p-0.5 mb-4">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => { setTab(t.key as 'email' | 'phone'); setError(''); setInfo(''); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                      tab === t.key ? 'bg-surface text-primary shadow-sm' : 'text-slate-500 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <GoogleSignInButton mode="signin" />
              <AppleSignInButton mode="signin" />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-muted">أو</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {tab === 'email' ? (
                  <motion.div key="email" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-border bg-surface pr-9 pl-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="example@gateo.com" dir="ltr" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور</label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-border bg-surface pr-9 pl-9 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="••••••" dir="ltr" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="space-y-4">
                    <div>
                      <label htmlFor="login-phone" className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input id="login-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-border bg-surface pr-9 pl-3 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="05XXXXXXXX" dir="ltr" />
                      </div>
                    </div>
                    {otpSent && (
                      <div>
                        <label htmlFor="login-otp" className="block text-sm font-medium text-foreground mb-1.5">رمز التحقق</label>
                        <input id="login-otp" type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-center text-base tracking-[0.5em] text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="••••••" dir="ltr" />
                      </div>
                    )}
                    <button type="button" onClick={sendOtp} disabled={otpLoading || otpCountdown > 0} className="w-full rounded-md border border-primary text-primary px-3 py-2.5 text-sm font-medium hover:bg-primary/5 disabled:opacity-50 transition">
                      {otpLoading ? <span className="flex items-center justify-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري...</span>
                        : otpCountdown > 0 ? `إعادة الإرسال ${otpCountdown}`
                          : otpSent ? 'إعادة إرسال الرمز' : 'إرسال رمز التحقق'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {tab === 'email' && (
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-medium">نسيت كلمة المرور؟</Link>
                </div>
              )}

              <button type="submit" disabled={loading || (tab === 'phone' && !otpSent)} className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition flex items-center justify-center gap-1.5">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري...</> : <>دخول <ArrowLeft className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted">
              ليس لديك حساب؟ <Link href="/register" className="font-bold text-primary hover:text-primary-dark">إنشاء حساب</Link>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-surface shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {FOOTER_LINKS.map((link) => (<Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">{link.label}</Link>))}
            </div>
            <div className="text-center sm:text-right">© {new Date().getFullYear()} Gateo. لمن هم فوق 18 سنة.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
