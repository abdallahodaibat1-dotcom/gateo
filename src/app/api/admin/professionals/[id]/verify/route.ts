import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { logAdminAction, getRequestMeta, AdminAction } from '@/lib/admin-audit';
import { NotificationType } from '@prisma/client';

// PATCH /api/admin/professionals/[id]/verify - Verify, reject or suspend a professional profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { isVerified, status, reason } = body;

    const existing = await prisma.professionalProfile.findUnique({
      where: { id },
      include: { User: { select: { id: true, name: true, email: true } } },
    });
    if (!existing) return notFound('Professional profile not found');

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (status !== undefined) {
      if (!['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
        return badRequest('Invalid status');
      }
      updateData.status = status;
      // Auto-manage public listing based on status
      if (status === 'ACTIVE') {
        updateData.isPublicOnGateway = true;
      } else if (status === 'REJECTED' || status === 'SUSPENDED') {
        updateData.isPublicOnGateway = false;
      }
    }

    const professional = await prisma.professionalProfile.update({
      where: { id },
      data: updateData,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Category: { select: { id: true, name: true } },
      },
    });

    // Notify the professional
    const statusLabels: Record<string, string> = {
      ACTIVE: 'تم اعتماد ملفك المهني',
      REJECTED: 'تم رفض طلب اعتماد ملفك المهني',
      SUSPENDED: 'تم تعليق ملفك المهني',
      PENDING: 'تحديث حالة ملفك المهني',
    };

    await prisma.notification.create({
      data: {
        userId: professional.userId,
        type: NotificationType.SYSTEM,
        title: statusLabels[professional.status] || statusLabels.PENDING,
        body: reason
          ? `السبب: ${reason}`
          : 'تم تحديث حالة ملفك المهني. يمكنك مراجعة لوحة التحكم للتفاصيل.',
        data: JSON.stringify({ professionalProfileId: id, status: professional.status, link: `/professional/${id}` }),
      },
    });

    // Audit log
    const actionMap: Record<string, AdminAction> = {
      ACTIVE: 'PROFESSIONAL_APPROVED',
      REJECTED: 'PROFESSIONAL_REJECTED',
      SUSPENDED: 'PROFESSIONAL_SUSPENDED',
    };
    const action = actionMap[professional.status] || 'PROFESSIONAL_UPDATED';
    await logAdminAction({
      adminId: adminCheck.user.id,
      action,
      entityType: 'PROFESSIONAL_PROFILE',
      entityId: id,
      metadata: { name: professional.User.name, title: professional.title, status, isVerified, reason },
      ...getRequestMeta(req),
    });

    return NextResponse.json({ professional });
  } catch (error) {
    return serverError(error);
  }
}
