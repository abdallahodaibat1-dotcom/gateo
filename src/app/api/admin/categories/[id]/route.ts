import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/categories/[id] - Get category details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        Subcategory: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { Business: true } },
      },
    });

    if (!category) return notFound('Category not found');

    return NextResponse.json({ category });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/categories/[id] - Update category
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, nameEn, slug, icon, image, description, isLadiesGate, sortOrder } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return notFound('Category not found');

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.category.findUnique({ where: { slug } });
      if (slugTaken) return badRequest('Slug already exists');
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
        ...(isLadiesGate !== undefined && { isLadiesGate }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return notFound('Category not found');

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
