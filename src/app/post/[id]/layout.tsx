import type { Metadata } from 'next';
import { prisma } from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { content: true, User: { select: { name: true } }, Business: { select: { name: true } } },
    });
    if (post) {
      const author = post.User?.name || post.Business?.name || 'مستخدم';
      return {
        title: `منشور ${author} | Gateo`,
        description: post.content?.slice(0, 160) || `منشور من ${author} على Gateo`,
      };
    }
  } catch {}
  return { title: 'منشور | Gateo' };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
