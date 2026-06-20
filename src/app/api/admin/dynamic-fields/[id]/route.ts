import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { requireAdmin } from '../../_lib/utils';

const updateSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/).optional(),
  label: z.string().min(1).max(200).optional(),
  labelEn: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'DATE', 'URL']).optional(),
  options: z.array(z.object({
    value: z.string().min(1),
    label: z.string().min(1),
  })).optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  isRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  appliesTo: z.enum(['BUSINESS', 'PROFESSIONAL', 'BOTH']).optional(),
  categoryId: z.string().optional().nullable(),
  subcategoryId: z.string().optional().nullable(),
}).partial();

// GET /api/admin/dynamic-fields/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { id } = await params;

  try {
    const field = await prisma.dynamicFieldDefinition.findUnique({
      where: { id },
      include: {
        Category: { select: { id: true, name: true } },
        Subcategory: { select: { id: true, name: true } },
      },
    });

    if (!field) {
      return NextResponse.json({ error: 'الحقل غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ field });
  } catch (error) {
    console.error('GET /api/admin/dynamic-fields/[id] error:', error);
    return NextResponse.json({ error: 'فشل في جلب الحقل' }, { status: 500 });
  }
}

// PUT /api/admin/dynamic-fields/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { id } = await params;

  try {
    const existing = await prisma.dynamicFieldDefinition.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'الحقل غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const field = await prisma.dynamicFieldDefinition.update({
      where: { id },
      data: {
        ...data,
        options: data.options !== undefined ? (data.options as any) : undefined,
      },
    });

    return NextResponse.json({ field });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: 'اسم الحقل مستخدم مسبقاً' }, { status: 409 });
    }
    console.error('PUT /api/admin/dynamic-fields/[id] error:', error);
    return NextResponse.json({ error: 'فشل في تحديث الحقل' }, { status: 500 });
  }
}

// DELETE /api/admin/dynamic-fields/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  const { id } = await params;

  try {
    const existing = await prisma.dynamicFieldDefinition.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'الحقل غير موجود' }, { status: 404 });
    }

    await prisma.dynamicFieldDefinition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/dynamic-fields/[id] error:', error);
    return NextResponse.json({ error: 'فشل في حذف الحقل' }, { status: 500 });
  }
}
