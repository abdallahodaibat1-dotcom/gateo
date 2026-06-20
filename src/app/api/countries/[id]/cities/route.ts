import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/countries/[id]/cities — List cities for a country
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const cities = await prisma.city.findMany({
      where: { countryId: id, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, nameEn: true },
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('GET /api/countries/[id]/cities error:', error);
    return NextResponse.json({ error: 'فشل في جلب المدن' }, { status: 500 });
  }
}
