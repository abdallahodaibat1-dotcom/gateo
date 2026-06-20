import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  quantity: z.number().int().min(0).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.string().max(500).optional().nullable(),
  status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'DRAFT', 'ARCHIVED']).optional(),
  isInMarketplace: z.boolean().optional(),
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

// GET /api/businesses/[id]/products/[productId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, productId } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const product = await prisma.product.findFirst({
      where: { id: productId, businessId: business.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('GET /api/businesses/[id]/products/[productId] error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنتج' }, { status: 500 });
  }
}

// PUT /api/businesses/[id]/products/[productId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, productId } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId: business.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        images: data.images !== undefined ? (data.images === null ? null : JSON.stringify(data.images)) : undefined,
      },
    });

    // Sync marketplace listing
    if (data.isInMarketplace !== undefined || data.category !== undefined) {
      const listing = await prisma.marketplaceListing.findUnique({
        where: { productId },
      });

      if (data.isInMarketplace === false && listing) {
        await prisma.marketplaceListing.delete({ where: { productId } });
      } else if (data.isInMarketplace === true && !listing) {
        await prisma.marketplaceListing.create({
          data: {
            productId,
            category: data.category || product.category || business.categoryId,
          },
        });
      } else if (listing && data.category !== undefined) {
        await prisma.marketplaceListing.update({
          where: { productId },
          data: { category: data.category || listing.category },
        });
      }
    }

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    console.error('PUT /api/businesses/[id]/products/[productId] error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المنتج' }, { status: 500 });
  }
}

// DELETE /api/businesses/[id]/products/[productId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id, productId } = await params;

  try {
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const existing = await prisma.product.findFirst({
      where: { id: productId, businessId: business.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/businesses/[id]/products/[productId] error:', error);
    return NextResponse.json({ error: 'فشل في حذف المنتج' }, { status: 500 });
  }
}
