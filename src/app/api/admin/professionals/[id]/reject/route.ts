import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { logAdminAction, getRequestMeta } from '@/lib/admin-audit';
import { NotificationType } from '@prisma/client';

// PUT /api/admin/professionals/[id]/reject - Reject a professional application with reason
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
      return badRequest('يجب تقديم سبب الرفض (3 أحرف على الأقل)');
    }

    const existing = await prisma.professionalProfile.findUnique({
      where: { id },
      include: { User: { select: { id: true, name: true, email: true } } },
    });
    if (!existing) return notFound('Professional profile not found');

    const professional = await prisma.professionalProfile.update({
      where: { id },
      data: {
        status: 'REJECTED',
        isVerified: false,
        isPublicOnGateway: false,
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Category: { select: { id: true, name: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: professional.userId,
        type: NotificationType.SYSTEM,
        title: 'تم رفض طلب اعتماد ملفك المهني',
        body: `السبب: ${reason.trim()}`,
        data: JSON.stringify({ professionalProfileId: id, status: 'REJECTED', reason, link: `/professional/${id}` }),
      },
    });

    await logAdminAction({
      adminId: adminCheck.user.id,
      action: 'PROFESSIONAL_REJECTED',
      entityType: 'PROFESSIONAL_PROFILE',
      entityId: id,
      metadata: { name: professional.User.name, title: professional.title, reason },
      ...getRequestMeta(req),
    });

    return NextResponse.json({ professional });
  } catch (error) {
    return serverError(error);
  }
}
