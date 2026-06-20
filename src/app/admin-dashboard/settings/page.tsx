'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  UserPlus,
  Wrench,
  Megaphone,
  Info,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  showAds: boolean;
  contactEmail: string | null;
  supportPhone: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    siteName: 'Gateo',
    siteDescription: '',
    maintenanceMode: false,
    allowRegistration: true,
    showAds: false,
    contactEmail: '',
    supportPhone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      showMessage('error', 'فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showMessage('success', 'تم حفظ الإعدادات بنجاح');
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'فشل في الحفظ');
      }
    } catch (e) {
      showMessage('error', 'حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof PlatformSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات المنصة</h1>
        <p className="text-muted text-sm mt-1">التحكم بالإعدادات العامة لمنصة Gateo</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`rounded-lg p-4 text-sm font-medium flex items-center gap-2 ${
            message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* General Info */}
      <section className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">معلومات المنصة</h2>
            <p className="text-xs text-muted">الاسم والوصف الظاهر للمستخدمين</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-foreground mb-1">اسم المنصة</label>
            <input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => update('siteName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-foreground mb-1">وصف المنصة</label>
            <textarea
              id="siteDescription"
              value={settings.siteDescription || ''}
              onChange={(e) => update('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">بيانات التواصل</h2>
            <p className="text-xs text-muted">البريد والهاتف الظاهران للمستخدمين</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground mb-1">البريد الإلكتروني للتواصل</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="contactEmail"
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => update('contactEmail', e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label htmlFor="supportPhone" className="block text-sm font-medium text-foreground mb-1">هاتف الدعم</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="supportPhone"
                value={settings.supportPhone || ''}
                onChange={(e) => update('supportPhone', e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-left dir-ltr"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Platform Switches */}
      <section className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">خيارات التشغيل</h2>
            <p className="text-xs text-muted">تفعيل/تعطيل ميزات أساسية في المنصة</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <SwitchRow
            icon={UserPlus}
            title="التسجيل متاح"
            description="السماح للمستخدمين الجدد بإنشاء حسابات"
            checked={settings.allowRegistration}
            onChange={(v) => update('allowRegistration', v)}
          />
          <div className="border-t border-border" />
          <SwitchRow
            icon={Wrench}
            title="وضع الصيانة"
            description="إيقاف المنصة مؤقتاً للصيانة (للمشرفين فقط)"
            checked={settings.maintenanceMode}
            onChange={(v) => update('maintenanceMode', v)}
          />
          <div className="border-t border-border" />
          <SwitchRow
            icon={Megaphone}
            title="عرض الإعلانات"
            description="إظهار/إخفاء الإعلانات في جميع أنحاء المنصة"
            checked={settings.showAds}
            onChange={(v) => update('showAds', v)}
          />
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 text-sm text-blue-700">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>بعض الإعدادات مثل الإعلانات تتطلب إعادة تحميل الصفحات لتطبيق التغييرات. تغيير وضع الصيانة سيؤثر على وصول المستخدمين العاديين.</p>
      </div>
    </div>
  );
}

function SwitchRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-muted">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'left-0.5 translate-x-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
