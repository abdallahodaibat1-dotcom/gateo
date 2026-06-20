import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createStorySchema = z.object({
  mediaUrl: z.string().url(),
  type: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
});

// GET /api/stories - Get active stories (last 24h)
export async function GET(req: NextRequest) {
  const session = await auth();
  const now = new Date();

  try {
    // Get stories from followed users + own stories that haven't expired
    let where: any = {
      expiresAt: { gt: now },
    };

    if (session?.user?.id) {
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);

      where = {
        expiresAt: { gt: now },
        userId: { in: [...followingIds, session.user.id] },
      };
    }

    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Group stories by user
    const grouped = stories.reduce((acc: any, story: any) => {
      const userId = story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.User,
          stories: [],
          hasUnviewed: false,
        };
      }
      let viewedBy: string[] = [];
      if (story.viewedBy) {
        try {
          viewedBy = JSON.parse(story.viewedBy);
          if (!Array.isArray(viewedBy)) viewedBy = [];
        } catch {
          viewedBy = [];
        }
      }
      const isViewed = session?.user?.id ? viewedBy.includes(session.user.id) : false;
      acc[userId].stories.push({
        ...story,
        isViewed,
      });
      if (!isViewed) {
        acc[userId].hasUnviewed = true;
      }
      return acc;
    }, {});

    return NextResponse.json({ stories: Object.values(grouped) });
  } catch (error) {
    console.error('GET /api/stories error:', error);
    return NextResponse.json({ error: 'فشل في جلب القصص' }, { status: 500 });
  }
}

// POST /api/stories - Create story
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createStorySchema.parse(body);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const story = await prisma.story.create({
      data: {
        mediaUrl: data.mediaUrl,
        type: data.type,
        userId: session.user.id,
        expiresAt,
      },
      include: {
        User: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      );
    }
    console.error('POST /api/stories error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء القصة' }, { status: 500 });
  }
}
