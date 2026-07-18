import OpenAI from "openai";
import {
  AiProvider,
  AiMessage,
  AiCompletionResult,
  AiVisionMessage,
  AiImageGenerationResult,
  AiImageGenerationOptions,
} from "@/lib/ai/types";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    this.client = new OpenAI({
      apiKey: key,
      organization: process.env.OPENAI_ORG_ID || undefined,
    });
  }

  async completeText({
    messages,
    model = process.env.AI_DEFAULT_TEXT_MODEL || "gpt-4o-mini",
    temperature = 0.7,
    maxTokens = 4000,
    jsonMode = false,
  }: {
    messages: AiMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<AiCompletionResult> {
    const completion = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error("Empty response from OpenAI");
    }

    return {
      content: choice.message.content,
      model: completion.model,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  }

  async completeVision({
    messages,
    model = process.env.AI_DEFAULT_VISION_MODEL || "gpt-4o",
    maxTokens = 1000,
  }: {
    messages: AiVisionMessage[];
    model?: string;
    maxTokens?: number;
  }): Promise<AiCompletionResult> {
    const completion = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })) as OpenAI.Chat.ChatCompletionMessageParam[],
      max_tokens: maxTokens,
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error("Empty response from OpenAI vision");
    }

    return {
      content: choice.message.content,
      model: completion.model,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
    };
  }

  async generateImage({
    prompt,
    model = process.env.AI_DEFAULT_IMAGE_MODEL || "dall-e-3",
    size = "1792x1024",
    quality = "standard",
  }: {
    prompt: string;
    model?: string;
    size?: AiImageGenerationOptions["size"];
    quality?: AiImageGenerationOptions["quality"];
  }): Promise<AiImageGenerationResult> {
    const response = await this.client.images.generate({
      model,
      prompt,
      size,
      quality,
      n: 1,
    });

    const image = response.data?.[0];
    if (!image?.url) {
      throw new Error("No image returned from OpenAI");
    }

    return {
      url: image.url,
      revisedPrompt: image.revised_prompt,
    };
  }
}
