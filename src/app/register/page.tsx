'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ShieldCheck, User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Check, Building2 } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import AppleSignInButton from '@/components/AppleSignInButton';
import CountrySelect from '@/components/CountrySelect';

interface Country {
  id: string;
  name: string;
  flagEmoji: string;
  phoneCode: string;
}

const FOOTER_LINKS = [
  { label: 'الخصوصية', href: '/privacy' },
  { label: 'الشروط', href: '/terms' },
  { label: 'المحتوى', href: '/content-policy' },
  { label: 'المساعدة', href: '/help' },
];

const FORM_STORAGE_KEY = 'gateo_register_draft';

interface DraftForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(() => {
    const defaultForm = { firstName: '', lastName: '', email: '', phone: '', password: '', countryId: '' };
    if (typeof window === 'undefined') return defaultForm;
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (!saved) return defaultForm;
      const draft: DraftForm = JSON.parse(saved);
      return {
        ...defaultForm,
        firstName: draft.firstName || '',
        lastName: draft.lastName || '',
        email: draft.email || '',
        phone: draft.phone || '',
        countryId: draft.countryId || '',
      };
    } catch {
      return defaultForm;
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const selectedCountry = countries.find((c) => c.id === form.countryId);
  const phoneCode = selectedCountry?.phoneCode || '';

  // Persist draft on change (excluding password)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const draft: DraftForm = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      countryId: form.countryId,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft));
  }, [form.firstName, form.lastName, form.email, form.phone, form.countryId]);

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((d) => {
        if (d.countries) {
          setCountries(d.countries);
          // Default to Saudi Arabia (+966), otherwise the first country
          const defaultCountry =
            d.countries.find((c: Country) => c.phoneCode === '+966') || d.countries[0];
          const savedCountryId =
            typeof window !== 'undefined'
              ? JSON.parse(localStorage.getItem(FORM_STORAGE_KEY) || '{}')?.countryId
              : '';
          if (defaultCountry && !form.countryId && !savedCountryId) {
            setForm((prev) => ({ ...prev, countryId: defaultCountry.id }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setCountriesLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    if (!form.firstName.trim()) { setError('أدخل الاسم الأول'); return; }
    if (!form.lastName.trim()) { setError('أدخل الاسم الأخير'); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('أدخل بريد صحيح'); return; }
    const localPhoneDigits = form.phone.startsWith(phoneCode) ? form.phone.slice(phoneCode.length).replace(/\D/g, '') : form.phone.replace(/^\+\d+/, '').replace(/\D/g, '');
    if (!form.phone.trim() || localPhoneDigits.length < 8) { setError('أدخل رقم هاتف صحيح'); return; }
    if (!form.countryId) { setError('اختيار الدولة مطلوب'); return; }
    const passError = validatePassword(form.password);
    if (passError) { setError(passError); return; }
    if (!agreedToTerms) { setError('يجب الموافقة على الشروط'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, phone: form.phone.trim() }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
      // Clear saved draft on successful registration
      if (typeof window !== 'undefined') {
        localStorage.removeItem(FORM_STORAGE_KEY);
      }

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        emailOrPhone: form.email.trim(),
        password: form.password,
        redirect: false,
        callbackUrl: '/onboarding',
      });

      if (loginResult?.ok && !loginResult?.error) {
        router.push('/onboarding');
        router.refresh();
      } else {
        // Fallback to success page if auto-login fails
        router.push('/register/success');
      }
    } catch { setError('حدث خطأ في الاتصال'); }
    finally { setLoading(false); }
  };

  const passwordChecks = [
    { label: '8 أحرف على الأقل', valid: form.password.length >= 8 },
    { label: 'حرف إنجليزي كبير (A-Z)', valid: /[A-Z]/.test(form.password) },
    { label: 'حرف إنجليزي صغير (a-z)', valid: /[a-z]/.test(form.password) },
    { label: 'رقم (0-9)', valid: /[0-9]/.test(form.password) },
  ];

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
          حساب آمن
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 relative z-10 flex items-start justify-center px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Welcome — hidden on small screens */}
          <div className="hidden lg:block text-right">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-3">
                انضم إلى <span className="text-primary">Gateo</span>
              </h1>
              <p className="text-sm text-muted leading-relaxed mb-5 max-w-md">
                سجّل حسابك واكتشف عالماً من الأعمال والخدمات. مجتمع مهني موثوق للتواصل والتطوير.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-foreground text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>حساب موثق</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-foreground text-xs">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>سجّل نشاطك التجاري</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface rounded-xl shadow-lg border border-border p-4 sm:p-6 w-full max-w-[520px] mx-auto lg:max-w-none"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-foreground">إنشاء حساب</h2>
              <p className="text-xs text-muted mt-1">انضم إلى مجتمع Gateo</p>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-danger text-center" role="alert">{error}</div>}

            <div className="grid grid-cols-2 gap-2">
              <GoogleSignInButton mode="signup" callbackUrl="/onboarding" />
              <AppleSignInButton mode="signup" callbackUrl="/onboarding" />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-muted">أو</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="register-firstName" className="block text-sm font-medium text-foreground mb-1.5">الاسم الأول</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="register-firstName" name="firstName" type="text" value={form.firstName} onChange={handleChange} className="w-full rounded-md border border-border bg-surface pr-9 pl-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="محمد" />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-lastName" className="block text-sm font-medium text-foreground mb-1.5">الاسم الأخير</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="register-lastName" name="lastName" type="text" value={form.lastName} onChange={handleChange} className="w-full rounded-md border border-border bg-surface pr-9 pl-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="أحمد" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-md border border-border bg-surface pr-9 pl-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="example@gateo.com" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-phone" className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
                  <div className="flex gap-2">
                    <div className="shrink-0 w-24">
                      <CountrySelect
                        countries={countries}
                        value={form.countryId}
                        onChange={(id) => {
                          const selected = countries.find((c) => c.id === id);
                          setForm((prev) => {
                            const currentCountry = countries.find((c) => c.id === prev.countryId);
                            const currentCode = currentCountry?.phoneCode || '';
                            const newCode = selected?.phoneCode || '';
                            const localPart = currentCode && prev.phone.startsWith(currentCode)
                              ? prev.phone.slice(currentCode.length)
                              : prev.phone.replace(/^\+\d+/, '');
                            return { ...prev, countryId: id, phone: newCode + localPart };
                          });
                        }}
                        label=""
                        placeholder="🌐"
                        autoDetect={false}
                        loading={countriesLoading}
                        hideChevron
                        showPhoneCode
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="register-phone"
                        name="phone"
                        type="tel"
                        value={form.phone.startsWith(selectedCountry?.phoneCode || '') ? form.phone.slice((selectedCountry?.phoneCode || '').length) : form.phone.replace(/^\+\d+/, '')}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          const code = selectedCountry?.phoneCode || '';
                          setForm((prev) => ({ ...prev, phone: code + digits }));
                        }}
                        className="w-full rounded-md border border-border bg-surface pr-9 pl-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                        placeholder="77778870"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className="w-full rounded-md border border-border bg-surface pr-9 pl-9 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="••••••••" dir="ltr" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className={`flex items-center gap-1 text-xs ${check.valid ? 'text-success' : 'text-slate-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${check.valid ? 'bg-success/10' : 'bg-slate-100'}`}>
                        {check.valid ? <Check className="w-3 h-3" /> : <div className="w-1 h-1 rounded-full bg-slate-300" />}
                      </div>
                      {check.label}
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input id="register-terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                <span className="text-xs text-muted leading-relaxed">
                  أوافق على <Link href="/terms" className="text-primary hover:underline font-medium">الشروط</Link> و<Link href="/privacy" className="text-primary hover:underline font-medium">الخصوصية</Link>. لمن هم فوق 18 سنة.
                </span>
              </label>

              <button type="submit" disabled={loading || !form.countryId} className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition flex items-center justify-center gap-1.5">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري...</> : <>إنشاء <ArrowLeft className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-muted">
              لديك حساب؟ <Link href="/login" className="font-bold text-primary hover:text-primary-dark">دخول</Link>
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
