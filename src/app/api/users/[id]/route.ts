import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';

function calculateCompletionPercent(profile: Record<string, unknown> | null) {
  const weights = [
    { field: 'bio', weight: 20, value: profile?.bio },
    { field: 'city', weight: 15, value: profile?.city },
    { field: 'country', weight: 15, value: profile?.country || profile?.countryId },
    { field: 'birthDate', weight: 10, value: profile?.birthDate },
    { field: 'gender', weight: 15, value: profile?.gender },
    { field: 'interests', weight: 15, value: profile?.interests },
    { field: 'website', weight: 10, value: profile?.website },
  ];
  return weights.reduce((sum, item) => sum + (item.value ? item.weight : 0), 0);
}

// GET /api/users/[id] - Get public user profile
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        role: true,
        accountType: true,
        isPrivate: true,
        createdAt: true,
        Profile: {
          select: {
            bio: true,
            city: true,
            country: true,
            countryId: true,
            interests: true,
            website: true,
            gender: true,
            birthDate: true,
            skills: true,
          },
        },
        Business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            status: true,
            isVerified: true,
          },
        },
        ProfessionalProfile: {
          include: {
            Category: { select: { id: true, name: true, slug: true } },
            Subcategory: { select: { id: true, name: true, slug: true } },
            Country: { select: { id: true, name: true, flagEmoji: true } },
            ProfessionalFieldValues: { include: { DynamicFieldDefinition: true } },
          },
        },
        _count: {
          select: {
            Post: true,
            follows_follows_followingIdTousers: true,
            follows_follows_followerIdTousers: true,
          },
        },
      },
    });

    if (!user) return notFound('المستخدم غير موجود');

    const isFollowing = session?.user?.id
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: id,
            },
          },
        })
      : null;

    const normalizedUser: any = { ...user };
    normalizedUser.profile = user.Profile || null;
    normalizedUser.business = user.Business || null;
    delete normalizedUser.Profile;
    delete normalizedUser.Business;
    delete normalizedUser.ProfessionalProfile;
    normalizedUser._count = {
      posts: user._count?.Post || 0,
      followers: user._count?.follows_follows_followingIdTousers || 0,
      following: user._count?.follows_follows_followerIdTousers || 0,
    };

    if (user?.ProfessionalProfile) {
      const prof = user.ProfessionalProfile as any;
      normalizedUser.professionalProfile = {
        ...prof,
        category: prof.Category,
        subcategory: prof.Subcategory,
        country: prof.Country,
        fieldValues: prof.ProfessionalFieldValues?.map((fv: any) => ({
          field: fv.DynamicFieldDefinition,
          value: fv.value,
        })),
      };
    }

    return NextResponse.json(
      {
        ...normalizedUser,
        completionPercent: calculateCompletionPercent(normalizedUser.profile as Record<string, unknown> | null),
        isFollowing: !!isFollowing,
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    return serverError(error);
  }
}
