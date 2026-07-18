import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getThemePresetById, getDefaultSections, getStoreDefaultSections, getFashionOneSections, type HomeTemplateId } from '@/lib/business-template-generator';
import { getDesignById, resolveHomeTemplate, resolvePresetId } from '@/lib/business-design-library';

const applySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  subcategoryIds: z.array(z.string()).default([]),
  customSubcategories: z.array(z.string().max(100)).default([]),
  countryId: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  latitude: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.number().optional()
  ),
  phone: z.string().optional(),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email().optional()
  ),
  website: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url().optional()
  ),
  logo: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(1).optional()
  ),
  cover: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(1).optional()
  ),
  businessType: z.enum(['INDIVIDUAL', 'COMPANY']).optional(),
  websiteType: z.enum(['INTRO', 'STORE']).optional(),
  themePresetId: z.string().optional(),
  homeTemplate: z.enum(['default', 'enfold-spa', 'beauty-salon-1', 'modern-intro']).optional(),
  designId: z.string().optional(),
  useAutoColors: z.boolean().optional(),
  themeColors: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    backgroundColor: z.string(),
    surfaceColor: z.string(),
    textColor: z.string(),
  }).optional(),
  images: z.array(z.object({
    url: z.string().min(1),
    type: z.string().optional(),
    caption: z.string().optional(),
  })).optional(),
  workingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string(),
  })).optional(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string().min(1),
  })).optional(),
  services: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    price: z.number().optional(),
    duration: z.number().int().optional(),
    image: z.string().min(1).optional(),
  })).optional(),
  products: z.array(z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    price: z.number().min(0),
    comparePrice: z.number().min(0).optional(),
    quantity: z.number().int().min(0).optional(),
    category: z.string().max(100).optional(),
    image: z.string().min(1).optional(),
  })).optional(),
  fieldValues: z.record(z.string(), z.string().nullable()).optional(),
  fashionOne: z.object({
    fontHeading: z.string().optional(),
    fontBody: z.string().optional(),
    heroHeadline: z.string().optional(),
    heroImage: z.string().optional(),
    socialLinks: z.object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      pinterest: z.string().optional(),
      youtube: z.string().optional(),
    }).optional(),
  }).optional(),
});

// POST /api/businesses/apply - Submit business application
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Log incoming data for debugging
    console.log('Business apply body:', JSON.stringify(body, null, 2));
    
    const data = applySchema.parse(body);

    // Check if user already has a business
    const existing = await prisma.business.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      // Update existing business with new data
      const { services: _services, products: _products, themePresetId: _themePresetId, homeTemplate: _homeTemplate, designId: _designId, themeColors: _themeColors, useAutoColors: _useAutoColors, fieldValues: _fieldValues, subcategoryIds: _subcategoryIds, customSubcategories: _customSubcategories, fashionOne: _fashionOne, ...businessData } = data;
      
      // Check slug uniqueness only if slug changed
      if (data.slug !== existing.slug) {
        const slugExists = await prisma.business.findUnique({
          where: { slug: data.slug },
        });
        if (slugExists) {
          return NextResponse.json({ error: 'الرابط مستخدم من قبل' }, { status: 400 });
        }
      }
      
      const updated = await prisma.business.update({
        where: { id: existing.id },
        data: {
          ...businessData,
          status: 'PENDING',
          documents: data.documents ? JSON.stringify(data.documents) : null,
          workingHours: data.workingHours ? JSON.stringify(data.workingHours) : null,
          images: data.images ? JSON.stringify(data.images) : null,
        },
      });

      // Sync subcategories
      await syncBusinessSubcategories(existing.id, data.subcategoryIds, data.customSubcategories);

      // Replace old services with new ones
      await prisma.service.deleteMany({ where: { businessId: existing.id } });
      if (data.services && data.services.length > 0) {
        await prisma.service.createMany({
          data: data.services.map((s) => ({
            businessId: existing.id,
            name: s.name,
            description: s.description || null,
            price: s.price ?? null,
            duration: s.duration || null,
            image: s.image || null,
            isActive: true,
          })),
        });
      }

      // Replace old products with new ones for store type
      await prisma.product.deleteMany({ where: { businessId: existing.id } });
      if (data.products && data.products.length > 0) {
        await prisma.product.createMany({
          data: data.products.map((p) => ({
            businessId: existing.id,
            name: p.name,
            description: p.description || null,
            price: p.price,
            comparePrice: p.comparePrice ?? null,
            quantity: p.quantity ?? 0,
            category: p.category || null,
            images: p.image ? JSON.stringify([{ url: p.image, alt: p.name }]) : null,
            isInMarketplace: true,
          })),
        });
      }

      // Save dynamic field values
      await saveBusinessFieldValues(existing.id, data.categoryId, data.fieldValues);

      // Apply selected design if provided
      if (data.designId || data.themePresetId) {
        await applyThemePreset(existing.id, {
          designId: data.designId,
          themePresetId: data.themePresetId,
          websiteType: data.websiteType,
          homeTemplate: data.homeTemplate,
          themeColors: data.themeColors,
          fashionOne: data.fashionOne,
        });
      }

      // Create default pages if none exist
      await createDefaultPages(existing.id, updated.name, updated.description, updated.websiteType || undefined);

      return NextResponse.json({ business: updated, updated: true }, { status: 200 });
    }

    // Check slug uniqueness for new business
    const slugExists = await prisma.business.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists) {
      return NextResponse.json({ error: 'الرابط مستخدم من قبل' }, { status: 400 });
    }

    const { services: _services, products: _products, themePresetId: _themePresetId, homeTemplate: _homeTemplate, designId: _designId, themeColors: _themeColors, useAutoColors: _useAutoColors, fieldValues: _fieldValues, subcategoryIds: _subcategoryIds, customSubcategories: _customSubcategories, fashionOne: _fashionOne, ...businessData } = data;
    const business = await prisma.business.create({
      data: {
        ...businessData,
        userId: session.user.id,
        status: 'PENDING',
        documents: data.documents ? JSON.stringify(data.documents) : null,
        workingHours: data.workingHours ? JSON.stringify(data.workingHours) : null,
        images: data.images ? JSON.stringify(data.images) : null,
      },
    });

    // Sync subcategories
    await syncBusinessSubcategories(business.id, data.subcategoryIds, data.customSubcategories);

    // Create services if provided
    if (data.services && data.services.length > 0) {
      await prisma.service.createMany({
        data: data.services.map((s) => ({
          businessId: business.id,
          name: s.name,
          description: s.description || null,
          price: s.price ?? null,
          duration: s.duration || null,
          image: s.image || null,
          isActive: true,
        })),
      });
    }

    // Create products if provided for store type
    if (data.products && data.products.length > 0) {
      await prisma.product.createMany({
        data: data.products.map((p) => ({
          businessId: business.id,
          name: p.name,
          description: p.description || null,
          price: p.price,
          comparePrice: p.comparePrice ?? null,
          quantity: p.quantity ?? 0,
          category: p.category || null,
          images: p.image ? JSON.stringify([{ url: p.image, alt: p.name }]) : null,
          isInMarketplace: true,
        })),
      });
    }

    // Save dynamic field values
    await saveBusinessFieldValues(business.id, data.categoryId, data.fieldValues);

    // Apply design (selected or default)
    await applyThemePreset(business.id, {
      designId: data.designId,
      themePresetId: data.themePresetId,
      websiteType: data.websiteType,
      homeTemplate: data.homeTemplate,
      themeColors: data.themeColors,
      fashionOne: data.fashionOne,
    });

    // Create default pages
    await createDefaultPages(business.id, business.name, business.description, business.websiteType || undefined);

    // Update user account type based on business type
    const derivedAccountType = data.businessType === 'INDIVIDUAL' ? 'PROFESSIONAL' : 'COMPANY';
    await prisma.user.update({
      where: { id: session.user.id },
      data: { accountType: derivedAccountType },
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.issues);
      return NextResponse.json(
        { 
          error: 'بيانات غير صالحة', 
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          }))
        },
        { status: 400 }
      );
    }
    console.error('POST /api/businesses/apply error:', error);
    return NextResponse.json({ error: 'فشل في تقديم الطلب' }, { status: 500 });
  }
}

interface ApplyThemeOptions {
  designId?: string;
  themePresetId?: string;
  websiteType?: 'INTRO' | 'STORE';
  homeTemplate?: HomeTemplateId;
  themeColors?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
  };
  fashionOne?: {
    fontHeading?: string;
    fontBody?: string;
    heroHeadline?: string;
    heroImage?: string;
    socialLinks?: { facebook?: string; instagram?: string; tiktok?: string; pinterest?: string; youtube?: string };
  };
}

async function applyThemePreset(
  businessId: string,
  options: ApplyThemeOptions = {}
) {
  const { designId, themePresetId, websiteType = 'INTRO', homeTemplate, themeColors, fashionOne } = options;

  // Resolve design → preset + homeTemplate
  let effectivePresetId = themePresetId;
  let effectiveHomeTemplate = homeTemplate;

  if (designId) {
    const design = getDesignById(designId);
    if (design) {
      effectivePresetId = resolvePresetId(design);
      effectiveHomeTemplate = resolveHomeTemplate(design, websiteType);
    }
  }

  if (!designId && !effectivePresetId) {
    effectivePresetId = 'default';
  }

  const preset = getThemePresetById(effectivePresetId || 'default') || getThemePresetById('default');
  if (!preset) return;

  const isBeautySalonTemplate = ['beauty-salon-1'].includes(effectiveHomeTemplate || '');
  const isFashionOneTemplate = effectiveHomeTemplate === 'fashion-1';
  const baseSections = isFashionOneTemplate
    ? getFashionOneSections()
    : websiteType === 'STORE' && !isBeautySalonTemplate
    ? getStoreDefaultSections()
    : getDefaultSections();
  const sections = baseSections.map((section) => ({ ...section }));

  // Merge the apply-wizard collected fashion-1 fields on top of the seeded
  // section settings (only for fashion-1, and only when values were provided).
  if (isFashionOneTemplate && fashionOne) {
    const findSection = (id: string) => sections.find((s) => s.id === id);
    const filteredNonEmpty = (obj: Record<string, string | undefined>): Record<string, string> => {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.trim() !== '') out[key] = value;
      }
      return out;
    };

    const branding = findSection('branding');
    if (branding) {
      const settings = (branding.settings ?? {}) as Record<string, unknown>;
      if (fashionOne.fontHeading) settings.fontHeading = fashionOne.fontHeading;
      if (fashionOne.fontBody) settings.fontBody = fashionOne.fontBody;
      branding.settings = settings;
    }

    const hero = findSection('hero');
    if (hero) {
      const settings = (hero.settings ?? {}) as Record<string, unknown>;
      if (!Array.isArray(settings.slides)) settings.slides = [];
      const slides = settings.slides as Record<string, unknown>[];
      if (slides.length === 0) slides.push({});
      if (fashionOne.heroHeadline) slides[0].titleEm = fashionOne.heroHeadline;
      if (fashionOne.heroImage) slides[0].image = fashionOne.heroImage;
      hero.settings = settings;
    }

    const footer = findSection('footer');
    if (footer && fashionOne.socialLinks) {
      const settings = (footer.settings ?? {}) as Record<string, unknown>;
      const existingSocial = (settings.socialLinks ?? {}) as Record<string, unknown>;
      settings.socialLinks = { ...existingSocial, ...filteredNonEmpty(fashionOne.socialLinks) };
      footer.settings = settings;
    }
  }

  const colors = themeColors || {
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    accentColor: preset.accentColor,
    backgroundColor: preset.backgroundColor,
    surfaceColor: preset.surfaceColor,
    textColor: preset.textColor,
  };

  await prisma.businessTheme.upsert({
    where: { businessId },
    create: {
      businessId,
      designId: designId || null,
      presetId: preset.presetId,
      primaryColor: colors.primaryColor,
      secondaryColor: colors.secondaryColor,
      accentColor: colors.accentColor,
      backgroundColor: colors.backgroundColor,
      surfaceColor: colors.surfaceColor,
      textColor: colors.textColor,
      fontFamily: preset.fontFamily,
      borderRadius: preset.borderRadius,
      buttonStyle: preset.buttonStyle,
      heroLayout: preset.heroLayout,
      navbarStyle: preset.navbarStyle,
      homeTemplate: effectiveHomeTemplate || 'default',
      sections: JSON.stringify(sections) as any,
    },
    update: {
      designId: designId || null,
      presetId: preset.presetId,
      homeTemplate: effectiveHomeTemplate || 'default',
      primaryColor: colors.primaryColor,
      secondaryColor: colors.secondaryColor,
      accentColor: colors.accentColor,
      backgroundColor: colors.backgroundColor,
      surfaceColor: colors.surfaceColor,
      textColor: colors.textColor,
      fontFamily: preset.fontFamily,
      borderRadius: preset.borderRadius,
      buttonStyle: preset.buttonStyle,
      heroLayout: preset.heroLayout,
      navbarStyle: preset.navbarStyle,
      sections: JSON.stringify(sections) as any,
    },
  });
}

async function saveBusinessFieldValues(
  businessId: string,
  categoryId: string | undefined,
  fieldValues: Record<string, string | null | undefined> | undefined
) {
  if (!fieldValues || Object.keys(fieldValues).length === 0) return;

  const definitions = await prisma.dynamicFieldDefinition.findMany({
    where: {
      isActive: true,
      appliesTo: { in: ['BUSINESS', 'BOTH'] },
      OR: [
        { categoryId: categoryId || null },
        { categoryId: null },
      ],
    },
  });

  const validFieldIds = new Set(definitions.map((d) => d.id));

  await prisma.$transaction(
    Object.entries(fieldValues)
      .filter(([fieldId]) => validFieldIds.has(fieldId))
      .map(([fieldId, value]) =>
        prisma.businessFieldValue.upsert({
          where: { businessId_fieldId: { businessId, fieldId } },
          create: { businessId, fieldId, value: value || null },
          update: { value: value || null },
        })
      )
  );
}

async function createDefaultPages(
  businessId: string,
  name: string,
  description?: string | null,
  websiteType?: 'INTRO' | 'STORE'
) {
  const existing = await prisma.businessPage.count({ where: { businessId } });
  if (existing > 0) return;

  const basePages = [
    {
      businessId,
      slug: 'home',
      title: 'الرئيسية',
      pageTemplate: 'HOME' as const,
      isHomePage: true,
      isVisible: true,
      sortOrder: 0,
    },
    {
      businessId,
      slug: 'about',
      title: 'من نحن',
      pageTemplate: 'ABOUT' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 10,
      content: description
        ? `تعرف على ${name}. ${description}`
        : `تعرف على ${name}`,
    },
    {
      businessId,
      slug: 'contact',
      title: 'تواصل معنا',
      pageTemplate: 'CONTACT' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 20,
    },
    {
      businessId,
      slug: 'faq',
      title: 'الأسئلة الشائعة',
      pageTemplate: 'FAQ' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 30,
    },
    {
      businessId,
      slug: 'privacy',
      title: 'سياسة الخصوصية',
      pageTemplate: 'PRIVACY' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 40,
    },
    {
      businessId,
      slug: 'terms',
      title: 'الشروط والأحكام',
      pageTemplate: 'TERMS' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 50,
    },
  ];

  const storePages = websiteType === 'STORE' ? [
    {
      businessId,
      slug: 'shop',
      title: 'المتجر',
      pageTemplate: 'SHOP' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 5,
    },
    {
      businessId,
      slug: 'offers',
      title: 'العروض',
      pageTemplate: 'OFFERS' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 15,
    },
    {
      businessId,
      slug: 'cart',
      title: 'السلة',
      pageTemplate: 'CART' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 60,
    },
    {
      businessId,
      slug: 'wishlist',
      title: 'المفضلة',
      pageTemplate: 'WISHLIST' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 70,
    },
    {
      businessId,
      slug: 'account',
      title: 'حسابي',
      pageTemplate: 'ACCOUNT' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 80,
    },
    {
      businessId,
      slug: 'checkout',
      title: 'إتمام الطلب',
      pageTemplate: 'CHECKOUT' as const,
      isHomePage: false,
      isVisible: true,
      sortOrder: 90,
    },
  ] : [];

  await prisma.businessPage.createMany({
    data: [...basePages, ...storePages],
  });
}

async function syncBusinessSubcategories(
  businessId: string,
  subcategoryIds: string[],
  customSubcategories: string[]
) {
  await prisma.businessSubcategory.deleteMany({ where: { businessId } });

  const records: { businessId: string; subcategoryId: string; sortOrder: number }[] = [];
  const customRecords: { businessId: string; customName: string; sortOrder: number }[] = [];

  subcategoryIds.forEach((id, index) => {
    if (id) records.push({ businessId, subcategoryId: id, sortOrder: index });
  });

  customSubcategories.forEach((name, index) => {
    const trimmed = name.trim();
    if (trimmed) customRecords.push({ businessId, customName: trimmed, sortOrder: subcategoryIds.length + index });
  });

  if (records.length > 0) {
    await prisma.businessSubcategory.createMany({ data: records });
  }
  if (customRecords.length > 0) {
    await prisma.businessSubcategory.createMany({ data: customRecords });
  }
}
