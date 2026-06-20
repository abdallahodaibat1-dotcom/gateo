import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../../_lib/utils';
import { logAdminAction, getRequestMeta } from '@/lib/admin-audit';

// PATCH /api/admin/users/[id]/role - Update user role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || !['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      return badRequest('Invalid role. Must be USER, ADMIN, or MODERATOR');
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound('User not found');

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAdminAction({
      adminId: adminCheck.user.id,
      action: role === 'ADMIN' ? 'USER_ACTIVATED' : role === 'MODERATOR' ? 'USER_UPDATED' : 'USER_SUSPENDED',
      entityType: 'USER',
      entityId: id,
      metadata: { newRole: role, previousRole: existing.role, email: user.email },
      ...getRequestMeta(req),
    });

    return NextResponse.json({ user });
  } catch (error) {
    return serverError(error);
  }
}
