import { AiProvider, AiProviderName } from "@/lib/ai/types";
import { OpenAiProvider } from "@/lib/ai/providers/openai-provider";
import { MockProvider } from "@/lib/ai/providers/mock-provider";

export function getAiProvider(provider?: AiProviderName): AiProvider {
  const selected = provider ?? (process.env.AI_DEFAULT_PROVIDER as AiProviderName) ?? "openai";

  switch (selected) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY not set, falling back to mock AI provider");
        return new MockProvider();
      }
      return new OpenAiProvider();
    default:
      throw new Error(`AI provider "${selected}" is not supported yet`);
  }
}

export function getDefaultProviderName(): AiProviderName {
  return (process.env.AI_DEFAULT_PROVIDER as AiProviderName) || "openai";
}

export function getDefaultTextModel(): string {
  return process.env.AI_DEFAULT_TEXT_MODEL || "gpt-4o-mini";
}

export function getDefaultVisionModel(): string {
  return process.env.AI_DEFAULT_VISION_MODEL || "gpt-4o";
}

export function getDefaultImageModel(): string {
  return process.env.AI_DEFAULT_IMAGE_MODEL || "dall-e-3";
}
