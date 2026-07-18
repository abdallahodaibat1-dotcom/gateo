import { prisma } from "@/lib/db";
import { getAiProvider } from "@/lib/ai/providers/ai-provider-factory";
import {
  SiteGenerationInput,
  ImageSource,
  PlacedImage,
  ImageAnalysisResult,
  GeneratedSiteContent,
  ImageRole,
} from "@/lib/ai/types";
import { buildSiteGenerationPrompt } from "@/lib/ai/prompts/site-generation-prompt";
import {
  GeneratedSiteSchema,
  GeneratedSiteOutput,
} from "@/lib/ai/schemas/generated-site-schema";
import { extractImagesFromMultipleUrls } from "@/lib/ai/images/sources/reference-image-extractor";
import { analyzeImage } from "@/lib/ai/images/analysis/image-analyzer";
import { generateAiImage } from "@/lib/ai/images/generation/ai-image-generator";
import { processRemoteImage } from "@/lib/ai/images/processing/image-processor";
import {
  placeImages,
  getRequiredImageRoles,
  toRoleImageMap,
} from "@/lib/ai/images/placement/image-placer";
import { generateThemeForBusiness } from "@/lib/business-template-generator";
import { getDesignById } from "@/lib/business-design-library";

export interface GenerateSiteOptions {
  userId: string;
  input: SiteGenerationInput;
}

export interface GenerateSiteResult {
  businessId: string;
  slug: string;
  generatedContent: GeneratedSiteOutput;
  placedImages: PlacedImage[];
  jobId: string;
}

/**
 * Main orchestrator: generate business content, collect and place images,
 * and persist everything to the database.
 */
export async function generateSite(
  options: GenerateSiteOptions
): Promise<GenerateSiteResult> {
  const { userId, input } = options;
  const ai = getAiProvider();

  // Gateo enforces one business per user, so AI generation is only for new accounts.
  const existingBusiness = await prisma.business.findUnique({
    where: { userId },
  });
  if (existingBusiness) {
    throw new Error(
      "User already has a business. AI site generation is only available before creating a business."
    );
  }

  // 1. Create generation job record
  const job = await prisma.aiGenerationJob.create({
    data: {
      businessId: "pending",
      userId,
      type: "FULL_SITE",
      provider: ai.name,
      model: process.env.AI_DEFAULT_TEXT_MODEL || "gpt-4o-mini",
      prompt: buildSiteGenerationPrompt(input),
      status: "RUNNING",
      metadata: JSON.stringify({
        referenceUrls: input.referenceUrls || [],
        allowReferenceExtraction: input.allowReferenceExtraction,
        allowAiImageGeneration: input.allowAiImageGeneration,
        wizardData: input.wizardData
          ? {
              businessName: input.wizardData.businessName,
              categoryId: input.wizardData.categoryId,
              selectedDesignId: input.wizardData.selectedDesignId,
            }
          : undefined,
      }),
    },
  });

  try {
    // 2. Generate text content via LLM
    const promptResult = await ai.completeText({
      messages: [
        { role: "system", content: buildSiteGenerationPrompt(input) },
        {
          role: "user",
          content: `Generate the complete website JSON for "${input.businessName}" in ${input.city || "this city"}.`,
        },
      ],
      jsonMode: true,
      maxTokens: 5000,
    });

    let rawContent: unknown;
    try {
      rawContent = JSON.parse(promptResult.content);
    } catch {
      throw new Error("AI returned invalid JSON content");
    }

    // Defensive normalization: ensure required business fields have fallbacks
    if (rawContent && typeof rawContent === "object" && "business" in rawContent) {
      const businessObj = (rawContent as any).business;
      const businessNameFallback = businessObj?.name || input.businessName;
      if (!businessObj.aboutSummary || typeof businessObj.aboutSummary !== "string") {
        businessObj.aboutSummary = `${businessNameFallback} وجهة موثوقة تقدم خدمات متميزة بأعلى معايير الجودة والاحترافية.`;
      }
      if (!businessObj.tagline || typeof businessObj.tagline !== "string") {
        businessObj.tagline = "جودة تليق بك";
      }
      if (!businessObj.vision || typeof businessObj.vision !== "string") {
        businessObj.vision = `أن نكون الخيار الأول في ${businessNameFallback} لتقديم الخدمات المتميزة.`;
      }
      if (!businessObj.mission || typeof businessObj.mission !== "string") {
        businessObj.mission = `تقديم حلول مبتكرة وعالية الجودة تعزز نجاح عملائنا وتجاوز توقعاتهم.`;
      }
      if (!Array.isArray(businessObj.values) || businessObj.values.length === 0) {
        businessObj.values = ["الجودة", "الاحترافية", "الشفافية", "رضا العميل"];
      }
      if (!businessObj.city || typeof businessObj.city !== "string") {
        businessObj.city = input.city || "الرياض";
      }
    }

    const validatedContent = GeneratedSiteSchema.parse(rawContent);

    // 3. Merge theme with analysis, selected design, and fallback
    const mergedTheme = await mergeWithFallbackTheme(input, validatedContent);

    // 4. Create Business record
    const slug = await generateUniqueSlug(input.businessName);
    const business = await prisma.business.create({
      data: {
        userId,
        name: validatedContent.business.name,
        slug,
        description: validatedContent.business.description,
        city: validatedContent.business.city || input.city,
        address: validatedContent.business.address,
        categoryId: input.categoryId,
        websiteType: input.websiteType,
        status: "PENDING",
        phone: validatedContent.business.phone,
        email: validatedContent.business.email,
        website: undefined,
        logo: input.wizardData?.logo || undefined,
        countryId: input.wizardData?.countryId || undefined,
      },
    });

    // 5. Update job with business id
    await prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        businessId: business.id,
        output: JSON.stringify(validatedContent),
        tokensUsed: promptResult.usage?.totalTokens,
        status: "COMPLETED",
      },
    });

    // 6. Create theme
    await prisma.businessTheme.create({
      data: {
        businessId: business.id,
        presetId: mergedTheme.presetId,
        designId: input.wizardData?.selectedDesignId,
        primaryColor: mergedTheme.primaryColor,
        secondaryColor: mergedTheme.secondaryColor,
        accentColor: mergedTheme.accentColor,
        backgroundColor: mergedTheme.backgroundColor,
        surfaceColor: mergedTheme.surfaceColor,
        textColor: mergedTheme.textColor,
        fontFamily: mergedTheme.fontFamily,
        borderRadius: mergedTheme.borderRadius,
        buttonStyle: mergedTheme.buttonStyle,
        heroLayout: mergedTheme.heroLayout,
        navbarStyle: mergedTheme.navbarStyle,
        homeTemplate: mergedTheme.homeTemplate,
        sections: JSON.stringify(buildRichSections(validatedContent)),
      },
    });

    // 7. Create pages
    for (let i = 0; i < validatedContent.pages.length; i++) {
      const page = validatedContent.pages[i];
      await prisma.businessPage.create({
        data: {
          businessId: business.id,
          slug: page.slug,
          title: page.title,
          pageTemplate: normalizePageTemplate(page.template) as any,
          content: page.content,
          sections: page.sections ? JSON.stringify(page.sections) : null,
          sortOrder: i,
          isVisible: true,
          isHomePage: page.slug === "home",
        },
      });
    }

    // 8. Create services/products
    const createdServiceIds: string[] = [];
    for (const service of validatedContent.services) {
      const created = await prisma.service.create({
        data: {
          businessId: business.id,
          name: service.name,
          description: service.description,
          price: service.price ?? 0,
          duration: parseDurationToMinutes(service.duration),
          isActive: true,
        },
      });
      createdServiceIds.push(created.id);
    }

    for (const product of validatedContent.products) {
      await prisma.product.create({
        data: {
          businessId: business.id,
          name: product.name,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          quantity: product.quantity ?? 0,
          status: "ACTIVE",
        },
      });
    }

    // 9. Collect and process images
    const placedImages = await collectAndProcessImages({
      business,
      input,
      validatedContent,
      mergedTheme,
    });

    // 10. Save assets and attach to services/products
    await saveBusinessAssets(business.id, placedImages, createdServiceIds);

    return {
      businessId: business.id,
      slug: business.slug,
      generatedContent: validatedContent as GeneratedSiteContent,
      placedImages,
      jobId: job.id,
    };
  } catch (error) {
    await prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

async function mergeWithFallbackTheme(
  input: SiteGenerationInput,
  aiContent: GeneratedSiteOutput
): Promise<GeneratedSiteOutput["theme"]> {
  const analysis = input.wizardData?.analysis;
  const selectedDesign = input.wizardData?.selectedDesignId
    ? getDesignById(input.wizardData.selectedDesignId)
    : undefined;

  // Start with AI-provided theme or analysis colors
  const base = aiContent.theme || {};

  // If analysis has colors, prefer them unless user provided visual identity
  const analysisColors = analysis
    ? {
        primaryColor: analysis.colors.primaryColor,
        secondaryColor: analysis.colors.secondaryColor,
        accentColor: analysis.colors.accentColor,
        backgroundColor: analysis.colors.backgroundColor,
        surfaceColor: analysis.colors.surfaceColor,
        textColor: analysis.colors.textColor,
      }
    : undefined;

  const userColors = input.wizardData?.hasVisualIdentity
    ? {
        primaryColor: input.wizardData.visualIdentity?.primaryColor,
        secondaryColor: input.wizardData.visualIdentity?.secondaryColor,
        accentColor: input.wizardData.visualIdentity?.accentColor,
      }
    : undefined;

  const fallback = generateThemeForBusiness(
    {
      id: "temp",
      name: input.businessName,
      description: input.description,
      category: input.categoryName
        ? { slug: input.categoryNameEn || input.categoryName, name: input.categoryName }
        : null,
    },
    input.websiteType
  );

  const theme = {
    presetId:
      selectedDesign?.presetId || base.presetId || fallback.theme.presetId,
    homeTemplate:
      selectedDesign?.homeTemplate || base.homeTemplate || fallback.theme.homeTemplate,
    primaryColor:
      userColors?.primaryColor || base.primaryColor || analysisColors?.primaryColor || fallback.theme.primaryColor,
    secondaryColor:
      userColors?.secondaryColor || base.secondaryColor || analysisColors?.secondaryColor || fallback.theme.secondaryColor,
    accentColor:
      userColors?.accentColor || base.accentColor || analysisColors?.accentColor || fallback.theme.accentColor,
    backgroundColor:
      base.backgroundColor || analysisColors?.backgroundColor || fallback.theme.backgroundColor,
    surfaceColor:
      base.surfaceColor || analysisColors?.surfaceColor || fallback.theme.surfaceColor,
    textColor:
      base.textColor || analysisColors?.textColor || fallback.theme.textColor,
    fontFamily:
      input.wizardData?.visualIdentity?.fontFamily ||
      analysis?.fontFamily ||
      base.fontFamily ||
      fallback.theme.fontFamily,
    borderRadius: base.borderRadius || fallback.theme.borderRadius,
    buttonStyle: base.buttonStyle || fallback.theme.buttonStyle,
    heroLayout: base.heroLayout || fallback.theme.heroLayout,
    navbarStyle: base.navbarStyle || fallback.theme.navbarStyle,
  };

  return theme;
}

function normalizePageTemplate(template: string): string {
  const upper = template.toUpperCase();
  const valid = [
    "HOME",
    "ABOUT",
    "SERVICES",
    "PRODUCTS",
    "CONTACT",
    "FAQ",
    "TERMS",
    "PRIVACY",
    "SHOP",
    "OFFERS",
    "CART",
    "WISHLIST",
    "ACCOUNT",
    "CHECKOUT",
    "CUSTOM",
  ];
  if (valid.includes(upper)) return upper;
  return "CUSTOM";
}

function buildRichSections(content: GeneratedSiteOutput): unknown[] {
  return [
    {
      id: "hero",
      type: "hero",
      enabled: true,
      order: 1,
      settings: {
        title: content.business.tagline,
        subtitle: content.business.description.slice(0, 200),
      },
    },
    {
      id: "about",
      type: "about",
      enabled: true,
      order: 2,
      settings: {
        content: content.pages.find((p) => p.slug === "about")?.content || "",
        summary: content.business.aboutSummary,
        vision: content.business.vision,
        mission: content.business.mission,
        values: content.business.values,
      },
    },
    {
      id: "services",
      type: "services",
      enabled: content.services.length > 0,
      order: 3,
      settings: {},
    },
    {
      id: "products",
      type: "products",
      enabled: content.products.length > 0,
      order: 4,
      settings: {},
    },
    {
      id: "features",
      type: "custom",
      enabled: content.features.length > 0,
      order: 5,
      settings: {
        title: "لماذا نحن",
        features: content.features,
      },
    },
    {
      id: "stats",
      type: "custom",
      enabled: content.stats.length > 0,
      order: 6,
      settings: {
        title: "إحصائيات",
        stats: content.stats,
      },
    },
    {
      id: "testimonials",
      type: "reviews",
      enabled: content.testimonials.length > 0,
      order: 7,
      settings: {
        testimonials: content.testimonials,
      },
    },
    {
      id: "team",
      type: "custom",
      enabled: content.team.length > 0,
      order: 8,
      settings: {
        title: "فريق العمل",
        team: content.team,
      },
    },
    {
      id: "faq",
      type: "faq",
      enabled: content.faq.length > 0,
      order: 9,
      settings: {
        faq: content.faq,
      },
    },
    {
      id: "cta",
      type: "cta",
      enabled: true,
      order: 10,
      settings: {
        title: `ابدأ مع ${content.business.name}`,
        subtitle: content.business.tagline,
      },
    },
  ];
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = transliterateArabic(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50)
    .replace(/-+$/, "");

  const slugBase = base || "business";
  let slug = slugBase;
  let counter = 1;

  while (await prisma.business.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${counter}`;
    counter++;
  }

  return slug;
}

function transliterateArabic(text: string): string {
  const map: Record<string, string> = {
    ا: "a",
    أ: "a",
    إ: "i",
    آ: "a",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "th",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ي: "y",
    ة: "a",
    ى: "a",
    ئ: "y",
    ؤ: "w",
    لا: "la",
  };

  return text
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

async function collectAndProcessImages(options: {
  business: { id: string; name: string };
  input: SiteGenerationInput;
  validatedContent: GeneratedSiteOutput;
  mergedTheme: GeneratedSiteOutput["theme"];
}): Promise<PlacedImage[]> {
  const { business, input, validatedContent, mergedTheme } = options;

  const analyses = new Map<string, ImageAnalysisResult>();
  const userImages: ImageSource[] = [];
  const referenceImages: ImageSource[] = [];
  const aiImages: ImageSource[] = [];

  // 1. User images
  if (input.userImages) {
    for (const url of input.userImages) {
      userImages.push({ source: "USER", url });
    }
  }

  // 1b. Wizard logo - normalize relative URLs to absolute
  if (input.wizardData?.logo) {
    const logoUrl = input.wizardData.logo.startsWith("http")
      ? input.wizardData.logo
      : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${input.wizardData.logo}`;
    userImages.push({ source: "USER", url: logoUrl, altText: `${business.name} logo` });
  }

  // 2. Reference images
  if (input.allowReferenceExtraction && input.referenceUrls?.length) {
    try {
      const candidates = await extractImagesFromMultipleUrls(input.referenceUrls, {
        maxImages: 15,
        minSize: 300,
      });

      for (const candidate of candidates) {
        referenceImages.push({
          source: "REFERENCE",
          url: candidate.url,
          sourceUrl: candidate.url,
          altText: candidate.alt,
        });
      }
    } catch (error) {
      console.error("Reference image extraction failed:", error);
    }
  }

  // 3. Analyze all collected images
  const allCollected = [...userImages, ...referenceImages];
  for (const img of allCollected) {
    try {
      const analysis = await analyzeImage({
        imageUrl: img.url,
        businessName: business.name,
        businessCategory: input.categoryName || "business",
        brandColors: [
          mergedTheme.primaryColor,
          mergedTheme.secondaryColor,
        ].filter(Boolean) as string[],
      });
      analyses.set(img.url, analysis);
    } catch (error) {
      console.error("Image analysis failed:", error);
    }
  }

  // 4. Determine required roles
  const requiredRoles = getRequiredImageRoles(
    input.websiteType,
    validatedContent.services.length > 0,
    validatedContent.products.length > 0,
    true
  );

  // 5. Place user/reference images first (AI is a fallback)
  let placed = placeImages({
    userImages,
    referenceImages,
    aiImages: [],
    requiredRoles,
    analyses,
  });

  // 6. Process placed user/reference images and track successfully filled roles
  const processedPlaced: PlacedImage[] = [];
  const filledRoles = new Set<ImageRole>();

  for (const item of placed) {
    if (item.image.source === "AI_GENERATED") continue;

    try {
      const processed = await processRemoteImage(item.image.url, {
        businessName: business.name,
        businessCategory: input.categoryName || "business",
        role: item.role,
        source: "REFERENCE",
        altText: item.image.altText || analyses.get(item.image.url)?.suggestedAltText,
      });

      processedPlaced.push({
        role: item.role,
        sectionId: item.sectionId,
        image: {
          ...item.image,
          url: processed.url,
          altText: processed.altText,
          title: processed.title,
          metadata: {
            ...item.image.metadata,
            variants: processed.variants,
            width: processed.width,
            height: processed.height,
            analysis: analyses.get(item.image.url),
          },
        },
      });
      filledRoles.add(item.role);
    } catch (error) {
      console.error("Failed to process placed image:", error);
    }
  }

  // 7. Generate AI images for any still-missing roles
  if (input.allowAiImageGeneration) {
    const missingRoles = requiredRoles.filter((r) => !filledRoles.has(r));

    for (const role of missingRoles) {
      try {
        const generated = await generateAiImage({
          role,
          businessName: business.name,
          businessCategory: input.categoryName || "business",
          businessDescription: input.description,
          city: input.city,
          brandStyle: input.brandStyle,
          primaryColor: mergedTheme.primaryColor,
          secondaryColor: mergedTheme.secondaryColor,
          language: input.language,
        });

        const processed = await processRemoteImage(generated.url, {
          businessName: business.name,
          businessCategory: input.categoryName || "business",
          role,
          source: "AI_GENERATED",
          altText: generated.revisedPrompt
            ? `${business.name} - ${generated.revisedPrompt.slice(0, 150)}`
            : `${business.name} - ${role}`,
        });

        processedPlaced.push({
          role,
          image: {
            source: "AI_GENERATED",
            url: processed.url,
            altText: processed.altText,
            title: processed.title,
            metadata: {
              generatedPrompt: generated.revisedPrompt,
              freeSource: generated.freeSource,
              variants: processed.variants,
              width: processed.width,
              height: processed.height,
            },
          },
        });
        filledRoles.add(role);
      } catch (error) {
        console.error(`AI image generation failed for role ${role}:`, error);
      }
    }
  }

  // 8. Use local fallback images for any role that is still empty
  const fallbackImages: Record<ImageRole, string> = {
    "hero-main": getFallbackImageUrl("hero-main", input.categoryName),
    cover: getFallbackImageUrl("cover", input.categoryName),
    "about-main": getFallbackImageUrl("about-main", input.categoryName),
    "about-team": getFallbackImageUrl("about-team", input.categoryName),
    service: getFallbackImageUrl("service", input.categoryName),
    product: getFallbackImageUrl("product", input.categoryName),
    gallery: getFallbackImageUrl("gallery", input.categoryName),
    branch: getFallbackImageUrl("branch", input.categoryName),
    team: getFallbackImageUrl("team", input.categoryName),
    logo: "",
    other: getFallbackImageUrl("other", input.categoryName),
  };

  const stillMissingRoles = requiredRoles.filter((r) => !filledRoles.has(r) && fallbackImages[r]);
  for (const role of stillMissingRoles) {
    try {
      const processed = await processRemoteImage(fallbackImages[role], {
        businessName: business.name,
        businessCategory: input.categoryName || "business",
        role,
        source: "REFERENCE",
        altText: `${business.name} - ${role}`,
      });

      processedPlaced.push({
        role,
        image: {
          source: "REFERENCE",
          url: processed.url,
          altText: processed.altText,
          title: processed.title,
          metadata: {
            variants: processed.variants,
            width: processed.width,
            height: processed.height,
          },
        },
      });
      filledRoles.add(role);
    } catch (error) {
      console.error(`Fallback image failed for role ${role}:`, error);
    }
  }

  return processedPlaced;
}

function getFallbackImageUrl(role: ImageRole, category?: string | null): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const normalized = (category || "").toLowerCase();
  const isBeauty =
    normalized.includes("جمال") ||
    normalized.includes("عناية") ||
    normalized.includes("صالون") ||
    normalized.includes("شعر") ||
    normalized.includes("تجميل") ||
    normalized.includes("سبا");

  if (isBeauty) {
    const map: Record<ImageRole, string> = {
      "hero-main": "/templates/beauty-salon/hero-hair.jpg",
      cover: "/templates/beauty-salon/hero-hair.jpg",
      "about-main": "/templates/beauty-salon/salon-interior.jpg",
      "about-team": "/templates/beauty-salon/spa-1.jpg",
      service: "/templates/beauty-salon/skincare-1.jpg",
      product: "/templates/beauty-salon/makeup-products.jpg",
      gallery: "/templates/beauty-salon/nails-1.jpg",
      branch: "/templates/beauty-salon/bridal.jpg",
      team: "/templates/beauty-salon/hair-coloring.jpg",
      logo: "",
      other: "/templates/beauty-salon/spa-2.jpg",
    };
    return `${base}${map[role]}`;
  }

  const map: Record<ImageRole, string> = {
    "hero-main": "/templates/modern-intro/hero.jpg",
    cover: "/templates/modern-intro/hero.jpg",
    "about-main": "/templates/modern-intro/about.jpg",
    "about-team": "/templates/modern-intro/gallery-1.jpg",
    service: "/templates/modern-intro/gallery-2.jpg",
    product: "/templates/modern-intro/gallery-3.jpg",
    gallery: "/templates/modern-intro/gallery-4.jpg",
    branch: "/templates/modern-intro/gallery-5.jpg",
    team: "/templates/modern-intro/gallery-6.jpg",
    logo: "",
    other: "/templates/modern-intro/hero.jpg",
  };
  return `${base}${map[role]}`;
}

async function saveBusinessAssets(
  businessId: string,
  placedImages: PlacedImage[],
  serviceIds: string[]
) {
  const roleMap = toRoleImageMap(placedImages);

  // Save logo
  const logo = roleMap.get("logo");
  if (logo) {
    await prisma.businessAsset.create({
      data: {
        businessId,
        type: "LOGO",
        url: logo.image.url,
        source: logo.image.source,
        sourceUrl: logo.image.sourceUrl,
        altText: logo.image.altText,
        title: logo.image.title,
        role: logo.role,
        metadata: JSON.stringify(logo.image.metadata || {}),
        isPrimary: true,
      },
    });
  }

  // Save hero as cover
  const hero = roleMap.get("hero-main");
  if (hero) {
    await prisma.businessAsset.create({
      data: {
        businessId,
        type: "COVER",
        url: hero.image.url,
        source: hero.image.source,
        sourceUrl: hero.image.sourceUrl,
        altText: hero.image.altText,
        title: hero.image.title,
        role: hero.role,
        metadata: JSON.stringify(hero.image.metadata || {}),
        isPrimary: true,
      },
    });
  }

  // Save about image
  const about = roleMap.get("about-main");
  if (about) {
    await prisma.businessAsset.create({
      data: {
        businessId,
        type: "ABOUT",
        url: about.image.url,
        source: about.image.source,
        sourceUrl: about.image.sourceUrl,
        altText: about.image.altText,
        title: about.image.title,
        role: about.role,
        metadata: JSON.stringify(about.image.metadata || {}),
      },
    });
  }

  // Save team images
  const teamImages = placedImages.filter((p) => p.role === "team");
  for (const item of teamImages) {
    await prisma.businessAsset.create({
      data: {
        businessId,
        type: "TEAM",
        url: item.image.url,
        source: item.image.source,
        sourceUrl: item.image.sourceUrl,
        altText: item.image.altText,
        title: item.image.title,
        role: item.role,
        metadata: JSON.stringify(item.image.metadata || {}),
      },
    });
  }

  // Assign service images
  const serviceImages = placedImages.filter((p) => p.role === "service");
  for (let i = 0; i < serviceIds.length && i < serviceImages.length; i++) {
    await prisma.service.update({
      where: { id: serviceIds[i] },
      data: { image: serviceImages[i].image.url },
    });
  }

  // Save remaining as gallery
  const galleryImages = placedImages.filter(
    (p) =>
      !["hero-main", "about-main", "service", "team", "logo"].includes(p.role) &&
      p.role !== "product"
  );
  for (const item of galleryImages) {
    await prisma.businessAsset.create({
      data: {
        businessId,
        type: item.role.toUpperCase() as any,
        url: item.image.url,
        source: item.image.source,
        sourceUrl: item.image.sourceUrl,
        altText: item.image.altText,
        title: item.image.title,
        role: item.role,
        metadata: JSON.stringify(item.image.metadata || {}),
      },
    });
  }
}

function parseDurationToMinutes(duration: string | undefined): number | undefined {
  if (!duration) return undefined;

  const arabicNumbers: Record<string, number> = {
    "ربع": 15,
    "نصف": 30,
    "ثلاثة أرباع": 45,
    "ساعة": 60,
    "ساعتين": 120,
  };

  const normalized = duration.toLowerCase().trim();

  for (const [word, minutes] of Object.entries(arabicNumbers)) {
    if (normalized.includes(word)) return minutes;
  }

  const match = normalized.match(/(\d+)/);
  if (match) {
    const value = parseInt(match[1], 10);
    if (normalized.includes("ساعة") || normalized.includes("ساعات") || normalized.includes("hour")) {
      return value * 60;
    }
    return value;
  }

  return undefined;
}
