// Seed elegant demo products for the vxcvxcbxc fashion-1 storefront.
// Run: npx tsx scripts/seed-fashion-store.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const placeholder = '/uploads/placeholder.jpg';

// Real, visually-verified photos (Wikimedia Commons) served from public/uploads/fashion-store.
// Keyed by product name so the mapping stays robust regardless of array order.
const productImages: Record<string, string[]> = {
  'فستان زفاف أميرة منفوش': ['/uploads/fashion-store/01-princess.jpg'],
  'فستان زفاف حورية البحر': ['/uploads/fashion-store/02-mermaid.jpg'],
  'فستان زفاف A-Line كلاسيكي': ['/uploads/fashion-store/03-aline.jpg'],
  'فستان سهرة كتف مكشوف': ['/uploads/fashion-store/04-offshoulder.jpg'],
  'فستان سهرة أحمر ملكي': ['/uploads/fashion-store/05-red.jpg'],
  'فستان سهرة أزرق ملكي': ['/uploads/fashion-store/06-blue.jpg'],
  'تاج عروس كريستال': ['/uploads/fashion-store/07-tiara.jpg'],
  'طرحة زفاف دانتيل': ['/uploads/fashion-store/08-veil.jpg'],
  'باقة عروس ورد طبيعي': [
    '/uploads/fashion-store/09-bouquet.jpg',
    '/uploads/fashion-store/09-bouquet-2.jpg',
  ],
  'حذاء عروس كعب فضي': ['/uploads/fashion-store/10-shoes.jpg'],
  'مجوهرات عروس لؤلؤ': [
    '/uploads/fashion-store/11-pearls.jpg',
    '/uploads/fashion-store/11-pearls-2.jpg',
  ],
  'فستان سهرة ذهبي مطرز': ['/uploads/fashion-store/12-gold.jpg'],
};

// Build the images JSON for a product, keeping the existing { url, alt } gallery shape
// with (at least) two entries. Falls back to the placeholder if no photo was found.
function buildProductImages(name: string): string {
  const urls = productImages[name] ?? [placeholder];
  const gallery = urls.length === 1 ? [urls[0], urls[0]] : urls;
  return JSON.stringify(
    gallery.map((url, i) => ({ url, alt: i === 0 ? name : `${name} - صورة ${i + 1}` })),
  );
}

const demoProducts = [
  {
    name: 'فستان زفاف أميرة منفوش',
    description: 'فستان زفاف فاخر بتصميم أميرة منفوش، مزين بتطريز يدوي من الدانتيل الفرنسي وكريستال سواروفسكي.',
    price: 3200,
    comparePrice: 3800,
    quantity: 3,
    category: 'wedding',
    tags: ['princess', 'lace', 'long-sleeve', 'white', 'XS S M L XL'],
  },
  {
    name: 'فستان زفاف حورية البحر',
    description: 'فستان زفاف بوصة حورية البحر يلتصق بالجسم وينتشر عند الركبة، مثالي لعروس تبحث عن الأناقة والجرأة.',
    price: 2900,
    comparePrice: null,
    quantity: 2,
    category: 'wedding',
    tags: ['mermaid', 'sleeveless', 'ivory', 'S M L XL'],
  },
  {
    name: 'فستان زفاف A-Line كلاسيكي',
    description: 'فستان زفاف A-Line كلاسيكي بياقة V وذيل متوسط، مناسب لجميع أشكال الجسم.',
    price: 2450,
    comparePrice: 2800,
    quantity: 4,
    category: 'wedding',
    tags: ['aline', 'v-neck', 'white', 'XS S M L XL XXL'],
  },
  {
    name: 'فستان سهرة كتف مكشوف',
    description: 'فستان سهرة أنيق بكتف مكشوف، قماش ساتان ناعم بلون شامبانيا، مثالي لحفلات الخطوبة.',
    price: 980,
    comparePrice: 1200,
    quantity: 6,
    category: 'evening',
    tags: ['off-shoulder', 'satin', 'champagne', 'S M L XL'],
  },
  {
    name: 'فستان سهرة أحمر ملكي',
    description: 'فستان سهرة أحمر ملكي بتصميم درابيه وشق جانبي، يمنحكِ إطلالة جريئة وفاخرة.',
    price: 1150,
    comparePrice: null,
    quantity: 5,
    category: 'evening',
    tags: ['red', 'draped', 'slit', 'S M L XL'],
  },
  {
    name: 'فستان سهرة أزرق ملكي',
    description: 'فستان سهرة أزرق ملكي مزين بالترتر والخرز، مثالي للسهرات الرسمية والمناسبات الخاصة.',
    price: 1350,
    comparePrice: 1600,
    quantity: 3,
    category: 'evening',
    tags: ['blue', 'sequins', 'mermaid', 'M L XL'],
  },
  {
    name: 'تاج عروس كريستال',
    description: 'تاج عروس فاخر مرصع بالكريستال واللؤلؤ الصناعي، يناسب جميع تسريحات الشعر.',
    price: 320,
    comparePrice: 450,
    quantity: 10,
    category: 'accessories',
    tags: ['tiara', 'crystal', 'silver'],
  },
  {
    name: 'طرحة زفاف دانتيل',
    description: 'طرحة زفاف طويلة من الدانتيل الفرنسي الناعم مع تطريز يدوي دقيق على الحواف.',
    price: 480,
    comparePrice: null,
    quantity: 7,
    category: 'accessories',
    tags: ['veil', 'lace', 'ivory', 'white'],
  },
  {
    name: 'باقة عروس ورد طبيعي',
    description: 'باقة عروس من الورد الطبيعي الفاخر، تنسيق يدوي بألوان عاجي وشامبانيا ووردي فاتح.',
    price: 650,
    comparePrice: 800,
    quantity: 8,
    category: 'accessories',
    tags: ['bouquet', 'flowers', 'ivory', 'pink'],
  },
  {
    name: 'حذاء عروس كعب فضي',
    description: 'حذاء عروس بكعب عالٍ وفيونكة صغيرة، لون فضي يتناسب مع جميع فساتين الزفاف.',
    price: 420,
    comparePrice: null,
    quantity: 12,
    category: 'accessories',
    tags: ['shoes', 'heels', 'silver'],
  },
  {
    name: 'مجوهرات عروس لؤلؤ',
    description: 'طقم مجوهرات عروس من اللؤلؤ الطبيعي يتضمن عقداً وأقراطاً وسواراً.',
    price: 780,
    comparePrice: 950,
    quantity: 6,
    category: 'accessories',
    tags: ['jewelry', 'pearl', 'set'],
  },
  {
    name: 'فستان سهرة ذهبي مطرز',
    description: 'فستان سهرة ذهبي مطرز بالخرز والكريستال، يمنحكِ إطلالة ساحرة تحت الأضواء.',
    price: 1550,
    comparePrice: 1900,
    quantity: 4,
    category: 'evening',
    tags: ['gold', 'beaded', 'long', 'S M L'],
  },
];

const demoReviews = [
  { rating: 5, comment: 'تجربة رائعة! الفستان أجمل بكثير من الصور والخدمة ممتازة.' },
  { rating: 5, comment: 'أشكر الفريق على الصبر والمساعدة في اختيار الفستان المناسب.' },
  { rating: 4, comment: 'جودة رائعة وتشكيلة واسعة، سأعود مرة أخرى بالتأكيد.' },
  { rating: 5, comment: 'أفضل متجر فساتين زفاف جربته، التعديلات كانت مثالية.' },
  { rating: 4, comment: 'الإكسسوارات فاخرة وأسعار معقولة مقارنة بالجودة.' },
  { rating: 5, comment: 'التوصيل كان سريعاً والتغليف فاخر، شكراً لكم.' },
  { rating: 5, comment: 'فستان السهرة خطف الأنظار في الحفل، أنصح به بشدة.' },
  { rating: 4, comment: 'خدمة عملاء ممتازة وساعدوني في اختيار المقاس المناسب.' },
];

async function main() {
  const business = await prisma.business.findUnique({ where: { slug: 'vxcvxcbxc' } });
  if (!business) {
    console.error('Business vxcvxcbxc not found');
    process.exit(1);
  }

  // Upsert demo user if not exists
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo-reviewer@gateo.com' },
    update: {},
    create: {
      email: 'demo-reviewer@gateo.com',
      name: 'عميلة تجريبية',
      password: await import('bcryptjs').then((bcrypt) => bcrypt.hash('demo123', 10)),
      role: 'USER',
      accountType: 'USER',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  // Delete old placeholder products/reviews for this business so we can reseed cleanly
  await prisma.review.deleteMany({ where: { businessId: business.id, userId: demoUser.id } });
  await prisma.product.deleteMany({ where: { businessId: business.id } });

  const createdProducts = [] as { id: string; category: string }[];

  for (const p of demoProducts) {
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: p.name,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        quantity: p.quantity,
        category: p.category,
        tags: p.tags.join(', '),
        images: buildProductImages(p.name),
        status: 'ACTIVE',
        isInMarketplace: true,
        updatedAt: new Date(),
      },
    });
    createdProducts.push({ id: product.id, category: p.category });

    // Create a marketplace listing for each product
    await prisma.marketplaceListing.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        category: p.category,
        featured: p.comparePrice !== null,
        updatedAt: new Date(),
      },
    });
  }

  // Create reviews (unique per business/user enforced by schema, so we use one review per user).
  // To add multiple demo reviews we create additional reviewer users.
  const reviewerNames = ['سارة', 'نور', 'ليلى', 'ريما', 'هدى', 'غدير', 'دانة', 'أماني'];
  for (let i = 0; i < demoReviews.length; i++) {
    const r = demoReviews[i];
    const email = `demo-reviewer-${i}@gateo.com`;
    const reviewer = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: reviewerNames[i % reviewerNames.length],
        password: await import('bcryptjs').then((bcrypt) => bcrypt.hash('demo123', 10)),
        role: 'USER',
        accountType: 'USER',
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    });
    await prisma.review.upsert({
      where: { businessId_userId: { businessId: business.id, userId: reviewer.id } },
      update: { rating: r.rating, comment: r.comment, updatedAt: new Date() },
      create: {
        businessId: business.id,
        userId: reviewer.id,
        rating: r.rating,
        comment: r.comment,
        updatedAt: new Date(),
      },
    });
  }

  // Update business avg rating
  const reviews = await prisma.review.findMany({ where: { businessId: business.id } });
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  await prisma.business.update({
    where: { id: business.id },
    data: { avgRating, reviewCount: reviews.length },
  });

  console.log(`✅ Seeded ${createdProducts.length} products and ${reviews.length} reviews for vxcvxcbxc`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
