import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Reliable image helpers using picsum + ui-avatars fallback
const picsum = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const avatar = (index: number) => {
  const gender = index % 2 === 0 ? 'men' : 'women';
  const id = (index % 50) + 1;
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
};

const businessImageSeeds: Record<string, string[]> = {
  medical: ['medical-1', 'medical-2', 'medical-3', 'medical-4'],
  legal: ['legal-1', 'legal-2', 'legal-3'],
  tech: ['tech-1', 'tech-2', 'tech-3'],
  engineering: ['engineering-1', 'engineering-2', 'engineering-3'],
  creative: ['creative-1', 'creative-2', 'creative-3'],
  craft: ['craft-1', 'craft-2', 'craft-3'],
  education: ['education-1', 'education-2', 'education-3'],
  financial: ['financial-1', 'financial-2', 'financial-3'],
  agricultural: ['agri-1', 'agri-2', 'agri-3'],
  logistic: ['logistic-1', 'logistic-2', 'logistic-3'],
};

const ownerAvatarNames = [
  'Ahmad Al-Khaldi', 'Sara Al-Otaibi', 'Fahd Al-Qahtani', 'Nora Al-Shammari',
  'Abdullah Al-Anzi', 'Khalid Al-Subaie', 'Sultan Al-Dosari', 'Nasser Al-Harbi',
  'Yasser Al-Maliki', 'Lama Al-Zahrani', 'Saad Al-Otaibi', 'Bander Al-Qahtani',
  'Mona Al-Harbi', 'Fahd Al-Mutairi', 'Abdulrahman Al-Shahrani', 'Majed Al-Ali',
];

const professionalBusinesses = [
  // Medical
  {
    name: 'عيادة ابتسامة المستقبل',
    slug: 'ibtisamat-mustaqbal-clinic',
    categorySlug: 'medical-services',
    subcategorySlug: 'general-clinics',
    ownerName: 'د. أحمد الخالدي',
    city: 'الرياض',
    address: 'حي العليا، طريق الملك فهد',
    phone: '0501112222',
    email: 'info@ibtisamat-clinic.demo',
    description: 'عيادة أسنان متخصصة تقدم خدمات تجميل الأسنان، زراعة الأسنان، وتقويم الأسنان بأحدث التقنيات العالمية وفريق طبي متمرس.',
    imagesKey: 'medical',
    workExperience: [
      { title: 'استشاري طب وجراحة الفم', company: 'مدينة الملك سعود الطبية', years: 8, description: 'إجراء أكثر من 2000 عملية زراعة وتجميل أسنان مع معدل نجاح يتجاوز 98%.' },
      { title: 'أخصائي تقويم الأسنان', company: 'مستشفى الدكتور سليمان الحبيب', years: 5, description: 'تصميم خطط علاجية شخصية لأكثر من 1500 حالة تقويم.' },
    ],
    services: [
      { name: 'تبييض الأسنان', description: 'جلسة تبييض احترافية بنتائج فورية', price: 699, duration: 60 },
      { name: 'زراعة الأسنان', description: 'زراعة بمواد عالمية مع ضمان 10 سنوات', price: 3500, duration: 120 },
      { name: 'تقويم الأسنان الشفاف', description: 'تقويم invisible يناسب العمل والمناسبات', price: 8500, duration: 30 },
    ],
  },
  {
    name: 'مركز الجلدية والليزر',
    slug: 'derma-laser-center',
    categorySlug: 'medical-services',
    subcategorySlug: 'home-medical-services',
    ownerName: 'د. سارة العتيبي',
    city: 'جدة',
    address: 'حي الروضة، شارع التحلية',
    phone: '0502223333',
    email: 'contact@dermalaser.demo',
    description: 'مركز متخصص في علاج مشاكل البشرة، إزالة الشعر بالليزر، وتقشير البشرة بأحدث الأجهزة المعتمدة.',
    imagesKey: 'medical',
    workExperience: [
      { title: 'استشارية الأمراض الجلدية', company: 'مستشفى الملك فهد', years: 7, description: 'علاج آلاف الحالات المزمنة والتجميلية للبشرة.' },
    ],
    services: [
      { name: 'إزالة الشعر بالليزر', description: 'جلسة لمنطقة واحدة بجهاز FDA معتمد', price: 450, duration: 45 },
      { name: 'تقشير كيميائي', description: 'تقشير طبي للبشرة الدهنية والمسام الواسعة', price: 550, duration: 40 },
      { name: 'حقن البلازما', description: 'علاج تساقط الشعر وتجديد البشرة', price: 900, duration: 60 },
    ],
  },
  // Legal
  {
    name: 'مكتب المحامي فهد القحطاني',
    slug: 'fahd-alqahtani-law',
    categorySlug: 'legal-services',
    subcategorySlug: 'legal-consultations',
    ownerName: 'فهد القحطاني',
    city: 'الرياض',
    address: 'حي الصحافة، برج المملكة',
    phone: '0503334444',
    email: 'legal@fahd-law.demo',
    description: 'مكتب محاماة يقدم استشارات قانونية وتوثيق عقود وقضايا مدنية وتجارية بخبرة تزيد عن 12 عاماً.',
    imagesKey: 'legal',
    workExperience: [
      { title: 'محامٍ واستشاري قانوني', company: 'مكتب المشاري القانوني', years: 9, description: 'تمثيل في قضايا الشركات والعقود بقيمة تتجاوز 500 مليون ريال.' },
      { title: 'قاضٍ مساعد سابق', company: 'وزارة العدل', years: 4, description: 'الاطلاع العميق على الإجراءات القضائية والتحكيم.' },
    ],
    services: [
      { name: 'استشارة قانونية', description: 'استشارة مدتها ساعة مع دراسة مستندات', price: 500, duration: 60 },
      { name: 'صياغة عقد', description: 'عقد تجاري أو عقاري مخصص مع مراجعة قانونية', price: 1200, duration: 120 },
      { name: 'تمثيل قضائي', description: 'متابعة قضية واحدة في المحكمة المختصة', price: 5000, duration: 0 },
    ],
  },
  {
    name: 'توثيق للخدمات القانونية',
    slug: 'tawtheeq-legal',
    categorySlug: 'legal-services',
    subcategorySlug: 'notarization-contracts',
    ownerName: 'نورة الشمري',
    city: 'الدمام',
    address: 'حي الفيصلية، شارع الملك سعود',
    phone: '0504445555',
    email: 'hello@tawtheeq.demo',
    description: 'خدمات توثيق وإعداد العقود والاتفاقيات التجارية بسرعة ودقة عالية.',
    imagesKey: 'legal',
    workExperience: [
      { title: 'كاتبة عدل', company: 'كتابة العدل الأولى بالدمام', years: 6, description: 'توثيق آلاف العقود والوكالات والإقرارات.' },
    ],
    services: [
      { name: 'توثيق عقد عمل', description: 'إعداد ومراجعة عقود العمل وفق أنظمة العمل', price: 350, duration: 30 },
      { name: 'إعداد اتفاقية سرية', description: 'NDA مخصص لحماية الأعمال والبيانات', price: 600, duration: 60 },
      { name: 'توثيق وكالة', description: 'وكالة عامة أو خاصة مع التوجيه للكتابة', price: 250, duration: 30 },
    ],
  },
  // Tech
  {
    name: 'حلول تقنية المستقبل',
    slug: 'future-tech-solutions',
    categorySlug: 'technical-services',
    subcategorySlug: 'software-development',
    ownerName: 'عبدالله العنزي',
    city: 'الرياض',
    address: 'حي الملقا، طريق الأمير محمد بن سلمان',
    phone: '0505556666',
    email: 'info@futuretech.demo',
    description: 'شركة برمجة متخصصة في تطوير التطبيقات والمواقع الإلكترونية وحلول الأعمال الرقمية.',
    imagesKey: 'tech',
    workExperience: [
      { title: 'مهندس برمجيات رئيسي', company: 'STC Pay', years: 6, description: 'بناء وتوسيع أنظمة الدفع الرقمي لملايين المستخدمين.' },
      { title: 'مؤسس ومدير تقني', company: 'حلول تقنية المستقبل', years: 4, description: 'إدارة فريق من 25 مطوراً وتسليم أكثر من 80 مشروعاً.' },
    ],
    services: [
      { name: 'تطوير موقع إلكتروني', description: 'موقع متجاوب مع لوحة تحكم كاملة', price: 5000, duration: 0 },
      { name: 'تطوير تطبيق جوال', description: 'تطبيق iOS وAndroid بخاصية Flutter', price: 15000, duration: 0 },
      { name: 'استشارة تقنية', description: 'دراسة الحلول التقنية وأفضل الممارسات', price: 800, duration: 60 },
    ],
  },
  {
    name: 'درع الأمن السيبراني',
    slug: 'cyber-shield-sa',
    categorySlug: 'technical-services',
    subcategorySlug: 'network-cybersecurity',
    ownerName: 'خالد السبيعي',
    city: 'جدة',
    address: 'حي الشاطئ، كورنيش جدة',
    phone: '0506667777',
    email: 'security@cybershield.demo',
    description: 'حماية البنية التحتية الرقمية للشركات من خلال اختبار الاختراق والمراقبة الأمنية.',
    imagesKey: 'tech',
    workExperience: [
      { title: 'خبير أمن سيبراني', company: 'SABIC', years: 7, description: 'تصميم استراتيجيات الأمن السيبراني والاستجابة للحوادث.' },
    ],
    services: [
      { name: 'اختبار اختراق', description: 'فحص ثغرات المواقع والشبكات وتقرير مفصل', price: 4000, duration: 0 },
      { name: 'تدريب موظفين أمني', description: 'ورشة توعية بالهندسة الاجتماعية والتهديدات', price: 2500, duration: 180 },
      { name: 'مراجعة أمنية شاملة', description: 'تقييم شامل للسياسات والبنية التحتية', price: 6000, duration: 0 },
    ],
  },
  // Engineering
  {
    name: 'بصمة معمارية',
    slug: 'basmah-architecture',
    categorySlug: 'engineering-services',
    subcategorySlug: 'architectural-design',
    ownerName: 'م. سلطان الدوسري',
    city: 'الرياض',
    address: 'حي الياسمين، طريق الملك عبدالعزيز',
    phone: '0507778888',
    email: 'design@basmah.demo',
    description: 'تصميم معماري داخلي وخارجي للفلل والمشاريع التجارية بأسلوب عصري يجمع بين الجمال والوظيفة.',
    imagesKey: 'engineering',
    workExperience: [
      { title: 'مهندس معماري رئيسي', company: 'دار الهندسة', years: 10, description: 'تصميم أكثر من 200 مشروع سكني وتجاري.' },
    ],
    services: [
      { name: 'تصميم فيلا سكنية', description: 'مخططات معمارية وديكور داخلي كامل', price: 18000, duration: 0 },
      { name: 'تصميم مكتب تجاري', description: 'تخطيط المساحات والإنارة والديكور', price: 12000, duration: 0 },
      { name: 'استشارة تصميم', description: 'زيارة موقع واقتراحات مبدئية', price: 1000, duration: 90 },
    ],
  },
  {
    name: 'إشراف هندسي دقيق',
    slug: 'dqiq-engineering',
    categorySlug: 'engineering-services',
    subcategorySlug: 'engineering-supervision',
    ownerName: 'م. ناصر الحربي',
    city: 'جدة',
    address: 'حي الروضة، شارع الأمير سلطان',
    phone: '0508889999',
    email: 'supervision@dqiq.demo',
    description: 'إشراف هندسي شامل على المشاريع الإنشائية لضمان الجودة والالتزام بالمخططات والمواصفات.',
    imagesKey: 'engineering',
    workExperience: [
      { title: 'مهندس إشراف', company: 'شركة بن لادن', years: 8, description: 'إشراف على مشاريع سكنية وتجارية بقيمة تتجاوز 300 مليون ريال.' },
    ],
    services: [
      { name: 'إشراف شهري', company: 'زيارات دورية وتقارير إنجاز', price: 4000, duration: 0 },
      { name: 'مراجعة مخططات', description: 'مراجعة هندسية للمخططات المعمارية والإنشائية', price: 2500, duration: 0 },
      { name: 'استلام مشروع', description: 'فحص شامل قبل الاستلام النهائي', price: 3500, duration: 0 },
    ],
  },
  // Creative
  {
    name: 'عدسة الإبداع',
    slug: 'adlat-alibdaa-studio',
    categorySlug: 'creative-services',
    subcategorySlug: 'photography',
    ownerName: 'ياسر المالكي',
    city: 'الرياض',
    address: 'حي الملقا، طريق الأمير تركي',
    phone: '0509990000',
    email: 'book@adlat.demo',
    description: 'استوديو تصوير احترافي للمناسبات والأزياء والمنتجات مع خدمات المونتاج والتعديل.',
    imagesKey: 'creative',
    workExperience: [
      { title: 'مصور فوتوغرافي', company: 'وكالة الأنباء السعودية', years: 7, description: 'تغطية مناسبات رسمية وحملات إعلانية كبرى.' },
    ],
    services: [
      { name: 'تصوير منتجات', description: '10 صور احترافية للمتاجر الإلكترونية', price: 1200, duration: 120 },
      { name: 'تصوير مناسبة', description: 'تغطية مصورة لمدة 4 ساعات', price: 2500, duration: 240 },
      { name: 'جلسة تصوير شخصية', description: 'جلسة في الاستوديو مع المكياج', price: 900, duration: 90 },
    ],
  },
  {
    name: 'تصميمات لمسة فن',
    slug: 'lamset-fan-design',
    categorySlug: 'creative-services',
    subcategorySlug: 'graphic-design',
    ownerName: 'لمى الزهراني',
    city: 'الدمام',
    address: 'حي الشاطئ، مجمع الشاطئ',
    phone: '0510001111',
    email: 'design@lamsetfan.demo',
    description: 'مصممة جرافيك متخصصة في الهوية البصرية والتصميمات الإعلانية والسوشيال ميديا.',
    imagesKey: 'creative',
    workExperience: [
      { title: 'مصممة هوية بصرية', company: 'وكالة إعلانية عالمية', years: 6, description: 'تصميم هويات بصرية لأكثر من 50 علامة تجارية.' },
    ],
    services: [
      { name: 'تصميم هوية بصرية', description: 'شعار + ألوان + خطوط + هوية كاملة', price: 3500, duration: 0 },
      { name: 'تصميم سوشيال ميديا', description: '20 تصميم احترافي للمنصات', price: 900, duration: 0 },
      { name: 'تصميم بروفايل شركة', description: 'بروفايل احترافي بصيغة PDF وطباعة', price: 1800, duration: 0 },
    ],
  },
  // Craft
  {
    name: 'كهربائي منزلك',
    slug: 'kahraba-manzelik',
    categorySlug: 'craft-services',
    subcategorySlug: 'electrical-works',
    ownerName: 'سعد العتيبي',
    city: 'الرياض',
    address: 'خدمات منزلية متنقلة - جميع الأحياء',
    phone: '0511112222',
    email: 'service@kahraba.demo',
    description: 'فني كهربائي معتمد لتأسيس وصيانة التمديدات الكهربائية المنزلية والتجارية بأمان واحترافية.',
    imagesKey: 'craft',
    workExperience: [
      { title: 'فني كهربائي', company: 'شركة الكهرباء السعودية', years: 9, description: 'تركيب وصيانة شبكات كهربائية لآلاف المنازل.' },
    ],
    services: [
      { name: 'صيانة كهربائية', description: 'كشف وإصلاح أعطال المنزل', price: 200, duration: 60 },
      { name: 'تأسيس كهرباء', description: 'تمديدات كاملة للفلل والشقق', price: 2500, duration: 0 },
      { name: 'تركيب إنارة ديكور', description: 'إنارة داخلية وخارجية بجودة عالية', price: 450, duration: 90 },
    ],
  },
  {
    name: 'سباك صحي',
    slug: 'sabak-saheh',
    categorySlug: 'craft-services',
    subcategorySlug: 'plumbing',
    ownerName: 'بندر القحطاني',
    city: 'جدة',
    address: 'خدمات منزلية متنقلة - جميع الأحياء',
    phone: '0512223333',
    email: 'fix@sabak.demo',
    description: 'خدمات سباكة وصيانة الأعطال المنزلية بسرعة وكفاءة مع ضمان على الأعمال.',
    imagesKey: 'craft',
    workExperience: [
      { title: 'فني سباكة', company: 'مؤسسة مقاولات', years: 8, description: 'تأسيس وصيانة شبكات المياه والصرف للمباني السكنية.' },
    ],
    services: [
      { name: 'إصلاح تسرب', description: 'كشف وإصلاح تسربات المياه', price: 250, duration: 60 },
      { name: 'تسليك مجاري', description: 'تسليك بالضغط العالي مع ضمان', price: 300, duration: 60 },
      { name: 'تركيب خلاطات', description: 'تركيب أو تبديل خلاطات ومغاسل', price: 150, duration: 45 },
    ],
  },
  // Education
  {
    name: 'أكاديمية التطوير',
    slug: 'tatweer-academy',
    categorySlug: 'educational-services',
    subcategorySlug: 'vocational-training',
    ownerName: 'منى الحربي',
    city: 'الرياض',
    address: 'حي العليا، شارع العليا العام',
    phone: '0513334444',
    email: 'learn@tatweer.demo',
    description: 'مركز تدريب مهني يقدم دورات في الإدارة والتسويق الرقمي والمهارات الشخصية مع شهادات معتمدة.',
    imagesKey: 'education',
    workExperience: [
      { title: 'مدربة معتمدة', company: 'صندوق تنمية الموارد البشرية', years: 7, description: 'تدريب أكثر من 5000 متدرب في مجالات التطوير الذاتي.' },
    ],
    services: [
      { name: 'دورة التسويق الرقمي', description: '12 ساعة تدريبية مع مشروع عملي', price: 1200, duration: 720 },
      { name: 'دورة القيادة', description: 'مهارات القيادة وإدارة الفرق', price: 900, duration: 480 },
      { name: 'تدريب خاص للشركات', description: 'برنامج مخصص للفريق مع تقرير أداء', price: 5000, duration: 0 },
    ],
  },
  // Financial
  {
    name: 'المحاسب الذكي',
    slug: 'smart-accountant-sa',
    categorySlug: 'financial-services',
    subcategorySlug: 'accounting',
    ownerName: 'فهد المطيري',
    city: 'الرياض',
    address: 'حي العقيق، طريق عثمان بن عفان',
    phone: '0514445555',
    email: 'accounts@smartacc.demo',
    description: 'خدمات محاسبية ومالية للشركات الصغيرة والمتوسطة تشمل الزكاة والضرائب والقوائم المالية.',
    imagesKey: 'financial',
    workExperience: [
      { title: 'محاسب قانوني', company: 'إرنست ويونغ', years: 8, description: 'إعداد قوائم مالية ومراجعة حسابات لشركات كبرى.' },
    ],
    services: [
      { name: 'إعداد قوائم مالية', description: 'ميزانية + أرباح وخسائر + تدفقات نقدية', price: 2000, duration: 0 },
      { name: 'إقرار ضريبي', description: 'إعداد ورفع الإقرار الضريبي والزكاة', price: 1200, duration: 0 },
      { name: 'استشارة مالية', description: 'تحليل مالي وخطة تكلفة للمشروع', price: 800, duration: 60 },
    ],
  },
  // Agricultural
  {
    name: 'استشاري الزراعة المستدامة',
    slug: 'sustainable-agri-consult',
    categorySlug: 'agricultural-services',
    subcategorySlug: 'agricultural-consulting',
    ownerName: 'عبدالرحمن الشهراني',
    city: 'أبها',
    address: 'حي المنسك، طريق الملك خالد',
    phone: '0515556666',
    email: 'farm@sustainableagri.demo',
    description: 'استشارات زراعية متكاملة للمزارع والحدائق المنزلية تشمل التسميد والري والمكافحة.',
    imagesKey: 'agricultural',
    workExperience: [
      { title: 'مهندس زراعي', company: 'وزارة البيئة والمياه والزراعة', years: 9, description: 'إعداد دراسات زراعية وبرامج إرشادية لمزارع متعددة.' },
    ],
    services: [
      { name: 'زيارة مزرعة', description: 'فحص التربة والنباتات وخطة علاج', price: 600, duration: 120 },
      { name: 'تصميم نظام ري', description: 'تصميم شبكة ري حديثة للمزرعة', price: 2500, duration: 0 },
      { name: 'استشارة هاتفية', description: 'استشارة زراعية مدتها 30 دقيقة', price: 200, duration: 30 },
    ],
  },
  // Logistic
  {
    name: 'توصيل سريع',
    slug: 'tawsil-saree',
    categorySlug: 'logistic-services',
    subcategorySlug: 'delivery',
    ownerName: 'ماجد العلي',
    city: 'الرياض',
    address: 'حي السلي، طريق الإمام سعود',
    phone: '0516667777',
    email: 'ship@tawsil.demo',
    description: 'خدمة توصيل سريعة للمتاجر والأفراد داخل المدينة مع تتبع مباشر وتأمين على الشحنات.',
    imagesKey: 'logistic',
    workExperience: [
      { title: 'مدير عمليات لوجستية', company: 'شركة شحن عالمية', years: 7, description: 'إدارة شبكة توصيل تخدم آلاف العملاء يومياً.' },
    ],
    services: [
      { name: 'توصيل داخل المدينة', description: 'توصيل بنفس اليوم للأحياء الرئيسية', price: 35, duration: 0 },
      { name: 'توصيل بين المدن', description: 'شحن للمدن الرئيسية خلال 24-48 ساعة', price: 80, duration: 0 },
      { name: 'خدمة توصيل للمتاجر', description: 'عقد شهري مع تتبع وتقارير', price: 3000, duration: 0 },
    ],
  },
];

async function main() {
  const demoPassword = await bcrypt.hash('demo123', 10);
  const country = await prisma.country.findFirst({ where: { code: 'SA' } });

  for (let i = 0; i < professionalBusinesses.length; i++) {
    const biz = professionalBusinesses[i];
    const category = await prisma.category.findUnique({ where: { slug: biz.categorySlug } });
    const subcategory = await prisma.subcategory.findUnique({ where: { slug: biz.subcategorySlug } });

    if (!category || !subcategory) {
      console.warn('Skipping', biz.slug, '- category/subcategory not found');
      continue;
    }

    const avatarUrl = avatar(i);
    const imageSeeds = businessImageSeeds[biz.imagesKey] || businessImageSeeds.tech;
    const logoUrl = picsum(imageSeeds[0], 400, 400);
    const coverUrl = picsum(imageSeeds[1] || imageSeeds[0], 1600, 600);
    const gallery = imageSeeds.slice(2).map((seed) => ({ url: picsum(seed, 800, 600), type: 'gallery', caption: '' }));

    const user = await prisma.user.upsert({
      where: { email: `${biz.slug}@demo.gateo.com` },
      update: {
        name: biz.ownerName,
        avatar: avatarUrl,
        accountType: 'BUSINESS',
      },
      create: {
        email: `${biz.slug}@demo.gateo.com`,
        name: biz.ownerName,
        password: demoPassword,
        avatar: avatarUrl,
        role: 'USER',
        accountType: 'BUSINESS',
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    });

    const business = await prisma.business.upsert({
      where: { slug: biz.slug },
      update: {
        name: biz.name,
        description: biz.description,
        logo: logoUrl,
        cover: coverUrl,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        countryId: country?.id || null,
        city: biz.city,
        address: biz.address,
        phone: biz.phone,
        email: biz.email,
        website: `https://${biz.slug}.demo`,
        images: JSON.stringify(gallery),
        workExperience: JSON.stringify(biz.workExperience),
        specializations: JSON.stringify([{ categoryId: category.id, subcategoryIds: [subcategory.id] }]),
        status: 'ACTIVE',
        isVerified: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        name: biz.name,
        slug: biz.slug,
        description: biz.description,
        logo: logoUrl,
        cover: coverUrl,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        countryId: country?.id || null,
        city: biz.city,
        address: biz.address,
        phone: biz.phone,
        email: biz.email,
        website: `https://${biz.slug}.demo`,
        images: JSON.stringify(gallery),
        workExperience: JSON.stringify(biz.workExperience),
        specializations: JSON.stringify([{ categoryId: category.id, subcategoryIds: [subcategory.id] }]),
        status: 'ACTIVE',
        isVerified: true,
        avgRating: 4.5 + Math.random() * 0.5,
        reviewCount: Math.floor(Math.random() * 150) + 20,
        updatedAt: new Date(),
      },
    });

    // Seed services
    await prisma.service.deleteMany({ where: { businessId: business.id } });
    for (const svc of biz.services) {
      await prisma.service.create({
        data: {
          businessId: business.id,
          name: svc.name,
          description: svc.description,
          price: svc.price,
          duration: svc.duration,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    }

    console.log('✅', biz.name);
  }

  console.log('✅ Professional businesses seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
