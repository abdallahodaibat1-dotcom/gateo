import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/reports/[id] - Get report details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        users_reports_reporterIdTousers: { select: { id: true, name: true, email: true, avatar: true } },
        users_reports_reportedIdTousers: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!report) return notFound('Report not found');

    return NextResponse.json({ report });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/reports/[id] - Update report status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      return badRequest('Invalid status');
    }

    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) return notFound('Report not found');

    const report = await prisma.report.update({
      where: { id },
      data: { status },
      include: {
        users_reports_reporterIdTousers: { select: { id: true, name: true, email: true } },
        users_reports_reportedIdTousers: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/reports/[id] - Delete report
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) return notFound('Report not found');

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
