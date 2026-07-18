import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError, badRequest } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import { serializeBusiness } from '@/lib/business-serializer';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    if (!lat || !lng) {
      return badRequest('يجب توفير إحداثيات الموقع (lat, lng)');
    }

    const businesses = await prisma.business.findMany({
      where: {
        status: 'ACTIVE',
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        Category: { select: { id: true, name: true } },
        BusinessSubcategory: {
          include: {
            Subcategory: { select: { id: true, name: true, slug: true } },
          },
        },
        Country: { select: { id: true, name: true } },
        User: { select: { id: true, name: true } },
        _count: {
          select: { Review: true, Booking: true },
        },
      },
    });

    const withDistance = businesses
      .map((b) => {
        const distance = haversineDistance(
          lat,
          lng,
          b.latitude || 0,
          b.longitude || 0
        );
        return { ...serializeBusiness(b), distance };
      })
      .filter((b) => b.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({
      businesses: withDistance,
      total: withDistance.length,
      userLocation: { lat, lng, radius },
    });
  } catch (error) {
    return serverError(error);
    }
  }
