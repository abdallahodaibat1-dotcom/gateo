import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NotificationType } from '@prisma/client';

const PROMPT_TITLE = 'طوّر حسابك';
const PROMPT_BODY =
  'يمكنك ترقية حسابك إلى احترافي فردي أو شركة للظهور في بوابة الأعمال.';

// POST /api/notifications/prompt - Ensure the user has an upgrade prompt notification
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { accountType: true },
    });

    if (!user || user.accountType !== 'USER') {
      return NextResponse.json({ created: false });
    }

    const existing = await prisma.notification.findFirst({
      where: {
        userId: session.user.id,
        type: NotificationType.SYSTEM,
        isRead: false,
        title: { contains: PROMPT_TITLE },
      },
    });

    if (existing) {
      return NextResponse.json({ created: false });
    }

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: NotificationType.SYSTEM,
        title: PROMPT_TITLE,
        body: PROMPT_BODY,
        data: JSON.stringify({ link: '/users/upgrade' }),
      },
    });

    return NextResponse.json({ created: true });
  } catch (error) {
    console.error('POST /api/notifications/prompt error:', error);
    return NextResponse.json({ created: false }, { status: 500 });
  }
}
