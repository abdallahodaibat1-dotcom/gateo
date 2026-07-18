import { generateSite } from '../src/lib/ai/generation/site-generator';

const USER_ID = 'cmr5g61oe00ae7vhzlb3famwb';

async function main() {
  const result = await generateSite({
    userId: USER_ID,
    input: {
      businessName: 'بوتيك آيات الخالدي',
      categoryId: 'cmq6xg29n00027vthnqgdvqka',
      categoryName: 'أزياء وفساتين',
      categoryNameEn: 'fashion-dresses',
      city: 'المفرق',
      country: 'الأردن',
      language: 'ar',
      description:
        'بوتيك آيات الخالدي في المفرق وجهة مميزة لفساتين الزفاف والسهرة. العنوان: المفرق، مقابل مديرية الدفاع المدني، بجانب مياه رسيل. أبرز المنتجات: تشكيلة واسعة وفاخرة من فساتين السهرة وبدلات العروس للإيجار والبيع. رقم التواصل: 0782397072. حساب إنستغرام: ayat_alkhaldi911.',
      brandStyle: 'luxury',
      websiteType: 'STORE',
      referenceUrls: [
        'https://web.facebook.com/p/Ayat-Alkhaldi-Boutique-61586712734082/',
      ],
      userImages: [],
      allowReferenceExtraction: true,
      allowAiImageGeneration: false,
    },
  });

  console.log('Generated site:', JSON.stringify(result, null, 2));
}

main().catch((e: any) => {
  console.error(e);
  process.exit(1);
});
