'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import {
  Loader2, Store, MapPin, Phone, Clock, FileText, CheckCircle,
  ArrowRight, ArrowLeft, Sparkles, Image, Link as LinkIcon, AlertCircle,
  AlertTriangle, Eye, EyeOff, Camera, X, Images, Globe, ChevronDown, List,
  LayoutTemplate, ShoppingBag, Check, Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DynamicFieldForm } from '@/components/dynamic-fields/DynamicFieldForm';
import type { DynamicField } from '@/components/dynamic-fields/DynamicFieldForm';
import { EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { BusinessIntroBuilder } from '@/components/business-apply/BusinessIntroBuilder';
import { BusinessStoreBuilder } from '@/components/business-apply/BusinessStoreBuilder';
import type { BuilderStep } from '@/components/business-apply/BuilderStepSidebar';
import { ThemeSelector } from '@/components/business-apply/ThemeSelector';
import { SubcategoryCombobox } from '@/components/business-apply/SubcategoryCombobox';

const DAYS = [
  { day: 'السبت', open: '09:00', close: '21:00' },
  { day: 'الأحد', open: '09:00', close: '21:00' },
  { day: 'الإثنين', open: '09:00', close: '21:00' },
  { day: 'الثلاثاء', open: '09:00', close: '21:00' },
  { day: 'الأربعاء', open: '09:00', close: '21:00' },
  { day: 'الخميس', open: '09:00', close: '21:00' },
  { day: 'الجمعة', open: '', close: '' },
];

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

const getSteps = (websiteType: 'INTRO' | 'STORE' | '') => [
  { id: 1, title: 'المعلومات الأساسية', icon: Store },
  { id: 2, title: 'التصميم والثيم', icon: Palette },
  { id: 3, title: 'الصور والهوية', icon: Image },
  { id: 4, title: websiteType === 'STORE' ? 'المنتجات' : 'الخدمات', icon: ShoppingBag },
  { id: 5, title: 'تفاصيل إضافية', icon: List },
  { id: 6, title: 'الموقع والتواصل', icon: MapPin },
  { id: 7, title: 'ساعات العمل', icon: Clock },
  { id: 8, title: 'المراجعة والإرسال', icon: CheckCircle },
];
export default function BusinessApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    subcategoryId: '',
    customSubcategory: '',
    acceptedTerms: false,
    websiteType: '' as 'INTRO' | 'STORE' | '',
    themePresetId: '',
    logo: '',
    cover: '',
    gallery: [] as string[],
    services: [] as { name: string; description: string; price: string; duration: string; image: string }[],
    products: [] as { name: string; description: string; price: string; comparePrice: string; quantity: string; category: string; image: string }[],
    countryId: '',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    workingHours: DAYS,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string | null>>({});

  const steps = getSteps(form.websiteType);

  // Load dynamic fields when category changes
  useEffect(() => {
    if (!form.categoryId) {
      setDynamicFields([]);
      setFieldValues({});
      return;
    }
    fetch(`/api/categories/${form.categoryId}/fields?appliesTo=BUSINESS`)
      .then((res) => res.json())
      .then((data) => {
        if (data.fields) {
          setDynamicFields(data.fields);
        }
      })
      .catch(() => {
        setDynamicFields([]);
      });
  }, [form.categoryId]);

  // Countries & Cities
  const [countries, setCountries] = useState<{ id: string; name: string; flagEmoji: string; phoneCode: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load categories with subcategories
  useEffect(() => {
    fetch('/api/categories?withSubs=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // Load countries
  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        if (data.countries) setCountries(data.countries);
      })
      .catch(() => {})
      .finally(() => setCountriesLoading(false));
  }, []);

  // Load cities when country changes
  useEffect(() => {
    if (!form.countryId) {
      setCities([]);
      setForm((prev) => ({ ...prev, city: '' }));
      return;
    }
    fetch(`/api/countries/${form.countryId}/cities`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cities) setCities(data.cities);
      })
      .catch(() => setCities([]));
  }, [form.countryId]);

  // Check slug availability
  useEffect(() => {
    if (!form.slug || form.slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        const res = await fetch(`/api/businesses/${form.slug}`);
        setSlugAvailable(res.status === 404);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.slug]);

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) newErrors.name = 'اسم العمل مطلوب';
      if (form.name.length < 2) newErrors.name = 'الاسم قصير جداً';
      if (!form.slug.trim()) newErrors.slug = 'الرابط المخصص مطلوب';
      if (!/^[a-z0-9-]+$/.test(form.slug)) newErrors.slug = 'يحتوي على أحرف إنجليزية وأرقام وشرطات فقط';
      if (slugAvailable === false) newErrors.slug = 'الرابط مستخدم من قبل';
      if (!form.categoryId) newErrors.categoryId = 'اختر تصنيفاً';
      if (!form.subcategoryId && !form.customSubcategory && subcategories.length > 0) {
        newErrors.subcategoryId = 'اختر أو اكتب تصنيفاً فرعياً';
      }
      if (!form.acceptedTerms) {
        newErrors.acceptedTerms = 'يجب الموافقة على الشروط والأحكام للمتابعة';
      }
    }
    if (s === 2) {
      if (!form.themePresetId) {
        newErrors.themePresetId = 'اختر قالباً لتصميم موقعك';
      }
    }
    if (s === 5) {
      dynamicFields.forEach((field) => {
        if (field.isRequired && (!fieldValues[field.id] || fieldValues[field.id] === '')) {
          newErrors[`field_${field.id}`] = `${field.label} مطلوب`;
        }
      });
    }
    if (s === 6) {
      if (!form.countryId) newErrors.countryId = 'اختر الدولة';
      if (form.phone && form.phone.length < 8) {
        newErrors.phone = 'رقم هاتف غير صالح';
      }
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'بريد إلكتروني غير صالح';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < steps.length) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    if (!form.name || !form.slug) return;

    // Open blank window immediately (before async) to avoid popup blocker
    const newWindow = window.open('about:blank', '_blank');
    if (!newWindow) {
      showToast('يرجى السماح بفتح النوافذ المنبثقة من إعدادات المتصفح', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/businesses/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          websiteType: form.websiteType || undefined,
          themePresetId: form.themePresetId || undefined,
          workingHours: form.workingHours.filter((w) => w.open && w.close),
          customSubcategory: form.customSubcategory || undefined,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
          images: form.gallery.map((url) => ({ url, type: 'gallery', caption: '' })),
          services: form.websiteType === 'INTRO' ? form.services.map((s) => ({
            name: s.name,
            description: s.description || undefined,
            price: s.price ? Number(s.price) : undefined,
            duration: s.duration ? Number(s.duration) : undefined,
            image: s.image || undefined,
          })) : undefined,
          products: form.websiteType === 'STORE' ? form.products.map((p) => ({
            name: p.name,
            description: p.description || undefined,
            price: p.price ? Number(p.price) : 0,
            comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
            quantity: p.quantity ? Number(p.quantity) : 0,
            category: p.category || undefined,
            image: p.image || undefined,
          })) : undefined,
          fieldValues,
        }),
      });
      if (res.ok) {
        newWindow.location.href = `/business/${form.slug}`;
        setSubmitted(true);
      } else {
        const data = await res.json();
        if (data.slug) {
          newWindow.location.href = `/business/${data.slug}`;
        } else {
          newWindow.close();
          let errorMsg = data.error || 'فشل في تقديم الطلب';
          if (data.details && Array.isArray(data.details)) {
            errorMsg += '\n\n' + data.details.map((d: any) => `• ${d.field}: ${d.message}`).join('\n');
          }
          showToast(errorMsg, 'error');
        }
      }
    } catch (e) {
      newWindow.close();
      showToast('فشل في تقديم الطلب', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFileUpload = async (
    file: File,
    field: 'logo' | 'cover',
    setUploading: (v: boolean) => void
  ) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        updateForm(field, data.url);
      } else {
        showToast(data.error || 'فشل في رفع الصورة', 'error');
      }
    } catch (e) {
      showToast('فشل في رفع الصورة', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    field: 'logo' | 'cover',
    setUploading: (v: boolean) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file, field, setUploading);
  };

  const handleGalleryUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
      return;
    }
    if (form.gallery.length >= 10) {
      showToast('يمكنك رفع 10 صور كحد أقصى للمعرض', 'error');
      return;
    }
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, gallery: [...prev.gallery, data.url] }));
      } else {
        showToast(data.error || 'فشل في رفع الصورة', 'error');
      }
    } catch {
      showToast('فشل في رفع الصورة', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => handleGalleryUpload(file));
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  // Services management
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', duration: '', image: '' });
  const [uploadingServiceImage, setUploadingServiceImage] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  const handleServiceImageUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
      return;
    }
    setUploadingServiceImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setServiceForm((prev) => ({ ...prev, image: data.url }));
      } else {
        showToast(data.error || 'فشل في رفع الصورة', 'error');
      }
    } catch {
      showToast('فشل في رفع الصورة', 'error');
    } finally {
      setUploadingServiceImage(false);
    }
  };

  const addService = () => {
    if (!serviceForm.name.trim()) {
      showToast('اسم الخدمة مطلوب', 'error');
      return;
    }
    if (form.services.length >= 20) {
      showToast('يمكنك إضافة 20 خدمة كحد أقصى', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { ...serviceForm }],
    }));
    setServiceForm({ name: '', description: '', price: '', duration: '', image: '' });
    setEditingServiceIndex(null);
  };

  const updateService = () => {
    if (editingServiceIndex === null) return;
    if (!serviceForm.name.trim()) {
      showToast('اسم الخدمة مطلوب', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s, i) => (i === editingServiceIndex ? { ...serviceForm } : s)),
    }));
    setServiceForm({ name: '', description: '', price: '', duration: '', image: '' });
    setEditingServiceIndex(null);
  };

  const editService = (index: number) => {
    const s = form.services[index];
    setServiceForm({ ...s });
    setEditingServiceIndex(index);
  };

  const removeService = (index: number) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
    if (editingServiceIndex === index) {
      setServiceForm({ name: '', description: '', price: '', duration: '', image: '' });
      setEditingServiceIndex(null);
    }
  };

  // Product management for STORE
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    quantity: '',
    category: '',
    image: '',
  });
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const handleProductImageUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
      return;
    }
    setUploadingProductImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setProductForm((prev) => ({ ...prev, image: data.url }));
      } else {
        showToast(data.error || 'فشل في رفع الصورة', 'error');
      }
    } catch {
      showToast('فشل في رفع الصورة', 'error');
    } finally {
      setUploadingProductImage(false);
    }
  };

  const addProduct = () => {
    if (!productForm.name.trim()) {
      showToast('اسم المنتج مطلوب', 'error');
      return;
    }
    if (form.products.length >= 20) {
      showToast('يمكنك إضافة 20 منتجاً كحد أقصى', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, { ...productForm }],
    }));
    setProductForm({ name: '', description: '', price: '', comparePrice: '', quantity: '', category: '', image: '' });
    setEditingProductIndex(null);
  };

  const updateProduct = () => {
    if (editingProductIndex === null) return;
    if (!productForm.name.trim()) {
      showToast('اسم المنتج مطلوب', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === editingProductIndex ? { ...productForm } : p)),
    }));
    setProductForm({ name: '', description: '', price: '', comparePrice: '', quantity: '', category: '', image: '' });
    setEditingProductIndex(null);
  };

  const editProduct = (index: number) => {
    const p = form.products[index];
    setProductForm({ ...p });
    setEditingProductIndex(index);
  };

  const removeProduct = (index: number) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
    if (editingProductIndex === index) {
      setProductForm({ name: '', description: '', price: '', comparePrice: '', quantity: '', category: '', image: '' });
      setEditingProductIndex(null);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-10 min-h-screen bg-slate-50">
          <div className="max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface rounded-lg shadow-sm border border-border p-8 text-center mt-10"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">تم إنشاء حسابك التجاري!</h1>
              <p className="text-muted mb-2">
                حسابك قيد المراجعة. سنقوم بإخطارك فور الموافقة عليه.
              </p>
              <p className="text-sm text-primary mb-6">
                بمجرد الموافقة، سيصبح لديك موقع إلكتروني خاص يمكنك مشاركته مع عملائك!
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/business-dashboard"
                  className="px-6 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm"
                >
                  الذهاب للوحة التحكم
                </Link>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2.5 rounded-md text-muted hover:text-foreground transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </>
    );
  }

  const websiteTypeOptions = [
    {
      key: 'INTRO' as const,
      title: 'موقع إلكتروني تعريفي',
      description: 'مناسب لعرض خدماتك وجذب العملاء وحجز المواعيد بشكل احترافي.',
      icon: LayoutTemplate,
      features: [
        'صفحات تعريفية احترافية',
        'عرض الخدمات والأسعار',
        'نماذج طلب واستفسار',
        'نظام حجز المواعيد',
        'استقبال المدفوعات للحجوزات والخدمات',
        'معرض أعمال وصور',
        'تقييمات وآراء العملاء',
        'تحسين الظهور بمحركات البحث',
        'ربط بوسائل التواصل الاجتماعي',
      ],
    },
    {
      key: 'STORE' as const,
      title: 'متجر إلكتروني',
      description: 'يتضمن كل مزايا الموقع التعريفي، بالإضافة إلى بيع المنتجات وإدارة الطلبات.',
      icon: ShoppingBag,
      features: [
        'جميع مزايا الموقع التعريفي',
        'إدارة المنتجات والتصنيفات',
        'إدارة المخزون والكميات',
        'سلة شراء متكاملة',
        'بوابات دفع إلكتروني',
        'إدارة الطلبات والشحن',
        'كوبونات وعروض ترويجية',
        'تقارير المبيعات والإيرادات',
        'إدارة العملاء والطلبات المتكررة',
      ],
    },
  ];

  if (!form.websiteType) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-10 min-h-screen bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">اختر نوع موقعك الإلكتروني</h1>
              <p className="text-muted mt-1">
                كل خيار يمنحك أدوات تناسب أهدافك، وكلاهما يدعم الدفع الإلكتروني
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {websiteTypeOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={option.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">{option.title}</h2>
                    <p className="text-sm text-muted mb-4">{option.description}</p>
                    <ul className="space-y-2 mb-6 flex-1">
                      {option.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, websiteType: option.key }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full px-4 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                    >
                      اختر {option.title}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-xs text-muted">
              ✦ كلتا الخيارين يتضمنان وسائل دفع إلكتروني آمنة للخدمات والحجوزات
            </p>
          </div>
        </main>
      </>
    );
  }

  const renderStep = () => (
    <>
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="business-name" className="block text-sm font-medium text-foreground mb-1.5">
                              اسم العمل <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="business-name"
                              value={form.name}
                              onChange={(e) => updateForm('name', e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-md border ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all`}
                              placeholder="مثال: صالون الجمال"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                          </div>

                          <div>
                            <label htmlFor="business-slug" className="block text-sm font-medium text-foreground mb-1.5">
                              الرابط المخصص <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-muted text-sm bg-slate-100 px-3 py-2.5 rounded-md shrink-0">gateo.com/business/</span>
                              <div className="flex-1 relative min-w-0">
                                <input
                                  id="business-slug"
                                  value={form.slug}
                                  onChange={(e) => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                  className={`w-full px-4 py-2.5 rounded-md border ${errors.slug ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all text-left dir-ltr`}
                                  dir="ltr"
                                  placeholder="salon-aljamal"
                                />
                                {slugChecking && (
                                  <Loader2 className="absolute left-3 top-3 w-4 h-4 animate-spin text-muted" />
                                )}
                                {!slugChecking && slugAvailable === true && (
                                  <CheckCircle className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                                )}
                                {!slugChecking && slugAvailable === false && (
                                  <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                            {errors.slug ? (
                              <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                            ) : slugAvailable === true ? (
                              <p className="text-green-600 text-xs mt-1">الرابط متاح</p>
                            ) : slugAvailable === false ? (
                              <p className="text-red-500 text-xs mt-1">الرابط مستخدم من قبل</p>
                            ) : null}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="business-description" className="block text-sm font-medium text-foreground mb-1.5">الوصف</label>
                          <textarea
                            id="business-description"
                            value={form.description}
                            onChange={(e) => updateForm('description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            placeholder="صفّي عملك بشكل مختصر وجذاب..."
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="business-category" className="block text-sm font-medium text-foreground mb-1.5">
                              التصنيف الرئيسي <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="business-category"
                              value={form.categoryId}
                              onChange={(e) => {
                                setForm((prev) => ({
                                  ...prev,
                                  categoryId: e.target.value,
                                  subcategoryId: '',
                                  customSubcategory: '',
                                }));
                                setErrors((prev) => {
                                  const next = { ...prev };
                                  delete next.categoryId;
                                  delete next.subcategoryId;
                                  return next;
                                });
                              }}
                              className={`w-full px-4 py-2.5 rounded-md border ${errors.categoryId ? 'border-red-300' : 'border-border'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface`}
                            >
                              <option value="">اختر تصنيفاً رئيسياً</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                          </div>

                          <SubcategoryCombobox
                            subcategories={subcategories}
                            selectedId={form.subcategoryId}
                            customValue={form.customSubcategory}
                            onChange={({ subcategoryId, customSubcategory }) => {
                              setForm((prev) => ({ ...prev, subcategoryId, customSubcategory }));
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.subcategoryId;
                                return next;
                              });
                            }}
                            disabled={!form.categoryId}
                            error={errors.subcategoryId}
                            emptyMessage={!form.categoryId ? 'اختر التصنيف الرئيسي أولاً' : 'لا توجد تصنيفات فرعية'}
                          />
                        </div>

                        {form.categoryId && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-0.5">
                                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-amber-800">تنبيه مهم</p>
                                  <p className="text-sm text-amber-700 leading-relaxed">
                                    هذا الخيار متاح لأصحاب المنشآت التجارية الفعلية فقط، ويتطلب إجراء عملية توثيق.
                                  </p>
                                  <p className="text-sm text-amber-700 leading-relaxed flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    استمر وأنهِ موقعك الإلكتروني خلال دقائق.
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
                              <p className="text-sm font-bold text-foreground">الشروط والأحكام الخاصة بالنشاطات التجارية</p>
                              <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-slate-50 p-3 text-xs text-muted leading-relaxed space-y-2">
                                <p>باستخدامك هذا الخيار فإنك توافق على ما يلي:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>أنك صاحب منشأة تجارية فعلية ومسجلة بشكل قانوني.</li>
                                  <li>أن جميع البيانات المقدمة صحيحة وقابلة للتوثيق.</li>
                                  <li>أن المنصة لها الحق في طلب مستندات إثبات في أي وقت.</li>
                                  <li>أن المنصة قد ترفض أو تعلّق أي حساب لا يتوافق مع هذه الشروط.</li>
                                  <li>الالتزام بكافة سياسات المحتوى والخصوصية المعمول بها في Gateo.</li>
                                </ul>
                              </div>
                              <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.acceptedTerms}
                                  onChange={(e) => {
                                    setForm((prev) => ({ ...prev, acceptedTerms: e.target.checked }));
                                    setErrors((prev) => {
                                      if (!prev.acceptedTerms) return prev;
                                      const next = { ...prev };
                                      delete next.acceptedTerms;
                                      return next;
                                    });
                                  }}
                                  className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">قرأت الشروط والأحكام وأوافق عليها</span>
                              </label>
                              {errors.acceptedTerms && (
                                <p className="text-red-500 text-xs">{errors.acceptedTerms}</p>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Theme */}
                    {step === 2 && (
                      <motion.div
                        key="step2-theme"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <ThemeSelector
                          selectedPresetId={form.themePresetId}
                          onSelect={(presetId) => {
                            setForm((prev) => ({ ...prev, themePresetId: presetId }));
                            setErrors((prev) => {
                              const next = { ...prev };
                              delete next.themePresetId;
                              return next;
                            });
                          }}
                          businessName={form.name}
                          categoryName={selectedCategory?.name}
                          subcategoryName={
                            selectedCategory?.subcategories?.find((s) => s.id === form.subcategoryId)?.name ||
                            form.customSubcategory
                          }
                        />
                        {errors.themePresetId && (
                          <p className="text-red-500 text-xs">{errors.themePresetId}</p>
                        )}
                      </motion.div>
                    )}

                    {/* Step 3: Images */}
                    {step === 3 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* Logo & Cover side by side */}
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Logo Upload */}
                          <div className="md:col-span-1">
                            <label htmlFor="business-logo-upload" className="block text-sm font-medium text-foreground mb-1.5">صورة الشعار</label>
                            <div className="flex flex-col items-center gap-3 p-4 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center relative">
                              <input
                                id="business-logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, 'logo', setUploadingLogo);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="w-20 h-20 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden border border-border">
                                {form.logo ? (
                                  <img src={form.logo} alt={form.name || 'شعار النشاط'} className="w-full h-full object-cover" />
                                ) : (
                                  <Camera className="w-8 h-8 text-slate-300" />
                                )}
                              </div>
                              {uploadingLogo ? (
                                <div className="flex items-center justify-center gap-2 text-primary text-sm">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>جاري الرفع...</span>
                                </div>
                              ) : (
                                <div className="text-sm text-muted">
                                  <span className="text-primary font-medium">اضغط لاختيار صورة</span>
                                </div>
                              )}
                              <p className="text-[10px] text-muted">JPEG, PNG, WebP, GIF — بحد أقصى 5 ميجابايت</p>
                            </div>
                          </div>

                          {/* Cover Upload */}
                          <div className="md:col-span-2">
                            <label htmlFor="business-cover-upload" className="block text-sm font-medium text-foreground mb-1.5">صورة الغلاف</label>
                            <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleDrop(e, 'cover', setUploadingCover)}
                              className="relative w-full h-44 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer overflow-hidden"
                            >
                              <input
                                id="business-cover-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, 'cover', setUploadingCover);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              {form.cover ? (
                                <img src={form.cover} alt={form.name || 'صورة الغلاف'} className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                                  <Camera className="w-10 h-10 mb-2" />
                                  <span className="text-sm">اضغط أو اسحب صورة الغلاف هنا</span>
                                </div>
                              )}
                              {uploadingCover && (
                                <div className="absolute inset-0 bg-surface/80 flex items-center justify-center z-20">
                                  <div className="flex items-center gap-2 text-primary">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm font-medium">جاري الرفع...</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-1.5">يفضل 1200×400 بكسل — JPEG, PNG, WebP, GIF — بحد أقصى 5 ميجابايت</p>
                          </div>
                        </div>

                        {/* Gallery Upload */}
                        <div>
                          <label htmlFor="business-gallery-upload" className="block text-sm font-medium text-foreground mb-1.5">معرض الصور</label>
                          <p className="text-xs text-muted mb-2">أضف صوراً لعملك (اختياري — حتى 10 صور)</p>

                          {/* Gallery Grid */}
                          {form.gallery.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                              {form.gallery.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                                  <img src={url} alt={'صورة ' + (index + 1)} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    aria-label="حذف الصورة"
                                    className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    title="حذف"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upload Area */}
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleGalleryDrop}
                            className="relative w-full px-4 py-3 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center"
                          >
                            <input
                              id="business-gallery-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach((file) => handleGalleryUpload(file));
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {uploadingGallery ? (
                              <div className="flex items-center justify-center gap-2 text-primary">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">جاري الرفع...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-muted">
                                <Images className="w-5 h-5 text-primary" />
                                <span className="text-sm">
                                  <span className="text-primary font-medium">اضغط لاختيار صور</span>
                                  <span className="mx-1">أو اسحبها هنا</span>
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-1">
                            {form.gallery.length}/10 صور — JPEG, PNG, WebP, GIF — بحد أقصى 5 ميجابايت لكل صورة
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Services / Products */}
                    {step === 4 && form.websiteType === 'INTRO' && (
                      <motion.div
                        key="step3-services"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* Service Form */}
                        <div className="bg-slate-50 rounded-md p-4 space-y-4">
                          <h3 className="font-bold text-foreground text-sm">
                            {editingServiceIndex !== null ? 'تعديل خدمة' : 'إضافة خدمة جديدة'}
                          </h3>

                          <div>
                            <label htmlFor="service-name" className="block text-sm font-medium text-foreground mb-1">اسم الخدمة *</label>
                            <input
                              id="service-name"
                              value={serviceForm.name}
                              onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="مثال: قص الشعر"
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <label htmlFor="service-description" className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                              <textarea
                                id="service-description"
                                value={serviceForm.description}
                                onChange={(e) => setServiceForm((prev) => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="وصف مختصر للخدمة..."
                              />
                            </div>

                            {/* Service Image Upload */}
                            <div>
                              <label htmlFor="service-image-upload" className="block text-sm font-medium text-foreground mb-1">صورة الخدمة</label>
                              <div className="relative h-[calc(100%-1.75rem)] min-h-[6.5rem] rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 overflow-hidden">
                                <input
                                  id="service-image-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleServiceImageUpload(file);
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {serviceForm.image ? (
                                  <img src={serviceForm.image} alt={serviceForm.name || 'صورة الخدمة'} className="absolute inset-0 w-full h-full object-cover" />
                                ) : null}
                                {uploadingServiceImage ? (
                                  <div className="flex items-center justify-center gap-2 text-primary relative z-20 bg-surface/80 px-2 py-1 rounded">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">جاري الرفع...</span>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted relative z-20 px-2">
                                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                    <span className="text-primary font-medium text-xs">اضغط لاختيار صورة</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="service-price" className="block text-sm font-medium text-foreground mb-1">السعر (ر.س)</label>
                              <input
                                id="service-price"
                                type="number"
                                value={serviceForm.price}
                                onChange={(e) => setServiceForm((prev) => ({ ...prev, price: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label htmlFor="service-duration" className="block text-sm font-medium text-foreground mb-1">المدة (دقيقة)</label>
                              <input
                                id="service-duration"
                                type="number"
                                value={serviceForm.duration}
                                onChange={(e) => setServiceForm((prev) => ({ ...prev, duration: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="30"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {editingServiceIndex !== null ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setServiceForm({ name: '', description: '', price: '', duration: '', image: '' });
                                    setEditingServiceIndex(null);
                                  }}
                                  className="px-4 py-2 rounded-md text-muted hover:bg-slate-100 transition-colors text-sm"
                                >
                                  إلغاء
                                </button>
                                <button
                                  type="button"
                                  onClick={updateService}
                                  className="flex-1 px-4 py-2 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
                                >
                                  حفظ التعديل
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={addService}
                                className="w-full px-4 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:shadow-sm transition-all flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                إضافة الخدمة
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Services List */}
                        {form.services.length > 0 && (
                          <div>
                            <h3 className="font-bold text-foreground text-sm mb-3">
                              الخدمات المضافة ({form.services.length})
                            </h3>
                            <div className="space-y-2">
                              {form.services.map((service, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-surface rounded-md border border-border p-3 flex items-center gap-3"
                                >
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br bg-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {service.image ? (
                                      <img src={service.image} alt={service.name || 'صورة الخدمة'} className="w-full h-full object-cover" />
                                    ) : (
                                      <Sparkles className="w-5 h-5 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground text-sm">{service.name}</h4>
                                    {service.description && (
                                      <p className="text-xs text-muted truncate">{service.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                                      {service.duration && <span>{service.duration} دقيقة</span>}
                                      {service.price && <span className="text-primary font-medium">{service.price} ر.س</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => editService(index)}
                                      aria-label="تعديل الخدمة"
                                      className="p-1.5 rounded-lg text-muted hover:text-primary-dark hover:bg-primary/5 transition-colors"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeService(index)}
                                      aria-label="حذف الخدمة"
                                      className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {step === 4 && form.websiteType === 'STORE' && (
                      <motion.div
                        key="step3-products"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* Product Form */}
                        <div className="bg-slate-50 rounded-md p-4 space-y-4">
                          <h3 className="font-bold text-foreground text-sm">
                            {editingProductIndex !== null ? 'تعديل منتج' : 'إضافة منتج جديد'}
                          </h3>

                          <div>
                            <label htmlFor="product-name" className="block text-sm font-medium text-foreground mb-1">اسم المنتج *</label>
                            <input
                              id="product-name"
                              value={productForm.name}
                              onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="مثال: عطر فاخر 100 مل"
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <label htmlFor="product-description" className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                              <textarea
                                id="product-description"
                                value={productForm.description}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="وصف مختصر للمنتج..."
                              />
                            </div>

                            {/* Product Image Upload */}
                            <div>
                              <label htmlFor="product-image-upload" className="block text-sm font-medium text-foreground mb-1">صورة المنتج</label>
                              <div className="relative h-[calc(100%-1.75rem)] min-h-[6.5rem] rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 overflow-hidden">
                                <input
                                  id="product-image-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleProductImageUpload(file);
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {productForm.image ? (
                                  <img src={productForm.image} alt={productForm.name || 'صورة المنتج'} className="absolute inset-0 w-full h-full object-cover" />
                                ) : null}
                                {uploadingProductImage ? (
                                  <div className="flex items-center justify-center gap-2 text-primary relative z-20 bg-surface/80 px-2 py-1 rounded">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">جاري الرفع...</span>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted relative z-20 px-2">
                                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                                    <span className="text-primary font-medium text-xs">اضغط لاختيار صورة</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label htmlFor="product-price" className="block text-sm font-medium text-foreground mb-1">السعر (ر.س) *</label>
                              <input
                                id="product-price"
                                type="number"
                                value={productForm.price}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label htmlFor="product-compare-price" className="block text-sm font-medium text-foreground mb-1">السعر قبل الخصم</label>
                              <input
                                id="product-compare-price"
                                type="number"
                                value={productForm.comparePrice}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, comparePrice: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label htmlFor="product-quantity" className="block text-sm font-medium text-foreground mb-1">الكمية</label>
                              <input
                                id="product-quantity"
                                type="number"
                                value={productForm.quantity}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="10"
                              />
                            </div>
                            <div>
                              <label htmlFor="product-category" className="block text-sm font-medium text-foreground mb-1">التصنيف</label>
                              <input
                                id="product-category"
                                value={productForm.category}
                                onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="مثال: عطور"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {editingProductIndex !== null ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductForm({ name: '', description: '', price: '', comparePrice: '', quantity: '', category: '', image: '' });
                                    setEditingProductIndex(null);
                                  }}
                                  className="px-4 py-2 rounded-md text-muted hover:bg-slate-100 transition-colors text-sm"
                                >
                                  إلغاء
                                </button>
                                <button
                                  type="button"
                                  onClick={updateProduct}
                                  className="flex-1 px-4 py-2 rounded-md bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
                                >
                                  حفظ التعديل
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={addProduct}
                                className="w-full px-4 py-2.5 rounded-md bg-primary text-white font-medium text-sm hover:shadow-sm transition-all flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-4 h-4" />
                                إضافة المنتج
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Products List */}
                        {form.products.length > 0 && (
                          <div>
                            <h3 className="font-bold text-foreground text-sm mb-3">
                              المنتجات المضافة ({form.products.length})
                            </h3>
                            <div className="space-y-2">
                              {form.products.map((product, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-surface rounded-md border border-border p-3 flex items-center gap-3"
                                >
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br bg-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {product.image ? (
                                      <img src={product.image} alt={product.name || 'صورة المنتج'} className="w-full h-full object-cover" />
                                    ) : (
                                      <ShoppingBag className="w-5 h-5 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground text-sm">{product.name}</h4>
                                    {product.description && (
                                      <p className="text-xs text-muted truncate">{product.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted">
                                      {product.category && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{product.category}</span>}
                                      {product.quantity && <span>الكمية: {product.quantity}</span>}
                                      <span className="text-primary font-medium">{product.price || 0} ر.س</span>
                                      {product.comparePrice && Number(product.comparePrice) > 0 && (
                                        <span className="line-through">{product.comparePrice} ر.س</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => editProduct(index)}
                                      aria-label="تعديل المنتج"
                                      className="p-1.5 rounded-lg text-muted hover:text-primary-dark hover:bg-primary/5 transition-colors"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeProduct(index)}
                                      aria-label="حذف المنتج"
                                      className="p-1.5 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 5: Dynamic Fields */}
                    {step === 5 && (
                      <motion.div
                        key="step4-fields"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        {dynamicFields.length > 0 ? (
                          <>
                            <p className="text-sm text-muted">
                              أكملي الحقول الإضافية التالية المتعلقة بتصنيف عملك.
                            </p>
                            <DynamicFieldForm
                              fields={dynamicFields}
                              values={fieldValues}
                              onChange={setFieldValues}
                            />
                            {Object.keys(errors).some((k) => k.startsWith('field_')) && (
                              <p className="text-red-500 text-xs">
                                يرجى تعبئة جميع الحقول المطلوبة.
                              </p>
                            )}
                          </>
                        ) : (
                          <EmptyState
                            icon={List}
                            title="لا توجد حقول إضافية لهذا التصنيف"
                            description="يمكنك المتابعة للخطوة التالية."
                            className="py-10"
                          />
                        )}
                      </motion.div>
                    )}

                    {/* Step 6: Contact & Location */}
                    {step === 6 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* Country */}
                        <CountrySelect
                          countries={countries}
                          value={form.countryId}
                          onChange={(countryId) => {
                            updateForm('countryId', countryId);
                            updateForm('city', '');
                          }}
                          label="الدولة"
                          required
                          loading={countriesLoading}
                          showPhoneCode
                          autoDetect
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="business-city" className="block text-sm font-medium text-foreground mb-1.5">المدينة</label>
                            <div className="relative">
                              <select
                                id="business-city"
                                value={form.city}
                                onChange={(e) => updateForm('city', e.target.value)}
                                disabled={!form.countryId}
                                className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface appearance-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">اختر المدينة</option>
                                {cities.map((c) => (
                                  <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="business-phone" className="block text-sm font-medium text-foreground mb-1.5">الهاتف</label>
                            <div className="flex gap-2">
                              <span className="shrink-0 rounded-md border border-border px-3 py-2.5 text-sm text-muted bg-slate-50 flex items-center gap-1 min-w-[5rem] justify-center">
                                <Globe className="w-3.5 h-3.5" />
                                {countries.find((c) => c.id === form.countryId)?.phoneCode || '+00'}
                              </span>
                              <input
                                id="business-phone"
                                value={form.phone}
                                onChange={(e) => updateForm('phone', e.target.value)}
                                className={`flex-1 px-4 py-2.5 rounded-md border ${errors.phone ? 'border-red-300' : 'border-border'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left dir-ltr text-sm`}
                                dir="ltr"
                                placeholder="5xxxxxxxx"
                              />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="business-address" className="block text-sm font-medium text-foreground mb-1.5">العنوان التفصيلي</label>
                          <div className="relative">
                            <MapPin className="absolute right-3 top-3 w-4 h-4 text-muted" />
                            <input
                              id="business-address"
                              value={form.address}
                              onChange={(e) => updateForm('address', e.target.value)}
                              className="w-full pr-10 px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="الحي، الشارع، رقم المبنى"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="business-latitude" className="block text-sm font-medium text-foreground mb-1.5">خط العرض</label>
                            <input
                              id="business-latitude"
                              value={form.latitude}
                              onChange={(e) => updateForm('latitude', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left dir-ltr"
                              dir="ltr"
                              placeholder="24.7136"
                            />
                          </div>
                          <div>
                            <label htmlFor="business-longitude" className="block text-sm font-medium text-foreground mb-1.5">خط الطول</label>
                            <input
                              id="business-longitude"
                              value={form.longitude}
                              onChange={(e) => updateForm('longitude', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-md border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left dir-ltr"
                              dir="ltr"
                              placeholder="46.6753"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="business-email" className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
                          <input
                            id="business-email"
                            value={form.email}
                            onChange={(e) => updateForm('email', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-md border ${errors.email ? 'border-red-300' : 'border-border'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-left dir-ltr`}
                            dir="ltr"
                            placeholder="email@example.com"
                          />
                          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 7: Working Hours */}
                    {step === 7 && (
                      <motion.div
                        key="step6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3"
                      >
                        <p className="text-sm text-muted">حدّدي ساعات العمل لكل يوم. اتركي الحقول فارغة للأيام المغلقة.</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          {form.workingHours.map((wh, i) => (
                            <div key={wh.day} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-md">
                              <span className="w-16 text-sm font-medium text-foreground">{wh.day}</span>
                              <input
                                type="time"
                                value={wh.open}
                                onChange={(e) => {
                                  const updated = [...form.workingHours];
                                  updated[i] = { ...wh, open: e.target.value };
                                  setForm((prev) => ({ ...prev, workingHours: updated }));
                                }}
                                className="flex-1 px-2 py-1.5 rounded-lg border border-border text-sm min-w-0"
                              />
                              <span className="text-muted text-xs">إلى</span>
                              <input
                                type="time"
                                value={wh.close}
                                onChange={(e) => {
                                  const updated = [...form.workingHours];
                                  updated[i] = { ...wh, close: e.target.value };
                                  setForm((prev) => ({ ...prev, workingHours: updated }));
                                }}
                                className="flex-1 px-2 py-1.5 rounded-lg border border-border text-sm min-w-0"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 8: Review */}
                    {step === 8 && (
                      <motion.div
                        key="step7"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="bg-slate-50 rounded-md p-5 space-y-4">
                          <h3 className="font-bold text-foreground">ملخص البيانات</h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted">الاسم:</span>
                              <span className="text-foreground mr-2 font-medium">{form.name}</span>
                            </div>
                            <div>
                              <span className="text-muted">الرابط:</span>
                              <span className="text-foreground mr-2 font-medium text-left dir-ltr inline-block">gateo.com/business/{form.slug}</span>
                            </div>
                            <div>
                              <span className="text-muted">التصنيف الرئيسي:</span>
                              <span className="text-foreground mr-2 font-medium">
                                {categories.find((c) => c.id === form.categoryId)?.name || form.categoryId}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted">التصنيف الفرعي:</span>
                              <span className="text-foreground mr-2 font-medium">
                                {selectedCategory?.subcategories?.find((s) => s.id === form.subcategoryId)?.name || form.customSubcategory || form.subcategoryId || '—'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted">المدينة:</span>
                              <span className="text-foreground mr-2 font-medium">{form.city || '—'}</span>
                            </div>
                            <div>
                              <span className="text-muted">الهاتف:</span>
                              <span className="text-foreground mr-2 font-medium">{form.phone || '—'}</span>
                            </div>
                            <div>
                              <span className="text-muted">العنوان:</span>
                              <span className="text-foreground mr-2 font-medium">{form.address || '—'}</span>
                            </div>
                          </div>
                          {form.description && (
                            <div>
                              <span className="text-muted text-sm">الوصف:</span>
                              <p className="text-sm text-foreground mt-1">{form.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-primary/5 border border-primary/10 rounded-md p-4">
                          <p className="text-sm text-primary-dark">
                            <Sparkles className="w-4 h-4 inline-block ml-1" />
                            بعد الإرسال، سيصبح لديك موقع إلكتروني خاص بعملك على الرابط:
                            <strong className="block mt-1 text-primary-dark">gateo.com/business/{form.slug}</strong>
                          </p>
                        </div>
                      </motion.div>
                    )}
    </>
  );

  if (form.websiteType === 'INTRO') {
    return (
      <BusinessIntroBuilder
        steps={steps as BuilderStep[]}
        step={step}
        setStep={setStep}
        form={form}
        categories={categories}
        themePresetId={form.themePresetId}
        onBack={() => setForm((prev) => ({ ...prev, websiteType: '' }))}
        onNext={handleNext}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        {renderStep()}
      </BusinessIntroBuilder>
    );
  }

  if (form.websiteType === 'STORE') {
    return (
      <BusinessStoreBuilder
        steps={steps as BuilderStep[]}
        step={step}
        setStep={setStep}
        form={form}
        categories={categories}
        themePresetId={form.themePresetId}
        onBack={() => setForm((prev) => ({ ...prev, websiteType: '' }))}
        onNext={handleNext}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        {renderStep()}
      </BusinessStoreBuilder>
    );
  }

  const StepIcon = steps[step - 1]?.icon || Store;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">أنشئ حسابك التجاري</h1>
            <p className="text-muted mt-1">
              خطوات بسيطة تفصلك عن موقع إلكتروني احترافي لعملك
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {form.websiteType === 'STORE' ? <ShoppingBag className="w-3.5 h-3.5" /> : <LayoutTemplate className="w-3.5 h-3.5" />}
              {form.websiteType === 'STORE' ? 'متجر إلكتروني' : 'موقع إلكتروني تعريفي'}
            </span>
          </motion.div>

          {/* Steps Progress */}
          <div className="bg-surface rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isActive = s.id === step;
                const isDone = s.id < step;
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : isDone
                            ? 'bg-green-100 text-green-600'
                            : 'bg-slate-100 text-muted'
                        }`}
                      >
                        {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium ${isActive ? 'text-primary' : 'text-muted'}`}>
                        {s.title}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${s.id < step ? 'bg-green-300' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden"
              >
                <div className="p-6 border-b border-border flex items-center gap-3">
                  <StepIcon className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-foreground">{steps[step - 1].title}</h2>
                </div>

                <div className="p-6 space-y-5 min-h-[360px]">
                  <AnimatePresence mode="wait">
                    {renderStep()}
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="p-6 border-t border-border flex items-center justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={step === 1}
                    className="px-5 py-2.5 rounded-md text-muted hover:bg-slate-100 transition-colors disabled:opacity-30 flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    السابق
                  </button>
                  <div className="flex gap-1.5">
                    {steps.map((s) => (
                      <div
                        key={s.id}
                        className={`w-2 h-2 rounded-full ${s.id === step ? 'bg-primary' : s.id < step ? 'bg-green-400' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  {step < steps.length ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {submitting ? 'جاري الإنشاء...' : 'إنشاء حسابي التجاري'}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">معاينة صفحة عملك</h3>
                    <p className="text-[11px] text-muted">تظهر التحديثات هنا فوراً</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border shadow-sm bg-surface overflow-hidden">
                  {/* Cover */}
                  <div className="h-32 bg-gradient-to-br from-primary to-primary-dark relative">
                    {form.cover ? (
                      <img src={form.cover} alt={form.name || 'صورة الغلاف'} className="w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Profile Header */}
                  <div className="px-4 pb-4 -mt-10 relative">
                    <div className="flex items-end gap-3">
                      <div className="w-20 h-20 rounded-xl bg-surface border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                        {form.logo ? (
                          <img src={form.logo} alt={form.name || 'شعار النشاط'} className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="mb-2 flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-base truncate">{form.name || 'اسم العمل'}</h4>
                        <p className="text-xs text-muted truncate">gateo.com/business/{form.slug || '...'}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {/* Category badges */}
                      {(form.categoryId || form.subcategoryId) && (
                        <div className="flex flex-wrap gap-1.5">
                          {form.categoryId && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              {categories.find((c) => c.id === form.categoryId)?.name}
                            </span>
                          )}
                          {(form.subcategoryId || form.customSubcategory) && (
                            <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                              {selectedCategory?.subcategories?.find((s) => s.id === form.subcategoryId)?.name || form.customSubcategory}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                        {form.description || 'الوصف سيظهر هنا بمجرد إضافته...'}
                      </p>

                      {/* Gallery Preview */}
                      {form.gallery.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted mb-1.5">معرض الصور</p>
                          <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {form.gallery.slice(0, 4).map((url, i) => (
                              <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                <img src={url} alt={'صورة ' + (i + 1)} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {form.gallery.length > 4 && (
                              <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] text-muted font-medium">
                                +{form.gallery.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Services Preview */}
                      {form.services.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted mb-1.5">الخدمات ({form.services.length})</p>
                          <div className="space-y-1.5">
                            {form.services.slice(0, 3).map((service, i) => (
                              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-md px-2 py-1.5">
                                <span className="text-xs text-foreground truncate flex-1">{service.name}</span>
                                {service.price && (
                                  <span className="text-xs text-primary font-medium mr-2">{service.price} ر.س</span>
                                )}
                              </div>
                            ))}
                            {form.services.length > 3 && (
                              <p className="text-[10px] text-muted">+{form.services.length - 3} خدمات أخرى</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact chips */}
                      <div className="flex flex-wrap gap-2">
                        {form.city && (
                          <span className="text-[10px] bg-slate-100 text-muted px-2 py-1 rounded-full flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" /> {form.city}
                          </span>
                        )}
                        {form.phone && (
                          <span className="text-[10px] bg-slate-100 text-muted px-2 py-1 rounded-full flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> {form.phone}
                          </span>
                        )}
                      </div>

                      {/* CTA Buttons */}
                      <div className="pt-3 border-t border-border flex gap-2">
                        <div className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold text-center">
                          حجز موعد
                        </div>
                        <div className="flex-1 py-2 rounded-lg bg-slate-100 text-muted text-xs font-bold text-center">
                          مراسلة
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-surface rounded-md border border-border p-4">
                  <h4 className="font-bold text-foreground text-sm mb-2">لماذا حساب تجاري؟</h4>
                  <ul className="space-y-2 text-xs text-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      موقع إلكتروني خاص بعملك
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      رابط قابل للمشاركة مع العملاء
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      لوحة تحكم متكاملة
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      نظام حجوزات وخدمات
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      ظهور في نتائج البحث
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
