import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { unauthorized, badRequest, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const createConversationSchema = z.object({
  participantIds: z.array(z.string().cuid()).min(1).max(50),
  isGroup: z.boolean().default(false),
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
});

// GET /api/conversations - List current user's conversations
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        ConversationParticipant: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
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

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.ConversationParticipant.find((p) => p.userId === userId);
        const lastReadAt = participant?.lastReadAt;

        const unreadCount = lastReadAt
          ? await prisma.message.count({
              where: {
                conversationId: conv.id,
                senderId: { not: userId },
                createdAt: { gt: lastReadAt },
              },
            })
          : await prisma.message.count({
              where: {
                conversationId: conv.id,
                senderId: { not: userId },
              },
            });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    const total = await prisma.conversation.count({
      where: {
        ConversationParticipant: {
          some: { userId },
        },
      },
    });

    return NextResponse.json({
      conversations: conversationsWithUnread,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return serverError(error);
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = createConversationSchema.parse(body);

    // Ensure creator is included in participants
    const allParticipantIds = Array.from(new Set([userId, ...data.participantIds]));

    if (allParticipantIds.length < 2) {
      return badRequest('يجب إضافة مشارك واحد على الأقل');
    }

    // For direct conversations (2 people), check if one already exists
    if (!data.isGroup && allParticipantIds.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          ConversationParticipant: {
            every: {
              userId: { in: allParticipantIds },
            },
          },
        },
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
          },
        },
      });

      if (existing) {
        // Verify it has exactly 2 participants (not a group with same subset)
        if (existing.ConversationParticipant.length === 2) {
          return NextResponse.json({ conversation: existing });
        }
      }
    }

    // Validate all participant users exist
    const users = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
      select: { id: true },
    });
    if (users.length !== allParticipantIds.length) {
      return badRequest('أحد المشاركن غير موجود');
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: data.isGroup || allParticipantIds.length > 2,
        name: data.name,
        image: data.image,
        ConversationParticipant: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
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

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/conversations error:', error);
    return serverError(error);
  }
}
