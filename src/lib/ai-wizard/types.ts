import { BusinessAnalysisOutput } from '../ai/schemas/business-analysis-schema';

export type Audience =
  | 'individuals'
  | 'companies'
  | 'government'
  | 'students'
  | 'women'
  | 'men'
  | 'children'
  | 'everyone';

export type DesignPersonality =
  | 'formal'
  | 'professional'
  | 'luxury'
  | 'simple'
  | 'modern'
  | 'tech'
  | 'medical'
  | 'creative'
  | 'ultraLuxury'
  | 'youthful';

export interface VisualIdentity {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface AiWizardData {
  businessName: string;
  logo?: string;
  countryId: string;
  city: string;
  categoryId: string;
  customCategory?: string;
  description: string;
  audiences: Audience[];
  personality: DesignPersonality;
  hasVisualIdentity: boolean;
  visualIdentity?: VisualIdentity;
  language: 'ar' | 'en';
  analysis?: BusinessAnalysisOutput;
  selectedDesignId?: string;
  generatedBusinessId?: string;
  generatedSlug?: string;
}

export const AUDIENCE_OPTIONS: { id: Audience; labelAr: string; labelEn: string }[] = [
  { id: 'individuals', labelAr: 'أفراد', labelEn: 'Individuals' },
  { id: 'companies', labelAr: 'شركات', labelEn: 'Companies' },
  { id: 'government', labelAr: 'جهات حكومية', labelEn: 'Government' },
  { id: 'students', labelAr: 'طلاب', labelEn: 'Students' },
  { id: 'women', labelAr: 'سيدات', labelEn: 'Women' },
  { id: 'men', labelAr: 'رجال', labelEn: 'Men' },
  { id: 'children', labelAr: 'أطفال', labelEn: 'Children' },
  { id: 'everyone', labelAr: 'الجميع', labelEn: 'Everyone' },
];

export const PERSONALITY_OPTIONS: { id: DesignPersonality; labelAr: string; labelEn: string; descriptionAr: string }[] = [
  { id: 'formal', labelAr: 'رسمي', labelEn: 'Formal', descriptionAr: 'مناسب للمؤسسات والقطاع الحكومي' },
  { id: 'professional', labelAr: 'احترافي', labelEn: 'Professional', descriptionAr: 'موثوق وعصري للشركات والخدمات' },
  { id: 'luxury', labelAr: 'فاخر', labelEn: 'Luxury', descriptionAr: 'تفاصيل راقية وألوان غنية' },
  { id: 'simple', labelAr: 'بسيط', labelEn: 'Simple', descriptionAr: 'واضح وسهل التصفح' },
  { id: 'modern', labelAr: 'عصري', labelEn: 'Modern', descriptionAr: 'تصميم حديث مع مساحات بيضاء' },
  { id: 'tech', labelAr: 'تقني', labelEn: 'Tech', descriptionAr: 'مناسب للتقنية والبرمجة' },
  { id: 'medical', labelAr: 'طبي', labelEn: 'Medical', descriptionAr: 'نظيف ومطمئن للعيادات والصحة' },
  { id: 'creative', labelAr: 'إبداعي', labelEn: 'Creative', descriptionAr: 'جريء ومميز للاستوديوهات' },
  { id: 'ultraLuxury', labelAr: 'فاخر جداً', labelEn: 'Ultra Luxury', descriptionAr: 'فخامة عالية للعلامات الراقية' },
  { id: 'youthful', labelAr: 'شبابي', labelEn: 'Youthful', descriptionAr: 'حيوي وعصري للجمهور الشاب' },
];

export const WIZARD_STORAGE_KEY = 'gateo-ai-wizard-data';

export function getDefaultWizardData(): AiWizardData {
  return {
    businessName: '',
    countryId: '',
    city: '',
    categoryId: '',
    customCategory: '',
    description: '',
    audiences: [],
    personality: 'professional',
    hasVisualIdentity: false,
    language: 'ar',
  };
}

export function loadWizardData(): AiWizardData {
  if (typeof window === 'undefined') return getDefaultWizardData();
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return getDefaultWizardData();
    return { ...getDefaultWizardData(), ...JSON.parse(raw) };
  } catch {
    return getDefaultWizardData();
  }
}

export function saveWizardData(data: AiWizardData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data));
}

export function clearWizardData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WIZARD_STORAGE_KEY);
}
