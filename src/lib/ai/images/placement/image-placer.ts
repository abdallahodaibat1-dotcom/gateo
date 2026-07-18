import {
  ImageSource,
  ImageRole,
  ImageAnalysisResult,
  PlacedImage,
} from "@/lib/ai/types";
import { isDuplicateImage } from "@/lib/ai/images/analysis/image-analyzer";

export interface ImagePlacementInput {
  userImages: ImageSource[];
  referenceImages: ImageSource[];
  aiImages: ImageSource[];
  requiredRoles: ImageRole[];
  analyses: Map<string, ImageAnalysisResult>;
}

const ROLE_PRIORITY: Record<ImageRole, number> = {
  "hero-main": 10,
  "cover": 9,
  "about-main": 8,
  "team": 7,
  "about-team": 7,
  "service": 6,
  "product": 6,
  "gallery": 5,
  "branch": 4,
  "logo": 3,
  "other": 1,
};

/**
 * Distribute available images across the required website roles.
 * Priority order: USER > REFERENCE > AI_GENERATED.
 */
export function placeImages(input: ImagePlacementInput): PlacedImage[] {
  const { userImages, referenceImages, aiImages, requiredRoles, analyses } = input;
  const placed: PlacedImage[] = [];
  const usedUrls = new Set<string>();

  // Sort required roles by priority
  const sortedRoles = [...requiredRoles].sort((a, b) => ROLE_PRIORITY[b] - ROLE_PRIORITY[a]);

  for (const role of sortedRoles) {
    // Try user images first
    let selected = pickBestImageForRole(role, userImages, analyses, usedUrls);

    // Then reference images
    if (!selected) {
      selected = pickBestImageForRole(role, referenceImages, analyses, usedUrls);
    }

    // Finally AI generated images
    if (!selected) {
      selected = pickBestImageForRole(role, aiImages, analyses, usedUrls);
    }

    if (selected) {
      usedUrls.add(selected.url);
      placed.push({
        role,
        image: {
          ...selected,
          analysis: analyses.get(selected.url),
        },
      });
    }
  }

  return placed;
}

function pickBestImageForRole(
  role: ImageRole,
  images: ImageSource[],
  analyses: Map<string, ImageAnalysisResult>,
  usedUrls: Set<string>
): ImageSource | null {
  const candidates = images.filter((img) => {
    if (usedUrls.has(img.url)) return false;
    const analysis = analyses.get(img.url);
    if (!analysis) return true; // Include unanalyzed images with lower confidence
    if (analysis.hasWatermark) return false;
    if (analysis.suggestedRole === role || analysis.suggestedRole === "other") return true;
    return false;
  });

  if (candidates.length === 0) return null;

  // Score candidates: exact role match + quality + relevance
  const scored = candidates.map((img) => {
    const analysis = analyses.get(img.url);
    let score = 0;

    if (img.source === "USER") score += 20; // Strong preference for user images
    if (img.source === "REFERENCE") score += 10;

    if (analysis) {
      if (analysis.suggestedRole === role) score += 15;
      score += analysis.qualityScore * 10;
      score += analysis.relevanceScore * 10;
      if (analysis.hasWatermark) score -= 50;
    }

    // Prefer images that already have alt text
    if (img.altText) score += 2;

    return { img, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].img;
}

/**
 * Determine which image roles are needed for a generated site.
 */
export function getRequiredImageRoles(
  websiteType: "INTRO" | "STORE",
  hasServices: boolean,
  hasProducts: boolean,
  hasGallery: boolean
): ImageRole[] {
  const roles: ImageRole[] = ["hero-main", "about-main"];

  if (hasServices) roles.push("service");
  if (hasProducts) roles.push("product");
  if (hasGallery) roles.push("gallery");

  roles.push("team");

  return roles;
}

/**
 * Convert placed images into a map keyed by role for easy access.
 */
export function toRoleImageMap(placed: PlacedImage[]): Map<ImageRole, PlacedImage> {
  const map = new Map<ImageRole, PlacedImage>();
  for (const item of placed) {
    if (!map.has(item.role)) {
      map.set(item.role, item);
    }
  }
  return map;
}
