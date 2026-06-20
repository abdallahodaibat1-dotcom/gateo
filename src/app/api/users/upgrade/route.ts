import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  users_accountType as AccountType,
  businesses_businessType as BusinessType,
  NotificationType,
} from '@prisma/client';

const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);

const normalizeUrl = (val: unknown) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const s = String(val).trim();
  if (!s) return undefined;
  if (!s.startsWith('http://') && !s.startsWith('https://')) {
    return `https://${s}`;
  }
  return s;
};

const upgradeSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().min(2).max(100).optional()),
  description: z.preprocess(
    emptyToUndefined,
    z.string().max(2000).optional()
  ),
  logo: z.preprocess(normalizeUrl, z.string().url().optional()),
  city: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
  phone: z.preprocess(emptyToUndefined, z.string().max(30).optional()),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  website: z.preprocess(normalizeUrl, z.string().url().optional()),
  businessType: z.enum(['INDIVIDUAL', 'COMPANY']),
  specializations: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        subcategoryIds: z.array(z.string()).default([]),
      })
    )
    .default([]),
  workExperience: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        company: z.string().max(100).optional(),
        years: z.number().int().min(0).optional(),
        description: z.string().max(1000).optional(),
      })
    )
    .default([]),
  familyInfo: z
    .object({
      maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED']),
      familySize: z.number().int().min(0).optional(),
      hasChildren: z.boolean().optional(),
      numberOfChildren: z.number().int().min(0).optional(),
    })
    .optional()
    .nullable(),
  isPublicOnGateway: z.boolean().default(true),
});

// POST /api/users/upgrade - Upgrade a USER to PROFESSIONAL/COMPANY
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('POST /api/users/upgrade body:', JSON.stringify(body, null, 2));
    const data = upgradeSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountType: true, name: true },
    });

    if (!user || user.accountType !== 'USER') {
      return NextResponse.json(
        { error: 'لا يمكن ترقية هذا الحساب' },
        { status: 400 }
      );
    }

    const businessName = data.name?.trim() || user.name || 'نشاط تجاري';

    const derivedAccountType =
      data.businessType === 'INDIVIDUAL'
        ? AccountType.PROFESSIONAL
        : AccountType.COMPANY;

    // For individual professionals, create/update a ProfessionalProfile so they
    // appear in the professional business directory (/businesses).
    if (data.businessType === 'INDIVIDUAL') {
      const firstSpecialization = data.specializations[0];
      const categoryId = firstSpecialization?.categoryId || null;
      const subcategoryId = firstSpecialization?.subcategoryIds?.[0] || null;

      await prisma.professionalProfile.upsert({
        where: { userId: session.user.id },
        update: {
          title: data.name?.trim() || user.name || null,
          bio: data.description || null,
          personalLogo: data.logo || null,
          city: data.city || null,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          categoryId,
          subcategoryId,
          skills: null,
          isPublicOnGateway: data.isPublicOnGateway,
          status: 'PENDING',
        },
        create: {
          userId: session.user.id,
          title: data.name?.trim() || user.name || null,
          bio: data.description || null,
          personalLogo: data.logo || null,
          city: data.city || null,
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          categoryId,
          subcategoryId,
          isPublicOnGateway: data.isPublicOnGateway,
          status: 'PENDING',
        },
      });

      // Also keep a minimal Business record for backwards compatibility with
      // dashboards and admin flows that still rely on the Business model.
      const slug = `business-${session.user.id}`;
      await prisma.business.upsert({
        where: { userId: session.user.id },
        update: {
          name: businessName,
          description: data.description,
          logo: data.logo,
          city: data.city,
          phone: data.phone,
          email: data.email,
          website: data.website,
          businessType: 'INDIVIDUAL',
          specializations: data.specializations.length ? JSON.stringify(data.specializations) : null,
          workExperience: data.workExperience.length ? JSON.stringify(data.workExperience) : null,
          familyInfo: data.familyInfo ? JSON.stringify(data.familyInfo) : null,
          isPublicOnGateway: data.isPublicOnGateway,
          status: 'PENDING',
        },
        create: {
          userId: session.user.id,
          name: businessName,
          slug,
          description: data.description,
          logo: data.logo,
          city: data.city,
          phone: data.phone,
          email: data.email,
          website: data.website,
          businessType: 'INDIVIDUAL',
          specializations: data.specializations.length ? JSON.stringify(data.specializations) : null,
          workExperience: data.workExperience.length ? JSON.stringify(data.workExperience) : null,
          familyInfo: data.familyInfo ? JSON.stringify(data.familyInfo) : null,
          isPublicOnGateway: data.isPublicOnGateway,
          status: 'PENDING',
        },
      });
    } else {
      // COMPANY: create a traditional Business record.
      const slug = `business-${session.user.id}`;
      await prisma.business.upsert({
        where: { userId: session.user.id },
        update: {
          name: businessName,
          description: data.description,
          logo: data.logo,
          city: data.city,
          phone: data.phone,
          email: data.email,
          website: data.website,
          businessType: 'COMPANY',
          specializations: data.specializations.length ? JSON.stringify(data.specializations) : null,
          workExperience: data.workExperience.length ? JSON.stringify(data.workExperience) : null,
          familyInfo: data.familyInfo ? JSON.stringify(data.familyInfo) : null,
          isPublicOnGateway: data.isPublicOnGateway,
          status: 'PENDING',
        },
        create: {
          userId: session.user.id,
          name: businessName,
          slug,
          description: data.description,
          logo: data.logo,
          city: data.city,
          phone: data.phone,
          email: data.email,
          website: data.website,
          businessType: 'COMPANY',
          specializations: data.specializations.length ? JSON.stringify(data.specializations) : null,
          workExperience: data.workExperience.length ? JSON.stringify(data.workExperience) : null,
          familyInfo: data.familyInfo ? JSON.stringify(data.familyInfo) : null,
          isPublicOnGateway: data.isPublicOnGateway,
          status: 'PENDING',
        },
      });
    }

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { accountType: derivedAccountType },
      }),
      prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          type: NotificationType.SYSTEM,
          isRead: false,
          title: { contains: 'طوّر حسابك' },
        },
        data: { isRead: true },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: NotificationType.SYSTEM,
        title: 'تم استلام طلب الترقية',
        body: 'تم استلام طلب ترقية حسابك وهو قيد المراجعة الآن.',
        data: JSON.stringify({ businessId: business?.id, link: '/business-dashboard' }),
      },
    });

    return NextResponse.json({ success: true, business });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('POST /api/users/upgrade Zod errors:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/users/upgrade error:', error);
    return NextResponse.json(
      { error: 'فشل في معالجة الطلب' },
      { status: 500 }
    );
  }
}
