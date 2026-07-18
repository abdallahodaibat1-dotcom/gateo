import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, notFound, badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameEn: z.string().max(100).optional().nullable(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().optional(),
});

// GET /api/categories/[id]/subcategories/[subcategoryId] - Get single subcategory
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subcategoryId: string }> }
) {
  const { id: categoryId, subcategoryId } = await params;

  try {
    const subcategory = await prisma.subcategory.findFirst({
      where: { id: subcategoryId, categoryId },
      include: {
        Category: { select: { id: true, name: true, slug: true } },
        _count: { select: { BusinessSubcategory: true } },
      },
    });

    if (!subcategory) return notFound('Subcategory not found');

    return NextResponse.json({ subcategory });
  } catch (error) {
    console.error('GET /api/categories/[id]/subcategories/[subcategoryId] error:', error);
    return serverError(error);
  }
}

// PUT /api/categories/[id]/subcategories/[subcategoryId] - Update subcategory (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subcategoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: categoryId, subcategoryId } = await params;

  try {
    const subcategory = await prisma.subcategory.findFirst({
      where: { id: subcategoryId, categoryId },
    });
    if (!subcategory) return notFound('Subcategory not found');

    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.slug && data.slug !== subcategory.slug) {
      const existing = await prisma.subcategory.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        return badRequest('Slug already exists');
      }
    }

    const updated = await prisma.subcategory.update({
      where: { id: subcategoryId },
      data,
      include: {
        Category: { select: { id: true, name: true, slug: true } },
        _count: { select: { BusinessSubcategory: true } },
      },
    });

    return NextResponse.json({ subcategory: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/categories/[id]/subcategories/[subcategoryId] error:', error);
    return serverError(error);
  }
}

// DELETE /api/categories/[id]/subcategories/[subcategoryId] - Delete subcategory (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subcategoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: categoryId, subcategoryId } = await params;

  try {
    const subcategory = await prisma.subcategory.findFirst({
      where: { id: subcategoryId, categoryId },
    });
    if (!subcategory) return notFound('Subcategory not found');

    await prisma.subcategory.delete({ where: { id: subcategoryId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id]/subcategories/[subcategoryId] error:', error);
    return serverError(error);
  }
}
