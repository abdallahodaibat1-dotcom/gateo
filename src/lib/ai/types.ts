/**
 * Core types for the AI generation engine.
 */

export type AiProviderName = "openai" | "gemini" | "anthropic";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AiCompletionResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface AiImageGenerationOptions {
  model?: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export interface AiImageGenerationResult {
  url: string;
  revisedPrompt?: string;
}

export interface AiVisionMessage {
  role: "system" | "user";
  content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
}

export interface AiProvider {
  readonly name: AiProviderName;
  completeText(options: {
    messages: AiMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<AiCompletionResult>;
  completeVision(options: {
    messages: AiVisionMessage[];
    model?: string;
    maxTokens?: number;
  }): Promise<AiCompletionResult>;
  generateImage(options: {
    prompt: string;
    model?: string;
    size?: AiImageGenerationOptions["size"];
    quality?: AiImageGenerationOptions["quality"];
  }): Promise<AiImageGenerationResult>;
}

export interface ImageSource {
  source: "USER" | "REFERENCE" | "AI_GENERATED";
  url: string;
  sourceUrl?: string;
  altText?: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface ExtractedImageCandidate {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface ImageAnalysisResult {
  qualityScore: number; // 0-1
  relevanceScore: number; // 0-1
  brandMatchScore: number; // 0-1
  hasWatermark: boolean;
  isDuplicate: boolean;
  suggestedAltText: string;
  suggestedRole: ImageRole | null;
  description: string;
}

export type ImageRole =
  | "hero-main"
  | "about-main"
  | "about-team"
  | "service"
  | "product"
  | "gallery"
  | "branch"
  | "team"
  | "cover"
  | "logo"
  | "other";

export interface PlacedImage {
  role: ImageRole;
  sectionId?: string;
  image: ImageSource & { analysis?: ImageAnalysisResult };
}

export interface SiteGenerationInput {
  businessName: string;
  categoryId?: string;
  categoryName?: string;
  categoryNameEn?: string;
  subcategoryNames?: string[];
  city?: string;
  country?: string;
  language: "ar" | "en" | string;
  description?: string;
  brandStyle?: string; // luxury, modern, simple, professional, playful
  websiteType: "INTRO" | "STORE";
  referenceUrls?: string[];
  userImages?: string[];
  allowReferenceExtraction: boolean;
  allowAiImageGeneration: boolean;
  // AI wizard enrichment
  wizardData?: {
    businessName: string;
    logo?: string;
    countryId: string;
    city: string;
    categoryId: string;
    customCategory?: string;
    description: string;
    audiences: string[];
    personality: string;
    hasVisualIdentity: boolean;
    visualIdentity?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontFamily?: string;
    };
    language: "ar" | "en";
    analysis?: import("../ai/schemas/business-analysis-schema").BusinessAnalysisOutput;
    selectedDesignId?: string;
  };
}

export interface GeneratedSiteContent {
  business: {
    name: string;
    description: string;
    tagline: string;
    aboutSummary: string;
    vision?: string;
    mission?: string;
    values: string[];
    city?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  theme: {
    presetId?: string;
    homeTemplate: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
    buttonStyle: string;
    heroLayout: string;
    navbarStyle: string;
  };
  pages: Array<{
    slug: string;
    title: string;
    template: string;
    content: string;
    sections?: Record<string, unknown>[];
  }>;
  services: Array<{
    name: string;
    description: string;
    price?: number;
    duration?: string;
    imageRole?: ImageRole;
  }>;
  products: Array<{
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    quantity?: number;
    imageRole?: ImageRole;
  }>;
  team: Array<{
    name: string;
    role: string;
    bio?: string;
  }>;
  testimonials: Array<{
    name: string;
    role?: string;
    content: string;
    rating?: number;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  features: Array<{
    title: string;
    description: string;
  }>;
  seo: {
    title: string;
    description: string;
  };
  imageRoles: ImageRole[];
}
