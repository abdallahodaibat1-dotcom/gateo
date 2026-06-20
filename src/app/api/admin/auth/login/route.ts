import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logAdminAction } from '@/lib/admin-audit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`admin-login:${ip}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'محاولات كثيرة، يرجى المحاولة لاحقاً' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: 'الحساب مقفل مؤقتاً، يرجى المحاولة لاحقاً' },
        { status: 423 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lastFailedLoginAt: new Date(),
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
            : user.lockedUntil,
        },
      });
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await logAdminAction({
      adminId: user.id,
      action: 'ADMIN_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: user.email },
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login API error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
