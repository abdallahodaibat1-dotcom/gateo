'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, ExternalLink } from 'lucide-react';

interface GateoFooterBarProps {
  business: { id: string; userId?: string | null };
}

/**
 * Bottom bar shown inside business-website footers. Gives every visitor a
 * direct link back to the Gateo platform, and gives the business owner a
 * discreet, professional link to their dashboard.
 *
 * Uses inherited color so it works inside both dark and light footers.
 */
export function GateoFooterBar({ business }: GateoFooterBarProps) {
  const { data: session } = useSession();
  const isOwner = !!session?.user?.id && session.user.id === business.userId;

  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-xs"
      style={{ opacity: 0.65 }}
      dir="rtl"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:underline underline-offset-4 transition-opacity"
      >
        <ExternalLink className="w-3 h-3" />
        <span>
          مدعوم بواسطة <span className="font-bold">Gateo</span> — العودة إلى المنصة
        </span>
      </Link>

      {isOwner && (
        <Link
          href="/business-dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-current px-3 py-1 hover:opacity-100 transition-opacity"
        >
          <LayoutDashboard className="w-3 h-3" />
          لوحة التحكم
        </Link>
      )}
    </div>
  );
}
