'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CountrySelect from '@/components/CountrySelect';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Loader2, ArrowRight, Camera, User, FileText, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { compressImage } from '@/lib/media-compression';

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

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  createdAt: string;
  profile: {
    bio: string | null;
    city: string | null;
    country: string | null;
    countryId: string | null;
    interests: string | null;
    website: string | null;
    birthDate: string | null;
    gender: 'MALE' | 'FEMALE' | null;
  } | null;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

export default function EditProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: '',
    avatar: '',
    bio: '',
    city: '',
    country: '',
    countryId: '',
    interests: '',
    website: '',
    birthDate: '',
    gender: '' as 'MALE' | 'FEMALE' | '',
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const initialCountryLoadedRef = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
      fetchCountries();
    }
  }, [status]);

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/countries');
      const data = await res.json();
      if (data?.countries) setCountries(data.countries);
    } catch {
      setCountries([]);
    }
  };

  const fetchCities = async (countryId: string) => {
    if (!countryId) {
      setCities([]);
      return;
    }
    setCitiesLoading(true);
    try {
      const res = await fetch(`/api/countries/${countryId}/cities`);
      const data = await res.json();
      if (data?.cities) setCities(data.cities);
      else setCities([]);
    } catch {
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/account/me');
      if (res.ok) {
        const data: ProfileData = await res.json();
        const profileCountryId = data.profile?.countryId || '';
        const profileCity = data.profile?.city || '';
        setForm({
          name: data.name || '',
          avatar: data.avatar || '',
          bio: data.profile?.bio || '',
          city: profileCity,
          country: data.profile?.country || '',
          countryId: profileCountryId,
          interests: data.profile?.interests || '',
          website: data.profile?.website || '',
          birthDate: data.profile?.birthDate ? data.profile.birthDate.split('T')[0] : '',
          gender: data.profile?.gender || '',
        });
        if (profileCountryId) {
          initialCountryLoadedRef.current = true;
          fetchCities(profileCountryId).then(() => {
            // If the saved city name is not in the loaded list, keep it as a free-text fallback.
            if (profileCity && !cities.some((c) => c.name === profileCity)) {
              setCities((prev) => [...prev, { id: profileCity, name: profileCity }]);
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load cities when the selected country changes (after initial load).
  useEffect(() => {
    if (!form.countryId) {
      setCities([]);
      return;
    }
    if (!initialCountryLoadedRef.current) {
      fetchCities(form.countryId);
    }
    initialCountryLoadedRef.current = false;
  }, [form.countryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleCountryChange = (countryId: string) => {
    const selected = countries.find((c) => c.id === countryId);
    setForm((prev) => ({
      ...prev,
      countryId,
      country: selected?.name || '',
      city: '',
    }));
    setMessage(null);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF' });
      return;
    }
    setUploadingAvatar(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.88,
        maxSizeBytes: 4 * 1024 * 1024,
      });
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('variant', 'avatar');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, avatar: data.url }));
        setMessage({ type: 'success', text: 'تم رفع الصورة بنجاح' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل في رفع الصورة' });
      }
    } catch {
      setMessage({ type: 'error', text: 'فشل في رفع الصورة' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const selectedCountry = countries.find((c) => c.id === form.countryId);
    const body: Record<string, any> = {
      name: form.name,
      bio: form.bio || undefined,
      city: form.city || undefined,
      country: selectedCountry?.name || form.country || undefined,
      countryId: form.countryId || undefined,
      interests: form.interests || undefined,
      website: form.website || null,
      birthDate: form.birthDate ? form.birthDate : null,
      gender: form.gender || null,
      avatar: form.avatar || null,
    };

    try {
      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
        await updateSession({
          avatar: form.avatar || null,
          name: form.name || null,
        });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'حدث خطأ أثناء الحفظ' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-10 min-h-screen bg-slate-50">
          <div className="max-w-xl mx-auto px-4">
            <div className="mb-6 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Card>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <Skeleton circle className="w-24 h-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href={`/profile/${session?.user?.id}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-3"
            >
              <ArrowRight className="w-4 h-4" />
              العودة إلى الملف الشخصي
            </Link>
            <h1 className="text-2xl font-bold text-foreground">تعديل الملف الشخصي</h1>
            <p className="text-muted text-sm mt-1">حدّثي معلوماتك الشخصية وصورتك</p>
          </motion.div>

          {/* Form Card */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
          >
            <Card padding="none" className="overflow-hidden">
              {/* Avatar Section */}
              <div className="p-6 border-b border-border">
                <div className="flex flex-col items-center gap-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="relative cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      aria-label="رفع صورة شخصية"
                    />
                    <img
                      src={form.avatar || '/logo/favicon.svg'}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-lg bg-surface group-hover:opacity-70 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                        <Camera className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 bg-surface rounded-full p-1.5 shadow-md border border-border z-20 pointer-events-none">
                      <Camera className="w-4 h-4 text-muted" />
                    </div>
                  </div>
                  <div className="w-full">
                    <label htmlFor="avatar-upload" className="block text-sm font-medium text-foreground mb-1.5">
                      الصورة الشخصية
                    </label>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="relative w-full px-4 py-2.5 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-slate-50/50 transition-all cursor-pointer text-center"
                    >
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="رفع صورة شخصية"
                      />
                      {uploadingAvatar ? (
                        <div className="flex items-center justify-center gap-2 text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">جاري الرفع...</span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted">
                          <span className="text-primary font-medium">اضغط لاختيار صورة</span>
                          <span className="mx-1">أو اسحبها هنا</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">JPEG, PNG, WebP, GIF — يتم ضغط الصورة تلقائياً</p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="p-6 border-b border-border space-y-5">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  المعلومات الأساسية
                </h2>

                <Input
                  id="name"
                  label="الاسم الكامل"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="اسمك الكامل"
                />

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1.5">
                    نبذة عنك
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition resize-none"
                    placeholder="اكتب نبذة قصيرة عنك..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CountrySelect
                    countries={countries}
                    value={form.countryId}
                    onChange={handleCountryChange}
                    label="الدولة"
                    autoDetect={false}
                  />

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1.5">
                      المدينة
                    </label>
                    <div className="relative">
                      <select
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        disabled={!form.countryId || citiesLoading}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition disabled:bg-slate-100 disabled:text-muted text-sm"
                      >
                        <option value="">{citiesLoading ? 'جاري التحميل...' : 'اختر المدينة'}</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-6 border-b border-border space-y-5">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  معلومات إضافية
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="birthDate"
                    label="تاريخ الميلاد"
                    name="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={handleChange}
                  />
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-1.5">
                      الجنس
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                    >
                      <option value="">— اختياري —</option>
                      <option value="FEMALE">أنثى</option>
                      <option value="MALE">ذكر</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-foreground mb-1.5">
                    الموقع الإلكتروني
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition text-left dir-ltr"
                    dir="ltr"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <Input
                  id="interests"
                  label="الاهتمامات"
                  name="interests"
                  type="text"
                  value={form.interests}
                  onChange={handleChange}
                  placeholder="مثال: تجميل، أزياء، سفر"
                />
              </div>

              {/* Alerts */}
              {message && (
                <div className={`mx-6 mt-4 rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                  {message.text}
                </div>
              )}

              {/* Actions */}
              <div className="p-6 flex items-center gap-3">
                <Button
                  type="submit"
                  isLoading={saving}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="flex-1"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </Button>
                <Link
                  href={`/profile/${session?.user?.id}`}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-slate-100 text-foreground font-medium text-sm hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  إلغاء
                </Link>
              </div>
            </Card>
          </motion.form>
        </div>
      </main>
    </>
  );
}
