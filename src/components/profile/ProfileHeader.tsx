'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Calendar } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
    createdAt: string;
  };
  prof: {
    title: string | null;
    personalLogo: string | null;
    isVerified: boolean;
    category: { id: string; name: string; slug: string } | null;
    subcategories?: { id: string; name: string; slug: string }[] | null;
    subcategory?: { id: string; name: string; slug: string } | null;
    customSubcategories?: string[] | null;
    customSubcategory?: string | null;
    status: string;
  };
}

export function ProfileHeader({ user, prof }: ProfileHeaderProps) {
  const avatarUrl = prof.personalLogo || user.avatar || '/logo/favicon.svg';

  return (
    <div className="theme-card overflow-hidden">
      {/* Cover */}
      <div className="h-40 md:h-56 bg-gradient-to-r from-primary via-primary-light to-secondary relative">
        <div className="absolute inset-0 bg-[url('/logo/favicon.svg')] opacity-5 bg-repeat-space bg-[length:40px_40px]" />
      </div>

      <div className="px-6 pb-6">
        <div className="relative -mt-16 md:-mt-20 mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-surface shadow-xl bg-surface">
              <Image
                src={avatarUrl}
                alt={user.name || 'المحترف'}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            {prof.isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-surface rounded-full p-1 shadow-md">
                <div className="bg-primary/10 text-primary rounded-full p-1.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>

          {prof.isVerified && (
            <Badge variant="primary" className="w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              محترف موثق
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {user.name || 'محترف'}
          </h1>
          {prof.title && (
            <p className="text-primary font-semibold text-lg">{prof.title}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {prof.category && (
              <Link
                href={`/businesses/${prof.category.slug}`}
                className="text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors font-medium"
              >
                {prof.category.name}
              </Link>
            )}
            {(prof.subcategories?.length || prof.subcategory) && (
              <>
                {prof.subcategories?.map((sub) => (
                  <span
                    key={sub.id}
                    className="text-muted bg-slate-50 px-3 py-1 rounded-full border border-border"
                  >
                    {sub.name}
                  </span>
                ))}
                {!prof.subcategories?.length && prof.subcategory && (
                  <span className="text-muted bg-slate-50 px-3 py-1 rounded-full border border-border">
                    {prof.subcategory.name}
                  </span>
                )}
              </>
            )}
            {prof.customSubcategories?.map((name, i) => (
              <span
                key={`custom-${i}`}
                className="text-muted bg-slate-50 px-3 py-1 rounded-full border border-border"
              >
                {name}
              </span>
            ))}
            {!prof.customSubcategories?.length && prof.customSubcategory && (
              <span className="text-muted bg-slate-50 px-3 py-1 rounded-full border border-border">
                {prof.customSubcategory}
              </span>
            )}
            <span className="flex items-center gap-1 px-3 py-1">
              <Calendar className="w-4 h-4" />
              انضم {new Date(user.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
