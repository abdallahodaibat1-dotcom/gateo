import { PrismaClient, users_accountType, posts_postType, bookings_status, invoices_type, invoices_status, payments_status, products_status, messages_type, group_members_role, group_messages_type } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/ar';

const prisma = new PrismaClient({ log: ['warn', 'error'] });

const TEST_EMAIL_DOMAIN = 'realistic.gateo.com';
const PASSWORD_HASH = bcrypt.hashSync('demo123', 10);

// ─── Cleanup previous realistic test data ───
async function cleanupRealisticData() {
  console.log('🧹 Cleaning previous realistic test data...');
  const queries = [
    `SET FOREIGN_KEY_CHECKS = 0`,
    `DELETE FROM notifications WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM saved_posts WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM likes WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM comments WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM posts WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM messages WHERE senderId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM conversation_participants WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM group_messages WHERE senderId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM group_posts WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM group_invitations WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}') OR invitedById IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM group_members WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM groups WHERE name LIKE 'RT-%'`,
    `DELETE FROM bookings WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM reviews WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM marketplace_listings WHERE productId IN (SELECT id FROM products WHERE name LIKE 'RT-%')`,
    `DELETE FROM products WHERE name LIKE 'RT-%'`,
    `DELETE FROM services WHERE name LIKE 'RT-%'`,
    `DELETE FROM payments WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM invoices WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM financial_transactions WHERE accountId IN (SELECT id FROM financial_accounts WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}'))`,
    `DELETE FROM financial_accounts WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM commissions WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM business_field_values WHERE businessId IN (SELECT id FROM businesses WHERE slug LIKE 'rt-%')`,
    `DELETE FROM business_pages WHERE businessId IN (SELECT id FROM businesses WHERE slug LIKE 'rt-%')`,
    `DELETE FROM business_themes WHERE businessId IN (SELECT id FROM businesses WHERE slug LIKE 'rt-%')`,
    `DELETE FROM business_subscriptions WHERE businessId IN (SELECT id FROM businesses WHERE slug LIKE 'rt-%')`,
    `DELETE FROM businesses WHERE slug LIKE 'rt-%'`,
    `DELETE FROM professional_profiles WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM profiles WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}')`,
    `DELETE FROM users WHERE email LIKE '%@${TEST_EMAIL_DOMAIN}'`,
    `SET FOREIGN_KEY_CHECKS = 1`,
  ];
  for (const q of queries) {
    try {
      await prisma.$executeRawUnsafe(q);
    } catch (e: any) {
      console.warn('Cleanup query skipped:', e.message);
    }
  }
  console.log('🧹 Cleanup complete');
}

// ─── Configuration ───
const CONFIG = {
  users: 300,
  businesses: 200,
  ecommerceStores: 30,
  products: 1000,
  services: 300,
  posts: 300,
  reels: 100,
  comments: 200,
  likes: 1000,
  follows: 1000,
  groups: 100,
  groupPosts: 300,
  conversations: 500,
  messagesPerConversation: 10,
  bookings: 500,
  purchases: 500,
  reviews: 500,
  refunds: 200,
};

// ─── Helpers ───
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const sample = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const avatarUrl = (i: number) => {
  const gender = i % 2 === 0 ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${gender}/${(i % 70) + 1}.jpg`;
};
const businessLogo = (seed: string) => `https://picsum.photos/seed/${seed}-logo/400/400`;
const businessCover = (seed: string) => `https://picsum.photos/seed/${seed}-cover/1600/600`;
const productImage = (seed: string) => `https://picsum.photos/seed/${seed}-product/600/600`;

const saudiCities = [
  { name: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { name: 'جدة', lat: 21.4858, lng: 39.1925 },
  { name: 'الدمام', lat: 26.4207, lng: 50.0888 },
  { name: 'مكة المكرمة', lat: 21.3891, lng: 39.8579 },
  { name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692 },
  { name: 'أبها', lat: 18.2164, lng: 42.5053 },
  { name: 'الخبر', lat: 26.2172, lng: 50.1971 },
  { name: 'تبوك', lat: 28.3998, lng: 36.5715 },
  { name: 'حائل', lat: 27.5114, lng: 41.7208 },
  { name: 'بريدة', lat: 26.3335, lng: 43.9793 },
];

// ─── Step 1: Categories / Subcategories lookup ───
async function loadCategories() {
  const categories = await prisma.category.findMany({ include: { Subcategory: true } });
  const map = new Map(categories.map((c) => [c.slug, c]));
  return { categories, map };
}

// ─── Step 2: Generate users ───
async function generateUsers() {
  const existing = await prisma.user.count({ where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } } });
  if (existing >= CONFIG.users) {
    console.log(`✅ Users already seeded (${existing})`);
    return prisma.user.findMany({ where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } } });
  }

  const accountTypes: users_accountType[] = ['USER', 'BUSINESS', 'PROFESSIONAL', 'COMPANY'];
  const typeWeights = [60, 180, 40, 20]; // 300 total: enough business owners for 200 businesses
  const expandedTypes: users_accountType[] = typeWeights.flatMap((count, i) => Array(count).fill(accountTypes[i]));

  const userData = Array.from({ length: CONFIG.users }).map((_, i) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const accountType = expandedTypes[i];
    return {
      email: `user-${i + 1}@${TEST_EMAIL_DOMAIN}`,
      name: `${firstName} ${lastName}`,
      password: PASSWORD_HASH,
      avatar: avatarUrl(i),
      role: 'USER' as const,
      accountType,
      emailVerified: new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000),
      phone: `0599999${String(i + 1).padStart(4, '0')}`,
      username: `rt_user_${i + 1}`,
      createdAt: new Date(Date.now() - rand(1, 120) * 24 * 60 * 60 * 1000),
    };
  });

  // createMany does not return IDs; we need IDs for relations.
  const created: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  for (const data of userData) {
    try {
      created.push(await prisma.user.create({ data }));
    } catch (e: any) {
      if (e.code === 'P2002') continue; // duplicate
      console.error('User create error:', e.message);
    }
  }

  // Create profiles for regular users
  const profileBatch = created
    .filter((u) => u.accountType === 'USER')
    .map((u, idx) => ({
      userId: u.id,
      bio: faker.lorem.sentence(),
      city: pick(saudiCities).name,
      gender: idx % 2 === 0 ? 'MALE' : 'FEMALE',
      country: 'السعودية',
      onboardingCompleted: Math.random() > 0.3,
      skills: faker.lorem.words(3),
    }));

  if (profileBatch.length) {
    await prisma.profile.createMany({ data: profileBatch as any, skipDuplicates: true });
  }

  console.log(`✅ Created ${created.length} users`);
  return created;
}

// ─── Step 3: Generate businesses ───
async function generateBusinesses(users: any[], categories: any[], categoryMap: Map<string, any>) {
  const existing = await prisma.business.count({ where: { slug: { startsWith: 'rt-' } } });
  if (existing >= CONFIG.businesses) {
    console.log(`✅ Businesses already seeded (${existing})`);
    return prisma.business.findMany({ where: { slug: { startsWith: 'rt-' } }, include: { User: true } });
  }

  const businessOwners = users.filter((u) => u.accountType === 'BUSINESS' || u.accountType === 'COMPANY');

  // Distribution across sectors
  const sectorDistribution = [
    { categorySlug: 'beauty-salons', count: 20 },
    { categorySlug: 'cosmetic-clinics', count: 10 },
    { categorySlug: 'fashion-dresses', count: 15 },
    { categorySlug: 'cosmetics', count: 10 },
    { categorySlug: 'medical-services', count: 20 },
    { categorySlug: 'legal-services', count: 10 },
    { categorySlug: 'technical-services', count: 15 },
    { categorySlug: 'engineering-services', count: 10 },
    { categorySlug: 'creative-services', count: 15 },
    { categorySlug: 'craft-services', count: 10 },
    { categorySlug: 'educational-services', count: 15 },
    { categorySlug: 'financial-services', count: 10 },
    { categorySlug: 'agricultural-services', count: 10 },
    { categorySlug: 'logistic-services', count: 10 },
    { categorySlug: 'lg-beauty-care', count: 8 },
    { categorySlug: 'lg-shopping', count: 7 },
    { categorySlug: 'lg-health', count: 5 },
  ];

  const businessInputs: any[] = [];
  const usedOwners = new Set<string>();
  let ownerIndex = 0;
  for (const sector of sectorDistribution) {
    const category = categoryMap.get(sector.categorySlug);
    if (!category) continue;
    for (let i = 0; i < sector.count; i++) {
      let owner = businessOwners[ownerIndex % businessOwners.length];
      // Ensure unique owner per business
      while (usedOwners.has(owner.id)) {
        ownerIndex++;
        owner = businessOwners[ownerIndex % businessOwners.length];
      }
      usedOwners.add(owner.id);
      ownerIndex++;
      const city = pick(saudiCities);
      const slug = `rt-${sector.categorySlug}-${i + 1}`;
      businessInputs.push({
        userId: owner.id,
        name: `${faker.company.name()} ${category.name}`,
        slug,
        description: faker.lorem.paragraphs(2),
        logo: businessLogo(slug),
        cover: businessCover(slug),
        categoryId: category.id,
        subcategoryId: ((category as any).Subcategory?.length ? (category as any).Subcategory[0].id : null),
        city: city.name,
        address: faker.location.streetAddress(),
        latitude: city.lat + (Math.random() - 0.5) * 0.1,
        longitude: city.lng + (Math.random() - 0.5) * 0.1,
        phone: `05${rand(10000000, 99999999)}`,
        email: `contact-${slug}@${TEST_EMAIL_DOMAIN}`,
        website: `https://${slug}.demo`,
        status: 'ACTIVE',
        isVerified: Math.random() > 0.3,
        avgRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: rand(0, 200),
        businessType: Math.random() > 0.7 ? 'COMPANY' : 'INDIVIDUAL',
        workingHours: JSON.stringify({
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' },
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '23:00' },
          friday: { open: '16:00', close: '23:00' },
        }),
      });
    }
  }

  const created: any[] = [];
  for (const data of businessInputs) {
    try {
      created.push(await prisma.business.create({ data }));
    } catch (e: any) {
      if (e.code === 'P2002') {
        // Already exists; skip silently
        continue;
      }
      console.error('Business create error:', e.message);
    }
  }

  // Create themes & pages for businesses
  for (const biz of created) {
    try {
      await prisma.businessTheme.upsert({
        where: { businessId: biz.id },
        update: {},
        create: {
          businessId: biz.id,
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
          sections: JSON.stringify([
            { id: 'hero', type: 'hero', enabled: true, order: 10 },
            { id: 'about', type: 'about', enabled: true, order: 20 },
            { id: 'services', type: 'services', enabled: true, order: 40 },
            { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
            { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
            { id: 'contact', type: 'contact', enabled: true, order: 70 },
          ]),
        },
      });
      await prisma.businessPage.createMany({
        data: [
          { businessId: biz.id, slug: 'home', title: 'الرئيسية', isHomePage: true, isVisible: true, sortOrder: 0 },
          { businessId: biz.id, slug: 'about', title: 'من نحن', isHomePage: false, isVisible: true, sortOrder: 10, content: faker.lorem.paragraph() },
          { businessId: biz.id, slug: 'contact', title: 'تواصل معنا', isHomePage: false, isVisible: true, sortOrder: 20 },
        ],
        skipDuplicates: true,
      });
    } catch (e: any) {
      console.warn('Theme/page error:', e.message);
    }
  }

  console.log(`✅ Created ${created.length} businesses`);
  return created;
}

// ─── Step 4: Generate e-commerce products & services ───
async function generateCatalog(businesses: any[]) {
  const productCount = await prisma.product.count({ where: { name: { startsWith: 'RT-' } } });
  const serviceCount = await prisma.service.count({ where: { name: { startsWith: 'RT-' } } });

  // Select 30 stores suitable for products/services
  const ecommerceSectors = ['cosmetics', 'fashion-dresses', 'beauty-salons', 'lg-shopping', 'lg-beauty-care', 'lg-fashion', 'lg-gifts', 'lg-dining'];
  const eligible = businesses.filter((b) => ecommerceSectors.some((s) => b.categoryId && b.slug.includes(s)));
  const stores = sample(eligible, CONFIG.ecommerceStores);

  let products: any[] = [];
  if (productCount < CONFIG.products) {
    const productNames = [
      'عطر فاخر', 'كريم ترطيب', 'مكياج عيون', 'حقيبة يد', 'عباية سوداء', 'فستان سهرة',
      'ساعة أنيقة', 'عقد فضة', 'مستحضر شعر', 'صن بلوك', 'مجموعة عناية', 'هدية فاخرة',
      'شوكولاتة بلجيكية', 'ورد طبيعي', 'قهوة مختصة', 'حلويات مشكلة', 'جهاز تجميل', 'فرشاة مكياج',
      'ملابس رياضية', 'حذاء كلاسيك', 'إكسسوار شعر', 'طقم مجوهرات', 'سروال جينز', 'قميص قطني',
    ];

    const productInputs = [];
    for (let i = 0; i < CONFIG.products; i++) {
      const store = stores[i % stores.length];
      const baseName = pick(productNames);
      const price = rand(30, 2000);
      productInputs.push({
        businessId: store.id,
        name: `RT-${baseName} ${i + 1}`,
        description: faker.lorem.paragraphs(1),
        price,
        comparePrice: Math.random() > 0.5 ? price + rand(10, 500) : null,
        quantity: rand(5, 100),
        images: JSON.stringify([productImage(`rt-product-${i}`)]),
        category: baseName,
        status: 'ACTIVE' as products_status,
        isInMarketplace: true,
      });
    }

    await prisma.product.createMany({ data: productInputs, skipDuplicates: true });
    products = await prisma.product.findMany({ where: { name: { startsWith: 'RT-' } } });

    // Create marketplace listings
    const existingListings = await prisma.marketplaceListing.count();
    if (existingListings < products.length) {
      const listings = products.map((p) => ({
        productId: p.id,
        category: p.category,
        featured: Math.random() > 0.85,
      }));
      await prisma.marketplaceListing.createMany({ data: listings, skipDuplicates: true });
    }
    console.log(`✅ Created ${products.length} products`);
  } else {
    products = await prisma.product.findMany({ where: { name: { startsWith: 'RT-' } } });
  }

  let services: any[] = [];
  if (serviceCount < CONFIG.services) {
    const serviceNames = [
      'استشارة', 'جلسة علاجية', 'صيانة دورية', 'تركيب وتفعيل', 'تدريب شخصي', 'تصميم مخصص',
      'تنظيف شامل', 'توصيل سريع', 'حجز موعد', 'زيارة منزلية', 'مراجعة شهرية', 'دورة تدريبية',
      'صياغة عقد', 'فحص طبي', 'تبييض أسنان', 'قص شعر', 'مكياج مناسبة', 'إشراف هندسي',
    ];

    const serviceInputs = [];
    for (let i = 0; i < CONFIG.services; i++) {
      const store = stores[i % stores.length];
      const baseName = pick(serviceNames);
      serviceInputs.push({
        businessId: store.id,
        name: `RT-${baseName} ${i + 1}`,
        description: faker.lorem.sentence(),
        price: rand(50, 5000),
        duration: rand(15, 180),
        image: productImage(`rt-service-${i}`),
        isActive: true,
      });
    }

    await prisma.service.createMany({ data: serviceInputs, skipDuplicates: true });
    services = await prisma.service.findMany({ where: { name: { startsWith: 'RT-' } } });
    console.log(`✅ Created ${services.length} services`);
  } else {
    services = await prisma.service.findMany({ where: { name: { startsWith: 'RT-' } } });
  }

  return { products, services };
}

// ─── Step 5: Social interactions ───
async function generateSocial(users: any[], businesses: any[]) {
  const postCount = await prisma.post.count({ where: { userId: { in: users.map((u) => u.id) } } });
  if (postCount >= CONFIG.posts + CONFIG.reels) {
    console.log(`✅ Posts already seeded (${postCount})`);
    return;
  }

  const postInputs = [];
  for (let i = 0; i < CONFIG.posts; i++) {
    const author = pick(users);
    postInputs.push({
      userId: author.id,
      businessId: Math.random() > 0.7 ? pick(businesses).id : null,
      content: faker.lorem.paragraphs(rand(1, 3)),
      images: Math.random() > 0.4 ? JSON.stringify([productImage(`rt-post-${i}`)]) : null,
      postType: 'POST' as posts_postType,
      isPublic: Math.random() > 0.1,
      createdAt: new Date(Date.now() - rand(1, 60) * 24 * 60 * 60 * 1000),
    });
  }
  for (let i = 0; i < CONFIG.reels; i++) {
    const author = pick(users);
    postInputs.push({
      userId: author.id,
      content: faker.lorem.sentence(),
      video: `https://example.com/demo-reel-${i}.mp4`,
      postType: 'REEL' as posts_postType,
      isPublic: true,
      createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.post.createMany({ data: postInputs, skipDuplicates: true });
  const posts = await prisma.post.findMany({ where: { userId: { in: users.map((u) => u.id) } } });
  console.log(`✅ Created ${posts.length} posts/reels`);

  // Likes
  const likeSet = new Set<string>();
  const likeInputs = [];
  while (likeInputs.length < CONFIG.likes) {
    const user = pick(users);
    const post = pick(posts);
    const key = `${user.id}:${post.id}`;
    if (likeSet.has(key)) continue;
    likeSet.add(key);
    likeInputs.push({ userId: user.id, postId: post.id });
  }
  await prisma.like.createMany({ data: likeInputs, skipDuplicates: true });
  console.log(`✅ Created ${likeInputs.length} likes`);

  // Comments
  const commentInputs = [];
  for (let i = 0; i < CONFIG.comments; i++) {
    const user = pick(users);
    const post = pick(posts);
    commentInputs.push({
      userId: user.id,
      postId: post.id,
      content: faker.lorem.sentences(rand(1, 3)),
      createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000),
    });
  }
  await prisma.comment.createMany({ data: commentInputs, skipDuplicates: true });
  console.log(`✅ Created ${commentInputs.length} comments`);

  // Saved posts
  const savedSet = new Set<string>();
  const savedInputs = [];
  for (let i = 0; i < 200; i++) {
    const user = pick(users);
    const post = pick(posts);
    const key = `${user.id}:${post.id}`;
    if (savedSet.has(key)) continue;
    savedSet.add(key);
    savedInputs.push({ userId: user.id, postId: post.id });
  }
  await prisma.savedPosts.createMany({ data: savedInputs, skipDuplicates: true });
  console.log(`✅ Created ${savedInputs.length} saved posts`);

  // Follows
  const followSet = new Set<string>();
  const followInputs = [];
  while (followInputs.length < CONFIG.follows) {
    const follower = pick(users);
    const following = pick(users);
    if (follower.id === following.id) continue;
    const key = `${follower.id}:${following.id}`;
    if (followSet.has(key)) continue;
    followSet.add(key);
    followInputs.push({ followerId: follower.id, followingId: following.id });
  }
  await prisma.follow.createMany({ data: followInputs, skipDuplicates: true });
  console.log(`✅ Created ${followInputs.length} follows`);
}

// ─── Step 6: Groups ───
async function generateGroups(users: any[]) {
  const existing = await prisma.group.count({ where: { name: { startsWith: 'RT-' } } });
  if (existing >= CONFIG.groups) {
    console.log(`✅ Groups already seeded (${existing})`);
    return;
  }

  const groupNames = [
    'عشاق التجميل', 'أمهات ومستقبل', 'ريادة الأعمال', 'تطوير الذات', 'صحة ولياقة',
    'وظائف الرياض', 'أزياء وموضة', 'مستشاروك القانونيون', 'تقنية المعلومات', 'مهندسون سعوديون',
  ];

  const groupInputs = [];
  for (let i = 0; i < CONFIG.groups; i++) {
    groupInputs.push({
      name: `RT-${pick(groupNames)} ${i + 1}`,
      description: faker.lorem.paragraph(),
      image: productImage(`rt-group-${i}`),
      isPublic: Math.random() > 0.3,
      category: pick(groupNames),
      createdAt: new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.group.createMany({ data: groupInputs, skipDuplicates: true });
  const groups = await prisma.group.findMany({ where: { name: { startsWith: 'RT-' } } });
  console.log(`✅ Created ${groups.length} groups`);

  // Members
  const memberSet = new Set<string>();
  const memberInputs = [];
  for (const group of groups) {
    const admins = sample(users, rand(1, 3));
    for (const u of admins) {
      memberInputs.push({ groupId: group.id, userId: u.id, role: 'ADMIN' as group_members_role });
    }
    const members = sample(users, rand(5, 30));
    for (const u of members) {
      memberInputs.push({ groupId: group.id, userId: u.id, role: 'MEMBER' as group_members_role });
    }
  }
  await prisma.groupMember.createMany({ data: memberInputs as any, skipDuplicates: true });
  console.log(`✅ Created group members`);

  // Group posts
  const groupPostInputs = [];
  for (let i = 0; i < CONFIG.groupPosts; i++) {
    const group = pick(groups);
    const members = await prisma.groupMember.findMany({ where: { groupId: group.id }, select: { userId: true } });
    if (!members.length) continue;
    const author = pick(members).userId;
    groupPostInputs.push({
      groupId: group.id,
      userId: author,
      content: faker.lorem.paragraph(),
      images: Math.random() > 0.5 ? JSON.stringify([productImage(`rt-gpost-${i}`)]) : null,
      createdAt: new Date(Date.now() - rand(1, 60) * 24 * 60 * 60 * 1000),
    });
  }
  await prisma.groupPosts.createMany({ data: groupPostInputs as any, skipDuplicates: true });
  console.log(`✅ Created ${groupPostInputs.length} group posts`);

  // Group messages
  const groupMessageInputs = [];
  for (const group of groups.slice(0, 30)) {
    const members = await prisma.groupMember.findMany({ where: { groupId: group.id }, select: { userId: true } });
    for (let i = 0; i < 20; i++) {
      groupMessageInputs.push({
        groupId: group.id,
        senderId: pick(members).userId,
        content: faker.lorem.sentences(rand(1, 2)),
        type: 'TEXT' as group_messages_type,
        createdAt: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000),
      });
    }
  }
  await prisma.groupMessage.createMany({ data: groupMessageInputs as any, skipDuplicates: true });
  console.log(`✅ Created ${groupMessageInputs.length} group messages`);
}

// ─── Step 7: Messaging ───
async function generateMessaging(users: any[]) {
  const convCount = await prisma.conversation.count();
  if (convCount >= CONFIG.conversations + 100) {
    console.log('✅ Conversations already seeded');
    return;
  }

  for (let i = 0; i < CONFIG.conversations; i++) {
    try {
      const participants = sample(users, rand(2, 4));
      const isGroup = participants.length > 2;
      const conversation = await prisma.conversation.create({
        data: {
          isGroup,
          name: isGroup ? `RT-محادثة ${i + 1}` : null,
          createdAt: new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000),
          ConversationParticipant: {
            create: participants.map((p) => ({ userId: p.id })),
          },
        },
      });

      const messageInputs = [];
      for (let m = 0; m < CONFIG.messagesPerConversation; m++) {
        messageInputs.push({
          conversationId: conversation.id,
          senderId: pick(participants).id,
          content: faker.lorem.sentences(rand(1, 3)),
          type: 'TEXT' as messages_type,
          createdAt: new Date(Date.now() - rand(1, 60) * 24 * 60 * 60 * 1000),
        });
      }
      await prisma.message.createMany({ data: messageInputs, skipDuplicates: true });
    } catch (e: any) {
      console.warn('Conversation error:', e.message);
    }
  }
  console.log(`✅ Created ${CONFIG.conversations} conversations with messages`);
}

// ─── Step 8: Bookings ───
async function generateBookings(users: any[], businesses: any[], services: any[]) {
  const existing = await prisma.booking.count({ where: { notes: { startsWith: 'RT booking' } } });
  if (existing >= CONFIG.bookings) {
    console.log(`✅ Bookings already seeded (${existing})`);
    return;
  }

  const serviceBusinessIds = new Set(services.map((s) => s.businessId));
  const bookableBusinesses = businesses.filter((b) => serviceBusinessIds.has(b.id));

  const bookingInputs = [];
  for (let i = 0; i < CONFIG.bookings; i++) {
    const business = pick(bookableBusinesses);
    const businessServices = services.filter((s) => s.businessId === business.id);
    const service = businessServices.length ? pick(businessServices) : null;
    bookingInputs.push({
      userId: pick(users).id,
      businessId: business.id,
      serviceId: service?.id || null,
      date: new Date(Date.now() + rand(1, 60) * 24 * 60 * 60 * 1000),
      time: `${String(rand(8, 20)).padStart(2, '0')}:${pick(['00', '30'])}`,
      status: pick(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED_BY_USER', 'CANCELLED_BY_BUSINESS']) as bookings_status,
      notes: `RT booking ${i + 1}`,
      totalPrice: service ? service.price : rand(50, 2000),
      paymentStatus: pick(['UNPAID', 'PAID', 'REFUNDED']) as any,
    });
  }

  await prisma.booking.createMany({ data: bookingInputs as any, skipDuplicates: true });
  console.log(`✅ Created ${bookingInputs.length} bookings`);
}

// ─── Step 9: Purchases & Invoices ───
async function generatePurchases(users: any[], products: any[], gateways: any[]) {
  const existing = await prisma.invoice.count({ where: { metadata: { contains: 'RT purchase' } } });
  if (existing >= CONFIG.purchases) {
    console.log(`✅ Purchases already seeded (${existing})`);
    return;
  }

  const gateway = gateways.find((g) => g.isDefault) || gateways[0];
  if (!gateway) {
    console.warn('No payment gateway found, skipping purchases');
    return;
  }

  for (let i = 0; i < CONFIG.purchases; i++) {
    try {
      const user = pick(users);
      const product = pick(products);
      const qty = rand(1, 3);
      const unitPrice = product.price;
      const total = Number(unitPrice) * qty;
      const status: invoices_status = i < CONFIG.refunds ? 'REFUNDED' : pick(['PAID', 'PAID', 'PAID', 'ISSUED']);

      const invoice = await prisma.invoice.create({
        data: {
          userId: user.id,
          businessId: product.businessId,
          invoiceNumber: `RT-INV-${Date.now()}-${i}`,
          type: 'MARKETPLACE' as invoices_type,
          subtotal: total,
          taxAmount: total * 0.15,
          discount: 0,
          total: total * 1.15,
          currency: 'USD',
          status,
          metadata: JSON.stringify({ source: 'RT purchase', productId: product.id, qty }),
          InvoiceLineItems: {
            create: {
              description: product.name,
              quantity: qty,
              unitPrice,
              total,
            },
          },
        },
      });

      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          userId: user.id,
          gatewayId: gateway.id,
          amount: invoice.total,
          currency: 'USD',
          status: status === 'REFUNDED' ? 'REFUNDED' : 'PAID',
          paidAt: status === 'REFUNDED' || status === 'PAID' ? new Date(Date.now() - rand(1, 60) * 24 * 60 * 60 * 1000) : null,
        },
      });
    } catch (e: any) {
      console.warn('Purchase error:', e.message);
    }
  }
  console.log(`✅ Created ${CONFIG.purchases} purchases (${CONFIG.refunds} refunds)`);
}

// ─── Step 10: Reviews ───
async function generateReviews(users: any[], businesses: any[]) {
  const existing = await prisma.review.count({ where: { comment: { startsWith: 'RT review' } } });
  if (existing >= CONFIG.reviews) {
    console.log(`✅ Reviews already seeded (${existing})`);
    return;
  }

  const reviewSet = new Set<string>();
  const reviewInputs = [];
  while (reviewInputs.length < CONFIG.reviews) {
    const user = pick(users);
    const business = pick(businesses);
    const key = `${user.id}:${business.id}`;
    if (reviewSet.has(key)) continue;
    reviewSet.add(key);
    reviewInputs.push({
      userId: user.id,
      businessId: business.id,
      rating: rand(1, 5),
      comment: `RT review ${reviewInputs.length + 1}: ${faker.lorem.sentence()}`,
      createdAt: new Date(Date.now() - rand(1, 90) * 24 * 60 * 60 * 1000),
    });
  }

  await prisma.review.createMany({ data: reviewInputs, skipDuplicates: true });
  console.log(`✅ Created ${reviewInputs.length} reviews`);
}

// ─── Main ───
async function main() {
  console.log('🚀 Starting realistic test environment seed...');
  console.time('Total');

  await cleanupRealisticData();

  const { categories, map: categoryMap } = await loadCategories();
  console.log(`Loaded ${categories.length} categories, ${categories.reduce((a, c) => a + c.Subcategory.length, 0)} subcategories`);

  const users = await generateUsers();
  const businesses = await generateBusinesses(users, categories, categoryMap);
  const { products, services } = await generateCatalog(businesses);

  await generateSocial(users, businesses);
  await generateGroups(users);
  await generateMessaging(users);
  await generateBookings(users, businesses, services);

  const gateways = await prisma.paymentGateway.findMany();
  await generatePurchases(users, products, gateways);
  await generateReviews(users, businesses);

  console.timeEnd('Total');
  console.log('🎉 Realistic test environment ready');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
