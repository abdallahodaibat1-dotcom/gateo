'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PlacesAutocomplete from '@/components/maps/PlacesAutocomplete';
import { compressImage } from '@/lib/media-compression';
import MapPicker from '@/components/maps/MapPicker';
import GeolocationButton from '@/components/maps/GeolocationButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Heart, Lock, Shield, Bell, Trash2, Loader2,
  Camera, Globe, Mail, Phone, Calendar, Check, X, AlertTriangle,
  Save, ChevronLeft, AtSign, Link as LinkIcon, Eye, EyeOff, DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface Profile {
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  interests?: string | null;
  website?: string | null;
  birthDate?: string | null;
  gender?: 'MALE' | 'FEMALE' | null;
  lat?: number | null;
  lng?: number | null;
  locationSharing?: boolean;
  socialLinks?: Record<string, string> | null;
}

interface CurrencyOption {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
}

interface UserData {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  isPrivate: boolean;
  notificationSettings: Record<string, boolean> | null;
  preferredCurrency: string;
  profile: Profile | null;
}

type Section =
  | 'general'
  | 'contact'
  | 'interests'
  | 'privacy'
  | 'security'
  | 'notifications'
  | 'currency'
  | 'account';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'general', label: 'المعلومات العامة', icon: User },
  { id: 'contact', label: 'الاتصال والموقع', icon: MapPin },
  { id: 'interests', label: 'الاهتمامات', icon: Heart },
  { id: 'privacy', label: 'الخصوصية', icon: Lock },
  { id: 'security', label: 'الأمان', icon: Shield },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'currency', label: 'العملة', icon: DollarSign },
  { id: 'account', label: 'الحساب', icon: Trash2 },
];

const interestOptions = [
  'أزياء', 'تجميل', 'مكياج', 'عطور', 'مجوهرات', 'ساعات',
  'سفر', 'فنادق', 'مطاعم', 'مقاهي', 'طبخ', 'حلويات',
  'رياضة', 'يوغا', 'تغذية', 'صحة', 'لياقة',
  'قراءة', 'تعليم', 'تطوير ذات', 'أعمال', 'تسويق',
  'تصوير', 'فن', 'موسيقى', 'سينما', 'مسرح',
  'تكنولوجيا', 'ألعاب', 'سيارات', 'ديكور', 'حدائق',
];

const defaultNotifications = {
  emailNotifications: true,
  pushNotifications: true,
  newFollower: true,
  likes: true,
  comments: true,
  mentions: true,
  messages: true,
  groupInvitations: true,
  bookings: true,
  promotions: false,
};

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<Partial<UserData & Profile>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [interestInput, setInterestInput] = useState('');
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') fetchUser();
  }, [status]);

  useEffect(() => {
    fetch('/api/finance/currencies')
      .then((res) => res.json())
      .then((data) => {
        if (data.currencies) setCurrencies(data.currencies);
      })
      .catch(() => {});
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/account/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setForm({
          ...data,
          ...data.profile,
          birthDate: data.profile?.birthDate
            ? new Date(data.profile.birthDate).toISOString().split('T')[0]
            : '',
          notificationSettings: {
            ...defaultNotifications,
            ...(data.notificationSettings || {}),
          },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async (sectionData?: Partial<UserData & Profile>) => {
    setSaving(true);
    try {
      const payload: any = { ...(sectionData || {}) };

      // Build profile fields
      const profileFields = [
        'bio', 'city', 'country', 'interests', 'website', 'birthDate', 'gender',
        'lat', 'lng', 'locationSharing', 'socialLinks',
      ];
      const userFields = ['name', 'username', 'avatar', 'phone', 'isPrivate', 'notificationSettings'];

      const updatePayload: any = {};
      for (const key of [...profileFields, ...userFields]) {
        if (key in payload) {
          updatePayload[key] = payload[key as keyof typeof payload];
        }
      }

      // Handle empty birthDate
      if (updatePayload.birthDate === '') updatePayload.birthDate = null;

      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated.data);
        setForm((prev) => ({ ...prev, ...updatePayload }));
        await updateSession({
          avatar: updatePayload.avatar ?? session?.user?.image ?? null,
          name: updatePayload.name ?? session?.user?.name ?? null,
          preferredCurrency: updatePayload.preferredCurrency ?? session?.user?.preferredCurrency ?? 'USD',
        });
        showMessage('success', 'تم حفظ التغييرات بنجاح');
      } else {
        const err = await res.json();
        showMessage('error', err.error?.[0]?.message || err.error || 'فشل في الحفظ');
      }
    } catch (e) {
      showMessage('error', 'حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'كلمتا المرور الجديدتان غير متطابقتين');
      return;
    }

    try {
      const res = await fetch('/api/account/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changePassword',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMessage('success', data.data?.message || 'تم تغيير كلمة المرور');
      } else {
        showMessage('error', data.error || 'فشل في تغيير كلمة المرور');
      }
    } catch {
      showMessage('error', 'حدث خطأ في الاتصال');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    const uploadFile = file.type.startsWith('image/')
      ? await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.88, maxSizeBytes: 1 * 1024 * 1024 })
      : file;
    formData.append('file', uploadFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        await handleSave({ avatar: data.url });
      }
    } catch {
      showMessage('error', 'فشل في رفع الصورة');
    }
  };

  const toggleInterest = (interest: string) => {
    const current = (form.interests || '').split(',').map((s) => s.trim()).filter(Boolean);
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setForm((prev) => ({ ...prev, interests: updated.join(',') }));
  };

  const addCustomInterest = () => {
    if (!interestInput.trim()) return;
    const current = (form.interests || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (!current.includes(interestInput.trim())) {
      setForm((prev) => ({ ...prev, interests: [...current, interestInput.trim()].join(',') }));
    }
    setInterestInput('');
  };

  const toggleNotification = (key: string) => {
    setForm((prev) => {
      const settings = prev.notificationSettings || defaultNotifications;
      return {
        ...prev,
        notificationSettings: {
          ...settings,
          [key]: !settings[key as keyof typeof settings],
        },
      };
    });
  };

  const handlePlaceSelect = (place: { name: string; address: string; lat: number; lng: number; city?: string; country?: string }) => {
    setForm((prev) => ({
      ...prev,
      address: place.address,
      city: place.city || prev.city,
      country: place.country || prev.country,
      lat: place.lat,
      lng: place.lng,
    }));
  };

  if (status === 'loading' || loading) {
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
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-3">
              <ChevronLeft className="w-4 h-4" />
              العودة للخلاصة
            </Link>
            <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
            <p className="text-muted text-sm">إدارة ملفك الشخصي والخصوصية والأمان</p>
          </motion.div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 rounded-lg p-4 text-sm font-medium flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-72 shrink-0"
            >
              <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user?.avatar || '/logo/favicon.svg'}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark"
                        aria-label="تغيير الصورة الشخصية"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{user?.name || 'مستخدم'}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          activeSection === item.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-slate-50'
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
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              {activeSection === 'general' && (
                <SectionCard title="المعلومات العامة" description="تحكم في اسمك، سيرتك الذاتية، ومعلوماتك الأساسية">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="الاسم الكامل"
                        value={form.name || ''}
                        onChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
                        icon={User}
                      />
                      <Input
                        label="اسم المستخدم"
                        value={form.username || ''}
                        onChange={(v) => setForm((prev) => ({ ...prev, username: v }))}
                        icon={AtSign}
                        hint="حروف وأرقام ونقاط فقط"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1">السيرة الذاتية</label>
                      <textarea
                        id="bio"
                        value={form.bio || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
                        placeholder="اكتب نبذة قصيرة عنك..."
                      />
                      <p className="text-xs text-muted mt-1 text-left">{(form.bio || '').length}/500</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="الجنس"
                        value={form.gender || ''}
                        onChange={(v) => setForm((prev) => ({ ...prev, gender: v as any }))}
                        options={[
                          { value: '', label: 'غير محدد' },
                          { value: 'MALE', label: 'ذكر' },
                          { value: 'FEMALE', label: 'أنثى' },
                        ]}
                      />
                      <Input
                        label="تاريخ الميلاد"
                        type="date"
                        value={form.birthDate || ''}
                        onChange={(v) => setForm((prev) => ({ ...prev, birthDate: v }))}
                        icon={Calendar}
                      />
                    </div>

                    <SaveButton onClick={() => handleSave({ name: form.name, username: form.username, bio: form.bio, gender: form.gender, birthDate: form.birthDate })} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeSection === 'contact' && (
                <SectionCard title="الاتصال والموقع" description="معلومات التواصل وموقعك الجغرافي">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="البريد الإلكتروني"
                        type="email"
                        value={form.email || ''}
                        disabled
                        icon={Mail}
                      />
                      <Input
                        label="رقم الهاتف"
                        value={form.phone || ''}
                        onChange={(v) => setForm((prev) => ({ ...prev, phone: v }))}
                        icon={Phone}
                      />
                    </div>

                    <Input
                      label="الموقع الإلكتروني"
                      value={form.website || ''}
                      onChange={(v) => setForm((prev) => ({ ...prev, website: v }))}
                      icon={Globe}
                    />

                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 space-y-4">
                      <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        الموقع الجغرافي
                      </h3>
                      <PlacesAutocomplete
                        value={form.city || ''}
                        onSelect={handlePlaceSelect}
                        label="المدينة / العنوان"
                        placeholder="ابحث عن مدينة..."
                      />
                      <div className="flex items-center gap-3">
                        <GeolocationButton
                          onLocate={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
                        />
                        <label htmlFor="location-sharing" className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input
                            id="location-sharing"
                            type="checkbox"
                            checked={!!form.locationSharing}
                            onChange={(e) => setForm((prev) => ({ ...prev, locationSharing: e.target.checked }))}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          مشاركة موقعي مع الآخرين
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="lat" className="block text-xs font-medium text-muted mb-1">خط العرض</label>
                          <input id="lat" value={form.lat ?? ''} readOnly className="w-full px-3 py-2 rounded-md border border-border bg-slate-50 text-sm text-muted" />
                        </div>
                        <div>
                          <label htmlFor="lng" className="block text-xs font-medium text-muted mb-1">خط الطول</label>
                          <input id="lng" value={form.lng ?? ''} readOnly className="w-full px-3 py-2 rounded-md border border-border bg-slate-50 text-sm text-muted" />
                        </div>
                      </div>
                      <MapPicker
                        lat={form.lat ?? undefined}
                        lng={form.lng ?? undefined}
                        onChange={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
                        height="220px"
                      />
                    </div>

                    <SaveButton
                      onClick={() => handleSave({
                        phone: form.phone,
                        website: form.website,
                        city: form.city,
                        country: form.country,
                        lat: form.lat,
                        lng: form.lng,
                        locationSharing: form.locationSharing,
                      })}
                      loading={saving}
                    />
                  </div>
                </SectionCard>
              )}

              {activeSection === 'interests' && (
                <SectionCard title="الاهتمامات" description="اختر اهتماماتك للحصول على محتوى واقتراحات مناسبة">
                  <div className="space-y-5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                        placeholder="اهتمام جديد..."
                        className="flex-1 px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addCustomInterest}
                        className="px-4 py-2.5 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        إضافة
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((interest) => {
                        const selected = (form.interests || '').split(',').map((s) => s.trim()).includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-slate-100 text-foreground hover:bg-slate-200'
                            }`}
                          >
                            {selected && <Check className="w-3 h-3 inline-block ml-1" />}
                            {interest}
                          </button>
                        );
                      })}
                    </div>

                    <SaveButton onClick={() => handleSave({ interests: form.interests })} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeSection === 'privacy' && (
                <SectionCard title="الخصوصية" description="تحكم في من يمكنه رؤية ملفك الشخصي ونشاطك">
                  <div className="space-y-4">
                    <ToggleCard
                      title="حساب خاص"
                      description="عند التفعيل، فقط المتابعون المعتمدون يمكنهم رؤية منشوراتك"
                      checked={!!form.isPrivate}
                      onChange={(checked) => setForm((prev) => ({ ...prev, isPrivate: checked }))}
                      icon={form.isPrivate ? EyeOff : Eye}
                    />
                    <ToggleCard
                      title="مشاركة الموقع"
                      description="السماح للمنصة باستخدام موقعك لاقتراح أصدقاء وأعمال قريبة"
                      checked={!!form.locationSharing}
                      onChange={(checked) => setForm((prev) => ({ ...prev, locationSharing: checked }))}
                      icon={MapPin}
                    />
                    <SaveButton onClick={() => handleSave({ isPrivate: form.isPrivate, locationSharing: form.locationSharing })} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeSection === 'security' && (
                <SectionCard title="الأمان" description="حافظ على أمان حسابك">
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <PasswordInput
                      label="كلمة المرور الحالية"
                      value={passwordForm.currentPassword}
                      onChange={(v) => setPasswordForm((prev) => ({ ...prev, currentPassword: v }))}
                      show={showPasswords.current}
                      onToggle={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    />
                    <PasswordInput
                      label="كلمة المرور الجديدة"
                      value={passwordForm.newPassword}
                      onChange={(v) => setPasswordForm((prev) => ({ ...prev, newPassword: v }))}
                      show={showPasswords.new}
                      onToggle={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    />
                    <PasswordInput
                      label="تأكيد كلمة المرور الجديدة"
                      value={passwordForm.confirmPassword}
                      onChange={(v) => setPasswordForm((prev) => ({ ...prev, confirmPassword: v }))}
                      show={showPasswords.confirm}
                      onToggle={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      تغيير كلمة المرور
                    </button>
                  </form>
                </SectionCard>
              )}

              {activeSection === 'notifications' && (
                <SectionCard title="الإشعارات" description="اختر أنواع الإشعارات التي تريد تلقيها">
                  <div className="space-y-3">
                    {Object.entries(defaultNotifications).map(([key, defaultValue]) => (
                      <ToggleCard
                        key={key}
                        title={notificationLabels[key]}
                        description={notificationDescriptions[key]}
                        checked={(form.notificationSettings || defaultNotifications)[key as keyof typeof defaultNotifications] ?? defaultValue}
                        onChange={() => toggleNotification(key)}
                        icon={Bell}
                      />
                    ))}
                    <SaveButton onClick={() => handleSave({ notificationSettings: form.notificationSettings })} loading={saving} />
                  </div>
                </SectionCard>
              )}

              {activeSection === 'currency' && (
                <SectionCard title="العملة" description="اختر العملة التي تفضل عرض الأسعار بها">
                  <div className="space-y-5">
                    <Select
                      label="العملة المفضلة"
                      value={form.preferredCurrency || 'USD'}
                      onChange={(v) => setForm((prev) => ({ ...prev, preferredCurrency: v }))}
                      options={currencies.length > 0
                        ? currencies.map((c) => ({
                            value: c.code,
                            label: `${c.nameAr} (${c.code})`,
                          }))
                        : [{ value: 'USD', label: 'دولار أمريكي (USD)' }]
                      }
                    />
                    <p className="text-xs text-muted">
                      الأسعار تُعرض بالدولار الأمريكي (USD) بشكل افتراضي. عند اختيار عملة أخرى،
                      سيتم تحويل السعر تلقائياً باستخدام آخر سعر صرف متاح.
                    </p>
                    <SaveButton
                      onClick={() => handleSave({ preferredCurrency: form.preferredCurrency })}
                      loading={saving}
                    />
                  </div>
                </SectionCard>
              )}

              {activeSection === 'account' && (
                <SectionCard title="إدارة الحساب" description="خيارات متقدمة لحسابك">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                      <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        تعطيل الحساب مؤقتاً
                      </h3>
                      <p className="text-sm text-amber-700 mb-3">
                        يمكنك تعطيل حسابك مؤقتاً. لن يكون ملفك الشخصي مرئياً للآخرين.
                      </p>
                      <button className="px-4 py-2 rounded-md bg-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-300 transition-colors">
                        تعطيل الحساب
                      </button>
                    </div>

                    <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                      <h3 className="text-red-800 font-bold flex items-center gap-2 mb-1">
                        <Trash2 className="w-4 h-4" />
                        حذف الحساب نهائياً
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        سيؤدي هذا إلى حذف جميع بياناتك نهائياً ولا يمكن التراجع عنه.
                      </p>
                      <button className="px-4 py-2 rounded-md bg-red-200 text-red-800 text-sm font-medium hover:bg-red-300 transition-colors">
                        حذف الحساب
                      </button>
                    </div>
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

// ─── Helper Components ─────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
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

function Input({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  icon?: React.ElementType;
  hint?: string;
  disabled?: boolean;
}) {
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full ${Icon ? 'pr-10' : 'pr-4'} pl-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ${
            disabled ? 'bg-slate-50 text-muted' : ''
          }`}
        />
      </div>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  const inputId = `password-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pr-4 pl-12 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-surface border border-border flex items-center justify-center text-muted">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-0.5 translate-x-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
    </button>
  );
}

const notificationLabels: Record<string, string> = {
  emailNotifications: 'إشعارات البريد الإلكتروني',
  pushNotifications: 'إشعارات المتصفح',
  newFollower: 'متابع جديد',
  likes: 'إعجابات على منشوراتي',
  comments: 'تعليقات على منشوراتي',
  mentions: 'عندما يذكرني أحدهم',
  messages: 'رسائل جديدة',
  groupInvitations: 'دعوات المجموعات',
  bookings: 'تذكيرات الحجوزات',
  promotions: 'العروض والتحديثات',
};

const notificationDescriptions: Record<string, string> = {
  emailNotifications: 'تلقي ملخصات وتحديثات عبر البريد الإلكتروني',
  pushNotifications: 'إشعارات فورية في المتصفح',
  newFollower: 'إعلامي عندما يتابعني شخص جديد',
  likes: 'إعلامي عندما يعجب أحدهم بمنشوري',
  comments: 'إعلامي عندما يعلق أحدهم على منشوري',
  mentions: 'إعلامي عندما يذكرني أحدهم بـ @',
  messages: 'إعلامي عندما أتلقى رسالة جديدة',
  groupInvitations: 'إعلامي بدعوات الانضمام للمجموعات',
  bookings: 'تذكيرات الحجوزات والمواعيد',
  promotions: 'عروض خاصة وأخبار المنصة',
};
