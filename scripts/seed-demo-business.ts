import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Business identifier
const BUSINESS_SLUG = 'rt-lg-health-1';

// Local images downloaded to public/uploads/demo-spa to avoid remote image optimizer issues
const IMAGES = {
  logo: '/uploads/demo-spa/logo.jpg',
  cover: '/uploads/demo-spa/cover.jpg',
  gallery: Array.from({ length: 8 }, (_, i) => `/uploads/demo-spa/gallery/${i + 1}.jpg`),
};

const productImages: Record<string, string[]> = {
  'العناية بالبشرة': [
    '/uploads/demo-spa/products/skincare-1.jpg',
    '/uploads/demo-spa/products/skincare-2.jpg',
  ],
  'جلسات التدليك والاسترخاء': [
    '/uploads/demo-spa/products/massage-1.jpg',
    '/uploads/demo-spa/products/massage-2.jpg',
  ],
  'العناية بالشعر': [
    '/uploads/demo-spa/products/hair-1.jpg',
    '/uploads/demo-spa/products/hair-2.jpg',
  ],
  'الباقات المميزة': [
    '/uploads/demo-spa/products/package-1.jpg',
    '/uploads/demo-spa/products/package-2.jpg',
  ],
};

const productsData = [
  // العناية بالبشرة
  {
    name: 'جلسة تنظيف بشرة عميق',
    description: 'تنظيف عميق للمسام مع تقشير خفيف وترطيب مكثف لبشرة نضرة ومشرقة.',
    price: 320,
    comparePrice: 450,
    category: 'العناية بالبشرة',
    quantity: 50,
  },
  {
    name: 'جلسة فيشل الذهبي',
    description: 'علاج متكامل يشمل التنظيف، التقشير، الترطيب، والماسك الذهبي لتجديد الخلايا.',
    price: 580,
    comparePrice: 750,
    category: 'العناية بالبشرة',
    quantity: 30,
  },
  {
    name: 'حقن البلازما للوجه',
    description: 'جلسة بلازما غنية بالصفائح الدموية لتحفيز الكولاجين وتجديد نضارة البشرة.',
    price: 950,
    comparePrice: 1200,
    category: 'العناية بالبشرة',
    quantity: 20,
  },
  // جلسات التدليك
  {
    name: 'مساج استرخاء كامل 60 دقيقة',
    description: 'جلسة مساج سويدي لاسترخاء العضلات وتنشيط الدورة الدموية بزيوت عطرية طبيعية.',
    price: 380,
    comparePrice: 480,
    category: 'جلسات التدليك والاسترخاء',
    quantity: 40,
  },
  {
    name: 'مساج حجر ساخن 90 دقيقة',
    description: 'علاج بالأحجار البركانية الساخنة لإذابة التوتر واستعادة توازن الجسم.',
    price: 550,
    comparePrice: 700,
    category: 'جلسات التدليك والاسترخاء',
    quantity: 25,
  },
  {
    name: 'جلسة أروماثيرابي',
    description: 'جلسة مساج مع زيوت أساسية مختارة حسب حالتك المزاجية والجسدية.',
    price: 420,
    comparePrice: null,
    category: 'جلسات التدليك والاسترخاء',
    quantity: 35,
  },
  // العناية بالشعر
  {
    name: 'قص وتصفيف الشعر',
    description: 'قصة احترافية حسب شكل الوجه مع غسيل وتصفيف لإطلالة أنيقة.',
    price: 180,
    comparePrice: null,
    category: 'العناية بالشعر',
    quantity: 100,
  },
  {
    name: 'بروتين معالج للشعر',
    description: 'علاج البروتين البرازيلي لتنعيم الشعر المجعد والتالف لمدة تصل إلى 3 أشهر.',
    price: 850,
    comparePrice: 1100,
    category: 'العناية بالشعر',
    quantity: 15,
  },
  {
    name: 'صبغة شعر كاملة',
    description: 'صبغة عالية الجودة مع خصلات متناسقة وعلاج عميق للشعر.',
    price: 450,
    comparePrice: 600,
    category: 'العناية بالشعر',
    quantity: 25,
  },
  // الباقات المميزة
  {
    name: 'باقة العروس',
    description: 'يوم كامل من العناية يشمل بشرة، شعر، مساج، ومناكير لإطلالة فاخرة.',
    price: 2200,
    comparePrice: 2800,
    category: 'الباقات المميزة',
    quantity: 10,
  },
  {
    name: 'باقة يوم السبا',
    description: 'جلسة 3 ساعات تشمل مساج، تنظيف بشرة، وعلاج للشعر مع مشروب استقبال.',
    price: 1200,
    comparePrice: 1500,
    category: 'الباقات المميزة',
    quantity: 12,
  },
  {
    name: 'باقة استرخاء زوجي',
    description: 'جلسة مساج للشخصين في غرفة خاصة مع أجواء هادئة وشموع عطرية.',
    price: 900,
    comparePrice: 1100,
    category: 'الباقات المميزة',
    quantity: 20,
  },
];

const servicesData = [
  { name: 'جلسات العناية بالبشرة', description: 'أحدث تقنيات التقشير والترطيب والتجديد بأيدي خبيرات معتمدات.', price: 320 },
  { name: 'مساج واسترخاء', description: 'جلسات مساج متنوعة لتخفيف التوتر واستعادة حيوية الجسم.', price: 380 },
  { name: 'صالون الشعر والأظافر', description: 'قصات، صبغات، عناية، وأظافر بأسلوب عصري يناسب جميع المناسبات.', price: 180 },
  { name: 'باقات السبا الفاخرة', description: 'باقات مخصصة للعرائس والمناسبات الخاصة بأجواء خاصة وفاخرة.', price: 1200 },
];

const workingHoursData = {
  saturday: { open: '10:00', close: '22:00' },
  sunday: { open: '10:00', close: '22:00' },
  monday: { open: '10:00', close: '22:00' },
  tuesday: { open: '10:00', close: '22:00' },
  wednesday: { open: '10:00', close: '22:00' },
  thursday: { open: '10:00', close: '23:00' },
  friday: { open: '14:00', close: '23:00' },
};

const reviewsData = [
  { rating: 5, comment: 'تجربة رائعة! الجلسة كانت مريحة جداً والموظفات محترفات. سأعود بالتأكيد.' },
  { rating: 5, comment: 'أفضل سبا زرته في الرياض، الأجواء هادئة والخدمة فاخرة من البداية للنهاية.' },
  { rating: 4, comment: 'باقة العروس ممتازة، لكن كان يفضل أن يكون التنظيم أسرع قليلاً.' },
  { rating: 5, comment: 'مساج الأحجار الساخنة كان رائعاً، أنصح به بشدة لمن يعاني من التوتر.' },
  { rating: 4, comment: 'خدمة تنظيف البشرة كانت جيدة والنتيجة ظهرت من أول جلسة.' },
  { rating: 5, comment: 'موقع ممتاز، أسعار مناسبة للجودة المقدمة. شكراً لفريق لمسة نور.' },
];

async function seed() {
  const business = await prisma.business.findUnique({
    where: { slug: BUSINESS_SLUG },
    include: { User: true },
  });

  if (!business) {
    console.error(`Business with slug "${BUSINESS_SLUG}" not found.`);
    process.exit(1);
  }

  // Update business core info
  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: 'لمسة نور سبا',
      description:
        'لمسة نور سبا وجهتك الأولى للاسترخاء والجمال في الرياض. نقدم تجربة متكاملة من العناية بالبشرة، جلسات المساج، تصفيف الشعر، والباقات الفاخرة المخصصة للعرائس والمناسبات الخاصة. فريقنا من الخبيرات المعتمدات يضمن لك أعلى معايير الجودة والراحة في أجواء هادئة وفاخرة.',
      logo: IMAGES.logo,
      cover: IMAGES.cover,
      city: 'الرياض',
      address: 'حي الرياض، طريق الملك فهد، بجانب برج المملكة',
      phone: '0551234567',
      email: 'hello@lamsetnoor-spa.demo',
      website: 'https://lamsetnoor-spa.demo',
      workingHours: JSON.stringify(workingHoursData),
      images: JSON.stringify(
        IMAGES.gallery.map((url, idx) => ({
          url,
          type: 'gallery',
          caption: `صورة ${idx + 1} من معرض لمسة نور سبا`,
        }))
      ),
      avgRating: 4.8,
      reviewCount: reviewsData.length,
    },
  });

  // Clear old products/services/reviews for this business to avoid duplicates
  await prisma.product.deleteMany({ where: { businessId: business.id } });
  await prisma.service.deleteMany({ where: { businessId: business.id } });
  await prisma.review.deleteMany({ where: { businessId: business.id } });

  // Create products
  for (const product of productsData) {
    const images = productImages[product.category] || IMAGES.gallery.slice(0, 2);
    await prisma.product.create({
      data: {
        businessId: business.id,
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        sku: `LNS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        quantity: product.quantity,
        category: product.category,
        images: JSON.stringify(images.map((url) => ({ url, alt: product.name }))),
        tags: `${product.category}, سبا, جمال, استرخاء`,
        status: 'ACTIVE',
        isInMarketplace: true,
      },
    });
  }

  // Create services
  for (const service of servicesData) {
    await prisma.service.create({
      data: {
        businessId: business.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: 60,
        isActive: true,
      },
    });
  }

  // Create reviews
  const existingUsers = await prisma.user.findMany({ take: reviewsData.length, orderBy: { createdAt: 'asc' } });
  for (let i = 0; i < reviewsData.length; i++) {
    const review = reviewsData[i];
    const user = existingUsers[i] || business.User;
    await prisma.review.create({
      data: {
        businessId: business.id,
        userId: user.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  }

  // Ensure BusinessTheme sections are visible
  const theme = await prisma.businessTheme.findUnique({ where: { businessId: business.id } });
  if (theme) {
    await prisma.businessTheme.update({
      where: { businessId: business.id },
      data: {
        sections: JSON.stringify([
          { id: 'hero', type: 'hero', enabled: true, order: 10 },
          { id: 'about', type: 'about', enabled: true, order: 20 },
          { id: 'services', type: 'services', enabled: true, order: 40 },
          { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
          { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
          { id: 'contact', type: 'contact', enabled: true, order: 70 },
        ]),
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        accentColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        surfaceColor: '#FFFFFF',
        textColor: '#1F2937',
      },
    });
  }

  console.log(`✅ Seeded realistic demo data for business: ${business.id}`);
  console.log(`   Products: ${productsData.length}`);
  console.log(`   Services: ${servicesData.length}`);
  console.log(`   Reviews: ${reviewsData.length}`);
  console.log(`   Gallery images: ${IMAGES.gallery.length}`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
