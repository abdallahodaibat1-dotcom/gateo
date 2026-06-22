export interface ExtractedThemeColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToRgb({ h, s, l }: { h: number; s: number; l: number }): RGB {
  h /= 360;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

function adjustLightness(hex: string, targetL: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0.05, Math.min(0.95, targetL));
  return rgbToHex(hslToRgb(hsl));
}

function adjustHue(hex: string, delta: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + delta + 360) % 360;
  return rgbToHex(hslToRgb(hsl));
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

function isNearWhite(rgb: RGB): boolean {
  return rgb.r > 240 && rgb.g > 240 && rgb.b > 240;
}

function isNearBlack(rgb: RGB): boolean {
  return rgb.r < 20 && rgb.g < 20 && rgb.b < 20;
}

function isGrayish(rgb: RGB): boolean {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return max - min < 25;
}

function kMeans(colors: RGB[], k: number, maxIterations = 20): { centers: RGB[]; counts: number[] } {
  if (colors.length === 0) return { centers: [], counts: [] };
  if (colors.length <= k) {
    return { centers: colors, counts: colors.map(() => 1) };
  }

  // Initialize centers by picking diverse colors
  const centers: RGB[] = [colors[0]];
  while (centers.length < k) {
    let farthest = colors[0];
    let maxDist = -1;
    for (const c of colors) {
      const minDistToCenter = Math.min(...centers.map((center) => colorDistance(c, center)));
      if (minDistToCenter > maxDist) {
        maxDist = minDistToCenter;
        farthest = c;
      }
    }
    centers.push(farthest);
  }

  for (let i = 0; i < maxIterations; i++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => []);
    for (const c of colors) {
      let bestIndex = 0;
      let bestDist = Infinity;
      for (let j = 0; j < k; j++) {
        const d = colorDistance(c, centers[j]);
        if (d < bestDist) {
          bestDist = d;
          bestIndex = j;
        }
      }
      clusters[bestIndex].push(c);
    }

    let changed = false;
    for (let j = 0; j < k; j++) {
      if (clusters[j].length === 0) continue;
      const newCenter: RGB = {
        r: clusters[j].reduce((sum, c) => sum + c.r, 0) / clusters[j].length,
        g: clusters[j].reduce((sum, c) => sum + c.g, 0) / clusters[j].length,
        b: clusters[j].reduce((sum, c) => sum + c.b, 0) / clusters[j].length,
      };
      if (colorDistance(newCenter, centers[j]) > 1) changed = true;
      centers[j] = newCenter;
    }

    if (!changed) break;
  }

  const counts = centers.map((center, idx) => {
    return colors.filter((c) => {
      const dists = centers.map((cc) => colorDistance(c, cc));
      return dists.indexOf(Math.min(...dists)) === idx;
    }).length;
  });

  return { centers, counts };
}

/**
 * Extract dominant theme colors from an image URL using the browser Canvas API.
 * Falls back to a default palette if extraction fails or CORS blocks the image.
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedThemeColors> {
  const defaultColors: ExtractedThemeColors = {
    primaryColor: '#7c3aed',
    secondaryColor: '#ec4899',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#1a1a2e',
  };

  if (typeof window === 'undefined') return defaultColors;

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return defaultColors;

    const size = 64;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);

    const imageData = ctx.getImageData(0, 0, size, size);
    const pixels: RGB[] = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const a = imageData.data[i + 3];
      if (a < 128) continue;
      const rgb = { r, g, b };
      if (isNearWhite(rgb) || isNearBlack(rgb) || isGrayish(rgb)) continue;
      pixels.push(rgb);
    }

    if (pixels.length === 0) return defaultColors;

    const { centers, counts } = kMeans(pixels, 3);
    const sorted = centers
      .map((color, index) => ({ color, count: counts[index] }))
      .sort((a, b) => b.count - a.count)
      .map((item) => item.color);

    if (sorted.length === 0) return defaultColors;

    const primary = rgbToHex(sorted[0]);
    const secondary = sorted[1] ? rgbToHex(sorted[1]) : adjustHue(primary, 30);
    const accentRaw = sorted[2] || adjustHue(primary, -30);
    const accent = rgbToHex(accentRaw);

    // Ensure enough contrast for background and text
    const primaryHsl = rgbToHsl(hexToRgb(primary));
    const isDarkTheme = primaryHsl.l < 0.35;

    const backgroundColor = isDarkTheme ? '#0f172a' : '#ffffff';
    const surfaceColor = isDarkTheme ? '#1e293b' : '#ffffff';
    const textColor = isDarkTheme ? '#f8fafc' : '#1a1a2e';

    return {
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      backgroundColor,
      surfaceColor,
      textColor,
    };
  } catch (error) {
    console.error('Color extraction failed:', error);
    return defaultColors;
  }
}

/**
 * Lighten a color for use as a subtle background tint.
 */
export function lightenColor(hex: string, amount = 0.92): string {
  return adjustLightness(hex, amount);
}

/**
 * Darken a color for text or hover states.
 */
export function darkenColor(hex: string, amount = 0.2): string {
  return adjustLightness(hex, amount);
}
