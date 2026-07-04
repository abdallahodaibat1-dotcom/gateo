import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';

// GET /api/admin/categories/[id]/product-templates
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFound('Category not found');

    const templates = await prisma.categoryProductTemplate.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/categories/[id]/product-templates
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFound('Category not found');

    const body = await req.json();
    const { name, description, price, comparePrice, quantity, category: productCategory, isActive, sortOrder } = body;

    if (!name || typeof name !== 'string') {
      return badRequest('Product name is required');
    }

    const template = await prisma.categoryProductTemplate.create({
      data: {
        categoryId: id,
        name,
        description: description || null,
        price: price !== undefined && price !== '' ? Number(price) : null,
        comparePrice: comparePrice !== undefined && comparePrice !== '' ? Number(comparePrice) : null,
        quantity: quantity !== undefined && quantity !== '' ? Number(quantity) : 1,
        category: productCategory || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
