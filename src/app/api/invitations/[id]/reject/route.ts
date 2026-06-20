import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

// POST /api/invitations/[id]/reject
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id } = await params;

  try {
    const invitation = await prisma.groupInvitation.findFirst({
      where: { id, userId: user.id, status: 'PENDING' },
    });
    if (!invitation) {
      return NextResponse.json({ error: 'الدعوة غير موجودة أو تم معالجتها' }, { status: 404 });
    }

    await prisma.groupInvitation.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
