import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gateo.com';

  const [businesses, categories, posts, users, groups] = await Promise.all([
    prisma.business.findMany({ where: { status: 'ACTIVE' }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, createdAt: true } }),
    prisma.post.findMany({ where: { isPublic: true }, select: { id: true, updatedAt: true } }),
    prisma.user.findMany({ where: { accountType: { in: ['USER', 'PROFESSIONAL'] } }, select: { id: true, updatedAt: true } }),
    prisma.group.findMany({ where: { isPublic: true }, select: { id: true, updatedAt: true } }),
  ]);

  const staticRoutes = [
    '', '/login', '/register', '/feed', '/businesses', '/ladies-gate',
    '/professionals', '/groups', '/search', '/bookings', '/saved', '/notifications',
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  routes.push(
    ...businesses.map((b) => ({
      url: `${baseUrl}/business/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...categories.map((c) => ({
      url: `${baseUrl}/ladies-gate/${c.slug}`,
      lastModified: c.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${baseUrl}/post/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
    ...users.map((u) => ({
      url: `${baseUrl}/profile/${u.id}`,
      lastModified: u.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...groups.map((g) => ({
      url: `${baseUrl}/groups/${g.id}`,
      lastModified: g.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  );

  return routes;
}
