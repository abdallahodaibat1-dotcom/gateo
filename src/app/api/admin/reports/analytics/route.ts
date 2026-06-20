import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError, badRequest } from '@/lib/api-utils';
import { requireAdmin } from '../../_lib/utils';

type ReportType = 'users' | 'businesses' | 'content' | 'bookings' | 'reports';

function parseDateRange(searchParams: URLSearchParams) {
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to ? new Date(to) : new Date();
  toDate.setHours(23, 59, 59, 999);
  return { fromDate, toDate };
}

function fillDateRange(fromDate: Date, toDate: Date, data: { date: string; count: number }[]) {
  const result = [];
  const map = new Map(data.map((d) => [d.date, d.count]));
  const current = new Date(fromDate);
  current.setHours(0, 0, 0, 0);
  while (current <= toDate) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({ date: dateStr, count: map.get(dateStr) || 0 });
    current.setDate(current.getDate() + 1);
  }
  return result;
}

async function getUsersReport(fromDate: Date, toDate: Date) {
  const [total, byAccountType, byRole, registrationsOverTime, topCities] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { gte: fromDate, lte: toDate } },
    }),
    prisma.user.groupBy({
      by: ['accountType'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { accountType: true },
    }),
    prisma.user.groupBy({
      by: ['role'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { role: true },
    }),
    prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
    }),
    prisma.$queryRaw<{ city: string; count: bigint }[]>`
      SELECT p.city, COUNT(*) as count
      FROM profiles p
      JOIN users u ON p.userId = u.id
      WHERE u.createdAt >= ${fromDate} AND u.createdAt <= ${toDate} AND p.city IS NOT NULL
      GROUP BY p.city
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  const timeSeries = registrationsOverTime.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + item._count.id;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: { total },
    byAccountType: byAccountType.map((item) => ({ name: item.accountType, count: item._count.accountType })),
    byRole: byRole.map((item) => ({ name: item.role, count: item._count.role })),
    timeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(timeSeries).map(([date, count]) => ({ date, count }))
    ),
    topCities: (topCities as unknown as { city: string; count: bigint }[]).map((item) => ({
      name: item.city || 'غير محدد',
      count: Number(item.count),
    })),
  };
}

async function getBusinessesReport(fromDate: Date, toDate: Date, categoryId?: string | null, city?: string | null) {
  const where: any = { createdAt: { gte: fromDate, lte: toDate } };
  if (categoryId) where.categoryId = categoryId;
  if (city) where.city = city;

  const [total, byStatus, byCategory, byCity, verifiedStats, timeSeries] = await Promise.all([
    prisma.business.count({ where }),
    prisma.business.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
    prisma.business.groupBy({
      by: ['categoryId'],
      where,
      _count: { categoryId: true },
    }),
    prisma.business.groupBy({
      by: ['city'],
      where: { ...where, city: { not: null } },
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10,
    }),
    prisma.business.groupBy({
      by: ['isVerified'],
      where,
      _count: { isVerified: true },
    }),
    prisma.business.groupBy({
      by: ['createdAt'],
      where,
      _count: { id: true },
    }),
  ]);

  const categories = await prisma.category.findMany({
    where: { id: { in: byCategory.map((c) => c.categoryId).filter(Boolean) as string[] } },
    select: { id: true, name: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const timeSeriesMap = timeSeries.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + item._count.id;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: {
      total,
      verified: verifiedStats.find((v) => v.isVerified)?._count.isVerified || 0,
      unverified: verifiedStats.find((v) => !v.isVerified)?._count.isVerified || 0,
    },
    byStatus: byStatus.map((item) => ({ name: item.status, count: item._count.status })),
    byCategory: byCategory.map((item) => ({
      name: categoryMap.get(item.categoryId || '') || 'غير مصنف',
      count: item._count.categoryId,
    })),
    byCity: byCity.map((item) => ({ name: item.city || 'غير محدد', count: item._count.city })),
    timeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(timeSeriesMap).map(([date, count]) => ({ date, count }))
    ),
  };
}

async function getContentReport(fromDate: Date, toDate: Date) {
  const [postsOverTime, commentsOverTime, likesOverTime, totalPosts, totalComments, totalLikes] = await Promise.all([
    prisma.post.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
    }),
    prisma.comment.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
    }),
    prisma.like.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
    }),
    prisma.post.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.comment.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.like.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
  ]);

  const aggregate = (data: { createdAt: Date; _count: { id: number } }[]) =>
    data.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + item._count.id;
      return acc;
    }, {} as Record<string, number>);

  return {
    summary: { totalPosts, totalComments, totalLikes },
    postsTimeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(aggregate(postsOverTime)).map(([date, count]) => ({ date, count }))
    ),
    commentsTimeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(aggregate(commentsOverTime)).map(([date, count]) => ({ date, count }))
    ),
    likesTimeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(aggregate(likesOverTime)).map(([date, count]) => ({ date, count }))
    ),
  };
}

async function getBookingsReport(fromDate: Date, toDate: Date) {
  const [total, totalRevenue, byStatus, timeSeries, topBusinesses] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.booking.aggregate({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { status: true },
    }),
    prisma.booking.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
      _sum: { totalPrice: true },
    }),
    prisma.booking.groupBy({
      by: ['businessId'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { businessId: true },
      _sum: { totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 10,
    }),
  ]);

  const businessIds = topBusinesses.map((b) => b.businessId).filter(Boolean) as string[];
  const businesses = await prisma.business.findMany({
    where: { id: { in: businessIds } },
    select: { id: true, name: true },
  });
  const businessMap = new Map(businesses.map((b) => [b.id, b.name]));

  const timeSeriesMap = timeSeries.reduce(
    (acc, item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      acc.counts[date] = (acc.counts[date] || 0) + item._count.id;
      acc.revenue[date] = (acc.revenue[date] || 0) + Number(item._sum.totalPrice || 0);
      return acc;
    },
    { counts: {} as Record<string, number>, revenue: {} as Record<string, number> }
  );

  return {
    summary: {
      total,
      totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
    },
    byStatus: byStatus.map((item) => ({ name: item.status, count: item._count.status })),
    timeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(timeSeriesMap.counts).map(([date, count]) => ({ date, count }))
    ),
    revenueTimeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(timeSeriesMap.revenue).map(([date, count]) => ({ date, count }))
    ),
    topBusinesses: topBusinesses.map((item) => ({
      name: businessMap.get(item.businessId || '') || 'غير معروف',
      bookings: item._count.businessId,
      revenue: Number(item._sum.totalPrice || 0),
    })),
  };
}

async function getReportsReport(fromDate: Date, toDate: Date) {
  const [total, byType, byStatus, timeSeries] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: fromDate, lte: toDate } } }),
    prisma.report.groupBy({
      by: ['type'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { type: true },
    }),
    prisma.report.groupBy({
      by: ['status'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { status: true },
    }),
    prisma.report.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fromDate, lte: toDate } },
      _count: { id: true },
    }),
  ]);

  const timeSeriesMap = timeSeries.reduce((acc, item) => {
    const date = item.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + item._count.id;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: { total },
    byType: byType.map((item) => ({ name: item.type, count: item._count.type })),
    byStatus: byStatus.map((item) => ({ name: item.status, count: item._count.status })),
    timeSeries: fillDateRange(
      fromDate,
      toDate,
      Object.entries(timeSeriesMap).map(([date, count]) => ({ date, count }))
    ),
  };
}

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as ReportType;
    const { fromDate, toDate } = parseDateRange(searchParams);
    const categoryId = searchParams.get('categoryId');
    const city = searchParams.get('city');

    if (!type || !['users', 'businesses', 'content', 'bookings', 'reports'].includes(type)) {
      return badRequest('نوع التقرير غير صحيح');
    }

    let data;
    switch (type) {
      case 'users':
        data = await getUsersReport(fromDate, toDate);
        break;
      case 'businesses':
        data = await getBusinessesReport(fromDate, toDate, categoryId, city);
        break;
      case 'content':
        data = await getContentReport(fromDate, toDate);
        break;
      case 'bookings':
        data = await getBookingsReport(fromDate, toDate);
        break;
      case 'reports':
        data = await getReportsReport(fromDate, toDate);
        break;
    }

    return NextResponse.json({
      type,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      data,
    });
  } catch (error) {
    return serverError(error);
  }
}
