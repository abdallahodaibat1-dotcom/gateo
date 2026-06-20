import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serverError } from '@/lib/api-utils';
import { requireAdmin } from '../_lib/utils';

// GET /api/admin/dashboard - Get admin dashboard statistics
export async function GET() {
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof Response) return adminCheck;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      totalBusinesses,
      pendingBusinesses,
      activeBusinesses,
      rejectedBusinesses,
      totalPosts,
      totalBookings,
      pendingBookings,
      totalReports,
      pendingReports,
      totalGroups,
      totalReviews,
      recentUsers,
      recentBusinesses,
      recentReports,
      recentBookings,
      usersTrend,
      businessesTrend,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.business.count(),
      prisma.business.count({ where: { status: 'PENDING' } }),
      prisma.business.count({ where: { status: 'ACTIVE' } }),
      prisma.business.count({ where: { status: 'REJECTED' } }),
      prisma.post.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.group.count(),
      prisma.review.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, name: true, email: true, createdAt: true, role: true, accountType: true },
      }),
      prisma.business.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, name: true, status: true, createdAt: true, userId: true, city: true },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: { id: true, type: true, status: true, createdAt: true },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, createdAt: true, totalPrice: true },
      }),
      getDailyTrend(prisma.user, 7),
      getDailyTrend(prisma.business, 7),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        totalBusinesses,
        pendingBusinesses,
        activeBusinesses,
        rejectedBusinesses,
        totalPosts,
        totalBookings,
        pendingBookings,
        totalReports,
        pendingReports,
        totalGroups,
        totalReviews,
      },
      trends: {
        users: usersTrend,
        businesses: businessesTrend,
      },
      recent: {
        users: recentUsers,
        businesses: recentBusinesses,
        reports: recentReports,
        bookings: recentBookings,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}

async function getDailyTrend(model: any, days: number) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const count = await model.count({
      where: { createdAt: { gte: start, lt: end } },
    });
    result.push({ date: start.toISOString().split('T')[0], count });
  }
  return result;
}
