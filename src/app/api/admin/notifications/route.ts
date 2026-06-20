import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { requireAdmin } from '../_lib/utils';

const schema = z.object({
  userIds: z.array(z.string().min(1)).optional(),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional().nullable(),
  data: z.record(z.string(), z.unknown()).optional(),
  all: z.boolean().optional(),
});

// POST /api/admin/notifications - Send notifications to users (admin only)
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    if (!Object.values(NotificationType).includes(parsed.type as NotificationType)) {
      return NextResponse.json({ error: 'نوع الإشعار غير صالح' }, { status: 400 });
    }

    const type = parsed.type as NotificationType;

    let targetUserIds: string[];
    if (parsed.all) {
      const users = await prisma.user.findMany({ select: { id: true } });
      targetUserIds = users.map((u) => u.id);
    } else {
      if (!parsed.userIds || parsed.userIds.length === 0) {
        return NextResponse.json(
          { error: 'يجب تحديد مستخدمين أو اختيار الإرسال للجميع' },
          { status: 400 }
        );
      }
      targetUserIds = parsed.userIds;
    }

    let sent = 0;
    for (const userId of targetUserIds) {
      await createNotification({
        userId,
        type,
        title: parsed.title,
        body: parsed.body,
        data: parsed.data,
      });
      sent++;
    }

    return NextResponse.json({ sent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/admin/notifications error:', error);
    return NextResponse.json({ error: 'فشل في إرسال الإشعارات' }, { status: 500 });
  }
}
