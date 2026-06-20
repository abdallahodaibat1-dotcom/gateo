import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';

// POST /api/professionals/confirm-public - Confirm public listing preference
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  try {
    const existing = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'لم يتم العثور على ملف مهني. يرجى التقديم أولاً.' },
        { status: 404 }
      );
    }

    // Only allow public listing if the profile has been approved by an admin
    if (existing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'لا يمكن نشر الملف المهني قبل اعتماده من الإدارة.' },
        { status: 403 }
      );
    }

    await prisma.professionalProfile.update({
      where: { userId: session.user.id },
      data: { isPublicOnGateway: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
