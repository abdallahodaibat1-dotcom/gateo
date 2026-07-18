import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { generateThemeForBusiness } from '@/lib/business-template-generator';
import { serializeBusiness } from '@/lib/business-serializer';

function parseSections(theme: any) {
  if (!theme) return theme;
  if (typeof theme.sections === 'string') {
    try {
      return { ...theme, sections: JSON.parse(theme.sections) };
    } catch {
      return { ...theme, sections: [] };
    }
  }
  return theme;
}

async function getBusinessAndAuthorize(id: string, session: any) {
  const business = await prisma.business.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      Category: true,
      BusinessSubcategory: {
        include: { Subcategory: { select: { id: true, name: true, slug: true } } },
      },
    },
  });
  if (!business) return { error: 'العمل غير موجود', status: 404 };
  if (business.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح', status: 403 };
  }
  return { business };
}

// POST /api/businesses/[id]/theme/generate
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
    const serializedBusiness = serializeBusiness(business);
    const generated = generateThemeForBusiness(serializedBusiness);

    const theme = await prisma.businessTheme.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        ...generated.theme,
        sections: JSON.stringify(generated.theme.sections),
      },
      update: {
        presetId: generated.theme.presetId,
        primaryColor: generated.theme.primaryColor,
        secondaryColor: generated.theme.secondaryColor,
        accentColor: generated.theme.accentColor,
        backgroundColor: generated.theme.backgroundColor,
        surfaceColor: generated.theme.surfaceColor,
        textColor: generated.theme.textColor,
        fontFamily: generated.theme.fontFamily,
        borderRadius: generated.theme.borderRadius,
        buttonStyle: generated.theme.buttonStyle,
        heroLayout: generated.theme.heroLayout,
        navbarStyle: generated.theme.navbarStyle,
        sections: JSON.stringify(generated.theme.sections),
      },
    });

    // Create default pages if none exist
    const existingPages = await prisma.businessPage.count({
      where: { businessId: business.id },
    });

    if (existingPages === 0) {
      await prisma.businessPage.createMany({
        data: generated.pages.map((page) => ({
          businessId: business.id,
          ...page,
        })),
      });
    }

    return NextResponse.json({ theme: parseSections(theme), pages: generated.pages });
  } catch (error) {
    console.error('POST /api/businesses/[id]/theme/generate error:', error);
    return NextResponse.json({ error: 'فشل في توليد الموقع' }, { status: 500 });
  }
}
