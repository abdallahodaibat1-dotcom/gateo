'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Heart,
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

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

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

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      onComplete?.();
      onClose();
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-surface rounded-lg shadow-lg border border-border pointer-events-auto flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-base font-bold text-foreground">استكمل معلومات حسابك الشخصي</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-muted transition"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-danger text-center" role="alert">
                    {error}
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    أهلاً بك في Gateo
                  </h3>
                  <p className="text-sm text-muted">
                    أكمل بياناتك الأساسية لتخصيص تجربتك والتواصل مع الأنسب لك
                  </p>
                </div>

                <fieldset className="mb-6">
                  <legend className="block text-sm font-bold text-foreground mb-3">الجنس</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {genderOptions.map((g) => {
                      const Icon = g.icon;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setGender(g.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                            gender === g.value
                              ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                              : 'border-border text-muted hover:bg-slate-50'
                          }`}
                          aria-pressed={gender === g.value}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="block text-sm font-bold text-foreground mb-2">الاهتمامات</legend>
                  <p className="text-xs text-muted mb-3">
                    اختر المواضيع التي تهتم بها لنخصص تجربتك
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {interestOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = interests.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleInterest(option.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                            selected
                              ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                              : 'border-border text-muted hover:bg-slate-50'
                          }`}
                          aria-pressed={selected}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div className="p-6 border-t border-border flex items-center justify-between bg-slate-50/50">
                <button
                  type="button"
                  onClick={onSkip}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <BellOff className="w-4 h-4" />
                  تخطي الآن
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-5 py-2 rounded-md bg-primary text-white text-sm font-bold disabled:opacity-50 transition hover:bg-primary-dark"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      حفظ ومتابعة
                      <Check className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
