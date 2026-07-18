import * as cheerio from "cheerio";
import { ExtractedImageCandidate } from "@/lib/ai/types";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MIN_IMAGE_SIZE = 300; // minimum width/height in pixels (if available)

/**
 * Extract image candidates from a reference URL.
 * Respects robots.txt is not implemented here; caller should ensure permission.
 */
export async function extractImagesFromReferenceUrl(
  url: string,
  options: { maxImages?: number; minSize?: number } = {}
): Promise<ExtractedImageCandidate[]> {
  const { maxImages = 20, minSize = MIN_IMAGE_SIZE } = options;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "GateoBot/1.0 (website analysis; reference image extraction)",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reference URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const baseUrl = new URL(url).origin;
  const pageUrl = new URL(url);

  const $ = cheerio.load(html);
  const imageMap = new Map<string, ExtractedImageCandidate>();

  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src");
    if (!src) return;

    const absoluteUrl = resolveUrl(src, baseUrl, pageUrl);
    if (!absoluteUrl || !isAllowedImageUrl(absoluteUrl)) return;
    if (imageMap.has(absoluteUrl)) return;

    const width = parseInt($(el).attr("width") || "", 10) || undefined;
    const height = parseInt($(el).attr("height") || "", 10) || undefined;
    const alt = $(el).attr("alt") || undefined;

    if (width && width < minSize) return;
    if (height && height < minSize) return;

    imageMap.set(absoluteUrl, {
      url: absoluteUrl,
      width,
      height,
      alt,
    });
  });

  // Also look for Open Graph / Twitter images (often higher quality)
  $("meta[property='og:image'], meta[name='twitter:image']").each((_, el) => {
    const content = $(el).attr("content");
    if (!content) return;
    const absoluteUrl = resolveUrl(content, baseUrl, pageUrl);
    if (!absoluteUrl || !isAllowedImageUrl(absoluteUrl)) return;
    if (imageMap.has(absoluteUrl)) return;

    imageMap.set(absoluteUrl, {
      url: absoluteUrl,
      alt: $("meta[property='og:image:alt']").attr("content") || undefined,
    });
  });

  return Array.from(imageMap.values()).slice(0, maxImages);
}

function resolveUrl(src: string, baseUrl: string, pageUrl: URL): string | null {
  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }
    if (src.startsWith("//")) {
      return `${pageUrl.protocol}${src}`;
    }
    if (src.startsWith("/")) {
      return `${baseUrl}${src}`;
    }
    return new URL(src, pageUrl.href).href;
  } catch {
    return null;
  }
}

function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

    const pathname = parsed.pathname.toLowerCase();
    const ext = pathname.split(".").pop()?.split("?")[0];

    const knownImageHosts = [
      "placehold.co",
      "via.placeholder.com",
      "picsum.photos",
      "images.unsplash.com",
      "cdn.pixabay.com",
      "image.pollinations.ai",
    ];
    const isKnownImageHost = knownImageHosts.some((host) =>
      parsed.hostname.toLowerCase().endsWith(host)
    );

    if (!isKnownImageHost && (!ext || !ALLOWED_EXTENSIONS.has(ext))) return false;

    // Skip common tracker/avatar placeholders
    const skipPatterns = [
      "data:image",
      "gravatar",
      "google-analytics",
      "facebook.com/tr",
      "tracking",
      "pixel",
      "beacon",
    ];
    if (skipPatterns.some((p) => url.toLowerCase().includes(p))) return false;

    return true;
  } catch {
    return false;
  }
}

export async function extractImagesFromMultipleUrls(
  urls: string[],
  options?: { maxImages?: number; minSize?: number }
): Promise<ExtractedImageCandidate[]> {
  const results = await Promise.allSettled(
    urls.map((url) => extractImagesFromReferenceUrl(url, options))
  );

  const candidates: ExtractedImageCandidate[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      candidates.push(...result.value);
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return candidates.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}
