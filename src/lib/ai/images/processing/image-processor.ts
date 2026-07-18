import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { ImageAnalysisResult } from "@/lib/ai/types";
import { analyzeImage } from "@/lib/ai/images/analysis/image-analyzer";

export interface ProcessedImage {
  url: string;
  altText: string;
  title: string;
  fileName: string;
  width: number;
  height: number;
  variants: Array<{ width: number; url: string }>;
}

export interface ProcessImageOptions {
  businessName: string;
  businessCategory: string;
  role: string;
  source: "REFERENCE" | "AI_GENERATED";
  altText?: string;
  title?: string;
  index?: number;
  maxWidth?: number;
  quality?: number;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const VARIANT_WIDTHS = [1920, 1200, 768, 480];

/**
 * Download an image, optimize it, create responsive variants, and save locally.
 */
export async function processRemoteImage(
  remoteUrl: string,
  options: ProcessImageOptions
): Promise<ProcessedImage> {
  // 1. Download
  const response = await fetch(remoteUrl, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return processImageBuffer(buffer, options);
}

export async function processImageBuffer(
  buffer: Buffer,
  options: ProcessImageOptions
): Promise<ProcessedImage> {
  const { businessName, businessCategory, role, source, index = 0 } = options;

  // 2. Analyze and get metadata
  const metadata = await sharp(buffer).metadata();
  const originalWidth = metadata.width || 1200;
  const originalHeight = metadata.height || 800;

  // 3. Generate alt text if missing
  let altText = options.altText || "";
  if (!altText) {
    // For AI generated images we can generate alt from prompt later.
    // For reference images, attempt a basic alt.
    altText = `${businessName} - ${businessCategory} - ${translateRole(role)}`;
  }

  const title = options.title || altText;

  // 4. Build SEO-friendly filename
  const subDir = source === "AI_GENERATED" ? "ai-generated" : "extracted";
  const baseFileName = buildSeoFileName({
    businessName,
    businessCategory,
    role,
    index,
    source,
  });

  const dir = path.join(UPLOAD_DIR, subDir);
  await fs.mkdir(dir, { recursive: true });

  // 5. Process main image (resize + compress + webp)
  const maxWidth = options.maxWidth || 1920;
  const quality = options.quality || 80;
  const targetWidth = Math.min(originalWidth, maxWidth);

  const mainFileName = `${baseFileName}.webp`;
  const mainPath = path.join(dir, mainFileName);

  const processed = sharp(buffer)
    .resize(targetWidth, undefined, { withoutEnlargement: true })
    .webp({ quality, effort: 4 });

  await processed.toFile(mainPath);

  // 6. Generate responsive variants
  const variants: Array<{ width: number; url: string }> = [];
  for (const width of VARIANT_WIDTHS.filter((w) => w <= targetWidth)) {
    const variantFileName = `${baseFileName}-${width}w.webp`;
    const variantPath = path.join(dir, variantFileName);

    await sharp(buffer)
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality: width <= 768 ? 75 : 80, effort: 4 })
      .toFile(variantPath);

    variants.push({
      width,
      url: `/uploads/${subDir}/${variantFileName}`,
    });
  }

  // 7. Get final dimensions of main image
  const finalMetadata = await sharp(mainPath).metadata();

  return {
    url: `/uploads/${subDir}/${mainFileName}`,
    altText: altText.slice(0, 200),
    title: title.slice(0, 200),
    fileName: mainFileName,
    width: finalMetadata.width || targetWidth,
    height: finalMetadata.height || Math.round((originalHeight / originalWidth) * targetWidth),
    variants,
  };
}

/**
 * Analyze a remote image and optionally generate alt text via AI vision.
 */
export async function analyzeAndDescribeImage(
  imageUrl: string,
  context: {
    businessName: string;
    businessCategory: string;
    brandColors?: string[];
  }
): Promise<ImageAnalysisResult> {
  return analyzeImage({
    imageUrl,
    businessName: context.businessName,
    businessCategory: context.businessCategory,
    brandColors: context.brandColors,
  });
}

function buildSeoFileName(input: {
  businessName: string;
  businessCategory: string;
  role: string;
  index: number;
  source: string;
}): string {
  const { businessName, businessCategory, role, index, source } = input;

  // Create an English SEO slug from available info
  const parts = [
    slugify(businessName || "business"),
    slugify(businessCategory || "service"),
    translateRole(role),
    source.toLowerCase(),
  ];

  const base = parts.filter(Boolean).join("-");
  const unique = randomBytes(4).toString("hex");
  return index > 0 ? `${base}-${index}-${unique}` : `${base}-${unique}`;
}

function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50)
    .replace(/-+$/, "");
}

function translateRole(role: string): string {
  const map: Record<string, string> = {
    "hero-main": "hero",
    "about-main": "about",
    "about-team": "team",
    service: "service",
    product: "product",
    gallery: "gallery",
    branch: "branch",
    team: "team",
    cover: "cover",
    logo: "logo",
    other: "image",
  };
  return map[role] || "image";
}

/**
 * Delete a processed image and its variants from disk.
 */
export async function deleteProcessedImage(publicUrl: string): Promise<void> {
  const filePath = path.join(process.cwd(), "public", publicUrl);
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore if file doesn't exist
  }

  // Try to delete variants by pattern
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  for (const width of VARIANT_WIDTHS) {
    try {
      await fs.unlink(`${base}-${width}w${ext}`);
    } catch {
      // ignore
    }
  }
}
