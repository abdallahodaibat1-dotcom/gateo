import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const valuesSchema = z.record(z.string(), z.string().nullable());

async function getBusinessAndAuthorize(id: string, session: any) {
  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { Category: true },
  });
  if (!business) return { error: 'العمل غير موجود', status: 404 };
  if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح', status: 403 };
  }
  return { business };
}

// GET /api/businesses/[id]/fields
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

    const [definitions, values] = await Promise.all([
      prisma.dynamicFieldDefinition.findMany({
        where: {
          isActive: true,
          appliesTo: { in: ['BUSINESS', 'BOTH'] },
          OR: [
            { categoryId: business.categoryId },
            { categoryId: null },
          ],
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.businessFieldValue.findMany({
        where: { businessId: business.id },
        include: { DynamicFieldDefinition: true },
      }),
    ]);

    const valuesMap = new Map(values.map((v) => [v.fieldId, v.value]));
  // field relation renamed in Prisma client
  (values as any[]).forEach((v) => { v.field = v.DynamicFieldDefinition; });

    const fields = definitions.map((def) => ({
      ...def,
      value: valuesMap.get(def.id) || null,
    }));

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('GET /api/businesses/[id]/fields error:', error);
    return NextResponse.json({ error: 'فشل في جلب الحقول' }, { status: 500 });
  }
}

// PUT /api/businesses/[id]/fields
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
    const result = await getBusinessAndAuthorize(id, session);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;
    const body = await req.json();
    const data = valuesSchema.parse(body);

    const definitions = await prisma.dynamicFieldDefinition.findMany({
      where: {
        isActive: true,
        appliesTo: { in: ['BUSINESS', 'BOTH'] },
        OR: [
          { categoryId: business.categoryId },
          { categoryId: null },
        ],
      },
    });

    const validFieldIds = new Set(definitions.map((d) => d.id));

    await prisma.$transaction(
      Object.entries(data)
        .filter(([fieldId]) => validFieldIds.has(fieldId))
        .map(([fieldId, value]) =>
          prisma.businessFieldValue.upsert({
            where: { businessId_fieldId: { businessId: business.id, fieldId } },
            create: { businessId: business.id, fieldId, value: value || null },
            update: { value: value || null },
          })
        )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    console.error('PUT /api/businesses/[id]/fields error:', error);
    return NextResponse.json({ error: 'فشل في حفظ الحقول' }, { status: 500 });
  }
}
