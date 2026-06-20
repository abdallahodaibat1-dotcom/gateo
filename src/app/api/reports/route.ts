import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { unauthorized, badRequest, notFound, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const createReportSchema = z.object({
  reportedId: z.string().min(1),
  type: z.enum(['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_ACCOUNT', 'OTHER']),
  reason: z.string().min(1).max(5000),
  targetId: z.string().optional().nullable(),
  targetType: z.enum(['POST', 'COMMENT', 'USER', 'BUSINESS', 'MESSAGE']).optional().nullable(),
});

// POST /api/reports - Create a report
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const body = await req.json();
    const data = createReportSchema.parse(body);

    if (data.reportedId === userId) {
      return badRequest('لا يمكنك الإبلاغ عن نفسك');
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: data.reportedId },
      select: { id: true },
    });
    if (!reportedUser) {
      return notFound('المستخدم المبلغ عنه غير موجود');
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedId: data.reportedId,
        type: data.type,
        reason: data.reason,
        targetId: data.targetId,
        targetType: data.targetType,
      },
      include: {
        users_reports_reporterIdTousers: { select: { id: true, name: true, avatar: true } },
        users_reports_reportedIdTousers: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}

// GET /api/reports - List reports
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as any;
    const type = searchParams.get('type') as any;
    const skip = (page - 1) * limit;

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';

    const where: any = isStaff ? {} : { reporterId: userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        users_reports_reporterIdTousers: { select: { id: true, name: true, avatar: true } },
        users_reports_reportedIdTousers: { select: { id: true, name: true, avatar: true } },
      },
    });

    const total = await prisma.report.count({ where });

    return NextResponse.json({
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverError(error);
  }
}
