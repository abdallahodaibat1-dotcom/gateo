'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  Palette,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Type,
  Layout,
  MousePointer,
} from 'lucide-react';
import {
  getThemePresetById,
  WebsiteSection,
  type HomeTemplateId,
} from '@/lib/business-template-generator';
import { DesignLibrarySelector } from '@/components/business-apply/DesignLibrarySelector';
import { getDesignById, resolvePresetId, resolveHomeTemplate } from '@/lib/business-design-library';
import { extractColorsFromImage } from '@/lib/color-extraction';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  slug: string;
  logo?: string | null;
  websiteType?: 'INTRO' | 'STORE' | null;
}

interface Theme {
  designId: string | null;
  presetId: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  heroLayout: string;
  navbarStyle: string;
  homeTemplate: HomeTemplateId;
  sections: WebsiteSection[];
  customCss: string | null;
  isPublished: boolean;
}

const defaultSections: WebsiteSection[] = [
  { id: 'hero', type: 'hero', enabled: true, order: 10 },
  { id: 'about', type: 'about', enabled: true, order: 20 },
  { id: 'experience', type: 'experience', enabled: true, order: 30 },
  { id: 'services', type: 'services', enabled: true, order: 40 },
  { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
  { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
  { id: 'contact', type: 'contact', enabled: true, order: 70 },
  { id: 'cta', type: 'cta', enabled: true, order: 80 },
];

export default function ThemeEditorPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const businessRes = await fetch('/api/businesses/my');
      if (!businessRes.ok) {
        if (businessRes.status === 404) {
          router.push('/business/apply');
          return;
        }
        throw new Error('فشل في جلب بيانات النشاط');
      }
      const businessData = await businessRes.json();
      setBusiness(businessData.business);

      const themeRes = await fetch(`/api/businesses/${businessData.business.id}/theme`);
      if (!themeRes.ok) throw new Error('فشل في جلب المظهر');
      const themeData = await themeRes.json();
      setTheme(themeData.theme);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const handleSave = async () => {
    if (!business || !theme) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...theme,
          sections: theme.sections || defaultSections,
        }),
      });
      if (!res.ok) throw new Error('فشل في حفظ المظهر');
      setSuccess('تم حفظ المظهر بنجاح');
    } catch (e) {
      setError('فشل في حفظ المظهر');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!business) return;
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/theme/generate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('فشل في توليد الموقع');
      const data = await res.json();
      setTheme(data.theme);
      setSuccess('تم توليد المظهر بنجاح');
    } catch (e) {
      setError('فشل في توليد المظهر');
    } finally {
      setGenerating(false);
    }
  };

  const handleDesignSelect = (designId: string) => {
    const design = getDesignById(designId);
    if (!design || !business) return;
    const preset = getThemePresetById(resolvePresetId(design));
    if (!preset) return;

    updateTheme({
      designId,
      presetId: preset.presetId,
      homeTemplate: resolveHomeTemplate(design, business.websiteType || 'INTRO'),
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      surfaceColor: preset.surfaceColor,
      textColor: preset.textColor,
      heroLayout: preset.heroLayout,
      navbarStyle: preset.navbarStyle,
      buttonStyle: preset.buttonStyle,
      borderRadius: preset.borderRadius,
      fontFamily: preset.fontFamily,
    });
  };

  const handleExtractColors = async () => {
    if (!business?.logo || !theme) return;
    try {
      const colors = await extractColorsFromImage(business.logo);
      updateTheme({
        primaryColor: colors.primaryColor,
        secondaryColor: colors.secondaryColor,
        accentColor: colors.accentColor,
        backgroundColor: colors.backgroundColor,
        surfaceColor: colors.surfaceColor,
        textColor: colors.textColor,
      });
      setSuccess('تم استخراج الألوان من الشعار بنجاح');
    } catch (e) {
      setError('فشل في استخراج الألوان من الشعار');
    }
  };

  const toggleSection = (sectionId: string) => {
    if (!theme) return;
    const sections = (theme.sections || defaultSections).map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    updateTheme({ sections });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-lg lg:col-span-2" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!theme) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/business-dashboard/website"
            className="p-2 rounded-md bg-surface border border-border hover:bg-slate-50 transition-colors"
            aria-label="العودة"
          >
            <ArrowRight className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" />
              تخصيص المظهر
            </h1>
            <p className="text-muted text-sm">اختر الألوان والتخطيط والأقسام الظاهرة في موقعك.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-md bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            توليد ذكي
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            حفظ
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-danger/5 border border-danger/10 rounded-lg p-4 flex items-center gap-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/5 border border-success/10 rounded-lg p-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Design Library */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              مكتبة التصاميم
            </h3>
            <DesignLibrarySelector
              selectedDesignId={theme.designId || undefined}
              onSelect={handleDesignSelect}
              websiteType={business?.websiteType || undefined}
            />
          </div>

          {/* Colors */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">الألوان</h3>
              {business?.logo && (
                <button
                  type="button"
                  onClick={handleExtractColors}
                  className="px-3 py-1.5 rounded-md bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  استخراج من الشعار
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'primaryColor', label: 'اللون الأساسي' },
                { key: 'secondaryColor', label: 'اللون الثانوي' },
                { key: 'accentColor', label: 'لون التمييز' },
                { key: 'backgroundColor', label: 'خلفية الصفحة' },
                { key: 'surfaceColor', label: 'خلفية البطاقات' },
                { key: 'textColor', label: 'لون النص' },
              ].map((field) => (
                <div key={field.key}>
                  <label htmlFor={`theme-${field.key}`} className="block text-sm text-muted mb-1">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`theme-${field.key}`}
                      type="color"
                      value={(theme as any)[field.key] || '#000000'}
                      onChange={(e) => updateTheme({ [field.key]: e.target.value } as Partial<Theme>)}
                      className="w-10 h-10 rounded-md border border-border cursor-pointer bg-surface"
                    />
                    <input
                      type="text"
                      value={(theme as any)[field.key] || ''}
                      onChange={(e) => updateTheme({ [field.key]: e.target.value } as Partial<Theme>)}
                      className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors dir-ltr"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              التخطيط
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="theme-hero-layout" className="block text-sm text-muted mb-1">تخطيط البطل</label>
                <select
                  id="theme-hero-layout"
                  value={theme.heroLayout}
                  onChange={(e) => updateTheme({ heroLayout: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                >
                  <option value="center">وسط</option>
                  <option value="split">منقسم</option>
                  <option value="minimal">بسيط</option>
                </select>
              </div>
              <div>
                <label htmlFor="theme-navbar-style" className="block text-sm text-muted mb-1">شريط التنقل</label>
                <select
                  id="theme-navbar-style"
                  value={theme.navbarStyle}
                  onChange={(e) => updateTheme({ navbarStyle: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                >
                  <option value="fixed">ثابت</option>
                  <option value="static">عادي</option>
                  <option value="transparent">شفاف</option>
                </select>
              </div>
              <div>
                <label htmlFor="theme-button-style" className="block text-sm text-muted mb-1">نمط الأزرار</label>
                <select
                  id="theme-button-style"
                  value={theme.buttonStyle}
                  onChange={(e) => updateTheme({ buttonStyle: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                >
                  <option value="gradient">تدرج</option>
                  <option value="solid">ثابت</option>
                  <option value="outline">إطار</option>
                </select>
              </div>
              <div>
                <label htmlFor="theme-border-radius" className="block text-sm text-muted mb-1">انحناء الحواف</label>
                <select
                  id="theme-border-radius"
                  value={theme.borderRadius}
                  onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                >
                  <option value="0.5rem">صغير</option>
                  <option value="0.75rem">متوسط</option>
                  <option value="1rem">كبير</option>
                  <option value="1.5rem">كبير جداً</option>
                </select>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              الخط
            </h3>
            <div>
              <label htmlFor="theme-font-family" className="block text-sm text-muted mb-1">نوع الخط</label>
              <select
                id="theme-font-family"
                value={theme.fontFamily}
                onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              >
                <option value="Cairo">Cairo</option>
                <option value="Tajawal">Tajawal</option>
                <option value="Almarai">Almarai</option>
                <option value="system-ui">System</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Preview */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4">معاينة سريعة</h3>
            <div
              className="rounded-2xl p-6 text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                borderRadius: theme.borderRadius,
                fontFamily: theme.fontFamily,
              }}
            >
              <div className="text-2xl font-bold mb-2">عنوان الموقع</div>
              <p className="text-white/80 text-sm mb-4">نص توضيحي قصير</p>
              <button
                className="px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background:
                    theme.buttonStyle === 'gradient'
                      ? `linear-gradient(90deg, ${theme.secondaryColor}, ${theme.primaryColor})`
                      : theme.buttonStyle === 'solid'
                      ? theme.accentColor
                      : 'transparent',
                  border: theme.buttonStyle === 'outline' ? `2px solid white` : 'none',
                }}
              >
                زر تجريبي
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-primary" />
              الأقسام الظاهرة
            </h3>
            <div className="space-y-2">
              {(theme.sections || defaultSections).map((section) => (
                <label
                  key={section.id}
                  htmlFor={`section-${section.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 cursor-pointer"
                >
                  <span className="text-sm text-foreground">{section.title || section.id}</span>
                  <input
                    id={`section-${section.id}`}
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => toggleSection(section.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:border-primary"
                  />
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
