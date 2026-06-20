'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Users, Briefcase, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from './ui/Skeleton';

interface UserProfile {
  id: string;
  name: string | null;
  avatar: string | null;
  coverImage: string | null;
  points: number;
  level: number;
  _count: { posts: number; followers: number; following: number };
  business: { id: string; name: string; slug: string; status: string } | null;
}

export default function FeedLeftSidebar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setProfile(data))
      .catch(() => {});
  }, []);

  if (!profile) {
    return (
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <Skeleton className="h-16 rounded-none" />
        <div className="p-4 pt-0">
          <Skeleton circle className="w-16 h-16 mx-auto -mt-8 mb-3 border-4 border-surface" />
          <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-3 w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'المتابعون', value: profile._count.followers, href: '#' },
    { label: 'المتابَعون', value: profile._count.following, href: '#' },
    { label: 'المنشورات', value: profile._count.posts, href: `/profile/${profile.id}` },
  ];

  return (
    <div className="space-y-4">
      {/* Mini Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        <div className="h-16 bg-primary relative" />
        <div className="px-4 pt-0 pb-4">
          <Link href={`/profile/${profile.id}`}>
            <img
              src={profile.avatar || '/logo/favicon.svg'}
              alt={profile.name || ''}
              className="w-16 h-16 rounded-full object-cover mx-auto -mt-8 border-4 border-surface shadow-sm hover:scale-105 transition-transform"
            />
          </Link>
          <div className="text-center mt-2">
            <Link href={`/profile/${profile.id}`} className="font-semibold text-foreground hover:text-primary-dark transition-colors">
              {profile.name || 'مستخدم'}
            </Link>
            {profile.business && (
              <p className="text-xs text-muted mt-1 truncate">
                {profile.business.status === 'ACTIVE' ? (
                  <Link href={`/business/${profile.business.slug}`} className="text-primary hover:text-primary-dark hover:underline">
                    {profile.business.name}
                  </Link>
                ) : (
                  <span className="text-warning">{profile.business.name} (قيد المراجعة)</span>
                )}
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              {stats.map((stat) => (
                <Link key={stat.label} href={stat.href} className="text-center flex-1 hover:bg-slate-50 rounded-md py-1 transition-colors">
                  <div className="font-semibold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted">{stat.label}</div>
                </Link>
              ))}
            </div>
          </div>
          {profile.business && profile.business.status === 'ACTIVE' && (
            <div className="mt-3 pt-3 border-t border-border">
              <Link
                href={`/business/${profile.business.slug}`}
                className="block text-center text-xs font-medium text-primary hover:text-primary-dark hover:bg-slate-50 rounded-md py-2 transition-colors"
              >
                عرض صفحة العمل
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        <div className="divide-y divide-border">
          <Link href="/saved" className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-slate-50 transition-colors">
            <Bookmark className="w-4 h-4 text-muted" />
            <span>محفوظاتي</span>
          </Link>
          <Link href="/groups" className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-slate-50 transition-colors">
            <Users className="w-4 h-4 text-muted" />
            <span>مجموعاتي</span>
          </Link>
          <Link href="/businesses" className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-slate-50 transition-colors">
            <Briefcase className="w-4 h-4 text-muted" />
            <span>استكشف الأعمال</span>
          </Link>
          <Link href="/badges" className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-slate-50 transition-colors">
            <Award className="w-4 h-4 text-accent" />
            <span>شاراتي</span>
            <span className="mr-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Lv.{profile.level}</span>
          </Link>
        </div>
      </motion.div>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted font-medium">نقاطي</p>
            <p className="text-xl font-bold text-foreground">{profile.points}</p>
          </div>
          <Award className="w-8 h-8 text-accent" />
        </div>
        <Link href="/leaderboard" className="text-xs text-primary hover:text-primary-dark mt-2 block hover:underline">
          لوحة المتصدرين
        </Link>
      </motion.div>
    </div>
  );
}
