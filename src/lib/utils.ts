import { clsx, type ClassValue } from 'clsx';
import { formatCurrency } from '@/lib/finance/exchange';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return formatCurrency(amount, currency);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/** Returns a CSS gradient string using theme CSS variables. */
export function themeGradient(
  direction: string = '135deg',
  from: string = 'var(--theme-primary, #7c3aed)',
  to: string = 'var(--theme-secondary, #ec4899)'
): string {
  return `linear-gradient(${direction}, ${from}, ${to})`;
}

/** Returns a readable overlay color for text over an image. */
export function imageOverlay(opacity: number = 0.5): string {
  return `linear-gradient(to top, rgba(0,0,0,${opacity + 0.25}), rgba(0,0,0,${opacity}))`;
}

/** Format a URL-friendly slug or ID fallback. */
export function businessSlug(business: { slug?: string | null; id: string }): string {
  return business.slug || business.id;
}

const ARABIC_DAYS: Record<string, string> = {
  saturday: 'السبت',
  sunday: 'الأحد',
  monday: 'الإثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
};

/** Convert English day name to Arabic. */
export function arabicDayName(day: string): string {
  return ARABIC_DAYS[day.toLowerCase()] || day;
}
