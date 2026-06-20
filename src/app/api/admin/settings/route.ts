import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { serverError, success } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';
import { logAdminAction, getRequestMeta } from '@/lib/admin-audit';

const settingsSchema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  siteDescription: z.string().max(500).optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  showAds: z.boolean().optional(),
  contactEmail: z.string().email().optional().nullable(),
  supportPhone: z.string().optional().nullable(),
});

// GET /api/admin/settings
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    let settings = await prisma.setting.findFirst();
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          siteName: 'Gateo',
          siteDescription: 'منصة تواصل واعمال للنساء',
          maintenanceMode: false,
          allowRegistration: true,
          showAds: false,
        },
      });
    }
    return NextResponse.json({ settings });
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);

    let settings = await prisma.setting.findFirst();
    if (!settings) {
      settings = await prisma.setting.create({ data: { ...data, siteName: data.siteName || 'Gateo' } });
    } else {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data,
      });
    }

    await logAdminAction({
      adminId: adminCheck.user.id,
      action: 'SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: settings.id,
      metadata: data,
      ...getRequestMeta(req),
    });

    return success({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'بيانات غير صحيحة' }, { status: 400 });
    }
    return serverError(error);
  }
}
