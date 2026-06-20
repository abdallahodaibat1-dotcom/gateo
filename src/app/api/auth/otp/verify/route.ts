import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { otpVerifySchema } from '@/lib/zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, phone, code } = parsed.data;

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    if (user.otpCode !== code || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { error: 'رمز التحقق غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Clear OTP and mark as verified
    const updateData: any = {
      otpCode: null,
      otpExpiresAt: null,
    };

    if (email) updateData.emailVerified = new Date();
    if (phone) updateData.phoneVerified = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'تم التحقق بنجاح',
      verified: true,
    });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق' },
      { status: 500 }
    );
  }
}
