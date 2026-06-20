import { NextRequest, NextResponse } from 'next/server';
import { unauthorized, notFound, serverError, badRequest, privateJson } from '@/lib/api-utils';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Prisma, NotificationType } from '@prisma/client';

function calculateCompletionPercent(user: any) {
  const profile = user?.Profile || user?.profile || null;
  const weights = [
    { field: 'avatar', weight: 15, value: user?.avatar },
    { field: 'bio', weight: 15, value: profile?.bio },
    { field: 'city', weight: 10, value: profile?.city },
    { field: 'country', weight: 10, value: profile?.country || profile?.countryId || profile?.countryRef?.id },
    { field: 'birthDate', weight: 10, value: profile?.birthDate },
    { field: 'gender', weight: 15, value: profile?.gender },
    { field: 'interests', weight: 15, value: profile?.interests },
    { field: 'website', weight: 10, value: profile?.website },
  ];
  return weights.reduce((sum, item) => sum + (item.value ? item.weight : 0), 0);
}

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/, 'اسم المستخدم يحتوي على أحرف غير مسموح بها').optional().nullable(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  countryId: z.string().optional().nullable(),
  interests: z.string().optional(),
  website: z.string().optional().nullable(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ الميلاد يجب أن يكون بالتنسيق YYYY-MM-DD').optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  avatar: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  education: z.record(z.string(), z.unknown()).optional().nullable(),
  experience: z.record(z.string(), z.unknown()).optional().nullable(),
  skills: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  locationSharing: z.boolean().optional().nullable(),
  isPrivate: z.boolean().optional().nullable(),
  notificationSettings: z.record(z.string(), z.boolean()).optional().nullable(),
  socialLinks: z.record(z.string(), z.string()).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
  onboardingSkipped: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  try {
    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        Profile: {
          include: {
            Country: { select: { id: true, name: true } },
          },
        },
        Business: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            Post: true,
            follows_follows_followerIdTousers: true,
            follows_follows_followingIdTousers: true,
          },
        },
      },
    });

    if (!profile) return notFound('المستخدم غير موجود');
    const { password: _p, ...safeProfile } = profile as Record<string, unknown> & { password?: string };

    // Normalize profile so the client receives a consistent country value even
    // when only countryId was stored (e.g. during registration).
    const rawProfile = safeProfile.Profile as Record<string, unknown> | null;
    const experience = rawProfile?.experience as Record<string, unknown> | null;
    const normalizedProfile = rawProfile
      ? {
          ...rawProfile,
          bio: rawProfile.bio || experience?.bio || null,
          interests: rawProfile.interests || rawProfile.skills || null,
          countryId: rawProfile.countryId || (rawProfile.Country as { id?: string } | null)?.id || null,
          country:
            rawProfile.country ||
            (rawProfile.Country as { name?: string } | null)?.name ||
            null,
        }
      : null;

    return privateJson({
      ...safeProfile,
      profile: normalizedProfile,
      completionPercent: calculateCompletionPercent({ ...profile, profile: normalizedProfile }),
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('، ');
      return badRequest(message || 'البيانات المدخلة غير صحيحة');
    }

    const data = parsed.data;

    const userUpdate: Record<string, unknown> = {};
    if (data.name !== undefined) userUpdate.name = data.name;
    if (data.username !== undefined) userUpdate.username = data.username;
    if (data.avatar !== undefined) userUpdate.avatar = data.avatar;
    if (data.phone !== undefined) userUpdate.phone = data.phone;
    if (data.isPrivate !== undefined) userUpdate.isPrivate = data.isPrivate;
    if (data.notificationSettings !== undefined) userUpdate.notificationSettings = data.notificationSettings;

    const profileUpdate: Record<string, unknown> = {};
    if (data.bio !== undefined) profileUpdate.bio = data.bio;
    if (data.city !== undefined) profileUpdate.city = data.city;
    if (data.country !== undefined) profileUpdate.country = data.country;
    if (data.countryId !== undefined) profileUpdate.countryId = data.countryId;
    if (data.interests !== undefined) profileUpdate.interests = data.interests;
    if (data.website !== undefined) profileUpdate.website = data.website;
    if (data.birthDate !== undefined) profileUpdate.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.gender !== undefined) profileUpdate.gender = data.gender;
    if (data.education) profileUpdate.education = JSON.stringify(data.education);
    if (data.experience) profileUpdate.experience = JSON.stringify(data.experience);
    if (data.skills !== undefined) profileUpdate.skills = data.skills;
    if (data.lat !== undefined) profileUpdate.lat = data.lat;
    if (data.lng !== undefined) profileUpdate.lng = data.lng;
    if (data.locationSharing !== undefined) profileUpdate.locationSharing = data.locationSharing;
    if (data.socialLinks) profileUpdate.socialLinks = JSON.stringify(data.socialLinks);
    if (data.onboardingCompleted !== undefined) profileUpdate.onboardingCompleted = data.onboardingCompleted;
    if (data.onboardingSkipped !== undefined) profileUpdate.onboardingSkipped = data.onboardingSkipped;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...userUpdate,
        Profile: {
          upsert: {
            create: {
              bio: data.bio || null,
              city: data.city || null,
              country: data.country || null,
              countryId: data.countryId || null,
              interests: data.interests || null,
              website: data.website || null,
              birthDate: data.birthDate ? new Date(data.birthDate) : null,
              gender: data.gender || null,
              education: data.education ? JSON.stringify(data.education) : null,
              experience: data.experience ? JSON.stringify(data.experience) : null,
              skills: data.skills || null,
              lat: data.lat ?? null,
              lng: data.lng ?? null,
              locationSharing: data.locationSharing ?? false,
              socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
              onboardingSkipped: data.onboardingSkipped ?? false,
              updatedAt: new Date(),
            },
            update: { ...profileUpdate, updatedAt: new Date() },
          },
        },
      },
      include: {
        Profile: true,
        Business: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            Post: true,
            follows_follows_followerIdTousers: true,
            follows_follows_followingIdTousers: true,
          },
        },
      },
    });

    // Notify user that profile was saved
    await prisma.notification.create({
      data: {
        userId,
        type: NotificationType.SYSTEM,
        title: 'تم حفظ ملفك الشخصي',
        body: 'تم تحديث معلوماتك الشخصية والمهنية بنجاح.',
        data: JSON.stringify({ userId, link: `/profile/${userId}` }),
      },
    });

    const { password: _p2, ...safeUpdatedUser } = updatedUser as Record<string, unknown> & { password?: string };
    return privateJson({
      ...safeUpdatedUser,
      completionPercent: calculateCompletionPercent(updatedUser),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000') {
      return badRequest('أحد الحقول أطول من الحد المسموح به، يرجى تقصير المدخلات (مثل المهارات)');
    }
    return serverError(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();

    if (body.action === 'changePassword') {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!currentUser?.password) {
        return NextResponse.json(
          { error: 'لا يمكن تغيير كلمة المرور لحساب Google' },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(parsed.data.currentPassword, currentUser.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'كلمة المرور الحالية غير صحيحة' },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      return privateJson({ message: 'تم تغيير كلمة المرور بنجاح' });
    }

    return badRequest('action غير معروف');
  } catch (error) {
    return serverError(error);
  }
}
