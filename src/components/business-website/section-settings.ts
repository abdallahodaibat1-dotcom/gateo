import type { TemplateBusiness } from './template-types';

export interface ThemeSection {
  id: string;
  type?: string;
  title?: string;
  enabled: boolean;
  order: number;
  settings?: Record<string, unknown>;
}

/** All sections stored on the business theme (may be empty). */
export function getSections(business: TemplateBusiness): ThemeSection[] {
  return (business.theme?.sections as ThemeSection[] | undefined) || [];
}

/** Whether a section is enabled. Missing section defaults to enabled. */
export function isSectionEnabled(business: TemplateBusiness, id: string): boolean {
  const section = getSections(business).find((s) => s.id === id);
  return section ? section.enabled : true;
}

/** Free-form settings object for a section (empty object when absent). */
export function getSectionSettings(
  business: TemplateBusiness,
  id: string
): Record<string, unknown> {
  const section = getSections(business).find((s) => s.id === id);
  return (section?.settings as Record<string, unknown>) || {};
}

/** Read a single setting, falling back when it is undefined/null/empty. */
export function getSetting<T>(
  settings: Record<string, unknown>,
  key: string,
  fallback: T
): T {
  const value = settings[key];
  return value !== undefined && value !== null && value !== '' ? (value as T) : fallback;
}
