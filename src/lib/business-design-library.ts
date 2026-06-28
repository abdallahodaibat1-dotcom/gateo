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
  store: (primary: string, secondary: string, accent: string, isDark: boolean, porto: boolean) => {
    const bg = isDark ? '#0f172a' : '#ffffff';
    const surface = isDark ? '#1e293b' : '#f8fafc';
    const text = isDark ? '#f8fafc' : '#1a1a2e';
    const heroH = porto ? 120 : 110;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${bg}"/>
      <rect x="0" y="0" width="400" height="38" fill="${primary}"/>
      <circle cx="28" cy="19" r="9" fill="white" opacity="0.9"/>
      <rect x="48" y="14" width="70" height="10" rx="2" fill="white" opacity="0.3"/>
      <rect x="280" y="14" width="100" height="10" rx="2" fill="white" opacity="0.25"/>
      ${porto
        ? `<rect x="120" y="48" width="160" height="100" rx="8" fill="url(#hero)"/>
           <rect x="20" y="48" width="88" height="236" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
           <rect x="32" y="64" width="64" height="8" rx="2" fill="${primary}" opacity="0.4"/>
           <rect x="32" y="80" width="56" height="6" rx="2" fill="${text}" opacity="0.12"/>
           <rect x="32" y="92" width="50" height="6" rx="2" fill="${text}" opacity="0.1"/>
           <rect x="32" y="108" width="58" height="6" rx="2" fill="${text}" opacity="0.1"/>`
        : `<rect x="24" y="54" width="352" height="${heroH}" rx="12" fill="url(#hero)"/>`
      }
      <defs>
        <linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primary}"/>
          <stop offset="100%" style="stop-color:${secondary}"/>
        </linearGradient>
      </defs>
      ${!porto ? `<rect x="48" y="88" width="140" height="18" rx="4" fill="white" opacity="0.9"/><rect x="48" y="116" width="100" height="10" rx="3" fill="white" opacity="0.6"/>` : ''}
      <g transform="translate(${porto ? 120 : 24}, ${porto ? 160 : 178})">
        <rect x="0" y="0" width="96" height="110" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
        <rect x="8" y="8" width="80" height="56" rx="6" fill="${secondary}" opacity="0.2"/>
        <rect x="8" y="72" width="60" height="8" rx="2" fill="${text}" opacity="0.15"/>
        <rect x="8" y="84" width="40" height="8" rx="2" fill="${primary}" opacity="0.6"/>
        <rect x="8" y="96" width="80" height="10" rx="3" fill="${accent}"/>
        <rect x="112" y="0" width="96" height="110" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
        <rect x="120" y="8" width="80" height="56" rx="6" fill="${primary}" opacity="0.2"/>
        <rect x="120" y="72" width="60" height="8" rx="2" fill="${text}" opacity="0.15"/>
        <rect x="120" y="84" width="40" height="8" rx="2" fill="${primary}" opacity="0.6"/>
        <rect x="120" y="96" width="80" height="10" rx="3" fill="${accent}"/>
        <rect x="224" y="0" width="96" height="110" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
        <rect x="232" y="8" width="80" height="56" rx="6" fill="${accent}" opacity="0.2"/>
        <rect x="232" y="72" width="60" height="8" rx="2" fill="${text}" opacity="0.15"/>
        <rect x="232" y="84" width="40" height="8" rx="2" fill="${primary}" opacity="0.6"/>
        <rect x="232" y="96" width="80" height="10" rx="3" fill="${accent}"/>
      </g>
    </svg>`;
    return `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg)}`;
  },
};

function introPreview(primary: string, secondary: string, accent: string, isDark = false): string {
  return PREVIEW_SVGS.intro(primary, secondary, accent, isDark);
}

function storePreview(primary: string, secondary: string, accent: string, isDark = false, porto = false): string {
  return PREVIEW_SVGS.store(primary, secondary, accent, isDark, porto);
}

function storePreviewForTemplate(
  template: HomeTemplateId,
  primary: string,
  secondary: string,
  accent: string,
  isDark = false
): string {
  const bg = isDark ? '#0f172a' : '#ffffff';
  const surface = isDark ? '#1e293b' : '#f8fafc';
  const text = isDark ? '#f8fafc' : '#1a1a2e';
  const defs = `<defs><linearGradient id="hero" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs>`;

  let content = '';
  switch (template) {
    case 'flatsome':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <rect x="0" y="0" width="400" height="36" fill="${surface}"/>
        <circle cx="28" cy="18" r="9" fill="${primary}"/>
        <rect x="220" y="12" width="100" height="12" rx="3" fill="${text}" opacity="0.1"/>
        <rect x="340" y="10" width="44" height="16" rx="4" fill="${primary}"/>
        <rect x="16" y="48" width="88" height="236" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
        <rect x="28" y="64" width="64" height="8" rx="2" fill="${primary}" opacity="0.4"/>
        <rect x="28" y="84" width="56" height="6" rx="2" fill="${text}" opacity="0.12"/>
        <rect x="28" y="100" width="58" height="6" rx="2" fill="${text}" opacity="0.1"/>
        <rect x="120" y="48" width="264" height="110" rx="8" fill="url(#hero)"/>
        <rect x="140" y="90" width="140" height="16" rx="3" fill="white" opacity="0.9"/>
        <rect x="140" y="114" width="90" height="10" rx="2" fill="white" opacity="0.7"/>
        <g transform="translate(120, 172)">
          <rect x="0" y="0" width="76" height="100" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="6" y="6" width="64" height="50" rx="4" fill="${secondary}" opacity="0.2"/>
          <rect x="6" y="64" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="6" y="76" width="36" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="100" y="0" width="76" height="100" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="106" y="6" width="64" height="50" rx="4" fill="${primary}" opacity="0.2"/>
          <rect x="106" y="64" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="106" y="76" width="36" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="200" y="0" width="76" height="100" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="206" y="6" width="64" height="50" rx="4" fill="${accent}" opacity="0.2"/>
          <rect x="206" y="64" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="206" y="76" width="36" height="8" rx="2" fill="${primary}" opacity="0.7"/>
        </g>`;
      break;
    case 'elessi':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <rect x="0" y="0" width="400" height="36" fill="${bg}" stroke="${text}" stroke-opacity="0.06"/>
        <circle cx="28" cy="18" r="9" fill="${primary}"/>
        <rect x="300" y="12" width="70" height="12" rx="3" fill="${text}" opacity="0.1"/>
        <rect x="16" y="52" width="180" height="140" rx="12" fill="url(#hero)"/>
        <rect x="216" y="80" width="160" height="18" rx="3" fill="${text}" opacity="0.9"/>
        <rect x="216" y="108" width="120" height="10" rx="2" fill="${text}" opacity="0.5"/>
        <rect x="216" y="134" width="90" height="28" rx="8" fill="${primary}"/>
        <g transform="translate(16, 208)">
          <rect x="0" y="0" width="84" height="76" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="6" y="6" width="72" height="38" rx="4" fill="${secondary}" opacity="0.2"/>
          <rect x="6" y="50" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="6" y="60" width="40" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="104" y="0" width="84" height="76" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="110" y="6" width="72" height="38" rx="4" fill="${primary}" opacity="0.2"/>
          <rect x="110" y="50" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="110" y="60" width="40" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="208" y="0" width="84" height="76" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="214" y="6" width="72" height="38" rx="4" fill="${accent}" opacity="0.2"/>
          <rect x="214" y="50" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="214" y="60" width="40" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="312" y="0" width="84" height="76" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="318" y="6" width="72" height="38" rx="4" fill="${secondary}" opacity="0.2"/>
          <rect x="318" y="50" width="50" height="6" rx="2" fill="${text}" opacity="0.12"/>
          <rect x="318" y="60" width="40" height="8" rx="2" fill="${primary}" opacity="0.7"/>
        </g>`;
      break;
    case 'grand-restaurant':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <rect x="0" y="0" width="400" height="150" rx="0" fill="url(#hero)" opacity="0.9"/>
        <rect x="24" y="48" width="180" height="18" rx="3" fill="white" opacity="0.95"/>
        <rect x="24" y="76" width="120" height="10" rx="2" fill="white" opacity="0.8"/>
        <rect x="24" y="98" width="90" height="26" rx="6" fill="${accent}" stroke="white" stroke-width="1"/>
        <rect x="16" y="170" width="120" height="8" rx="2" fill="${secondary}" opacity="0.8"/>
        <g transform="translate(16, 190)">
          <rect x="0" y="0" width="368" height="24" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="8" y="6" width="20" height="12" rx="2" fill="${accent}"/>
          <rect x="40" y="7" width="100" height="10" rx="2" fill="${text}" opacity="0.8"/>
          <rect x="320" y="7" width="40" height="10" rx="2" fill="${secondary}" opacity="0.9"/>
          <rect x="0" y="32" width="368" height="24" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="8" y="38" width="20" height="12" rx="2" fill="${accent}"/>
          <rect x="40" y="39" width="120" height="10" rx="2" fill="${text}" opacity="0.8"/>
          <rect x="320" y="39" width="40" height="10" rx="2" fill="${secondary}" opacity="0.9"/>
          <rect x="0" y="64" width="368" height="24" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="8" y="70" width="20" height="12" rx="2" fill="${accent}"/>
          <rect x="40" y="71" width="110" height="10" rx="2" fill="${text}" opacity="0.8"/>
          <rect x="320" y="71" width="40" height="10" rx="2" fill="${secondary}" opacity="0.9"/>
        </g>`;
      break;
    case 'houzez':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <rect x="0" y="0" width="400" height="140" rx="0" fill="url(#hero)"/>
        <rect x="32" y="34" width="240" height="16" rx="3" fill="white" opacity="0.95"/>
        <rect x="32" y="58" width="160" height="10" rx="2" fill="white" opacity="0.8"/>
        <rect x="32" y="88" width="336" height="34" rx="6" fill="white" opacity="0.95"/>
        <rect x="44" y="98" width="80" height="14" rx="3" fill="${text}" opacity="0.1"/>
        <rect x="140" y="98" width="80" height="14" rx="3" fill="${text}" opacity="0.1"/>
        <rect x="236" y="98" width="80" height="14" rx="3" fill="${text}" opacity="0.1"/>
        <rect x="332" y="94" width="24" height="22" rx="4" fill="${primary}"/>
        <g transform="translate(16, 160)">
          <rect x="0" y="0" width="180" height="120" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="0" y="0" width="180" height="72" rx="8" fill="${secondary}" opacity="0.2"/>
          <rect x="8" y="82" width="100" height="8" rx="2" fill="${text}" opacity="0.8"/>
          <rect x="8" y="96" width="60" height="6" rx="2" fill="${text}" opacity="0.4"/>
          <rect x="8" y="108" width="80" height="8" rx="2" fill="${primary}" opacity="0.8"/>
          <rect x="204" y="0" width="180" height="120" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="204" y="0" width="180" height="72" rx="8" fill="${primary}" opacity="0.2"/>
          <rect x="212" y="82" width="100" height="8" rx="2" fill="${text}" opacity="0.8"/>
          <rect x="212" y="96" width="60" height="6" rx="2" fill="${text}" opacity="0.4"/>
          <rect x="212" y="108" width="80" height="8" rx="2" fill="${primary}" opacity="0.8"/>
        </g>`;
      break;
    case 'jacqueline':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <circle cx="200" cy="70" r="36" fill="${primary}" opacity="0.15"/>
        <circle cx="200" cy="70" r="24" fill="${primary}" opacity="0.25"/>
        <rect x="90" y="118" width="220" height="16" rx="3" fill="${text}" opacity="0.9"/>
        <rect x="120" y="142" width="160" height="10" rx="2" fill="${text}" opacity="0.5"/>
        <rect x="156" y="166" width="88" height="28" rx="14" fill="${primary}"/>
        <g transform="translate(32, 220)">
          <rect x="0" y="0" width="100" height="60" rx="12" fill="${surface}" stroke="${primary}" stroke-opacity="0.2"/>
          <rect x="20" y="12" width="60" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="20" y="28" width="50" height="6" rx="2" fill="${text}" opacity="0.4"/>
          <rect x="140" y="0" width="100" height="60" rx="12" fill="${surface}" stroke="${primary}" stroke-opacity="0.2"/>
          <rect x="160" y="12" width="60" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="160" y="28" width="50" height="6" rx="2" fill="${text}" opacity="0.4"/>
          <rect x="280" y="0" width="100" height="60" rx="12" fill="${surface}" stroke="${primary}" stroke-opacity="0.2"/>
          <rect x="300" y="12" width="60" height="8" rx="2" fill="${primary}" opacity="0.7"/>
          <rect x="300" y="28" width="50" height="6" rx="2" fill="${text}" opacity="0.4"/>
        </g>`;
      break;
    case 'ohio':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <rect x="0" y="0" width="400" height="36" fill="${bg}" stroke="${text}" stroke-opacity="0.06"/>
        <circle cx="28" cy="18" r="8" fill="${primary}"/>
        <rect x="300" y="12" width="70" height="12" rx="2" fill="${text}" opacity="0.1"/>
        <rect x="24" y="64" width="220" height="18" rx="2" fill="${text}" opacity="0.95"/>
        <rect x="24" y="92" width="160" height="10" rx="2" fill="${text}" opacity="0.5"/>
        <rect x="24" y="116" width="90" height="28" rx="4" fill="${primary}"/>
        <g transform="translate(24, 168)">
          <rect x="0" y="0" width="164" height="110" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="0" y="0" width="164" height="80" rx="4" fill="${secondary}" opacity="0.15"/>
          <rect x="188" y="0" width="164" height="110" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="188" y="0" width="164" height="80" rx="4" fill="${primary}" opacity="0.15"/>
          <rect x="0" y="150" width="164" height="110" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="0" y="150" width="164" height="80" rx="4" fill="${accent}" opacity="0.15"/>
          <rect x="188" y="150" width="164" height="110" rx="4" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <rect x="188" y="150" width="164" height="80" rx="4" fill="${secondary}" opacity="0.15"/>
        </g>`;
      break;
    case 'beauty-salon':
      content = `
        <rect width="400" height="300" fill="${bg}"/>
        <rect x="0" y="0" width="400" height="140" rx="0" fill="url(#hero)" opacity="0.9"/>
        <rect x="24" y="40" width="180" height="16" rx="3" fill="white" opacity="0.95"/>
        <rect x="24" y="64" width="120" height="10" rx="2" fill="white" opacity="0.8"/>
        <rect x="24" y="86" width="90" height="26" rx="13" fill="${accent}" stroke="white" stroke-width="1"/>
        <g transform="translate(16, 160)">
          <rect x="0" y="0" width="110" height="120" rx="12" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <circle cx="55" cy="40" r="24" fill="${secondary}" opacity="0.25"/>
          <rect x="25" y="76" width="60" height="8" rx="2" fill="${text}" opacity="0.15"/>
          <rect x="30" y="90" width="50" height="8" rx="2" fill="${primary}" opacity="0.6"/>
          <rect x="128" y="0" width="110" height="120" rx="12" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <circle cx="183" cy="40" r="24" fill="${primary}" opacity="0.2"/>
          <rect x="153" y="76" width="60" height="8" rx="2" fill="${text}" opacity="0.15"/>
          <rect x="158" y="90" width="50" height="8" rx="2" fill="${primary}" opacity="0.6"/>
          <rect x="256" y="0" width="110" height="120" rx="12" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>
          <circle cx="311" cy="40" r="24" fill="${accent}" opacity="0.2"/>
          <rect x="281" y="76" width="60" height="8" rx="2" fill="${text}" opacity="0.15"/>
          <rect x="286" y="90" width="50" height="8" rx="2" fill="${primary}" opacity="0.6"/>
        </g>`;
      break;
    default:
      content = `<rect width="400" height="300" fill="${bg}"/><rect x="24" y="48" width="352" height="120" rx="12" fill="url(#hero)"/><rect x="24" y="184" width="352" height="80" rx="8" fill="${surface}" stroke="${text}" stroke-opacity="0.08"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${defs}${content}</svg>`;
  return `data:image/svg+xml;base64,${typeof Buffer !== 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg)}`;
}

const DESIGNS: WebsiteDesign[] = [
  // Intro designs
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
    designId: 'intro-beauty',
    name: 'Beauty & Care',
    nameAr: 'جمال وعناية',
    descriptionAr: 'ألوان زهرية وناعمة مثالية لصالونات التجميل والعناية.',
    websiteType: 'INTRO',
    categoryTags: ['تجميل', 'صالون', 'عناية', 'صحة'],
    style: 'elegant',
    source: 'BootstrapMade',
    presetId: 'beauty',
    homeTemplate: 'default',
    previewImage: introPreview('#d946ef', '#8b5cf6', '#f59e0b'),
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
    designId: 'intro-feminine',
    name: 'Feminine',
    nameAr: 'نسائي',
    descriptionAr: 'تصميم ناعم ووردي للمنتجات والخدمات النسائية.',
    websiteType: 'INTRO',
    categoryTags: ['نسائي', 'موضة', 'تجميل', 'هدايا'],
    style: 'elegant',
    source: 'Gateo',
    presetId: 'feminine',
    homeTemplate: 'default',
    previewImage: introPreview('#f472b6', '#db2777', '#fbbf24'),
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
  {
    designId: 'intro-enfold-spa',
    name: 'Enfold Spa',
    nameAr: 'إنفولد سبا',
    descriptionAr: 'قالب سبا وعافية أنيق مستوحى من Enfold Spa، بهيدر شفاف فوق بطل عريض وألوان باستيل ناعمة ومساحات بيضاء واسعة.',
    websiteType: 'INTRO',
    categoryTags: ['سبا', 'صالون', 'تجميل', 'عناية', 'صحة', 'موقع تعريفي'],
    style: 'elegant',
    source: 'ThemeForest',
    presetId: 'enfoldSpa',
    homeTemplate: 'enfold-spa',
    previewImage: introPreview('#e7b8b8', '#a5d1d6', '#c59696'),
  },

  // Store designs
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
    previewImage: storePreview('#7c3aed', '#ec4899', '#f59e0b'),
  },
  {
    designId: 'store-porto-shop1',
    name: 'Porto Shop 1',
    nameAr: 'بوتو شوب ١',
    descriptionAr: 'قالب متجر احترافي مستوحى من Porto Shop1 مع سلايدر وعروض.',
    websiteType: 'STORE',
    categoryTags: ['متاجر', 'أزياء', 'موضة', 'إكسسوارات'],
    style: 'modern',
    source: 'Porto',
    presetId: 'fashion',
    homeTemplate: 'porto-shop1',
    previewImage: storePreview('#ec4899', '#a855f7', '#f59e0b', false, true),
  },
  {
    designId: 'store-elegant',
    name: 'Store Elegant',
    nameAr: 'متجر أنيق',
    descriptionAr: 'تصميم فاخر للمتاجر الراقية والمنتجات الفاخرة.',
    websiteType: 'STORE',
    categoryTags: ['متاجر', 'فاخر', 'مجوهرات', 'ساعات'],
    style: 'elegant',
    source: 'BootstrapMade',
    presetId: 'elegant',
    homeTemplate: 'default',
    previewImage: storePreview('#be185d', '#d97706', '#f59e0b'),
  },
  {
    designId: 'store-tech',
    name: 'Store Tech',
    nameAr: 'متجر تقني',
    descriptionAr: 'تصميم عصري داكن لمتاجر الإلكترونيات والتقنية.',
    websiteType: 'STORE',
    categoryTags: ['تقنية', 'إلكترونيات', 'متاجر'],
    style: 'dark',
    source: 'Start Bootstrap',
    presetId: 'tech',
    homeTemplate: 'default',
    previewImage: storePreview('#6366f1', '#06b6d4', '#10b981', true),
  },
  {
    designId: 'store-warm',
    name: 'Store Warm',
    nameAr: 'متجر دافئ',
    descriptionAr: 'ألوان دافئة مناسبة للمتاجر العامة والهدايا.',
    websiteType: 'STORE',
    categoryTags: ['متاجر', 'هدايا', 'ديكور', 'منزل'],
    style: 'warm',
    source: 'Start Bootstrap',
    presetId: 'warm',
    homeTemplate: 'default',
    previewImage: storePreview('#ea580c', '#dc2626', '#fbbf24'),
  },
  {
    designId: 'store-minimal',
    name: 'Store Minimal',
    nameAr: 'متجر بسيط',
    descriptionAr: 'تصميم بسيط ومركّز على المنتجات.',
    websiteType: 'STORE',
    categoryTags: ['متاجر', 'بسيط', 'عام'],
    style: 'minimal',
    source: 'HTML5 UP',
    presetId: 'minimal',
    homeTemplate: 'default',
    previewImage: storePreview('#3b82f6', '#60a5fa', '#22c55e'),
  },

  // ThemeForest-inspired design kits
  {
    designId: 'flatsome',
    name: 'Flatsome',
    nameAr: 'فلاتسوم',
    descriptionAr: 'قالب متجر عصري ونظيف مستوحى من Flatsome مع تصفية جانبية وبطاقات منتجات واسعة.',
    websiteType: 'BOTH',
    categoryTags: ['متجر', 'تجارة', 'عام', 'أزياء'],
    style: 'modern',
    source: 'ThemeForest',
    presetId: 'flatsome',
    homeTemplate: 'flatsome',
    previewImage: storePreviewForTemplate('flatsome', '#2563eb', '#06b6d4', '#f97316'),
  },
  {
    designId: 'elessi',
    name: 'Elessi',
    nameAr: 'إليسي',
    descriptionAr: 'قالب أزياء وجمال مستوحى من Elessi بعرض منتجات كبير وتخطيط أنيق.',
    websiteType: 'BOTH',
    categoryTags: ['أزياء', 'موضة', 'جمال', 'متجر'],
    style: 'elegant',
    source: 'ThemeForest',
    presetId: 'elessi',
    homeTemplate: 'elessi',
    previewImage: storePreviewForTemplate('elessi', '#ec4899', '#a855f7', '#f59e0b'),
  },
  {
    designId: 'grand-restaurant',
    name: 'Grand Restaurant',
    nameAr: 'جراند ريستورانت',
    descriptionAr: 'قالب مطاعم ومقاهي فاخر مستوحى من Grand Restaurant بأجواء داكنة وقائمة طعام.',
    websiteType: 'BOTH',
    categoryTags: ['مطعم', 'كافيه', 'طعام', 'فاخر'],
    style: 'elegant',
    source: 'ThemeForest',
    presetId: 'grandRestaurant',
    homeTemplate: 'grand-restaurant',
    previewImage: storePreviewForTemplate('grand-restaurant', '#1a1a2e', '#d4af37', '#b45309', true),
  },
  {
    designId: 'houzez',
    name: 'Houzez',
    nameAr: 'هوزيز',
    descriptionAr: 'قالب عقارات احترافي مستوحى من Houzez مع بحث متقدم وبطاقات عقارية واضحة.',
    websiteType: 'BOTH',
    categoryTags: ['عقارات', 'تطوير عقاري', 'استثمار', 'خدمات'],
    style: 'corporate',
    source: 'ThemeForest',
    presetId: 'houzez',
    homeTemplate: 'houzez',
    previewImage: storePreviewForTemplate('houzez', '#0f766e', '#15803d', '#d97706'),
  },
  {
    designId: 'jacqueline',
    name: 'Jacqueline',
    nameAr: 'جاكلين',
    descriptionAr: 'قالب سبا وصالونات تجميل مستوحى من Jacqueline بألوان باستيل ناعمة وخدمات استرخاء.',
    websiteType: 'BOTH',
    categoryTags: ['سبا', 'صالون', 'تجميل', 'عناية', 'صحة'],
    style: 'elegant',
    source: 'ThemeForest',
    presetId: 'jacqueline',
    homeTemplate: 'jacqueline',
    previewImage: storePreviewForTemplate('jacqueline', '#db2777', '#f472b6', '#84cc16'),
  },
  {
    designId: 'ohio',
    name: 'Ohio',
    nameAr: 'أوهايو',
    descriptionAr: 'قالب معرض أعمال ووكالة إبداعية مستوحى من Ohio بتصميم بسيط وجريء ومساحات بيضاء واسعة.',
    websiteType: 'BOTH',
    categoryTags: ['وكالة', 'معرض أعمال', 'إبداعي', 'خدمات'],
    style: 'minimal',
    source: 'ThemeForest',
    presetId: 'ohio',
    homeTemplate: 'ohio',
    previewImage: storePreviewForTemplate('ohio', '#171717', '#525252', '#e5e5e5'),
  },
  {
    designId: 'beauty-salon',
    name: 'Beauty Salon',
    nameAr: 'صالون غالية',
    descriptionAr: 'قالب هبوط فاخر لصالونات وسبا السيدات بألوان وردية وذهبية وتصميم عربي RTL.',
    websiteType: 'BOTH',
    categoryTags: ['صالون', 'سبا', 'تجميل', 'عناية', 'سيدات'],
    style: 'elegant',
    source: 'Gateo',
    presetId: 'beautySalon',
    homeTemplate: 'beauty-salon',
    previewImage: storePreviewForTemplate('beauty-salon', '#b76e79', '#c79b6b', '#d9a1a8'),
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
  return websiteType === 'STORE' ? 'store-default' : 'intro-default';
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
