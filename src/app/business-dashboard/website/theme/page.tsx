'use client';

import { useEffect, useRef, useState } from 'react';
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
  Upload,
  X,
} from 'lucide-react';
import {
  getThemePresetById,
  getDefaultSections,
  WebsiteSection,
  type HomeTemplateId,
} from '@/lib/business-template-generator';
import { DesignLibrarySelector } from '@/components/business-apply/DesignLibrarySelector';
import { getDesignById, resolvePresetId, resolveHomeTemplate } from '@/lib/business-design-library';
import { extractColorsFromImage } from '@/lib/color-extraction';
import { getFashionOneSections } from '@/lib/fashion-one-content';
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
  { id: 'hero', type: 'hero', title: 'البطل', enabled: true, order: 10 },
  { id: 'about', type: 'about', title: 'من نحن', enabled: true, order: 20 },
  { id: 'services', type: 'services', title: 'الخدمات', enabled: true, order: 30 },
  { id: 'bridal', type: 'bridal', title: 'باقات العرائس', enabled: true, order: 40 },
  { id: 'pricing', type: 'pricing', title: 'الأسعار', enabled: true, order: 50 },
  { id: 'gallery', type: 'gallery', title: 'معرض الصور', enabled: true, order: 60 },
  { id: 'reviews', type: 'reviews', title: 'التقييمات', enabled: true, order: 70 },
  { id: 'contact', type: 'contact', title: 'التواصل', enabled: true, order: 80 },
];

type FieldType =
  | 'text'
  | 'textarea'
  | 'image'
  | 'stats'
  | 'features'
  | 'list'
  | 'features-simple'
  | 'gallery-images'
  | 'testimonials'
  | 'toggle'
  | 'select'
  | 'font-select'
  | 'slides'
  | 'category-cards'
  | 'services-list'
  | 'accessories-list'
  | 'string-list'
  | 'social-links'
  | 'achievement-cards';

interface SectionField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

// Curated Google-font shortlist used by the fashion-1 builder font pickers.
const FASHION_FONT_OPTIONS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Pinyon Script',
  'Tajawal',
  'Cairo',
  'Almarai',
  'system-ui',
];

const BEAUTY_SALON_SECTION_FIELDS: Record<string, SectionField[]> = {
  hero: [
    { key: 'image', label: 'صورة الخلفية (رابط)', type: 'image' },
    { key: 'title', label: 'العنوان الرئيسي', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'ctaPrimary', label: 'زر الحجز', type: 'text' },
    { key: 'ctaSecondary', label: 'زر الخدمات', type: 'text' },
    { key: 'badgeTitle', label: 'عنوان الشارة', type: 'text' },
    { key: 'badgeSubtitle', label: 'نص الشارة', type: 'text' },
    { key: 'stats', label: 'الإحصائيات', type: 'stats' },
  ],
  about: [
    { key: 'image', label: 'الصورة', type: 'image' },
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'floatYear', label: 'سنوات الخبرة', type: 'text' },
    { key: 'floatLabel', label: 'تسمية سنوات الخبرة', type: 'text' },
    { key: 'features', label: 'المميزات', type: 'features' },
  ],
  services: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
  ],
  bridal: [
    { key: 'image', label: 'صورة العروس', type: 'image' },
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'tag', label: 'وسم الصورة', type: 'text' },
    { key: 'cta', label: 'زر الحجز', type: 'text' },
    { key: 'list', label: 'قائمة المميزات', type: 'list' },
  ],
  pricing: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'features', label: 'مميزات الباقات', type: 'features-simple' },
  ],
  gallery: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'images', label: 'صور المعرض (روابط)', type: 'gallery-images' },
  ],
  reviews: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'items', label: 'التقييمات (إذا لا توجد تقييمات حقيقية)', type: 'testimonials' },
  ],
  contact: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
  ],
};

// Full per-section content editor config for the fashion-1 (Dress Shop) store
// template. Keys map onto `BusinessTheme.sections[].settings`, matching the
// shape of FASHION_ONE_DEFAULTS. NOTE: no `reviews` entry — reviews render real
// Review data and are managed from the reviews dashboard, not here.
const FASHION_ONE_SECTION_FIELDS: Record<string, SectionField[]> = {
  branding: [
    { key: 'fontHeading', label: 'خط العناوين', type: 'font-select' },
    { key: 'fontBody', label: 'خط النصوص', type: 'font-select' },
    {
      key: 'logoStyle',
      label: 'نمط الشعار',
      type: 'select',
      options: [
        { value: 'script', label: 'مخطوط (Script)' },
        { value: 'serif', label: 'كلاسيكي (Serif)' },
        { value: 'sans', label: 'عصري (Sans)' },
      ],
    },
    { key: 'showTopBar', label: 'إظهار الشريط العلوي', type: 'toggle' },
    { key: 'showLanguageCurrency', label: 'إظهار محدد اللغة/العملة', type: 'toggle' },
  ],
  hero: [
    { key: 'slides', label: 'شرائح البطل', type: 'slides' },
  ],
  categories: [
    { key: 'cards', label: 'بطاقات التصنيفات', type: 'category-cards' },
  ],
  products: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'titleEm', label: 'العنوان المميز', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'showTabs', label: 'إظهار تبويبات التصنيف', type: 'toggle' },
    { key: 'limit', label: 'عدد المنتجات المعروضة', type: 'select', options: [
      { value: '4', label: '4 منتجات' },
      { value: '6', label: '6 منتجات' },
      { value: '8', label: '8 منتجات' },
      { value: '12', label: '12 منتجاً' },
    ]},
  ],
  promo: [
    { key: 'tag', label: 'الوسم', type: 'text' },
    { key: 'titleEm', label: 'العنوان المميز', type: 'text' },
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'text', label: 'النص', type: 'textarea' },
    { key: 'cta', label: 'زر الإجراء', type: 'text' },
    { key: 'image', label: 'الصورة', type: 'image' },
  ],
  services: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'titleEm', label: 'العنوان المميز', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'items', label: 'الخدمات', type: 'services-list' },
  ],
  about: [
    { key: 'tag', label: 'الوسم', type: 'text' },
    { key: 'titlePre', label: 'العنوان (قبل)', type: 'text' },
    { key: 'titleEm', label: 'العنوان المميز', type: 'text' },
    { key: 'titlePost', label: 'العنوان (بعد)', type: 'text' },
    { key: 'paragraph1', label: 'الفقرة الأولى', type: 'textarea' },
    { key: 'paragraph2', label: 'الفقرة الثانية', type: 'textarea' },
    { key: 'establishedYear', label: 'سنة التأسيس', type: 'text' },
    { key: 'image', label: 'الصورة', type: 'image' },
    { key: 'cta', label: 'زر الإجراء', type: 'text' },
    { key: 'stats', label: 'الإحصائيات', type: 'stats' },
    { key: 'statsSource', label: 'مصدر الإحصائيات', type: 'select', options: [
      { value: 'manual', label: 'يدوي' },
      { value: 'productsCount', label: 'عدد المنتجات' },
      { value: 'reviewCount', label: 'عدد التقييمات' },
      { value: 'avgRating', label: 'متوسط التقييم' },
    ]},
  ],
  achievements: [
    { key: 'enabled', label: 'تفعيل القسم', type: 'toggle' },
    { key: 'items', label: 'بطاقات الإنجازات', type: 'achievement-cards' },
  ],
  accessories: [
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'titleEm', label: 'العنوان المميز', type: 'text' },
    { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
    { key: 'items', label: 'الإكسسوارات', type: 'accessories-list' },
  ],
  contact: [
    { key: 'bookingEnabled', label: 'تفعيل الحجز', type: 'toggle' },
    { key: 'tag', label: 'الوسم', type: 'text' },
    { key: 'title', label: 'العنوان', type: 'text' },
    { key: 'titleEm', label: 'العنوان المميز', type: 'text' },
    { key: 'description', label: 'الوصف', type: 'textarea' },
    { key: 'perks', label: 'المميزات', type: 'string-list' },
    { key: 'phone', label: 'الهاتف', type: 'text' },
    { key: 'whatsapp', label: 'واتساب', type: 'text' },
    { key: 'address', label: 'العنوان', type: 'text' },
    { key: 'hours', label: 'ساعات العمل', type: 'text' },
  ],
  footer: [
    { key: 'brandDescription', label: 'وصف العلامة', type: 'textarea' },
    { key: 'showSocial', label: 'إظهار روابط التواصل', type: 'toggle' },
    { key: 'showPayment', label: 'إظهار طرق الدفع', type: 'toggle' },
    { key: 'copyright', label: 'حقوق النشر', type: 'text' },
    { key: 'socialLinks', label: 'روابط التواصل الاجتماعي', type: 'social-links' },
  ],
  shop: [
    { key: 'rentMultiplier', label: 'مضاعف سعر الإيجار', type: 'text' },
    { key: 'productsPerPage', label: 'منتجات في كل صفحة', type: 'select', options: [
      { value: '6', label: '6' },
      { value: '9', label: '9' },
      { value: '12', label: '12' },
      { value: '24', label: '24' },
    ]},
  ],
  seo: [
    { key: 'metaTitle', label: 'عنوان الميتا', type: 'text' },
    { key: 'metaDescription', label: 'وصف الميتا', type: 'textarea' },
    { key: 'keywords', label: 'الكلمات المفتاحية', type: 'textarea' },
  ],
};

// Merge fashion-1 default sections into a loaded theme: keep existing sections
// (and their settings) untouched, append any default sections the theme is
// missing so older stores still expose every editable section.
function mergeFashionOneSections(existing: WebsiteSection[] | undefined): WebsiteSection[] {
  const current = existing ? [...existing] : [];
  const presentIds = new Set(current.map((s) => s.id));
  for (const def of getFashionOneSections()) {
    if (!presentIds.has(def.id)) current.push(def);
  }
  return current;
}

function SectionFieldsEditor({
  fields,
  settings,
  onChange,
}: {
  fields: SectionField[];
  settings: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-xs text-muted mb-1">{field.label}</label>
          <FieldInput field={field} value={settings[field.key]} onChange={(value) => onChange({ [field.key]: value })} />
        </div>
      ))}
    </div>
  );
}

function ImageFieldInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('variant', 'cover');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
      }
    } catch (e) {
      console.error('Image upload failed', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/templates/beauty-salon/hero-hair.jpg أو رابط خارجي"
          className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground hover:bg-slate-50 disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          رفع
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          if (e.target) e.target.value = '';
        }}
      />
      {value && (
        <div className="relative">
          <img src={value} alt="" className="h-24 w-full object-cover rounded-md border border-border" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
            aria-label="إزالة الصورة"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: SectionField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
      />
    );
  }

  if (field.type === 'image') {
    return <ImageFieldInput value={(value as string) || ''} onChange={onChange} />;
  }

  if (field.type === 'stats') {
    const items = (value as { num: string; lbl: string; source?: string }[] | undefined) || [
      { num: '', lbl: 'فستان فاخر', source: 'productsCount' },
      { num: '', lbl: 'عروس سعيدة', source: 'manual' },
      { num: '', lbl: 'تقييم العميلات', source: 'avgRating' },
    ];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              value={item.num}
              disabled={item.source !== 'manual'}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], num: e.target.value };
                onChange(next);
              }}
              placeholder="الرقم"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors disabled:opacity-50"
            />
            <input
              type="text"
              value={item.lbl}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], lbl: e.target.value };
                onChange(next);
              }}
              placeholder="التسمية"
              className="flex-[2] px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <select
              value={item.source || 'manual'}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], source: e.target.value, num: e.target.value === 'manual' ? item.num : '' };
                onChange(next);
              }}
              className="w-32 px-2 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="manual">يدوي</option>
              <option value="productsCount">عدد المنتجات</option>
              <option value="reviewCount">عدد التقييمات</option>
              <option value="avgRating">متوسط التقييم</option>
            </select>
          </div>
        ))}
      </div>
    );
  }

  if (field.type === 'features') {
    const items = (value as { icon: string; title: string; description: string }[] | undefined) || [
      { icon: 'sparkles', title: 'منتجات عالية الجودة', description: 'نستخدم أجود الماركات العالمية المعتمدة.' },
      { icon: 'heart', title: 'راحة وخصوصية', description: 'أجواء نسائية خاصة لراحة تامة.' },
      { icon: 'crown', title: 'خبيرات معتمدات', description: 'فريق مدرب على أحدث التقنيات.' },
      { icon: 'clock', title: 'مواعيد دقيقة', description: 'نحترم وقتكِ بمواعيد منظمة ومرنة.' },
    ];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <select
              value={item.icon}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], icon: e.target.value };
                onChange(next);
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            >
              <option value="sparkles">Sparkles</option>
              <option value="heart">Heart</option>
              <option value="crown">Crown</option>
              <option value="clock">Clock</option>
              <option value="scissors">Scissors</option>
            </select>
            <input
              type="text"
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], title: e.target.value };
                onChange(next);
              }}
              placeholder="العنوان"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              placeholder="الوصف"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>
    );
  }

  if (field.type === 'list') {
    const items = (value as { title: string; description: string }[] | undefined) || [
      { title: 'مكياج عروس احترافي', description: 'تجربة مكياج كاملة تناسب ذوقكِ وإطلالتكِ.' },
      { title: 'تسريحة شعر فاخرة', description: 'تسريحات عصرية وكلاسيكية بأجود المنتجات.' },
      { title: 'عناية بالبشرة والأظافر', description: 'جلسات تجهيز متكاملة قبل موعد الزفاف.' },
    ];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <input
              type="text"
              value={item.title}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], title: e.target.value };
                onChange(next);
              }}
              placeholder="العنوان"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], description: e.target.value };
                onChange(next);
              }}
              placeholder="الوصف"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
        ))}
      </div>
    );
  }

  if (field.type === 'features-simple') {
    const items = (value as string[] | undefined) || ['خدمة شخصية مخصصة', 'منتجات عالية الجودة', 'موعد مرن وسريع', 'متابعة ما بعد الخدمة'];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
              placeholder="ميزة"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة ميزة
        </button>
      </div>
    );
  }

  if (field.type === 'gallery-images') {
    const items = (value as string[] | undefined) || [];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
              placeholder="رابط الصورة"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            {item && <img src={item} alt="" className="h-10 w-10 object-cover rounded-md border border-border" />}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة صورة
        </button>
      </div>
    );
  }

  if (field.type === 'testimonials') {
    const items = (value as { name: string; role: string; comment: string; rating: number }[] | undefined) || [];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], name: e.target.value };
                onChange(next);
              }}
              placeholder="الاسم"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.role}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], role: e.target.value };
                onChange(next);
              }}
              placeholder="الدور"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="number"
              min={1}
              max={5}
              value={item.rating}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], rating: Number(e.target.value) };
                onChange(next);
              }}
              placeholder="التقييم 1-5"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <textarea
              value={item.comment}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...next[idx], comment: e.target.value };
                onChange(next);
              }}
              placeholder="التعليق"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { name: '', role: 'زبونة', comment: '', rating: 5 }])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة تقييم
        </button>
      </div>
    );
  }

  if (field.type === 'toggle') {
    const checked = Boolean(value);
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full px-0.5 transition-colors ${
            checked ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <span className="block h-5 w-5 rounded-full bg-white shadow" />
        </button>
        <span className="text-xs text-muted">{checked ? 'مفعّل' : 'معطّل'}</span>
      </div>
    );
  }

  if (field.type === 'select') {
    const options = field.options || [];
    return (
      <select
        value={(value as string) || options[0]?.value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'font-select') {
    return (
      <select
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
      >
        <option value="">افتراضي القالب</option>
        {FASHION_FONT_OPTIONS.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'string-list') {
    const items = (value as string[] | undefined) || [];
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
              placeholder="عنصر"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة عنصر
        </button>
      </div>
    );
  }

  if (field.type === 'slides') {
    type Slide = { tag: string; titleEm: string; title: string; sub: string; cta1: string; cta2: string; image: string };
    const items = (value as Slide[] | undefined) || [];
    const patch = (idx: number, key: keyof Slide, v: string) =>
      onChange(items.map((it, i) => (i === idx ? { ...it, [key]: v } : it)));
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">شريحة {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                حذف
              </button>
            </div>
            <input
              type="text"
              value={item.tag}
              onChange={(e) => patch(idx, 'tag', e.target.value)}
              placeholder="الوسم"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.titleEm}
              onChange={(e) => patch(idx, 'titleEm', e.target.value)}
              placeholder="العنوان المميز"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.title}
              onChange={(e) => patch(idx, 'title', e.target.value)}
              placeholder="العنوان"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <textarea
              value={item.sub}
              onChange={(e) => patch(idx, 'sub', e.target.value)}
              placeholder="الوصف"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={item.cta1}
                onChange={(e) => patch(idx, 'cta1', e.target.value)}
                placeholder="الزر الأول"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={item.cta2}
                onChange={(e) => patch(idx, 'cta2', e.target.value)}
                placeholder="الزر الثاني"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              />
            </div>
            <ImageFieldInput value={item.image || ''} onChange={(v) => patch(idx, 'image', v)} />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange([...items, { tag: '', titleEm: '', title: '', sub: '', cta1: '', cta2: '', image: '' }])
          }
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة شريحة
        </button>
      </div>
    );
  }

  if (field.type === 'category-cards') {
    type Card = { script: string; sans: string; img: string; link: string };
    const items = (value as Card[] | undefined) || [];
    const patch = (idx: number, key: keyof Card, v: string) =>
      onChange(items.map((it, i) => (i === idx ? { ...it, [key]: v } : it)));
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">بطاقة {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                حذف
              </button>
            </div>
            <input
              type="text"
              value={item.script}
              onChange={(e) => patch(idx, 'script', e.target.value)}
              placeholder="النص المخطوط"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.sans}
              onChange={(e) => patch(idx, 'sans', e.target.value)}
              placeholder="النص العريض"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.link}
              onChange={(e) => patch(idx, 'link', e.target.value)}
              placeholder="الرابط"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <ImageFieldInput value={item.img || ''} onChange={(v) => patch(idx, 'img', v)} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { script: '', sans: '', img: '', link: '' }])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة بطاقة
        </button>
      </div>
    );
  }

  if (field.type === 'services-list') {
    type ServiceItem = { icon: string; title: string; desc: string };
    const items = (value as ServiceItem[] | undefined) || [];
    const patch = (idx: number, key: keyof ServiceItem, v: string) =>
      onChange(items.map((it, i) => (i === idx ? { ...it, [key]: v } : it)));
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">خدمة {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                حذف
              </button>
            </div>
            <input
              type="text"
              value={item.icon}
              onChange={(e) => patch(idx, 'icon', e.target.value)}
              placeholder="الأيقونة (مثال: fas fa-gem)"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.title}
              onChange={(e) => patch(idx, 'title', e.target.value)}
              placeholder="العنوان"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <textarea
              value={item.desc}
              onChange={(e) => patch(idx, 'desc', e.target.value)}
              placeholder="الوصف"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { icon: 'fas fa-gem', title: '', desc: '' }])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة خدمة
        </button>
      </div>
    );
  }

  if (field.type === 'accessories-list') {
    type AccessoryItem = { name: string; img: string };
    const items = (value as AccessoryItem[] | undefined) || [];
    const patch = (idx: number, key: keyof AccessoryItem, v: string) =>
      onChange(items.map((it, i) => (i === idx ? { ...it, [key]: v } : it)));
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">إكسسوار {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                حذف
              </button>
            </div>
            <input
              type="text"
              value={item.name}
              onChange={(e) => patch(idx, 'name', e.target.value)}
              placeholder="الاسم"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <ImageFieldInput value={item.img || ''} onChange={(v) => patch(idx, 'img', v)} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { name: '', img: '' }])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة إكسسوار
        </button>
      </div>
    );
  }

  if (field.type === 'social-links') {
    const obj = (value as Record<string, string> | undefined) || {};
    const links = [
      { key: 'facebook', label: 'فيسبوك' },
      { key: 'instagram', label: 'إنستغرام' },
      { key: 'tiktok', label: 'تيك توك' },
      { key: 'pinterest', label: 'بينتريست' },
      { key: 'youtube', label: 'يوتيوب' },
    ];
    return (
      <div className="space-y-2">
        {links.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[11px] text-muted mb-1">{label}</label>
            <input
              type="text"
              value={obj[key] || ''}
              onChange={(e) => onChange({ ...obj, [key]: e.target.value })}
              placeholder="https://"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors dir-ltr"
            />
          </div>
        ))}
      </div>
    );
  }

  if (field.type === 'achievement-cards') {
    type AchievementItem = { label: string; value: string; source: string; icon: string };
    const items = (value as AchievementItem[] | undefined) || [];
    const sources = [
      { value: 'manual', label: 'يدوي' },
      { value: 'reviewCount', label: 'عدد التقييمات' },
      { value: 'avgRating', label: 'التقييم' },
      { value: 'businessName', label: 'اسم النشاط' },
      { value: 'productsCount', label: 'عدد المنتجات' },
      { value: 'establishedYear', label: 'سنة التأسيس' },
    ];
    const patch = (idx: number, key: keyof AchievementItem, v: string) =>
      onChange(items.map((it, i) => (i === idx ? { ...it, [key]: v } : it)));
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-border rounded-md p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">بطاقة {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50"
              >
                حذف
              </button>
            </div>
            <input
              type="text"
              value={item.icon}
              onChange={(e) => patch(idx, 'icon', e.target.value)}
              placeholder="الأيقونة (مثال: fas fa-star)"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <input
              type="text"
              value={item.label}
              onChange={(e) => patch(idx, 'label', e.target.value)}
              placeholder="التسمية"
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
            <select
              value={item.source}
              onChange={(e) => patch(idx, 'source', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            >
              {sources.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {item.source === 'manual' && (
              <input
                type="text"
                value={item.value}
                onChange={(e) => patch(idx, 'value', e.target.value)}
                placeholder="القيمة اليدوية"
                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { icon: 'fas fa-star', label: '', source: 'manual', value: '' }])}
          className="w-full py-2 text-xs text-primary border border-primary/20 rounded-md hover:bg-primary/5"
        >
          + إضافة بطاقة
        </button>
      </div>
    );
  }

  return (
    <input
      type="text"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
    />
  );
}

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
          router.push('/business/apply/start');
          return;
        }
        throw new Error('فشل في جلب بيانات النشاط');
      }
      const businessData = await businessRes.json();
      setBusiness(businessData.business);

      const themeRes = await fetch(`/api/businesses/${businessData.business.id}/theme`);
      if (!themeRes.ok) throw new Error('فشل في جلب المظهر');
      const themeData = await themeRes.json();
      const loadedTheme: Theme = themeData.theme;
      // Backfill any missing fashion-1 sections so the per-section editor can
      // surface every editable section, even for stores created before this
      // feature. Existing sections (and their settings) are preserved.
      if (loadedTheme?.homeTemplate === 'fashion-1') {
        loadedTheme.sections = mergeFashionOneSections(loadedTheme.sections);
      }
      setTheme(loadedTheme);
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
      sections: getDefaultSections(),
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

  const updateSectionSettings = (sectionId: string, settings: Record<string, unknown>) => {
    if (!theme) return;
    const sections = (theme.sections || defaultSections).map((s) =>
      s.id === sectionId ? { ...s, settings: { ...s.settings, ...settings } } : s
    );
    updateTheme({ sections });
  };

  const getSectionSettings = (sectionId: string): Record<string, unknown> => {
    if (!theme) return {};
    const section = (theme.sections || defaultSections).find((s) => s.id === sectionId);
    return (section?.settings as Record<string, unknown>) || {};
  };

  const isEnfoldSpaLike =
    theme?.homeTemplate === 'enfold-spa' ||
    theme?.homeTemplate === 'beauty-salon-1';

  const isFashionOne = theme?.homeTemplate === 'fashion-1';

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

          {/* Store management shortcuts for fashion-1 (products & reviews are
              managed in their own dashboards, not inline here) */}
          {isFashionOne && (
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="font-bold text-foreground mb-4">إدارة المتجر</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/business-dashboard/products"
                  className="px-4 py-3 rounded-lg border border-border bg-surface text-sm font-medium text-foreground hover:bg-slate-50 text-center transition-colors"
                >
                  إدارة المنتجات
                </Link>
                <Link
                  href="/business-dashboard/reviews"
                  className="px-4 py-3 rounded-lg border border-border bg-surface text-sm font-medium text-foreground hover:bg-slate-50 text-center transition-colors"
                >
                  إدارة التقييمات
                </Link>
              </div>
            </div>
          )}

          {/* Per-section settings for Enfold/Beauty Salon 1 and Fashion 1 */}
          {(isEnfoldSpaLike || isFashionOne) && (
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="font-bold text-foreground mb-4">إعدادات أقسام القالب</h3>
              <div className="space-y-4">
                {Object.entries(isFashionOne ? FASHION_ONE_SECTION_FIELDS : BEAUTY_SALON_SECTION_FIELDS).map(([sectionId, fields]) => {
                  const section = (theme.sections || defaultSections).find((s) => s.id === sectionId);
                  if (!section) return null;
                  return (
                    <div key={sectionId} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-foreground">{section.title || sectionId}</h4>
                        {isFashionOne && (
                          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                            <input
                              type="checkbox"
                              checked={section.enabled}
                              onChange={() => toggleSection(sectionId)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:border-primary"
                            />
                            مفعّل
                          </label>
                        )}
                      </div>
                      <SectionFieldsEditor
                        fields={fields}
                        settings={getSectionSettings(sectionId)}
                        onChange={(patch) => updateSectionSettings(sectionId, patch)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
