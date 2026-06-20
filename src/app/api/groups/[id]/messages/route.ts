import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'LOCATION', 'FILE']).default('TEXT'),
  mediaUrl: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  replyToId: z.string().cuid().optional(),
  mentions: z.array(z.object({ userId: z.string(), name: z.string(), position: z.number() })).optional(),
});

async function isGroupMember(groupId: string, userId: string) {
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return !!member;
}

// GET /api/groups/[id]/messages - List group messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id: groupId } = await params;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
  }

  // Public groups: anyone can read. Private: members only.
  if (!group.isPublic && !(await isGroupMember(groupId, user.id))) {
    return NextResponse.json({ error: 'يجب الانضمام للمجموعة أولاً' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '30');
  const skip = (page - 1) * limit;

  try {
    const messages = await prisma.groupMessage.findMany({
      where: { groupId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        User: { select: { id: true, name: true, avatar: true } },
      },
    });

    const total = await prisma.groupMessage.count({
      where: { groupId, isDeleted: false },
    });

    return NextResponse.json({
      messages: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/groups/[id]/messages - Send a message
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }
  const { id: groupId } = await params;

  if (!(await isGroupMember(groupId, user.id))) {
    return NextResponse.json({ error: 'يجب الانضمام للمجموعة أولاً' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    if (!data.content && !data.mediaUrl && data.type !== 'LOCATION') {
      return badRequest('يجب إرسال محتوى أو ملف');
    }

    const message = await prisma.groupMessage.create({
      data: {
        content: data.content,
        type: data.type,
        mediaUrl: data.mediaUrl,
        lat: data.lat,
        lng: data.lng,
        replyToId: data.replyToId,
        mentions: data.mentions ? JSON.stringify(data.mentions) : undefined,
        groupId,
        senderId: user.id,
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create notifications for mentioned users
    if (data.mentions && data.mentions.length > 0) {
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      for (const mention of data.mentions) {
        await prisma.notification.create({
          data: {
            userId: mention.userId,
            type: 'MESSAGE',
            title: 'إشارة في محادثة مجموعة',
            body: `${user.name || 'مستخدم'} أشار إليك في "${group?.name || 'مجموعة'}"`,
            data: JSON.stringify({ groupId, messageId: message.id, link: `/groups/${groupId}` }),
          },
        });
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'بيانات غير صالحة', details: error.issues }, { status: 400 });
    }
    return serverError(error);
  }
}
