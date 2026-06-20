import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { otpSendSchema } from '@/lib/zod';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpSendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, phone } = parsed.data;

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (email) {
      await prisma.user.updateMany({
        where: { email },
        data: { otpCode: otp, otpExpiresAt },
      });
    } else if (phone) {
      await prisma.user.updateMany({
        where: { phone },
        data: { otpCode: otp, otpExpiresAt },
      });
    }

    // TODO: Integrate with SMS/Email service in production
    return NextResponse.json({
      message: 'تم إرسال رمز التحقق',
      // For development only - remove in production
      devOtp: otp,
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الرمز' },
      { status: 500 }
    );
  }
}
