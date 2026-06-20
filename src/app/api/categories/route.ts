import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  icon: z.string().max(200).optional().nullable(),
  image: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  isLadiesGate: z.boolean().default(false),
  type: z.enum(['BUSINESS', 'PROFESSIONAL', 'LADIES_GATE']).default('BUSINESS'),
  sortOrder: z.number().int().default(0),
});

// GET /api/categories - List all categories
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isLadiesGate = searchParams.get('ladiesGate');
  const type = searchParams.get('type');
  const includeSubcategories = searchParams.get('withSubs') === 'true';

  try {
    const where: any = {};
    if (isLadiesGate !== null) {
      where.isLadiesGate = isLadiesGate === 'true';
    }
    if (type === 'BUSINESS' || type === 'PROFESSIONAL' || type === 'LADIES_GATE') {
      where.type = type;
    }

    const include: any = {
      _count: { select: { Business: true, Subcategory: true, ProfessionalProfile: true } },
    };
    if (includeSubcategories) {
      include.Subcategory = { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, slug: true } };
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include,
    });

    const normalized = categories.map((category) => {
      const { Subcategory, _count, ...rest } = category as any;
      return {
        ...rest,
        subcategories: Subcategory || [],
        _count: {
          businesses: _count?.Business ?? 0,
          subcategories: _count?.Subcategory ?? 0,
          professionals: _count?.ProfessionalProfile ?? 0,
        },
      };
    });

    return NextResponse.json({ categories: normalized });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return serverError(error);
  }
}

// POST /api/categories - Create category (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return badRequest('Slug already exists');
    }

    const category = await prisma.category.create({
      data,
      include: {
        _count: { select: { Business: true, Subcategory: true, ProfessionalProfile: true } },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/categories error:', error);
    return serverError(error);
  }
}
