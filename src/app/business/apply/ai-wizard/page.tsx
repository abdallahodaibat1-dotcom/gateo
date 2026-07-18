'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { WizardShell } from '@/components/ai-wizard/WizardShell';
import { StepBusinessInfo } from '@/components/ai-wizard/steps/StepBusinessInfo';
import { StepCategory } from '@/components/ai-wizard/steps/StepCategory';
import { StepDescription } from '@/components/ai-wizard/steps/StepDescription';
import { StepAudience } from '@/components/ai-wizard/steps/StepAudience';
import { StepPersonality } from '@/components/ai-wizard/steps/StepPersonality';
import { StepIdentity } from '@/components/ai-wizard/steps/StepIdentity';
import { useAiWizard } from '@/hooks/ai-wizard/useAiWizard';
import Navbar from '@/components/Navbar';

interface Category {
  id: string;
  name: string;
  nameEn?: string | null;
}

const STEP_LABELS = [
  'معلومات النشاط',
  'التصنيف',
  'وصف النشاط',
  'الجمهور',
  'شخصية التصميم',
  'الهوية البصرية',
];

export default function AiWizardPage() {
  const { status } = useSession();
  const router = useRouter();
  const { data, loaded, updateData, updateField } = useAiWizard();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; flagEmoji: string; phoneCode: string }[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/business/apply/ai-wizard');
      return;
    }
    if (status === 'loading') return;

    fetch('/api/businesses/my')
      .then((res) => {
        if (res.ok) {
          router.push('/business/apply/start');
        }
      })
      .catch(() => {})
      .finally(() => setCheckingBusiness(false));
  }, [status, router]);

  useEffect(() => {
    fetch('/api/categories?type=BUSINESS')
      .then((res) => res.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : d.categories || [];
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((d) => {
        setCountries(d.countries || []);
      })
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, []);

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 1:
        return (
          data.businessName.trim().length >= 2 &&
          data.countryId !== '' &&
          data.city.trim().length > 0
        );
      case 2:
        return (
          data.categoryId !== '' &&
          (data.categoryId !== 'other' || (data.customCategory || '').trim().length > 0)
        );
      case 3:
        return data.description.trim().length >= 10;
      case 4:
        return data.audiences.length > 0;
      case 5:
        return !!data.personality;
      case 6:
        if (!data.hasVisualIdentity) return true;
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < STEP_LABELS.length) {
      setStep(step + 1);
    } else {
      router.push('/business/apply/ai-analyze');
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  if (status === 'loading' || !loaded || checkingBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <WizardShell
        currentStep={step}
        totalSteps={STEP_LABELS.length}
        labels={STEP_LABELS}
        onNext={handleNext}
        onPrev={handlePrev}
        onCancel={() => router.push('/')}
        canNext={validateStep(step)}
        isLast={step === STEP_LABELS.length}
      >
        {step === 1 && (
          <StepBusinessInfo
            businessName={data.businessName}
            logo={data.logo}
            countryId={data.countryId}
            city={data.city}
            countries={countries}
            countriesLoading={countriesLoading}
            onChange={(updates) => updateData(updates)}
          />
        )}
        {step === 2 && (
          <StepCategory
            categories={categories}
            value={data.categoryId}
            customValue={data.customCategory}
            onChange={(id, custom) =>
              updateData({ categoryId: id, customCategory: custom })
            }
          />
        )}
        {step === 3 && (
          <StepDescription
            value={data.description}
            onChange={(v) => updateField('description', v)}
          />
        )}
        {step === 4 && (
          <StepAudience
            value={data.audiences}
            onChange={(v) => updateField('audiences', v)}
          />
        )}
        {step === 5 && (
          <StepPersonality
            value={data.personality}
            onChange={(v) => updateField('personality', v)}
          />
        )}
        {step === 6 && (
          <StepIdentity
            hasIdentity={data.hasVisualIdentity}
            identity={data.visualIdentity}
            onHasIdentityChange={(v) => updateField('hasVisualIdentity', v)}
            onIdentityChange={(updates) =>
              updateData({ visualIdentity: { ...data.visualIdentity, ...updates } })
            }
          />
        )}
      </WizardShell>
    </>
  );
}
