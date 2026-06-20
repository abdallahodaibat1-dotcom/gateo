import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const serviceUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  duration: z.number().min(1).optional().nullable(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
}).partial();

// PUT /api/businesses/[id]/services/[serviceId] - Update service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, serviceId } = await params;

  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }
    if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.businessId !== id) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
    }

    const body = await req.json();
    const data = serviceUpdateSchema.parse(body);

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return NextResponse.json({ service: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/businesses/[id]/services/[serviceId] error:', error);
    return NextResponse.json({ error: 'فشل في تحديث الخدمة' }, { status: 500 });
  }
}

// DELETE /api/businesses/[id]/services/[serviceId] - Delete service
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, serviceId } = await params;

  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }
    if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.businessId !== id) {
      return NextResponse.json({ error: 'الخدمة غير موجودة' }, { status: 404 });
    }

    await prisma.service.delete({ where: { id: serviceId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/businesses/[id]/services/[serviceId] error:', error);
    return NextResponse.json({ error: 'فشل في حذف الخدمة' }, { status: 500 });
  }
}
