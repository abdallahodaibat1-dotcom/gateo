'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import {
  Loader2,
  Plus,
  Trash2,
  Briefcase,
  Sparkles,
  User,
  Building2,
  Layers,
  GraduationCap,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Save,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Country {
  id: string;
  name: string;
  flagEmoji: string;
  phoneCode?: string;
}

interface UserData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  profile?: {
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE';
    countryId?: string;
    country?: string;
    education?: EducationData;
    experience?: ExperienceData;
    skills?: string;
    interests?: string;
  };
}

interface EducationData {
  degree?: string;
  specialization?: string;
  institution?: string;
  secondarySchool?: string;
  graduationYear?: string;
  certificates?: string;
}

interface ExperienceData {
  currentCompany?: string;
  currentTitle?: string;
  yearsOfExperience?: string;
  previousWorkplaces?: string[];
  bio?: string;
}

type Gender = 'MALE' | 'FEMALE';

const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'ذكر',
  FEMALE: 'أنثى',
};

const MARITAL_STATUS_LABELS: Record<string, string> = {
  SINGLE: 'أعزب',
  MARRIED: 'متزوج',
  DIVORCED: 'مطلق',
  WIDOWED: 'أرمل',
  SEPARATED: 'منفصل',
};

const PROFILE_STEPS = [
  { key: 'personal', label: 'معلومات شخصية', icon: User },
  { key: 'professional', label: 'معلومات مهنية', icon: GraduationCap },
  { key: 'review', label: 'المراجعة والحفظ', icon: CheckCircle2 },
];

const BUSINESS_STEPS = [
  { key: 'business-basic', label: 'بيانات النشاط', icon: Building2 },
  { key: 'specializations', label: 'التخصصات', icon: Layers },
  { key: 'business-extra', label: 'إضافية', icon: Users },
  { key: 'business-review', label: 'مراجعة', icon: CheckCircle2 },
];

export default function UpgradePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <UpgradePage />
    </Suspense>
  );
}

function UpgradePage() {
  const { status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Phase: 'profile' or 'business'
  const initialPhase = searchParams.get('phase') === 'business' ? 'business' : 'profile';
  const [phase, setPhase] = useState<'profile' | 'business'>(initialPhase);
  const [step, setStep] = useState(0);

  // Personal info
  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    birthDate: '',
    gender: '' as Gender | '',
    nationality: '',
  });

  // Professional info
  const [education, setEducation] = useState<EducationData>({
    degree: '',
    specialization: '',
    institution: '',
    secondarySchool: '',
    graduationYear: '',
    certificates: '',
  });

  const [experience, setExperience] = useState<ExperienceData>({
    currentCompany: '',
    currentTitle: '',
    yearsOfExperience: '',
    previousWorkplaces: [],
    bio: '',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Business info
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
    logo: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    businessType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'COMPANY',
    isPublicOnGateway: true,
    maritalStatus: '',
    familySize: '',
    hasChildren: false,
    numberOfChildren: '',
  });

  const [specializations, setSpecializations] = useState<Record<string, Set<string>>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  const [countries, setCountries] = useState<Country[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const STORAGE_KEY = 'gateo_upgrade_draft';

  // Persist form data automatically, but avoid saving an empty draft that could
  // override server-fetched profile data on the next visit.
  useEffect(() => {
    const hasPersonal = Object.values(personal).some((v) => v !== '');
    const hasEducation = Object.values(education).some((v) => v !== '');
    const hasExperience =
      Object.values(experience).some((v) =>
        Array.isArray(v) ? v.length > 0 : v !== ''
      ) || (experience.previousWorkplaces?.length ?? 0) > 0;
    const hasSkills = skills.length > 0;
    const hasBusiness = Object.values(businessForm).some((v) =>
      typeof v === 'boolean' ? true : v !== ''
    );
    const hasSpecializations = Object.keys(specializations).length > 0;

    if (!hasPersonal && !hasEducation && !hasExperience && !hasSkills && !hasBusiness && !hasSpecializations && step === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const draft = {
      personal,
      education,
      experience,
      skills,
      businessForm,
      specializations: Object.fromEntries(
        Object.entries(specializations).map(([k, v]) => [k, Array.from(v)])
      ),
      phase,
      step,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [personal, education, experience, skills, businessForm, specializations, phase, step]);

  const uploadFile = async (file: File, variant: 'avatar' | 'cover') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('variant', variant);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error;
      throw new Error(typeof msg === 'string' ? msg : 'فشل في رفع الملف');
    }

    const data = await res.json();
    return data.url as string;
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    variant: 'avatar' | 'cover',
    field: 'avatar' | 'logo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [field]: true }));
    setError('');
    try {
      const url = await uploadFile(file, variant);
      if (field === 'avatar') {
        updatePersonal('avatar', url);
      } else {
        updateBusinessForm('logo', url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في رفع الصورة');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Build form base state from the user's account data fetched from the server.
  // The server is the source of truth for already-saved profile information.
  const buildStateFromUserData = useCallback((data: UserData) => {
    const nameParts = (data.name || '').trim().split(/\s+/);
    const personalBase = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: data.email || '',
      phone: data.phone || '',
      avatar: data.avatar || '',
      birthDate: data.profile?.birthDate
        ? new Date(data.profile.birthDate).toISOString().split('T')[0]
        : '',
      gender: (data.profile?.gender || '') as Gender | '',
      nationality: data.profile?.countryId || data.profile?.country || '',
    };

    const educationBase: EducationData = {
      degree: '',
      specialization: '',
      institution: '',
      secondarySchool: '',
      graduationYear: '',
      certificates: '',
      ...(data.profile?.education || {}),
    };

    const experienceBase: ExperienceData = data.profile?.experience
      ? {
          ...data.profile.experience,
          previousWorkplaces: data.profile.experience.previousWorkplaces || [],
        }
      : {
          currentCompany: '',
          currentTitle: '',
          yearsOfExperience: '',
          previousWorkplaces: [],
          bio: '',
        };

    // Fall back to onboarding interests if no skills were saved explicitly
    const skillsSource = data.profile?.skills || data.profile?.interests || '';
    const skillsBase = skillsSource
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    return { personal: personalBase, education: educationBase, experience: experienceBase, skills: skillsBase };
  }, []);

  // Merge a saved draft over the server-provided base, preferring non-empty
  // draft values only when the user actually typed something in this form.
  const mergeDraftOverBase = useCallback(
    (base: ReturnType<typeof buildStateFromUserData>, draft: any) => {
      const merged = { ...base };

      if (draft?.personal && typeof draft.personal === 'object') {
        merged.personal = { ...base.personal };
        (Object.keys(base.personal) as Array<keyof typeof base.personal>).forEach((key) => {
          const draftValue = draft.personal[key];
          if (draftValue !== undefined && draftValue !== '') {
            (merged.personal as any)[key] = draftValue;
          }
        });
      }

      if (draft?.education && typeof draft.education === 'object') {
        merged.education = { ...base.education };
        (Object.keys(base.education) as Array<keyof EducationData>).forEach((key) => {
          const draftValue = draft.education[key];
          if (draftValue !== undefined && draftValue !== '') {
            (merged.education as any)[key] = draftValue;
          }
        });
      }

      if (draft?.experience && typeof draft.experience === 'object') {
        merged.experience = {
          ...base.experience,
          previousWorkplaces:
            Array.isArray(draft.experience.previousWorkplaces) &&
            draft.experience.previousWorkplaces.length > 0
              ? draft.experience.previousWorkplaces
              : base.experience.previousWorkplaces,
        };
        (['currentCompany', 'currentTitle', 'yearsOfExperience', 'bio'] as const).forEach((key) => {
          const draftValue = draft.experience[key];
          if (draftValue !== undefined && draftValue !== '') {
            (merged.experience as any)[key] = draftValue;
          }
        });
      }

      if (Array.isArray(draft?.skills) && draft.skills.length > 0) {
        merged.skills = draft.skills as string[];
      }

      return merged;
    },
    []
  );

  // Load user data, categories, and any saved draft
  useEffect(() => {
    if (status !== 'authenticated') return;

    fetch('/api/account/me')
      .then((res) => res.json())
      .then((data: UserData) => {
        if (!data) return;

        const base = buildStateFromUserData(data);
        let merged = base;
        let parsedDraft: any = null;

        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
          try {
            parsedDraft = JSON.parse(saved);
            merged = mergeDraftOverBase(base, parsedDraft);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        setPersonal(merged.personal);
        setEducation(merged.education);
        setExperience(merged.experience);
        if (merged.skills.length > 0) {
          setSkills(merged.skills);
          setSkillsInput(merged.skills.join(', '));
        }

        // Restore wizard position only from a meaningful draft.
        // Respect an explicit `phase` query parameter over the saved draft.
        const urlPhase = searchParams.get('phase');
        const hasExplicitPhase = urlPhase === 'profile' || urlPhase === 'business';

        if (parsedDraft) {
          if (!hasExplicitPhase && (parsedDraft.phase === 'profile' || parsedDraft.phase === 'business')) {
            setPhase(parsedDraft.phase);
          }
          if (typeof parsedDraft.step === 'number') {
            setStep(parsedDraft.step);
          }
          if (parsedDraft.businessForm && typeof parsedDraft.businessForm === 'object') {
            setBusinessForm((prev) => ({ ...prev, ...parsedDraft.businessForm }));
          }
          if (parsedDraft.specializations && typeof parsedDraft.specializations === 'object') {
            const parsed: Record<string, Set<string>> = {};
            Object.entries(parsedDraft.specializations).forEach(([categoryId, subs]) => {
              parsed[categoryId] = new Set(Array.isArray(subs) ? subs : []);
            });
            setSpecializations(parsed);
          }
        }
      })
      .catch(() => {})
      .finally(() => setUserLoading(false));

    fetch('/api/categories?withSubs=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));

    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        if (data.countries) setCountries(data.countries);
      })
      .catch(() => setCountries([]));
  }, [status, buildStateFromUserData, mergeDraftOverBase, searchParams]);

  const updatePersonal = (field: keyof typeof personal, value: string) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  };

  const updateEducation = (field: keyof EducationData, value: string) => {
    setEducation((prev) => ({ ...prev, [field]: value }));
  };

  const updateExperience = (field: keyof ExperienceData, value: string) => {
    setExperience((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillsInput = (value: string) => {
    setSkillsInput(value);
    setSkills(
      value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  };

  const addPreviousWorkplace = () => {
    setExperience((prev) => ({
      ...prev,
      previousWorkplaces: [...(prev.previousWorkplaces || []), ''],
    }));
  };

  const updatePreviousWorkplace = (index: number, value: string) => {
    setExperience((prev) => {
      const list = [...(prev.previousWorkplaces || [])];
      list[index] = value;
      return { ...prev, previousWorkplaces: list };
    });
  };

  const removePreviousWorkplace = (index: number) => {
    setExperience((prev) => ({
      ...prev,
      previousWorkplaces: (prev.previousWorkplaces || []).filter((_, i) => i !== index),
    }));
  };

  const updateBusinessForm = (field: keyof typeof businessForm, value: string | boolean) => {
    setBusinessForm((prev) => ({ ...prev, [field]: value }));
  };

  const isCategorySelected = (categoryId: string) => !!specializations[categoryId];

  const isSubcategorySelected = (categoryId: string, subcategoryId: string) =>
    specializations[categoryId]?.has(subcategoryId) ?? false;

  const toggleCategory = (categoryId: string, checked: boolean) => {
    setSpecializations((prev) => {
      const next = { ...prev };
      if (checked) {
        if (!next[categoryId]) next[categoryId] = new Set();
      } else {
        delete next[categoryId];
      }
      return next;
    });
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string, checked: boolean) => {
    setSpecializations((prev) => {
      const next = { ...prev };
      if (checked) {
        if (!next[categoryId]) next[categoryId] = new Set();
        next[categoryId].add(subcategoryId);
      } else {
        next[categoryId]?.delete(subcategoryId);
        if (!next[categoryId] || next[categoryId].size === 0) {
          delete next[categoryId];
        }
      }
      return { ...next };
    });
  };

  const steps = phase === 'profile' ? PROFILE_STEPS : BUSINESS_STEPS;
  const StepIcon = steps[step].icon;

  const validateProfileStep = (targetStep: number) => {
    setError('');
    // All fields are optional; allow free navigation between steps.
    return true;
  };

  const nextStep = () => {
    if (phase === 'profile') {
      if (validateProfileStep(step + 1)) {
        setStep((s) => Math.min(s + 1, PROFILE_STEPS.length - 1));
      }
    } else {
      setStep((s) => Math.min(s + 1, BUSINESS_STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const goToStep = (index: number) => {
    if (phase === 'profile') {
      if (index <= step || validateProfileStep(index)) {
        setStep(index);
      }
    } else {
      setStep(index);
    }
  };

  const saveProfile = async () => {
    setError('');
    setSuccessMessage('');

    setSavingProfile(true);
    try {
      const fullName = `${personal.firstName.trim()} ${personal.lastName.trim()}`.trim();
      const selectedNationality = countries.find((c) => c.id === personal.nationality);
      const payload = {
        name: fullName || undefined,
        email: personal.email.trim() || null,
        phone: personal.phone.trim() || null,
        avatar: personal.avatar.trim() || null,
        birthDate: personal.birthDate || null,
        gender: personal.gender || null,
        countryId: personal.nationality || null,
        country: selectedNationality?.name || undefined,
        education: {
          degree: education.degree?.trim() || undefined,
          specialization: education.specialization?.trim() || undefined,
          institution: education.institution?.trim() || undefined,
          secondarySchool: education.secondarySchool?.trim() || undefined,
          graduationYear: education.graduationYear?.trim() || undefined,
          certificates: education.certificates?.trim() || undefined,
        },
        experience: {
          currentCompany: experience.currentCompany?.trim() || undefined,
          currentTitle: experience.currentTitle?.trim() || undefined,
          yearsOfExperience: experience.yearsOfExperience?.trim() || undefined,
          previousWorkplaces: experience.previousWorkplaces?.filter(Boolean) || [],
          bio: experience.bio?.trim() || undefined,
        },
        skills: skills.join(', ') || null,
      };

      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error;
        setError(typeof msg === 'string' ? msg : 'فشل في حفظ المعلومات الشخصية');
        return;
      }

      // Refresh the auth session so the new avatar/name appear immediately across the app
      await updateSession({
        avatar: personal.avatar.trim() || null,
        name: `${personal.firstName.trim()} ${personal.lastName.trim()}`.trim() || null,
      });
      // When coming from the onboarding flow, go straight to friend suggestions.
      // Otherwise show the post-upgrade success/options screen.
      if (searchParams.get('from') === 'onboarding') {
        router.push('/friends/suggestions');
      } else {
        router.push('/upgrade/success');
      }
      return;
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSavingProfile(false);
    }
  };

  const buildBusinessPayload = () => {
    const specs = Object.entries(specializations).map(([categoryId, subcategoryIdsSet]) => ({
      categoryId,
      subcategoryIds: Array.from(subcategoryIdsSet),
    }));

    const familyInfo =
      businessForm.maritalStatus || businessForm.familySize || businessForm.hasChildren || businessForm.numberOfChildren
        ? {
            maritalStatus: businessForm.maritalStatus || undefined,
            familySize: businessForm.familySize ? Number(businessForm.familySize) : undefined,
            hasChildren: businessForm.hasChildren || undefined,
            numberOfChildren: businessForm.hasChildren && businessForm.numberOfChildren
              ? Number(businessForm.numberOfChildren)
              : undefined,
          }
        : undefined;

    return {
      name: businessForm.name.trim() || undefined,
      description: businessForm.description.trim() || undefined,
      logo: businessForm.logo.trim() || undefined,
      city: businessForm.city.trim() || undefined,
      phone: businessForm.phone.trim() || undefined,
      email: businessForm.email.trim() || undefined,
      website: businessForm.website.trim() || undefined,
      businessType: businessForm.businessType,
      specializations: specs,
      familyInfo,
      isPublicOnGateway: businessForm.isPublicOnGateway,
    };
  };

  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBusinessPayload()),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(STORAGE_KEY);
        router.push('/business-dashboard');
      } else {
        const msg = data.error;
        let displayError = typeof msg === 'string' ? msg : 'فشل في إرسال طلب الترقية التجارية';
        if (Array.isArray(data.details) && data.details.length > 0) {
          const fieldNames: Record<string, string> = {
            name: 'اسم النشاط',
            description: 'الوصف',
            logo: 'شعار النشاط',
            city: 'المدينة',
            phone: 'الهاتف',
            email: 'البريد الإلكتروني',
            website: 'الموقع الإلكتروني',
            businessType: 'نوع الحساب',
            specializations: 'التخصصات',
            'specializations.categoryId': 'التخصصات',
            'specializations.subcategoryIds': 'التخصصات',
            workExperience: 'الخبرات',
            familyInfo: 'معلومات العائلة',
            'familyInfo.maritalStatus': 'الحالة الاجتماعية',
            'familyInfo.familySize': 'عدد أفراد الأسرة',
            'familyInfo.hasChildren': 'لدي أطفال',
            'familyInfo.numberOfChildren': 'عدد الأطفال',
            isPublicOnGateway: 'الظهور في البوابة العامة',
          };
          const detailsText = data.details
            .map((issue: { path?: (string | number)[]; message?: string }) => {
              const path = issue.path?.join('.') || '';
              const field = fieldNames[path] || path;
              return `${field}: ${issue.message || ''}`;
            })
            .join(' • ');
          displayError += ` (${detailsText})`;
        }
        setError(displayError);
      }
    } catch {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-8 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground">
                    {phase === 'profile' ? 'استكمال الملف الشخصي' : 'ترقية الحساب إلى تجاري'}
                  </h1>
                  <p className="text-[11px] text-muted">
                    {phase === 'profile'
                      ? 'أدخل المعلومات الشخصية والمهنية لبناء الثقة في المنصة'
                      : 'أضف بيانات النشاط التجاري للظهور في البوابة العامة'}
                  </p>
                </div>
              </div>
            </div>

            {/* Wizard Steps */}
            <div className="px-4 pt-4">
              <div className="relative flex items-center justify-between mb-2">
                {steps.map((s, index) => {
                  const Icon = s.icon;
                  const isActive = index === step;
                  const isCompleted = index < step;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => goToStep(index)}
                      className="relative z-10 flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive
                            ? 'border-primary bg-primary/5 text-primary'
                            : isCompleted
                            ? 'border-success bg-success/5 text-success'
                            : 'border-border bg-surface text-muted group-hover:border-primary/50'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-[10px] font-medium hidden sm:block ${
                          isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  );
                })}

                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-0 mx-4">
                  <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-primary/5 text-primary flex items-center justify-center">
                  <StepIcon className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs font-bold text-foreground">
                  الخطوة {step + 1} من {steps.length}: {steps[step].label}
                </h2>
              </div>
            </div>

            <div className="p-4 pt-0">
              {error && (
                <div className="rounded-lg bg-danger/5 border border-danger/10 p-2 text-xs text-danger text-center mb-3">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-lg bg-success/5 border border-success/10 p-2 text-xs text-success text-center mb-3">
                  {successMessage}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* ===== PROFILE: PERSONAL INFO ===== */}
                {phase === 'profile' && step === 0 && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="firstName" className="block text-xs font-medium text-foreground mb-1">
                          الاسم الأول
                        </label>
                        <div className="relative">
                          <User className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="firstName"
                            type="text"
                            value={personal.firstName}
                            onChange={(e) => updatePersonal('firstName', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="مثال: أحمد"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-xs font-medium text-foreground mb-1">
                          اسم العائلة
                        </label>
                        <div className="relative">
                          <User className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="lastName"
                            type="text"
                            value={personal.lastName}
                            onChange={(e) => updatePersonal('lastName', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="مثال: محمد"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-xs font-medium text-foreground mb-1">
                          البريد الإلكتروني
                        </label>
                        <div className="relative">
                          <Mail className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="email"
                            type="email"
                            dir="ltr"
                            value={personal.email}
                            onChange={(e) => updatePersonal('email', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="example@gateo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-xs font-medium text-foreground mb-1">
                          رقم الهاتف
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="phone"
                            type="tel"
                            dir="ltr"
                            value={personal.phone}
                            onChange={(e) => updatePersonal('phone', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="05XXXXXXXX"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="avatarUpload" className="block text-xs font-medium text-foreground mb-1">
                          الصورة الشخصية
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-50 border border-border overflow-hidden flex items-center justify-center shrink-0">
                            {personal.avatar ? (
                              <img
                                src={personal.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted" />
                            )}
                          </div>
                          <label htmlFor="avatarUpload" className="flex-1 cursor-pointer">
                            <input
                              id="avatarUpload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'avatar', 'avatar')}
                              className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-foreground">
                              {uploading.avatar ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              {uploading.avatar ? 'جاري الرفع...' : 'اختر صورة شخصية'}
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="birthDate" className="block text-xs font-medium text-foreground mb-1">
                          تاريخ الميلاد
                        </label>
                        <div className="relative">
                          <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="birthDate"
                            type="date"
                            dir="ltr"
                            value={personal.birthDate}
                            onChange={(e) => updatePersonal('birthDate', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-xs font-medium text-foreground mb-1">
                          الجنس
                        </label>
                        <select
                          id="gender"
                          value={personal.gender}
                          onChange={(e) => updatePersonal('gender', e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                        >
                          <option value="">اختر الجنس</option>
                          {(Object.keys(GENDER_LABELS) as Gender[]).map((key) => (
                            <option key={key} value={key}>
                              {GENDER_LABELS[key]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <CountrySelect
                          countries={countries}
                          value={personal.nationality}
                          onChange={(id) => updatePersonal('nationality', id)}
                          label="الجنسية"
                          placeholder="اختر الجنسية"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ===== PROFILE: PROFESSIONAL INFO ===== */}
                {phase === 'profile' && step === 1 && (
                  <motion.div
                    key="professional"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Education */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        التعليم
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="degree" className="block text-[11px] font-medium text-muted mb-1">أعلى مؤهل علمي</label>
                          <input
                            id="degree"
                            type="text"
                            value={education.degree}
                            onChange={(e) => updateEducation('degree', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="مثال: بكالوريوس"
                          />
                        </div>
                        <div>
                          <label htmlFor="specialization" className="block text-[11px] font-medium text-muted mb-1">التخصص</label>
                          <input
                            id="specialization"
                            type="text"
                            value={education.specialization}
                            onChange={(e) => updateEducation('specialization', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="مثال: علوم الحاسب"
                          />
                        </div>
                        <div>
                          <label htmlFor="institution" className="block text-[11px] font-medium text-muted mb-1">اسم المؤسسة التعليمية</label>
                          <input
                            id="institution"
                            type="text"
                            value={education.institution}
                            onChange={(e) => updateEducation('institution', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="مثال: جامعة الملك سعود"
                          />
                        </div>
                        <div>
                          <label htmlFor="secondarySchool" className="block text-[11px] font-medium text-muted mb-1">المدرسة الثانوية</label>
                          <input
                            id="secondarySchool"
                            type="text"
                            value={education.secondarySchool}
                            onChange={(e) => updateEducation('secondarySchool', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="اسم المدرسة الثانوية"
                          />
                        </div>
                        <div>
                          <label htmlFor="graduationYear" className="block text-[11px] font-medium text-muted mb-1">سنة التخرج</label>
                          <input
                            id="graduationYear"
                            type="number"
                            min={1950}
                            max={new Date().getFullYear()}
                            value={education.graduationYear}
                            onChange={(e) => updateEducation('graduationYear', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="2020"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="certificates" className="block text-[11px] font-medium text-muted mb-1">الشهادات الإضافية</label>
                          <textarea
                            id="certificates"
                            value={education.certificates}
                            onChange={(e) => updateEducation('certificates', e.target.value)}
                            rows={2}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs resize-none"
                            placeholder="اذكر أهم الشهادات الحاصل عليها..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Experience */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        الخبرات
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="currentCompany" className="block text-[11px] font-medium text-muted mb-1">
                            مكان العمل الحالي
                          </label>
                          <input
                            id="currentCompany"
                            type="text"
                            value={experience.currentCompany}
                            onChange={(e) => updateExperience('currentCompany', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="مثال: شركة Gateo"
                          />
                        </div>
                        <div>
                          <label htmlFor="currentTitle" className="block text-[11px] font-medium text-muted mb-1">المسمى الوظيفي الحالي</label>
                          <input
                            id="currentTitle"
                            type="text"
                            value={experience.currentTitle}
                            onChange={(e) => updateExperience('currentTitle', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="مثال: مصمم واجهات مستخدم"
                          />
                        </div>
                        <div>
                          <label htmlFor="yearsOfExperience" className="block text-[11px] font-medium text-muted mb-1">سنوات الخبرة</label>
                          <input
                            id="yearsOfExperience"
                            type="number"
                            min={0}
                            value={experience.yearsOfExperience}
                            onChange={(e) => updateExperience('yearsOfExperience', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="مثال: 5"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="bio" className="block text-[11px] font-medium text-muted mb-1">نبذة عن الخبرة</label>
                          <textarea
                            id="bio"
                            value={experience.bio}
                            onChange={(e) => updateExperience('bio', e.target.value)}
                            rows={2}
                            className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs resize-none"
                            placeholder="اكتب نبذة مختصرة عن خبراتك العملية..."
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="block text-[11px] font-medium text-muted">أماكن العمل السابقة</span>
                          <button
                            type="button"
                            onClick={addPreviousWorkplace}
                            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary-dark"
                          >
                            <Plus className="w-3 h-3" />
                            إضافة
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {(experience.previousWorkplaces || []).map((place, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={place}
                                onChange={(e) => updatePreviousWorkplace(index, e.target.value)}
                                className="flex-1 px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                                placeholder="اسم الشركة أو المؤسسة"
                                aria-label={`مكان العمل السابق ${index + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removePreviousWorkplace(index)}
                                aria-label="حذف مكان العمل السابق"
                                className="p-1 rounded-md text-muted hover:text-danger hover:bg-danger/5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        المهارات الأساسية
                      </h3>
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => handleSkillsInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                        placeholder="اكتب المهارات مفصولة بفاصلة: تصميم، برمجة، تسويق"
                      />
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ===== PROFILE: REVIEW & SAVE ===== */}
                {phase === 'profile' && step === 2 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <h3 className="text-xs font-bold text-foreground">ملخص المعلومات الشخصية</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <SummaryItem label="الاسم الأول" value={personal.firstName} />
                        <SummaryItem label="اسم العائلة" value={personal.lastName} />
                        <SummaryItem label="البريد" value={personal.email} />
                        <SummaryItem label="الهاتف" value={personal.phone} />
                        <SummaryItem label="تاريخ الميلاد" value={personal.birthDate} />
                        <SummaryItem label="الجنس" value={personal.gender ? GENDER_LABELS[personal.gender] : ''} />
                        <SummaryItem
                          label="الجنسية"
                          value={countries.find((c) => c.id === personal.nationality)?.name}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <h3 className="text-xs font-bold text-foreground">ملخص المعلومات المهنية</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <SummaryItem label="المؤهل" value={education.degree} />
                        <SummaryItem label="التخصص" value={education.specialization} />
                        <SummaryItem label="المؤسسة" value={education.institution} />
                        <SummaryItem label="المدرسة الثانوية" value={education.secondarySchool} />
                        <SummaryItem label="سنة التخرج" value={education.graduationYear} />
                        <SummaryItem label="مكان العمل الحالي" value={experience.currentCompany} />
                        <SummaryItem label="المسمى الوظيفي" value={experience.currentTitle} />
                        <SummaryItem label="سنوات الخبرة" value={experience.yearsOfExperience} />
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-full bg-surface border border-border text-foreground text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-primary/5 text-primary text-[11px] rounded-lg">
                      راجع بياناتك ثم اضغط حفظ الملف الشخصي للمتابعة.
                    </div>
                  </motion.div>
                )}

                {/* ===== BUSINESS: BASIC INFO ===== */}
                {phase === 'business' && step === 0 && (
                  <motion.div
                    key="business-basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <span className="block text-xs font-medium text-foreground mb-1.5">نوع الحساب التجاري</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { value: 'INDIVIDUAL', label: 'احترافي فردي', icon: User },
                          { value: 'COMPANY', label: 'شركة', icon: Building2 },
                        ].map((option) => {
                          const Icon = option.icon;
                          const inputId = `businessType-${option.value}`;
                          return (
                            <label
                              key={option.value}
                              htmlFor={inputId}
                              className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium transition-all ${
                                businessForm.businessType === option.value
                                  ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                                  : 'border-border text-foreground hover:bg-slate-50'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <input
                                id={inputId}
                                type="radio"
                                name="businessType"
                                value={option.value}
                                checked={businessForm.businessType === option.value}
                                onChange={(e) =>
                                  updateBusinessForm(
                                    'businessType',
                                    e.target.value as 'INDIVIDUAL' | 'COMPANY'
                                  )
                                }
                                className="sr-only"
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label htmlFor="businessName" className="block text-xs font-medium text-foreground mb-1">
                          اسم النشاط
                        </label>
                        <input
                          id="businessName"
                          type="text"
                          value={businessForm.name}
                          onChange={(e) => updateBusinessForm('name', e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                          placeholder="مثال: صالون الجمال"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="businessDescription" className="block text-xs font-medium text-foreground mb-1">الوصف</label>
                        <textarea
                          id="businessDescription"
                          value={businessForm.description}
                          onChange={(e) => updateBusinessForm('description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all resize-none text-sm"
                          placeholder="وصف مختصر للنشاط..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="logoUpload" className="block text-xs font-medium text-foreground mb-1">شعار النشاط</label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-50 border border-border overflow-hidden flex items-center justify-center shrink-0">
                            {businessForm.logo ? (
                              <img
                                src={businessForm.logo}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-muted" />
                            )}
                          </div>
                          <label htmlFor="logoUpload" className="flex-1 cursor-pointer">
                            <input
                              id="logoUpload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'cover', 'logo')}
                              className="hidden"
                            />
                            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-foreground">
                              {uploading.logo ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              {uploading.logo ? 'جاري الرفع...' : 'اختر شعار النشاط'}
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="businessCity" className="block text-xs font-medium text-foreground mb-1">المدينة</label>
                        <div className="relative">
                          <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="businessCity"
                            type="text"
                            value={businessForm.city}
                            onChange={(e) => updateBusinessForm('city', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="المدينة"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="businessPhone" className="block text-xs font-medium text-foreground mb-1">رقم الهاتف</label>
                        <div className="relative">
                          <Phone className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="businessPhone"
                            type="tel"
                            dir="ltr"
                            value={businessForm.phone}
                            onChange={(e) => updateBusinessForm('phone', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="05XXXXXXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="businessEmail" className="block text-xs font-medium text-foreground mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                          <Mail className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="businessEmail"
                            type="email"
                            dir="ltr"
                            value={businessForm.email}
                            onChange={(e) => updateBusinessForm('email', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="example@gateo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="businessWebsite" className="block text-xs font-medium text-foreground mb-1">الموقع الإلكتروني</label>
                        <div className="relative">
                          <LinkIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                          <input
                            id="businessWebsite"
                            type="url"
                            dir="ltr"
                            value={businessForm.website}
                            onChange={(e) => updateBusinessForm('website', e.target.value)}
                            className="w-full pr-9 pl-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ===== BUSINESS: SPECIALIZATIONS ===== */}
                {phase === 'business' && step === 1 && (
                  <motion.div
                    key="business-specializations"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <span className="block text-xs font-medium text-foreground mb-2">
                      اختر التخصصات التي تريد الظهور تحتها
                    </span>
                    {categoriesLoading ? (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        جاري تحميل التصنيفات...
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto border border-border rounded-lg p-2">
                        {categories.length === 0 && (
                          <p className="text-xs text-muted">لا توجد تصنيفات متاحة</p>
                        )}
                        {categories.map((category) => {
                          const hasSubs = category.subcategories && category.subcategories.length > 0;
                          const categorySelected = isCategorySelected(category.id);
                          const categoryInputId = `category-${category.id}`;
                          return (
                            <div key={category.id} className="border border-border rounded-md p-2">
                              <label htmlFor={categoryInputId} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  id={categoryInputId}
                                  type="checkbox"
                                  checked={categorySelected}
                                  onChange={(e) => toggleCategory(category.id, e.target.checked)}
                                  className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-xs font-medium text-foreground">{category.name}</span>
                              </label>
                              {hasSubs && categorySelected && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5 mr-5">
                                  {category.subcategories?.map((sub) => {
                                    const subInputId = `subcategory-${category.id}-${sub.id}`;
                                    return (
                                      <label
                                        key={sub.id}
                                        htmlFor={subInputId}
                                        className="flex items-center gap-1 cursor-pointer bg-slate-50 rounded-md px-1.5 py-0.5"
                                      >
                                        <input
                                          id={subInputId}
                                          type="checkbox"
                                          checked={isSubcategorySelected(category.id, sub.id)}
                                          onChange={(e) =>
                                            toggleSubcategory(category.id, sub.id, e.target.checked)
                                          }
                                          className="w-3 h-3 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <span className="text-[11px] text-muted">{sub.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-3 p-2 bg-primary/5 text-primary text-[11px] rounded-lg">
                      يمكنك اختيار أكثر من تخصص؛ سيساعد ذلك في ظهورك في نتائج البحث والبوابة العامة.
                    </div>
                  </motion.div>
                )}

                {/* ===== BUSINESS: EXTRAS ===== */}
                {phase === 'business' && step === 2 && (
                  <motion.div
                    key="business-extra"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        معلومات العائلة (اختياري)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="maritalStatus" className="block text-[11px] font-medium text-muted mb-1">الحالة الاجتماعية</label>
                          <select
                            id="maritalStatus"
                            value={businessForm.maritalStatus}
                            onChange={(e) => updateBusinessForm('maritalStatus', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                          >
                            <option value="">اختر الحالة</option>
                            <option value="SINGLE">أعزب</option>
                            <option value="MARRIED">متزوج</option>
                            <option value="DIVORCED">مطلق</option>
                            <option value="WIDOWED">أرمل</option>
                            <option value="SEPARATED">منفصل</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="familySize" className="block text-[11px] font-medium text-muted mb-1">عدد أفراد الأسرة</label>
                          <input
                            id="familySize"
                            type="number"
                            min={0}
                            value={businessForm.familySize}
                            onChange={(e) => updateBusinessForm('familySize', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                            placeholder="0"
                          />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3">
                          <label htmlFor="hasChildren" className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              id="hasChildren"
                              type="checkbox"
                              checked={businessForm.hasChildren}
                              onChange={(e) => updateBusinessForm('hasChildren', e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-[11px] font-medium text-foreground">لدي أطفال</span>
                          </label>
                          {businessForm.hasChildren && (
                            <div className="flex-1 max-w-[8rem]">
                              <label htmlFor="numberOfChildren" className="sr-only">عدد الأطفال</label>
                              <input
                                id="numberOfChildren"
                                type="number"
                                min={0}
                                value={businessForm.numberOfChildren}
                                onChange={(e) => updateBusinessForm('numberOfChildren', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-surface border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-xs"
                                placeholder="العدد"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <label htmlFor="isPublicOnGateway" className="flex items-start gap-2 cursor-pointer p-3 border border-border rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        id="isPublicOnGateway"
                        type="checkbox"
                        checked={businessForm.isPublicOnGateway}
                        onChange={(e) => updateBusinessForm('isPublicOnGateway', e.target.checked)}
                        className="w-3.5 h-3.5 mt-0.5 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          الظهور في البوابة العامة
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">
                          أوافق على ظهور حسابي في بوابة الأعمال العامة أمام الزوار والعملاء.
                        </p>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* ===== BUSINESS: REVIEW ===== */}
                {phase === 'business' && step === 3 && (
                  <motion.div
                    key="business-review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3">
                      <h3 className="text-xs font-bold text-foreground">ملخص بيانات النشاط التجاري</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <SummaryItem
                          label="نوع الحساب"
                          value={businessForm.businessType === 'INDIVIDUAL' ? 'احترافي فردي' : 'شركة'}
                        />
                        <SummaryItem label="اسم النشاط" value={businessForm.name} />
                        <SummaryItem label="المدينة" value={businessForm.city} />
                        <SummaryItem label="التخصصات" value={`${Object.keys(specializations).length} تخصص`} />
                        <SummaryItem
                          label="الحالة الاجتماعية"
                          value={
                            businessForm.maritalStatus
                              ? MARITAL_STATUS_LABELS[businessForm.maritalStatus]
                              : ''
                          }
                        />
                        <SummaryItem label="عدد أفراد الأسرة" value={businessForm.familySize} />
                        <SummaryItem
                          label="الأطفال"
                          value={
                            businessForm.hasChildren
                              ? `نعم${businessForm.numberOfChildren ? ` (${businessForm.numberOfChildren})` : ''}`
                              : ''
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-border">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 0 || savingProfile || submitting}
                  className="flex items-center gap-1 px-4 py-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  السابق
                </button>

                {phase === 'profile' && step === PROFILE_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        حفظ الملف الشخصي
                      </>
                    )}
                  </button>
                ) : phase === 'profile' ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-all"
                  >
                    التالي
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                ) : step === BUSINESS_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={submitBusiness}
                    disabled={submitting}
                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        إرسال طلب الترقية
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-all"
                  >
                    التالي
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="bg-surface rounded-md p-2 border border-border">
      <span className="text-muted text-[10px]">{label}</span>
      <p className="font-medium text-foreground text-[11px] mt-0.5">{value || '—'}</p>
    </div>
  );
}
