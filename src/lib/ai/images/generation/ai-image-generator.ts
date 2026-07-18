import { AiProvider, ImageRole } from "@/lib/ai/types";
import { getAiProvider } from "@/lib/ai/providers/ai-provider-factory";
import { generateFreeImage } from "@/lib/ai/images/generation/free-image-sources";
import { MockProvider } from "@/lib/ai/providers/mock-provider";

export interface GenerateImageInput {
  role: ImageRole;
  businessName: string;
  businessCategory: string;
  businessDescription?: string;
  city?: string;
  brandStyle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  language?: string;
}

/**
 * Generate a marketing image for a specific website section.
 *
 * Strategy (silent to the user):
 * 1. Try the configured AI provider (e.g. OpenAI DALL·E).
 * 2. If that fails, returns a mock SVG, or image generation is disabled,
 *    fall back to free providers in the background (Pollinations → Picsum → Unsplash API).
 */
export async function generateAiImage(
  input: GenerateImageInput,
  provider?: AiProvider
): Promise<{ url: string; revisedPrompt?: string; freeSource?: string }> {
  const ai = provider ?? getAiProvider();
  const prompt = buildImagePrompt(input);
  const size = input.role === "hero-main" ? "1792x1024" : "1024x1024";

  const imageGenerationEnabled = process.env.AI_IMAGE_GENERATION_ENABLED !== "false";

  // 1. Try the configured AI provider if image generation is enabled and the
  //    provider is not the local mock provider.
  if (imageGenerationEnabled && !(ai instanceof MockProvider)) {
    try {
      const result = await ai.generateImage({
        prompt,
        size,
        quality: "standard",
      });

      // Reject obvious mock SVG placeholders so real image fallbacks kick in.
      if (result.url && !result.url.startsWith("data:image/svg+xml")) {
        return { url: result.url, revisedPrompt: result.revisedPrompt };
      }
    } catch (error) {
      console.warn("AI image generation failed, trying free image sources:", error);
    }
  }

  // 2. Fallback to free image sources in the background.
  const [width, height] = parseSize(size);
  const seed = stableHash(prompt);

  const freeResult = await generateFreeImage({
    prompt,
    width,
    height,
    seed,
  });

  // Lorem Picsum returns completely random stock photos that ignore the
  // business category. Prefer a curated local fallback instead.
  if (freeResult.source === "picsum") {
    throw new Error("Picsum fallback is too generic; using curated local images instead.");
  }

  return {
    url: freeResult.url,
    revisedPrompt: freeResult.revisedPrompt,
    freeSource: freeResult.source,
  };
}

function buildImagePrompt(input: GenerateImageInput): string {
  const {
    role,
    businessName,
    businessCategory,
    businessDescription,
    city,
    brandStyle,
    primaryColor,
    secondaryColor,
    language,
  } = input;

  const isArabic = language === "ar";

  const roleDescriptions: Record<ImageRole, string> = {
    "hero-main": "wide hero banner image for the homepage",
    "about-main": "interior or team photo for the about page",
    "about-team": "professional team members working",
    service: `professional photo representing a ${businessCategory} service`,
    product: `clean product photo on neutral background for ${businessCategory}`,
    gallery: `portfolio photo showing ${businessCategory} work`,
    branch: `exterior or interior photo of a ${businessCategory} location`,
    team: `professional portrait of staff members`,
    cover: `wide cover banner image`,
    logo: "minimal brand mark icon",
    other: `marketing photo for ${businessCategory}`,
  };

  const styleDescription = brandStyle
    ? `${brandStyle} style`
    : "modern, clean, professional style";

  const colorHint =
    primaryColor || secondaryColor
      ? `Color palette includes ${[primaryColor, secondaryColor].filter(Boolean).join(" and ")}.`
      : "";

  const locationHint = city ? `Location: ${city}.` : "";

  const base = `Professional marketing photo for ${businessName}, a ${businessCategory} business. ${roleDescriptions[role] || ""}. ${styleDescription}. ${colorHint} ${locationHint}`;

  const context = businessDescription
    ? `Context: ${businessDescription.slice(0, 300)}.`
    : "";

  const restrictions =
    "No text, no logos, no watermarks, no brand names, no people faces if possible, high quality, photorealistic, suitable for a business website.";

  const languageHint = isArabic
    ? "The scene should feel appropriate for an Arabic-speaking region."
    : "";

  return `${base} ${context} ${languageHint} ${restrictions}`
    .trim()
    .replace(/\s+/g, " ");
}

function parseSize(size?: string): [number, number] {
  if (typeof size !== "string") return [1024, 1024];
  const [w, h] = size.toLowerCase().split("x").map(Number);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return [w, h];
  }
  return [1024, 1024];
}

function stableHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
