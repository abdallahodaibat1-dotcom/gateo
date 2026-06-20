import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { requireAdmin } from '../_lib/utils';

const fieldSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/),
  label: z.string().min(1).max(200),
  labelEn: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'DATE', 'URL']),
  options: z.array(z.object({
    value: z.string().min(1),
    label: z.string().min(1),
  })).optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  appliesTo: z.enum(['BUSINESS', 'PROFESSIONAL', 'BOTH']).default('BOTH'),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
});

// GET /api/admin/dynamic-fields
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const appliesTo = searchParams.get('appliesTo');
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (appliesTo) where.appliesTo = appliesTo;
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const fields = await prisma.dynamicFieldDefinition.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        Category: { select: { id: true, name: true } },
        Subcategory: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('GET /api/admin/dynamic-fields error:', error);
    return NextResponse.json({ error: 'فشل في جلب الحقول' }, { status: 500 });
  }
}

// POST /api/admin/dynamic-fields
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = fieldSchema.parse(body);

    const field = await prisma.dynamicFieldDefinition.create({
      data: {
        name: data.name,
        label: data.label,
        labelEn: data.labelEn,
        description: data.description,
        fieldType: data.fieldType,
        options: data.options ? JSON.stringify(data.options) : undefined,
        placeholder: data.placeholder,
        isRequired: data.isRequired,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        appliesTo: data.appliesTo,
        categoryId: data.categoryId || undefined,
        subcategoryId: data.subcategoryId || undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ field }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'اسم الحقل مستخدم مسبقاً' }, { status: 409 });
    }
    console.error('POST /api/admin/dynamic-fields error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الحقل' }, { status: 500 });
  }
}
