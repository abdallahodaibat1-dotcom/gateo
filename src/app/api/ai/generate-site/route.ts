import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { generateSite } from "@/lib/ai/generation/site-generator";
import { SiteGenerationInput } from "@/lib/ai/types";
import { BusinessAnalysisSchema } from "@/lib/ai/schemas/business-analysis-schema";

const visualIdentitySchema = z.object({
  logo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

const wizardDataSchema = z.object({
  businessName: z.string().min(2),
  logo: z.string().optional(),
  website: z.string().optional(),
  countryId: z.string(),
  city: z.string(),
  categoryId: z.string(),
  customCategory: z.string().optional(),
  description: z.string().min(10),
  audiences: z.array(z.string()),
  personality: z.string(),
  hasVisualIdentity: z.boolean(),
  visualIdentity: visualIdentitySchema.optional(),
  language: z.enum(["ar", "en"]).default("ar"),
  analysis: BusinessAnalysisSchema.optional(),
  selectedDesignId: z.string().optional(),
});

const generateSiteSchema = z.object({
  businessName: z.string().min(2).max(100),
  categoryId: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  language: z.string().default("ar"),
  description: z.string().max(1000).optional(),
  brandStyle: z.string().optional(),
  websiteType: z.enum(["INTRO", "STORE"]).default("INTRO"),
  referenceUrls: z.array(z.string().url()).max(5).default([]),
  userImages: z.array(z.string().url()).default([]),
  allowReferenceExtraction: z.boolean().default(false),
  allowAiImageGeneration: z.boolean().default(false),
  wizardData: wizardDataSchema.optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = generateSiteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Enforce AI image generation feature flag
    if (
      data.allowAiImageGeneration &&
      process.env.AI_IMAGE_GENERATION_ENABLED !== "true"
    ) {
      return NextResponse.json(
        { error: "AI image generation is not enabled" },
        { status: 403 }
      );
    }

    // Load category info if provided
    let categoryName: string | undefined;
    let categoryNameEn: string | undefined;

    const effectiveCategoryId = data.wizardData?.categoryId || data.categoryId;
    if (effectiveCategoryId && effectiveCategoryId !== "other") {
      const { prisma } = await import("@/lib/db");
      const category = await prisma.category.findUnique({
        where: { id: effectiveCategoryId },
        select: { name: true, nameEn: true },
      });
      categoryName = category?.name;
      categoryNameEn = category?.nameEn || undefined;
    }

    // Use wizard analysis to determine website type if available
    const websiteType =
      data.wizardData?.analysis?.websiteType || data.websiteType;

    const input: SiteGenerationInput = {
      businessName: data.wizardData?.businessName || data.businessName,
      categoryId: effectiveCategoryId,
      categoryName,
      categoryNameEn,
      city: data.wizardData?.city || data.city,
      country: data.country,
      language: data.wizardData?.language || data.language,
      description: data.wizardData?.description || data.description,
      brandStyle: data.wizardData?.personality || data.brandStyle,
      websiteType,
      referenceUrls: data.referenceUrls,
      userImages: data.userImages,
      allowReferenceExtraction: data.allowReferenceExtraction,
      allowAiImageGeneration: data.allowAiImageGeneration,
      wizardData: data.wizardData,
    };

    const result = await generateSite({
      userId: session.user.id,
      input,
    });

    return NextResponse.json({
      success: true,
      businessId: result.businessId,
      slug: result.slug,
      jobId: result.jobId,
      url: `/business/${result.slug}/home`,
      dashboardUrl: `/business-dashboard/website`,
      placedImages: result.placedImages.map((p) => ({
        role: p.role,
        url: p.image.url,
        source: p.image.source,
        altText: p.image.altText,
      })),
    });
  } catch (error) {
    console.error("AI generate site error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate site",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
