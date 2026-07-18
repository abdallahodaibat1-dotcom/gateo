import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/subcategories - List all subcategories
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        Category: { select: { id: true, name: true } },
        _count: { select: { BusinessSubcategory: true } },
      },
    });

    return NextResponse.json({ subcategories });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/subcategories - Create subcategory
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const { categoryId, name, nameEn, slug, icon, sortOrder } = body;

    if (!categoryId || !name || !slug) {
      return badRequest('Category ID, name, and slug are required');
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return badRequest('Category not found');

    const existing = await prisma.subcategory.findUnique({ where: { slug } });
    if (existing) return badRequest('Slug already exists');

    const subcategory = await prisma.subcategory.create({
      data: {
        categoryId,
        name,
        nameEn,
        slug,
        icon,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ subcategory }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
