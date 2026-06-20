import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const pageSchema = z.object({
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  content: z.string().max(20000).optional().nullable(),
  sections: z.array(z.record(z.string(), z.unknown())).optional().nullable(),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
  isHomePage: z.boolean().default(false),
});

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

// GET /api/businesses/[id]/pages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const pages = await prisma.businessPage.findMany({
      where: { businessId: business.id },
      orderBy: [{ isHomePage: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('GET /api/businesses/[id]/pages error:', error);
    return NextResponse.json({ error: 'فشل في جلب الصفحات' }, { status: 500 });
  }
}

// POST /api/businesses/[id]/pages
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
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const body = await req.json();
    const data = pageSchema.parse(body);

    if (data.isHomePage) {
      await prisma.businessPage.updateMany({
        where: { businessId: business.id, isHomePage: true },
        data: { isHomePage: false },
      });
    }

    const page = await prisma.businessPage.create({
      data: {
        businessId: business.id,
        ...data,
        sections: data.sections as any,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'الرابط المختار مستخدم مسبقاً' }, { status: 409 });
    }
    console.error('POST /api/businesses/[id]/pages error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الصفحة' }, { status: 500 });
  }
}
