import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, serverError } from '@/lib/api-utils';
import { prisma } from '@/lib/db';

// Haversine distance in km
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

interface ScoredCandidate {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  score: number;
  matchPercent: number;
  reasons: string[];
  mutualFriends: number;
  commonInterests: string[];
  postsCount: number;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // 1. Get current user with full profile & following list
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        Profile: true,
        follows_follows_followingIdTousers: { select: { followerId: true } },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const followingIds = currentUser.follows_follows_followingIdTousers.map((f) => f.followerId);
    followingIds.push(currentUser.id); // exclude self

    // 2. Fetch candidate users (not already following, have a profile)
    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: followingIds },
        accountType: { in: ['USER', 'PROFESSIONAL'] },
        Profile: { isNot: null },
      },
      include: {
        Profile: true,
        follows_follows_followerIdTousers: { select: { followingId: true } },
        Post: { select: { id: true, createdAt: true } },
      },
      take: 200,
    });

    const currentFollowerIds = new Set(
      (await prisma.follow.findMany({
        where: { followingId: currentUser.id },
        select: { followerId: true },
      })).map((f) => f.followerId)
    );

    const currentInterests = currentUser.Profile?.interests
      ? currentUser.Profile.interests
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const scored: ScoredCandidate[] = candidates.map((candidate) => {
      let score = 0;
      const reasons: string[] = [];
      const commonInterests: string[] = [];

      const cp = candidate.Profile;
      const up = currentUser.Profile;

      // Location (max 30)
      if (up?.city && cp?.city && up.city.trim() === cp.city.trim()) {
        score += 30;
        reasons.push('نفس المدينة');
      } else if (up?.country && cp?.country && up.country.trim() === cp.country.trim()) {
        score += 20;
        reasons.push('نفس الدولة');
      }

      // Geo proximity via lat/lng (max 25)
      if (
        up?.lat != null &&
        up?.lng != null &&
        cp?.lat != null &&
        cp?.lng != null &&
        up.locationSharing &&
        cp.locationSharing
      ) {
        const dist = haversineDistance(up.lat, up.lng, cp.lat, cp.lng);
        if (dist < 5) {
          score += 25;
          reasons.push('قريب جداً منك');
        } else if (dist < 20) {
          score += 20;
          reasons.push('قريب منك');
        } else if (dist < 50) {
          score += 12;
        } else if (dist < 100) {
          score += 6;
        }
      }

      // Age (max 25)
      if (up?.birthDate && cp?.birthDate) {
        const ageDiff = Math.abs(getAge(up.birthDate) - getAge(cp.birthDate));
        if (ageDiff <= 3) {
          score += 25;
          reasons.push('عمر متقارب');
        } else if (ageDiff <= 7) {
          score += 15;
        } else if (ageDiff <= 12) {
          score += 10;
        } else {
          score += 3;
        }
      }

      // Interests (max 25)
      if (currentInterests.length > 0 && cp?.interests) {
        const candInterests = cp.interests
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        for (const interest of currentInterests) {
          if (candInterests.includes(interest)) {
            commonInterests.push(interest);
          }
        }
        const interestScore = Math.min(commonInterests.length * 10, 25);
        score += interestScore;
        if (commonInterests.length > 0) {
          reasons.push(`${commonInterests.length} اهتمام مشترك`);
        }
      }

      // Mutual friends (max 20)
      const candFollowerIds = new Set(candidate.follows_follows_followerIdTousers.map((f) => f.followingId));
      let mutualFriends = 0;
      for (const id of currentFollowerIds) {
        if (candFollowerIds.has(id)) mutualFriends++;
      }
      // Also check if current user follows anyone who follows candidate
      for (const id of followingIds) {
        if (candFollowerIds.has(id) && id !== currentUser.id) mutualFriends++;
      }
      const mutualScore = Math.min(mutualFriends * 8, 20);
      score += mutualScore;
      if (mutualFriends > 0) {
        reasons.push(`${mutualFriends} صديق مشترك`);
      }

      // Activity (max 10)
      const postCount = candidate.Post.length;
      if (postCount > 5) score += 5;
      if (postCount > 0) score += 5;
      else score += 2;

      // Same gender small bonus
      if (up?.gender && cp?.gender && up.gender === cp.gender) {
        score += 3;
      }

      const matchPercent = Math.min(Math.round((score / 100) * 100), 100);

      return {
        id: candidate.id,
        name: candidate.name,
        avatar: candidate.avatar,
        bio: cp?.bio || null,
        city: cp?.city || null,
        country: cp?.country || null,
        gender: cp?.gender || null,
        score,
        matchPercent,
        reasons,
        mutualFriends,
        commonInterests,
        postsCount: postCount,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const filtered = scored.filter((s) => s.score >= 5);

    return NextResponse.json({
      suggestions: filtered.slice(0, limit),
      total: filtered.length,
    });
  } catch (error) {
    return serverError(error);
  }
}
