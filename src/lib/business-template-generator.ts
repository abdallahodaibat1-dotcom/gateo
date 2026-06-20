export interface ThemePreset {
  presetId: string;
  name: string;
  nameAr: string;
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
}

export interface WebsiteSection {
  id: string;
  type:
    | 'hero'
    | 'about'
    | 'experience'
    | 'services'
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
  theme: Omit<ThemePreset, 'name' | 'nameAr'> & { sections: WebsiteSection[] };
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
  beauty: {
    presetId: 'beauty',
    name: 'Beauty & Care',
    nameAr: 'جمال وعناية',
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
  default: {
    presetId: 'default',
    name: 'Default',
    nameAr: 'افتراضي',
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
      keywords: ['beauty', 'salon', 'cosmetic', 'makeup', 'skin', 'hair', 'spa', 'nail', 'perfume'],
      preset: PRESETS.beauty,
    },
    {
      keywords: ['medical', 'health', 'clinic', 'doctor', 'therapy', 'nutrition', 'laser', 'dermatology'],
      preset: PRESETS.medical,
    },
    {
      keywords: ['restaurant', 'cafe', 'coffee', 'food', 'dining', 'kitchen', 'bakery'],
      preset: PRESETS.restaurant,
    },
    {
      keywords: ['tech', 'software', 'programming', 'it', 'digital', 'web', 'app', 'cyber', 'network'],
      preset: PRESETS.tech,
    },
    {
      keywords: ['fashion', 'dress', 'clothing', 'abaya', 'lingerie', 'jewelry', 'bag', 'shoe'],
      preset: PRESETS.fashion,
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

export function generateThemeForBusiness(business: BusinessLike): GeneratedWebsite {
  const preset = resolvePreset(business);

  const sections = DEFAULT_SECTIONS.map((section) => {
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

export function getDefaultSections(): WebsiteSection[] {
  return DEFAULT_SECTIONS.map((s) => ({ ...s }));
}
