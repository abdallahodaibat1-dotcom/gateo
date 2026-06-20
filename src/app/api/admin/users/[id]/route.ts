import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';
import { logAdminAction, getRequestMeta } from '@/lib/admin-audit';

// GET /api/admin/users/[id] - Get user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        username: true,
        avatar: true,
        role: true,
        accountType: true,
        isPrivate: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        Profile: true,
        Business: {
          include: {
            Category: { select: { id: true, name: true } },
            _count: { select: { Service: true, Review: true, Booking: true } },
          },
        },
        _count: {
          select: {
            Post: true,
            Comment: true,
            Like: true,
            follows_follows_followerIdTousers: true,
            follows_follows_followingIdTousers: true,
            Booking: true,
            Review: true,
            GroupMember: true,
            Story: true,
            reports_reports_reporterIdTousers: true,
            reports_reports_reportedIdTousers: true,
          },
        },
      },
    });

    if (!user) return notFound('User not found');

    return NextResponse.json({ user });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, accountType } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound('User not found');

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(role !== undefined && { role }),
        ...(accountType !== undefined && { accountType }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        accountType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logAdminAction({
      adminId: adminCheck.user.id,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      metadata: { name, email, phone, role, accountType },
      ...getRequestMeta(req),
    });

    return NextResponse.json({ user });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return notFound('User not found');

    await prisma.user.delete({ where: { id } });

    await logAdminAction({
      adminId: adminCheck.user.id,
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: id,
      metadata: { email: existing.email, name: existing.name, role: existing.role },
      ...getRequestMeta(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
