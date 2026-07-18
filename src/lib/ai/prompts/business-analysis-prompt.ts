import { AiWizardData } from '@/lib/ai-wizard/types';

export function buildBusinessAnalysisPrompt(data: AiWizardData): string {
  const categoryLabel = data.categoryId === 'other' ? data.customCategory : data.categoryId;
  const audienceLabels = data.audiences
    .map((a) => {
      const map: Record<string, string> = {
        individuals: 'أفراد',
        companies: 'شركات',
        government: 'جهات حكومية',
        students: 'طلاب',
        women: 'سيدات',
        men: 'رجال',
        children: 'أطفال',
        everyone: 'الجميع',
      };
      return map[a] || a;
    })
    .join('، ');

  const personalityMap: Record<string, string> = {
    formal: 'رسمي',
    professional: 'احترافي',
    luxury: 'فاخر',
    simple: 'بسيط',
    modern: 'عصري',
    tech: 'تقني',
    medical: 'طبي',
    creative: 'إبداعي',
    ultraLuxury: 'فاخر جداً',
    youthful: 'شبابي',
  };

  return `أنت خبير في بناء المواقع وتحليل الأنشطة التجارية. حلل المعلومات التالية وأعد توصيات مفصلة لموقع إلكتروني احترافي.

جميع النصوص يجب أن تكون بالعربية الفصحى، واضحة، وتسويقية.

معلومات النشاط:
- الاسم: ${data.businessName}
- التصنيف: ${categoryLabel || 'غير محدد'}
- المدينة: ${data.city || 'غير محددة'}
- الوصف: ${data.description}
- الجمهور المستهدف: ${audienceLabels}
- شخصية التصميم: ${personalityMap[data.personality] || data.personality}
${data.hasVisualIdentity ? `- لديه هوية بصرية: نعم` : `- لديه هوية بصرية: لا، اقترح هوية مناسبة`}

المتطلبات:
1. حدد نوع الموقع الأنسب (INTRO للتعريفي، STORE للمتجر).
2. اقترح 5-12 صفحة مناسبة مع سبب اختيار كل صفحة.
3. اقترح أقسام الصفحة الرئيسية.
4. اقترح لوحة ألوان متناسقة مع سبب الاختيار.
5. اقترح خطاً مناسباً (Cairo أو Tajawal أو Playfair_Display).
6. اقترح أسلوب الصور المناسب.
7. اقترح 3-6 خدمات أو منتجات واقعية مع أسعار تقريبية بالريال السعودي.
8. اقترح 3-6 مميزات للنشاط.
9. اكتب tagline رئيسية مقترحة ونبذة "من نحن".
10. لا تستخدم نصوصاً وهمية مثل Lorem ipsum.

أعد JSON فقط يطابق الهيكل المطلوب بدون أي شرح إضافي.`;
}
