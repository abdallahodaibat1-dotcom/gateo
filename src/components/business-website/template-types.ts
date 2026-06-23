export interface TemplateBusinessPage {
  id: string;
  slug: string;
  title: string;
  isHomePage: boolean;
}

export interface TemplateProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  quantity?: number;
  images?: { url: string; alt?: string }[] | null;
  category?: string | null;
  rating?: number;
  reviewCount?: number;
  createdAt?: string | Date;
}

export interface TemplatePost {
  id: string;
  title: string;
  content?: string | null;
  image?: string | null;
  createdAt: string;
}

export interface TemplateReview {
  id: string;
  rating: number;
  comment?: string | null;
  user?: { name?: string | null; avatar?: string | null } | null;
  createdAt: string;
}

export interface TemplateBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  cover?: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address?: string | null;
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null;
  avgRating: number;
  reviewCount: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
    buttonStyle: string;
    homeTemplate?: string;
  } | null;
  pages: TemplateBusinessPage[];
  products?: TemplateProduct[];
  posts?: TemplatePost[];
  reviews?: TemplateReview[];
}

export function formatWorkingHours(
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null
): string | null {
  if (!workingHours) return null;
  let parsed: any = workingHours;
  if (typeof workingHours === 'string') {
    try {
      parsed = JSON.parse(workingHours);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed)) return null;
  const days = parsed.filter((item: any) => item.open && item.close);
  if (days.length === 0) return null;
  return days.map((item: any) => `${item.day}: ${item.open} - ${item.close}`).join(' | ');
}
