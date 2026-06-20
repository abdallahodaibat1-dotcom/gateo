import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createAdSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  image: z.string().url().optional(),
  video: z.string().url().optional(),
  link: z.string().url().optional(),
  buttonText: z.string().max(50).optional(),
  advertiserName: z.string().max(200).optional(),
  advertiserLogo: z.string().url().optional(),
  placement: z.enum(['FEED', 'SIDEBAR', 'HERO', 'BANNER', 'BUSINESS_LISTING']).default('FEED'),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  targetAudience: z.record(z.string(), z.any()).optional(),
});

// GET /api/ads?placement=FEED&limit=5
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get('placement') || 'FEED';
  const limit = Math.min(20, Math.max(1, Number(searchParams.get('limit') || '5')));

  try {
    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        status: 'ACTIVE',
        placement: placement as any,
        AND: [
          {
            OR: [
              { startAt: null },
              { startAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endAt: null },
              { endAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      include: {
        User: { select: { id: true, name: true, avatar: true } },
        Business: { select: { id: true, name: true, logo: true } },
      },
    });

    // Increment impressions
    const ids = ads.map((ad) => ad.id);
    if (ids.length > 0) {
      await prisma.ad.updateMany({
        where: { id: { in: ids } },
        data: { impressions: { increment: 1 } },
      });
    }

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('GET /api/ads error:', error);
    return NextResponse.json({ error: 'فشل في جلب الإعلانات' }, { status: 500 });
  }
}

// POST /api/ads - create a new ad
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createAdSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountType: true, Business: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const ad = await prisma.ad.create({
      data: {
        ...data,
        targetAudience: data.targetAudience as any,
        userId: session.user.id,
        businessId: user.Business?.id || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    console.error('POST /api/ads error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الإعلان' }, { status: 500 });
  }
}
