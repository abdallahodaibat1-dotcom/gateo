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
  image: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  isLadiesGate: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/categories/[id] - Get single category with subcategories
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
        _count: { select: { Business: true, Subcategory: true } },
      },
    });

    if (!category) return notFound('Category not found');

    return NextResponse.json({ category });
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error);
    return serverError(error);
  }
}

// PUT /api/categories/[id] - Update category (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFound('Category not found');

    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.slug && data.slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        return badRequest('Slug already exists');
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
      include: {
        Subcategory: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { Business: true, Subcategory: true } },
      },
    });

    return NextResponse.json({ category: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/categories/[id] error:', error);
    return serverError(error);
  }
}

// DELETE /api/categories/[id] - Delete category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFound('Category not found');

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return serverError(error);
  }
}
