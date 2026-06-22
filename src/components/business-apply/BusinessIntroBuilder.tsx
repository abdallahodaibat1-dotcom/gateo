'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, Eye, X } from 'lucide-react';
import { BuilderStepSidebar, BuilderStep } from './BuilderStepSidebar';
import { IntroWebsitePreview } from './IntroWebsitePreview';
import type { ExtractedThemeColors } from '@/lib/color-extraction';

interface Service {
  name: string;
  description?: string;
  price?: string;
  duration?: string;
  image?: string;
}

interface FormShape {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  logo?: string;
  cover?: string;
  gallery?: string[];
  services?: Service[];
  city?: string;
  phone?: string;
  designId?: string;
  themeColors?: ExtractedThemeColors | null;
}

interface Category {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}

interface BusinessIntroBuilderProps {
  steps: BuilderStep[];
  step: number;
  setStep: (step: number) => void;
  form: FormShape;
  categories?: Category[];
  designId?: string;
  themeColors?: ExtractedThemeColors | null;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
  children: React.ReactNode;
}

export function BusinessIntroBuilder({
  steps,
  step,
  setStep,
  form,
  categories,
  designId,
  themeColors,
  onBack,
  onNext,
  onSubmit,
  submitting,
  children,
}: BusinessIntroBuilderProps) {
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const isLastStep = step === steps.length;

  const handleStepClick = (stepId: number) => {
    setStep(stepId);
  };

  const primaryAction = isLastStep ? onSubmit : onNext;
  const primaryLabel = isLastStep ? (submitting ? 'جاري الإنشاء...' : 'إنشاء حسابي التجاري') : 'التالي';
  const PrimaryIcon = isLastStep ? Sparkles : ArrowLeft;

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="h-16 shrink-0 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">رجوع</span>
          </button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-base font-bold text-foreground">بناء الموقع التعريفي</h1>
            <p className="text-[11px] text-muted hidden sm:block">أنشئي موقعاً احترافياً لعملك خطوة بخطوة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile preview toggle */}
          <button
            type="button"
            onClick={() => setShowMobilePreview(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">معاينة</span>
          </button>

          <button
            type="button"
            onClick={primaryAction}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PrimaryIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">{primaryLabel}</span>
            <span className="sm:hidden">{isLastStep ? (submitting ? '...' : 'إنشاء') : 'التالي'}</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 hidden md:block">
          <BuilderStepSidebar steps={steps} currentStep={step} onStepClick={handleStepClick} />
        </aside>

        {/* Step content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Mobile step progress */}
            <div className="md:hidden mb-4">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${Math.round(((step - 1) / (steps.length - 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted mt-1.5 text-center">
                {steps[step - 1]?.title} — {step} من {steps.length}
              </p>
            </div>

            {children}

            {/* Mobile navigation */}
            <div className="md:hidden mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="px-4 py-2 rounded-md text-muted hover:bg-slate-100 disabled:opacity-30 flex items-center gap-1.5 text-sm"
              >
                <ArrowRight className="w-4 h-4" />
                السابق
              </button>
              <button
                type="button"
                onClick={primaryAction}
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {primaryLabel}
              </button>
            </div>
          </div>
        </main>

        {/* Preview panel */}
        <aside className="w-[45%] min-w-[360px] max-w-[520px] shrink-0 hidden lg:block overflow-auto border-r border-border bg-slate-50 p-5">
          <IntroWebsitePreview form={form} categories={categories} designId={designId} themeColors={themeColors} />
        </aside>
      </div>

      {/* Mobile preview drawer */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobilePreview(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-slate-50 shadow-xl overflow-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-sm">معاينة الموقع</h2>
              <button
                type="button"
                onClick={() => setShowMobilePreview(false)}
                className="p-2 rounded-md hover:bg-slate-100 text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <IntroWebsitePreview form={form} categories={categories} designId={designId} themeColors={themeColors} />
          </div>
        </div>
      )}
    </div>
  );
}
