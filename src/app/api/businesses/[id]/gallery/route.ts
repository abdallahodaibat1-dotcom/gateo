import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const gallerySchema = z.object({
  items: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
    caption: z.string().optional(),
  })),
});

// GET /api/businesses/[id]/gallery - Get gallery
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const business = await prisma.business.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }

    const items = business.images || [];
    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/businesses/[id]/gallery error:', error);
    return NextResponse.json({ error: 'فشل في جلب المعرض' }, { status: 500 });
  }
}

// POST /api/businesses/[id]/gallery - Add to gallery (owner only)
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
    const data = gallerySchema.parse(body);

    const current = business.images ? JSON.parse(business.images as string) : [];
    const updated = [...current, ...data.items];

    await prisma.business.update({
      where: { id },
      data: { images: JSON.stringify(updated) },
    });

    return NextResponse.json({ items: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/businesses/[id]/gallery error:', error);
    return NextResponse.json({ error: 'فشل في إضافة للمعرض' }, { status: 500 });
  }
}
