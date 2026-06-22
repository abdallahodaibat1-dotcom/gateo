/**
 * Utilities for parsing location URLs (e.g. Google Maps links) into coordinates.
 */

export interface ParsedCoordinates {
  lat: number;
  lng: number;
}

/**
 * Try to extract lat,lng from a Google Maps URL or similar map link.
 * Returns null if no coordinates can be parsed.
 */
export function parseMapUrl(url: string): ParsedCoordinates | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. query=lat,lng or q=lat,lng
  const queryMatch = trimmed.match(/[?&](query|q)=(-?\d+\.?\d*)%2C(-?\d+\.?\d*)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[2]);
    const lng = parseFloat(queryMatch[3]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 2. @lat,lng or !3dlat!4dlng in path
  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Old Google Maps format: !3dLAT!4dLNG
  const oldMatch = trimmed.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (oldMatch) {
    const lat = parseFloat(oldMatch[1]);
    const lng = parseFloat(oldMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 4. Plain text "lat,lng"
  const plainMatch = trimmed.match(/^\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*$/);
  if (plainMatch) {
    const lat = parseFloat(plainMatch[1]);
    const lng = parseFloat(plainMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Build a Google Maps link from coordinates.
 */
export function buildMapUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
