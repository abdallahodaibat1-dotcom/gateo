import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notFound, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

// GET /api/admin/professionals/[id] - Get professional profile details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const professional = await prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true } },
        Category: true,
        Subcategory: true,
        Country: true,
      },
    });

    if (!professional) return notFound('Professional profile not found');

    return NextResponse.json({ professional });
  } catch (error) {
    return serverError(error);
  }
}

// PATCH /api/admin/professionals/[id] - Update professional profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, isVerified, title, bio, city, phone, email, website, isPublicOnGateway } = body;

    const existing = await prisma.professionalProfile.findUnique({ where: { id } });
    if (!existing) return notFound('Professional profile not found');

    const professional = await prisma.professionalProfile.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isPublicOnGateway !== undefined && { isPublicOnGateway }),
        ...(title !== undefined && { title }),
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ professional });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/professionals/[id] - Delete professional profile
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { id } = await params;

    const existing = await prisma.professionalProfile.findUnique({ where: { id } });
    if (!existing) return notFound('Professional profile not found');

    await prisma.professionalProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
