'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SubcategoryMultiSelect } from '@/components/business-apply/SubcategoryMultiSelect';
import MapPicker from '@/components/maps/MapPicker';
import CountrySelect from '@/components/CountrySelect';
import { compressImage } from '@/lib/media-compression';
import { parseMapUrl, buildMapUrl } from '@/lib/location-utils';
import { Loader2, Save, MapPin, Phone, Globe, Clock, ImagePlus, X, Check, ChevronLeft, Building2, Store, FileText, Images, Eye, Briefcase, CalendarDays, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
  flagEmoji: string;
  phoneCode: string;
}

interface WorkingHour {
  day: string;
  open: string;
  close: string;
}

interface GalleryImage {
  url: string;
  type?: string;
  caption?: string;
}

interface BusinessDocument {
  type: string;
  url: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

type TabId = 'basic' | 'branding' | 'location' | 'hours' | 'gallery' | 'documents';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: 'المعلومات الأساسية', icon: Building2 },
  { id: 'branding', label: 'الهوية البصرية', icon: ImagePlus },
  { id: 'location', label: 'الموقع والتواصل', icon: MapPin },
  { id: 'hours', label: 'ساعات العمل', icon: Clock },
  { id: 'gallery', label: 'معرض الصور', icon: Images },
  { id: 'documents', label: 'الوثائق والظهور', icon: FileText },
];

const DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const DOCUMENT_TYPES = [
  { value: 'commercial_registration', label: 'سجل تجاري' },
  { value: 'license', label: 'رخصة مزاولة المهنة' },
  { value: 'identity', label: 'هوية وطنية' },
  { value: 'other', label: 'وثيقة أخرى' },
];

export default function EditBusinessPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [form, setForm] = useState<any>({});
  const [countryId, setCountryId] = useState<string>('');
  const [mapLink, setMapLink] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    fetchBusiness();
    fetchCategories();
    fetchCountries();
  }, [id]);

  // Load cities when country changes
  useEffect(() => {
    if (!countryId) {
      setCities([]);
      return;
    }
    fetch(`/api/countries/${countryId}/cities`)
      .then((r) => r.json())
      .then((data) => {
        if (data.cities) setCities(data.cities.map((c: any) => c.name));
      })
      .catch(() => setCities([]));
  }, [countryId]);

  // Sync map link with coordinates when business data loads
  useEffect(() => {
    if (form.latitude != null && form.longitude != null) {
      setMapLink(buildMapUrl(Number(form.latitude), Number(form.longitude)));
    } else {
      setMapLink('');
    }
  }, [form.latitude, form.longitude]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/businesses/${id}`);
      if (res.ok) {
        const data = await res.json();
        const b = data.business;
        // Normalize multi-subcategory fields
        b.subcategoryIds = (b.subcategories || []).map((s: any) => s.id);
        b.customSubcategories = b.customSubcategories || [];
        if (!b.subcategoryIds.length && b.subcategory?.id) {
          b.subcategoryIds = [b.subcategory.id];
        }
        if (!b.customSubcategories.length && b.customSubcategory) {
          b.customSubcategories = [b.customSubcategory];
        }
        // Normalize documents to always be an array
        b.documents = Array.isArray(b.documents) ? b.documents : [];
        setForm(b);
        if (b.countryId) setCountryId(b.countryId);
      } else {
        router.push(`/business/${id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?withSubs=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/countries');
      if (res.ok) {
        const data = await res.json();
        setCountries(data.countries || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async (payload?: any) => {
    setSaving(true);
    try {
      const body = payload || buildPayloadForTab(activeTab);
      const res = await fetch(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(data.business);
        if (data.business.countryId) setCountryId(data.business.countryId);
        showMessage('success', 'تم حفظ التغييرات بنجاح');
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'فشل في الحفظ');
      }
    } catch (e) {
      showMessage('error', 'حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const buildPayloadForTab = (tab: TabId) => {
    switch (tab) {
      case 'basic':
        return {
          name: form.name,
          description: form.description,
          businessType: form.businessType,
          categoryId: form.categoryId,
          subcategoryIds: form.subcategoryIds || [],
          customSubcategories: form.customSubcategories || [],
        };
      case 'branding':
        return { logo: form.logo, cover: form.cover };
      case 'location':
        return {
          countryId,
          city: form.city,
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
          phone: form.phone,
          email: form.email,
          website: form.website,
        };
      case 'hours':
        return { workingHours: form.workingHours || [] };
      case 'gallery':
        return { images: form.images || [] };
      case 'documents':
        return { documents: form.documents || [], isPublicOnGateway: form.isPublicOnGateway };
      default:
        return {};
    }
  };

  const handleMapChange = useCallback((lat: number, lng: number) => {
    setForm((prev: any) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const handleMapLinkChange = useCallback((value: string) => {
    setMapLink(value);
    const coords = parseMapUrl(value);
    if (coords) {
      setForm((prev: any) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
    }
  }, []);

  const handleUpload = async (
    file: File,
    compressionOptions?: { maxWidth?: number; maxHeight?: number; quality?: number; maxSizeBytes?: number; outputType?: 'image/webp' | 'image/jpeg' | 'image/png' }
  ): Promise<string | null> => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF');
      return null;
    }
    try {
      const compressedFile = await compressImage(file, compressionOptions);
      const formData = new FormData();
      formData.append('file', compressedFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) return data.url;
      showMessage('error', data.error || 'فشل في رفع الصورة');
      return null;
    } catch {
      showMessage('error', 'فشل في رفع الصورة');
      return null;
    }
  };

  const handleLogoUpload = async (file: File) => {
    const url = await handleUpload(file, { maxWidth: 400, maxHeight: 400, quality: 0.88, maxSizeBytes: 4 * 1024 * 1024 });
    if (url) setForm((prev: any) => ({ ...prev, logo: url }));
  };

  const handleCoverUpload = async (file: File) => {
    const url = await handleUpload(file, { maxWidth: 1600, maxHeight: 900, quality: 0.88, maxSizeBytes: 4 * 1024 * 1024 });
    if (url) setForm((prev: any) => ({ ...prev, cover: url }));
  };

  const handleGalleryUpload = async (file: File) => {
    const images: GalleryImage[] = form.images || [];
    if (images.length >= 10) {
      showMessage('error', 'يمكنك رفع 10 صور كحد أقصى');
      return;
    }
    const url = await handleUpload(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.88, maxSizeBytes: 4 * 1024 * 1024 });
    if (url) setForm((prev: any) => ({ ...prev, images: [...images, { url, type: 'gallery', caption: '' }] }));
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      images: (prev.images || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleDocumentUpload = async (file: File) => {
    const url = await handleUpload(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.88, maxSizeBytes: 4 * 1024 * 1024 });
    if (url) {
      setForm((prev: any) => ({
        ...prev,
        documents: [...(prev.documents || []), { type: 'other', url, status: 'PENDING' }],
      }));
    }
  };

  const updateDocumentType = (index: number, type: string) => {
    setForm((prev: any) => ({
      ...prev,
      documents: (prev.documents || []).map((d: BusinessDocument, i: number) => (i === index ? { ...d, type } : d)),
    }));
  };

  const removeDocument = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      documents: (prev.documents || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const toggleDay = (index: number) => {
    setForm((prev: any) => {
      const hours = [...(prev.workingHours || [])];
      if (!hours[index]) hours[index] = { day: DAYS_AR[index], open: '', close: '' };
      const current = hours[index];
      const isClosed = !current.open && !current.close;
      hours[index] = isClosed ? { day: DAYS_AR[index], open: '09:00', close: '21:00' } : { day: DAYS_AR[index], open: '', close: '' };
      return { ...prev, workingHours: hours };
    });
  };

  const updateWorkingHour = (index: number, field: 'open' | 'close', value: string) => {
    setForm((prev: any) => {
      const hours = [...(prev.workingHours || [])];
      if (!hours[index]) hours[index] = { day: DAYS_AR[index], open: '', close: '' };
      hours[index] = { ...hours[index], [field]: value };
      return { ...prev, workingHours: hours };
    });
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button onClick={() => router.push(`/business/${id}`)} className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-3">
              <ChevronLeft className="w-4 h-4" />
              العودة للموقع
            </button>
            <h1 className="text-2xl font-bold text-foreground">إعدادات النشاط التجاري</h1>
            <p className="text-muted text-sm">إدارة جميع معلومات موقعك بشكل احترافي</p>
          </motion.div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 rounded-lg p-4 text-sm font-medium flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
                }`}
              >
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 shrink-0">
              <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-border">
                      {form.logo ? <img src={form.logo} alt={form.name || 'شعار النشاط'} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-muted" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{form.name || 'النشاط التجاري'}</p>
                      <p className="text-xs text-muted truncate">{form.slug || ''}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  {TABS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              {activeTab === 'basic' && (
                <SectionCard title="المعلومات الأساسية" description="اسم النشاط، الوصف، التصنيف، ونوع العمل">
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="business-name" className="block text-sm font-medium text-foreground mb-1">اسم العمل <span className="text-danger">*</span></label>
                      <input
                        id="business-name"
                        value={form.name || ''}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="business-description" className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                      <textarea
                        id="business-description"
                        value={form.description || ''}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">نوع العمل</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'INDIVIDUAL', label: 'فردي', icon: User },
                          { value: 'COMPANY', label: 'شركة', icon: Building2 },
                        ].map((type) => {
                          const Icon = type.icon;
                          const selected = form.businessType === type.value;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setForm({ ...form, businessType: type.value })}
                              className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                                selected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 hover:bg-slate-50'
                              }`}
                            >
                              <Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-muted'}`} />
                              <span className="text-sm font-medium">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="category-select" className="block text-sm font-medium text-foreground mb-1">التصنيف الرئيسي</label>
                      <select
                        id="category-select"
                        value={form.categoryId || ''}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryIds: [], customSubcategories: [] })}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                      >
                        <option value="">اختر تصنيفاً</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <SubcategoryMultiSelect
                        subcategories={selectedCategory?.subcategories || []}
                        selectedIds={form.subcategoryIds || []}
                        customSubcategories={form.customSubcategories || []}
                        onChange={(subcategoryIds, customSubcategories) =>
                          setForm({ ...form, subcategoryIds, customSubcategories })
                        }
                        disabled={!form.categoryId}
                        emptyMessage={!form.categoryId ? 'اختر التصنيف الرئيسي أولاً' : 'لا توجد تصنيفات فرعية'}
                      />
                    </div>
                    <SaveButton onClick={() => handleSave()} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeTab === 'branding' && (
                <SectionCard title="الهوية البصرية" description="الشعار والغلاف الذي يظهر في صفحة موقعك">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="h-40 bg-slate-100 rounded-lg overflow-hidden border border-border">
                        {form.cover && <img src={form.cover} alt={form.name || 'صورة الغلاف'} className="w-full h-full object-cover" />}
                      </div>
                      <label className="absolute top-3 left-3 px-3 py-2 rounded-md bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors cursor-pointer flex items-center gap-2">
                        <ImagePlus className="w-4 h-4" />
                        تغيير الغلاف
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])} />
                      </label>
                      <div className="absolute -bottom-8 right-6">
                        <div className="w-20 h-20 rounded-2xl bg-surface shadow-lg border-4 border-surface overflow-hidden flex items-center justify-center">
                          {form.logo ? <img src={form.logo} alt={form.name || 'شعار النشاط'} className="w-full h-full object-cover" /> : <Store className="w-8 h-8 text-muted" />}
                        </div>
                        <label className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary-dark shadow-sm">
                          <ImagePlus className="w-3.5 h-3.5" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                    <div className="pt-8">
                      <p className="text-xs text-muted mb-4">يفضل شعار بخلفية بيضاء وغلاف بأبعاد 1200×400 بكسل</p>
                      <SaveButton onClick={() => handleSave()} loading={saving} />
                    </div>
                  </div>
                </SectionCard>
              )}

              {activeTab === 'location' && (
                <SectionCard title="الموقع والتواصل" description="عنوانك على الخريطة ومعلومات التواصل مع العملاء">
                  <div className="space-y-5">
                    <CountrySelect
                      countries={countries}
                      value={countryId}
                      onChange={(cid) => {
                        setCountryId(cid);
                        setForm((prev: any) => ({ ...prev, countryId: cid, city: '' }));
                      }}
                      label="الدولة"
                      autoDetect={false}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city-select" className="block text-sm font-medium text-foreground mb-1">المدينة</label>
                        <select
                          id="city-select"
                          value={form.city || ''}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          disabled={!countryId}
                          className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition disabled:opacity-50"
                        >
                          <option value="">اختر المدينة</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="business-phone" className="block text-sm font-medium text-foreground mb-1">الهاتف</label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="business-phone"
                            value={form.phone || ''}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-left dir-ltr"
                            dir="ltr"
                            placeholder="5xxxxxxxx"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="business-address" className="block text-sm font-medium text-foreground mb-1">العنوان التفصيلي</label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          id="business-address"
                          value={form.address || ''}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                          placeholder="الحي، الشارع، رقم المبنى"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="business-map-link" className="block text-sm font-medium text-foreground mb-1">رابط موقع Google Maps</label>
                      <div className="relative">
                        <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          id="business-map-link"
                          value={mapLink}
                          onChange={(e) => handleMapLinkChange(e.target.value)}
                          className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-left dir-ltr"
                          dir="ltr"
                          placeholder="https://maps.app.goo.gl/... أو https://www.google.com/maps/..."
                        />
                      </div>
                      <p className="text-xs text-muted mt-1.5">الصق رابط الموقع مباشرة وسيتم استخراج خط العرض والطول تلقائياً.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="business-lat" className="block text-xs font-medium text-muted mb-1">خط العرض</label>
                        <input id="business-lat" value={form.latitude ?? ''} readOnly className="w-full px-3 py-2 rounded-md border border-border bg-slate-50 text-sm text-muted" />
                      </div>
                      <div>
                        <label htmlFor="business-lng" className="block text-xs font-medium text-muted mb-1">خط الطول</label>
                        <input id="business-lng" value={form.longitude ?? ''} readOnly className="w-full px-3 py-2 rounded-md border border-border bg-slate-50 text-sm text-muted" />
                      </div>
                    </div>
                    <MapPicker lat={form.latitude} lng={form.longitude} onChange={handleMapChange} height="250px" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="business-email" className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني</label>
                        <div className="relative">
                          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="business-email"
                            type="email"
                            value={form.email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-left dir-ltr"
                            dir="ltr"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="business-website" className="block text-sm font-medium text-foreground mb-1">الموقع الإلكتروني</label>
                        <div className="relative">
                          <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                          <input
                            id="business-website"
                            value={form.website || ''}
                            onChange={(e) => setForm({ ...form, website: e.target.value })}
                            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-left dir-ltr"
                            dir="ltr"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                    <SaveButton onClick={() => handleSave()} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeTab === 'hours' && (
                <SectionCard title="ساعات العمل" description="حدد أيام وساعات عملك لكل يوم">
                  <div className="space-y-3">
                    {DAYS_AR.map((day, i) => {
                      const wh = (form.workingHours || [])[i] || { day, open: '', close: '' };
                      const isClosed = !wh.open && !wh.close;
                      return (
                        <div key={day} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-border">
                          <button
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`w-20 text-sm font-medium transition-colors ${isClosed ? 'text-muted' : 'text-foreground'}`}
                          >
                            {day}
                          </button>
                          <input
                            type="time"
                            value={wh.open}
                            onChange={(e) => updateWorkingHour(i, 'open', e.target.value)}
                            disabled={isClosed}
                            className="px-3 py-1.5 rounded-md border border-border bg-surface text-foreground text-sm disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <span className="text-muted text-sm">إلى</span>
                          <input
                            type="time"
                            value={wh.close}
                            onChange={(e) => updateWorkingHour(i, 'close', e.target.value)}
                            disabled={isClosed}
                            className="px-3 py-1.5 rounded-md border border-border bg-surface text-foreground text-sm disabled:opacity-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`mr-auto text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                              isClosed ? 'bg-red-100 text-danger' : 'bg-success/10 text-success'
                            }`}
                          >
                            {isClosed ? 'مغلق' : 'مفتوح'}
                          </button>
                        </div>
                      );
                    })}
                    <div className="pt-3">
                      <SaveButton onClick={() => handleSave()} loading={saving} />
                    </div>
                  </div>
                </SectionCard>
              )}

              {activeTab === 'gallery' && (
                <SectionCard title="معرض الصور" description="أضف صوراً لعملك (حتى 10 صور)">
                  <div className="space-y-5">
                    {(form.images || []).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(form.images || []).map((img: GalleryImage, index: number) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                            <img src={img.url} alt={'صورة ' + (index + 1)} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-2 left-2 w-7 h-7 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              aria-label="إزالة الصورة"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className={`relative w-full px-4 py-8 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                      (form.images || []).length >= 10 ? 'border-border bg-slate-50 cursor-not-allowed' : 'border-border hover:border-primary hover:bg-primary/5'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={(form.images || []).length >= 10}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        onChange={(e) => Array.from(e.target.files || []).forEach((file) => handleGalleryUpload(file))}
                      />
                      <Images className="w-8 h-8 text-muted" />
                      <span className="text-sm text-muted">
                        <span className="text-primary font-medium">اضغط لاختيار صور</span> أو اسحبها هنا
                      </span>
                      <span className="text-xs text-muted">{(form.images || []).length}/10 صور</span>
                    </label>
                    <SaveButton onClick={() => handleSave()} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeTab === 'documents' && (
                <SectionCard title="الوثائق والظهور" description="الوثائق الرسمية وخيارات الظهور في البوابة">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-slate-50/50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-muted">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">الظهور في البوابة العامة</h3>
                          <p className="text-xs text-muted mt-0.5">إظهار موقعك في نتائج البحث والأقسام العامة</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm((prev: any) => ({ ...prev, isPublicOnGateway: !prev.isPublicOnGateway }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${form.isPublicOnGateway ? 'bg-primary' : 'bg-slate-300'}`}
                        aria-label="تبديل الظهور في البوابة العامة"
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPublicOnGateway ? 'left-0.5 translate-x-6' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">الوثائق الرسمية</label>
                      {(form.documents || []).length > 0 && (
                        <div className="space-y-2 mb-3">
                          {(form.documents || []).map((doc: BusinessDocument, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-muted" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <select
                                  value={doc.type}
                                  onChange={(e) => updateDocumentType(index, e.target.value)}
                                  className="w-full text-sm border-none bg-transparent focus:ring-0 p-0 font-medium text-foreground"
                                >
                                  {DOCUMENT_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                                <p className="text-xs text-muted truncate">{doc.url}</p>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${doc.status === 'APPROVED' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-700'}`}>
                                {doc.status === 'APPROVED' ? 'معتمد' : 'قيد المراجعة'}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="p-2 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors"
                                aria-label="إزالة الوثيقة"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label className="relative w-full px-4 py-4 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center flex items-center justify-center gap-2">
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && handleDocumentUpload(e.target.files[0])} />
                        <FileText className="w-5 h-5 text-muted" />
                        <span className="text-sm text-muted"><span className="text-primary font-medium">إرفاق وثيقة جديدة</span></span>
                      </label>
                    </div>
                    <SaveButton onClick={() => handleSave()} loading={saving} />
                  </div>
                </SectionCard>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
    </button>
  );
}
