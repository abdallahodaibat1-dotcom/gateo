import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { serializeBusiness } from '@/lib/business-serializer';

// GET /api/businesses/my - Get current user's business
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      include: {
        Category: { select: { id: true, name: true } },
        Subcategory: { select: { id: true, name: true } },
        Service: { orderBy: { createdAt: 'desc' } },
        _count: { select: { Review: true, Booking: true } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'لا يوجد حساب عمل' }, { status: 404 });
    }

    return NextResponse.json({ business: serializeBusiness(business) });
  } catch (error) {
    console.error('GET /api/businesses/my error:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات العمل' }, { status: 500 });
  }
}
