import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

// GET /api/invitations - List pending invitations for current user
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const invitations = await prisma.groupInvitation.findMany({
      where: { userId: user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        Group: {
          select: { id: true, name: true, image: true, isPublic: true, _count: { select: { GroupMember: true } } },
        },
        users_group_invitations_invitedByIdTousers: { select: { id: true, name: true, avatar: true } },
      },
    });
    return NextResponse.json({ invitations });
  } catch (error) {
    return serverError(error);
  }
}
