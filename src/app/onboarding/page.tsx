'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  User,
  Heart,
  X,
  Check,
  Loader2,
  BellOff,
  FlaskConical,
  Store,
  Stethoscope,
  Sparkles,
  Shirt,
  Cpu,
  Dumbbell,
  Palette,
  Plane,
  Utensils,
  Music,
  Camera,
  TrendingUp,
  Rocket,
  Megaphone,
  PenTool,
  Code,
  Building2,
  Car,
  GraduationCap,
  BookOpen,
  Film,
  Globe2,
} from 'lucide-react';

const genderOptions = [
  { value: 'MALE', label: 'ذكر', icon: User },
  { value: 'FEMALE', label: 'أنثى', icon: Heart },
];

const interestOptions = [
  { value: 'science', label: 'العلوم', icon: FlaskConical },
  { value: 'business', label: 'التجارة', icon: Store },
  { value: 'medical', label: 'الطب', icon: Stethoscope },
  { value: 'beauty', label: 'الجمال', icon: Sparkles },
  { value: 'fashion', label: 'الموضة', icon: Shirt },
  { value: 'technology', label: 'التقنية', icon: Cpu },
  { value: 'sports', label: 'الرياضة', icon: Dumbbell },
  { value: 'arts', label: 'الفنون', icon: Palette },
  { value: 'travel', label: 'السفر', icon: Plane },
  { value: 'cooking', label: 'الطبخ', icon: Utensils },
  { value: 'music', label: 'الموسيقى', icon: Music },
  { value: 'photography', label: 'التصوير', icon: Camera },
  { value: 'investment', label: 'الاستثمار', icon: TrendingUp },
  { value: 'entrepreneurship', label: 'ريادة الأعمال', icon: Rocket },
  { value: 'marketing', label: 'التسويق', icon: Megaphone },
  { value: 'design', label: 'التصميم', icon: PenTool },
  { value: 'programming', label: 'البرمجة', icon: Code },
  { value: 'real_estate', label: 'العقارات', icon: Building2 },
  { value: 'cars', label: 'السيارات', icon: Car },
  { value: 'education', label: 'التعليم', icon: GraduationCap },
  { value: 'literature', label: 'الأدب', icon: BookOpen },
  { value: 'cinema', label: 'السينما', icon: Film },
  { value: 'culture', label: 'الثقافة', icon: Globe2 },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.replace('/login');
      return;
    }

    // If the user already completed onboarding, send them home
    fetch('/api/account/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profile?.onboardingCompleted || data?.profile?.onboardingSkipped) {
          router.replace('/');
        }
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [session, status, router]);

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender,
          interests: interests.join(', '),
          onboardingCompleted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'حدث خطأ أثناء الحفظ');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSkipping(true);
    try {
      await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingSkipped: true }),
      });
    } catch {
      // ignore
    } finally {
      setSkipping(false);
      router.push('/');
    }
  };

  if (status === 'loading' || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface sticky top-0 z-10">
          <h1 className="text-lg font-bold text-foreground">استكمل معلومات حسابك الشخصي</h1>
          <button
            onClick={handleSkip}
            disabled={skipping}
            className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center text-muted transition"
            aria-label="تخطي"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-xs text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">أهلاً بك في Gateo</h2>
            <p className="text-sm text-muted">
              أكمل بياناتك الأساسية لتخصيص تجربتك والتواصل مع الأنسب لك
            </p>
          </div>

          {/* Gender */}
          <fieldset className="mb-8">
            <legend className="block text-sm font-bold text-foreground mb-3">الجنس</legend>
            <div className="grid grid-cols-2 gap-4">
              {genderOptions.map((g) => {
                const Icon = g.icon;
                const inputId = `gender-${g.value}`;
                return (
                  <label
                    key={g.value}
                    htmlFor={inputId}
                    className={`flex flex-col items-center gap-2 p-5 rounded-lg border transition-all cursor-pointer ${
                      gender === g.value
                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                        : 'border-border text-muted hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name="gender"
                      value={g.value}
                      checked={gender === g.value}
                      onChange={() => setGender(g.value)}
                      className="sr-only"
                    />
                    <Icon className="w-7 h-7" />
                    <span className="text-base font-medium">{g.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Interests */}
          <fieldset className="mb-8">
            <legend className="block text-sm font-bold text-foreground mb-2">الاهتمامات</legend>
            <p className="text-xs text-muted mb-4">
              اختر المواضيع التي تهتم بها لنخصص تجربتك
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {interestOptions.map((option) => {
                const Icon = option.icon;
                const selected = interests.includes(option.value);
                const inputId = `interest-${option.value}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={inputId}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                      selected
                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                        : 'border-border text-muted hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      value={option.value}
                      checked={selected}
                      onChange={() => toggleInterest(option.value)}
                      className="sr-only"
                    />
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={handleSkip}
            disabled={skipping || saving}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <BellOff className="w-4 h-4" />
            تذكيري لاحقاً
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-8 py-2.5 rounded-md bg-primary text-white text-sm font-bold disabled:opacity-50 transition hover:bg-primary-dark"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                حفظ ومتابعة
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
