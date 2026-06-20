import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import { unauthorized, forbidden, badRequest, notFound, serverError } from '@/lib/api-utils';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED']),
});

// GET /api/reports/[id] - Get single report
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  const userId = session.user.id;

  const { id } = await params;

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        users_reports_reporterIdTousers: { select: { id: true, name: true, avatar: true } },
        users_reports_reportedIdTousers: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!report) {
      return notFound('البلاغ غير موجود');
    }

    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    if (!isStaff && report.reporterId !== userId) {
      return forbidden();
    }

    return NextResponse.json({ report });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/reports/[id] - Update report status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;

  try {
    const isStaff = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
    if (!isStaff) {
      return forbidden();
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!report) {
      return notFound('البلاغ غير موجود');
    }

    const body = await req.json();
    const data = updateStatusSchema.parse(body);

    const updated = await prisma.report.update({
      where: { id },
      data: { status: data.status },
      include: {
        users_reports_reporterIdTousers: { select: { id: true, name: true, avatar: true } },
        users_reports_reportedIdTousers: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ report: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('بيانات غير صالحة');
    }
    return serverError(error);
  }
}
