import type { HomeTemplateId } from './business-template-generator';

export type WebsiteType = 'INTRO' | 'STORE' | 'BOTH';
export type DesignStyle = 'modern' | 'minimal' | 'corporate' | 'creative' | 'elegant' | 'bold' | 'warm' | 'dark';

export interface WebsiteDesign {
  designId: string;
  name: string;
  nameAr: string;
  descriptionAr?: string;
  /** صورة معاينة للتصميم (URL أو SVG data URI) */
  previewImage?: string;
  /** نوع الموقع الذي يدعمه التصميم */
  websiteType: WebsiteType;
  /** تصنيفات الأنشطة التي يناسبها */
  categoryTags: string[];
  /** النمط البصري */
  style?: DesignStyle;
  /** مصدر الإلهام */
  source?: string;
  /** معرف الـ preset المرتبط (للألوان والخطوط) */
  presetId: string;
  /** قالب الصفحة الرئيسية */
  homeTemplate: HomeTemplateId;
}

const PREVIEW_SVGS = {
  intro: (primary: string, secondary: string, accent: string, isDark: boolean) => {
    const bg = isDark ? '#1e1b4b' : '#ffffff';
    const surface = isDark ? '#312e81' : '#f8fafc';
    const text = isDark ? '#f8fafc' : '#1a1a2e';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${bg}"/>
      <rect x="0" y="0" width="400" height="48" fill="${surface}"/>
      <circle cx="36" cy="24" r="12" fill="${primary}"/>
      <rect x="60" y="18" width="80" height="12" rx="3" fill="${text}" opacity="0.2"/>
      <rect x="260" y="18" width="120" height="12" rx="3" fill="${text}" opacity="0.1"/>
      <rect x="24" y="72" width="352" height="120" rx="12" fill="url(#hero)"/>
      <defs>
        <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primary}"/>
          <stop offset="100%" style="stop-color:${secondary}"/>
        </linearGradient>
      </defs>
      <rect x="48" y="110" width="160" height="20" rx="4" fill="white" opacity="0.9"/>
      <rect x="48" y="142" width="120" height="12" rx="3" fill="white" opacity="0.7"/>
      <rect x="48" y="160" width="80" height="12" rx="3" fill="white" opacity="0.5"/>
      <rect x="48" y="210" width="90" height="28" rx="8" fill="${accent}"/>
      <rect x="24" y="216" width="100" height="100" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
      <rect x="36" y="230" width="76" height="8" rx="2" fill="${primary}" opacity="0.3"/>
      <rect x="36" y="244" width="60" height="6" rx="2" fill="${text}" opacity="0.15"/>
      <rect x="36" y="256" width="50" height="6" rx="2" fill="${text}" opacity="0.1"/>
      <rect x="148" y="216" width="100" height="100" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
      <rect x="160" y="230" width="76" height="8" rx="2" fill="${secondary}" opacity="0.3"/>
      <rect x="160" y="244" width="60" height="6" rx="2" fill="${text}" opacity="0.15"/>
      <rect x="160" y="256" width="50" height="6" rx="2" fill="${text}" opacity="0.1"/>
      <rect x="272" y="216" width="100" height="100" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
      <rect x="284" y="230" width="76" height="8" rx="2" fill="${accent}" opacity="0.3"/>
      <rect x="284" y="244" width="60" height="6" rx="2" fill="${text}" opacity="0.15"/>
      <rect x="284" y="256" width="50" height="6" rx="2" fill="${text}" opacity="0.1"/>
    </svg>`;
    return `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg)}`;
  },
};

function introPreview(primary: string, secondary: string, accent: string, isDark = false): string {
  return PREVIEW_SVGS.intro(primary, secondary, accent, isDark);
}

  const DESIGNS: WebsiteDesign[] = [
  // Intro designs
  {
    designId: 'intro-modern',
    name: 'Modern Professional',
    nameAr: 'عصري احترافي',
    descriptionAr: 'قالب intro حديث ومتجاوب يناسب معظم الأنشطة التجارية مع hero احترافي وأقسام واضحة.',
    websiteType: 'INTRO',
    categoryTags: ['عام', 'خدمات', 'شركات', 'مؤسسة', 'منظمة', 'جمعية', 'مكتب', 'شركة تقنية', 'استشارات'],
    style: 'modern',
    source: 'Gateo',
    presetId: 'modernIntro',
    homeTemplate: 'modern-intro',
    previewImage: introPreview('#4f46e5', '#06b6d4', '#f59e0b'),
  },
  {
    designId: 'intro-beauty-salon-1',
    name: 'Beauty Salon 1',
    nameAr: 'صالون تجميل 1',
    descriptionAr: 'النموذج الرئيسي لصالونات التجميل والسبا: هيدر شفاف فوق بطل عريض، أقسام خدمات، معرض صور، آراء، وتواصل.',
    websiteType: 'INTRO',
    categoryTags: ['صالون تجميل', 'تجميل', 'صالون', 'سبا', 'عناية', 'سيدات', 'موقع تعريفي'],
    style: 'elegant',
    source: 'Gateo',
    presetId: 'beautySalon1',
    homeTemplate: 'beauty-salon-1',
    previewImage: introPreview('#b76e79', '#c79b6b', '#d9a1a8'),
  },
  {
    designId: 'intro-default',
    name: 'Gateo Default',
    nameAr: 'Gateo افتراضي',
    descriptionAr: 'تصميم متوازن يناسب معظم الأنشطة التجارية.',
    websiteType: 'INTRO',
    categoryTags: ['عام', 'خدمات', 'شركات'],
    style: 'modern',
    source: 'Gateo',
    presetId: 'default',
    homeTemplate: 'default',
    previewImage: introPreview('#7c3aed', '#ec4899', '#f59e0b'),
  },
  {
    designId: 'intro-medical',
    name: 'Medical & Health',
    nameAr: 'طبي وصحي',
    descriptionAr: 'تصميم نظيف ومطمئن للعيادات والمراكز الصحية.',
    websiteType: 'INTRO',
    categoryTags: ['طب', 'صحة', 'عيادة', 'استشارات'],
    style: 'corporate',
    source: 'BootstrapMade',
    presetId: 'medical',
    homeTemplate: 'default',
    previewImage: introPreview('#0ea5e9', '#14b8a6', '#f97316'),
  },
  {
    designId: 'intro-restaurant',
    name: 'Restaurant & Cafe',
    nameAr: 'مطعم وكافيه',
    descriptionAr: 'ألوان دافئة وجذابة للمطاعم والمقاهي.',
    websiteType: 'INTRO',
    categoryTags: ['مطعم', 'كافيه', 'طعام', 'مخبوزات'],
    style: 'warm',
    source: 'BootstrapMade',
    presetId: 'restaurant',
    homeTemplate: 'default',
    previewImage: introPreview('#ef4444', '#f97316', '#eab308'),
  },
  {
    designId: 'intro-tech',
    name: 'Technology',
    nameAr: 'تقنية',
    descriptionAr: 'تصميم عصري داكن لشركات التقنية والبرمجة.',
    websiteType: 'INTRO',
    categoryTags: ['تقنية', 'برمجة', 'تسويق رقمي', 'IT'],
    style: 'dark',
    source: 'Start Bootstrap',
    presetId: 'tech',
    homeTemplate: 'default',
    previewImage: introPreview('#6366f1', '#06b6d4', '#10b981', true),
  },
  {
    designId: 'intro-fashion',
    name: 'Fashion & Style',
    nameAr: 'أزياء وموضة',
    descriptionAr: 'ثيم أنيق وبنفسجي للأزياء والإكسسوارات.',
    websiteType: 'INTRO',
    categoryTags: ['أزياء', 'موضة', 'إكسسوارات'],
    style: 'elegant',
    source: 'BootstrapMade',
    presetId: 'fashion',
    homeTemplate: 'default',
    previewImage: introPreview('#ec4899', '#a855f7', '#f59e0b'),
  },
  {
    designId: 'intro-agency',
    name: 'Agency Corporate',
    nameAr: 'وكالة إبداعية',
    descriptionAr: 'تصميم احترافي بالأزرق والسيان للوكالات والشركات.',
    websiteType: 'INTRO',
    categoryTags: ['وكالة', 'تسويق', 'استشارات', 'خدمات'],
    style: 'corporate',
    source: 'BootstrapMade',
    presetId: 'agency',
    homeTemplate: 'default',
    previewImage: introPreview('#2563eb', '#06b6d4', '#f59e0b'),
  },
  {
    designId: 'intro-startup',
    name: 'Startup Modern',
    nameAr: 'شركة ناشئة',
    descriptionAr: 'تدرجات أرجوانية ووردية عصرية للشركات الناشئة.',
    websiteType: 'INTRO',
    categoryTags: ['شركة ناشئة', 'تقنية', 'تطبيقات'],
    style: 'modern',
    source: 'Start Bootstrap',
    presetId: 'startup',
    homeTemplate: 'default',
    previewImage: introPreview('#8b5cf6', '#ec4899', '#f43f5e'),
  },
  {
    designId: 'intro-portfolio',
    name: 'Portfolio Minimal',
    nameAr: 'معرض أعمال بسيط',
    descriptionAr: 'تصميم بسيط ونظيف للمصممين والمحترفين الحرّين.',
    websiteType: 'INTRO',
    categoryTags: ['مصمم', 'فنان', 'محترف حر', 'معرض أعمال'],
    style: 'minimal',
    source: 'HTML5 UP',
    presetId: 'portfolio',
    homeTemplate: 'default',
    previewImage: introPreview('#0d9488', '#14b8a6', '#f59e0b'),
  },
  {
    designId: 'intro-creative',
    name: 'Creative Studio',
    nameAr: 'ستوديو إبداعي',
    descriptionAr: 'تصميم جريء بألوان داكنة وبنفسجية للاستوديوهات.',
    websiteType: 'INTRO',
    categoryTags: ['إبداعي', 'تصميم', 'وسائط', 'فن'],
    style: 'creative',
    source: 'HTML5 UP',
    presetId: 'creative',
    homeTemplate: 'default',
    previewImage: introPreview('#7c3aed', '#f97316', '#ec4899', true),
  },
  {
    designId: 'intro-elegant',
    name: 'Elegant Luxury',
    nameAr: 'أناقة وفخامة',
    descriptionAr: 'ألوان ذهبية وزهرية للمنتجات الفاخرة والخدمات الراقية.',
    websiteType: 'INTRO',
    categoryTags: ['فاخر', 'مجوهرات', 'ساعات', 'خدمات راقية'],
    style: 'elegant',
    source: 'BootstrapMade',
    presetId: 'elegant',
    homeTemplate: 'default',
    previewImage: introPreview('#be185d', '#d97706', '#f59e0b'),
  },
  {
    designId: 'intro-warm',
    name: 'Warm Creative',
    nameAr: 'دافئ وإبداعي',
    descriptionAr: 'ألوان برتقالية وحمراء دافئة للتعليم والتدريب.',
    websiteType: 'INTRO',
    categoryTags: ['إبداعي', 'تعليم', 'تدريب', 'مجتمع'],
    style: 'warm',
    source: 'Start Bootstrap',
    presetId: 'warm',
    homeTemplate: 'default',
    previewImage: introPreview('#ea580c', '#dc2626', '#fbbf24'),
  },
  {
    designId: 'intro-minimal',
    name: 'Minimal Clean',
    nameAr: 'بسيط ونظيف',
    descriptionAr: 'تصميم أبيض وأزرق نظيف يركّز على المحتوى.',
    websiteType: 'INTRO',
    categoryTags: ['عام', 'خدمات', 'استشارات', 'تقنية'],
    style: 'minimal',
    source: 'HTML5 UP',
    presetId: 'minimal',
    homeTemplate: 'default',
    previewImage: introPreview('#3b82f6', '#60a5fa', '#22c55e'),
  },
  {
    designId: 'intro-navy',
    name: 'Corporate Navy',
    nameAr: 'شركاتي كحلي',
    descriptionAr: 'تصميم كلاسيكي بالكحلي والسيان للشركات.',
    websiteType: 'INTRO',
    categoryTags: ['شركات', 'مؤسسات', 'قانون', 'مالية'],
    style: 'corporate',
    source: 'BootstrapMade',
    presetId: 'navy',
    homeTemplate: 'default',
    previewImage: introPreview('#1e3a8a', '#06b6d4', '#f59e0b'),
  },
  {
    designId: 'intro-health',
    name: 'Health Wellness',
    nameAr: 'صحة ولياقة',
    descriptionAr: 'ألوان خضراء ونظيفة للصحة واللياقة البدنية.',
    websiteType: 'INTRO',
    categoryTags: ['صحة', 'لياقة', 'يوغا', 'تغذية'],
    style: 'modern',
    source: 'BootstrapMade',
    presetId: 'health',
    homeTemplate: 'default',
    previewImage: introPreview('#22c55e', '#10b981', '#f59e0b'),
  },
  {
    designId: 'intro-education',
    name: 'Education',
    nameAr: 'تعليمي',
    descriptionAr: 'تصميم هادئ ومناسب للمراكز التعليمية والدورات.',
    websiteType: 'INTRO',
    categoryTags: ['تعليم', 'تدريب', 'دورات'],
    style: 'corporate',
    source: 'BootstrapMade',
    presetId: 'education',
    homeTemplate: 'default',
    previewImage: introPreview('#f59e0b', '#f97316', '#ef4444'),
  },
  {
    designId: 'intro-event',
    name: 'Event Planner',
    nameAr: 'مناسبات وأفراح',
    descriptionAr: 'تصميم أنيق لمنسقي المناسبات وقاعات الأفراح.',
    websiteType: 'INTRO',
    categoryTags: ['مناسبات', 'أفراح', 'زهور', 'ضيافة'],
    style: 'elegant',
    source: 'BootstrapMade',
    presetId: 'event',
    homeTemplate: 'default',
    previewImage: introPreview('#be185d', '#f59e0b', '#fb7185'),
  },
  {
    designId: 'intro-photography',
    name: 'Photography',
    nameAr: 'تصوير فوتوغرافي',
    descriptionAr: 'تصميم داكن يبرز معارض الصور والأعمال الفوتوغرافية.',
    websiteType: 'INTRO',
    categoryTags: ['تصوير', 'فن', 'معرض أعمال'],
    style: 'dark',
    source: 'BootstrapMade',
    presetId: 'photography',
    homeTemplate: 'default',
    previewImage: introPreview('#111827', '#374151', '#f59e0b', true),
  },
  {
    designId: 'intro-travel',
    name: 'Travel & Tourism',
    nameAr: 'سفر وسياحة',
    descriptionAr: 'تصميم منعش بالأزرق والبرتقالي لشركات السياحة.',
    websiteType: 'INTRO',
    categoryTags: ['سفر', 'سياحة', 'فنادق'],
    style: 'creative',
    source: 'BootstrapMade',
    presetId: 'travel',
    homeTemplate: 'default',
    previewImage: introPreview('#0ea5e9', '#f97316', '#fbbf24'),
  },
  {
    designId: 'intro-fitness',
    name: 'Fitness',
    nameAr: 'لياقة بدنية',
    descriptionAr: 'تصميم جريء بالأحمر والأسود للصالات الرياضية.',
    websiteType: 'INTRO',
    categoryTags: ['لياقة', 'رياضة', 'صحة'],
    style: 'bold',
    source: 'BootstrapMade',
    presetId: 'fitness',
    homeTemplate: 'default',
    previewImage: introPreview('#dc2626', '#111827', '#fbbf24'),
  },
  {
    designId: 'intro-lawyer',
    name: 'Lawyer',
    nameAr: 'محاماة وقانون',
    descriptionAr: 'تصميم رسمي بالكحلي والذهبي للمكاتب القانونية.',
    websiteType: 'INTRO',
    categoryTags: ['قانون', 'استشارات', 'شركات'],
    style: 'corporate',
    source: 'BootstrapMade',
    presetId: 'lawyer',
    homeTemplate: 'default',
    previewImage: introPreview('#1e3a8a', '#b45309', '#f59e0b'),
  },
  {
    designId: 'intro-realestate',
    name: 'Real Estate',
    nameAr: 'عقارات',
    descriptionAr: 'تصميم فاخر للشركات العقارية والوساطة.',
    websiteType: 'INTRO',
    categoryTags: ['عقارات', 'فاخر', 'خدمات'],
    style: 'elegant',
    source: 'BootstrapMade',
    presetId: 'realEstate',
    homeTemplate: 'default',
    previewImage: introPreview('#0f766e', '#d97706', '#f59e0b'),
  },
  {
    designId: 'intro-bakery',
    name: 'Bakery',
    nameAr: 'مخبوزات وحلويات',
    descriptionAr: 'تصميم دافئ بالألوان الباستيل للمخابز والحلويات.',
    websiteType: 'INTRO',
    categoryTags: ['مخبوزات', 'حلويات', 'كافيه', 'طعام'],
    style: 'warm',
    source: 'BootstrapMade',
    presetId: 'bakery',
    homeTemplate: 'default',
    previewImage: introPreview('#f59e0b', '#f97316', '#fde68a'),
  },
  // Fashion 1 store design
  {
    designId: 'fashion-1',
    name: 'Fashion 1',
    nameAr: 'فاشن 1',
    descriptionAr: 'قالب متجر فاخر لفساتين الزفاف والسهرة بألوان ذهبية وهيدر أنيق وسلة وميجا منيو.',
    websiteType: 'STORE',
    categoryTags: ['أزياء', 'فساتين', 'أعراس', 'سيدات', 'متجر', 'فاخر'],
    style: 'elegant',
    source: 'Gateo',
    presetId: 'fashion1',
    homeTemplate: 'fashion-1',
    previewImage: introPreview('#a68a58', '#c9a86c', '#d4af37'),
  },
  // Store fallback
  {
    designId: 'store-default',
    name: 'Store Default',
    nameAr: 'متجر افتراضي',
    descriptionAr: 'تصميم متجر نظيف وبطاقات منتجات واضحة.',
    websiteType: 'STORE',
    categoryTags: ['عام', 'متاجر', 'تجارة'],
    style: 'modern',
    source: 'Gateo',
    presetId: 'default',
    homeTemplate: 'default',
    previewImage: introPreview('#7c3aed', '#ec4899', '#f59e0b'),
  },
];

export function getDesignList(): WebsiteDesign[] {
  return DESIGNS.map((d) => ({ ...d }));
}

export function getDesignById(designId: string): WebsiteDesign | undefined {
  return DESIGNS.find((d) => d.designId === designId);
}

export function getDesignsByWebsiteType(websiteType: 'INTRO' | 'STORE' | 'BOTH' | ''): WebsiteDesign[] {
  if (!websiteType) return getDesignList();
  return DESIGNS.filter((d) => d.websiteType === websiteType || d.websiteType === 'BOTH');
}

export function getDefaultDesignId(websiteType: 'INTRO' | 'STORE'): string {
  return websiteType === 'STORE' ? 'store-default' : 'intro-modern';
}

/** Resolve effective homeTemplate based on website type and selected design */
export function resolveHomeTemplate(design: WebsiteDesign | undefined | null, websiteType: 'INTRO' | 'STORE' | ''): HomeTemplateId {
  if (!design) return 'default';
  return design.homeTemplate || 'default';
}

/** Resolve effective presetId based on website type and selected design */
export function resolvePresetId(design: WebsiteDesign | undefined | null): string {
  return design?.presetId || 'default';
}
