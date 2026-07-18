/**
 * Free image source providers used as silent fallbacks when paid AI image
 * generation is unavailable or fails. These sources work without API keys
 * (Unsplash API is optional) and are chosen transparently in the background.
 */

export interface FreeImageResult {
  url: string;
  revisedPrompt?: string;
  source: "pollinations" | "picsum" | "unsplash" | "unsplash-api";
}

export interface FreeImageOptions {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
}

const DEFAULT_TIMEOUT = 30000;

/**
 * Try free image sources in order of quality:
 * 1. Pollinations.ai (AI-generated, prompt-aware, no API key)
 * 2. Lorem Picsum (random stock photo, no API key)
 * 3. Unsplash API if an access key is configured
 *
 * The first successful result is returned. Errors are swallowed so callers
 * can fall back further without interrupting the user flow.
 */
export async function generateFreeImage(
  options: FreeImageOptions
): Promise<FreeImageResult> {
  const errors: string[] = [];

  try {
    return await generatePollinationsImage(options);
  } catch (error) {
    errors.push(`pollinations: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    return await generatePicsumImage(options);
  } catch (error) {
    errors.push(`picsum: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      return await generateUnsplashApiImage(options);
    } catch (error) {
      errors.push(`unsplash-api: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`All free image sources failed: ${errors.join("; ")}`);
}

/**
 * Pollinations.ai generates images from a text prompt without an API key.
 * Docs: https://pollinations.ai
 */
export async function generatePollinationsImage(
  options: FreeImageOptions
): Promise<FreeImageResult> {
  const { prompt, width = 1024, height = 1024, seed = 42 } = options;

  const cappedWidth = Math.min(width, 1920);
  const cappedHeight = Math.min(height, 1920);

  const params = new URLSearchParams({
    width: String(cappedWidth),
    height: String(cappedHeight),
    seed: String(seed),
    nologo: "true",
    enhance: "true",
  });

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Pollinations returned ${response.status}`);
  }

  const finalUrl = response.url || url;

  return {
    url: finalUrl,
    revisedPrompt: prompt,
    source: "pollinations",
  };
}

/**
 * Lorem Picsum returns a random stock photo. It ignores the prompt but
 * provides a reliable, fast fallback when AI generation is unavailable.
 */
export async function generatePicsumImage(
  options: FreeImageOptions
): Promise<FreeImageResult> {
  const { prompt, width = 1024, height = 1024, seed = 42 } = options;

  const url = `https://picsum.photos/${width}/${height}?random=${seed}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Picsum returned ${response.status}`);
  }

  const finalUrl = response.url;
  if (!finalUrl) {
    throw new Error("Picsum did not return an image URL");
  }

  return {
    url: finalUrl,
    revisedPrompt: `Free stock photo fallback for: ${prompt.slice(0, 200)}`,
    source: "picsum",
  };
}

/**
 * Unsplash API random photo. Requires an UNSPLASH_ACCESS_KEY environment
 * variable. Orientation is derived from width/height.
 */
export async function generateUnsplashApiImage(
  options: FreeImageOptions
): Promise<FreeImageResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not configured");
  }

  const { prompt, width = 1024, height = 1024 } = options;

  const orientation = width > height ? "landscape" : width < height ? "portrait" : "squarish";
  const keywords = prompt
    .replace(/no text|no logos|no watermarks|no brand names/gi, "")
    .split(/[,.]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(",");

  const params = new URLSearchParams({
    query: keywords || "business",
    orientation,
    client_id: accessKey,
  });

  const apiUrl = `https://api.unsplash.com/photos/random?${params.toString()}`;

  const response = await fetch(apiUrl, {
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`Unsplash API returned ${response.status}`);
  }

  const data = (await response.json()) as {
    urls?: { regular?: string; raw?: string };
    alt_description?: string | null;
    description?: string | null;
  };

  const imageUrl = data.urls?.regular || data.urls?.raw;
  if (!imageUrl) {
    throw new Error("Unsplash API did not return an image URL");
  }

  return {
    url: imageUrl,
    revisedPrompt: data.description || data.alt_description || prompt,
    source: "unsplash-api",
  };
}
