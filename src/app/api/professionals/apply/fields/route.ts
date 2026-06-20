import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const valuesSchema = z.record(z.string(), z.string().nullable());

// GET /api/professionals/apply/fields
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: { Category: true },
    });

    const categoryId = profile?.categoryId;

    const [definitions, values] = await Promise.all([
      prisma.dynamicFieldDefinition.findMany({
        where: {
          isActive: true,
          appliesTo: { in: ['PROFESSIONAL', 'BOTH'] },
          OR: [
            { categoryId },
            { categoryId: null },
          ],
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      profile
        ? prisma.professionalFieldValues.findMany({
            where: { profileId: profile.id },
            include: { DynamicFieldDefinition: true },
          })
        : Promise.resolve([]),
    ]);

    const valuesMap = new Map(values.map((v) => [v.fieldId, v.value]));

    const fields = definitions.map((def) => ({
      ...def,
      value: valuesMap.get(def.id) || null,
    }));

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('GET /api/professionals/apply/fields error:', error);
    return NextResponse.json({ error: 'فشل في جلب الحقول' }, { status: 500 });
  }
}

// PUT /api/professionals/apply/fields
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = valuesSchema.parse(body.values);
    const categoryId = body.categoryId;

    let profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'لم يتم العثور على الملف الاحترافي' }, { status: 404 });
    }

    const definitions = await prisma.dynamicFieldDefinition.findMany({
      where: {
        isActive: true,
        appliesTo: { in: ['PROFESSIONAL', 'BOTH'] },
        OR: [
          { categoryId: profile.categoryId || categoryId },
          { categoryId: null },
        ],
      },
    });

    const validFieldIds = new Set(definitions.map((d) => d.id));

    await prisma.$transaction(
      Object.entries(data)
        .filter(([fieldId]) => validFieldIds.has(fieldId))
        .map(([fieldId, value]) =>
          prisma.professionalFieldValues.upsert({
            where: { profileId_fieldId: { profileId: profile.id, fieldId } },
            create: { profileId: profile.id, fieldId, value: value || null },
            update: { value: value || null },
          })
        )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    console.error('PUT /api/professionals/apply/fields error:', error);
    return NextResponse.json({ error: 'فشل في حفظ الحقول' }, { status: 500 });
  }
}
