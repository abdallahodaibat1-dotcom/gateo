import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const applySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  countryId: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  latitude: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.number().optional()
  ),
  phone: z.string().optional(),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email().optional()
  ),
  website: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url().optional()
  ),
  logo: z.string().min(1).optional(),
  cover: z.string().min(1).optional(),
  businessType: z.enum(['INDIVIDUAL', 'COMPANY']).optional(),
  websiteType: z.enum(['INTRO', 'STORE']).optional(),
  images: z.array(z.object({
    url: z.string().min(1),
    type: z.string().optional(),
    caption: z.string().optional(),
  })).optional(),
  workingHours: z.array(z.object({
    day: z.string(),
    open: z.string(),
    close: z.string(),
  })).optional(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string().min(1),
  })).optional(),
  services: z.array(z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    price: z.number().optional(),
    duration: z.number().int().optional(),
    image: z.string().min(1).optional(),
  })).optional(),
  fieldValues: z.record(z.string(), z.string().nullable()).optional(),
});

// POST /api/businesses/apply - Submit business application
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Log incoming data for debugging
    console.log('Business apply body:', JSON.stringify(body, null, 2));
    
    const data = applySchema.parse(body);

    // Check if user already has a business
    const existing = await prisma.business.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      // Update existing business with new data
      const { services: _services, ...businessData } = data;
      
      // Check slug uniqueness only if slug changed
      if (data.slug !== existing.slug) {
        const slugExists = await prisma.business.findUnique({
          where: { slug: data.slug },
        });
        if (slugExists) {
          return NextResponse.json({ error: 'الرابط مستخدم من قبل' }, { status: 400 });
        }
      }
      
      const updated = await prisma.business.update({
        where: { id: existing.id },
        data: {
          ...businessData,
          status: 'PENDING',
          documents: data.documents ? JSON.stringify(data.documents) : null,
          workingHours: data.workingHours ? JSON.stringify(data.workingHours) : null,
          images: data.images ? JSON.stringify(data.images) : null,
        },
      });

      // Replace old services with new ones
      await prisma.service.deleteMany({ where: { businessId: existing.id } });
      if (data.services && data.services.length > 0) {
        await prisma.service.createMany({
          data: data.services.map((s) => ({
            businessId: existing.id,
            name: s.name,
            description: s.description || null,
            price: s.price ?? null,
            duration: s.duration || null,
            image: s.image || null,
            isActive: true,
          })),
        });
      }

      // Save dynamic field values
      await saveBusinessFieldValues(existing.id, data.categoryId, data.fieldValues);

      return NextResponse.json({ business: updated, updated: true }, { status: 200 });
    }

    // Check slug uniqueness for new business
    const slugExists = await prisma.business.findUnique({
      where: { slug: data.slug },
    });
    if (slugExists) {
      return NextResponse.json({ error: 'الرابط مستخدم من قبل' }, { status: 400 });
    }

    const { services: _services, ...businessData } = data;
    const business = await prisma.business.create({
      data: {
        ...businessData,
        userId: session.user.id,
        status: 'PENDING',
        documents: data.documents ? JSON.stringify(data.documents) : null,
        workingHours: data.workingHours ? JSON.stringify(data.workingHours) : null,
        images: data.images ? JSON.stringify(data.images) : null,
      },
    });

    // Create services if provided
    if (data.services && data.services.length > 0) {
      await prisma.service.createMany({
        data: data.services.map((s) => ({
          businessId: business.id,
          name: s.name,
          description: s.description || null,
          price: s.price ?? null,
          duration: s.duration || null,
          image: s.image || null,
          isActive: true,
        })),
      });
    }

    // Save dynamic field values
    await saveBusinessFieldValues(business.id, data.categoryId, data.fieldValues);

    // Update user account type based on business type
    const derivedAccountType = data.businessType === 'INDIVIDUAL' ? 'PROFESSIONAL' : 'COMPANY';
    await prisma.user.update({
      where: { id: session.user.id },
      data: { accountType: derivedAccountType },
    });

    return NextResponse.json({ business }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.issues);
      return NextResponse.json(
        { 
          error: 'بيانات غير صالحة', 
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          }))
        },
        { status: 400 }
      );
    }
    console.error('POST /api/businesses/apply error:', error);
    return NextResponse.json({ error: 'فشل في تقديم الطلب' }, { status: 500 });
  }
}

async function saveBusinessFieldValues(
  businessId: string,
  categoryId: string | undefined,
  fieldValues: Record<string, string | null | undefined> | undefined
) {
  if (!fieldValues || Object.keys(fieldValues).length === 0) return;

  const definitions = await prisma.dynamicFieldDefinition.findMany({
    where: {
      isActive: true,
      appliesTo: { in: ['BUSINESS', 'BOTH'] },
      OR: [
        { categoryId: categoryId || null },
        { categoryId: null },
      ],
    },
  });

  const validFieldIds = new Set(definitions.map((d) => d.id));

  await prisma.$transaction(
    Object.entries(fieldValues)
      .filter(([fieldId]) => validFieldIds.has(fieldId))
      .map(([fieldId, value]) =>
        prisma.businessFieldValue.upsert({
          where: { businessId_fieldId: { businessId, fieldId } },
          create: { businessId, fieldId, value: value || null },
          update: { value: value || null },
        })
      )
  );
}
