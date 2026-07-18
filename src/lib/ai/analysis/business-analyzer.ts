import { getAiProvider } from '@/lib/ai/providers/ai-provider-factory';
import { AiWizardData } from '@/lib/ai-wizard/types';
import { buildBusinessAnalysisPrompt } from '@/lib/ai/prompts/business-analysis-prompt';
import {
  BusinessAnalysisSchema,
  BusinessAnalysisOutput,
} from '@/lib/ai/schemas/business-analysis-schema';

export interface AnalyzeBusinessOptions {
  data: AiWizardData;
}

export async function analyzeBusiness(
  options: AnalyzeBusinessOptions
): Promise<BusinessAnalysisOutput> {
  const { data } = options;
  const ai = getAiProvider();

  const promptResult = await ai.completeText({
    messages: [
      {
        role: 'system',
        content: buildBusinessAnalysisPrompt(data),
      },
      {
        role: 'user',
        content: `حلل نشاط "${data.businessName}" وأعد التوصيات بالتنسيق المطلوب.`,
      },
    ],
    jsonMode: true,
    maxTokens: 3000,
    temperature: 0.7,
  });

  let rawContent: unknown;
  try {
    rawContent = JSON.parse(promptResult.content);
  } catch {
    throw new Error('AI returned invalid JSON analysis');
  }

  const validated = BusinessAnalysisSchema.parse(rawContent);
  return validated;
}
