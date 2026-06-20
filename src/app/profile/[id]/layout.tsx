import type { Metadata } from 'next';
import { prisma } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, Profile: { select: { bio: true } } },
    });
    if (user) {
      return {
        title: `${user.name} | Gateo`,
        description: user.Profile?.bio || `ملف شخصي ${user.name} على Gateo`,
      };
    }
  } catch {}
  return { title: 'ملف شخصي | Gateo' };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
