import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/businesses/[id] - Get business details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, phone: true } },
        Category: true,
        Subcategory: true,
        Service: true,
        Review: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { User: { select: { id: true, name: true, avatar: true } } },
        },
        Booking: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { User: { select: { id: true, name: true } }, Service: { select: { id: true, name: true } } },
        },
        _count: {
          select: { Service: true, Review: true, Booking: true, Post: true },
        },
      },
    });

    if (!business) return notFound('Business not found');

    return NextResponse.json({ business });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/businesses/[id] - Update business
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, isVerified, name, description, city, address, phone, email, website } = body;

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) return notFound('Business not found');

    const business = await prisma.business.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(isVerified !== undefined && { isVerified }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ business });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/businesses/[id] - Delete business
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) return notFound('Business not found');

    await prisma.business.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
