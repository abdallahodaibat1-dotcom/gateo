import type { WebsiteSection } from './business-template-generator';

/**
 * Single source of truth for the editable content of the fashion-1 (Dress Shop)
 * storefront. These defaults mirror the original hard-coded copy so existing
 * stores (whose theme has no fashion settings yet) keep rendering identically,
 * while the builder can override any of these via `BusinessTheme.sections[].settings`.
 */
export const FASHION_ONE_DEFAULTS = {
  branding: {
    fontHeading: '',
    fontBody: '',
    logoStyle: 'script' as 'script' | 'serif' | 'sans',
    showTopBar: true,
    showLanguageCurrency: true,
  },
  hero: {
    slides: [
      {
        tag: '— مجموعة 2026 —',
        titleEm: 'Wedding Dress',
        title: 'Fashion',
        sub: 'تشكيلة حصرية من فساتين الزفاف الفاخرة، تجمع بين الأناقة الكلاسيكية واللمسات العصرية',
        cta1: 'اكتشفي التشكيلة',
        cta2: 'احجزي موعد',
        image: '',
      },
      {
        tag: '— الأكثر طلباً —',
        titleEm: 'Off Shoulder',
        title: 'Dress',
        sub: 'فساتين سهرة بكتف مكشوف، تجمع بين الجرأة والأنوثة في تصميم واحد مذهل',
        cta1: 'تسوّقي الآن',
        cta2: 'احجزي موعد',
        image: '',
      },
      {
        tag: '— لحظة العمر —',
        titleEm: 'Seize Your',
        title: 'Moment',
        sub: 'اجعلي يوم زفافكِ ذكرى لا تُنسى مع فساتين Princess المصممة خصيصاً لكِ',
        cta1: 'شاهدي التشكيلة',
        cta2: 'احجزي موعد',
        image: '',
      },
    ],
  },
  categories: {
    cards: [
      { script: 'Bridal', sans: 'SHOES', img: '', link: 'accessories' },
      { script: 'Wedding', sans: 'BOUQUETS', img: '', link: 'accessories' },
      { script: 'Bridal', sans: 'JEWELRY', img: '', link: 'accessories' },
    ],
  },
  products: {
    title: 'FEATURED',
    titleEm: 'Products',
    subtitle: 'أكثر الفساتين طلباً من عميلاتنا',
    showTabs: true,
    limit: 8,
  },
  promo: {
    tag: 'جديد',
    titleEm: 'New!',
    title: 'Accessories',
    text: 'تشكيلة 2026 من إكسسوارات العروس الفاخرة',
    cta: 'تسوّقي الآن',
    image: '',
  },
  services: {
    title: 'OUR',
    titleEm: 'Services',
    subtitle: 'خدمات المتجر',
    items: [
      { icon: 'fas fa-tshirt', title: 'الإيجار الفاخر', desc: 'خزانة فساتين فاخرة متجددة. خدمة تأجير شاملة مع التنظيف.' },
      { icon: 'fas fa-gem', title: 'البيع المباشر', desc: 'اقتني فستان أحلامك للأبد. مع ضمان الجودة والتعديل الفوري.' },
      { icon: 'fas fa-magic', title: 'التصميم حسب الطلب', desc: 'مصممتنا تترجم حلمكِ إلى واقع، من الفكرة حتى الفستان النهائي.' },
      { icon: 'fas fa-truck', title: 'التوصيل المجاني', desc: 'خدمة توصيل آمنة لكل أنحاء المدينة مع تأمين شامل.' },
    ],
  },
  about: {
    tag: '— قصتنا —',
    titlePre: 'A',
    titleEm: 'Boutique',
    titlePost: 'for the Modern Bride',
    paragraph1: 'منذ عام ٢٠١٥ ونحن نؤمن بأن كل عروس تستحق إطلالة استثنائية.',
    paragraph2: 'خبراؤنا في الموضة يرافقونكِ في كل خطوة، من اختيار الفستان حتى التعديلات الأخيرة.',
    establishedYear: '',
    image: '',
    cta: 'احجزي موعد',
    stats: [
      { num: '', lbl: 'فستان فاخر', source: 'productsCount' as const },
      { num: '', lbl: 'عروس سعيدة', source: 'manual' as const },
      { num: '', lbl: 'تقييم العميلات', source: 'avgRating' as const },
    ],
  },
  achievements: {
    enabled: true,
    items: [
      { label: 'عدد التقييمات', value: '', source: 'reviewCount' as const, icon: 'fas fa-comment-alt' },
      { label: 'التقييم', value: '', source: 'avgRating' as const, icon: 'fas fa-star' },
      { label: 'اسم النشاط', value: '', source: 'businessName' as const, icon: 'fas fa-store' },
      { label: 'سنة التأسيس', value: '', source: 'establishedYear' as const, icon: 'fas fa-calendar-alt' },
    ],
  },
  accessories: {
    title: 'BRIDAL',
    titleEm: 'Accessories',
    subtitle: 'لمسات تكمل إطلالتكِ',
    items: [
      { name: 'تيجان وطرحات', img: '/uploads/placeholder.jpg' },
      { name: 'مجوهرات العروس', img: '/uploads/placeholder.jpg' },
      { name: 'أحذية وكعب', img: '/uploads/placeholder.jpg' },
      { name: 'باقات الزهور', img: '/uploads/placeholder.jpg' },
      { name: 'حقائب وإكسسوارات', img: '/uploads/placeholder.jpg' },
      { name: 'مكملات يدوية', img: '/uploads/placeholder.jpg' },
    ],
  },
  contact: {
    bookingEnabled: true,
    tag: '— احجزي موعدكِ —',
    title: 'Book Your',
    titleEm: 'Consultation',
    description: 'جلسة استشارة شخصية مع خبيرتنا في اختيار فستان أحلامكِ. الخدمة مجانية تماماً.',
    perks: [
      'استشارة شخصية مع خبيرة الموضة',
      'تجربة حتى ٥ فساتين',
      'مشروبات وترحيب فاخر',
      'صور احترافية بعد الجلسة',
    ],
    phone: '',
    whatsapp: '',
    address: '',
    hours: '',
  },
  newsletter: {
    enabled: true,
    title: 'اشتركي في نشرتنا البريدية',
    subtitle: 'كوني أول من يعرف عن التشكيلات الجديدة والعروض الحصرية',
  },
  footer: {
    brandDescription: '',
    showSocial: true,
    showPayment: true,
    copyright: '',
    socialLinks: { facebook: '', instagram: '', tiktok: '', pinterest: '', youtube: '' },
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  },
  shop: {
    rentMultiplier: 0.2,
    productsPerPage: 9,
  },
} as const;

export type FashionOneDefaults = typeof FASHION_ONE_DEFAULTS;

/**
 * Default section list for a fashion-1 store, with the rich default content
 * baked into each section's `settings`. Used when seeding a new store's theme
 * and to backfill missing sections in the dashboard editor.
 * NOTE: the `reviews` section is intentionally left with empty settings — the
 * reviews block renders real Review data and is not builder-editable.
 */
export function getFashionOneSections(): WebsiteSection[] {
  const d = FASHION_ONE_DEFAULTS;
  return [
    { id: 'hero', type: 'hero', title: 'القسم الرئيسي', enabled: true, order: 10, settings: structuredClone(d.hero) },
    { id: 'categories', type: 'categories', title: 'التصنيفات', enabled: true, order: 20, settings: structuredClone(d.categories) },
    { id: 'products', type: 'products', title: 'المنتجات المميزة', enabled: true, order: 30, settings: structuredClone(d.products) },
    { id: 'promo', type: 'cta', title: 'بانر ترويجي', enabled: true, order: 40, settings: structuredClone(d.promo) },
    { id: 'services', type: 'services', title: 'الخدمات', enabled: true, order: 50, settings: structuredClone(d.services) },
    { id: 'about', type: 'about', title: 'من نحن', enabled: true, order: 60, settings: structuredClone(d.about) },
    { id: 'achievements', type: 'custom', title: 'الإنجازات', enabled: true, order: 65, settings: structuredClone(d.achievements) },
    { id: 'accessories', type: 'categories', title: 'الإكسسوارات', enabled: true, order: 70, settings: structuredClone(d.accessories) },
    { id: 'reviews', type: 'reviews', title: 'التقييمات', enabled: true, order: 80, settings: {} },
    { id: 'contact', type: 'contact', title: 'التواصل والحجز', enabled: true, order: 90, settings: structuredClone(d.contact) },
    { id: 'newsletter', type: 'custom', title: 'النشرة البريدية', enabled: true, order: 100, settings: structuredClone(d.newsletter) },
    { id: 'footer', type: 'custom', title: 'الفوتر والسوشيال', enabled: true, order: 110, settings: structuredClone(d.footer) },
    { id: 'branding', type: 'custom', title: 'الخطوط والهوية', enabled: true, order: 120, settings: structuredClone(d.branding) },
    { id: 'shop', type: 'custom', title: 'إعدادات المتجر', enabled: true, order: 125, settings: structuredClone(d.shop) },
    { id: 'seo', type: 'custom', title: 'تحسين محركات البحث', enabled: true, order: 130, settings: structuredClone(d.seo) },
  ];
}
