import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { badRequest, serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/categories - List all categories
export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { Subcategory: true, Business: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/categories - Create category
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const body = await req.json();
    const { name, nameEn, slug, icon, image, description, isLadiesGate, sortOrder } = body;

    if (!name || !slug) {
      return badRequest('Name and slug are required');
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return badRequest('Slug already exists');

    const category = await prisma.category.create({
      data: {
        name,
        nameEn,
        slug,
        icon,
        image,
        description,
        isLadiesGate: isLadiesGate ?? false,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
