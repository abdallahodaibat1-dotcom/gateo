import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { users_accountType as AccountType, NotificationType, Prisma } from '@prisma/client';

const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);
const commaSeparatedToArray = (val: unknown) =>
  typeof val === 'string' && val.trim() ? val.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  startingPrice: z.number().min(0).optional(),
  duration: z.string().max(100).optional(),
});

const portfolioProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  images: z.array(z.string().min(1)).default([]),
  videos: z.array(z.string().min(1)).default([]),
  files: z.array(z.string().min(1)).default([]),
});

const socialLinksSchema = z.record(z.string(), z.string().min(1)).optional();

const applySchema = z.object({
  // Basic
  title: z.preprocess(emptyToUndefined, z.string().max(150).optional()),
  bio: z.preprocess(emptyToUndefined, z.string().max(3000).optional()),
  personalLogo: z.preprocess(emptyToUndefined, z.string().url().optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  subcategoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  skills: z.preprocess(commaSeparatedToArray, z.array(z.string().min(1)).optional()),
  keywords: z.preprocess(commaSeparatedToArray, z.array(z.string().min(1)).optional()),

  // Qualifications
  degree: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  academicSpecialization: z.preprocess(emptyToUndefined, z.string().max(200).optional()),
  experienceYears: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0).optional()
  ),
  courses: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  certifications: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  professionalAccreditations: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),

  // Services
  services: z.array(serviceSchema).default([]),

  // Location & availability
  workScope: z.enum(['IN_PERSON', 'REMOTE', 'BOTH']).default('BOTH'),
  countryId: z.preprocess(emptyToUndefined, z.string().optional()),
  city: z.preprocess(emptyToUndefined, z.string().max(100).optional()),
  willingToTravel: z.boolean().default(false),
  languages: z.preprocess(commaSeparatedToArray, z.array(z.string().min(1)).optional()),

  // Contact
  phone: z.preprocess(emptyToUndefined, z.string().max(30).optional()),
  whatsapp: z.preprocess(emptyToUndefined, z.string().max(30).optional()),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  website: z.preprocess(emptyToUndefined, z.string().url().optional()),
  socialLinks: socialLinksSchema,

  // Portfolio
  portfolioProjects: z.array(portfolioProjectSchema).default([]),

  // Advanced options
  availableForWork: z.boolean().default(true),
  availableForHiring: z.boolean().default(false),
  availableForFreelance: z.boolean().default(true),
  availableForConsultation: z.boolean().default(true),
  completedProjectsCount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0).optional()
  ),
  clientsCount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().int().min(0).optional()
  ),

  isPublicOnGateway: z.boolean().default(true),

  fieldValues: z.record(z.string(), z.string().nullable()).optional(),
});

async function saveProfessionalFieldValues(
  profileId: string,
  categoryId: string | undefined,
  fieldValues: Record<string, string | undefined | null> | undefined
) {
  if (!fieldValues || !categoryId) return;

  const definitions = await prisma.dynamicFieldDefinition.findMany({
    where: {
      isActive: true,
      OR: [{ categoryId }, { categoryId: null }],
      appliesTo: { in: ['PROFESSIONAL' as any, 'BOTH' as any] },
    },
  });

  const definitionMap = new Map(definitions.map((d) => [d.id, d]));
  const entries = Object.entries(fieldValues).filter(([fieldId, value]) => {
    const def = definitionMap.get(fieldId);
    if (!def) return false;
    if (def.isRequired && (!value || value === '')) return false;
    return value !== undefined && value !== null && value !== '';
  });

  await prisma.$transaction(
    entries.map(([fieldId, value]) =>
      prisma.professionalFieldValues.upsert({
        where: { profileId_fieldId: { profileId, fieldId } },
        update: { value },
        create: { profileId, fieldId, value },
      })
    )
  );
}

// GET /api/professionals/apply - load existing professional profile for editing
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Category: { select: { id: true, name: true, slug: true } },
        Subcategory: { select: { id: true, name: true, slug: true } },
        Country: { select: { id: true, name: true, flagEmoji: true } },
        ProfessionalFieldValues: { include: { DynamicFieldDefinition: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        skills: profile.skills ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        keywords: profile.keywords ? profile.keywords.split(',').map((s) => s.trim()).filter(Boolean) : [],
        languages: profile.languages ? profile.languages.split(',').map((s) => s.trim()).filter(Boolean) : [],
        fieldValues: Object.fromEntries(
          profile.ProfessionalFieldValues.map((fv) => [fv.fieldId, fv.value])
        ),
      },
    });
  } catch (error) {
    console.error('GET /api/professionals/apply error:', error);
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
  }
}

// POST /api/professionals/apply - create or update professional profile
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = applySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountType: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const profileData = {
      title: data.title,
      bio: data.bio,
      personalLogo: data.personalLogo,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      skills: data.skills?.join(', ') || null,
      keywords: data.keywords?.join(', ') || null,
      degree: data.degree,
      academicSpecialization: data.academicSpecialization,
      experienceYears: data.experienceYears,
      courses: data.courses,
      certifications: data.certifications,
      professionalAccreditations: data.professionalAccreditations,
      services: data.services.length ? JSON.stringify(data.services) : null,
      workScope: data.workScope,
      countryId: data.countryId,
      city: data.city,
      willingToTravel: data.willingToTravel,
      languages: data.languages?.join(', ') || null,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      website: data.website,
      socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
      portfolioProjects: data.portfolioProjects.length ? JSON.stringify(data.portfolioProjects) : null,
      availableForWork: data.availableForWork,
      availableForHiring: data.availableForHiring,
      availableForFreelance: data.availableForFreelance,
      availableForConsultation: data.availableForConsultation,
      completedProjectsCount: data.completedProjectsCount ?? 0,
      clientsCount: data.clientsCount ?? 0,
      isPublicOnGateway: data.isPublicOnGateway,
      status: 'PENDING' as const,
    };

    const profile = await prisma.professionalProfile.upsert({
      where: { userId: session.user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: session.user.id,
      },
    });

    await saveProfessionalFieldValues(profile.id, data.categoryId, data.fieldValues);

    // Upgrade user account type to PROFESSIONAL if still a regular USER
    const accountTypeUpdate =
      user.accountType === 'USER' ? { accountType: AccountType.PROFESSIONAL } : {};

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: accountTypeUpdate,
      }),
      prisma.notification.create({
        data: {
          userId: session.user.id,
          type: NotificationType.SYSTEM,
          title: 'تم استلام ملفك المهني',
          body: 'تم استلام طلب إدراجك في دليل المحترفين وهو قيد المراجعة الآن.',
          data: JSON.stringify({ professionalProfileId: profile.id, link: `/professional/${profile.id}` }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.issues);
      return NextResponse.json(
        {
          error: 'بيانات غير صالحة',
          details: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }
    console.error('POST /api/professionals/apply error:', error);
    return NextResponse.json({ error: 'فشل في حفظ الملف المهني' }, { status: 500 });
  }
}
