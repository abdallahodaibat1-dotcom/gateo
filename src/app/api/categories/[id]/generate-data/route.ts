import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { auth } from '@/auth';

// GET /api/categories/[id]/generate-data
// Returns auto-generated sample services and products for the selected category
// based on the admin-managed templates. Public for authenticated users.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'INTRO' | 'STORE' | null;

    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!category) return notFound('Category not found');

    const [serviceTemplates, productTemplates] = await Promise.all([
      prisma.categoryServiceTemplate.findMany({
        where: { categoryId: id, isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      }),
      prisma.categoryProductTemplate.findMany({
        where: { categoryId: id, isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 20,
      }),
    ]);

    const services = serviceTemplates.map((t) => ({
      name: t.name,
      description: t.description || `خدمة ${t.name} المقدمة من ${category.name}`,
      price: t.price ? Number(t.price) : undefined,
      duration: t.duration || undefined,
      image: '',
    }));

    const products = productTemplates.map((t) => ({
      name: t.name,
      description: t.description || `منتج ${t.name} من ${category.name}`,
      price: t.price ? Number(t.price) : 0,
      comparePrice: t.comparePrice ? Number(t.comparePrice) : undefined,
      quantity: t.quantity ?? 1,
      category: t.category || category.name,
      image: '',
    }));

    return NextResponse.json({
      categoryId: id,
      categoryName: category.name,
      type,
      services,
      products,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return serverError(error);
  }
}
