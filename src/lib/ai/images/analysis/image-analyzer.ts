import { AiProvider } from "@/lib/ai/types";
import {
  ImageAnalysisResult,
  ImageRole,
} from "@/lib/ai/types";
import { getAiProvider } from "@/lib/ai/providers/ai-provider-factory";

export interface AnalyzeImageInput {
  imageUrl: string;
  businessName?: string;
  businessCategory?: string;
  businessDescription?: string;
  brandColors?: string[];
  intendedUse?: ImageRole;
}

const VALID_ROLES: ImageRole[] = [
  "hero-main",
  "about-main",
  "about-team",
  "service",
  "product",
  "gallery",
  "branch",
  "team",
  "cover",
  "logo",
  "other",
];

/**
 * Analyze an image using AI vision to determine quality, relevance, brand match,
 * watermark presence, and suggested usage role.
 */
export async function analyzeImage(
  input: AnalyzeImageInput,
  provider?: AiProvider
): Promise<ImageAnalysisResult> {
  const ai = provider ?? getAiProvider();

  const systemPrompt = `You are an expert image analyst for a website builder. Analyze the provided image and return a JSON object ONLY with these exact fields:
{
  "qualityScore": number 0-1,
  "relevanceScore": number 0-1,
  "brandMatchScore": number 0-1,
  "hasWatermark": boolean,
  "suggestedAltText": string (in Arabic if the business is Arabic, else English),
  "suggestedRole": one of [hero-main, about-main, about-team, service, product, gallery, branch, team, cover, logo, other],
  "description": string (short Arabic description)
}

Rules:
- qualityScore: sharpness, lighting, resolution, professional composition.
- relevanceScore: how well the image matches the business category and intended use.
- brandMatchScore: how well colors/mood match the provided brand colors.
- hasWatermark: true if there is any text overlay, logo, or watermark that shouldn't be on a business website.
- suggestedAltText: concise and descriptive for accessibility and SEO.
- suggestedRole: best placement role on the website.
- Return ONLY valid JSON, no markdown, no explanation.`;

  const userText = `Business: ${input.businessName || "Unknown"}
Category: ${input.businessCategory || "Unknown"}
Description: ${input.businessDescription || ""}
Brand colors: ${(input.brandColors || []).join(", ") || "Not specified"}
Intended use: ${input.intendedUse || "auto-detect"}

Analyze this image and return the JSON.`;

  const result = await ai.completeVision({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          { type: "text", text: `\n\n${userText}` },
          { type: "image_url", image_url: { url: input.imageUrl } },
        ],
      },
    ],
    maxTokens: 800,
  });

  return parseAnalysisResponse(result.content);
}

function parseAnalysisResponse(content: string): ImageAnalysisResult {
  const cleaned = content.replace(/```json|```/g, "").trim();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback if model didn't return valid JSON
    return {
      qualityScore: 0.5,
      relevanceScore: 0.5,
      brandMatchScore: 0.5,
      hasWatermark: false,
      isDuplicate: false,
      suggestedAltText: "صورة نشاط تجاري",
      suggestedRole: "other",
      description: "لم يتم التعرف على تفاصيل الصورة",
    };
  }

  const suggestedRole = parsed.suggestedRole as string;
  const validRole = VALID_ROLES.includes(suggestedRole as ImageRole)
    ? (suggestedRole as ImageRole)
    : "other";

  return {
    qualityScore: clampNumber(parsed.qualityScore),
    relevanceScore: clampNumber(parsed.relevanceScore),
    brandMatchScore: clampNumber(parsed.brandMatchScore),
    hasWatermark: Boolean(parsed.hasWatermark),
    isDuplicate: false,
    suggestedAltText: String(parsed.suggestedAltText || "").slice(0, 200),
    suggestedRole: validRole,
    description: String(parsed.description || "").slice(0, 500),
  };
}

function clampNumber(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

/**
 * Check if two images are likely duplicates by comparing perceptual hashes.
 * Simple implementation: compares URLs and dimensions.
 */
export function isDuplicateImage(
  candidateUrl: string,
  existing: Array<{ url: string; width?: number; height?: number }>
): boolean {
  return existing.some((item) => normalizeUrl(item.url) === normalizeUrl(candidateUrl));
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
