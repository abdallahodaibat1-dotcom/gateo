import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { logAdminAction, getRequestMeta } from '@/lib/admin-audit';

// PATCH /api/admin/businesses/[id]/verify - Verify or reject a business
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { isVerified, status } = body;

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) return notFound('Business not found');

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (status !== undefined) {
      if (!['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
        return badRequest('Invalid status');
      }
      updateData.status = status;
    }

    const business = await prisma.business.update({
      where: { id },
      data: updateData,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Category: { select: { id: true, name: true } },
      },
    });

    // Create notification to business owner
    await prisma.notification.create({
      data: {
        userId: business.userId,
        type: 'SYSTEM',
        title: isVerified ? 'تم توثيق حسابك التجاري' : 'تحديث حالة الحساب التجاري',
        body: isVerified
          ? 'تم توثيق حسابك التجاري بنجاح.'
          : `تم تحديث حالة حسابك التجاري إلى: ${status || business.status}.`,
        data: JSON.stringify({ businessId: id, link: '/business-dashboard' }),
      },
    });

    // Audit log
    const action = status === 'ACTIVE' ? 'BUSINESS_APPROVED' : status === 'REJECTED' ? 'BUSINESS_REJECTED' : 'BUSINESS_UPDATED';
    await logAdminAction({
      adminId: adminCheck.user.id,
      action,
      entityType: 'BUSINESS',
      entityId: id,
      metadata: { name: business.name, status, isVerified },
      ...getRequestMeta(req),
    });

    return NextResponse.json({ business });
  } catch (error) {
    return serverError(error);
  }
}
