import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/categories/[id]/fields?appliesTo=BUSINESS|PROFESSIONAL
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const appliesTo = searchParams.get('appliesTo') || 'BUSINESS';

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 });
    }

    const rawFields = await prisma.dynamicFieldDefinition.findMany({
      where: {
        isActive: true,
        OR: [
          { categoryId: id },
          { categoryId: null },
        ],
        appliesTo: { in: [appliesTo as any, 'BOTH'] },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    const fields = rawFields.map((field) => {
      let parsedOptions: { value: string; label: string }[] | null = null;
      if (field.options) {
        try {
          const parsed = JSON.parse(field.options);
          if (Array.isArray(parsed)) {
            parsedOptions = parsed.map((opt: any) => ({
              value: String(opt.value ?? ''),
              label: String(opt.label ?? opt.value ?? ''),
            }));
          }
        } catch {
          parsedOptions = null;
        }
      }
      return { ...field, options: parsedOptions };
    });

    return NextResponse.json({ fields });
  } catch (error) {
    console.error('GET /api/categories/[id]/fields error:', error);
    return NextResponse.json({ error: 'فشل في جلب الحقول' }, { status: 500 });
  }
}
