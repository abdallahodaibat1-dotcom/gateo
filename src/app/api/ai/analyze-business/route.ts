import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';
import { analyzeBusiness } from '@/lib/ai/analysis/business-analyzer';
import { BusinessAnalysisSchema } from '@/lib/ai/schemas/business-analysis-schema';
import { AiWizardData } from '@/lib/ai-wizard/types';

const visualIdentitySchema = z.object({
  logo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

const audienceTuple = ['individuals', 'companies', 'government', 'students', 'women', 'men', 'children', 'everyone'] as const;
const personalityTuple = [
  'formal',
  'professional',
  'luxury',
  'simple',
  'modern',
  'tech',
  'medical',
  'creative',
  'ultraLuxury',
  'youthful',
] as const;

const analyzeSchema = z.object({
  data: z.object({
    businessName: z.string().min(2),
    logo: z.string().optional(),
    countryId: z.string(),
    city: z.string(),
    categoryId: z.string(),
    customCategory: z.string().optional(),
    description: z.string().min(10),
    audiences: z.array(z.enum(audienceTuple)),
    personality: z.enum(personalityTuple),
    hasVisualIdentity: z.boolean(),
    visualIdentity: visualIdentitySchema.optional(),
    language: z.enum(['ar', 'en']).default('ar'),
    analysis: BusinessAnalysisSchema.optional(),
    selectedDesignId: z.string().optional(),
    generatedBusinessId: z.string().optional(),
    generatedSlug: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const analysis = await analyzeBusiness({ data: validation.data.data as AiWizardData });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analyze business error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze business',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
