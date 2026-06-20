import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/zod';
import crypto from 'crypto';

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function findUserByEmailCaseInsensitive(email: string) {
  const normalized = email.toLowerCase().trim();
  // Try exact normalized lookup first
  const exact = await prisma.user.findUnique({ where: { email: normalized } });
  if (exact) return exact;
  // Fallback: scan for case-insensitive match (for legacy uppercase emails)
  const users = await prisma.user.findMany({ where: { email: { not: null } } });
  return users.find((u) => u.email?.toLowerCase() === normalized) || null;
}

// POST /api/auth/forgot-password - Request password reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { emailOrPhone } = parsed.data;
    const lookupField = isEmail(emailOrPhone) ? 'email' : 'phone';
    const normalizedValue = lookupField === 'email'
      ? emailOrPhone.toLowerCase().trim()
      : emailOrPhone.trim();

    const user = lookupField === 'email'
      ? await findUserByEmailCaseInsensitive(normalizedValue)
      : await prisma.user.findUnique({ where: { phone: normalizedValue } });

    // Return success even if user not found to prevent user enumeration
    if (!user) {
      return NextResponse.json({
        message: 'إذا كان الحساب موجوداً، فسيتم إرسال رابط إعادة تعيين كلمة المرور.',
      });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    // TODO: Send email/SMS with reset link in production
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    return NextResponse.json({
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور.',
      // For development only - remove in production
      devToken: token,
      devResetUrl: `/reset-password?token=${token}`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الطلب' },
      { status: 500 }
    );
  }
}
