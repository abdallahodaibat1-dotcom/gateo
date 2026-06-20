import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(20000).optional().nullable(),
  sections: z.array(z.record(z.string(), z.unknown())).optional().nullable(),
  sortOrder: z.number().optional(),
  isVisible: z.boolean().optional(),
  isHomePage: z.boolean().optional(),
}).partial();

async function getBusinessAndAuthorize(id: string, session: any) {
  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });
  if (!business) return { error: 'العمل غير موجود', status: 404 };
  if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح', status: 403 };
  }
  return { business };
}

// GET /api/businesses/[id]/pages/[pageId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, pageId } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const page = await prisma.businessPage.findFirst({
      where: { id: pageId, businessId: business.id },
    });

    if (!page) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('GET /api/businesses/[id]/pages/[pageId] error:', error);
    return NextResponse.json({ error: 'فشل في جلب الصفحة' }, { status: 500 });
  }
}

// PUT /api/businesses/[id]/pages/[pageId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, pageId } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const existing = await prisma.businessPage.findFirst({
      where: { id: pageId, businessId: business.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.isHomePage) {
      await prisma.businessPage.updateMany({
        where: { businessId: business.id, isHomePage: true, id: { not: pageId } },
        data: { isHomePage: false },
      });
    }

    const page = await prisma.businessPage.update({
      where: { id: pageId },
      data: {
        ...data,
        sections: data.sections !== undefined ? (data.sections as any) : undefined,
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'الرابط المختار مستخدم مسبقاً' }, { status: 409 });
    }
    console.error('PUT /api/businesses/[id]/pages/[pageId] error:', error);
    return NextResponse.json({ error: 'فشل في تحديث الصفحة' }, { status: 500 });
  }
}

// DELETE /api/businesses/[id]/pages/[pageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, pageId } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const existing = await prisma.businessPage.findFirst({
      where: { id: pageId, businessId: business.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    if (existing.isHomePage) {
      return NextResponse.json({ error: 'لا يمكن حذف الصفحة الرئيسية' }, { status: 400 });
    }

    await prisma.businessPage.delete({ where: { id: pageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/businesses/[id]/pages/[pageId] error:', error);
    return NextResponse.json({ error: 'فشل في حذف الصفحة' }, { status: 500 });
  }
}
