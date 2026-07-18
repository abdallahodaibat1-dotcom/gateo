import { z } from 'zod';

export const BusinessAnalysisSchema = z.object({
  businessType: z.string().describe('نوع النشاط المقترح بالعربية'),
  websiteType: z.enum(['INTRO', 'STORE']).describe('نوع الموقع المناسب'),
  pageCount: z.number().int().min(3).max(15).describe('عدد الصفحات المقترح'),
  designStyle: z.string().describe('نمط التصميم بالعربية'),
  suggestedPages: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        reason: z.string(),
      })
    )
    .describe('الصفحات المقترحة مع سبب كل صفحة'),
  homeSections: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        reason: z.string(),
      })
    )
    .describe('أقسام الصفحة الرئيسية المقترحة'),
  colors: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    surfaceColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    reasoning: z.string(),
  }),
  fontFamily: z.string().describe('الخط المقترح'),
  imageStyle: z.string().describe('أسلوب الصور المقترح'),
  suggestedServices: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number().optional(),
      })
    )
    .max(8)
    .default([]),
  suggestedProducts: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number().optional(),
      })
    )
    .max(8)
    .default([]),
  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .max(6)
    .default([]),
  seoKeywords: z.array(z.string()).max(10).default([]),
  tagline: z.string().describe('العنوان الرئيسي المقترح'),
  aboutSummary: z.string().describe('نبذة مقترحة عن النشاط'),
  reasoning: z.string().describe('ملخص سبب هذه الاقتراحات'),
});

export type BusinessAnalysisOutput = z.infer<typeof BusinessAnalysisSchema>;
