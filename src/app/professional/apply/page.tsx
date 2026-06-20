'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import { DynamicFieldForm } from '@/components/dynamic-fields/DynamicFieldForm';
import type { DynamicField } from '@/components/dynamic-fields/DynamicFieldForm';
import { EmptyState, Skeleton } from '@/components/ui';
import {
  Loader2,
  User,
  GraduationCap,
  Layers,
  MapPin,
  Phone,
  Image as ImageIcon,
  Settings,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Mail,
  Link as LinkIcon,
  Globe,
  Sparkles,
  Save,
  Upload,
  FileText,
  Video,
  Eye,
  List,
} from 'lucide-react';

type WorkScope = 'IN_PERSON' | 'REMOTE' | 'BOTH';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories?: Subcategory[];
}

interface Country {
  id: string;
  name: string;
  flagEmoji: string;
  phoneCode?: string;
}

interface City {
  id: string;
  name: string;
}

interface ServiceItem {
  name: string;
  description: string;
  startingPrice: string;
  duration: string;
}

interface PortfolioProject {
  title: string;
  description: string;
  images: string[];
  videos: string[];
  files: string[];
}

interface FormState {
  title: string;
  bio: string;
  personalLogo: string;
  categoryId: string;
  subcategoryId: string;
  skills: string[];
  keywords: string[];
  degree: string;
  academicSpecialization: string;
  experienceYears: string;
  courses: string;
  certifications: string;
  professionalAccreditations: string;
  services: ServiceItem[];
  workScope: WorkScope;
  countryId: string;
  city: string;
  willingToTravel: boolean;
  languages: string[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  socialLinks: Record<string, string>;
  portfolioProjects: PortfolioProject[];
  availableForWork: boolean;
  availableForHiring: boolean;
  availableForFreelance: boolean;
  availableForConsultation: boolean;
  completedProjectsCount: string;
  clientsCount: string;
  isPublicOnGateway: boolean;
}

interface ProfessionalProfileResponse {
  title?: string | null;
  bio?: string | null;
  personalLogo?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  skills?: string[];
  keywords?: string[];
  degree?: string | null;
  academicSpecialization?: string | null;
  experienceYears?: number | null;
  courses?: string | null;
  certifications?: string | null;
  professionalAccreditations?: string | null;
  services?: Array<{
    name?: string;
    description?: string;
    startingPrice?: number | null;
    duration?: string | null;
  }>;
  workScope?: WorkScope;
  countryId?: string | null;
  city?: string | null;
  willingToTravel?: boolean;
  languages?: string[];
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  portfolioProjects?: Array<{
    title?: string;
    description?: string;
    images?: string[];
    videos?: string[];
    files?: string[];
  }>;
  availableForWork?: boolean;
  availableForHiring?: boolean;
  availableForFreelance?: boolean;
  availableForConsultation?: boolean;
  completedProjectsCount?: number;
  clientsCount?: number;
  isPublicOnGateway?: boolean;
  fieldValues?: Record<string, string | null>;
}

interface UserProfile {
  city?: string | null;
  country?: string | null;
  education?: {
    degree?: string;
    specialization?: string;
  };
  experience?: {
    currentTitle?: string;
    bio?: string;
  };
  skills?: string;
  interests?: string;
}

interface UserData {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  profile?: UserProfile | null;
}

const STORAGE_KEY = 'gateo_professional_apply_draft';

const STEPS = [
  { label: 'المعلومات الأساسية', icon: User },
  { label: 'المؤهلات والخبرات', icon: GraduationCap },
  { label: 'الخدمات المقدمة', icon: Layers },
  { label: 'الموقع والتوفر', icon: MapPin },
  { label: 'التواصل', icon: Phone },
  { label: 'معرض الأعمال', icon: ImageIcon },
  { label: 'خيارات متقدمة', icon: Settings },
  { label: 'المراجعة والإرسال', icon: CheckCircle2 },
];

function initialFormState(): FormState {
  return {
    title: '',
    bio: '',
    personalLogo: '',
    categoryId: '',
    subcategoryId: '',
    skills: [],
    keywords: [],
    degree: '',
    academicSpecialization: '',
    experienceYears: '',
    courses: '',
    certifications: '',
    professionalAccreditations: '',
    services: [],
    workScope: 'BOTH',
    countryId: '',
    city: '',
    willingToTravel: false,
    languages: [],
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    socialLinks: {},
    portfolioProjects: [],
    availableForWork: true,
    availableForHiring: false,
    availableForFreelance: true,
    availableForConsultation: true,
    completedProjectsCount: '',
    clientsCount: '',
    isPublicOnGateway: true,
  };
}

function splitTags(value: string) {
  return value
    .split(/[,،]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeDraft(base: FormState, draft: unknown): FormState {
  if (!draft || typeof draft !== 'object') return base;
  const d = draft as Partial<FormState>;
  const merged: FormState = { ...base };

  const useIfString = (key: keyof FormState, value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      (merged as Record<keyof FormState, unknown>)[key] = value.trim();
    }
  };

  useIfString('title', d.title);
  useIfString('bio', d.bio);
  useIfString('personalLogo', d.personalLogo);
  useIfString('categoryId', d.categoryId);
  useIfString('subcategoryId', d.subcategoryId);
  useIfString('degree', d.degree);
  useIfString('academicSpecialization', d.academicSpecialization);
  useIfString('experienceYears', d.experienceYears);
  useIfString('courses', d.courses);
  useIfString('certifications', d.certifications);
  useIfString('professionalAccreditations', d.professionalAccreditations);
  useIfString('city', d.city);
  useIfString('phone', d.phone);
  useIfString('whatsapp', d.whatsapp);
  useIfString('email', d.email);
  useIfString('website', d.website);
  useIfString('completedProjectsCount', d.completedProjectsCount);
  useIfString('clientsCount', d.clientsCount);

  if (d.workScope === 'IN_PERSON' || d.workScope === 'REMOTE' || d.workScope === 'BOTH') {
    merged.workScope = d.workScope;
  }
  if (typeof d.countryId === 'string') merged.countryId = d.countryId;
  if (typeof d.willingToTravel === 'boolean') merged.willingToTravel = d.willingToTravel;
  if (typeof d.availableForWork === 'boolean') merged.availableForWork = d.availableForWork;
  if (typeof d.availableForHiring === 'boolean') merged.availableForHiring = d.availableForHiring;
  if (typeof d.availableForFreelance === 'boolean') merged.availableForFreelance = d.availableForFreelance;
  if (typeof d.availableForConsultation === 'boolean') merged.availableForConsultation = d.availableForConsultation;
  if (typeof d.isPublicOnGateway === 'boolean') merged.isPublicOnGateway = d.isPublicOnGateway;

  if (Array.isArray(d.skills) && d.skills.length > 0) merged.skills = d.skills.filter((s) => typeof s === 'string');
  if (Array.isArray(d.keywords) && d.keywords.length > 0) merged.keywords = d.keywords.filter((s) => typeof s === 'string');
  if (Array.isArray(d.languages) && d.languages.length > 0) merged.languages = d.languages.filter((s) => typeof s === 'string');

  if (Array.isArray(d.services) && d.services.length > 0) {
    merged.services = d.services.filter((s): s is ServiceItem =>
      Boolean(s && typeof s === 'object' && typeof (s as ServiceItem).name === 'string')
    );
  }

  if (Array.isArray(d.portfolioProjects) && d.portfolioProjects.length > 0) {
    merged.portfolioProjects = d.portfolioProjects.filter((p): p is PortfolioProject =>
      Boolean(p && typeof p === 'object' && typeof (p as PortfolioProject).title === 'string')
    );
  }

  if (d.socialLinks && typeof d.socialLinks === 'object' && Object.keys(d.socialLinks).length > 0) {
    merged.socialLinks = { ...d.socialLinks };
  }

  return merged;
}
export default function ProfessionalApplyPage() {
  const { status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialFormState);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayAvatar, setDisplayAvatar] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string | null>>({});

  const initialCountryLoadedRef = useRef(false);

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load initial data
  useEffect(() => {
    if (status !== 'authenticated') return;

    setLoading(true);

    const loadCitiesOnce = async (countryId: string) => {
      try {
        const res = await fetch(`/api/countries/${countryId}/cities`);
        const data = await res.json();
        if (data?.cities) setCities(data.cities);
      } catch {
        setCities([]);
      }
    };

    Promise.all([
      fetch('/api/professionals/apply').then((r) => r.json()),
      fetch('/api/account/me').then((r) => r.json()),
      fetch('/api/categories?withSubs=true').then((r) => r.json()),
      fetch('/api/countries').then((r) => r.json()),
    ])
      .then(([applyData, accountData, categoryData, countryData]) => {
        const base = initialFormState();
        const user: UserData = accountData || {};
        const profile = user.profile || {};

        // Prefill from user account
        setDisplayName(user.name || '');
        setDisplayAvatar(user.avatar || '');
        base.title = profile.experience?.currentTitle || '';
        base.bio = profile.experience?.bio || '';
        base.degree = profile.education?.degree || '';
        base.academicSpecialization = profile.education?.specialization || '';
        const skillsSource = profile.skills || profile.interests || '';
        base.skills = splitTags(skillsSource);
        base.city = profile.city || '';
        base.phone = user.phone || '';
        base.whatsapp = user.phone || '';
        base.email = user.email || '';

        // Override with existing professional profile if present
        const p: ProfessionalProfileResponse | null = applyData?.profile || null;
        if (p) {
          base.title = p.title ?? base.title;
          base.bio = p.bio ?? base.bio;
          base.personalLogo = p.personalLogo ?? base.personalLogo;
          base.categoryId = p.categoryId ?? base.categoryId;
          base.subcategoryId = p.subcategoryId ?? base.subcategoryId;
          base.skills = p.skills?.length ? p.skills : base.skills;
          base.keywords = p.keywords ?? base.keywords;
          base.degree = p.degree ?? base.degree;
          base.academicSpecialization = p.academicSpecialization ?? base.academicSpecialization;
          base.experienceYears = p.experienceYears != null ? String(p.experienceYears) : base.experienceYears;
          base.courses = p.courses ?? base.courses;
          base.certifications = p.certifications ?? base.certifications;
          base.professionalAccreditations = p.professionalAccreditations ?? base.professionalAccreditations;
          base.services = (p.services || []).map((s) => ({
            name: s.name || '',
            description: s.description || '',
            startingPrice: s.startingPrice != null ? String(s.startingPrice) : '',
            duration: s.duration || '',
          }));
          base.workScope = p.workScope ?? base.workScope;
          base.countryId = p.countryId ?? base.countryId;
          base.city = p.city ?? base.city;
          base.willingToTravel = p.willingToTravel ?? base.willingToTravel;
          base.languages = p.languages ?? base.languages;
          base.phone = p.phone ?? base.phone;
          base.whatsapp = p.whatsapp ?? base.whatsapp;
          base.email = p.email ?? base.email;
          base.website = p.website ?? base.website;
          base.socialLinks = p.socialLinks ?? base.socialLinks;
          base.portfolioProjects = (p.portfolioProjects || []).map((proj) => ({
            title: proj.title || '',
            description: proj.description || '',
            images: proj.images || [],
            videos: proj.videos || [],
            files: proj.files || [],
          }));
          base.availableForWork = p.availableForWork ?? base.availableForWork;
          base.availableForHiring = p.availableForHiring ?? base.availableForHiring;
          base.availableForFreelance = p.availableForFreelance ?? base.availableForFreelance;
          base.availableForConsultation = p.availableForConsultation ?? base.availableForConsultation;
          base.completedProjectsCount = p.completedProjectsCount != null ? String(p.completedProjectsCount) : base.completedProjectsCount;
          base.clientsCount = p.clientsCount != null ? String(p.clientsCount) : base.clientsCount;
          base.isPublicOnGateway = p.isPublicOnGateway ?? base.isPublicOnGateway;

          if (p.fieldValues && typeof p.fieldValues === 'object') {
            setFieldValues(p.fieldValues as Record<string, string | null>);
          }
        }

        // Merge any saved draft so users don't lose progress
        let finalForm = base;
        let savedStep = 0;
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
          try {
            const draft = JSON.parse(saved);
            if (draft?.form) {
              finalForm = mergeDraft(base, draft.form);
            }
            if (draft?.fieldValues && typeof draft.fieldValues === 'object') {
              setFieldValues(draft.fieldValues as Record<string, string | null>);
            }
            if (typeof draft?.step === 'number' && draft.step >= 0 && draft.step < STEPS.length) {
              savedStep = draft.step;
            }
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        setForm(finalForm);
        if (savedStep) setStep(savedStep);

        if (categoryData?.categories) setCategories(categoryData.categories);
        if (countryData?.countries) setCountries(countryData.countries);

        if (finalForm.countryId) {
          initialCountryLoadedRef.current = true;
          loadCitiesOnce(finalForm.countryId);
        }
      })
      .catch(() => {
        setError('فشل في تحميل البيانات الأولية. يرجى تحديث الصفحة.');
      })
      .finally(() => {
        setLoading(false);
        setHydrated(true);
      });
  }, [status]);

  // Load dynamic fields when category changes
  useEffect(() => {
    if (!form.categoryId) {
      setDynamicFields([]);
      return;
    }
    fetch(`/api/categories/${form.categoryId}/fields?appliesTo=PROFESSIONAL`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.fields) setDynamicFields(data.fields);
      })
      .catch(() => setDynamicFields([]));
  }, [form.categoryId]);

  // Load cities when country changes (after initial load)
  useEffect(() => {
    if (!hydrated || status !== 'authenticated') return;
    if (!form.countryId) {
      setCities([]);
      return;
    }
    if (!initialCountryLoadedRef.current) {
      fetch(`/api/countries/${form.countryId}/cities`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.cities) setCities(data.cities);
        })
        .catch(() => setCities([]));
    }
    initialCountryLoadedRef.current = false;
  }, [form.countryId, hydrated, status]);

  // Auto-save draft
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step, fieldValues }));
  }, [form, step, fieldValues, hydrated]);

  const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const uploadFile = async (file: File, variant: 'avatar' | 'cover' | 'post') => {
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, logo: true }));
    setError('');
    try {
      const url = await uploadFile(file, 'avatar');
      updateField('personalLogo', url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في رفع الشعار');
    } finally {
      setUploading((prev) => ({ ...prev, logo: false }));
      e.target.value = '';
    }
  };

  const validateStep = (targetStep: number) => {
    setError('');
    if (targetStep > 0 && !form.title.trim()) {
      setErrors({ title: 'المسمى المهني مطلوب للمتابعة' });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step + 1)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const goToStep = (index: number) => {
    if (index === step) return;
    if (index < step || validateStep(index)) {
      setStep(index);
    }
  };

  // Tags helpers
  const addTag = useCallback((field: 'skills' | 'keywords' | 'languages', tag: string) => {
    const value = tag.trim();
    if (!value) return;
    setForm((prev) => {
      if (prev[field].includes(value)) return prev;
      return { ...prev, [field]: [...prev[field], value] };
    });
  }, []);

  const removeTag = useCallback((field: 'skills' | 'keywords' | 'languages', tag: string) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((t) => t !== tag) }));
  }, []);

  // Services helpers
  const addService = () => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', startingPrice: '', duration: '' }],
    }));
  };

  const updateService = (index: number, key: keyof ServiceItem, value: string) => {
    setForm((prev) => {
      const services = [...prev.services];
      services[index] = { ...services[index], [key]: value };
      return { ...prev, services };
    });
  };

  const removeService = (index: number) => {
    setForm((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  // Portfolio helpers
  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      portfolioProjects: [...prev.portfolioProjects, { title: '', description: '', images: [], videos: [], files: [] }],
    }));
  };

  const updateProject = (index: number, key: keyof PortfolioProject, value: string) => {
    setForm((prev) => {
      const projects = [...prev.portfolioProjects];
      projects[index] = { ...projects[index], [key]: value };
      return { ...prev, portfolioProjects: projects };
    });
  };

  const removeProject = (index: number) => {
    setForm((prev) => ({ ...prev, portfolioProjects: prev.portfolioProjects.filter((_, i) => i !== index) }));
  };

  const removeProjectFile = (projectIndex: number, type: 'images' | 'videos' | 'files', url: string) => {
    setForm((prev) => {
      const projects = [...prev.portfolioProjects];
      projects[projectIndex] = {
        ...projects[projectIndex],
        [type]: projects[projectIndex][type].filter((u) => u !== url),
      };
      return { ...prev, portfolioProjects: projects };
    });
  };

  const handleProjectFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    projectIndex: number,
    type: 'images' | 'videos' | 'files'
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const key = `project-${projectIndex}-${type}`;
    setUploading((prev) => ({ ...prev, [key]: true }));
    setError('');

    const uploaded: string[] = [];
    for (const file of files) {
      try {
        // Use 'post' variant for portfolio media. The server currently processes
        // images and videos. Documents may be rejected; we surface that error.
        const url = await uploadFile(file, 'post');
        uploaded.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في رفع أحد الملفات');
      }
    }

    if (uploaded.length > 0) {
      setForm((prev) => {
        const projects = [...prev.portfolioProjects];
        projects[projectIndex] = {
          ...projects[projectIndex],
          [type]: [...projects[projectIndex][type], ...uploaded],
        };
        return { ...prev, portfolioProjects: projects };
      });
    }

    setUploading((prev) => ({ ...prev, [key]: false }));
    e.target.value = '';
  };

  // Social links helpers
  const addSocialLink = () => {
    setForm((prev) => {
      const socialLinks = { ...prev.socialLinks, '': '' };
      return { ...prev, socialLinks };
    });
  };

  const updateSocialKey = (oldKey: string, newKey: string) => {
    setForm((prev) => {
      const entries = Object.entries(prev.socialLinks);
      const idx = entries.findIndex(([k]) => k === oldKey);
      if (idx === -1) return prev;
      entries[idx][0] = newKey.trim();
      return { ...prev, socialLinks: Object.fromEntries(entries) };
    });
  };

  const updateSocialValue = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const removeSocialLink = (key: string) => {
    setForm((prev) => {
      const socialLinks = { ...prev.socialLinks };
      delete socialLinks[key];
      return { ...prev, socialLinks };
    });
  };

  const buildPayload = () => {
    const emptyToUndefined = (val: string) => (val.trim() === '' ? undefined : val.trim());

    return {
      title: emptyToUndefined(form.title),
      bio: emptyToUndefined(form.bio),
      personalLogo: emptyToUndefined(form.personalLogo),
      categoryId: emptyToUndefined(form.categoryId),
      subcategoryId: emptyToUndefined(form.subcategoryId),
      skills: form.skills.length ? form.skills : undefined,
      keywords: form.keywords.length ? form.keywords : undefined,
      degree: emptyToUndefined(form.degree),
      academicSpecialization: emptyToUndefined(form.academicSpecialization),
      experienceYears: form.experienceYears.trim() === '' ? undefined : Number(form.experienceYears),
      courses: emptyToUndefined(form.courses),
      certifications: emptyToUndefined(form.certifications),
      professionalAccreditations: emptyToUndefined(form.professionalAccreditations),
      services: form.services
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          description: emptyToUndefined(s.description),
          startingPrice: s.startingPrice.trim() === '' ? undefined : Number(s.startingPrice),
          duration: emptyToUndefined(s.duration),
        })),
      workScope: form.workScope,
      countryId: emptyToUndefined(form.countryId),
      city: emptyToUndefined(form.city),
      willingToTravel: form.willingToTravel,
      languages: form.languages.length ? form.languages : undefined,
      phone: emptyToUndefined(form.phone),
      whatsapp: emptyToUndefined(form.whatsapp),
      email: emptyToUndefined(form.email),
      website: emptyToUndefined(form.website),
      socialLinks: Object.keys(form.socialLinks).length ? form.socialLinks : undefined,
      portfolioProjects: form.portfolioProjects
        .filter((p) => p.title.trim())
        .map((p) => ({
          title: p.title.trim(),
          description: emptyToUndefined(p.description),
          images: p.images,
          videos: p.videos,
          files: p.files,
        })),
      availableForWork: form.availableForWork,
      availableForHiring: form.availableForHiring,
      availableForFreelance: form.availableForFreelance,
      availableForConsultation: form.availableForConsultation,
      completedProjectsCount: form.completedProjectsCount.trim() === '' ? undefined : Number(form.completedProjectsCount),
      clientsCount: form.clientsCount.trim() === '' ? undefined : Number(form.clientsCount),
      isPublicOnGateway: form.isPublicOnGateway,
      fieldValues,
    };
  };

  const handleSubmit = async () => {
    setError('');
    setErrors({});

    if (!form.title.trim()) {
      setErrors({ title: 'المسمى المهني مطلوب' });
      setError('يرجى إدخال المسمى المهني قبل الإرسال');
      setStep(0);
      return;
    }

    const missingFields = dynamicFields.filter(
      (f) => f.isRequired && (!fieldValues[f.id] || fieldValues[f.id] === '')
    );
    if (missingFields.length > 0) {
      setError(`يرجى تعبئة الحقول المطلوبة: ${missingFields.map((f) => f.label).join('، ')}`);
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/professionals/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem(STORAGE_KEY);
        router.push('/professional/apply/sent');
      } else {
        const msg = data.error || data.details?.map((d: { message: string }) => d.message).join(', ');
        setError(typeof msg === 'string' ? msg : 'فشل في إرسال الطلب');
      }
    } catch {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Skeleton className="h-8 w-72 mx-auto mb-6" />
            <Skeleton className="h-4 w-56 mx-auto mb-10" />
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (status === 'unauthenticated') return null;

  const StepIcon = STEPS[step].icon;

  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-12 min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center text-white">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">التقديم للدليل المهني</h1>
                  <p className="text-xs text-muted">املأ بياناتك المهنية لتظهر في دليل المحترفين</p>
                </div>
                {displayName && (
                  <div className="mr-auto flex items-center gap-2">
                    <span className="text-xs text-muted hidden sm:inline">مرحباً، {displayName}</span>
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-muted" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stepper */}
            <div className="px-6 pt-6">
              <div className="relative flex items-center justify-between mb-2">
                {STEPS.map((s, index) => {
                  const Icon = s.icon;
                  const isActive = index === step;
                  const isCompleted = index < step;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => goToStep(index)}
                      className="relative z-10 flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive
                            ? 'border-primary bg-primary/5 text-primary'
                            : isCompleted
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                            : 'border-border bg-surface text-muted group-hover:border-primary'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] font-medium text-center leading-tight max-w-[70px] ${
                          isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-muted'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  );
                })}

                <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0 mx-4 sm:mx-5">
                  <motion.div
                    className="h-full bg-primary"
                    initial={false}
                    animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 mt-2">
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                  <StepIcon className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-foreground">
                  الخطوة {step + 1} من {STEPS.length}: {STEPS[step].label}
                </h2>
              </div>
            </div>

            <div className="p-6 pt-0">
              {(error || Object.keys(errors).length > 0) && (
                <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600 text-center mb-4">
                  {error || Object.values(errors)[0]}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {step === 0 && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="professional-title" className="block text-sm font-medium text-foreground mb-1.5">
                          المسمى المهني <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-title"
                            type="text"
                            value={form.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className={`w-full pr-10 pl-4 py-2.5 rounded-md border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                              errors.title ? 'border-red-300 focus:border-red-300' : 'border-border focus:border-primary'
                            }`}
                            placeholder="مثال: مصمم جرافيك مستقل"
                          />
                        </div>
                        {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="professional-bio" className="block text-sm font-medium text-foreground mb-1.5">نبذة تعريفية</label>
                        <textarea
                          id="professional-bio"
                          value={form.bio}
                          onChange={(e) => updateField('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                          placeholder="اكتب نبذة مختصرة عن خبراتك وما تقدمه..."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1.5">الشعار الشخصي</label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md bg-slate-100 border border-border overflow-hidden flex items-center justify-center shrink-0">
                            {form.personalLogo ? (
                              <img src={form.personalLogo} alt={displayName || 'الشعار الشخصي'} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted" />
                            )}
                          </div>
                          <label htmlFor="professional-logo-upload" className="flex-1 cursor-pointer">
                            <input id="professional-logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted">
                              {uploading.logo ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              {uploading.logo ? 'جاري الرفع...' : 'اختر شعار شخصي'}
                            </div>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-category" className="block text-sm font-medium text-foreground mb-1.5">التصنيف الرئيسي</label>
                        <div className="relative">
                          <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <select
                            id="professional-category"
                            value={form.categoryId}
                            onChange={(e) => {
                              updateField('categoryId', e.target.value);
                              updateField('subcategoryId', '');
                            }}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface"
                          >
                            <option value="">اختر التصنيف</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-subcategory" className="block text-sm font-medium text-foreground mb-1.5">التخصص الفرعي</label>
                        <div className="relative">
                          <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <select
                            id="professional-subcategory"
                            value={form.subcategoryId}
                            onChange={(e) => updateField('subcategoryId', e.target.value)}
                            disabled={!subcategories.length}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface disabled:bg-slate-100 disabled:text-muted"
                          >
                            <option value="">اختر التخصص الفرعي</option>
                            {subcategories.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {dynamicFields.length > 0 && (
                      <div className="rounded-md border border-primary/10 bg-primary/5 p-4 space-y-4">
                        <div className="flex items-center gap-2 text-primary-dark">
                          <List className="w-4 h-4" />
                          <h3 className="text-sm font-bold">تفاصيل إضافية</h3>
                        </div>
                        <DynamicFieldForm
                          fields={dynamicFields}
                          values={fieldValues}
                          onChange={setFieldValues}
                        />
                      </div>
                    )}

                    <TagsInput
                      label="المهارات"
                      tags={form.skills}
                      onAdd={(tag) => addTag('skills', tag)}
                      onRemove={(tag) => removeTag('skills', tag)}
                      placeholder="اكتب مهارة واضغط Enter أو فاصلة"
                      icon={Sparkles}
                    />

                    <TagsInput
                      label="الكلمات المفتاحية"
                      tags={form.keywords}
                      onAdd={(tag) => addTag('keywords', tag)}
                      onRemove={(tag) => removeTag('keywords', tag)}
                      placeholder="كلمات مفتاحية تساعد في ظهورك في البحث"
                      icon={Globe}
                    />
                  </motion.div>
                )}

                {/* Step 2: Qualifications */}
                {step === 1 && (
                  <motion.div
                    key="qualifications"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="professional-degree" className="block text-sm font-medium text-foreground mb-1.5">أعلى مؤهل علمي</label>
                        <div className="relative">
                          <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-degree"
                            type="text"
                            value={form.degree}
                            onChange={(e) => updateField('degree', e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="مثال: بكالوريوس"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-specialization" className="block text-sm font-medium text-foreground mb-1.5">التخصص الأكاديمي</label>
                        <div className="relative">
                          <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-specialization"
                            type="text"
                            value={form.academicSpecialization}
                            onChange={(e) => updateField('academicSpecialization', e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="مثال: علوم الحاسب"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-experience" className="block text-sm font-medium text-foreground mb-1.5">سنوات الخبرة</label>
                        <input
                          id="professional-experience"
                          type="number"
                          min={0}
                          value={form.experienceYears}
                          onChange={(e) => updateField('experienceYears', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="professional-courses" className="block text-sm font-medium text-foreground mb-1.5">الدورات التدريبية</label>
                      <textarea
                        id="professional-courses"
                        value={form.courses}
                        onChange={(e) => updateField('courses', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        placeholder="اذكر أبرز الدورات التي أكملتها..."
                      />
                    </div>

                    <div>
                      <label htmlFor="professional-certifications" className="block text-sm font-medium text-foreground mb-1.5">الشهادات</label>
                      <textarea
                        id="professional-certifications"
                        value={form.certifications}
                        onChange={(e) => updateField('certifications', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        placeholder="الشهادات المهنية التي حصلت عليها..."
                      />
                    </div>

                    <div>
                      <label htmlFor="professional-accreditations" className="block text-sm font-medium text-foreground mb-1.5">الاعتمادات المهنية</label>
                      <textarea
                        id="professional-accreditations"
                        value={form.professionalAccreditations}
                        onChange={(e) => updateField('professionalAccreditations', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                        placeholder="مثال: عضو جمعية المحاسبين القانونيين..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Services */}
                {step === 2 && (
                  <motion.div
                    key="services"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">الخدمات المقدمة</h3>
                      <button
                        type="button"
                        onClick={addService}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة خدمة
                      </button>
                    </div>

                    {form.services.length === 0 && (
                      <EmptyState
                        icon={Layers}
                        title="لم تضف أي خدمات بعد"
                        actionLabel="أضف أول خدمة"
                        onAction={addService}
                        className="py-8 bg-slate-50 border-dashed"
                      />
                    )}

                    <div className="space-y-4">
                      {form.services.map((service, index) => (
                        <div key={index} className="bg-slate-50 rounded-md p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">خدمة #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              aria-label="حذف الخدمة"
                              className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => updateService(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                              placeholder="اسم الخدمة *"
                            />
                            <input
                              type="text"
                              value={service.duration}
                              onChange={(e) => updateService(index, 'duration', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                              placeholder="المدة (مثال: 3 أيام)"
                            />
                            <input
                              type="number"
                              min={0}
                              value={service.startingPrice}
                              onChange={(e) => updateService(index, 'startingPrice', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                              placeholder="السعر الابتدائي"
                            />
                            <input
                              type="text"
                              value={service.description}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm md:col-span-2"
                              placeholder="وصف مختصر للخدمة..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Location */}
                {step === 3 && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">نطاق العمل</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'IN_PERSON', label: 'حضوري' },
                          { value: 'REMOTE', label: 'عن بُعد' },
                          { value: 'BOTH', label: 'كلاهما' },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-md border text-sm font-medium transition-all ${
                              form.workScope === option.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-muted hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="workScope"
                              value={option.value}
                              checked={form.workScope === option.value}
                              onChange={(e) => updateField('workScope', e.target.value as WorkScope)}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CountrySelect
                        countries={countries}
                        value={form.countryId}
                        onChange={(countryId) => {
                          updateField('countryId', countryId);
                          updateField('city', '');
                        }}
                        label="الدولة"
                      />

                      <div>
                        <label htmlFor="professional-city" className="block text-sm font-medium text-foreground mb-1.5">المدينة</label>
                        <div className="relative">
                          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <select
                            id="professional-city"
                            value={form.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            disabled={!cities.length}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface disabled:bg-slate-100 disabled:text-muted"
                          >
                            <option value="">اختر المدينة</option>
                            {cities.map((city) => (
                              <option key={city.id} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <label htmlFor="professional-travel" className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-md hover:bg-slate-50 transition-colors">
                      <input
                        id="professional-travel"
                        type="checkbox"
                        checked={form.willingToTravel}
                        onChange={(e) => updateField('willingToTravel', e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">الاستعداد للسفر</div>
                        <p className="text-xs text-muted mt-1">أوافق على السفر للعمل خارج المدينة عند الحاجة.</p>
                      </div>
                    </label>

                    <TagsInput
                      label="اللغات"
                      tags={form.languages}
                      onAdd={(tag) => addTag('languages', tag)}
                      onRemove={(tag) => removeTag('languages', tag)}
                      placeholder="العربية، الإنجليزية..."
                      icon={Globe}
                    />
                  </motion.div>
                )}

                {/* Step 5: Contact */}
                {step === 4 && (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="professional-phone" className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-phone"
                            type="tel"
                            dir="ltr"
                            value={form.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="05XXXXXXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-whatsapp" className="block text-sm font-medium text-foreground mb-1.5">واتساب</label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-whatsapp"
                            type="tel"
                            dir="ltr"
                            value={form.whatsapp}
                            onChange={(e) => updateField('whatsapp', e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="05XXXXXXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-email" className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-email"
                            type="email"
                            dir="ltr"
                            value={form.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="example@gateo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="professional-website" className="block text-sm font-medium text-foreground mb-1.5">الموقع الإلكتروني</label>
                        <div className="relative">
                          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="professional-website"
                            type="url"
                            dir="ltr"
                            value={form.website}
                            onChange={(e) => updateField('website', e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">روابط التواصل الاجتماعي</label>
                        <button
                          type="button"
                          onClick={addSocialLink}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          إضافة رابط
                        </button>
                      </div>

                      {Object.keys(form.socialLinks).length === 0 && (
                        <p className="text-xs text-muted mb-2">لا توجد روابط مضافة</p>
                      )}

                      <div className="space-y-2">
                        {Object.entries(form.socialLinks).map(([key, value], idx) => (
                          <div key={`${key}-${idx}`} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={key}
                              onChange={(e) => updateSocialKey(key, e.target.value)}
                              className="w-32 sm:w-40 px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                              placeholder="المنصة"
                            />
                            <input
                              type="url"
                              dir="ltr"
                              value={value}
                              onChange={(e) => updateSocialValue(key, e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                              placeholder="رابط الحساب"
                            />
                            <button
                              type="button"
                              onClick={() => removeSocialLink(key)}
                              aria-label="حذف الرابط"
                              className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Portfolio */}
                {step === 5 && (
                  <motion.div
                    key="portfolio"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground">معرض الأعمال</h3>
                      <button
                        type="button"
                        onClick={addProject}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة مشروع
                      </button>
                    </div>

                    {form.portfolioProjects.length === 0 && (
                      <EmptyState
                        icon={ImageIcon}
                        title="لم تضف أي مشاريع بعد"
                        actionLabel="أضف أول مشروع"
                        onAction={addProject}
                        className="py-8 bg-slate-50 border-dashed"
                      />
                    )}

                    <div className="space-y-5">
                      {form.portfolioProjects.map((project, index) => {
                        const imagesKey = `project-${index}-images`;
                        const videosKey = `project-${index}-videos`;
                        const filesKey = `project-${index}-files`;
                        return (
                          <div key={index} className="bg-slate-50 rounded-md p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">مشروع #{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeProject(index)}
                                aria-label="حذف المشروع"
                                className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) => updateProject(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                              placeholder="عنوان المشروع *"
                            />
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none"
                              placeholder="وصف المشروع..."
                            />

                            {/* Images */}
                            <div>
                              <label className="block text-xs font-medium text-muted mb-1.5">الصور</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.images.map((url) => (
                                  <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                                    <img src={url} alt={project.title || 'صورة المشروع'} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeProjectFile(index, 'images', url)}
                                      aria-label="حذف الصورة"
                                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleProjectFileUpload(e, index, 'images')}
                                  className="hidden"
                                />
                                {uploading[imagesKey] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <ImageIcon className="w-3.5 h-3.5" />
                                )}
                                {uploading[imagesKey] ? 'جاري الرفع...' : 'رفع صور'}
                              </label>
                            </div>

                            {/* Videos */}
                            <div>
                              <label className="block text-xs font-medium text-muted mb-1.5">الفيديوهات</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.videos.map((url) => (
                                  <div key={url} className="relative w-24 h-16 rounded-lg overflow-hidden border border-border bg-black">
                                    <video src={url} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeProjectFile(index, 'videos', url)}
                                      aria-label="حذف الفيديو"
                                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted">
                                <input
                                  type="file"
                                  accept="video/*"
                                  multiple
                                  onChange={(e) => handleProjectFileUpload(e, index, 'videos')}
                                  className="hidden"
                                />
                                {uploading[videosKey] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Video className="w-3.5 h-3.5" />
                                )}
                                {uploading[videosKey] ? 'جاري الرفع...' : 'رفع فيديوهات'}
                              </label>
                            </div>

                            {/* Files */}
                            <div>
                              <label className="block text-xs font-medium text-muted mb-1.5">ملفات إضافية</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.files.map((url) => (
                                  <div
                                    key={url}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface border border-border text-xs text-foreground"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                    <a href={url} target="_blank" rel="noreferrer" className="hover:underline max-w-[120px] truncate">
                                      ملف
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => removeProjectFile(index, 'files', url)}
                                      aria-label="حذف الملف"
                                      className="text-muted hover:text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs text-muted">
                                <input
                                  type="file"
                                  multiple
                                  onChange={(e) => handleProjectFileUpload(e, index, 'files')}
                                  className="hidden"
                                />
                                {uploading[filesKey] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5" />
                                )}
                                {uploading[filesKey] ? 'جاري الرفع...' : 'رفع ملفات'}
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 7: Advanced */}
                {step === 6 && (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'availableForWork', label: 'متاح للعمل', desc: 'أستقبل فرص عمل جديدة' },
                        { key: 'availableForHiring', label: 'متاح للتوظيف', desc: 'أبحث عن وظيفة بدوام كامل' },
                        { key: 'availableForFreelance', label: 'متاح للعمل الحر', desc: 'أستقبل مشاريع مستقلة' },
                        { key: 'availableForConsultation', label: 'متاح للاستشارات', desc: 'أقدم جلسات استشارية' },
                      ].map((option) => (
                        <label
                          key={option.key}
                          className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-md hover:bg-slate-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={Boolean((form as unknown as Record<string, boolean>)[option.key])}
                            onChange={(e) =>
                              updateField(option.key as keyof FormState, e.target.checked as unknown as FormState[keyof FormState])
                            }
                            className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <div>
                            <div className="text-sm font-medium text-foreground">{option.label}</div>
                            <p className="text-xs text-muted mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="professional-projects-count" className="block text-sm font-medium text-foreground mb-1.5">عدد المشاريع المنجزة</label>
                        <input
                          id="professional-projects-count"
                          type="number"
                          min={0}
                          value={form.completedProjectsCount}
                          onChange={(e) => updateField('completedProjectsCount', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label htmlFor="professional-clients-count" className="block text-sm font-medium text-foreground mb-1.5">عدد العملاء</label>
                        <input
                          id="professional-clients-count"
                          type="number"
                          min={0}
                          value={form.clientsCount}
                          onChange={(e) => updateField('clientsCount', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <label htmlFor="professional-public" className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded-md hover:bg-slate-50 transition-colors">
                      <input
                        id="professional-public"
                        type="checkbox"
                        checked={form.isPublicOnGateway}
                        onChange={(e) => updateField('isPublicOnGateway', e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Eye className="w-4 h-4 text-primary" />
                          الظهور في البوابة العامة
                        </div>
                        <p className="text-xs text-muted mt-1">أوافق على ظهور ملفي في الدليل المهني العام.</p>
                      </div>
                    </label>
                  </motion.div>
                )}

                {/* Step 8: Review */}
                {step === 7 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="bg-slate-50 rounded-md p-4 space-y-3">
                      <h3 className="text-sm font-bold text-foreground">ملخص المعلومات الأساسية</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <SummaryItem label="المسمى المهني" value={form.title} />
                        <SummaryItem label="التصنيف" value={selectedCategory?.name} />
                        <SummaryItem label="المؤهل" value={form.degree} />
                        <SummaryItem label="سنوات الخبرة" value={form.experienceYears} />
                        <SummaryItem label="نطاق العمل" value={WORK_SCOPE_LABELS[form.workScope]} />
                        <SummaryItem label="المدينة" value={form.city} />
                      </div>
                      {form.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {form.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 rounded-full bg-surface border border-border text-muted text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-md p-4 space-y-3">
                      <h3 className="text-sm font-bold text-foreground">الخدمات ({form.services.length})</h3>
                      {form.services.length === 0 ? (
                        <p className="text-xs text-muted">لا توجد خدمات مضافة</p>
                      ) : (
                        <ul className="space-y-1 text-xs text-foreground">
                          {form.services.map((s, i) => (
                            <li key={i} className="bg-surface rounded-lg px-3 py-2 border border-border">
                              {s.name}
                              {s.startingPrice ? ` — ${s.startingPrice} ر.س` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-md p-4 space-y-3">
                      <h3 className="text-sm font-bold text-foreground">معرض الأعمال ({form.portfolioProjects.length})</h3>
                      {form.portfolioProjects.length === 0 ? (
                        <p className="text-xs text-muted">لا توجد مشاريع مضافة</p>
                      ) : (
                        <ul className="space-y-1 text-xs text-foreground">
                          {form.portfolioProjects.map((p, i) => (
                            <li key={i} className="bg-surface rounded-lg px-3 py-2 border border-border">
                              {p.title}
                              {p.images.length || p.videos.length || p.files.length
                                ? ` (${p.images.length + p.videos.length + p.files.length} ملف)`
                                : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-md p-4 space-y-3">
                      <h3 className="text-sm font-bold text-foreground">التواصل</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <SummaryItem label="الهاتف" value={form.phone} />
                        <SummaryItem label="واتساب" value={form.whatsapp} />
                        <SummaryItem label="البريد" value={form.email} />
                        <SummaryItem label="الموقع" value={form.website} />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 text-blue-700 text-xs rounded-md">
                      راجع بياناتك جيداً ثم اضغط إرسال الطلب. سيتم مراجعة ملفك قبل نشره في الدليل.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-border">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 0 || submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-md border border-border text-sm font-medium text-foreground hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                {step === STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        إرسال الطلب
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
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

const WORK_SCOPE_LABELS: Record<WorkScope, string> = {
  IN_PERSON: 'حضوري',
  REMOTE: 'عن بُعد',
  BOTH: 'كلاهما',
};

function SummaryItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="bg-surface rounded-lg p-2.5 border border-border">
      <span className="text-muted">{label}</span>
      <p className="font-medium text-foreground mt-0.5">{value || '—'}</p>
    </div>
  );
}

function TagsInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
  icon: Icon,
}: {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
  icon?: typeof Sparkles;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '،') {
      e.preventDefault();
      if (input.trim()) {
        onAdd(input);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <label htmlFor={`tag-input-${label.replace(/\s+/g, '-')}`} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />}
        <input
          id={`tag-input-${label.replace(/\s+/g, '-')}`}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full ${Icon ? 'pr-10' : 'pr-4'} pl-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
          placeholder={placeholder}
        />
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                aria-label={`حذف ${tag}`}
                className="hover:text-primary-dark"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
