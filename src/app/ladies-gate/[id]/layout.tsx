import type { Metadata } from 'next';
import { prisma } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { name: true, description: true },
    });
    if (category) {
      return {
        title: `${category.name} | البوابة العامة | Gateo`,
        description: category.description || `${category.name} - خدمات حصرية للجميع على Gateo`,
      };
    }
  } catch {}
  return { title: 'البوابة العامة | Gateo' };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
