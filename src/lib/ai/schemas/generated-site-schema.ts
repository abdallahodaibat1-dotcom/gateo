import { z } from "zod";

export const GeneratedBusinessSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(20),
  tagline: z.string().min(5),
  aboutSummary: z.string().min(20),
  vision: z.string().optional(),
  mission: z.string().optional(),
  values: z.array(z.string()).max(6).default([]),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

export const GeneratedThemeSchema = z.object({
  presetId: z.string().optional(),
  homeTemplate: z.string().default("default"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  surfaceColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.string().default("Cairo"),
  borderRadius: z.string().default("1rem"),
  buttonStyle: z.string().default("gradient"),
  heroLayout: z.string().default("center"),
  navbarStyle: z.string().default("fixed"),
});

export const GeneratedPageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  template: z.string().min(1),
  content: z.string().default(""),
  sections: z.array(z.record(z.string(), z.unknown())).optional(),
});

export const GeneratedServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  price: z.number().optional(),
  duration: z.string().optional(),
  imageRole: z.string().optional(),
});

export const GeneratedProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  quantity: z.number().int().min(0).optional(),
  imageRole: z.string().optional(),
});

export const GeneratedTeamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string().optional(),
});

export const GeneratedTestimonialSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  content: z.string(),
  rating: z.number().min(1).max(5).optional(),
});

export const GeneratedFaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const GeneratedStatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const GeneratedSeoSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(20),
});

export const GeneratedSiteSchema = z.object({
  business: GeneratedBusinessSchema,
  theme: GeneratedThemeSchema,
  pages: z.array(GeneratedPageSchema).min(1),
  services: z.array(GeneratedServiceSchema).max(12).default([]),
  products: z.array(GeneratedProductSchema).max(12).default([]),
  team: z.array(GeneratedTeamMemberSchema).max(8).default([]),
  testimonials: z.array(GeneratedTestimonialSchema).max(6).default([]),
  faq: z.array(GeneratedFaqSchema).max(10).default([]),
  stats: z.array(GeneratedStatSchema).max(6).default([]),
  features: z.array(z.object({ title: z.string(), description: z.string() })).max(8).default([]),
  seo: GeneratedSeoSchema,
  imageRoles: z.array(z.string()).default(["hero-main", "about-main", "service"]),
});

export type GeneratedSiteInput = z.input<typeof GeneratedSiteSchema>;
export type GeneratedSiteOutput = z.output<typeof GeneratedSiteSchema>;
