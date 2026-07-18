import type { Metadata } from 'next';
import { prisma } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const business = await prisma.business.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { name: true, description: true, city: true, avgRating: true, Category: { select: { name: true } } },
    });
    if (business) {
      return {
        title: `${business.name} | Gateo`,
        description: business.description || `${business.name} - ${business.Category?.name || 'بروفايل احترافي'} في ${business.city || 'السعودية'}`,
        openGraph: {
          title: business.name,
          description: business.description || '',
        },
      };
    }
  } catch {}
  return { title: 'بروفايل احترافي | Gateo' };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
