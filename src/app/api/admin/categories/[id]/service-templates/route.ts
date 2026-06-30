import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';

// GET /api/admin/categories/[id]/service-templates
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

    const templates = await prisma.categoryServiceTemplate.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/categories/[id]/service-templates
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
    const { name, description, price, duration, isActive, sortOrder } = body;

    if (!name || typeof name !== 'string') {
      return badRequest('Service name is required');
    }

    const template = await prisma.categoryServiceTemplate.create({
      data: {
        categoryId: id,
        name,
        description: description || null,
        price: price !== undefined && price !== '' ? Number(price) : null,
        duration: duration !== undefined && duration !== '' ? Number(duration) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
