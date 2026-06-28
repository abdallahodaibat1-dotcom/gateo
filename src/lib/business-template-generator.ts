export type HomeTemplateId =
  | 'default'
  | 'porto-shop1'
  | 'flatsome'
  | 'elessi'
  | 'grand-restaurant'
  | 'houzez'
  | 'jacqueline'
  | 'ohio'
  | 'enfold-spa'
  | 'beauty-salon';

export interface ThemePreset {
  presetId: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: 'gradient' | 'solid' | 'outline';
  heroLayout: 'center' | 'split' | 'minimal';
  navbarStyle: 'fixed' | 'static' | 'transparent';
  homeTemplate?: HomeTemplateId;
  /** مصدر التصميم المجاني المُلهم */
  source?: string;
  /** تصنيفات تناسب هذا الثيم */
  categoryTags?: string[];
  /** كلمات مفتاحية لتوليد/اقتراح الذكاء الاصطناعي */
  keywords?: string[];
  /** نمط الثيم البصري */
  style?: 'modern' | 'minimal' | 'corporate' | 'creative' | 'elegant' | 'bold' | 'warm' | 'dark';
}

export interface WebsiteSection {
  id: string;
  type:
    | 'hero'
    | 'about'
    | 'experience'
    | 'services'
    | 'products'
    | 'categories'
    | 'gallery'
    | 'reviews'
    | 'contact'
    | 'cta'
    | 'posts'
    | 'custom';
  title?: string;
  enabled: boolean;
  order: number;
  settings?: Record<string, unknown>;
}

export interface GeneratedWebsite {
  theme: Omit<ThemePreset, 'name' | 'nameAr' | 'description' | 'descriptionAr' | 'source' | 'categoryTags' | 'keywords' | 'style'> & { sections: WebsiteSection[]; homeTemplate: HomeTemplateId; };
  pages: {
    slug: string;
    title: string;
    isHomePage: boolean;
    isVisible: boolean;
    sortOrder: number;
    content?: string | null;
  }[];
}

export interface BusinessThemeInput {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  backgroundColor?: string | null;
  surfaceColor?: string | null;
  textColor?: string | null;
  fontFamily?: string | null;
  borderRadius?: string | null;
  homeTemplate?: string | null;
}

export function getThemeStyleVars(theme?: BusinessThemeInput | null): React.CSSProperties {
  if (!theme) return {};
  return {
    '--theme-primary': theme.primaryColor || '#7c3aed',
    '--theme-secondary': theme.secondaryColor || '#ec4899',
    '--theme-accent': theme.accentColor || '#f59e0b',
    '--theme-background': theme.backgroundColor || '#ffffff',
    '--theme-surface': theme.surfaceColor || '#ffffff',
    '--theme-text': theme.textColor || '#1a1a2e',
    '--theme-font': theme.fontFamily || 'Cairo',
    '--theme-radius': theme.borderRadius || '1rem',
  } as React.CSSProperties;
}

interface BusinessLike {
  id: string;
  name: string;
  description?: string | null;
  category?: { slug: string; name: string } | null;
  subcategory?: { slug: string; name: string } | null;
}

const PRESETS: Record<string, ThemePreset> = {
  // Gateo defaults
  default: {
    presetId: 'default',
    name: 'Gateo Default',
    nameAr: 'افتراضي Gateo',
    description: 'ثيم افتراضي متوازن يناسب معظم الأنشطة التجارية.',
    descriptionAr: 'ثيم افتراضي متوازن يناسب معظم الأنشطة التجارية.',
    source: 'Gateo',
    style: 'modern',
    categoryTags: ['عام', 'خدمات', 'شركات'],
    keywords: ['default', 'general', 'business', 'services', 'company'],
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#1a1a2e',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },

  // Industry presets
  beauty: {
    presetId: 'beauty',
    name: 'Beauty & Care',
    nameAr: 'جمال وعناية',
    description: 'ألوان زهرية وناعمة مُلهم من قوالب الجمال والعناية الشخصية.',
    descriptionAr: 'ألوان زهرية وناعمة مُلهم من قوالب الجمال والعناية الشخصية.',
    source: 'BootstrapMade',
    style: 'elegant',
    categoryTags: ['تجميل', 'صالون', 'عناية', 'صحة'],
    keywords: ['beauty', 'salon', 'cosmetic', 'makeup', 'skin', 'hair', 'spa', 'nail', 'perfume', 'care'],
    primaryColor: '#d946ef',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#1a1a2e',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  medical: {
    presetId: 'medical',
    name: 'Medical & Health',
    nameAr: 'طبي وصحي',
    description: 'تصميم نظيف ومطمئن يناسب العيادات والمراكز الصحية.',
    descriptionAr: 'تصميم نظيف ومطمئن يناسب العيادات والمراكز الصحية.',
    source: 'BootstrapMade',
    style: 'corporate',
    categoryTags: ['طب', 'صحة', 'عيادة', 'استشارات'],
    keywords: ['medical', 'health', 'clinic', 'doctor', 'therapy', 'nutrition', 'laser', 'dermatology', 'dental'],
    primaryColor: '#0ea5e9',
    secondaryColor: '#14b8a6',
    accentColor: '#f97316',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  restaurant: {
    presetId: 'restaurant',
    name: 'Restaurant & Cafe',
    nameAr: 'مطعم وكافيه',
    description: 'ألوان دافئة وجذابة تُناسب المطاعم والمقاهي.',
    descriptionAr: 'ألوان دافئة وجذابة تُناسب المطاعم والمقاهي.',
    source: 'BootstrapMade',
    style: 'warm',
    categoryTags: ['مطعم', 'كافيه', 'طعام', 'مخبوزات'],
    keywords: ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'kitchen', 'bakery', 'sweets'],
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    accentColor: '#eab308',
    backgroundColor: '#fffbeb',
    surfaceColor: '#ffffff',
    textColor: '#1a1a2e',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'transparent',
  },
  tech: {
    presetId: 'tech',
    name: 'Technology',
    nameAr: 'تقنية',
    description: 'تصميم عصري داكن يناسب شركات التقنية والبرمجة.',
    descriptionAr: 'تصميم عصري داكن يناسب شركات التقنية والبرمجة.',
    source: 'Start Bootstrap',
    style: 'dark',
    categoryTags: ['تقنية', 'برمجة', 'تسويق رقمي', 'IT'],
    keywords: ['tech', 'software', 'programming', 'it', 'digital', 'web', 'app', 'cyber', 'network', 'ai'],
    primaryColor: '#6366f1',
    secondaryColor: '#06b6d4',
    accentColor: '#10b981',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f8fafc',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'minimal',
    navbarStyle: 'fixed',
  },
  fashion: {
    presetId: 'fashion',
    name: 'Fashion & Style',
    nameAr: 'أزياء وموضة',
    description: 'ثيم أنيق وبنفسجي يُبرز منتجات الأزياء والإكسسوارات.',
    descriptionAr: 'ثيم أنيق وبنفسجي يُبرز منتجات الأزياء والإكسسوارات.',
    source: 'BootstrapMade',
    style: 'elegant',
    categoryTags: ['أزياء', 'موضة', 'إكسسوارات', 'تسوق'],
    keywords: ['fashion', 'dress', 'clothing', 'abaya', 'lingerie', 'jewelry', 'bag', 'shoe', 'style'],
    primaryColor: '#ec4899',
    secondaryColor: '#a855f7',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#1a1a2e',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'outline',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },

  // Free template inspired presets
  agency: {
    presetId: 'agency',
    name: 'Agency Corporate',
    nameAr: 'وكالة إبداعية',
    description: 'تصميم احترافي بالأزرق والسيان مُلهم من قوالب الوكالات.',
    descriptionAr: 'تصميم احترافي بالأزرق والسيان مُلهم من قوالب الوكالات.',
    source: 'BootstrapMade',
    style: 'corporate',
    categoryTags: ['وكالة', 'تسويق', 'استشارات', 'خدمات'],
    keywords: ['agency', 'corporate', 'consulting', 'marketing', 'branding', 'creative agency'],
    primaryColor: '#2563eb',
    secondaryColor: '#06b6d4',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0f172a',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  startup: {
    presetId: 'startup',
    name: 'Startup Modern',
    nameAr: 'شركة ناشئة',
    description: 'تدرجات أرجوانية ووردية عصرية تُناسب الشركات الناشئة.',
    descriptionAr: 'تدرجات أرجوانية ووردية عصرية تُناسب الشركات الناشئة.',
    source: 'Start Bootstrap',
    style: 'modern',
    categoryTags: ['شركة ناشئة', 'تقنية', 'تطبيقات'],
    keywords: ['startup', 'saas', 'app', 'launch', 'modern', 'innovation'],
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    accentColor: '#f43f5e',
    backgroundColor: '#faf5ff',
    surfaceColor: '#ffffff',
    textColor: '#1e1b4b',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  portfolio: {
    presetId: 'portfolio',
    name: 'Portfolio Minimal',
    nameAr: 'معرض أعمال بسيط',
    description: 'تصميم بسيط ونظيف مُلهم من قوالب معارض الأعمال.',
    descriptionAr: 'تصميم بسيط ونظيف مُلهم من قوالب معارض الأعمال.',
    source: 'HTML5 UP',
    style: 'minimal',
    categoryTags: ['مصمم', 'فنان', 'محترف حر', 'معرض أعمال'],
    keywords: ['portfolio', 'minimal', 'designer', 'artist', 'freelancer', 'creative'],
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    accentColor: '#f59e0b',
    backgroundColor: '#f0fdfa',
    surfaceColor: '#ffffff',
    textColor: '#134e4a',
    fontFamily: 'Cairo',
    borderRadius: '0.5rem',
    buttonStyle: 'outline',
    heroLayout: 'minimal',
    navbarStyle: 'static',
  },
  creative: {
    presetId: 'creative',
    name: 'Creative Studio',
    nameAr: 'ستوديو إبداعي',
    description: 'تصميم جريء بألوان داكنة وبنفسجية للاستوديوهات الإبداعية.',
    descriptionAr: 'تصميم جريء بألوان داكنة وبنفسجية للاستوديوهات الإبداعية.',
    source: 'HTML5 UP',
    style: 'creative',
    categoryTags: ['إبداعي', 'تصميم', 'وسائط', 'فن'],
    keywords: ['creative', 'studio', 'media', 'design', 'bold', 'art'],
    primaryColor: '#7c3aed',
    secondaryColor: '#f97316',
    accentColor: '#ec4899',
    backgroundColor: '#1e1b4b',
    surfaceColor: '#312e81',
    textColor: '#f8fafc',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'transparent',
  },
  elegant: {
    presetId: 'elegant',
    name: 'Elegant Luxury',
    nameAr: 'أناقة وفخامة',
    description: 'ألوان ذهبية وزهرية تُناسب المنتجات الفاخرة والخدمات الراقية.',
    descriptionAr: 'ألوان ذهبية وزهرية تُناسب المنتجات الفاخرة والخدمات الراقية.',
    source: 'BootstrapMade',
    style: 'elegant',
    categoryTags: ['فاخر', 'مجوهرات', 'ساعات', 'خدمات راقية'],
    keywords: ['elegant', 'luxury', 'jewelry', 'watches', 'premium', 'gold', 'royal'],
    primaryColor: '#be185d',
    secondaryColor: '#d97706',
    accentColor: '#f59e0b',
    backgroundColor: '#fff1f2',
    surfaceColor: '#ffffff',
    textColor: '#4a044e',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  warm: {
    presetId: 'warm',
    name: 'Warm Creative',
    nameAr: 'دافئ وإبداعي',
    description: 'ألوان برتقالية وحمراء دافئة مُلهم من قوالب الإبداع.',
    descriptionAr: 'ألوان برتقالية وحمراء دافئة مُلهم من قوالب الإبداع.',
    source: 'Start Bootstrap',
    style: 'warm',
    categoryTags: ['إبداعي', 'تعليم', 'تدريب', 'مجتمع'],
    keywords: ['warm', 'creative', 'education', 'training', 'community', 'workshop'],
    primaryColor: '#ea580c',
    secondaryColor: '#dc2626',
    accentColor: '#fbbf24',
    backgroundColor: '#fff7ed',
    surfaceColor: '#ffffff',
    textColor: '#431407',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'solid',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  minimal: {
    presetId: 'minimal',
    name: 'Minimal Clean',
    nameAr: 'بسيط ونظيف',
    description: 'تصميم أبيض وأزرق نظيف يركّز على المحتوى.',
    descriptionAr: 'تصميم أبيض وأزرق نظيف يركّز على المحتوى.',
    source: 'HTML5 UP',
    style: 'minimal',
    categoryTags: ['عام', 'خدمات', 'استشارات', 'تقنية'],
    keywords: ['minimal', 'clean', 'simple', 'professional', 'tech', 'services'],
    primaryColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    accentColor: '#22c55e',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0f172a',
    fontFamily: 'Cairo',
    borderRadius: '0.5rem',
    buttonStyle: 'solid',
    heroLayout: 'minimal',
    navbarStyle: 'static',
  },
  navy: {
    presetId: 'navy',
    name: 'Corporate Navy',
    nameAr: 'شركاتي كحلي',
    description: 'تصميم كلاسيكي بالكحلي والسيان للشركات والمؤسسات.',
    descriptionAr: 'تصميم كلاسيكي بالكحلي والسيان للشركات والمؤسسات.',
    source: 'BootstrapMade',
    style: 'corporate',
    categoryTags: ['شركات', 'مؤسسات', 'قانون', 'مالية'],
    keywords: ['corporate', 'navy', 'institution', 'law', 'finance', 'accounting'],
    primaryColor: '#1e3a8a',
    secondaryColor: '#06b6d4',
    accentColor: '#f59e0b',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  health: {
    presetId: 'health',
    name: 'Health Wellness',
    nameAr: 'صحة ولياقة',
    description: 'ألوان خضراء ونظيفة تُناسب الصحة واللياقة البدنية.',
    descriptionAr: 'ألوان خضراء ونظيفة تُناسب الصحة واللياقة البدنية.',
    source: 'BootstrapMade',
    style: 'modern',
    categoryTags: ['صحة', 'لياقة', 'يوغا', 'تغذية'],
    keywords: ['health', 'wellness', 'fitness', 'yoga', 'nutrition', 'gym', 'sport'],
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    accentColor: '#f97316',
    backgroundColor: '#f0fdf4',
    surfaceColor: '#ffffff',
    textColor: '#064e3b',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  bistro: {
    presetId: 'bistro',
    name: 'Bistro Dark',
    nameAr: 'بistro أنيق',
    description: 'تصميم داكن وأنيق للمطاعم والمقاهي الفاخرة.',
    descriptionAr: 'تصميم داكن وأنيق للمطاعم والمقاهي الفاخرة.',
    source: 'BootstrapMade',
    style: 'elegant',
    categoryTags: ['مطعم', 'كافيه', 'فاخر', 'طعام'],
    keywords: ['bistro', 'restaurant', 'cafe', 'dark', 'elegant', 'dining', 'chef'],
    primaryColor: '#1a1a2e',
    secondaryColor: '#d4af37',
    accentColor: '#b45309',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f8fafc',
    fontFamily: 'Cairo',
    borderRadius: '0.5rem',
    buttonStyle: 'outline',
    heroLayout: 'center',
    navbarStyle: 'transparent',
  },
  education: {
    presetId: 'education',
    name: 'Education Learn',
    nameAr: 'تعليم وتدريب',
    description: 'ألوان خضراء وبرتقالية منعشة للتعليم والتدريب.',
    descriptionAr: 'ألوان خضراء وبرتقالية منعشة للتعليم والتدريب.',
    source: 'BootstrapMade',
    style: 'warm',
    categoryTags: ['تعليم', 'تدريب', 'دورات', 'أكاديمية'],
    keywords: ['education', 'learn', 'training', 'courses', 'academy', 'school', 'teaching'],
    primaryColor: '#16a34a',
    secondaryColor: '#f97316',
    accentColor: '#eab308',
    backgroundColor: '#f7fee7',
    surfaceColor: '#ffffff',
    textColor: '#14532d',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  feminine: {
    presetId: 'feminine',
    name: 'Feminine Boutique',
    nameAr: 'بوتيك نسائي',
    description: 'ثيم نسائي ناعم بالوردي والرمادي للبوتيكات والإكسسوارات.',
    descriptionAr: 'ثيم نسائي ناعم بالوردي والرمادي للبوتيكات والإكسسوارات.',
    source: 'BootstrapMade',
    style: 'elegant',
    categoryTags: ['أزياء', 'بوتيك', 'إكسسوارات', 'هدايا'],
    keywords: ['feminine', 'boutique', 'pink', 'accessories', 'gifts', 'women fashion'],
    primaryColor: '#db2777',
    secondaryColor: '#9ca3af',
    accentColor: '#f9a8d4',
    backgroundColor: '#fdf2f8',
    surfaceColor: '#ffffff',
    textColor: '#831843',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  techDark: {
    presetId: 'techDark',
    name: 'Tech Dark',
    nameAr: 'تقنية داكنة',
    description: 'تصميم داكن عصري للشركات التقنية والبرمجة.',
    descriptionAr: 'تصميم داكن عصري للشركات التقنية والبرمجة.',
    source: 'Start Bootstrap',
    style: 'dark',
    categoryTags: ['تقنية', 'برمجة', 'أمن سيبراني', 'ذكاء اصطناعي'],
    keywords: ['tech', 'dark', 'software', 'cyber', 'ai', 'coding', 'developer'],
    primaryColor: '#475569',
    secondaryColor: '#38bdf8',
    accentColor: '#34d399',
    backgroundColor: '#020617',
    surfaceColor: '#0f172a',
    textColor: '#e2e8f0',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'outline',
    heroLayout: 'minimal',
    navbarStyle: 'fixed',
  },
  event: {
    presetId: 'event',
    name: 'Event Bold',
    nameAr: 'فعاليات جريء',
    description: 'تصميم جريء بالأحمر والأسود للفعاليات والمؤتمرات.',
    descriptionAr: 'تصميم جريء بالأحمر والأسود للفعاليات والمؤتمرات.',
    source: 'BootstrapMade',
    style: 'bold',
    categoryTags: ['فعاليات', 'مؤتمرات', 'ترفيه', 'تنظيم'],
    keywords: ['event', 'bold', 'conference', 'entertainment', 'organizing', 'festival'],
    primaryColor: '#dc2626',
    secondaryColor: '#111827',
    accentColor: '#facc15',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',
    textColor: '#111827',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  construction: {
    presetId: 'construction',
    name: 'Construction Strong',
    nameAr: 'مقاولات وإنشاءات',
    description: 'تصميم قوي بالأصفر والرمادي للإنشاءات والمقاولات.',
    descriptionAr: 'تصميم قوي بالأصفر والرمادي للإنشاءات والمقاولات.',
    source: 'BootstrapMade',
    style: 'bold',
    categoryTags: ['مقاولات', 'إنشاءات', 'عقارات', 'صناعة'],
    keywords: ['construction', 'strong', 'builder', 'real estate', 'industry', 'engineering'],
    primaryColor: '#ca8a04',
    secondaryColor: '#374151',
    accentColor: '#1f2937',
    backgroundColor: '#fefce8',
    surfaceColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Cairo',
    borderRadius: '0.5rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  photography: {
    presetId: 'photography',
    name: 'Photography Art',
    nameAr: 'تصوير وفن',
    description: 'تصميم داكن يُبرز الصور والأعمال الفنية.',
    descriptionAr: 'تصميم داكن يُبرز الصور والأعمال الفنية.',
    source: 'HTML5 UP',
    style: 'dark',
    categoryTags: ['تصوير', 'فن', 'جرافيك', 'وسائط'],
    keywords: ['photography', 'art', 'gallery', 'media', 'photo', 'video', 'graphic'],
    primaryColor: '#171717',
    secondaryColor: '#525252',
    accentColor: '#e5e5e5',
    backgroundColor: '#0a0a0a',
    surfaceColor: '#171717',
    textColor: '#fafafa',
    fontFamily: 'Cairo',
    borderRadius: '0.25rem',
    buttonStyle: 'outline',
    heroLayout: 'center',
    navbarStyle: 'transparent',
  },
  travel: {
    presetId: 'travel',
    name: 'Travel Adventure',
    nameAr: 'سفر ومغامرة',
    description: 'ألوان زرقاء وبرتقالية تنبض بالحيوية للسفر والمغامرات.',
    descriptionAr: 'ألوان زرقاء وبرتقالية تنبض بالحيوية للسفر والمغامرات.',
    source: 'HTML5 UP',
    style: 'creative',
    categoryTags: ['سفر', 'سياحة', 'مغامرة', 'رحلات'],
    keywords: ['travel', 'adventure', 'tourism', 'trips', 'vacation', 'explore'],
    primaryColor: '#0284c7',
    secondaryColor: '#f97316',
    accentColor: '#facc15',
    backgroundColor: '#f0f9ff',
    surfaceColor: '#ffffff',
    textColor: '#0c4a6e',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  fitness: {
    presetId: 'fitness',
    name: 'Fitness Energy',
    nameAr: 'لياقة وطاقة',
    description: 'تصميم ديناميكي بالأخضر والأسود لصالات اللياقة والرياضة.',
    descriptionAr: 'تصميم ديناميكي بالأخضر والأسود لصالات اللياقة والرياضة.',
    source: 'BootstrapMade',
    style: 'bold',
    categoryTags: ['لياقة', 'رياضة', 'صالة', 'تغذية'],
    keywords: ['fitness', 'energy', 'gym', 'sport', 'workout', 'training', 'nutrition'],
    primaryColor: '#16a34a',
    secondaryColor: '#000000',
    accentColor: '#dcfce7',
    backgroundColor: '#ffffff',
    surfaceColor: '#f0fdf4',
    textColor: '#052e16',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  lawyer: {
    presetId: 'lawyer',
    name: 'Legal Trust',
    nameAr: 'قانون وثقة',
    description: 'تصميم كلاسيكي بالكحلي والذهبي للمكاتب القانونية.',
    descriptionAr: 'تصميم كلاسيكي بالكحلي والذهبي للمكاتب القانونية.',
    source: 'Themeforest',
    style: 'corporate',
    categoryTags: ['قانون', 'محاماة', 'استشارات', 'شركات'],
    keywords: ['lawyer', 'legal', 'law', 'trust', 'attorney', 'consulting', 'corporate'],
    primaryColor: '#1e3a8a',
    secondaryColor: '#b45309',
    accentColor: '#fbbf24',
    backgroundColor: '#f8fafc',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'Cairo',
    borderRadius: '0.5rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  realEstate: {
    presetId: 'realEstate',
    name: 'Real Estate Pro',
    nameAr: 'عقارات احترافي',
    description: 'تصميم نظيف بالأخضر والأبيض للعقارات والتطوير العقاري.',
    descriptionAr: 'تصميم نظيف بالأخضر والأبيض للعقارات والتطوير العقاري.',
    source: 'BootstrapMade',
    style: 'corporate',
    categoryTags: ['عقارات', 'تطوير عقاري', 'مقاولات', 'استثمار'],
    keywords: ['real estate', 'property', 'realtor', 'construction', 'investment', 'developer'],
    primaryColor: '#15803d',
    secondaryColor: '#0f766e',
    accentColor: '#d97706',
    backgroundColor: '#ffffff',
    surfaceColor: '#f0fdf4',
    textColor: '#14532d',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'gradient',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },
  bakery: {
    presetId: 'bakery',
    name: 'Bakery Sweet',
    nameAr: 'مخبوزات وحلويات',
    description: 'ألوان كريمية وناعمة تُناسب المخبوزات والحلويات.',
    descriptionAr: 'ألوان كريمية وناعمة تُناسب المخبوزات والحلويات.',
    source: 'Tailwind UI Components',
    style: 'warm',
    categoryTags: ['مخبوزات', 'حلويات', 'كافيه', 'طعام'],
    keywords: ['bakery', 'sweet', 'dessert', 'cake', 'pastry', 'cafe', 'coffee'],
    primaryColor: '#d97706',
    secondaryColor: '#fcd34d',
    accentColor: '#f43f5e',
    backgroundColor: '#fffbeb',
    surfaceColor: '#ffffff',
    textColor: '#451a03',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  pet: {
    presetId: 'pet',
    name: 'Pet Care',
    nameAr: 'عيادة وحيوانات أليفة',
    description: 'ألوان برتقالية وزرقاء مرحة لخدمات الحيوانات الأليفة.',
    descriptionAr: 'ألوان برتقالية وزرقاء مرحة لخدمات الحيوانات الأليفة.',
    source: 'Tailwind UI Components',
    style: 'warm',
    categoryTags: ['حيوانات', 'طب بيطري', 'عناية', 'متجر حيوانات'],
    keywords: ['pet', 'animal', 'veterinary', 'care', 'pet shop', 'grooming'],
    primaryColor: '#f97316',
    secondaryColor: '#0ea5e9',
    accentColor: '#84cc16',
    backgroundColor: '#fff7ed',
    surfaceColor: '#ffffff',
    textColor: '#7c2d12',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'solid',
    heroLayout: 'center',
    navbarStyle: 'fixed',
  },
  automotive: {
    presetId: 'automotive',
    name: 'Automotive Power',
    nameAr: 'سيارات وورش',
    description: 'تصميم قوي بالأحمر والأسود لخدمات السيارات والورش.',
    descriptionAr: 'تصميم قوي بالأحمر والأسود لخدمات السيارات والورش.',
    source: 'Themeforest',
    style: 'bold',
    categoryTags: ['سيارات', 'ورشة', 'صيانة', 'تصليح'],
    keywords: ['automotive', 'car', 'garage', 'repair', 'maintenance', 'workshop', 'auto'],
    primaryColor: '#dc2626',
    secondaryColor: '#1f2937',
    accentColor: '#facc15',
    backgroundColor: '#f9fafb',
    surfaceColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
  },

  // ThemeForest-inspired presets
  flatsome: {
    presetId: 'flatsome',
    name: 'Flatsome',
    nameAr: 'فلاتسوم',
    description: 'Modern clean ecommerce theme inspired by Flatsome with wide product cards and sidebar filters.',
    descriptionAr: 'ثيم متجر عصري ونظيف مستوحى من Flatsome، يتميز ببطاقات منتجات واسعة وتصفية جانبية.',
    source: 'ThemeForest',
    style: 'modern',
    categoryTags: ['متجر', 'تجارة', 'عام'],
    keywords: ['flatsome', 'shop', 'ecommerce', 'store', 'multipurpose', 'clean'],
    primaryColor: '#2563eb',
    secondaryColor: '#06b6d4',
    accentColor: '#f97316',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0f172a',
    fontFamily: 'Cairo',
    borderRadius: '0.75rem',
    buttonStyle: 'solid',
    heroLayout: 'center',
    navbarStyle: 'fixed',
    homeTemplate: 'flatsome',
  },
  elessi: {
    presetId: 'elessi',
    name: 'Elessi',
    nameAr: 'إليسي',
    description: 'Fashion and beauty theme inspired by Elessi with large product showcases and elegant layout.',
    descriptionAr: 'ثيم أزياء وجمال مستوحى من Elessi، بعرض منتجات كبير وتخطيط أنيق.',
    source: 'ThemeForest',
    style: 'elegant',
    categoryTags: ['أزياء', 'موضة', 'جمال', 'متجر'],
    keywords: ['elessi', 'fashion', 'beauty', 'boutique', 'clothing', 'accessories'],
    primaryColor: '#ec4899',
    secondaryColor: '#a855f7',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#fff1f2',
    textColor: '#1a1a2e',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'outline',
    heroLayout: 'split',
    navbarStyle: 'fixed',
    homeTemplate: 'elessi',
  },
  grandRestaurant: {
    presetId: 'grandRestaurant',
    name: 'Grand Restaurant',
    nameAr: 'جراند ريستورانت',
    description: 'Elegant restaurant and cafe theme inspired by Grand Restaurant with dark atmosphere and warm gold accents.',
    descriptionAr: 'ثيم مطاعم ومقاهي فاخر مستوحى من Grand Restaurant، بأجواء داكنة وألوان ذهبية دافئة.',
    source: 'ThemeForest',
    style: 'elegant',
    categoryTags: ['مطعم', 'كافيه', 'طعام', 'فاخر'],
    keywords: ['grand restaurant', 'restaurant', 'cafe', 'food', 'dining', 'menu', 'reservation'],
    primaryColor: '#1a1a2e',
    secondaryColor: '#d4af37',
    accentColor: '#b45309',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f8fafc',
    fontFamily: 'Cairo',
    borderRadius: '0.5rem',
    buttonStyle: 'outline',
    heroLayout: 'center',
    navbarStyle: 'transparent',
    homeTemplate: 'grand-restaurant',
  },
  houzez: {
    presetId: 'houzez',
    name: 'Houzez',
    nameAr: 'هوزيز',
    description: 'Professional real estate theme inspired by Houzez with advanced search and clear property cards.',
    descriptionAr: 'ثيم عقارات احترافي مستوحى من Houzez، ببحث متقدم وبطاقات عقارية واضحة.',
    source: 'ThemeForest',
    style: 'corporate',
    categoryTags: ['عقارات', 'تطوير عقاري', 'استثمار', 'خدمات'],
    keywords: ['houzez', 'real estate', 'property', 'realtor', 'apartment', 'villa', 'rent'],
    primaryColor: '#0f766e',
    secondaryColor: '#15803d',
    accentColor: '#d97706',
    backgroundColor: '#ffffff',
    surfaceColor: '#f0fdf4',
    textColor: '#14532d',
    fontFamily: 'Cairo',
    borderRadius: '1rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
    homeTemplate: 'houzez',
  },
  jacqueline: {
    presetId: 'jacqueline',
    name: 'Jacqueline',
    nameAr: 'جاكلين',
    description: 'Spa and beauty salon theme inspired by Jacqueline with soft pastel colors and relaxing services.',
    descriptionAr: 'ثيم سبا وصالونات تجميل مستوحى من Jacqueline، بألوان باستيل ناعمة وخدمات استرخاء.',
    source: 'ThemeForest',
    style: 'elegant',
    categoryTags: ['سبا', 'صالون', 'تجميل', 'عناية', 'صحة'],
    keywords: ['jacqueline', 'spa', 'salon', 'beauty', 'massage', 'wellness', 'care'],
    primaryColor: '#db2777',
    secondaryColor: '#f472b6',
    accentColor: '#84cc16',
    backgroundColor: '#fdf2f8',
    surfaceColor: '#ffffff',
    textColor: '#831843',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'gradient',
    heroLayout: 'center',
    navbarStyle: 'fixed',
    homeTemplate: 'jacqueline',
  },
  ohio: {
    presetId: 'ohio',
    name: 'Ohio',
    nameAr: 'أوهايو',
    description: 'Portfolio and creative agency theme inspired by Ohio with a minimal bold design and generous whitespace.',
    descriptionAr: 'ثيم معرض أعمال ووكالة إبداعية مستوحى من Ohio، بتصميم بسيط وجريء ومساحات بيضاء واسعة.',
    source: 'ThemeForest',
    style: 'minimal',
    categoryTags: ['وكالة', 'معرض أعمال', 'إبداعي', 'خدمات'],
    keywords: ['ohio', 'portfolio', 'agency', 'creative', 'freelancer', 'design'],
    primaryColor: '#171717',
    secondaryColor: '#525252',
    accentColor: '#e5e5e5',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0a0a0a',
    fontFamily: 'Cairo',
    borderRadius: '0.25rem',
    buttonStyle: 'solid',
    heroLayout: 'minimal',
    navbarStyle: 'static',
    homeTemplate: 'ohio',
  },
  enfoldSpa: {
    presetId: 'enfoldSpa',
    name: 'Enfold Spa',
    nameAr: 'إنفولد سبا',
    description: 'Elegant spa and wellness landing theme inspired by Enfold Spa with transparent hero, pastel colors and airy whitespace.',
    descriptionAr: 'قالب سبا وعافية أنيق مستوحى من Enfold Spa، بهيدر شفاف فوق بطل عريض وألوان باستيل ناعمة ومساحات بيضاء واسعة.',
    source: 'ThemeForest',
    style: 'elegant',
    categoryTags: ['سبا', 'صالون', 'تجميل', 'عناية', 'صحة', 'موقع تعريفي'],
    keywords: ['enfold', 'spa', 'wellness', 'salon', 'beauty', 'intro', 'elegant', 'pastel'],
    primaryColor: '#e7b8b8',
    secondaryColor: '#a5d1d6',
    accentColor: '#c59696',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#222222',
    fontFamily: 'Cairo',
    borderRadius: '1.5rem',
    buttonStyle: 'solid',
    heroLayout: 'center',
    navbarStyle: 'transparent',
    homeTemplate: 'enfold-spa',
  },
  beautySalon: {
    presetId: 'beautySalon',
    name: 'Beauty Salon',
    nameAr: 'صالون غالية',
    description: 'Luxury ladies salon and spa landing page with rose and gold accents, RTL Arabic typography and elegant sections.',
    descriptionAr: 'قالب هبوط فاخر لصالونات وسبا السيدات بألوان وردية وذهبية وتصميم عربي RTL وأقسام أنيقة.',
    source: 'Gateo',
    style: 'elegant',
    categoryTags: ['صالون', 'سبا', 'تجميل', 'عناية', 'سيدات', 'موقع تعريفي'],
    keywords: ['beauty salon', 'salon', 'spa', 'ladies', 'bridal', 'makeup', 'hair', 'nails', 'skin care'],
    primaryColor: '#b76e79',
    secondaryColor: '#c79b6b',
    accentColor: '#d9a1a8',
    backgroundColor: '#fbf7f4',
    surfaceColor: '#ffffff',
    textColor: '#2a1f24',
    fontFamily: 'Tajawal',
    borderRadius: '1.5rem',
    buttonStyle: 'solid',
    heroLayout: 'split',
    navbarStyle: 'fixed',
    homeTemplate: 'beauty-salon',
  },
};

const DEFAULT_SECTIONS: WebsiteSection[] = [
  { id: 'hero', type: 'hero', enabled: true, order: 10 },
  { id: 'about', type: 'about', enabled: true, order: 20 },
  { id: 'experience', type: 'experience', enabled: true, order: 30 },
  { id: 'services', type: 'services', enabled: true, order: 40 },
  { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
  { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
  { id: 'contact', type: 'contact', enabled: true, order: 70 },
  { id: 'cta', type: 'cta', enabled: true, order: 80 },
];

const STORE_SECTIONS: WebsiteSection[] = [
  { id: 'hero', type: 'hero', enabled: true, order: 10 },
  { id: 'categories', type: 'categories', enabled: true, order: 20, title: 'التصنيفات' },
  { id: 'products', type: 'products', enabled: true, order: 30, title: 'منتجاتنا' },
  { id: 'about', type: 'about', enabled: true, order: 40 },
  { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
  { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
  { id: 'contact', type: 'contact', enabled: true, order: 70 },
  { id: 'cta', type: 'cta', enabled: true, order: 80 },
];

function resolvePreset(business: BusinessLike): ThemePreset {
  const tokens = [
    business.category?.slug?.toLowerCase(),
    business.subcategory?.slug?.toLowerCase(),
    business.category?.name?.toLowerCase(),
    business.subcategory?.name?.toLowerCase(),
    business.name?.toLowerCase(),
  ].filter(Boolean) as string[];

  const mappings: { keywords: string[]; preset: ThemePreset }[] = [
    {
      keywords: ['beauty', 'salon', 'cosmetic', 'makeup', 'skin', 'hair', 'spa', 'nail', 'perfume', 'care'],
      preset: PRESETS.beauty,
    },
    {
      keywords: ['medical', 'health', 'clinic', 'doctor', 'therapy', 'nutrition', 'laser', 'dermatology', 'dental'],
      preset: PRESETS.medical,
    },
    {
      keywords: ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'kitchen', 'bakery', 'sweets', 'chef'],
      preset: PRESETS.restaurant,
    },
    {
      keywords: ['tech', 'software', 'programming', 'it', 'digital', 'web', 'app', 'cyber', 'network', 'ai', 'coding', 'developer'],
      preset: PRESETS.tech,
    },
    {
      keywords: ['fashion', 'dress', 'clothing', 'abaya', 'lingerie', 'jewelry', 'bag', 'shoe', 'style', 'women fashion'],
      preset: PRESETS.fashion,
    },
    {
      keywords: ['agency', 'corporate', 'consulting', 'marketing', 'branding'],
      preset: PRESETS.agency,
    },
    {
      keywords: ['startup', 'saas', 'app', 'launch', 'innovation'],
      preset: PRESETS.startup,
    },
    {
      keywords: ['portfolio', 'designer', 'artist', 'freelancer'],
      preset: PRESETS.portfolio,
    },
    {
      keywords: ['creative', 'studio', 'media', 'art'],
      preset: PRESETS.creative,
    },
    {
      keywords: ['elegant', 'luxury', 'premium', 'gold', 'royal'],
      preset: PRESETS.elegant,
    },
    {
      keywords: ['education', 'learn', 'training', 'courses', 'academy', 'school'],
      preset: PRESETS.education,
    },
    {
      keywords: ['event', 'conference', 'entertainment', 'organizing', 'festival'],
      preset: PRESETS.event,
    },
    {
      keywords: ['construction', 'builder', 'real estate', 'industry', 'engineering'],
      preset: PRESETS.construction,
    },
    {
      keywords: ['photography', 'photo', 'video', 'graphic'],
      preset: PRESETS.photography,
    },
    {
      keywords: ['travel', 'tourism', 'trips', 'vacation', 'explore'],
      preset: PRESETS.travel,
    },
    {
      keywords: ['fitness', 'gym', 'sport', 'workout', 'training'],
      preset: PRESETS.fitness,
    },
    {
      keywords: ['lawyer', 'legal', 'law', 'attorney'],
      preset: PRESETS.lawyer,
    },
    {
      keywords: ['real estate', 'property', 'realtor', 'developer'],
      preset: PRESETS.realEstate,
    },
    {
      keywords: ['bakery', 'sweet', 'dessert', 'cake', 'pastry'],
      preset: PRESETS.bakery,
    },
    {
      keywords: ['pet', 'animal', 'veterinary', 'pet shop', 'grooming'],
      preset: PRESETS.pet,
    },
    {
      keywords: ['automotive', 'car', 'garage', 'repair', 'maintenance', 'auto'],
      preset: PRESETS.automotive,
    },
    {
      keywords: ['flatsome', 'multipurpose', 'general store'],
      preset: PRESETS.flatsome,
    },
    {
      keywords: ['elessi', 'fashion store', 'beauty store'],
      preset: PRESETS.elessi,
    },
    {
      keywords: ['grand restaurant', 'fine dining', 'luxury restaurant'],
      preset: PRESETS.grandRestaurant,
    },
    {
      keywords: ['houzez', 'real estate pro', 'property listing'],
      preset: PRESETS.houzez,
    },
    {
      keywords: ['jacqueline', 'spa', 'massage', 'wellness center'],
      preset: PRESETS.jacqueline,
    },
    {
      keywords: ['ohio', 'creative agency', 'portfolio studio'],
      preset: PRESETS.ohio,
    },
  ];

  for (const token of tokens) {
    for (const mapping of mappings) {
      if (mapping.keywords.some((k) => token.includes(k))) {
        return mapping.preset;
      }
    }
  }

  return PRESETS.default;
}

export function generateThemeForBusiness(
  business: BusinessLike,
  websiteType: 'INTRO' | 'STORE' = 'INTRO'
): GeneratedWebsite {
  const preset = resolvePreset(business);

  const baseSections = websiteType === 'STORE' ? STORE_SECTIONS : DEFAULT_SECTIONS;
  const sections = baseSections.map((section) => {
    if (section.id === 'experience') {
      return {
        ...section,
        enabled: false, // يُفعّل تلقائياً إذا كان هناك خبرات
      };
    }
    return section;
  });

  const theme = {
    presetId: preset.presetId,
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    accentColor: preset.accentColor,
    backgroundColor: preset.backgroundColor,
    surfaceColor: preset.surfaceColor,
    textColor: preset.textColor,
    fontFamily: preset.fontFamily,
    borderRadius: preset.borderRadius,
    buttonStyle: preset.buttonStyle,
    heroLayout: preset.heroLayout,
    navbarStyle: preset.navbarStyle,
    homeTemplate: (preset.homeTemplate || 'default') as HomeTemplateId,
    sections,
  };

  const pages = [
    {
      slug: 'home',
      title: 'الرئيسية',
      isHomePage: true,
      isVisible: true,
      sortOrder: 0,
      content: null,
    },
    {
      slug: 'about',
      title: 'من نحن',
      isHomePage: false,
      isVisible: true,
      sortOrder: 10,
      content: business.description || '',
    },
    {
      slug: 'contact',
      title: 'تواصل معنا',
      isHomePage: false,
      isVisible: true,
      sortOrder: 20,
      content: null,
    },
  ];

  return { theme, pages };
}

export function getThemePresetList(): ThemePreset[] {
  return Object.values(PRESETS);
}

export function getThemePresetById(presetId: string): ThemePreset | undefined {
  return PRESETS[presetId];
}

export function getDefaultSections(): WebsiteSection[] {
  return DEFAULT_SECTIONS.map((s) => ({ ...s }));
}

export function getStoreDefaultSections(): WebsiteSection[] {
  return STORE_SECTIONS.map((s) => ({ ...s }));
}

export interface HomeTemplate {
  id: HomeTemplateId;
  name: string;
  nameAr: string;
  descriptionAr: string;
  previewImage?: string;
}

export function getHomeTemplateList(): HomeTemplate[] {
  return [
    {
      id: 'default',
      name: 'Default',
      nameAr: 'افتراضي Gateo',
      descriptionAr: 'التصميم الافتراضي الحالي للمتجر ببطاقات منتجات نظيفة.',
    },
    {
      id: 'porto-shop1',
      name: 'Porto Shop 1',
      nameAr: 'بوتو شوب ١',
      descriptionAr: 'قالب متجر احترافي مستوحى من Porto Shop1 مع سلايدر، عروض، تقييمات، وفوتر متعدد الأعمدة.',
    },
    {
      id: 'flatsome',
      name: 'Flatsome',
      nameAr: 'فلاتسوم',
      descriptionAr: 'قالب متجر عصري ونظيف مستوحى من Flatsome مع تصفية جانبية وبطاقات منتجات واسعة.',
    },
    {
      id: 'elessi',
      name: 'Elessi',
      nameAr: 'إليسي',
      descriptionAr: 'قالب أزياء وجمال مستوحى من Elessi بعرض منتجات كبير وتخطيط أنيق.',
    },
    {
      id: 'grand-restaurant',
      name: 'Grand Restaurant',
      nameAr: 'جراند ريستورانت',
      descriptionAr: 'قالب مطاعم فاخر مستوحى من Grand Restaurant بأجواء داكنة وقائمة طعام وحجز.',
    },
    {
      id: 'houzez',
      name: 'Houzez',
      nameAr: 'هوزيز',
      descriptionAr: 'قالب عقارات احترافي مستوحى من Houzez مع بحث وبطاقات عقارية.',
    },
    {
      id: 'jacqueline',
      name: 'Jacqueline',
      nameAr: 'جاكلين',
      descriptionAr: 'قالب سبا وصالونات تجميل مستوحى من Jacqueline بألوان باستيل وخدمات استرخاء.',
    },
    {
      id: 'ohio',
      name: 'Ohio',
      nameAr: 'أوهايو',
      descriptionAr: 'قالب معرض أعمال ووكالة إبداعية مستوحى من Ohio بتصميم بسيط وجريء.',
    },
    {
      id: 'enfold-spa',
      name: 'Enfold Spa',
      nameAr: 'إنفولد سبا',
      descriptionAr: 'قالب سبا وعافية مستوحى من Enfold Spa بهيدر شفاف فوق بطل عريض وألوان باستيل ناعمة.',
    },
    {
      id: 'beauty-salon',
      name: 'Beauty Salon',
      nameAr: 'صالون غالية',
      descriptionAr: 'قالب هبوط فاخر لصالونات وسبا السيدات بألوان وردية وذهبية وتصميم عربي RTL.',
    },
  ];
}
