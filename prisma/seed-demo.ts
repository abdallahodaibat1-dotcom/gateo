import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

// Deterministic pseudo-random helpers (stable across re-runs)
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function daysAgo(n: number, hourOffset = 0): Date {
  return new Date(Date.now() - n * DAY + hourOffset * HOUR);
}

async function main() {
  console.log('🌱 Seeding demo dataset...');

  // ─── Countries & Cities ───
  const countriesData = [
    { name: 'السعودية', nameEn: 'Saudi Arabia', code: 'SA', phoneCode: '+966', currency: 'SAR', flagEmoji: '🇸🇦', sortOrder: 1 },
    { name: 'الإمارات', nameEn: 'United Arab Emirates', code: 'AE', phoneCode: '+971', currency: 'AED', flagEmoji: '🇦🇪', sortOrder: 2 },
    { name: 'الأردن', nameEn: 'Jordan', code: 'JO', phoneCode: '+962', currency: 'JOD', flagEmoji: '🇯🇴', sortOrder: 3 },
    { name: 'مصر', nameEn: 'Egypt', code: 'EG', phoneCode: '+20', currency: 'EGP', flagEmoji: '🇪🇬', sortOrder: 4 },
  ];

  for (const country of countriesData) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: { phoneCode: country.phoneCode, currency: country.currency, flagEmoji: country.flagEmoji, sortOrder: country.sortOrder },
      create: country,
    });
  }

  const saudi = await prisma.country.findUnique({ where: { code: 'SA' } });
  if (!saudi) throw new Error('Saudi Arabia country not found');

  const saudiCities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة المنورة', 'الخبر'];
  for (let i = 0; i < saudiCities.length; i++) {
    await prisma.city.upsert({
      where: { countryId_name: { countryId: saudi.id, name: saudiCities[i] } },
      update: { sortOrder: i + 1, isActive: true },
      create: { countryId: saudi.id, name: saudiCities[i], sortOrder: i + 1 },
    });
  }

  // Link existing businesses that have a city but no country
  await prisma.business.updateMany({
    where: { countryId: null, city: { not: null } },
    data: { countryId: saudi.id },
  });

  // ─── Demo Users ───
  const demoPassword = await bcrypt.hash('Demo1234', 10);

  const demoUsersData = [
    { name: 'سارة العتيبي', username: 'sarah_demo', email: 'sarah.demo@gateo.com', city: 'الرياض', img: 47, bio: 'أحب العناية بالبشرة وجرّب كل جديد في عالم الجمال ✨', interests: 'تجميل,عناية بالبشرة,موضة' },
    { name: 'نورة القحطاني', username: 'noura_demo', email: 'noura.demo@gateo.com', city: 'جدة', img: 32, bio: 'مصممة أزياء شغوفة بالتفاصيل، أشارككم إلهامي اليومي 👗', interests: 'أزياء,تصميم,تسوق' },
    { name: 'ريم الشهري', username: 'reem_demo', email: 'reem.demo@gateo.com', city: 'الدمام', img: 45, bio: 'مدربة لياقة معتمدة، الصحة أولاً 💪', interests: 'رياضة,لياقة,تغذية' },
    { name: 'العنود الدوسري', username: 'anoud_demo', email: 'anoud.demo@gateo.com', city: 'الرياض', img: 25, bio: 'محامية أشارككم معلومات قانونية مبسطة ⚖️', interests: 'قانون,قراءة,تطوير ذات' },
    { name: 'لطيفة الحربي', username: 'latifa_demo', email: 'latifa.demo@gateo.com', city: 'مكة', img: 44, bio: 'مصورة فوتوغرافية أرصد اللحظات الجميلة 📷', interests: 'تصوير,فن,سفر' },
    { name: 'حصة العنزي', username: 'hussa_demo', email: 'hussa.demo@gateo.com', city: 'المدينة المنورة', img: 31, bio: 'أخصائية تغذية، أطبخ صحي وأعيش بتوازن 🥗', interests: 'تغذية,طبخ,صحة' },
    { name: 'مها السبيعي', username: 'maha_demo', email: 'maha.demo@gateo.com', city: 'الخبر', img: 48, bio: 'أم لثلاث أطفال، أشارككم تجاربي في الأمومة 👶', interests: 'أمومة,تربية,منزل' },
    { name: 'جوهرة المطيري', username: 'jawaher_demo', email: 'jawaher.demo@gateo.com', city: 'جدة', img: 27, bio: 'عاشقة عطور ومكياج، رأيي الصريح قبل أي شراء 💄', interests: 'عطور,مكياج,تسوق' },
    { name: 'أمل الغامدي', username: 'amal_demo', email: 'amal.demo@gateo.com', city: 'الرياض', img: 24, bio: 'مهتمة بالديكور وترتيب البيوت، البيت أجمل مساحة 🏡', interests: 'ديكور,منزل,تنظيم' },
    { name: 'وجدان الزهراني', username: 'wijdan_demo', email: 'wijdan.demo@gateo.com', city: 'الدمام', img: 21, bio: 'أدرس وأطور نفسي باستمرار، هدفي مستقبل أفضل 📚', interests: 'تعليم,تطوير ذات,تقنية' },
    { name: 'شهد الأحمدي', username: 'shahad_demo', email: 'shahad.demo@gateo.com', city: 'الرياض', img: 16, bio: 'خبيرة مكياج، أحول البساطة إلى إطلالة ملكية 💋', interests: 'مكياج,تجميل,أعراس' },
    { name: 'دانة العمري', username: 'dana_demo', email: 'dana.demo@gateo.com', city: 'جدة', img: 20, bio: 'أعشق البحر والسفر، جدة أجمل مدن العالم 🌊', interests: 'سفر,بحر,تصوير' },
    { name: 'غلا الشمري', username: 'ghala_demo', email: 'ghala.demo@gateo.com', city: 'الرياض', img: 26, bio: 'أشارككم وصفاتي السهلة واللذيذة كل يوم 🍰', interests: 'طبخ,وصفات,حلويات' },
    { name: 'سديم القرني', username: 'sadeem_demo', email: 'sadeem.demo@gateo.com', city: 'مكة', img: 29, bio: 'أبحث عن الهدوء في اليوغا والتأمل 🧘‍♀️', interests: 'يوغا,تأمل,استرخاء' },
    { name: 'رزان البقمي', username: 'razan_demo', email: 'razan.demo@gateo.com', city: 'الخبر', img: 23, bio: 'مدونة موضة، أتابع آخر صيحات المواسم 👠', interests: 'موضة,أزياء,مجوهرات' },
  ];

  const demoUsers: { id: string; email: string | null; name: string | null }[] = [];
  for (const u of demoUsersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, username: u.username, avatar: `https://i.pravatar.cc/150?img=${u.img}` },
      create: {
        email: u.email,
        username: u.username,
        name: u.name,
        password: demoPassword,
        role: 'USER',
        accountType: 'USER',
        avatar: `https://i.pravatar.cc/150?img=${u.img}`,
        emailVerified: new Date(),
        preferredCurrency: 'SAR',
        updatedAt: new Date(),
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { bio: u.bio, interests: u.interests, city: u.city, country: 'السعودية', countryId: saudi.id, gender: 'FEMALE' },
      create: {
        userId: user.id,
        bio: u.bio,
        interests: u.interests,
        city: u.city,
        country: 'السعودية',
        countryId: saudi.id,
        gender: 'FEMALE',
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
    });

    demoUsers.push(user);
  }

  const demoUserIds = demoUsers.map((u) => u.id);
  console.log(`👩 ${demoUsers.length} demo users ready`);

  // ─── Social Graph: Follows ───
  await prisma.follow.deleteMany({ where: { followerId: { in: demoUserIds } } });

  const followPairs = new Set<string>();
  for (let i = 0; i < demoUsers.length; i++) {
    const offsets = [1, 2, 5, 8];
    if (i % 4 === 0) offsets.push(11);
    if (i % 5 === 0) offsets.push(13);
    for (const off of offsets) {
      followPairs.add(`${i}:${(i + off) % demoUsers.length}`);
    }
  }

  await prisma.follow.createMany({
    data: Array.from(followPairs).map((pair, idx) => {
      const [a, b] = pair.split(':').map(Number);
      return {
        followerId: demoUsers[a].id,
        followingId: demoUsers[b].id,
        createdAt: daysAgo(14 - (idx % 14), idx % 12),
      };
    }),
  });

  // ─── Posts ───
  await prisma.post.deleteMany({ where: { id: { startsWith: 'demo-post-' } } });

  const businessSlugs = ['lamset-naema-salon', 'bashara-nadra', 'spa-alnokhba', 'abayat-almalika', 'cafe-lamsa'];
  const businesses = await prisma.business.findMany({
    where: { slug: { in: businessSlugs } },
    include: { User: true },
  });
  const bizBySlug: Record<string, (typeof businesses)[number]> = {};
  for (const b of businesses) bizBySlug[b.slug] = b;

  const userPostsData = [
    { content: 'جربت اليوم جلسة عناية بالبشرة في مركز جديد وكانت التجربة روعة! البشرة صارت أنعم بكثير ✨ #عناية_بالبشرة #جمال', hashtags: '#عناية_بالبشرة,#جمال', images: ['https://picsum.photos/seed/skincare/600/400'] },
    { content: 'وش رايكم في هذا الفستان؟ مناسب لمناسبة زواج أختي ولا أغير؟ 💃 #موضة #فساتين', hashtags: '#موضة,#فساتين', images: ['https://picsum.photos/seed/dress/600/400'] },
    { content: 'أول حصة بيلاتس اليوم بعد شهر كامل من الغياب، أحس جسمي تفاجأ مني 😅 #لياقة #بيلاتس #رياضة', hashtags: '#لياقة,#بيلاتس,#رياضة', images: ['https://picsum.photos/seed/pilates/600/400'] },
    { content: 'معلومة قانونية سريعة: تعرفون أن عقد العمل يجب أن يكون مكتوباً حتى لو كانت المدة قصيرة؟ احفظوا حقوقكم ⚖️ #قانون #معلومة', hashtags: '#قانون,#معلومة', images: [] },
    { content: 'غروب اليوم من كورنيش جدة، ما شاء الله تبارك الله 🌅 #تصويري #جدة #غروب', hashtags: '#تصويري,#جدة,#غروب', images: ['https://picsum.photos/seed/sunset/600/400', 'https://picsum.photos/seed/sea/600/400'] },
    { content: 'وصفة اليوم: سلطة الكينوا بالأفوكادو، صحية وشبعانة ومكوناتها من السوق 🥗 #وصفات_صحية #تغذية', hashtags: '#وصفات_صحية,#تغذية', images: ['https://picsum.photos/seed/salad/600/400'] },
    { content: 'أسبوعي مع بناتي في الحضانة الجديدة، الحمد لله التأقلم كان أسرع من توقعي 🥹 #أمومة #تربية', hashtags: '#أمومة,#تربية', images: [] },
    { content: 'اقتنيت عطر جديد والثبات خيال! من يحب العطور الشرقية تدخل تكتب لي تجاربها 🌸 #عطور #تسوق', hashtags: '#عطور,#تسوق', images: ['https://picsum.photos/seed/perfume/600/400'] },
    { content: 'قبل وبعد لترتيب غرفة المعيشة، التغيير بسيط بس فرق كبير في النفسية 🏡 #ديكور #ترتيب_المنزل', hashtags: '#ديكور,#ترتيب_المنزل', images: ['https://picsum.photos/seed/livingroom/600/400', 'https://picsum.photos/seed/decor/600/400'] },
    { content: 'خلصت دورة إدارة المشاريع اليوم! شهادة جديدة تنضاف للسيرة الذاتية 📚 #تطوير_ذات #تعليم', hashtags: '#تطوير_ذات,#تعليم', images: [] },
    { content: 'مكياج سهرة خفيف لعشاء عائلي، أحب الألوان الترابية دائماً 💄 #مكياج #جمال', hashtags: '#مكياج,#جمال', images: ['https://picsum.photos/seed/makeup/600/400'] },
    { content: 'رحلة نهاية الأسبوع إلى البحر كانت العلاج المثالي، البحر يشفي كل شي 🌊 #سفر #استجمام', hashtags: '#سفر,#استجمام', images: ['https://picsum.photos/seed/beach/600/400'] },
    { content: 'كيكة التمر بالكراميل، وصفتي المضمونة لضيوف العصر! الطريقة في التعليقات 🍰 #حلويات #وصفات', hashtags: '#حلويات,#وصفات', images: ['https://picsum.photos/seed/cake/600/400'] },
    { content: 'جلسة تأمل الصبح غيرت يومي بالكامل، جربوا عشر دقايق فقط وشوفوا الفرق 🧘‍♀️ #تأمل #هدوء', hashtags: '#تأمل,#هدوء', images: [] },
    { content: 'أطلالة اليوم من التصوير، المجوهرات الرقيقة تكمل أي لوق 👑 #موضة #مجوهرات #أناقة', hashtags: '#موضة,#مجوهرات,#أناقة', images: ['https://picsum.photos/seed/jewelry/600/400'] },
    { content: 'سؤال للبنات: وش أفضل صالون في الرياض للصبغات؟ أبي أشقر رمادي بدون ما يتضرر شعري 🙏 #صالونات #شعر', hashtags: '#صالونات,#شعر', images: [] },
    { content: 'تجهيزات عزيمة اليوم، أول مرة أجرب تنسيق الطاولة بهالشكل وطلعت حلوة 🌷 #ضيافة #تنسيق', hashtags: '#ضيافة,#تنسيق', images: ['https://picsum.photos/seed/table/600/400'] },
    { content: 'يومياتي: قهوة الصبح وورد جديد في البلكونة، التفاصيل الصغيرة تصنع الفرق ☕ #قهوة #يومياتي', hashtags: '#قهوة,#يومياتي', images: ['https://picsum.photos/seed/coffee/600/400'] },
  ];

  const businessPostsData: { slug: string; content: string; hashtags: string; images: string[] }[] = [
    { slug: 'lamset-naema-salon', content: 'عرض خاص هذا الأسبوع! خصم 20% على جميع خدمات العناية بالشعر، احجزي موعدك الآن 💇‍♀️ #عرض_خاص #صالون', hashtags: '#عرض_خاص,#صالون', images: ['https://picsum.photos/seed/salon1/600/400'] },
    { slug: 'lamset-naema-salon', content: 'لمسة ناعمة ترحب بكم في فرعنا الجديد بحي العليا، تجهيزات عصرية وكادر نسائي محترف ✨ #افتتاح #صالون', hashtags: '#افتتاح,#صالون', images: ['https://picsum.photos/seed/salon2/600/400'] },
    { slug: 'bashara-nadra', content: 'نتائج حقيقية لجلسات العناية بالبشرة لدينا، بشرتك تستحق الأفضل 🌸 #عناية_بالبشرة #نتائج', hashtags: '#عناية_بالبشرة,#نتائج', images: ['https://picsum.photos/seed/skin1/600/400'] },
    { slug: 'spa-alnokhba', content: 'استرخِِ من ضغوط الأسبوع مع باقة السبا الملكية: مساج + حمام مغربي + عناية بالجسم 🌿 #سبا #استرخاء', hashtags: '#سبا,#استرخاء', images: ['https://picsum.photos/seed/spa1/600/400'] },
    { slug: 'spa-alnokhba', content: 'يوم المرأة العالمي قرب! جهزنا باقات هدايا خاصة لكل سيدة غالية على قلبك 🎁 #هدايا #يوم_المرأة', hashtags: '#هدايا,#يوم_المرأة', images: [] },
    { slug: 'abayat-almalika', content: 'تشكيلة عبايات رمضان وصلت! تصاميم فاخرة بأقمشة يابانية، تسوّقي الآن 👗 #عبايات #رمضان', hashtags: '#عبايات,#رمضان', images: ['https://picsum.photos/seed/abaya1/600/400'] },
    { slug: 'cafe-lamsa', content: 'قهوتنا المقطرة من حبوب إثيوبية مختصة، تذوق الفرق في كل رشفة ☕ #قهوة_مختصة #كافيه', hashtags: '#قهوة_مختصة,#كافيه', images: ['https://picsum.photos/seed/cafe1/600/400'] },
  ];

  interface PostSeed {
    id: string;
    userId?: string;
    businessId?: string;
    content: string;
    hashtags?: string;
    images?: string;
    video?: string;
    postType: 'POST' | 'REEL';
    views: number;
    shares: number;
    createdAt: Date;
  }

  const postRows: PostSeed[] = [];
  let postNum = 0;
  userPostsData.forEach((p, i) => {
    postNum++;
    const isReel = i === 4 || i === 10;
    postRows.push({
      id: `demo-post-${String(postNum).padStart(3, '0')}`,
      userId: demoUsers[i % demoUsers.length].id,
      content: p.content,
      hashtags: p.hashtags,
      images: p.images.length ? JSON.stringify(p.images) : undefined,
      video: isReel ? `https://picsum.photos/seed/reel${i}/600/400` : undefined,
      postType: isReel ? 'REEL' : 'POST',
      views: 120 + ((i * 97) % 880),
      shares: (i * 7) % 23,
      createdAt: daysAgo((i * 5) % 14, (i * 3) % 20),
    });
  });
  businessPostsData.forEach((p, i) => {
    postNum++;
    const biz = bizBySlug[p.slug];
    if (!biz) return;
    postRows.push({
      id: `demo-post-${String(postNum).padStart(3, '0')}`,
      businessId: biz.id,
      content: p.content,
      hashtags: p.hashtags,
      images: p.images.length ? JSON.stringify(p.images) : undefined,
      postType: 'POST',
      views: 300 + ((i * 211) % 1500),
      shares: (i * 13) % 41,
      createdAt: daysAgo((i * 3 + 1) % 12, (i * 5) % 18),
    });
  });

  await prisma.post.createMany({ data: postRows });

  // ─── Likes on posts ───
  await prisma.like.deleteMany({ where: { id: { startsWith: 'demo-like-' } } });
  const likeRows: { id: string; userId: string; postId: string; createdAt: Date }[] = [];
  const seenLikes = new Set<string>();
  let likeNum = 0;
  postRows.forEach((post, pi) => {
    const likeCount = 2 + (pi % 6);
    for (let j = 0; j < likeCount; j++) {
      const ui = (pi + j * 2) % demoUsers.length;
      const key = `${demoUsers[ui].id}:${post.id}`;
      if (seenLikes.has(key)) continue;
      seenLikes.add(key);
      likeNum++;
      likeRows.push({
        id: `demo-like-${String(likeNum).padStart(3, '0')}`,
        userId: demoUsers[ui].id,
        postId: post.id,
        createdAt: new Date(post.createdAt.getTime() + (j + 1) * 2 * HOUR),
      });
    }
  });
  await prisma.like.createMany({ data: likeRows });

  // ─── Comments (with nested replies) ───
  await prisma.comment.deleteMany({ where: { id: { startsWith: 'demo-comment-' } } });
  const commentTexts = [
    'ما شاء الله، يجنن! 😍',
    'وين المكان بالضبط؟ أبي أجرب',
    'تجربة رائعة، أتفق معك تماماً',
    'الله يبارك لك، يستاهل كل خير',
    'أووه لازم أجربه قريب',
    'جمال التفاصيل، ما شاء الله',
    'تسلم إيدك على المشاركة 🌸',
    'نفس تجربتي تقريباً!',
    'وين لقيتِه؟ ابي تفاصيل أكثر',
    'يسلمو، استفدت من التجربة',
  ];
  const replyTexts = ['صحيح كلامك 👌', 'أكيد! جربي وبتعرفين', 'تسلمين 🌷', 'والله صدقتِ', 'إن شاء الله قريب'];

  interface CommentSeed {
    id: string;
    postId: string;
    userId: string;
    content: string;
    parentId?: string;
    createdAt: Date;
  }
  const commentRows: CommentSeed[] = [];
  let commentNum = 0;
  postRows.forEach((post, pi) => {
    const commentCount = pi % 5 === 0 ? 1 : 2 + (pi % 3);
    for (let j = 0; j < commentCount; j++) {
      commentNum++;
      const cid = `demo-comment-${String(commentNum).padStart(3, '0')}`;
      commentRows.push({
        id: cid,
        postId: post.id,
        userId: demoUsers[(pi + j + 1) % demoUsers.length].id,
        content: pick(commentTexts, pi * 3 + j),
        createdAt: new Date(post.createdAt.getTime() + (j + 1) * 3 * HOUR),
      });
      if (j === 0 && pi % 3 !== 0) {
        commentNum++;
        commentRows.push({
          id: `demo-comment-${String(commentNum).padStart(3, '0')}`,
          postId: post.id,
          userId: post.userId ?? demoUsers[pi % demoUsers.length].id,
          content: pick(replyTexts, pi + j),
          parentId: cid,
          createdAt: new Date(post.createdAt.getTime() + (j + 1) * 3 * HOUR + HOUR),
        });
      }
    }
  });
  await prisma.comment.createMany({ data: commentRows });

  // ─── Saved Posts ───
  await prisma.savedPosts.deleteMany({ where: { id: { startsWith: 'demo-saved-' } } });
  const savedRows = [];
  for (let i = 0; i < 8; i++) {
    savedRows.push({
      id: `demo-saved-${String(i + 1).padStart(3, '0')}`,
      userId: demoUsers[(i * 2) % demoUsers.length].id,
      postId: postRows[(i * 3 + 1) % postRows.length].id,
      createdAt: daysAgo(i % 7, i),
    });
  }
  await prisma.savedPosts.createMany({ data: savedRows });

  // ─── Reviews ───
  await prisma.review.deleteMany({ where: { id: { startsWith: 'demo-review-' } } });
  const reviewBusinesses = await prisma.business.findMany({
    where: { reviewCount: { gt: 0 } },
    orderBy: { reviewCount: 'desc' },
    take: 10,
  });

  const reviewTexts = [
    'تجربة ممتازة من كل النواحي، تعامل راقي وخدمة سريعة. أنصح فيه بقوة!',
    'الجودة عالية والأسعار مناسبة، بس المواقف صعبة شوي في وقت الزحمة.',
    'ما شاء الله، كل شي منظم ونظيف والنتيجة فاقت توقعاتي.',
    'خدمة لطيفة لكن الانتظار كان أطول من المتوقع، عموماً التجربة جيدة.',
    'أفضل مكان جربته في المدينة، صرت زبونة دائمة عندهم 💕',
    'التعامل محترم والنتيجة مرضية، بس أتمنى يضيفون مواعيد مسائية أكثر.',
    'رائع! حجزت أونلاين وما انتظرت ولا دقيقة، تجربة سلسة من البداية للنهاية.',
    'الخدمة حلوة والمكان هادي ومرتب، بس الأسعار غالية شوي مقارنة بالمنافسين.',
    'الكادر محترف والنتيجة طبيعية جداً، عجبني أنهم يشرحون كل خطوة.',
    'تجربة عادية، مو سيئة ولا مبهرة. ممكن أرجع أجرب مرة ثانية.',
    'جنن! الديكور والرائحة والاهتمام بالتفاصيل، كل شي يعطي شعور بالفخامة.',
    'نتيجة ممتازة وسعر مناسب، بس لازم تحجزين قبل بفترة لأن المواعيد تمتلئ بسرعة.',
  ];

  const reviewRows: Prisma.ReviewCreateManyInput[] = [];
  let reviewNum = 0;
  reviewBusinesses.forEach((biz, bi) => {
    const ratings =
      biz.avgRating >= 4.8 ? [5, 5, 5, 5, 4, 5]
      : biz.avgRating >= 4.6 ? [5, 5, 4, 5, 4, 4]
      : biz.avgRating >= 4.4 ? [5, 4, 4, 5, 4, 3]
      : [4, 4, 3, 5, 4, 3];
    for (let j = 0; j < 6; j++) {
      reviewNum++;
      reviewRows.push({
        id: `demo-review-${String(reviewNum).padStart(3, '0')}`,
        businessId: biz.id,
        userId: demoUsers[(bi * 2 + j) % demoUsers.length].id,
        rating: ratings[j],
        comment: reviewTexts[(bi * 3 + j) % reviewTexts.length],
        createdAt: daysAgo((bi * 5 + j * 9) % 60, j % 10),
        updatedAt: daysAgo((bi * 5 + j * 9) % 60, j % 10),
      });
    }
  });
  await prisma.review.createMany({ data: reviewRows });
  console.log(`📝 ${postRows.length} posts, ${likeRows.length} likes, ${commentRows.length} comments, ${reviewRows.length} reviews created`);

  // ─── Services & Bookings ───
  await prisma.booking.deleteMany({ where: { id: { startsWith: 'demo-booking-' } } });
  await prisma.service.deleteMany({ where: { id: { startsWith: 'demo-service-' } } });

  const serviceCategories = await prisma.category.findMany({
    where: { slug: { in: ['lg-beauty-care', 'lg-health', 'lg-fitness', 'lg-spa'] } },
  });
  const serviceCategoryIds = serviceCategories.map((c) => c.id);
  const serviceBusinesses = await prisma.business.findMany({
    where: { categoryId: { in: serviceCategoryIds } },
    take: 10,
    orderBy: { reviewCount: 'desc' },
    include: { Category: true },
  });

  const serviceCatalog: Record<string, { name: string; price: number; duration: number; description: string }[]> = {
    'lg-beauty-care': [
      { name: 'قص وتصفيف الشعر', price: 150, duration: 60, description: 'قص وتصفيف احترافي يناسب ملامحك' },
      { name: 'مكياج سهرة كامل', price: 350, duration: 90, description: 'مكياج ثابت يدوم طوال المناسبة' },
      { name: 'جلسة عناية بالبشرة', price: 250, duration: 60, description: 'تنظيف عميق وترطيب للبشرة' },
      { name: 'مانيكير وباديكير', price: 120, duration: 45, description: 'عناية كاملة بالأظافر' },
      { name: 'صبغة كاملة مع عناية', price: 300, duration: 120, description: 'صبغة آمنة مع بروتين معالج' },
    ],
    'lg-health': [
      { name: 'استشارة أولية', price: 200, duration: 30, description: 'فحص وتشخيص مع خطة علاج' },
      { name: 'جلسة ليزر تبريدي', price: 450, duration: 45, description: 'إزالة الشعر بتقنية الليزر البارد' },
      { name: 'تقشير البشرة الطبي', price: 380, duration: 60, description: 'تقشير كيميائي بإشراف طبي' },
      { name: 'برنامج تغذية شهري', price: 600, duration: 60, description: 'خطة غذائية متابعة أسبوعية' },
    ],
    'lg-fitness': [
      { name: 'حصة بيلاتس جماعية', price: 90, duration: 60, description: 'تقوية العمود الفقري والجسم' },
      { name: 'تدريب شخصي (PT)', price: 180, duration: 60, description: 'برنامج مخصص مع مدربة معتمدة' },
      { name: 'حصة يوغا', price: 70, duration: 60, description: 'يوغا للمرونة والاسترخاء' },
      { name: 'اشتراك شهري شامل', price: 400, duration: 60, description: 'دخول غير محدود لجميع الحصص' },
    ],
    'lg-spa': [
      { name: 'مساج استرخائي كامل', price: 280, duration: 60, description: 'مساج بالزيوت الطبيعية' },
      { name: 'حمام مغربي تقليدي', price: 200, duration: 60, description: 'تقشير وترطيب عميق للجسم' },
      { name: 'ساونا وبخار', price: 120, duration: 45, description: 'تنقية الجسم من السموم' },
      { name: 'باقة العناية الملكية', price: 550, duration: 150, description: 'مساج + حمام مغربي + عناية بالجسم' },
    ],
  };

  const servicesByBusiness: { business: (typeof serviceBusinesses)[number]; services: { id: string; name: string; price: number }[] }[] = [];
  let serviceNum = 0;
  for (const biz of serviceBusinesses) {
    const catSlug = biz.Category?.slug ?? 'lg-beauty-care';
    const catalog = serviceCatalog[catSlug] ?? serviceCatalog['lg-beauty-care'];
    const count = 3 + (serviceNum % 3); // 3-5 services
    const created: { id: string; name: string; price: number }[] = [];
    for (let j = 0; j < Math.min(count, catalog.length); j++) {
      serviceNum++;
      const svc = catalog[j];
      const id = `demo-service-${String(serviceNum).padStart(3, '0')}`;
      await prisma.service.create({
        data: {
          id,
          businessId: biz.id,
          name: svc.name,
          description: svc.description,
          price: svc.price,
          duration: svc.duration,
          image: `https://picsum.photos/seed/service${serviceNum}/600/400`,
          isActive: true,
          updatedAt: new Date(),
        },
      });
      created.push({ id, name: svc.name, price: svc.price });
    }
    servicesByBusiness.push({ business: biz, services: created });
  }

  const bookingNotes = [
    null,
    'أفضل وقت العصر إذا ممكن',
    'أول مرة أجرب، أبي استشارة قبل الخدمة',
    'عندي حساسية بسيطة، أرجو مراعاتها',
    'مناسبة خاصة، أبي أفضل موعد متاح',
    'أرجو التأكيد قبل الموعد بيوم',
  ];
  const timeSlots = ['10:00 ص', '12:00 م', '02:30 م', '04:00 م', '06:30 م', '08:00 م'];

  const bookingRows: Prisma.BookingCreateManyInput[] = [];
  let bookingNum = 0;
  servicesByBusiness.forEach(({ business, services }, bi) => {
    for (let j = 0; j < 4; j++) {
      bookingNum++;
      const user = demoUsers[(bi * 3 + j * 2) % demoUsers.length];
      const svc = services[j % services.length];
      const status = j === 0 || j === 1 ? 'COMPLETED' : j === 2 ? 'CONFIRMED' : bi % 2 === 0 ? 'PENDING' : 'CANCELLED_BY_USER';
      const inPast = status === 'COMPLETED' || status === 'CANCELLED_BY_USER';
      const date = inPast ? daysAgo(2 + ((bi * 4 + j * 3) % 28)) : new Date(Date.now() + (1 + ((bi + j * 2) % 14)) * DAY);
      bookingRows.push({
        id: `demo-booking-${String(bookingNum).padStart(3, '0')}`,
        userId: user.id,
        businessId: business.id,
        serviceId: svc.id,
        date,
        time: timeSlots[(bi + j) % timeSlots.length],
        status,
        notes: pick(bookingNotes, bi * 4 + j),
        totalPrice: svc.price,
        paymentStatus: status === 'PENDING' ? 'UNPAID' : status === 'CANCELLED_BY_USER' ? 'REFUNDED' : 'PAID',
        createdAt: inPast ? new Date(date.getTime() - 3 * DAY) : daysAgo(1, bi),
        updatedAt: new Date(),
      });
    }
  });
  await prisma.booking.createMany({ data: bookingRows });

  // ─── Groups ───
  await prisma.group.deleteMany({ where: { id: { startsWith: 'demo-group-' } } });

  const groupsData = [
    { name: 'جمالكِ سيدتي', description: 'مجموعة لمشاركة نصائح العناية بالبشرة والشعر والمكياج، وجميع ما يخص الجمال', image: 'https://picsum.photos/seed/beautygroup/600/400', category: 'جمال' },
    { name: 'أمهات وملكات', description: 'مساحة آمنة للأمهات لمشاركة التجارب والتحديات اليومية في تربية الأطفال', image: 'https://picsum.photos/seed/mothersgroup/600/400', category: 'أمومة' },
    { name: 'أناقة وموضة', description: 'آخر صيحات الموضة، الإطلالات، وأفضل عروض الأزياء والعبايات', image: 'https://picsum.photos/seed/fashiongroup/600/400', category: 'موضة' },
    { name: 'وصفات صحية', description: 'وصفات طبخ صحية وسهلة التحضير مع نصائح التغذية السليمة', image: 'https://picsum.photos/seed/healthfood/600/400', category: 'صحة' },
  ];

  for (let g = 0; g < groupsData.length; g++) {
    const group = await prisma.group.create({
      data: {
        id: `demo-group-${String(g + 1).padStart(3, '0')}`,
        ...groupsData[g],
        isPublic: true,
        createdAt: daysAgo(30 - g * 3),
        updatedAt: new Date(),
      },
    });

    // Members: subset of demo users + one business owner in the first group
    const memberIds: { userId: string; role: 'ADMIN' | 'MEMBER' | 'MODERATOR' }[] = [];
    for (let j = 0; j < 7; j++) {
      memberIds.push({ userId: demoUsers[(g * 3 + j * 2) % demoUsers.length].id, role: j === 0 ? 'ADMIN' : 'MEMBER' });
    }
    if (g === 0 && bizBySlug['lamset-naema-salon']) {
      memberIds.push({ userId: bizBySlug['lamset-naema-salon'].User.id, role: 'MEMBER' });
    }
    const uniqueMembers = new Map<string, { userId: string; role: 'ADMIN' | 'MEMBER' | 'MODERATOR' }>();
    for (const m of memberIds) uniqueMembers.set(m.userId, m);
    await prisma.groupMember.createMany({
      data: Array.from(uniqueMembers.values()).map((m, idx) => ({
        id: `demo-gmember-${g + 1}-${idx + 1}`,
        groupId: group.id,
        userId: m.userId,
        role: m.role,
        joinedAt: daysAgo(28 - g * 3 - idx, idx),
      })),
    });

    const groupPostsContent = [
      ['أهلاً بكل عضوات المجموعة! شاركونا روتينكم الصباحي للعناية بالبشرة 🌸', 'جربت منتج جديد للترطيب العميق، النتيجة بعد أسبوع مذهلة! رأيكم بالتفاصيل في الصورة'],
      ['أول يوم دراسي لأطفالي، شاركوني نصائحكم للتعامل مع رهبة الأسبوع الأول 🎒', 'أفضل نشاطات داخلية للأطفال في أيام الصيف؟ أبي أفكار تخليهم مشغولين'],
      ['إطلالة اليوم: عباية كلاسيك مع حجاب مطابق، البساطة أحياناً أرقى إطلالة ✨', 'وين أحصل على فساتين سهرة بأسعار معقولة في جدة؟'],
      ['وصفة الغداء: صدر دجاج بالكينوا والخضار، ٢٥ دقيقة وتكون جاهزة 🥗', 'بدائل صحية للسكر في الحلويات؟ أبي أخفف السكر بدون ما يخرب الطعم'],
    ];
    for (let j = 0; j < groupPostsContent[g].length; j++) {
      await prisma.groupPosts.create({
        data: {
          id: `demo-gpost-${g + 1}-${j + 1}`,
          groupId: group.id,
          userId: demoUsers[(g + j) % demoUsers.length].id,
          content: groupPostsContent[g][j],
          images: j % 2 === 0 ? JSON.stringify([`https://picsum.photos/seed/gpost${g}${j}/600/400`]) : undefined,
          createdAt: daysAgo((g * 2 + j * 3) % 20, j * 4),
        },
      });
    }

    const groupMsgs = [
      'أهلاً بالجميع! 🌷',
      'أهلاً وسهلاً، سعيدة بالانضمام',
      'مجموعة رائعة، الله يبارك فيكم',
      'شاركت منشور جديد أتمنى تعطوني رأيكم',
      'ما شاء الله تفاعل حلو هنا',
    ];
    for (let j = 0; j < 4; j++) {
      await prisma.groupMessage.create({
        data: {
          id: `demo-gmsg-${g + 1}-${j + 1}`,
          groupId: group.id,
          senderId: demoUsers[(g + j * 3) % demoUsers.length].id,
          content: groupMsgs[j],
          replyToId: j === 2 ? `demo-gmsg-${g + 1}-1` : undefined,
          createdAt: new Date(Date.now() - (4 - j) * 5 * HOUR),
        },
      });
    }
  }

  // ─── Conversations & Messages ───
  await prisma.conversation.deleteMany({ where: { id: { startsWith: 'demo-conv-' } } });

  const convPairs = [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13]];
  const convScripts: string[][] = [
    ['أهلاً سارة! شلونك؟', 'الحمد لله، وأنتِ؟ وش أخبار الدورة؟', 'خلصتها أمس ولله الحمد، استفدت كثير', 'ماشاء الله! أرسلي لي التفاصيل أبي أشترك بالدفعة الجاية', 'أكيد، بأرسل لك رابط التسجيل اليوم'],
    ['ريم، وينك عن النادي؟ 😅', 'ههههه أعرف، انشغلت هالأسبوع بس ب ارجع الأحد', 'لا تتأخرين، المدربة سألت عنك', 'تسلمين، أحجز حصة بكرة الصبح إن شاء الله'],
    ['العنود، عندي استفسار قانوني سريع لو تسمحين', 'تفضلي يا لطيفة، أنا جاهزة', 'عندي عقد إيجار وصاحب العقار يبي يطلعني بدون سبب', 'لا يحق له، العقد ساري والقانون معك. أرسلي لي نسخة من العقد وأراجعه لك'],
    ['مها! وين صور البارحة؟ 🥰', 'ههههه أرسلتها لك قبل شوي، شيكي الواتساب', 'وصلت! ما شاء الله الصور طلعت حلوة', 'الفضل لعين المصورة 😄'],
    ['وجدان، جربتي عطور العربية اللي حكيت لك عنها؟', 'جربتها أمس! الثبات فعلاً قوي', 'صحيح؟ قلت لك! بشري ولا أسعارهم عندهم خصم', 'بروح لهم نهاية الأسبوع، تعالي معي'],
    ['شهد، أبي مكياج خفيف لمناسبة عائلية، كم سعرك؟', 'السهرة الخفيفة ٢٥٠، وأحجز لك موعد الخميس إذا تبين', 'تم، الثلاثاء أحسن لي', 'أوكي، تم حجز الثلاثاء الساعة ٥'],
    ['دانة، وين رحتوا البارحة؟ شفت سناباتكم', 'كورنيش جدة! الجو كان خيالي', 'عيل أول مرة أعرف! أبي التفاصيل كاملة', 'ههههه بأحكي لك كل شي، بس القهوة عليك'],
  ];

  for (let c = 0; c < convPairs.length; c++) {
    const [a, b] = convPairs[c];
    const script = convScripts[c];
    const conversation = await prisma.conversation.create({
      data: {
        id: `demo-conv-${String(c + 1).padStart(3, '0')}`,
        isGroup: false,
        createdAt: daysAgo(20 - c),
        updatedAt: new Date(Date.now() - (c % 3) * HOUR),
      },
    });

    await prisma.conversationParticipant.createMany({
      data: [
        { id: `demo-cpart-${c + 1}-1`, conversationId: conversation.id, userId: demoUsers[a].id, lastReadAt: new Date(Date.now() - HOUR) },
        { id: `demo-cpart-${c + 1}-2`, conversationId: conversation.id, userId: demoUsers[b].id, lastReadAt: new Date(Date.now() - (c % 3) * HOUR) },
      ],
    });

    const msgRows = script.map((content, j) => ({
      id: `demo-msg-${c + 1}-${j + 1}`,
      conversationId: conversation.id,
      senderId: j % 2 === 0 ? demoUsers[a].id : demoUsers[b].id,
      content,
      replyToId: j === 3 && script.length > 4 ? `demo-msg-${c + 1}-2` : undefined,
      createdAt: new Date(Date.now() - (script.length - j) * 4 * HOUR - c * 30 * 60000),
    }));
    await prisma.message.createMany({ data: msgRows });
  }
  console.log(`💼 ${serviceNum} services, ${bookingRows.length} bookings, ${servicesByBusiness.length} businesses with services, ${convPairs.length} conversations`);

  // ─── Stories ───
  await prisma.story.deleteMany({ where: { id: { startsWith: 'demo-story-' } } });

  const storyOwners: { userId: string; seed: string }[] = [];
  for (let i = 0; i < 10; i++) storyOwners.push({ userId: demoUsers[i].id, seed: `story${i}` });
  const storyBusinessOwners = businesses.slice(0, 5);
  storyBusinessOwners.forEach((b, i) => storyOwners.push({ userId: b.User.id, seed: `bizstory${i}` }));

  const storyRows = storyOwners.map((owner, i) => ({
    id: `demo-story-${String(i + 1).padStart(3, '0')}`,
    userId: owner.userId,
    mediaUrl: `https://picsum.photos/seed/${owner.seed}/600/800`,
    type: 'IMAGE' as const,
    duration: 5 + (i % 6),
    createdAt: new Date(Date.now() - i * 1.7 * HOUR),
    expiresAt: new Date(Date.now() - i * 1.7 * HOUR + 24 * HOUR),
  }));
  await prisma.story.createMany({ data: storyRows });

  // ─── Professional Profiles ───
  await prisma.professionalProfile.deleteMany({ where: { id: { startsWith: 'demo-prof-' } } });

  const profData = [
    { userIdx: 0, title: 'خبيرة تجميل معتمدة', categorySlug: 'lg-beauty-care', skills: 'مكياج احترافي,تصفيف شعر,عناية بالبشرة', services: 'مكياج سهرات,مكياج عرائس,دورات مكياج شخصي', verified: true, years: 8 },
    { userIdx: 1, title: 'مصممة أزياء', categorySlug: 'lg-fashion', skills: 'تصميم فساتين,تنسيق ألوان,خياطة', services: 'تصميم فساتين سهرة,تعديل أزياء,استشارات أناقة', verified: true, years: 6 },
    { userIdx: 2, title: 'مدربة لياقة بدنية', categorySlug: 'lg-fitness', skills: 'بيلاتس,تدريب قوة,تغذية رياضية', services: 'حصص تدريب شخصي,برامج لياقة منزلية,استشارات تغذية', verified: false, years: 5 },
    { userIdx: 3, title: 'محامية ومستشارة قانونية', categorySlug: 'legal-consulting', skills: 'قضايا أحوال شخصية,عقود,قانون تجاري', services: 'استشارات قانونية,صياغة عقود,تمثيل قضائي', verified: true, years: 10 },
    { userIdx: 4, title: 'مصورة فوتوغرافية', categorySlug: 'design-creativity', skills: 'تصوير بورتريه,تصوير مناسبات,معالجة صور', services: 'جلسات تصوير شخصية,تصوير أعراس,تصوير منتجات', verified: false, years: 4 },
    { userIdx: 5, title: 'أخصائية تغذية علاجية', categorySlug: 'lg-health', skills: 'تغذية علاجية,خطط دايت,تغذية رياضية', services: 'برامج تغذية شهرية,استشارات أونلاين,متابعة أسبوعية', verified: true, years: 7 },
  ];

  for (let i = 0; i < profData.length; i++) {
    const p = profData[i];
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    const user = demoUsers[p.userIdx];
    await prisma.professionalProfile.create({
      data: {
        id: `demo-prof-${String(i + 1).padStart(3, '0')}`,
        userId: user.id,
        title: p.title,
        bio: `${p.title} بخبرة ${p.years} سنوات، أقدم خدماتي باحترافية وجودة عالية. للتواصل عبر الرسائل.`,
        categoryId: category?.id,
        skills: p.skills,
        services: p.services,
        keywords: p.skills,
        experienceYears: p.years,
        workScope: 'BOTH',
        countryId: saudi.id,
        city: demoUsersData[p.userIdx].city,
        willingToTravel: i % 2 === 0,
        languages: 'العربية,الإنجليزية',
        phone: `+9665${String(1000000 + i * 111111).slice(0, 8)}`,
        availableForWork: true,
        availableForHiring: true,
        availableForFreelance: true,
        availableForConsultation: true,
        completedProjectsCount: 20 + i * 15,
        clientsCount: 15 + i * 10,
        isPublicOnGateway: true,
        status: 'ACTIVE',
        isVerified: p.verified,
        createdAt: daysAgo(60 - i * 5),
        updatedAt: new Date(),
      },
    });
  }

  // ─── Business Subscriptions ───
  await prisma.businessSubscription.deleteMany({ where: { id: { startsWith: 'demo-sub-' } } });
  const premiumPlan = await prisma.subscriptionPlan.findFirst({ orderBy: { price: 'desc' } });
  if (premiumPlan) {
    const subscribedBusinesses = await prisma.business.findMany({
      orderBy: { reviewCount: 'desc' },
      take: 8,
    });
    for (let i = 0; i < subscribedBusinesses.length; i++) {
      const biz = subscribedBusinesses[i];
      await prisma.businessSubscription.create({
        data: {
          id: `demo-sub-${String(i + 1).padStart(3, '0')}`,
          businessId: biz.id,
          planId: premiumPlan.id,
          userId: biz.userId,
          startsAt: daysAgo(10 + i),
          expiresAt: new Date(Date.now() + (20 - i) * DAY),
          isActive: true,
          autoRenew: i % 2 === 0,
          updatedAt: new Date(),
        },
      });
    }
  }

  // ─── Notifications ───
  await prisma.notification.deleteMany({ where: { id: { startsWith: 'demo-notif-' } } });

  const notifTemplates: { type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MESSAGE' | 'BOOKING' | 'BOOKING_UPDATE' | 'REVIEW' | 'SYSTEM' | 'PROMOTION' | 'GROUP_INVITE'; title: string; body: string }[] = [
    { type: 'LIKE', title: 'إعجاب جديد', body: 'أعجبت سارة العتيبي بمنشورك' },
    { type: 'COMMENT', title: 'تعليق جديد', body: 'علّقت نورة القحطاني على منشورك: "ما شاء الله، يجنن!"' },
    { type: 'FOLLOW', title: 'متابعة جديدة', body: 'بدأت ريم الشهري بمتابعتك' },
    { type: 'MESSAGE', title: 'رسالة جديدة', body: 'وصلتك رسالة جديدة من العنود الدوسري' },
    { type: 'BOOKING', title: 'تأكيد حجز', body: 'تم تأكيد حجزك في صالون لمسة ناعمة' },
    { type: 'BOOKING_UPDATE', title: 'تحديث الحجز', body: 'تم إلغاء حجزك بناءً على طلبك، وتم استرداد المبلغ' },
    { type: 'REVIEW', title: 'تقييم جديد', body: 'أضافت جوهرة المطيري تقييماً جديداً لنشاطك التجاري' },
    { type: 'SYSTEM', title: 'مرحباً بك في Gateo', body: 'أكملي ملفك الشخصي لتحصلي على شارة العضو الجديد' },
    { type: 'PROMOTION', title: 'عرض خاص لك', body: 'خصم 20% على باقات السبا هذا الأسبوع فقط' },
    { type: 'GROUP_INVITE', title: 'دعوة مجموعة', body: 'دعتك حصة العنزي للانضمام إلى مجموعة أمهات وملكات' },
  ];

  const notifRows: Prisma.NotificationCreateManyInput[] = [];
  for (let i = 0; i < 30; i++) {
    const t = notifTemplates[i % notifTemplates.length];
    notifRows.push({
      id: `demo-notif-${String(i + 1).padStart(3, '0')}`,
      userId: demoUsers[i % demoUsers.length].id,
      type: t.type,
      title: t.title,
      body: t.body,
      data: JSON.stringify({ demo: true, index: i }),
      isRead: i % 3 !== 0,
      createdAt: new Date(Date.now() - i * 5 * HOUR),
    });
  }
  await prisma.notification.createMany({ data: notifRows });

  // ─── Points & Gamification ───
  await prisma.pointTransaction.deleteMany({ where: { id: { startsWith: 'demo-ptx-' } } });
  await prisma.userBadge.deleteMany({ where: { id: { startsWith: 'demo-ubadge-' } } });

  const ptxRows: Prisma.PointTransactionCreateManyInput[] = [];
  const ptxReasons: { reason: string; amount: number; type: 'EARN' | 'SPEND' | 'BONUS' }[] = [
    { reason: 'نشر منشور جديد', amount: 10, type: 'EARN' },
    { reason: 'كتابة تقييم جديد', amount: 15, type: 'EARN' },
    { reason: 'إتمام حجز بنجاح', amount: 25, type: 'EARN' },
    { reason: 'إعجاب على منشورك', amount: 5, type: 'EARN' },
    { reason: 'مكافأة الأسبوع', amount: 50, type: 'BONUS' },
    { reason: 'استبدال نقاط بخصم', amount: -40, type: 'SPEND' },
    { reason: 'إضافة تعليق', amount: 5, type: 'EARN' },
    { reason: 'متابعة جديدة', amount: 5, type: 'EARN' },
    { reason: 'إتمام ملفك الشخصي', amount: 30, type: 'EARN' },
    { reason: 'دعوة صديقة للمنصة', amount: 100, type: 'BONUS' },
  ];
  for (let i = 0; i < 20; i++) {
    const r = ptxReasons[i % ptxReasons.length];
    ptxRows.push({
      id: `demo-ptx-${String(i + 1).padStart(3, '0')}`,
      userId: demoUsers[(i * 2) % demoUsers.length].id,
      amount: r.amount,
      reason: r.reason,
      type: r.type,
      referenceId: `demo-ref-${i + 1}`,
      createdAt: new Date(Date.now() - i * 9 * HOUR),
    });
  }
  await prisma.pointTransaction.createMany({ data: ptxRows });

  const badgeAssignments: [number, string][] = [
    [0, 'New Member'], [0, 'First Post'], [0, 'Reviewer'],
    [1, 'New Member'], [1, 'Top Fan'],
    [2, 'New Member'], [2, 'Booker'], [2, 'Reviewer'],
    [3, 'New Member'], [3, 'First Post'],
    [4, 'New Member'], [4, 'Loyal Customer'],
    [5, 'New Member'], [5, 'Social Butterfly'], [5, 'Reviewer'],
  ];
  for (let i = 0; i < badgeAssignments.length; i++) {
    const [userIdx, badgeName] = badgeAssignments[i];
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (!badge) continue;
    await prisma.userBadge.create({
      data: {
        id: `demo-ubadge-${String(i + 1).padStart(3, '0')}`,
        userId: demoUsers[userIdx].id,
        badgeId: badge.id,
        createdAt: daysAgo(14 - (i % 14)),
      },
    });
  }

  // ─── Demo Ads ───
  const adsData: { id: string; bizSlug: string; title: string; description: string; image: string; placement: 'FEED' | 'SIDEBAR' | 'HERO' | 'BANNER' | 'BUSINESS_LISTING' }[] = [
    {
      id: 'demo-ad-001',
      bizSlug: 'perfumes-arabia',
      title: 'عطور العربية - عروض نهاية الأسبوع',
      description: 'خصومات تصل إلى 30% على أرقى العطور الشرقية والفرنسية. تسوّقي الآن واستمتعي بشحن مجاني.',
      image: 'https://picsum.photos/seed/adperfume/600/400',
      placement: 'FEED',
    },
    {
      id: 'demo-ad-002',
      bizSlug: 'beauty-academy',
      title: 'أكاديمية التجميل - سجلي في دورات الخريف',
      description: 'دورات مكياج وتصفيف احترافية بشهادات معتمدة مع أفضل المدربات. مقاعد محدودة!',
      image: 'https://picsum.photos/seed/adacademy/600/400',
      placement: 'SIDEBAR',
    },
    {
      id: 'demo-ad-003',
      bizSlug: 'fsatin-laylat-alomr',
      title: 'فساتين ليلة العمر - تشكيلة الموسم الجديدة',
      description: 'أحدث موديلات فساتين السهرة والأعراس للإيجار والبيع. اكتشفي تشكيلتنا الآن.',
      image: 'https://picsum.photos/seed/addresses/600/400',
      placement: 'FEED',
    },
  ];

  for (const ad of adsData) {
    const biz = bizBySlug[ad.bizSlug] ?? (await prisma.business.findUnique({ where: { slug: ad.bizSlug }, include: { User: true } }));
    if (!biz) continue;
    await prisma.ad.upsert({
      where: { id: ad.id },
      update: {},
      create: {
        id: ad.id,
        userId: biz.User.id,
        businessId: biz.id,
        title: ad.title,
        description: ad.description,
        image: ad.image,
        link: `/business/${ad.bizSlug}`,
        buttonText: 'اعرف المزيد',
        advertiserName: biz.name,
        advertiserLogo: biz.logo,
        placement: ad.placement,
        status: 'ACTIVE',
        startAt: daysAgo(3),
        endAt: new Date(Date.now() + 60 * DAY),
        impressions: 1200 + adsData.indexOf(ad) * 450,
        clicks: 85 + adsData.indexOf(ad) * 30,
        isPaid: true,
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Demo seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
