import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/subcategories/[id] - Get subcategory details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        Category: true,
        _count: { select: { BusinessSubcategory: true } },
      },
    });

    if (!subcategory) return notFound('Subcategory not found');

    return NextResponse.json({ subcategory });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/subcategories/[id] - Update subcategory
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { categoryId, name, nameEn, slug, icon, sortOrder } = body;

    const existing = await prisma.subcategory.findUnique({ where: { id } });
    if (!existing) return notFound('Subcategory not found');

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.subcategory.findUnique({ where: { slug } });
      if (slugTaken) return badRequest('Slug already exists');
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) return badRequest('Category not found');
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ subcategory });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/subcategories/[id] - Delete subcategory
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.subcategory.findUnique({ where: { id } });
    if (!existing) return notFound('Subcategory not found');

    await prisma.subcategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
