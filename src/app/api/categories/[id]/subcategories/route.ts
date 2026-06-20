import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  icon: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

// GET /api/categories/[id]/subcategories - List subcategories for a category
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        Subcategory: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!category) return notFound('Category not found');

    return NextResponse.json({ subcategories: category.Subcategory });
  } catch (error) {
    console.error('GET /api/categories/[id]/subcategories error:', error);
    return serverError(error);
  }
}

// POST /api/categories/[id]/subcategories - Create subcategory under category (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: categoryId } = await params;

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return notFound('Category not found');

    const body = await req.json();
    const data = createSchema.parse(body);

    const existing = await prisma.subcategory.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return badRequest('Slug already exists');
    }

    const subcategory = await prisma.subcategory.create({
      data: {
        ...data,
        categoryId,
      },
    });

    return NextResponse.json({ subcategory }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/categories/[id]/subcategories error:', error);
    return serverError(error);
  }
}
