import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, badRequest, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

// GET /api/search/suggestions - Autocomplete suggestions
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const type = searchParams.get('type') || 'all'; // all | users | businesses | groups | hashtags
  const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20);

  if (!q || q.length < 1) {
    return badRequest('يجب إدخال مصطلح البحث');
  }

  try {
    const suggestions: any[] = [];

    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          accountType: { in: ['USER', 'PROFESSIONAL'] },
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      });
      suggestions.push(
        ...users.map((u) => ({ type: 'user', id: u.id, title: u.name, image: u.avatar }))
      );
    }

    if (type === 'all' || type === 'businesses') {
      const businesses = await prisma.business.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: q } },
            { city: { contains: q } },
          ],
        },
        orderBy: { avgRating: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          logo: true,
          city: true,
        },
      });
      suggestions.push(
        ...businesses.map((b) => ({
          type: 'business',
          id: b.id,
          title: b.name,
          image: b.logo,
          subtitle: b.city,
        }))
      );
    }

    if (type === 'all' || type === 'groups') {
      const groups = await prisma.group.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: q } },
            { category: { contains: q } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          image: true,
          category: true,
        },
      });
      suggestions.push(
        ...groups.map((g) => ({
          type: 'group',
          id: g.id,
          title: g.name,
          image: g.image,
          subtitle: g.category,
        }))
      );
    }

    if (type === 'all' || type === 'hashtags') {
      const posts = await prisma.post.findMany({
        where: {
          isPublic: true,
          hashtags: { contains: q },
        },
        select: { hashtags: true },
        take: 100,
      });

      const hashtagCounts: Record<string, number> = {};
      posts.forEach((post) => {
        const tags = (post.hashtags || '').split(/[,\s]+/).filter(Boolean);
        tags.forEach((tag) => {
          const normalized = tag.toLowerCase();
          if (normalized.includes(q.toLowerCase())) {
            hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
          }
        });
      });

      const topHashtags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      suggestions.push(
        ...topHashtags.map(([tag, count]) => ({
          type: 'hashtag',
          id: tag,
          title: tag,
          count,
        }))
      );
    }

    return NextResponse.json({ query: q, suggestions });
  } catch (error) {
    return serverError(error);
  }
}
