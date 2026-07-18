import { SiteGenerationInput } from "@/lib/ai/types";

export function buildSiteGenerationPrompt(input: SiteGenerationInput): string {
  const {
    businessName,
    categoryName,
    categoryNameEn,
    city,
    country,
    language,
    description,
    brandStyle,
    websiteType,
    wizardData,
  } = input;

  const isArabic = language === "ar";
  const langInstruction = isArabic
    ? "All generated text must be in Modern Standard Arabic (Fusha), marketing-friendly, clear, and concise."
    : `All generated text must be in ${language}.`;

  const analysis = wizardData?.analysis;

  const analysisBlock = analysis
    ? `
AI ANALYSIS RECOMMENDATIONS (use these as the primary guide):
- Business type: ${analysis.businessType}
- Website type: ${analysis.websiteType}
- Design style: ${analysis.designStyle}
- Suggested pages: ${analysis.suggestedPages.map((p: { title: string; slug: string }) => `${p.title} (${p.slug})`).join(", ")}
- Home sections: ${analysis.homeSections.map((s: { title: string }) => s.title).join(", ")}
- Proposed colors: primary=${analysis.colors.primaryColor}, secondary=${analysis.colors.secondaryColor}, accent=${analysis.colors.accentColor}
- Proposed font: ${analysis.fontFamily}
- Proposed image style: ${analysis.imageStyle}
- Proposed tagline: ${analysis.tagline}
- About summary: ${analysis.aboutSummary}
- Proposed services: ${analysis.suggestedServices.map((s: { name: string }) => s.name).join(", ")}
- Proposed features: ${analysis.features.map((f: { title: string }) => f.title).join(", ")}
`
    : "";

  const userIdentityBlock = wizardData?.hasVisualIdentity
    ? `
USER VISUAL IDENTITY:
- Logo: ${wizardData.visualIdentity?.logo || "none"}
- Primary color: ${wizardData.visualIdentity?.primaryColor || "auto"}
- Secondary color: ${wizardData.visualIdentity?.secondaryColor || "auto"}
- Accent color: ${wizardData.visualIdentity?.accentColor || "auto"}
- Font: ${wizardData.visualIdentity?.fontFamily || "Cairo"}
`
    : "";

  const audienceLabels = wizardData?.audiences
    ?.map((a) => {
      const map: Record<string, string> = {
        individuals: "أفراد",
        companies: "شركات",
        government: "جهات حكومية",
        students: "طلاب",
        women: "سيدات",
        men: "رجال",
        children: "أطفال",
        everyone: "الجميع",
      };
      return map[a] || a;
    })
    .join(", ");

  return `You are an expert website builder and copywriter for small businesses. Generate a complete website structure based on the following business information.

${langInstruction}

BUSINESS INFORMATION:
- Business name: ${businessName}
- Category: ${categoryName || "Not specified"} (${categoryNameEn || ""})
- City/Region: ${city || "Not specified"}${country ? `, ${country}` : ""}
- Website type: ${websiteType} (INTRO = service/info site, STORE = e-commerce site)
- Brand style: ${brandStyle || "modern and professional"}
- Short description: ${description || "Not provided"}
${wizardData ? `- Target audience: ${audienceLabels || "Not specified"}` : ""}
${wizardData ? `- Design personality: ${wizardData.personality}` : ""}

${analysisBlock}
${userIdentityBlock}

REQUIREMENTS:
1. Generate compelling, original marketing copy.
2. Do NOT use placeholder text like "Lorem ipsum".
3. Keep content realistic and suitable for the business category.
4. For services/products, generate 3-8 realistic items with prices in SAR when possible.
5. Generate SEO-friendly title and meta description.
6. Include rich content: hero tagline, about summary, vision, mission, 3-6 values, 3-6 features, 3-6 stats, 3-6 testimonials, 4-8 FAQ items.
7. For team page, generate 3-6 realistic team members.
8. Generate these pages: home, about, services (or products for STORE), portfolio (for service businesses), gallery, team, partners, blog, faq, contact, privacy, terms.
9. If visual identity colors are provided, use them. Otherwise use the AI analysis colors or choose colors matching the brand style.
10. Default fontFamily should be "Cairo" for Arabic businesses unless another font is specified.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this exact structure:

{
  "business": {
    "name": "string",
    "description": "string (80-150 words)",
    "tagline": "string (short catchy phrase)",
    "aboutSummary": "string (50-100 words)",
    "vision": "string",
    "mission": "string",
    "values": ["string"],
    "city": "string",
    "phone": "string (realistic local format)",
    "email": "string",
    "address": "string"
  },
  "theme": {
    "presetId": "string (optional)",
    "homeTemplate": "default",
    "primaryColor": "#RRGGBB",
    "secondaryColor": "#RRGGBB",
    "accentColor": "#RRGGBB",
    "backgroundColor": "#RRGGBB",
    "surfaceColor": "#RRGGBB",
    "textColor": "#RRGGBB",
    "fontFamily": "Cairo",
    "borderRadius": "1rem",
    "buttonStyle": "gradient",
    "heroLayout": "center",
    "navbarStyle": "fixed"
  },
  "pages": [
    {
      "slug": "home",
      "title": "string",
      "template": "HOME",
      "content": "string"
    },
    {
      "slug": "about",
      "title": "string",
      "template": "ABOUT",
      "content": "string"
    },
    {
      "slug": "services" | "products",
      "title": "string",
      "template": "CUSTOM",
      "content": "string"
    },
    {
      "slug": "portfolio",
      "title": "string",
      "template": "CUSTOM",
      "content": "string"
    },
    {
      "slug": "team",
      "title": "string",
      "template": "CUSTOM",
      "content": "string"
    },
    {
      "slug": "blog",
      "title": "string",
      "template": "CUSTOM",
      "content": "string"
    },
    {
      "slug": "faq",
      "title": "string",
      "template": "FAQ",
      "content": "string"
    },
    {
      "slug": "contact",
      "title": "string",
      "template": "CONTACT",
      "content": "string"
    },
    {
      "slug": "privacy",
      "title": "string",
      "template": "PRIVACY",
      "content": "string"
    },
    {
      "slug": "terms",
      "title": "string",
      "template": "TERMS",
      "content": "string"
    }
  ],
  "services": [
    {
      "name": "string",
      "description": "string",
      "price": number (optional),
      "duration": "string (optional)"
    }
  ],
  "products": [
    {
      "name": "string",
      "description": "string",
      "price": number,
      "comparePrice": number (optional),
      "quantity": number (optional)
    }
  ],
  "team": [
    {
      "name": "string",
      "role": "string",
      "bio": "string (optional)"
    }
  ],
  "testimonials": [
    {
      "name": "string",
      "role": "string",
      "content": "string",
      "rating": number (1-5)
    }
  ],
  "faq": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "stats": [
    {
      "value": "string",
      "label": "string"
    }
  ],
  "features": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "seo": {
    "title": "string (50-60 chars)",
    "description": "string (140-160 chars)"
  },
  "imageRoles": ["hero-main", "about-main", "service", "product", "gallery", "team", "cover"]
}

For INTRO sites include services. For STORE sites include products.
Return ONLY the JSON object, no markdown, no explanation.`;
}
