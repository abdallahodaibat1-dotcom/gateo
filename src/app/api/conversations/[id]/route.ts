import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, forbidden, notFound, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const updateConversationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable(),
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

// GET /api/conversations/[id] - Get single conversation
export async function GET(
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
      include: {
        ConversationParticipant: {
          include: {
            User: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        Message: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            type: true,
            mediaUrl: true,
            createdAt: true,
            senderId: true,
            isDeleted: true,
          },
        },
        _count: {
          select: { Message: true },
        },
      },
    });

    if (!conversation) {
      return notFound('المحادثة غير موجودة');
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('GET /api/conversations/[id] error:', error);
    return serverError(error);
  }
}

// PUT /api/conversations/[id] - Update group conversation
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { ConversationParticipant: true },
    });

    if (!conversation) {
      return notFound('المحادثة غير موجودة');
    }

    const participant = await getConversationParticipant(id, userId);
    if (!participant) {
      return forbidden();
    }

    if (!conversation.isGroup) {
      return forbidden();
    }

    const body = await req.json();
    const data = updateConversationSchema.parse(body);

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
      },
      include: {
        ConversationParticipant: {
          include: {
            User: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('PUT /api/conversations/[id] error:', error);
    return serverError(error);
  }
}

// DELETE /api/conversations/[id] - Leave or delete conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { ConversationParticipant: true },
    });

    if (!conversation) {
      return notFound('المحادثة غير موجودة');
    }

    const participant = await getConversationParticipant(id, userId);
    if (!participant) {
      return forbidden();
    }

    if (conversation.isGroup) {
      // For groups, just remove the participant
      await prisma.conversationParticipant.delete({
        where: { id: participant.id },
      });

      // If no participants left, delete the group
      const remainingCount = await prisma.conversationParticipant.count({
        where: { conversationId: id },
      });
      if (remainingCount === 0) {
        await prisma.conversation.delete({ where: { id } });
      }
    } else {
      // For direct conversations, delete the whole conversation
      await prisma.conversation.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/conversations/[id] error:', error);
    return serverError(error);
  }
}
