import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { unauthorized, forbidden, badRequest, notFound, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'LOCATION', 'FILE']).default('TEXT'),
  mediaUrl: z.string().url().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  replyToId: z.string().cuid().optional(),
});

async function getConversationParticipant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
}

// GET /api/conversations/[id]/messages - List messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '30');
  const skip = (page - 1) * limit;

  try {
    const participant = await getConversationParticipant(id, userId);
    if (!participant) {
      return forbidden();
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });
    if (!conversation) {
      return notFound('المحادثة غير موجودة');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const total = await prisma.message.count({
      where: { conversationId: id },
    });

    return NextResponse.json({
      messages: messages.reverse(), // Return oldest first
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/conversations/[id]/messages error:', error);
    return serverError(error);
  }
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const participant = await getConversationParticipant(id, userId);
    if (!participant) {
      return forbidden();
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });
    if (!conversation) {
      return notFound('المحادثة غير موجودة');
    }

    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    if (!data.content && !data.mediaUrl && data.type !== 'LOCATION') {
      return badRequest('يجب إرسال محتوى أو ملف');
    }

    // Validate replyToId if provided
    if (data.replyToId) {
      const replyMessage = await prisma.message.findUnique({
        where: { id: data.replyToId },
      });
      if (!replyMessage || replyMessage.conversationId !== id) {
        return badRequest('الرسالة المقتبسة غير موجودة في هذه المحادثة');
      }
    }

    const message = await prisma.message.create({
      data: {
        content: data.content,
        type: data.type,
        mediaUrl: data.mediaUrl,
        lat: data.lat,
        lng: data.lng,
        replyToId: data.replyToId,
        conversationId: id,
        senderId: userId,
      },
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation updatedAt to bump it to top
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Notify other participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: { conversationId: id, userId: { not: userId } },
      select: { userId: true },
    });

    for (const participant of otherParticipants) {
      await createNotification({
        userId: participant.userId,
        type: 'MESSAGE',
        title: 'رسالة جديدة',
        body: 'وصلتك رسالة جديدة في محادثة',
        data: { actorId: userId, conversationId: id },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/conversations/[id]/messages error:', error);
    return serverError(error);
  }
}
