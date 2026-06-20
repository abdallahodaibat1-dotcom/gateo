import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateThemeForBusiness } from '@/lib/business-template-generator';

const defaultTheme = {
  presetId: null,
  primaryColor: '#7c3aed',
  secondaryColor: '#ec4899',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  surfaceColor: '#ffffff',
  textColor: '#1a1a2e',
  fontFamily: 'Cairo',
  borderRadius: '1rem',
  buttonStyle: 'gradient',
  heroLayout: 'center',
  navbarStyle: 'fixed',
  sections: [
    { id: 'hero', type: 'hero', enabled: true, order: 10 },
    { id: 'about', type: 'about', enabled: true, order: 20 },
    { id: 'experience', type: 'experience', enabled: true, order: 30 },
    { id: 'services', type: 'services', enabled: true, order: 40 },
    { id: 'gallery', type: 'gallery', enabled: true, order: 50 },
    { id: 'reviews', type: 'reviews', enabled: true, order: 60 },
    { id: 'contact', type: 'contact', enabled: true, order: 70 },
    { id: 'cta', type: 'cta', enabled: true, order: 80 },
  ],
  customCss: null,
  isPublished: true,
};

const updateSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  surfaceColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().min(1).max(100).optional(),
  borderRadius: z.string().min(1).max(50).optional(),
  buttonStyle: z.enum(['gradient', 'solid', 'outline']).optional(),
  heroLayout: z.enum(['center', 'split', 'minimal']).optional(),
  navbarStyle: z.enum(['fixed', 'static', 'transparent']).optional(),
  sections: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string().optional(),
    enabled: z.boolean(),
    order: z.number(),
    settings: z.record(z.string(), z.unknown()).optional(),
  })).optional(),
  customCss: z.string().max(10000).optional().nullable(),
  isPublished: z.boolean().optional(),
}).partial();

async function getBusinessAndAuthorize(id: string, session: any) {
  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { Category: true, Subcategory: true },
  });
  if (!business) return { error: 'العمل غير موجود', status: 404 };
  if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح', status: 403 };
  }
  return { business };
}

// GET /api/businesses/[id]/theme
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    let theme = await prisma.businessTheme.findUnique({
      where: { businessId: business.id },
    });

    if (!theme) {
      theme = await prisma.businessTheme.create({
        data: {
          businessId: business.id,
          ...defaultTheme,
          sections: defaultTheme.sections as any,
        },
      });
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error('GET /api/businesses/[id]/theme error:', error);
    return NextResponse.json({ error: 'فشل في جلب المظهر' }, { status: 500 });
  }
}

// PUT /api/businesses/[id]/theme
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const theme = await prisma.businessTheme.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        ...defaultTheme,
        ...data,
        sections: data.sections ? (data.sections as any) : defaultTheme.sections,
      },
      update: {
        ...data,
        sections: data.sections ? (data.sections as any) : undefined,
      },
    });

    return NextResponse.json({ theme });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    console.error('PUT /api/businesses/[id]/theme error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المظهر' }, { status: 500 });
  }
}
