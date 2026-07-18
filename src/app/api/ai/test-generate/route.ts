import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generateSite } from "@/lib/ai/generation/site-generator";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * TEMPORARY test endpoint for AI site generation.
 * Creates a test user if needed and generates a sample site.
 * Remove or protect this before production.
 */
export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
    }

    // Create a fresh test user for every run because the Business model
    // enforces one business per user (`userId @unique`).
    const testEmail = `ai-test-${crypto.randomUUID()}@gateo.local`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "AI Test User",
        password: await bcrypt.hash("test-password-123", 10),
        emailVerified: new Date(),
        role: "USER",
        accountType: "USER",
      },
    });

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const result = await generateSite({
      userId: user.id,
      input: {
        businessName: typeof body.businessName === "string" ? body.businessName : "عيادة الابتسامة",
        categoryName: typeof body.categoryName === "string" ? body.categoryName : "عيادات أسنان",
        categoryNameEn: typeof body.categoryNameEn === "string" ? body.categoryNameEn : "dental-clinics",
        city: typeof body.city === "string" ? body.city : "الرياض",
        language: typeof body.language === "string" ? body.language : "ar",
        description:
          typeof body.description === "string"
            ? body.description
            : "عيادة أسنان متخصصة في التقويم وتبييض الأسنان",
        brandStyle: typeof body.brandStyle === "string" ? body.brandStyle : "professional",
        websiteType:
          typeof body.websiteType === "string" && ["INTRO", "STORE"].includes(body.websiteType)
            ? (body.websiteType as "INTRO" | "STORE")
            : "INTRO",
        referenceUrls: Array.isArray(body.referenceUrls)
          ? body.referenceUrls.filter((u): u is string => typeof u === "string")
          : ["http://localhost:8000/test-ref-images.html"],
        userImages: [],
        allowReferenceExtraction: body.allowReferenceExtraction !== false,
        allowAiImageGeneration: body.allowAiImageGeneration !== false,
      },
    });

    return NextResponse.json({
      success: true,
      businessId: result.businessId,
      slug: result.slug,
      url: `/business/${result.slug}/home`,
      images: result.placedImages.map((p) => ({
        role: p.role,
        url: p.image.url,
        source: p.image.source,
      })),
    });
  } catch (error) {
    console.error("Test generate error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
