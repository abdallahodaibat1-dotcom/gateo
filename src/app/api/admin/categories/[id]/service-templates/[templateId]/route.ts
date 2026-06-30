import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../../_lib/utils';

// PATCH /api/admin/categories/[id]/service-templates/[templateId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id, templateId } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFound('Category not found');

    const existing = await prisma.categoryServiceTemplate.findFirst({
      where: { id: templateId, categoryId: id },
    });
    if (!existing) return notFound('Service template not found');

    const body = await req.json();
    const { name, description, price, duration, isActive, sortOrder } = body;

    if (name !== undefined && (!name || typeof name !== 'string')) {
      return badRequest('Service name is required');
    }

    const template = await prisma.categoryServiceTemplate.update({
      where: { id: templateId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(price !== undefined && { price: price !== '' ? Number(price) : null }),
        ...(duration !== undefined && { duration: duration !== '' ? Number(duration) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/categories/[id]/service-templates/[templateId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id, templateId } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFound('Category not found');

    const existing = await prisma.categoryServiceTemplate.findFirst({
      where: { id: templateId, categoryId: id },
    });
    if (!existing) return notFound('Service template not found');

    await prisma.categoryServiceTemplate.delete({ where: { id: templateId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
