import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { serializeBusiness } from '@/lib/business-serializer';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  logo: z.string().url().optional().nullable(),
  cover: z.string().url().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
  customSubcategory: z.string().max(100).optional().nullable(),
  countryId: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  businessType: z.enum(['INDIVIDUAL', 'COMPANY']).optional().nullable(),
  isPublicOnGateway: z.boolean().optional().nullable(),
  workingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string(),
  })).optional().nullable(),
  images: z.array(z.object({
    url: z.string().url(),
    type: z.string().optional(),
    caption: z.string().optional(),
  })).optional().nullable(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  })).optional().nullable(),
}).partial();

// GET /api/businesses/[id] - Get public business profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const business = await prisma.business.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        Category: { select: { id: true, name: true, slug: true } },
        Subcategory: { select: { id: true, name: true, slug: true } },
        Country: { select: { id: true, name: true, flagEmoji: true } },
        User: { select: { id: true, name: true, avatar: true, createdAt: true } },
        Service: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
        Product: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } },
        Post: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            _count: { select: { Like: true, Comment: true } },
          },
        },
        BusinessTheme: true,
        BusinessPage: {
          where: { isVisible: true },
          orderBy: [{ isHomePage: 'desc' }, { sortOrder: 'asc' }],
          select: { id: true, slug: true, title: true, isHomePage: true },
        },
        BusinessFieldValue: {
          include: { DynamicFieldDefinition: true },
        },
        _count: { select: { Review: true, Booking: true } },
      },
    });

    // Parse images JSON if stored as string
    if (business && business.images && typeof business.images === 'string') {
      try {
        (business as any).images = JSON.parse(business.images);
      } catch {
        (business as any).images = [];
      }
    }

    if (!business) {
      return NextResponse.json({ error: 'العمل غير موجود' }, { status: 404 });
    }

    // Allow ACTIVE and PENDING businesses to be viewed
    if (business.status !== 'ACTIVE' && business.status !== 'PENDING') {
      const session = await auth();
      const isOwner = session?.user?.id === business.userId;
      const isAdmin = session?.user?.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'العمل غير متاح حالياً' }, { status: 403 });
      }
    }

    return NextResponse.json({ business: serializeBusiness(business) });
  } catch (error) {
    console.error('GET /api/businesses/[id] error:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات العمل' }, { status: 500 });
  }
}

// PUT /api/businesses/[id] - Update business (owner only)
export async function PUT(
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
    const data = updateSchema.parse(body);

    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...data,
        workingHours: data.workingHours !== undefined ? (data.workingHours === null ? null : JSON.stringify(data.workingHours)) : undefined,
        images: data.images !== undefined ? (data.images === null ? null : JSON.stringify(data.images)) : undefined,
        documents: data.documents !== undefined ? (data.documents === null ? null : JSON.stringify(data.documents)) : undefined,
      } as any,
    });

    return NextResponse.json({ business: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/businesses/[id] error:', error);
    return NextResponse.json({ error: 'فشل في تحديث بيانات العمل' }, { status: 500 });
  }
}
