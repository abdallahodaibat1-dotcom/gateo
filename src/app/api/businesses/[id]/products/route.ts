import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';


const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  quantity: z.number().int().min(0).default(0),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.string().max(500).optional().nullable(),
  status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  isInMarketplace: z.boolean().default(true),
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

// GET /api/businesses/[id]/products
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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const products = await prisma.product.findMany({
      where: {
        businessId: business.id,
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/businesses/[id]/products error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنتجات' }, { status: 500 });
  }
}

// POST /api/businesses/[id]/products
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
    const data = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        ...data,
        images: data.images === null ? null : JSON.stringify(data.images),
      },
    });

    if (data.isInMarketplace) {
      await prisma.marketplaceListing.create({
        data: {
          productId: product.id,
          category: data.category || business.categoryId,
        },
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    console.error('POST /api/businesses/[id]/products error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المنتج' }, { status: 500 });
  }
}
