import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(1).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

// GET /api/businesses/[id]/services - List services
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const services = await prisma.service.findMany({
      where: { businessId: id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('GET /api/businesses/[id]/services error:', error);
    return NextResponse.json({ error: 'فشل في جلب الخدمات' }, { status: 500 });
  }
}

// POST /api/businesses/[id]/services - Add service (owner only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }
    if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await req.json();
    const data = serviceSchema.parse(body);

    const service = await prisma.service.create({
      data: {
        ...data,
        businessId: id,
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/businesses/[id]/services error:', error);
    return NextResponse.json({ error: 'فشل في إضافة الخدمة' }, { status: 500 });
  }
}
