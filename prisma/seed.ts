import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ─── General Categories (non ladies-gate) ───
  const generalCategories = [
    { name: 'صالونات التجميل', nameEn: 'Beauty Salons', slug: 'beauty-salons', icon: 'Scissors', description: 'أفضل صالونات التجميل والعناية بالبشرة', type: 'BUSINESS' as const, sortOrder: 1 },
    { name: 'عيادات تجميل', nameEn: 'Cosmetic Clinics', slug: 'cosmetic-clinics', icon: 'Sparkles', description: 'عيادات التجميل والجراحة التجميلية', type: 'BUSINESS' as const, sortOrder: 2 },
    { name: 'أزياء وفساتين', nameEn: 'Fashion & Dresses', slug: 'fashion-dresses', icon: 'ShoppingBag', description: 'أحدث صيحات الأزياء والفساتين', type: 'BUSINESS' as const, sortOrder: 3 },
    { name: 'مستحضرات تجميل', nameEn: 'Cosmetics', slug: 'cosmetics', icon: 'Heart', description: 'مستحضرات التجميل والعناية الشخصية', type: 'BUSINESS' as const, sortOrder: 4 },
  ];

  for (const cat of generalCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { type: cat.type },
      create: cat,
    });
  }

  // ─── Public gateway service categories ───
  const serviceCategories = [
    { name: 'خدمات طبية وصحية', nameEn: 'Medical & Health Services', slug: 'medical-services', icon: 'Stethoscope', description: 'خدمات طبية واستشارات صحية عامة', type: 'BUSINESS' as const, sortOrder: 5 },
    { name: 'خدمات قانونية', nameEn: 'Legal Services', slug: 'legal-services', icon: 'Scale', description: 'استشارات قانونية وتوثيق وعقود', type: 'BUSINESS' as const, sortOrder: 6 },
    { name: 'خدمات تقنية', nameEn: 'Technical Services', slug: 'technical-services', icon: 'Wrench', description: 'برمجة، دعم فني، شبكات وأمن سيبراني', type: 'BUSINESS' as const, sortOrder: 7 },
    { name: 'خدمات هندسية', nameEn: 'Engineering Services', slug: 'engineering-services', icon: 'HardHat', description: 'تصميم معماري وإشراف هندسي', type: 'BUSINESS' as const, sortOrder: 8 },
    { name: 'خدمات إبداعية', nameEn: 'Creative Services', slug: 'creative-services', icon: 'Palette', description: 'تصميم، تصوير، إنتاج محتوى', type: 'BUSINESS' as const, sortOrder: 9 },
    { name: 'خدمات حرفية', nameEn: 'Craft Services', slug: 'craft-services', icon: 'Hammer', description: 'نجارة، سباكة، كهرباء، وصيانة عامة', type: 'BUSINESS' as const, sortOrder: 10 },
    { name: 'خدمات تعليمية', nameEn: 'Educational Services', slug: 'educational-services', icon: 'GraduationCap', description: 'تعليم أكاديمي وتدريب مهني ودورات لغات', type: 'BUSINESS' as const, sortOrder: 11 },
    { name: 'خدمات مالية', nameEn: 'Financial Services', slug: 'financial-services', icon: 'Banknote', description: 'محاسبة، استشارات مالية، وضرائب', type: 'BUSINESS' as const, sortOrder: 12 },
    { name: 'خدمات زراعية', nameEn: 'Agricultural Services', slug: 'agricultural-services', icon: 'Tractor', description: 'استشارات زراعية ومنتجات زراعية', type: 'BUSINESS' as const, sortOrder: 13 },
    { name: 'خدمات لوجستية', nameEn: 'Logistic Services', slug: 'logistic-services', icon: 'Truck', description: 'توصيل، نقل، وتخزين', type: 'BUSINESS' as const, sortOrder: 14 },
  ];

  for (const cat of serviceCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { type: cat.type },
      create: cat,
    });
  }

  // ─── Professional Business Categories (LinkedIn-style profiles) ───
  const professionalBusinessCategories = [
    { name: 'تسويق ومبيعات', nameEn: 'Marketing & Sales', slug: 'marketing-sales', icon: 'TrendingUp', description: 'تسويق رقمي، مبيعات، وتطوير أعمال', type: 'PROFESSIONAL' as const, sortOrder: 200 },
    { name: 'محاسبة ومالية', nameEn: 'Accounting & Finance', slug: 'accounting-finance', icon: 'Calculator', description: 'محاسبة، مراجعة، استشارات مالية وضرائب', type: 'PROFESSIONAL' as const, sortOrder: 210 },
    { name: 'استشارات قانونية', nameEn: 'Legal Consulting', slug: 'legal-consulting', icon: 'Scale', description: 'محامون ومستشارون قانونيون', type: 'PROFESSIONAL' as const, sortOrder: 220 },
    { name: 'تقنية المعلومات', nameEn: 'Information Technology', slug: 'information-technology', icon: 'Code', description: 'برمجة، تطوير، أمن سيبراني، وشبكات', type: 'PROFESSIONAL' as const, sortOrder: 230 },
    { name: 'تصميم وإبداع', nameEn: 'Design & Creativity', slug: 'design-creativity', icon: 'Palette', description: 'تصميم جرافيك، UI/UX، تصوير، وإنتاج محتوى', type: 'PROFESSIONAL' as const, sortOrder: 240 },
    { name: 'إدارة مشاريع', nameEn: 'Project Management', slug: 'project-management', icon: 'Kanban', description: 'مديرو مشاريع واستشاريو عمليات', type: 'PROFESSIONAL' as const, sortOrder: 250 },
    { name: 'موارد بشرية', nameEn: 'Human Resources', slug: 'human-resources', icon: 'Users', description: 'توظيف، تطوير الموظفين، واستشارات HR', type: 'PROFESSIONAL' as const, sortOrder: 260 },
    { name: 'كتابة وترجمة', nameEn: 'Writing & Translation', slug: 'writing-translation', icon: 'PenTool', description: 'كتابة محتوى، ترجمة، وتحرير نصوص', type: 'PROFESSIONAL' as const, sortOrder: 270 },
    { name: 'تدريب وتطوير', nameEn: 'Training & Development', slug: 'training-development', icon: 'GraduationCap', description: 'مدربون واستشاريو تطوير مهارات', type: 'PROFESSIONAL' as const, sortOrder: 280 },
    { name: 'عقارات وتسويق عقاري', nameEn: 'Real Estate', slug: 'real-estate', icon: 'Building', description: 'وسطاء عقاريون واستشاريو تسويق عقاري', type: 'PROFESSIONAL' as const, sortOrder: 290 },
    { name: 'هندسة وتصميم تقني', nameEn: 'Engineering & Technical Design', slug: 'engineering-technical', icon: 'Compass', description: 'مهندسون ومصممون تقنيون', type: 'PROFESSIONAL' as const, sortOrder: 300 },
    { name: 'استشارات إدارية', nameEn: 'Management Consulting', slug: 'management-consulting', icon: 'Briefcase', description: 'استشاريو إدارة وتطوير منظمات', type: 'PROFESSIONAL' as const, sortOrder: 310 },
    { name: 'استشارات صحية', nameEn: 'Healthcare Consulting', slug: 'healthcare-consulting', icon: 'Stethoscope', description: 'استشاريو صحة وخدمات طبية متخصصة', type: 'PROFESSIONAL' as const, sortOrder: 320 },
  ];

  for (const cat of professionalBusinessCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { type: cat.type },
      create: cat,
    });
  }

  // ─── Ladies Gate Categories ───
  const ladiesGateCategories = [
    { name: 'الجمال والعناية الشخصية', nameEn: 'Beauty & Personal Care', slug: 'lg-beauty-care', icon: 'Sparkles', description: 'كل ما يخص الجمال والعناية الشخصية للجميع', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 10 },
    { name: 'الصحة والعلاج', nameEn: 'Health & Treatment', slug: 'lg-health', icon: 'Heart', description: 'مراكز الصحة والعلاج والتأهيل', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 20 },
    { name: 'اللياقة والاسترخاء', nameEn: 'Fitness & Relaxation', slug: 'lg-fitness', icon: 'Dumbbell', description: 'أندية رياضية ومراكز استرخاء للجميع', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 30 },
    { name: 'السبا والمساج', nameEn: 'Spa & Massage', slug: 'lg-spa', icon: 'Flower2', description: 'مراكز السبا والمساج والاسترخاء', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 40 },
    { name: 'التسوق ومستحضرات التجميل', nameEn: 'Shopping & Cosmetics', slug: 'lg-shopping', icon: 'ShoppingBag', description: 'محلات ومتاجر مستحضرات التجميل والعطور', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 50 },
    { name: 'الأزياء والموضة', nameEn: 'Fashion & Style', slug: 'lg-fashion', icon: 'Crown', description: 'أحدث صيحات الأزياء والموضة العامة', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 60 },
    { name: 'الهدايا والمناسبات', nameEn: 'Gifts & Occasions', slug: 'lg-gifts', icon: 'Gift', description: 'هدايا وزهور وتنسيق مناسبات', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 70 },
    { name: 'الأعراس والمناسبات', nameEn: 'Weddings & Events', slug: 'lg-weddings', icon: 'Gem', description: 'تجهيز العرائس وقاعات المناسبات', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 80 },
    { name: 'الأمومة والطفل', nameEn: 'Motherhood & Kids', slug: 'lg-motherhood', icon: 'Baby', description: 'كل ما يخص الأم والطفل', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 90 },
    { name: 'المنزل ونمط الحياة', nameEn: 'Home & Lifestyle', slug: 'lg-home', icon: 'Home', description: 'ديكور وتنظيف وتنظيم المنزل', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 100 },
    { name: 'التعليم والتطوير', nameEn: 'Education & Development', slug: 'lg-education', icon: 'BookOpen', description: 'دورات وتدريب عام', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 110 },
    { name: 'المطاعم والكافيهات', nameEn: 'Restaurants & Cafes', slug: 'lg-dining', icon: 'Coffee', description: 'مطاعم وكافيهات مناسبة للجميع', isLadiesGate: true, type: 'LADIES_GATE' as const, sortOrder: 120 },
  ];

  for (const cat of ladiesGateCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { type: cat.type, isLadiesGate: cat.isLadiesGate },
      create: cat,
    });
  }

  // ─── Subcategories mapping ───
  const subcategoriesData: { categorySlug: string; name: string; nameEn: string; slug: string; sortOrder: number }[] = [
    // General categories subcategories
    { categorySlug: 'beauty-salons', name: 'عناية بالشعر', nameEn: 'Hair Care', slug: 'hair-care', sortOrder: 1 },
    { categorySlug: 'beauty-salons', name: 'عناية بالبشرة', nameEn: 'Skin Care', slug: 'skin-care', sortOrder: 2 },
    { categorySlug: 'beauty-salons', name: 'مكياج', nameEn: 'Makeup', slug: 'makeup', sortOrder: 3 },
    { categorySlug: 'cosmetic-clinics', name: 'تجميل الوجه', nameEn: 'Facial Aesthetics', slug: 'facial-aesthetics', sortOrder: 1 },
    { categorySlug: 'cosmetic-clinics', name: 'نحت الجسم', nameEn: 'Body Contouring', slug: 'body-contouring', sortOrder: 2 },
    { categorySlug: 'fashion-dresses', name: 'فساتين سهرة', nameEn: 'Evening Dresses', slug: 'evening-dresses', sortOrder: 1 },
    { categorySlug: 'fashion-dresses', name: 'أزياء يومية', nameEn: 'Casual Wear', slug: 'casual-wear', sortOrder: 2 },
    { categorySlug: 'cosmetics', name: 'مكياج', nameEn: 'Makeup', slug: 'makeup-products', sortOrder: 1 },
    { categorySlug: 'cosmetics', name: 'عطور', nameEn: 'Perfumes', slug: 'perfumes', sortOrder: 2 },

    // Ladies Gate: الجمال والعناية الشخصية
    { categorySlug: 'lg-beauty-care', name: 'صالونات التجميل العامة', nameEn: 'Ladies Beauty Salons', slug: 'ladies-salons', sortOrder: 1 },
    { categorySlug: 'lg-beauty-care', name: 'مراكز العناية بالشعر', nameEn: 'Hair Care Centers', slug: 'hair-care-centers', sortOrder: 2 },
    { categorySlug: 'lg-beauty-care', name: 'مراكز العناية بالبشرة', nameEn: 'Skin Care Centers', slug: 'skin-care-centers', sortOrder: 3 },
    { categorySlug: 'lg-beauty-care', name: 'مراكز المكياج', nameEn: 'Makeup Centers', slug: 'makeup-centers', sortOrder: 4 },
    { categorySlug: 'lg-beauty-care', name: 'مراكز العناية بالأظافر', nameEn: 'Nail Care Centers', slug: 'nail-care', sortOrder: 5 },
    { categorySlug: 'lg-beauty-care', name: 'الحمام المغربي', nameEn: 'Moroccan Bath', slug: 'moroccan-bath', sortOrder: 6 },
    { categorySlug: 'lg-beauty-care', name: 'خدمات التجميل المنزلية', nameEn: 'Home Beauty Services', slug: 'home-beauty', sortOrder: 7 },

    // Ladies Gate: الصحة والعلاج
    { categorySlug: 'lg-health', name: 'مراكز العلاج الطبيعي', nameEn: 'Physical Therapy', slug: 'physical-therapy', sortOrder: 1 },
    { categorySlug: 'lg-health', name: 'مراكز التأهيل', nameEn: 'Rehabilitation Centers', slug: 'rehabilitation', sortOrder: 2 },
    { categorySlug: 'lg-health', name: 'عيادات الجلدية', nameEn: 'Dermatology Clinics', slug: 'dermatology', sortOrder: 3 },
    { categorySlug: 'lg-health', name: 'عيادات التغذية', nameEn: 'Nutrition Clinics', slug: 'nutrition', sortOrder: 4 },
    { categorySlug: 'lg-health', name: 'عيادات التجميل', nameEn: 'Cosmetic Clinics', slug: 'cosmetic-clinics-lg', sortOrder: 5 },
    { categorySlug: 'lg-health', name: 'مراكز الليزر', nameEn: 'Laser Centers', slug: 'laser-centers', sortOrder: 6 },
    { categorySlug: 'lg-health', name: 'مراكز نحت الجسم', nameEn: 'Body Sculpting', slug: 'body-sculpting', sortOrder: 7 },

    // Ladies Gate: اللياقة والاسترخاء
    { categorySlug: 'lg-fitness', name: 'الأندية الرياضية العامة', nameEn: 'Ladies Sports Clubs', slug: 'ladies-sports-clubs', sortOrder: 1 },
    { categorySlug: 'lg-fitness', name: 'اليوغا والبيلاتس', nameEn: 'Yoga & Pilates', slug: 'yoga-pilates', sortOrder: 2 },
    { categorySlug: 'lg-fitness', name: 'مراكز اللياقة البدنية', nameEn: 'Fitness Centers', slug: 'fitness-centers', sortOrder: 3 },
    { categorySlug: 'lg-fitness', name: 'مراكز التدريب الشخصي', nameEn: 'Personal Training', slug: 'personal-training', sortOrder: 4 },
    { categorySlug: 'lg-fitness', name: 'مراكز التأمل والاسترخاء', nameEn: 'Meditation & Relaxation', slug: 'meditation', sortOrder: 5 },

    // Ladies Gate: السبا والمساج
    { categorySlug: 'lg-spa', name: 'مراكز السبا', nameEn: 'Spa Centers', slug: 'spa-centers', sortOrder: 1 },
    { categorySlug: 'lg-spa', name: 'المساج العلاجي', nameEn: 'Therapeutic Massage', slug: 'therapeutic-massage', sortOrder: 2 },
    { categorySlug: 'lg-spa', name: 'المساج الاسترخائي', nameEn: 'Relaxation Massage', slug: 'relaxation-massage', sortOrder: 3 },
    { categorySlug: 'lg-spa', name: 'الساونا والبخار', nameEn: 'Sauna & Steam', slug: 'sauna-steam', sortOrder: 4 },
    { categorySlug: 'lg-spa', name: 'مراكز العناية بالجسم', nameEn: 'Body Care Centers', slug: 'body-care', sortOrder: 5 },

    // Ladies Gate: التسوق ومستحضرات التجميل
    { categorySlug: 'lg-shopping', name: 'محلات المكياج', nameEn: 'Makeup Shops', slug: 'makeup-shops', sortOrder: 1 },
    { categorySlug: 'lg-shopping', name: 'محلات مستحضرات التجميل', nameEn: 'Cosmetics Shops', slug: 'cosmetics-shops', sortOrder: 2 },
    { categorySlug: 'lg-shopping', name: 'العطور', nameEn: 'Perfumes', slug: 'perfumes-shops', sortOrder: 3 },
    { categorySlug: 'lg-shopping', name: 'منتجات العناية بالبشرة', nameEn: 'Skin Care Products', slug: 'skincare-products', sortOrder: 4 },
    { categorySlug: 'lg-shopping', name: 'منتجات العناية بالشعر', nameEn: 'Hair Care Products', slug: 'haircare-products', sortOrder: 5 },
    { categorySlug: 'lg-shopping', name: 'متاجر التجميل الإلكترونية', nameEn: 'Online Beauty Stores', slug: 'online-beauty', sortOrder: 6 },

    // Ladies Gate: الأزياء والموضة
    { categorySlug: 'lg-fashion', name: 'الملابس العامة', nameEn: 'Women Clothing', slug: 'women-clothing', sortOrder: 1 },
    { categorySlug: 'lg-fashion', name: 'العبايات', nameEn: 'Abayas', slug: 'abayas', sortOrder: 2 },
    { categorySlug: 'lg-fashion', name: 'اللانجري', nameEn: 'Lingerie', slug: 'lingerie', sortOrder: 3 },
    { categorySlug: 'lg-fashion', name: 'الأحذية العامة', nameEn: 'Women Shoes', slug: 'women-shoes', sortOrder: 4 },
    { categorySlug: 'lg-fashion', name: 'الحقائب والإكسسوارات', nameEn: 'Bags & Accessories', slug: 'bags-accessories', sortOrder: 5 },
    { categorySlug: 'lg-fashion', name: 'المجوهرات والساعات', nameEn: 'Jewelry & Watches', slug: 'jewelry-watches', sortOrder: 6 },

    // Ladies Gate: الهدايا والمناسبات
    { categorySlug: 'lg-gifts', name: 'محلات الزهور', nameEn: 'Flower Shops', slug: 'flower-shops', sortOrder: 1 },
    { categorySlug: 'lg-gifts', name: 'تنسيق الهدايا', nameEn: 'Gift Arrangement', slug: 'gift-arrangement', sortOrder: 2 },
    { categorySlug: 'lg-gifts', name: 'تغليف الهدايا', nameEn: 'Gift Wrapping', slug: 'gift-wrapping', sortOrder: 3 },
    { categorySlug: 'lg-gifts', name: 'الشوكولاتة الفاخرة', nameEn: 'Luxury Chocolate', slug: 'luxury-chocolate', sortOrder: 4 },
    { categorySlug: 'lg-gifts', name: 'تجهيز المناسبات العامة', nameEn: 'Ladies Events', slug: 'ladies-events', sortOrder: 5 },

    // Ladies Gate: الأعراس والمناسبات
    { categorySlug: 'lg-weddings', name: 'تجهيز العرائس', nameEn: 'Bridal Preparation', slug: 'bridal-prep', sortOrder: 1 },
    { categorySlug: 'lg-weddings', name: 'فنانو مكياج', nameEn: 'Makeup Artists', slug: 'makeup-artists', sortOrder: 2 },
    { categorySlug: 'lg-weddings', name: 'مصففو الشعر', nameEn: 'Hair Stylists', slug: 'hair-stylists', sortOrder: 3 },
    { categorySlug: 'lg-weddings', name: 'قاعات المناسبات', nameEn: 'Event Halls', slug: 'event-halls', sortOrder: 4 },
    { categorySlug: 'lg-weddings', name: 'التصوير العام', nameEn: 'Women Photography', slug: 'women-photography', sortOrder: 5 },
    { categorySlug: 'lg-weddings', name: 'تأجير فساتين السهرة والأعراس', nameEn: 'Dress Rental', slug: 'dress-rental', sortOrder: 6 },

    // Ladies Gate: الأمومة والطفل
    { categorySlug: 'lg-motherhood', name: 'ملابس الأطفال', nameEn: 'Kids Clothing', slug: 'kids-clothing', sortOrder: 1 },
    { categorySlug: 'lg-motherhood', name: 'مستلزمات المواليد', nameEn: 'Newborn Essentials', slug: 'newborn-essentials', sortOrder: 2 },
    { categorySlug: 'lg-motherhood', name: 'حضانات الأطفال', nameEn: 'Nurseries', slug: 'nurseries', sortOrder: 3 },
    { categorySlug: 'lg-motherhood', name: 'مراكز التعليم المبكر', nameEn: 'Early Education', slug: 'early-education', sortOrder: 4 },
    { categorySlug: 'lg-motherhood', name: 'ألعاب الأطفال', nameEn: 'Kids Toys', slug: 'kids-toys', sortOrder: 5 },

    // Ladies Gate: المنزل ونمط الحياة
    { categorySlug: 'lg-home', name: 'الديكور المنزلي', nameEn: 'Home Decor', slug: 'home-decor', sortOrder: 1 },
    { categorySlug: 'lg-home', name: 'المفروشات', nameEn: 'Furniture', slug: 'furniture', sortOrder: 2 },
    { categorySlug: 'lg-home', name: 'الأدوات المنزلية', nameEn: 'Home Appliances', slug: 'home-appliances', sortOrder: 3 },
    { categorySlug: 'lg-home', name: 'التنظيف المنزلي', nameEn: 'Home Cleaning', slug: 'home-cleaning', sortOrder: 4 },
    { categorySlug: 'lg-home', name: 'تنظيم المناسبات المنزلية', nameEn: 'Home Events', slug: 'home-events', sortOrder: 5 },

    // Ladies Gate: التعليم والتطوير
    { categorySlug: 'lg-education', name: 'مراكز التدريب العامة', nameEn: 'Women Training Centers', slug: 'women-training', sortOrder: 1 },
    { categorySlug: 'lg-education', name: 'دورات التجميل', nameEn: 'Beauty Courses', slug: 'beauty-courses', sortOrder: 2 },
    { categorySlug: 'lg-education', name: 'دورات المكياج', nameEn: 'Makeup Courses', slug: 'makeup-courses', sortOrder: 3 },
    { categorySlug: 'lg-education', name: 'دورات اللياقة والصحة', nameEn: 'Fitness & Health Courses', slug: 'fitness-courses', sortOrder: 4 },
    { categorySlug: 'lg-education', name: 'تطوير المهارات', nameEn: 'Skill Development', slug: 'skill-development', sortOrder: 5 },

    // Ladies Gate: المطاعم والكافيهات
    { categorySlug: 'lg-dining', name: 'كافيهات', nameEn: 'Cafes', slug: 'cafes', sortOrder: 1 },
    { categorySlug: 'lg-dining', name: 'مطاعم عائلية', nameEn: 'Family Restaurants', slug: 'family-restaurants', sortOrder: 2 },
    { categorySlug: 'lg-dining', name: 'أماكن تجمع السيدات', nameEn: 'Ladies Gathering Spots', slug: 'ladies-gathering', sortOrder: 3 },
    { categorySlug: 'lg-dining', name: 'الحلويات والمخبوزات', nameEn: 'Sweets & Bakery', slug: 'sweets-bakery', sortOrder: 4 },

    // Public gateway service subcategories
    { categorySlug: 'medical-services', name: 'عيادات عامة', nameEn: 'General Clinics', slug: 'general-clinics', sortOrder: 1 },
    { categorySlug: 'medical-services', name: 'خدمات طبية منزلية', nameEn: 'Home Medical Services', slug: 'home-medical-services', sortOrder: 2 },

    { categorySlug: 'legal-services', name: 'استشارات قانونية', nameEn: 'Legal Consultations', slug: 'legal-consultations', sortOrder: 1 },
    { categorySlug: 'legal-services', name: 'توثيق وعقود', nameEn: 'Notarization & Contracts', slug: 'notarization-contracts', sortOrder: 2 },

    { categorySlug: 'technical-services', name: 'برمجة وتطوير', nameEn: 'Software Development', slug: 'software-development', sortOrder: 1 },
    { categorySlug: 'technical-services', name: 'دعم فني', nameEn: 'Technical Support', slug: 'technical-support', sortOrder: 2 },
    { categorySlug: 'technical-services', name: 'شبكات وأمن سيبراني', nameEn: 'Networks & Cybersecurity', slug: 'network-cybersecurity', sortOrder: 3 },

    { categorySlug: 'engineering-services', name: 'تصميم معماري', nameEn: 'Architectural Design', slug: 'architectural-design', sortOrder: 1 },
    { categorySlug: 'engineering-services', name: 'إشراف هندسي', nameEn: 'Engineering Supervision', slug: 'engineering-supervision', sortOrder: 2 },

    { categorySlug: 'creative-services', name: 'تصميم جرافيك', nameEn: 'Graphic Design', slug: 'graphic-design', sortOrder: 1 },
    { categorySlug: 'creative-services', name: 'تصوير', nameEn: 'Photography', slug: 'photography', sortOrder: 2 },
    { categorySlug: 'creative-services', name: 'إنتاج فيديو', nameEn: 'Video Production', slug: 'video-production', sortOrder: 3 },
    { categorySlug: 'creative-services', name: 'كتابة محتوى', nameEn: 'Content Writing', slug: 'content-writing', sortOrder: 4 },

    { categorySlug: 'craft-services', name: 'نجارة', nameEn: 'Carpentry', slug: 'carpentry', sortOrder: 1 },
    { categorySlug: 'craft-services', name: 'سباكة', nameEn: 'Plumbing', slug: 'plumbing', sortOrder: 2 },
    { categorySlug: 'craft-services', name: 'كهرباء', nameEn: 'Electrical Works', slug: 'electrical-works', sortOrder: 3 },
    { categorySlug: 'craft-services', name: 'صيانة عامة', nameEn: 'General Maintenance', slug: 'general-maintenance', sortOrder: 4 },

    { categorySlug: 'educational-services', name: 'تعليم أكاديمي', nameEn: 'Academic Education', slug: 'academic-education', sortOrder: 1 },
    { categorySlug: 'educational-services', name: 'تدريب مهني', nameEn: 'Vocational Training', slug: 'vocational-training', sortOrder: 2 },
    { categorySlug: 'educational-services', name: 'دورات لغات', nameEn: 'Language Courses', slug: 'language-courses', sortOrder: 3 },

    { categorySlug: 'financial-services', name: 'محاسبة', nameEn: 'Accounting', slug: 'accounting', sortOrder: 1 },
    { categorySlug: 'financial-services', name: 'استشارات مالية', nameEn: 'Financial Consulting', slug: 'financial-consulting', sortOrder: 2 },
    { categorySlug: 'financial-services', name: 'ضرائب', nameEn: 'Tax Services', slug: 'tax-services', sortOrder: 3 },

    { categorySlug: 'agricultural-services', name: 'استشارات زراعية', nameEn: 'Agricultural Consulting', slug: 'agricultural-consulting', sortOrder: 1 },
    { categorySlug: 'agricultural-services', name: 'منتجات زراعية', nameEn: 'Agricultural Products', slug: 'agricultural-products', sortOrder: 2 },

    { categorySlug: 'logistic-services', name: 'توصيل', nameEn: 'Delivery', slug: 'delivery', sortOrder: 1 },
    { categorySlug: 'logistic-services', name: 'نقل', nameEn: 'Transportation', slug: 'transportation', sortOrder: 2 },
    { categorySlug: 'logistic-services', name: 'تخزين', nameEn: 'Storage', slug: 'storage', sortOrder: 3 },

    // Additional subcategories for existing ladies-gate categories
    { categorySlug: 'lg-health', name: 'استشارات طبية', nameEn: 'Medical Consultations', slug: 'medical-consultations-lg', sortOrder: 8 },
    { categorySlug: 'lg-health', name: 'تمريض منزلي', nameEn: 'Home Nursing', slug: 'home-nursing', sortOrder: 9 },
    { categorySlug: 'lg-education', name: 'تعليم أكاديمي', nameEn: 'Academic Education', slug: 'academic-education-lg', sortOrder: 6 },
    { categorySlug: 'lg-education', name: 'دورات لغات', nameEn: 'Language Courses', slug: 'language-courses-lg', sortOrder: 7 },

    // Professional business categories subcategories
    { categorySlug: 'marketing-sales', name: 'تسويق رقمي', nameEn: 'Digital Marketing', slug: 'digital-marketing', sortOrder: 1 },
    { categorySlug: 'marketing-sales', name: 'إدارة وسائل التواصل', nameEn: 'Social Media Management', slug: 'social-media-management', sortOrder: 2 },
    { categorySlug: 'marketing-sales', name: 'مبيعات وتطوير أعمال', nameEn: 'Sales & Business Development', slug: 'sales-business-development', sortOrder: 3 },
    { categorySlug: 'marketing-sales', name: 'إعلان وعلامات تجارية', nameEn: 'Advertising & Branding', slug: 'advertising-branding', sortOrder: 4 },

    { categorySlug: 'accounting-finance', name: 'محاسبة عامة', nameEn: 'General Accounting', slug: 'general-accounting', sortOrder: 1 },
    { categorySlug: 'accounting-finance', name: 'مراجعة مالية', nameEn: 'Financial Auditing', slug: 'financial-auditing', sortOrder: 2 },
    { categorySlug: 'accounting-finance', name: 'استشارات ضريبية', nameEn: 'Tax Consulting', slug: 'tax-consulting', sortOrder: 3 },
    { categorySlug: 'accounting-finance', name: 'تحليل مالي', nameEn: 'Financial Analysis', slug: 'financial-analysis', sortOrder: 4 },

    { categorySlug: 'legal-consulting', name: 'استشارات قانونية عامة', nameEn: 'General Legal Consulting', slug: 'general-legal-consulting', sortOrder: 1 },
    { categorySlug: 'legal-consulting', name: 'قضايا تجارية', nameEn: 'Commercial Cases', slug: 'commercial-cases', sortOrder: 2 },
    { categorySlug: 'legal-consulting', name: 'عقود وتوثيق', nameEn: 'Contracts & Notarization', slug: 'contracts-notarization', sortOrder: 3 },
    { categorySlug: 'legal-consulting', name: 'ملكية فكرية', nameEn: 'Intellectual Property', slug: 'intellectual-property', sortOrder: 4 },

    { categorySlug: 'information-technology', name: 'تطوير الويب', nameEn: 'Web Development', slug: 'web-development', sortOrder: 1 },
    { categorySlug: 'information-technology', name: 'تطوير تطبيقات الجوال', nameEn: 'Mobile Development', slug: 'mobile-development', sortOrder: 2 },
    { categorySlug: 'information-technology', name: 'أمن سيبراني', nameEn: 'Cybersecurity', slug: 'cybersecurity', sortOrder: 3 },
    { categorySlug: 'information-technology', name: 'شبكات وحوسبة سحابية', nameEn: 'Networks & Cloud', slug: 'networks-cloud', sortOrder: 4 },

    { categorySlug: 'design-creativity', name: 'تصميم جرافيك', nameEn: 'Graphic Design', slug: 'graphic-design-prof', sortOrder: 1 },
    { categorySlug: 'design-creativity', name: 'تصميم UI/UX', nameEn: 'UI/UX Design', slug: 'ui-ux-design', sortOrder: 2 },
    { categorySlug: 'design-creativity', name: 'تصوير فوتوغرافي', nameEn: 'Photography', slug: 'photography-prof', sortOrder: 3 },
    { categorySlug: 'design-creativity', name: 'إنتاج فيديو ومونتاج', nameEn: 'Video Production', slug: 'video-production-prof', sortOrder: 4 },

    { categorySlug: 'project-management', name: 'إدارة مشاريع تقنية', nameEn: 'Tech Project Management', slug: 'tech-project-management', sortOrder: 1 },
    { categorySlug: 'project-management', name: 'إدارة مشاريع إنشائية', nameEn: 'Construction Project Management', slug: 'construction-project-management', sortOrder: 2 },
    { categorySlug: 'project-management', name: 'تخطيط استراتيجي', nameEn: 'Strategic Planning', slug: 'strategic-planning', sortOrder: 3 },

    { categorySlug: 'human-resources', name: 'توظيف واستقطاب', nameEn: 'Recruitment', slug: 'recruitment', sortOrder: 1 },
    { categorySlug: 'human-resources', name: 'تطوير الموظفين', nameEn: 'Employee Development', slug: 'employee-development', sortOrder: 2 },
    { categorySlug: 'human-resources', name: 'استشارات HR', nameEn: 'HR Consulting', slug: 'hr-consulting', sortOrder: 3 },

    { categorySlug: 'writing-translation', name: 'كتابة محتوى', nameEn: 'Content Writing', slug: 'content-writing-prof', sortOrder: 1 },
    { categorySlug: 'writing-translation', name: 'ترجمة', nameEn: 'Translation', slug: 'translation', sortOrder: 2 },
    { categorySlug: 'writing-translation', name: 'تحرير وتدقيق لغوي', nameEn: 'Editing & Proofreading', slug: 'editing-proofreading', sortOrder: 3 },

    { categorySlug: 'training-development', name: 'تدريب مهني', nameEn: 'Vocational Training', slug: 'vocational-training-prof', sortOrder: 1 },
    { categorySlug: 'training-development', name: 'تدريب شخصي', nameEn: 'Personal Coaching', slug: 'personal-coaching', sortOrder: 2 },
    { categorySlug: 'training-development', name: 'تطوير قيادي', nameEn: 'Leadership Development', slug: 'leadership-development', sortOrder: 3 },

    { categorySlug: 'real-estate', name: 'وساطة عقارية', nameEn: 'Real Estate Brokerage', slug: 'real-estate-brokerage', sortOrder: 1 },
    { categorySlug: 'real-estate', name: 'تسويق عقاري', nameEn: 'Real Estate Marketing', slug: 'real-estate-marketing', sortOrder: 2 },
    { categorySlug: 'real-estate', name: 'إدارة أملاك', nameEn: 'Property Management', slug: 'property-management', sortOrder: 3 },

    { categorySlug: 'engineering-technical', name: 'تصميم معماري', nameEn: 'Architectural Design', slug: 'architectural-design-prof', sortOrder: 1 },
    { categorySlug: 'engineering-technical', name: 'تصميم مدني', nameEn: 'Civil Design', slug: 'civil-design', sortOrder: 2 },
    { categorySlug: 'engineering-technical', name: 'إشراف هندسي', nameEn: 'Engineering Supervision', slug: 'engineering-supervision-prof', sortOrder: 3 },

    { categorySlug: 'management-consulting', name: 'استشارات إستراتيجية', nameEn: 'Strategic Consulting', slug: 'strategic-consulting', sortOrder: 1 },
    { categorySlug: 'management-consulting', name: 'تحسين العمليات', nameEn: 'Process Improvement', slug: 'process-improvement', sortOrder: 2 },
    { categorySlug: 'management-consulting', name: 'استشارات ناشئين', nameEn: 'Startup Consulting', slug: 'startup-consulting', sortOrder: 3 },

    { categorySlug: 'healthcare-consulting', name: 'استشارات طبية', nameEn: 'Medical Consultations', slug: 'medical-consultations', sortOrder: 1 },
    { categorySlug: 'healthcare-consulting', name: 'استشارات تغذية', nameEn: 'Nutrition Consulting', slug: 'nutrition-consulting', sortOrder: 2 },
    { categorySlug: 'healthcare-consulting', name: 'استشارات صحة نفسية', nameEn: 'Mental Health Consulting', slug: 'mental-health-consulting', sortOrder: 3 },
  ];

  for (const sub of subcategoriesData) {
    const category = await prisma.category.findUnique({ where: { slug: sub.categorySlug } });
    if (category) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: {},
        create: {
          name: sub.name,
          nameEn: sub.nameEn,
          slug: sub.slug,
          sortOrder: sub.sortOrder,
          categoryId: category.id,
        },
      });
    }
  }

  // ─── Subscription plans ───
  const plans = [
    { name: 'Basic', nameAr: 'أساسي', description: 'خطة أساسية للأعمال الصغيرة', price: 99, duration: 30, features: [{ feature: 'Profile listing', value: true }, { feature: 'Services', value: 5 }] },
    { name: 'Pro', nameAr: 'احترافي', description: 'خطة متقدمة مع مميزات إضافية', price: 299, duration: 30, features: [{ feature: 'Profile listing', value: true }, { feature: 'Services', value: 20 }, { feature: 'Analytics', value: true }] },
    { name: 'Premium', nameAr: 'بريميوم', description: 'خطة شاملة لأكبر التأثير', price: 599, duration: 30, features: [{ feature: 'Profile listing', value: true }, { feature: 'Services', value: 'Unlimited' }, { feature: 'Analytics', value: true }, { feature: 'Priority support', value: true }] },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        ...plan,
        features: JSON.stringify(plan.features),
      },
    });
  }

  // ─── Admin user ───
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gateo.com' },
    update: {},
    create: {
      email: 'admin@gateo.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      accountType: 'USER',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  // ─── Badges ───
  const badges = [
    { name: 'New Member', nameAr: 'عضو جديد', description: 'انضممت لمنصة Gateo', icon: '🌟', color: '#10b981', condition: 'register', pointsReward: 10 },
    { name: 'First Post', nameAr: 'أول منشور', description: 'نشرت منشورك الأول', icon: '📝', color: '#3b82f6', condition: 'posts>=1', pointsReward: 20 },
    { name: 'Social Butterfly', nameAr: 'فراشة اجتماعية', description: 'نشرت 10 منشورات', icon: '🦋', color: '#ec4899', condition: 'posts>=10', pointsReward: 100 },
    { name: 'Booker', nameAr: 'حجازية', description: 'أكملت أول حجز', icon: '📅', color: '#f59e0b', condition: 'bookings>=1', pointsReward: 50 },
    { name: 'Loyal Customer', nameAr: 'عميلة مخلصة', description: 'أكملت 5 حجوزات', icon: '💎', color: '#8b5cf6', condition: 'bookings>=5', pointsReward: 200 },
    { name: 'Reviewer', nameAr: 'مراجع', description: 'كتبت أول تقييم', icon: '⭐', color: '#ef4444', condition: 'reviews>=1', pointsReward: 30 },
    { name: 'Top Fan', nameAr: 'معجبة كبيرة', description: 'تابعت 10 حسابات', icon: '❤️', color: '#e11d48', condition: 'following>=10', pointsReward: 75 },
    { name: 'Rising Star', nameAr: 'نجمة صاعدة', description: 'وصلت للمستوى 5', icon: '🚀', color: '#06b6d4', condition: 'level>=5', pointsReward: 150 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  // ─── Dynamic Field Definitions ───
  const dynamicFieldDefinitions: {
    categorySlug: string;
    name: string;
    label: string;
    fieldType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'DATE' | 'URL' | 'TEXTAREA';
    appliesTo: 'BUSINESS' | 'PROFESSIONAL' | 'BOTH';
    options?: { value: string; label: string }[];
    isRequired?: boolean;
  }[] = [
    {
      categorySlug: 'beauty-salons',
      name: 'customer_type',
      label: 'نوع العملاء',
      fieldType: 'SELECT',
      appliesTo: 'BUSINESS',
      options: [
        { value: 'women', label: 'نساء فقط' },
        { value: 'children', label: 'أطفال' },
        { value: 'all', label: 'الجميع' },
      ],
    },
    {
      categorySlug: 'beauty-salons',
      name: 'home_service',
      label: 'هل تقدم خدمة منزلية؟',
      fieldType: 'BOOLEAN',
      appliesTo: 'BUSINESS',
    },
    {
      categorySlug: 'beauty-salons',
      name: 'booking_url',
      label: 'رابط الحجز الإلكتروني',
      fieldType: 'URL',
      appliesTo: 'BUSINESS',
    },
    {
      categorySlug: 'medical-services',
      name: 'accepts_insurance',
      label: 'هل يقبل التأمين الطبي؟',
      fieldType: 'BOOLEAN',
      appliesTo: 'BUSINESS',
      isRequired: true,
    },
    {
      categorySlug: 'medical-services',
      name: 'years_experience',
      label: 'سنوات الخبرة',
      fieldType: 'NUMBER',
      appliesTo: 'BUSINESS',
    },
    {
      categorySlug: 'creative-services',
      name: 'portfolio_type',
      label: 'نوع المحفظة',
      fieldType: 'MULTISELECT',
      appliesTo: 'PROFESSIONAL',
      options: [
        { value: 'design', label: 'تصميم' },
        { value: 'video', label: 'فيديو' },
        { value: 'writing', label: 'كتابة' },
        { value: 'photography', label: 'تصوير' },
      ],
    },
    {
      categorySlug: 'creative-services',
      name: 'hourly_rate',
      label: 'الأجر بالساعة (ر.س)',
      fieldType: 'NUMBER',
      appliesTo: 'PROFESSIONAL',
    },
  ];

  const createdFields: Record<string, { id: string; fieldType: string }> = {};

  for (const def of dynamicFieldDefinitions) {
    const category = await prisma.category.findUnique({ where: { slug: def.categorySlug } });
    if (!category) continue;

    const existing = await prisma.dynamicFieldDefinition.findFirst({
      where: { name: def.name, categoryId: category.id },
    });

    const field = existing
      ? existing
      : await prisma.dynamicFieldDefinition.create({
          data: {
            name: def.name,
            label: def.label,
            fieldType: def.fieldType,
            appliesTo: def.appliesTo,
            categoryId: category.id,
            options: def.options as any,
            isRequired: def.isRequired ?? false,
            updatedAt: new Date(),
          },
        });

    createdFields[`${def.categorySlug}.${def.name}`] = { id: field.id, fieldType: field.fieldType };
  }

  // ─── Demo User for Businesses ───
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@gateo.com' },
    update: {},
    create: {
      email: 'demo@gateo.com',
      name: 'Demo Owner',
      password: demoPassword,
      role: 'USER',
      accountType: 'BUSINESS',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  // ─── Demo Businesses for Ladies Gate Categories ───
  const demoBusinesses = [
    // الجمال والعناية الشخصية
    { name: 'صالون لمسة ناعمة', slug: 'lamset-naema-salon', categorySlug: 'lg-beauty-care', subcategorySlug: 'ladies-salons', city: 'الرياض', address: 'حي العليا، طريق الملك فهد', phone: '0501234567', avgRating: 4.8, reviewCount: 128, lat: 24.7136, lng: 46.6753 },
    { name: 'صالون عبود للجميع', slug: 'abood-ladies-salon', categorySlug: 'lg-beauty-care', subcategorySlug: 'ladies-salons', city: 'جدة', address: 'حي الروضة، شارع التحلية', phone: '0502223333', avgRating: 4.7, reviewCount: 95, lat: 21.4950, lng: 39.1800 },
    { name: 'مركز شعرك جمال', slug: 'shaarik-jamal', categorySlug: 'lg-beauty-care', subcategorySlug: 'hair-care-centers', city: 'جدة', address: 'حي الروضة، شارع التحلية', phone: '0502345678', avgRating: 4.6, reviewCount: 89, lat: 21.4858, lng: 39.1925 },
    { name: 'بشرة نضرة', slug: 'bashara-nadra', categorySlug: 'lg-beauty-care', subcategorySlug: 'skin-care-centers', city: 'الدمام', address: 'حي الشاطئ، شارع الأمير محمد', phone: '0503456789', avgRating: 4.9, reviewCount: 215, lat: 26.4207, lng: 50.0888 },
    { name: 'مكياج العروس', slug: 'makyaj-alares', categorySlug: 'lg-beauty-care', subcategorySlug: 'makeup-centers', city: 'الرياض', address: 'حي النرجس، طريق عثمان بن عفان', phone: '0504567890', avgRating: 4.7, reviewCount: 167, lat: 24.7685, lng: 46.7028 },
    { name: 'نيل آرت', slug: 'nail-art-center', categorySlug: 'lg-beauty-care', subcategorySlug: 'nail-care', city: 'جدة', address: 'حي الحمراء، شارع فلسطين', phone: '0505678901', avgRating: 4.5, reviewCount: 76, lat: 21.5603, lng: 39.1767 },
    { name: 'حمام مغربي رويال', slug: 'hammam-maghribi-royal', categorySlug: 'lg-beauty-care', subcategorySlug: 'moroccan-bath', city: 'الرياض', address: 'حي الملقا، طريق الأمير تركي', phone: '0506789012', avgRating: 4.8, reviewCount: 143, lat: 24.7406, lng: 46.6346 },
    { name: 'تجميل منزلك', slug: 'tajmeel-manzelik', categorySlug: 'lg-beauty-care', subcategorySlug: 'home-beauty', city: 'جدة', address: 'خدمات منزلية متنقلة', phone: '0507890123', avgRating: 4.4, reviewCount: 52, lat: 21.4500, lng: 39.2000 },

    // الصحة والعلاج
    { name: 'مركز الشفاء الطبيعي', slug: 'shifa-physical-therapy', categorySlug: 'lg-health', subcategorySlug: 'physical-therapy', city: 'الرياض', address: 'حي السليمانية، شارع العليا العام', phone: '0508901234', avgRating: 4.7, reviewCount: 98, lat: 24.6900, lng: 46.7100 },
    { name: 'دار التأهيل', slug: 'dar-altaheel', categorySlug: 'lg-health', subcategorySlug: 'rehabilitation', city: 'جدة', address: 'حي الروضة، شارع الأمير سلطان', phone: '0509012345', avgRating: 4.6, reviewCount: 67, lat: 21.5000, lng: 39.1800 },
    { name: 'عيادة بشرة صحية', slug: 'bashara-sahiya-clinic', categorySlug: 'lg-health', subcategorySlug: 'dermatology', city: 'الدمام', address: 'حي الفيصلية، شارع الملك سعود', phone: '0510123456', avgRating: 4.9, reviewCount: 234, lat: 26.4000, lng: 50.0900 },
    { name: 'تغذية صحية', slug: 'taghzhia-sahiya', categorySlug: 'lg-health', subcategorySlug: 'nutrition', city: 'الرياض', address: 'حي العقيق، طريق عثمان بن عفان', phone: '0511234567', avgRating: 4.5, reviewCount: 45, lat: 24.7800, lng: 46.6900 },
    { name: 'عيادة النور التجميلية', slug: 'noor-cosmetic-clinic', categorySlug: 'lg-health', subcategorySlug: 'cosmetic-clinics-lg', city: 'جدة', address: 'حي المحمدية، شارع التحلية', phone: '0512345678', avgRating: 4.8, reviewCount: 189, lat: 21.4800, lng: 39.1900 },
    { name: 'مركز الليزر المثالي', slug: 'laser-methali', categorySlug: 'lg-health', subcategorySlug: 'laser-centers', city: 'الرياض', address: 'حي الملقا، طريق الأمير محمد بن سلمان', phone: '0513456789', avgRating: 4.7, reviewCount: 156, lat: 24.7500, lng: 46.6400 },
    { name: 'نحت جسم بروفيشنال', slug: 'nahat-jism-professional', categorySlug: 'lg-health', subcategorySlug: 'body-sculpting', city: 'جدة', address: 'حي الروضة، شارع الأندلس', phone: '0514567890', avgRating: 4.6, reviewCount: 112, lat: 21.4900, lng: 39.1850 },

    // اللياقة والاسترخاء
    { name: 'نادي النساء الذهبي', slug: 'golden-ladies-gym', categorySlug: 'lg-fitness', subcategorySlug: 'ladies-sports-clubs', city: 'الرياض', address: 'حي الياسمين، طريق الملك عبدالعزيز', phone: '0515678901', avgRating: 4.8, reviewCount: 201, lat: 24.7600, lng: 46.6800 },
    { name: 'يوغا زن', slug: 'yoga-zen', categorySlug: 'lg-fitness', subcategorySlug: 'yoga-pilates', city: 'جدة', address: 'حي الشاطئ، كورنيش جدة', phone: '0516789012', avgRating: 4.9, reviewCount: 145, lat: 21.5800, lng: 39.1500 },
    { name: 'فيتنس بلس', slug: 'fitness-plus', categorySlug: 'lg-fitness', subcategorySlug: 'fitness-centers', city: 'الدمام', address: 'حي الفيصلية، شارع الظهران', phone: '0517890123', avgRating: 4.5, reviewCount: 87, lat: 26.4100, lng: 50.1000 },
    { name: 'مدربتي الشخصية', slug: 'modarebati-shakhsiya', categorySlug: 'lg-fitness', subcategorySlug: 'personal-training', city: 'الرياض', address: 'حي النرجس، طريق الإمام سعود', phone: '0518901234', avgRating: 4.7, reviewCount: 63, lat: 24.7700, lng: 46.7000 },
    { name: 'تأمل واسترخاء', slug: 'tafmul-istikhaa', categorySlug: 'lg-fitness', subcategorySlug: 'meditation', city: 'جدة', address: 'حي الحمراء، شارع فلسطين', phone: '0519012345', avgRating: 4.8, reviewCount: 94, lat: 21.5500, lng: 39.1700 },

    // السبا والمساج
    { name: 'سبا النخبة', slug: 'spa-alnokhba', categorySlug: 'lg-spa', subcategorySlug: 'spa-centers', city: 'الرياض', address: 'حي الملقا، طريق الأمير تركي الأول', phone: '0520123456', avgRating: 4.9, reviewCount: 278, lat: 24.7350, lng: 46.6250 },
    { name: 'مساج علاجي بروفيشنال', slug: 'massage-therapeutic-pro', categorySlug: 'lg-spa', subcategorySlug: 'therapeutic-massage', city: 'جدة', address: 'حي الروضة، شارع صاري', phone: '0521234567', avgRating: 4.7, reviewCount: 134, lat: 21.4950, lng: 39.1950 },
    { name: 'مساج الاسترخاء الذهبي', slug: 'golden-relaxation-massage', categorySlug: 'lg-spa', subcategorySlug: 'relaxation-massage', city: 'الدمام', address: 'حي الشاطئ، كورنيش الدمام', phone: '0522345678', avgRating: 4.8, reviewCount: 187, lat: 26.4300, lng: 50.0800 },
    { name: 'ساونا وبخار', slug: 'sauna-bakhour', categorySlug: 'lg-spa', subcategorySlug: 'sauna-steam', city: 'الرياض', address: 'حي العليا، طريق الملك فهد', phone: '0523456789', avgRating: 4.6, reviewCount: 98, lat: 24.7150, lng: 46.6700 },
    { name: 'عناية بالجسم رويال', slug: 'body-care-royal', categorySlug: 'lg-spa', subcategorySlug: 'body-care', city: 'جدة', address: 'حي الحمراء، شارع الأندلس', phone: '0524567890', avgRating: 4.7, reviewCount: 156, lat: 21.5650, lng: 39.1750 },

    // التسوق ومستحضرات التجميل
    { name: 'ماي ميك اب ستور', slug: 'my-makeup-store', categorySlug: 'lg-shopping', subcategorySlug: 'makeup-shops', city: 'الرياض', address: 'حي العليا، الرياض بارك', phone: '0525678901', avgRating: 4.5, reviewCount: 342, lat: 24.7100, lng: 46.6750 },
    { name: 'مستحضرات النخبة', slug: 'cosmetics-alnokhba', categorySlug: 'lg-shopping', subcategorySlug: 'cosmetics-shops', city: 'جدة', address: 'حي الروضة، رد سي مول', phone: '0526789012', avgRating: 4.6, reviewCount: 289, lat: 21.4900, lng: 39.1900 },
    { name: 'عطور العربية', slug: 'perfumes-arabia', categorySlug: 'lg-shopping', subcategorySlug: 'perfumes-shops', city: 'الدمام', address: 'حي الفيصلية، الدمام مول', phone: '0527890123', avgRating: 4.8, reviewCount: 198, lat: 26.4050, lng: 50.0950 },
    { name: 'بشرة صحية ستور', slug: 'skincare-store', categorySlug: 'lg-shopping', subcategorySlug: 'skincare-products', city: 'الرياض', address: 'حي الياسمين، بارك أفنيو', phone: '0528901234', avgRating: 4.4, reviewCount: 156, lat: 24.7650, lng: 46.6850 },
    { name: 'شعر صحي', slug: 'hair-healthy-store', categorySlug: 'lg-shopping', subcategorySlug: 'haircare-products', city: 'جدة', address: 'حي الشاطئ، العرب مول', phone: '0529012345', avgRating: 4.3, reviewCount: 112, lat: 21.5750, lng: 39.1550 },
    { name: 'بيوتي اونلاين', slug: 'beauty-online-store', categorySlug: 'lg-shopping', subcategorySlug: 'online-beauty', city: 'الرياض', address: 'متجر إلكتروني - شحن لجميع المدن', phone: '0530123456', avgRating: 4.7, reviewCount: 445, lat: 24.7200, lng: 46.6800 },

    // الأزياء والموضة
    { name: 'أزياء لمسة أنثى', slug: 'lamset-untha-fashion', categorySlug: 'lg-fashion', subcategorySlug: 'women-clothing', city: 'الرياض', address: 'حي العليا، طريق العروبة', phone: '0531234567', avgRating: 4.6, reviewCount: 234, lat: 24.7050, lng: 46.6650 },
    { name: 'عبايات الملكة', slug: 'abayat-almalika', categorySlug: 'lg-fashion', subcategorySlug: 'abayas', city: 'جدة', address: 'حي البلد، شارع قابل', phone: '0532345678', avgRating: 4.8, reviewCount: 312, lat: 21.4800, lng: 39.1850 },
    { name: 'لانجري شيك', slug: 'lingerie-chic', categorySlug: 'lg-fashion', subcategorySlug: 'lingerie', city: 'الدمام', address: 'حي الشاطئ، مجمع الشاطئ', phone: '0533456789', avgRating: 4.5, reviewCount: 87, lat: 26.4250, lng: 50.0850 },
    { name: 'أحذية عامة فاخرة', slug: 'luxury-women-shoes', categorySlug: 'lg-fashion', subcategorySlug: 'women-shoes', city: 'الرياض', address: 'حي الملقا، الرياض بارك', phone: '0534567890', avgRating: 4.4, reviewCount: 145, lat: 24.7300, lng: 46.6300 },
    { name: 'إكسسواراتي', slug: 'iksesawareti', categorySlug: 'lg-fashion', subcategorySlug: 'bags-accessories', city: 'جدة', address: 'حي الروضة، رد سي مول', phone: '0535678901', avgRating: 4.7, reviewCount: 198, lat: 21.4850, lng: 39.1950 },
    { name: 'مجوهرات الأميرة', slug: 'jewelry-alamira', categorySlug: 'lg-fashion', subcategorySlug: 'jewelry-watches', city: 'الرياض', address: 'حي العليا، طريق الملك فهد', phone: '0536789012', avgRating: 4.9, reviewCount: 267, lat: 24.7120, lng: 46.6740 },

    // الهدايا والمناسبات
    { name: 'زهور الربيع', slug: 'zuhoor-alrabi', categorySlug: 'lg-gifts', subcategorySlug: 'flower-shops', city: 'الرياض', address: 'حي العليا، شارع العليا العام', phone: '0537890123', avgRating: 4.8, reviewCount: 178, lat: 24.7180, lng: 46.6780 },
    { name: 'تنسيق هدايا مميز', slug: 'tansiq-hdaya-mumayaz', categorySlug: 'lg-gifts', subcategorySlug: 'gift-arrangement', city: 'جدة', address: 'حي الحمراء، شارع فلسطين', phone: '0538901234', avgRating: 4.6, reviewCount: 89, lat: 21.5550, lng: 39.1680 },
    { name: 'تغليف فاخر', slug: 'taghleef-fakher', categorySlug: 'lg-gifts', subcategorySlug: 'gift-wrapping', city: 'الدمام', address: 'حي الفيصلية، شارع الملك سعود', phone: '0539012345', avgRating: 4.4, reviewCount: 56, lat: 26.3950, lng: 50.0880 },
    { name: 'شوكولاتة بلجيكية', slug: 'belgian-chocolate', categorySlug: 'lg-gifts', subcategorySlug: 'luxury-chocolate', city: 'الرياض', address: 'حي الملقا، طريق الأمير محمد', phone: '0540123456', avgRating: 4.9, reviewCount: 234, lat: 24.7380, lng: 46.6280 },
    { name: 'مناسباتك معنا', slug: 'manasibek-maana', categorySlug: 'lg-gifts', subcategorySlug: 'ladies-events', city: 'جدة', address: 'حي الروضة، شارع صاري', phone: '0541234567', avgRating: 4.7, reviewCount: 123, lat: 21.4920, lng: 46.6920 },

    // الأعراس والمناسبات
    { name: 'تجهيز العروس - دار الأنوار', slug: 'taheez-alares-dar-anwar', categorySlug: 'lg-weddings', subcategorySlug: 'bridal-prep', city: 'الرياض', address: 'حي العليا، طريق الملك فهد', phone: '0542345678', avgRating: 4.9, reviewCount: 345, lat: 24.7140, lng: 46.6720 },
    { name: 'فنانة مكياج نور', slug: 'makeup-artist-noor', categorySlug: 'lg-weddings', subcategorySlug: 'makeup-artists', city: 'جدة', address: 'حي الروضة، شارع التحلية', phone: '0543456789', avgRating: 4.8, reviewCount: 267, lat: 21.4880, lng: 39.1880 },
    { name: 'مصففة الشعر المبدعة', slug: 'hair-stylist-mubdia', categorySlug: 'lg-weddings', subcategorySlug: 'hair-stylists', city: 'الدمام', address: 'حي الشاطئ، كورنيش الدمام', phone: '0544567890', avgRating: 4.7, reviewCount: 198, lat: 26.4280, lng: 50.0820 },
    { name: 'قاعة الأحلام', slug: 'qaea-alahlam', categorySlug: 'lg-weddings', subcategorySlug: 'event-halls', city: 'الرياض', address: 'حي الملقا، طريق الأمير تركي', phone: '0545678901', avgRating: 4.6, reviewCount: 156, lat: 24.7420, lng: 46.6360 },
    { name: 'عدسة أنثى', slug: 'adset-untha', categorySlug: 'lg-weddings', subcategorySlug: 'women-photography', city: 'جدة', address: 'حي الشاطئ، كورنيش جدة', phone: '0546789012', avgRating: 4.8, reviewCount: 189, lat: 21.5820, lng: 46.6480 },
    { name: 'فساتين ليلة العمر', slug: 'fsatin-laylat-alomr', categorySlug: 'lg-weddings', subcategorySlug: 'dress-rental', city: 'الرياض', address: 'حي العليا، شارع العروبة', phone: '0547890123', avgRating: 4.9, reviewCount: 278, lat: 24.7080, lng: 46.6680 },

    // الأمومة والطفل
    { name: 'ملابس أطفال كيوت', slug: 'kids-clothing-cute', categorySlug: 'lg-motherhood', subcategorySlug: 'kids-clothing', city: 'جدة', address: 'حي الروضة، رد سي مول', phone: '0548901234', avgRating: 4.5, reviewCount: 234, lat: 21.4870, lng: 39.1920 },
    { name: 'مستلزمات المولود', slug: 'mustalzamat-al-mawlood', categorySlug: 'lg-motherhood', subcategorySlug: 'newborn-essentials', city: 'الرياض', address: 'حي الياسمين، بارك أفنيو', phone: '0549012345', avgRating: 4.6, reviewCount: 178, lat: 24.7680, lng: 46.6880 },
    { name: 'حضانة سنابل', slug: 'hadanat-sanabel', categorySlug: 'lg-motherhood', subcategorySlug: 'nurseries', city: 'الدمام', address: 'حي الفيصلية، شارع الظهران', phone: '0550123456', avgRating: 4.8, reviewCount: 145, lat: 26.4020, lng: 50.0920 },
    { name: 'تعليم مبكر بسمة', slug: 'taaleem-mubaker-basma', categorySlug: 'lg-motherhood', subcategorySlug: 'early-education', city: 'الرياض', address: 'حي النرجس، طريق الإمام سعود', phone: '0551234567', avgRating: 4.7, reviewCount: 98, lat: 24.7720, lng: 46.7020 },
    { name: 'ألعاب وأحلام', slug: 'alab-wa-ahlam', categorySlug: 'lg-motherhood', subcategorySlug: 'kids-toys', city: 'جدة', address: 'حي الحمراء، الرد سي مول', phone: '0552345678', avgRating: 4.4, reviewCount: 167, lat: 21.5580, lng: 39.1720 },

    // المنزل ونمط الحياة
    { name: 'ديكور بيتي', slug: 'decor-baiti', categorySlug: 'lg-home', subcategorySlug: 'home-decor', city: 'الرياض', address: 'حي العليا، الرياض بارك', phone: '0553456789', avgRating: 4.6, reviewCount: 198, lat: 24.7160, lng: 46.6760 },
    { name: 'مفروشات الراحة', slug: 'mafrooshat-alraha', categorySlug: 'lg-home', subcategorySlug: 'furniture', city: 'جدة', address: 'حي الروضة، شارع التحلية', phone: '0554567890', avgRating: 4.5, reviewCount: 134, lat: 21.4930, lng: 39.1930 },
    { name: 'أدوات منزلية شيك', slug: 'adwat-manzeliya-chic', categorySlug: 'lg-home', subcategorySlug: 'home-appliances', city: 'الدمام', address: 'حي الفيصلية، الدمام مول', phone: '0555678901', avgRating: 4.3, reviewCount: 89, lat: 26.4080, lng: 50.0980 },
    { name: 'تنظيف بيتي', slug: 'tandheef-baiti', categorySlug: 'lg-home', subcategorySlug: 'home-cleaning', city: 'الرياض', address: 'خدمات منزلية - جميع الأحياء', phone: '0556789012', avgRating: 4.7, reviewCount: 245, lat: 24.7250, lng: 46.6820 },
    { name: 'مناسبات منزلية', slug: 'manasibat-manzeliya', categorySlug: 'lg-home', subcategorySlug: 'home-events', city: 'جدة', address: 'حي الشاطئ، خدمات منزلية', phone: '0557890123', avgRating: 4.6, reviewCount: 112, lat: 21.5780, lng: 39.1580 },

    // التعليم والتطوير
    { name: 'مركز تدريب سيدات المستقبل', slug: 'women-future-training', categorySlug: 'lg-education', subcategorySlug: 'women-training', city: 'الرياض', address: 'حي العليا، شارع العليا العام', phone: '0558901234', avgRating: 4.8, reviewCount: 156, lat: 24.7200, lng: 46.6800 },
    { name: 'أكاديمية التجميل', slug: 'beauty-academy', categorySlug: 'lg-education', subcategorySlug: 'beauty-courses', city: 'جدة', address: 'حي الحمراء، شارع فلسطين', phone: '0559012345', avgRating: 4.7, reviewCount: 134, lat: 21.5520, lng: 39.1650 },
    { name: 'دورات مكياج بروفيشنال', slug: 'makeup-courses-pro', categorySlug: 'lg-education', subcategorySlug: 'makeup-courses', city: 'الدمام', address: 'حي الفيصلية، شارع الملك سعود', phone: '0560123456', avgRating: 4.9, reviewCount: 198, lat: 26.3980, lng: 50.0860 },
    { name: 'لياقة وصحة أكاديمي', slug: 'fitness-health-academy', categorySlug: 'lg-education', subcategorySlug: 'fitness-courses', city: 'الرياض', address: 'حي الياسمين، طريق الملك عبدالعزيز', phone: '0561234567', avgRating: 4.6, reviewCount: 87, lat: 24.7620, lng: 46.6840 },
    { name: 'تطوير مهاراتي', slug: 'tateweer-maharaty', categorySlug: 'lg-education', subcategorySlug: 'skill-development', city: 'جدة', address: 'حي الروضة، شارع صاري', phone: '0562345678', avgRating: 4.8, reviewCount: 123, lat: 21.4960, lng: 39.1980 },

    // المطاعم والكافيهات
    { name: 'كافيه لمسة', slug: 'cafe-lamsa', categorySlug: 'lg-dining', subcategorySlug: 'cafes', city: 'الرياض', address: 'حي العليا، طريق العروبة', phone: '0563456789', avgRating: 4.7, reviewCount: 345, lat: 24.7120, lng: 46.6700 },
    { name: 'مطعم بيتي العائلي', slug: 'matam-baiti-family', categorySlug: 'lg-dining', subcategorySlug: 'family-restaurants', city: 'جدة', address: 'حي الروضة، شارع الأمير سلطان', phone: '0564567890', avgRating: 4.6, reviewCount: 278, lat: 21.4850, lng: 39.1880 },
    { name: 'جلسة عامة', slug: 'jalsa-nesaiya', categorySlug: 'lg-dining', subcategorySlug: 'ladies-gathering', city: 'الدمام', address: 'حي الشاطئ، كورنيش الدمام', phone: '0565678901', avgRating: 4.8, reviewCount: 198, lat: 26.4320, lng: 50.0780 },
    { name: 'حلويات لذيذة', slug: 'halawat-latheetha', categorySlug: 'lg-dining', subcategorySlug: 'sweets-bakery', city: 'الرياض', address: 'حي الملقا، طريق الأمير تركي', phone: '0566789012', avgRating: 4.9, reviewCount: 412, lat: 24.7400, lng: 46.6320 },
  ];

  for (const biz of demoBusinesses) {
    const category = await prisma.category.findUnique({ where: { slug: biz.categorySlug } });
    const subcategory = await prisma.subcategory.findUnique({ where: { slug: biz.subcategorySlug } });
    if (category && subcategory) {
      // Create a unique user for each business (Business.userId is unique)
      const bizUser = await prisma.user.upsert({
        where: { email: `${biz.slug}@demo.gateo.com` },
        update: {},
        create: {
          email: `${biz.slug}@demo.gateo.com`,
          name: `مالك ${biz.name}`,
          password: demoPassword,
          role: 'USER',
          accountType: 'BUSINESS',
          updatedAt: new Date(),
        },
      });

      const business = await prisma.business.upsert({
        where: { slug: biz.slug },
        update: {},
        create: {
          userId: bizUser.id,
          name: biz.name,
          slug: biz.slug,
          description: `أفضل الخدمات في ${biz.name}. نقدم تجربة فريدة للجميع مع أعلى معايير الجودة والاحترافية.`,
          categoryId: category.id,
          subcategoryId: subcategory.id,
          city: biz.city,
          address: biz.address,
          phone: biz.phone,
          avgRating: biz.avgRating,
          reviewCount: biz.reviewCount,
          latitude: biz.lat,
          longitude: biz.lng,
          status: 'ACTIVE',
          isVerified: Math.random() > 0.3, // 70% verified
          updatedAt: new Date(),
        },
      });

      // Seed default theme and pages for demo business
      const existingTheme = await prisma.businessTheme.findUnique({
        where: { businessId: business.id },
      });
      if (!existingTheme) {
        await prisma.businessTheme.create({
          data: {
            businessId: business.id,
            presetId: null,
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
            updatedAt: new Date(),
            sections: JSON.stringify([
              { id: 'hero', type: 'hero', enabled: true, order: 10 },
              { id: 'about', type: 'about', enabled: true, order: 20 },
              { id: 'experience', type: 'experience', enabled: false, order: 30 },
              { id: 'services', type: 'services', enabled: true, order: 40 },
              { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
              { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
              { id: 'contact', type: 'contact', enabled: true, order: 70 },
              { id: 'cta', type: 'cta', enabled: true, order: 80 },
            ]) as any,
          },
        });
      }

      const existingPages = await prisma.businessPage.count({
        where: { businessId: business.id },
      });
      if (existingPages === 0) {
        await prisma.businessPage.createMany({
          data: [
            {
              businessId: business.id,
              slug: 'home',
              title: 'الرئيسية',
              isHomePage: true,
              isVisible: true,
              sortOrder: 0,
              updatedAt: new Date(),
            },
            {
              businessId: business.id,
              slug: 'about',
              title: 'من نحن',
              isHomePage: false,
              isVisible: true,
              sortOrder: 10,
              content: `أفضل الخدمات في ${biz.name}. نقدم تجربة فريدة للجميع مع أعلى معايير الجودة والاحترافية.`,
              updatedAt: new Date(),
            },
            {
              businessId: business.id,
              slug: 'contact',
              title: 'تواصل معنا',
              isHomePage: false,
              isVisible: true,
              sortOrder: 20,
              updatedAt: new Date(),
            },
          ] as any,
        });
      }

      // Seed dynamic field values for demo businesses
      if (biz.categorySlug === 'beauty-salons') {
        const customerTypeField = createdFields['beauty-salons.customer_type'];
        const homeServiceField = createdFields['beauty-salons.home_service'];
        const bookingUrlField = createdFields['beauty-salons.booking_url'];
        const entries = [] as { fieldId: string; value: string | null }[];
        if (customerTypeField) {
          const options = ['women', 'children', 'all'];
          entries.push({ fieldId: customerTypeField.id, value: options[Math.floor(Math.random() * options.length)] });
        }
        if (homeServiceField) {
          entries.push({ fieldId: homeServiceField.id, value: Math.random() > 0.5 ? 'true' : 'false' });
        }
        if (bookingUrlField && Math.random() > 0.6) {
          entries.push({ fieldId: bookingUrlField.id, value: `https://booking.example.com/${biz.slug}` });
        }
        for (const entry of entries) {
          await prisma.businessFieldValue.upsert({
            where: { businessId_fieldId: { businessId: business.id, fieldId: entry.fieldId } },
            update: { value: entry.value, updatedAt: new Date() },
            create: { businessId: business.id, fieldId: entry.fieldId, value: entry.value, updatedAt: new Date() },
          });
        }
      }

      if (biz.categorySlug === 'medical-services') {
        const insuranceField = createdFields['medical-services.accepts_insurance'];
        const expField = createdFields['medical-services.years_experience'];
        const entries = [] as { fieldId: string; value: string | null }[];
        if (insuranceField) {
          entries.push({ fieldId: insuranceField.id, value: Math.random() > 0.3 ? 'true' : 'false' });
        }
        if (expField) {
          entries.push({ fieldId: expField.id, value: String(Math.floor(Math.random() * 20) + 1) });
        }
        for (const entry of entries) {
          await prisma.businessFieldValue.upsert({
            where: { businessId_fieldId: { businessId: business.id, fieldId: entry.fieldId } },
            update: { value: entry.value, updatedAt: new Date() },
            create: { businessId: business.id, fieldId: entry.fieldId, value: entry.value, updatedAt: new Date() },
          });
        }
      }

      // Seed demo products for some businesses
      const existingProducts = await prisma.product.count({
        where: { businessId: business.id },
      });
      if (existingProducts === 0 && Math.random() > 0.6) {
        const categories: Record<string, string[]> = {
          'lg-beauty-care': ['مستحضر عناية', 'أداة تجميل', 'منتج شعر'],
          'lg-health': ['مكمل غذائي', 'منتج عناية', 'جهاز طبي صغير'],
          'lg-shopping': ['عطر', 'مكياج', 'منتج بشرة'],
          'lg-fashion': ['إكسسوار', 'حقيبة', 'عباية'],
          'lg-gifts': ['بوكس هدية', 'شوكولاتة', 'ورد'],
          'lg-dining': ['حلويات', 'قهوة', 'وجبة جاهزة'],
        };
        const productNames = categories[biz.categorySlug] || ['منتج مميز', 'عرض خاص'];
        const productName = productNames[Math.floor(Math.random() * productNames.length)];
        const price = Math.floor(Math.random() * 400) + 50;
        const comparePrice = Math.random() > 0.5 ? price + Math.floor(Math.random() * 100) + 20 : null;

        const product = await prisma.product.create({
          data: {
            businessId: business.id,
            name: `${productName} - ${biz.name}`,
            description: `منتج مميز من ${biz.name}، جودة عالية وسعر ممتاز.`,
            price: price,
            comparePrice: comparePrice,
            quantity: Math.floor(Math.random() * 50) + 5,
            category: productName,
            status: 'ACTIVE',
            isInMarketplace: true,
            updatedAt: new Date(),
          },
        });

        await prisma.marketplaceListing.create({
          data: {
            productId: product.id,
            category: biz.categorySlug,
            featured: Math.random() > 0.8,
            updatedAt: new Date(),
          },
        });
      }
    }
  }

  // ─── Demo Ads ───
  const adUser = await prisma.user.upsert({
    where: { email: 'ads-demo@gateo.com' },
    update: {},
    create: {
      email: 'ads-demo@gateo.com',
      name: 'JoLife IT',
      password: demoPassword,
      role: 'USER',
      accountType: 'BUSINESS',
      emailVerified: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.ad.upsert({
    where: { id: 'jolife-it-hero-ad' },
    update: {},
    create: {
      id: 'jolife-it-hero-ad',
      userId: adUser.id,
      title: 'JoLife IT - حلول تقنية مبتكرة',
      description: 'نقدم حلول برمجية وتقنية متكاملة لتطوير أعمالك بكفاءة واحترافية. تصميم مواقع، تطبيقات، وحلول أتمتة ذكية.',
      image: '/ads/jolife-demo.png',
      link: 'https://jolifeit.com',
      buttonText: 'اعرف المزيد',
      advertiserName: 'JoLife IT',
      advertiserLogo: '/logo/logo-icon.svg',
      placement: 'HERO',
      status: 'ACTIVE',
      startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isPaid: true,
      updatedAt: new Date(),
    },
  });

  await prisma.ad.upsert({
    where: { id: 'jolife-it-feed-ad' },
    update: {},
    create: {
      id: 'jolife-it-feed-ad',
      userId: adUser.id,
      title: 'طوّر عملك مع JoLife IT',
      description: 'خدمات تقنية موثوقة لدعم نمو أعمالك وتجارتك الإلكترونية.',
      image: '/ads/jolife-demo.png',
      link: 'https://jolifeit.com',
      buttonText: 'تواصل معنا',
      advertiserName: 'JoLife IT',
      advertiserLogo: '/logo/logo-icon.svg',
      placement: 'FEED',
      status: 'ACTIVE',
      startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isPaid: true,
      updatedAt: new Date(),
    },
  });

  await prisma.ad.upsert({
    where: { id: 'jolife-it-sidebar-ad' },
    update: {},
    create: {
      id: 'jolife-it-sidebar-ad',
      userId: adUser.id,
      title: 'JoLife IT',
      description: 'شريكك التقني الموثوق لتطوير الأعمال الرقمية.',
      image: '/ads/jolife-demo.png',
      link: 'https://jolifeit.com',
      buttonText: 'تصفح خدماتنا',
      advertiserName: 'JoLife IT',
      advertiserLogo: '/logo/logo-icon.svg',
      placement: 'SIDEBAR',
      status: 'ACTIVE',
      startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isPaid: true,
      updatedAt: new Date(),
    },
  });

  // Seed financial defaults
  await prisma.paymentGateway.upsert({
    where: { code: 'manual' },
    update: {},
    create: {
      id: 'manual-gateway',
      code: 'manual',
      name: 'Manual / Demo',
      nameAr: 'يدوي / تجريبي',
      isActive: true,
      isDefault: true,
      currencies: 'USD',
      updatedAt: new Date(),
    },
  });

  await prisma.paymentGateway.upsert({
    where: { code: 'stripe' },
    update: {},
    create: {
      id: 'stripe-gateway',
      code: 'stripe',
      name: 'Stripe',
      nameAr: 'سترايب',
      isActive: false,
      currencies: 'USD',
      updatedAt: new Date(),
    },
  });

  await prisma.taxRate.upsert({
    where: { countryCode_type: { countryCode: 'JO', type: 'VAT' } },
    update: {},
    create: {
      countryCode: 'JO',
      name: 'ضريبة القيمة المضافة',
      rate: 16,
      type: 'VAT',
      updatedAt: new Date(),
    },
  });

  await prisma.commissionRule.upsert({
    where: { id: 'default-booking-commission' },
    update: {},
    create: {
      id: 'default-booking-commission',
      name: 'عمولة الحجوزات الافتراضية',
      appliesTo: 'bookings',
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
      updatedAt: new Date(),
    },
  });

  await prisma.commissionRule.upsert({
    where: { id: 'default-marketplace-commission' },
    update: {},
    create: {
      id: 'default-marketplace-commission',
      name: 'عمولة المتجر الافتراضية',
      appliesTo: 'marketplace',
      type: 'PERCENTAGE',
      value: 8,
      isActive: true,
      updatedAt: new Date(),
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      nameAr: 'بداية',
      description: 'الباقة الأساسية للأنشطة التجارية',
      price: 29,
      duration: 30,
      features: JSON.stringify([{ feature: 'موقع تجاري', value: 'نعم' }, { feature: 'منتجات', value: '50' }]),
      isActive: true,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Business' },
    update: {},
    create: {
      name: 'Business',
      nameAr: 'أعمال',
      description: 'الباقة المتقدمة للنمو',
      price: 99,
      duration: 30,
      features: JSON.stringify([{ feature: 'منتجات', value: 'غير محدود' }, { feature: 'إعلانات', value: 'خصم 20%' }]),
      isActive: true,
    },
  });

  await prisma.exchangeRate.upsert({
    where: { baseCurrency_targetCurrency: { baseCurrency: 'USD', targetCurrency: 'SAR' } },
    update: {},
    create: {
      baseCurrency: 'USD',
      targetCurrency: 'SAR',
      rate: 3.75,
      source: 'seed',
      fetchedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Seed completed successfully');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
