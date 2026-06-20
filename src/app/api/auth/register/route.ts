import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { awardPoints } from '@/lib/points';
import { registerSchema } from '@/lib/zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password, countryId } = parsed.data;
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists (case-insensitive via normalized lowercase)
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // Check if phone exists
    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'رقم الهاتف مستخدم بالفعل' },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        firstName,
        lastName,
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        accountType: 'USER',
        Profile: {
          create: countryId ? { countryId } : undefined,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        accountType: true,
        role: true,
        createdAt: true,
      },
    });

    // Award welcome points
    await awardPoints(user.id, 50, 'مرحباً بك في Gateo! مكافأة التسجيل', 'BONUS').catch(() => {});

    return NextResponse.json(
      { message: 'تم إنشاء الحساب بنجاح', user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
