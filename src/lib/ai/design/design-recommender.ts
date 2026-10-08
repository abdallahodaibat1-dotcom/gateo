import { DesignStyle, WebsiteDesign, getDesignList } from '@/lib/business-design-library';
import { BusinessAnalysisOutput } from '@/lib/ai/schemas/business-analysis-schema';

export interface DesignRecommendation {
  design: WebsiteDesign;
  score: number;
  reason: string;
  features: string[];
}

/** كلمات مفتاحية (عربية وإنجليزية) لكل نمط تصميم لتحليل نمط التصميم المقترح */
const STYLE_KEYWORDS: Record<DesignStyle, string[]> = {
  modern: ['عصري', 'حديث', 'modern'],
  minimal: ['بسيط', 'نظيف', 'minimal', 'clean', 'simple'],
  corporate: ['احترافي', 'رسمي', 'شركات', 'مؤسسي', 'corporate', 'professional', 'formal'],
  creative: ['إبداعي', 'ابداعي', 'creative'],
  elegant: ['فاخر', 'أنيق', 'انيق', 'راقي', 'elegant', 'luxury', 'ultraLuxury'],
  bold: ['جريء', 'شبابي', 'bold', 'youthful'],
  warm: ['دافئ', 'warm'],
  dark: ['داكن', 'تقني', 'dark', 'tech'],
};

/** تحويل نمط التصميم المقترح (نص حر عربي) إلى نمط معروف من المكتبة */
function resolveTargetStyle(designStyle: string): DesignStyle | null {
  const target = designStyle.toLowerCase();
  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    if (keywords.some((k) => target.includes(k))) {
      return style as DesignStyle;
    }
  }
  return null;
}

export function recommendDesigns(
  analysis: BusinessAnalysisOutput,
  websiteType: 'INTRO' | 'STORE'
): DesignRecommendation[] {
  const designs = getDesignList().filter(
    (d) => d.websiteType === websiteType || d.websiteType === 'BOTH'
  );

  const targetStyle = resolveTargetStyle(analysis.designStyle);

  const scored = designs.map((design) => {
    let score = 0;
    const reasons: string[] = [];

    if (targetStyle && design.style === targetStyle) {
      score += 25;
      reasons.push('يتناسب مع أسلوب التصميم المطلوب');
    }

    const categoryLabel = analysis.businessType.toLowerCase();
    const categoryMatch = design.categoryTags.some(
      (tag) =>
        categoryLabel.includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(categoryLabel)
    );
    if (categoryMatch) {
      score += 30;
      reasons.push('مناسب لتصنيف النشاط');
    }

    if (design.websiteType === websiteType) {
      score += 20;
      reasons.push('مصمم لنوع الموقع المختار');
    }

    if (design.homeTemplate !== 'default') {
      score += 10;
      reasons.push('قالب صفحة رئيسية متكامل');
    }

    if (design.style === 'elegant' && targetStyle === 'elegant') {
      score += 15;
      reasons.push('ألوان تتناسب مع الطابع الفاخر');
    }

    const features = [
      'تصميم متجاوب مع الجوال',
      design.homeTemplate !== 'default' ? 'قالب صفحة رئيسية جاهز' : 'تخطيط مرن قابل للتخصيص',
      'ألوان متناسقة',
      'خطوط عربية واضحة',
    ];

    return {
      design,
      score,
      reason: reasons[0] || 'تصميم عام مناسب',
      features,
    };
  });

  const byScore = (a: DesignRecommendation, b: DesignRecommendation) => b.score - a.score;

  // تصاميم النمط المقترح أولاً، ثم تُكمل القائمة بأفضل التصاميم المتبقية إن لزم
  if (targetStyle) {
    const matching = scored.filter((s) => s.design.style === targetStyle).sort(byScore);
    if (matching.length > 0) {
      const rest = scored.filter((s) => s.design.style !== targetStyle).sort(byScore);
      return [...matching, ...rest].slice(0, 3);
    }
  }

  return scored.sort(byScore).slice(0, 3);
}
