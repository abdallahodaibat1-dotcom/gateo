import { WebsiteDesign, getDesignList } from '@/lib/business-design-library';
import { BusinessAnalysisOutput } from '@/lib/ai/schemas/business-analysis-schema';

export interface DesignRecommendation {
  design: WebsiteDesign;
  score: number;
  reason: string;
  features: string[];
}

export function recommendDesigns(
  analysis: BusinessAnalysisOutput,
  websiteType: 'INTRO' | 'STORE'
): DesignRecommendation[] {
  const designs = getDesignList().filter(
    (d) => d.websiteType === websiteType || d.websiteType === 'BOTH'
  );

  const scored = designs.map((design) => {
    let score = 0;
    const reasons: string[] = [];

    const styleKeywords: Record<string, string[]> = {
      modern: ['modern', 'minimal', 'clean'],
      minimal: ['minimal', 'simple', 'clean'],
      corporate: ['professional', 'formal', 'corporate'],
      creative: ['creative', 'bold', 'youthful'],
      elegant: ['luxury', 'elegant', 'ultraLuxury', 'feminine'],
      bold: ['bold', 'youthful', 'creative'],
      warm: ['warm', 'simple', 'modern'],
      dark: ['tech', 'modern', 'creative'],
    };

    const targetStyle = analysis.designStyle.toLowerCase();
    const styleMatches = styleKeywords[design.style || 'modern'] || [];
    if (styleMatches.some((k) => targetStyle.includes(k) || k.includes(targetStyle))) {
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

    if (design.style === 'elegant' && targetStyle.includes('فاخر')) {
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

  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
