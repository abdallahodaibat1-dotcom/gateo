'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, ArrowLeft, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';

const TABS = [
  { key: 'email', label: 'البريد الإلكتروني', icon: Mail },
  { key: 'phone', label: 'رقم الهاتف', icon: Phone },
];

export default function ForgotPasswordPage() {
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devInfo, setDevInfo] = useState<{ token: string; url: string } | null>(null);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v: string) => /^[0-9]{9,15}$/.test(v.replace(/\D/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setDevInfo(null);

    const isValid = tab === 'email' ? isValidEmail(value) : isValidPhone(value);
    if (!isValid) {
      setError(tab === 'email' ? 'أدخل بريد إلكتروني صحيح' : 'أدخل رقم هاتف صحيح');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ');

      setSuccess(true);
      if (data.devToken && data.devResetUrl) {
        setDevInfo({ token: data.devToken, url: data.devResetUrl });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputId = tab === 'email' ? 'email-input' : 'phone-input';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative z-10"
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
            <h1 className="text-2xl font-bold text-foreground">استرداد الحساب</h1>
            <p className="text-sm text-muted mt-1">أدخل بريدك الإلكتروني أو رقم هاتفك لإعادة تعيين كلمة المرور</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-md bg-primary/5 text-primary text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            رابط آمن لإعادة التعيين
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600 text-center">{error}</div>
          )}

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="text-emerald-700 font-medium">تم إرسال طلب استرداد الحساب</p>
              <p className="text-sm text-muted">
                إذا كان الحساب موجوداً، ستصلك تعليمات إعادة تعيين كلمة المرور قريباً.
              </p>
              {devInfo && (
                <div className="text-left bg-slate-50 rounded-md p-4 text-xs text-muted overflow-auto border border-border">
                  <p className="font-semibold mb-1 text-foreground">وضع التطوير:</p>
                  <p>الرمز: <code className="text-primary">{devInfo.token}</code></p>
                  <p>الرابط: <Link href={devInfo.url} className="text-primary hover:text-primary-dark underline">{devInfo.url}</Link></p>
                </div>
              )}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-dark"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex bg-slate-100 rounded-md p-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => { setTab(t.key as 'email' | 'phone'); setValue(''); setError(''); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        tab === t.key ? 'bg-surface text-primary shadow-sm border border-border' : 'text-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div>
                <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
                  {tab === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}
                </label>
                <input
                  id={inputId}
                  type={tab === 'email' ? 'email' : 'tel'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder={tab === 'email' ? 'example@gateo.com' : '05XXXXXXXX'}
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال رابط التعيين
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            تذكرتِ كلمة المرور؟{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary-dark">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
