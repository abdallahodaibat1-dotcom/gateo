'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { SHOW_ADS } from '@/lib/features';
import {
  X, User, Settings, LogOut, Shield, BarChart3, Calendar,
  BookmarkPlus, Mail, Sparkles, Trophy, Medal, ChevronLeft,
  Crown, Heart, Users, Store, Bell, Megaphone, Briefcase
} from 'lucide-react';

interface UserMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  level: number;
  points: number;
  unreadInvitations: number;
  isAdmin: boolean;
}

const menuSections = [
  {
    title: 'الملف الشخصي',
    items: [
      { name: 'عرض ملفي', href: '/profile/me', icon: User, color: 'text-primary bg-primary/10' },
      { name: 'الإعدادات', href: '/settings', icon: Settings, color: 'text-muted bg-slate-100' },
    ],
  },
  {
    title: 'استكشاف',
    items: [
      { name: 'دليل الأعمال الاحترافية', href: '/businesses', icon: Store, color: 'text-secondary bg-secondary/10' },
      { name: 'البوابة العامة', href: '/ladies-gate', icon: Sparkles, color: 'text-accent bg-accent/10' },
    ],
  },
  {
    title: 'نشاطي',
    items: [
      { name: 'اقتراحات الأصدقاء', href: '/friends/suggestions', icon: Sparkles, color: 'text-secondary bg-secondary/10', badge: 0 },
      { name: 'دعواتي', href: '/invitations', icon: Mail, color: 'text-primary bg-primary/10', badgeKey: 'invitations' },
      { name: 'حجوزاتي', href: '/bookings', icon: Calendar, color: 'text-success bg-success/10' },
      { name: 'محفوظاتي', href: '/saved', icon: BookmarkPlus, color: 'text-accent bg-accent/10' },
      { name: 'لوحة المتصدرين', href: '/leaderboard', icon: Trophy, color: 'text-warning bg-warning/10' },
    ],
  },
  {
    title: 'العمل',
    items: [
      { name: 'لوحة النشاط التجاري', href: '/business-dashboard', icon: BarChart3, color: 'text-secondary bg-secondary/10' },
      { name: 'لوحة المحترف', href: '/professional-dashboard', icon: Briefcase, color: 'text-primary bg-primary/10' },
      { name: 'إدارة المتجر', href: '/business-dashboard/posts', icon: Store, color: 'text-success bg-success/10' },
      ...(SHOW_ADS ? [{ name: 'إنشاء إعلان', href: '/ads/create', icon: Megaphone, color: 'text-accent bg-accent/10' }] : []),
    ],
  },
];

export default function UserMenuDrawer({
  isOpen,
  onClose,
  user,
  level,
  points,
  unreadInvitations,
  isAdmin,
}: UserMenuDrawerProps) {
  const { data: session } = useSession();
  const profileHref = user?.id ? `/profile/${user.id}` : '/profile/me';
  const accountType = session?.user?.accountType as string | undefined;
  const isBusinessAccount = accountType === 'BUSINESS' || accountType === 'COMPANY';

  const visibleSections = menuSections.filter(
    (section) => section.title !== 'العمل' || isBusinessAccount
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-surface shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-primary pt-12 pb-8 px-6 text-white">
              <button
                onClick={onClose}
                aria-label="إغلاق القائمة"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user?.image || '/logo/favicon.svg'}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-lg bg-surface"
                  />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-accent text-amber-900 flex items-center justify-center text-[10px] font-bold shadow-md">
                    {level}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{user?.name || 'مستخدم'}</p>
                  <p className="text-xs text-white/80 truncate">{user?.email || ''}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center">
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-accent" />
                  <p className="text-sm font-bold">{points}</p>
                  <p className="text-[10px] text-white/70">نقطة</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center">
                  <Medal className="w-4 h-4 mx-auto mb-1 text-white/80" />
                  <p className="text-sm font-bold">{level}</p>
                  <p className="text-[10px] text-white/70">مستوى</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center">
                  <Crown className="w-4 h-4 mx-auto mb-1 text-accent" />
                  <p className="text-sm font-bold">{isAdmin ? 'مدير' : 'عضو'}</p>
                  <p className="text-[10px] text-white/70">الدور</p>
                </div>
              </div>

            </div>

            {/* Menu */}
            <div className="p-4 space-y-6">
              {visibleSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[11px] font-bold text-muted uppercase tracking-wide mb-2 px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const badge = item.badgeKey === 'invitations' ? unreadInvitations : item.badge;
                      const href = item.name === 'عرض ملفي' ? profileHref : item.href;
                      return (
                        <Link
                          key={item.name}
                          href={href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-slate-50 transition-colors group"
                        >
                          <div className={`w-9 h-9 rounded-lg ${item.color.split(' ')[1]} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
                          </div>
                          <span className="text-sm font-medium flex-1">{item.name}</span>
                          {(badge ?? 0) > 0 && (
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {badge}
                            </span>
                          )}
                          <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {isAdmin && (
                <div>
                  <h3 className="text-[11px] font-bold text-muted uppercase tracking-wide mb-2 px-2">
                    الإدارة
                  </h3>
                  <Link
                    href="/admin-dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-danger" />
                    </div>
                    <span className="text-sm font-medium flex-1">لوحة الإدارة</span>
                    <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              )}

              {/* Logout */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => {
                    onClose();
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-danger hover:bg-danger/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-danger" />
                  </div>
                  <span className="text-sm font-bold">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
