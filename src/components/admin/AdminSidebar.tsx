'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CalendarDays,
  Flag,
  Tags,
  MessageSquareQuote,
  MessageCircle,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Inbox,
  Settings,
  BarChart3,
  Shield,
  ScrollText,
  ChevronDown,
  Briefcase,
  Layers,
  Wallet,
  Banknote,
  CreditCard,
  Percent,
  TicketPercent,
  ArrowRightLeft,
  Crown,
  Receipt,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: (NavItem & { badgeKey?: keyof DashboardCounts })[];
}

interface DashboardCounts {
  pendingBusinesses: number;
  pendingReports: number;
}

const navGroups: NavGroup[] = [
  {
    title: 'نظرة عامة',
    items: [{ name: 'الرئيسية', href: '/admin-dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'الحسابات والأعمال',
    items: [
      { name: 'المستخدمين', href: '/admin-dashboard/users', icon: Users },
      { name: 'طلبات الانضمام', href: '/admin-dashboard/applications', icon: Inbox, badgeKey: 'pendingBusinesses' },
      { name: 'الأعمال', href: '/admin-dashboard/businesses', icon: Building2 },
      { name: 'المحترفون', href: '/admin-dashboard/professionals', icon: Briefcase },
    ],
  },
  {
    title: 'المحتوى والتفاعل',
    items: [
      { name: 'المنشورات', href: '/admin-dashboard/posts', icon: FileText },
      { name: 'المجموعات', href: '/admin-dashboard/groups', icon: MessageCircle },
      { name: 'التقييمات', href: '/admin-dashboard/reviews', icon: MessageSquareQuote },
      { name: 'البلاغات', href: '/admin-dashboard/reports/items', icon: Flag, badgeKey: 'pendingReports' },
    ],
  },
  {
    title: 'الحجوزات والمدفوعات',
    items: [{ name: 'الحجوزات', href: '/admin-dashboard/bookings', icon: CalendarDays }],
  },
  {
    title: 'المالية',
    items: [
      { name: 'الإيرادات', href: '/admin-dashboard/finance', icon: Wallet },
      { name: 'العمليات', href: '/admin-dashboard/finance/transactions', icon: ArrowRightLeft },
      { name: 'السحوبات', href: '/admin-dashboard/finance/withdrawals', icon: Banknote },
      { name: 'مدفوعات الأعمال', href: '/admin-dashboard/finance/payouts', icon: CreditCard },
      { name: 'بوابات الدفع', href: '/admin-dashboard/finance/gateways', icon: CreditCard },
      { name: 'قواعد العمولة', href: '/admin-dashboard/finance/commission-rules', icon: Percent },
      { name: 'الكوبونات', href: '/admin-dashboard/finance/coupons', icon: TicketPercent },
      { name: 'خطط الاشتراك', href: '/admin-dashboard/finance/subscriptions', icon: Crown },
      { name: 'الضرائب', href: '/admin-dashboard/finance/taxes', icon: Receipt },
    ],
  },
  {
    title: 'الإعدادات والتقارير',
    items: [
      { name: 'التقارير والإحصائيات', href: '/admin-dashboard/reports', icon: BarChart3 },
      { name: 'سجل المراجعة', href: '/admin-dashboard/audit-logs', icon: ScrollText },
      { name: 'الفئات والتصنيفات', href: '/admin-dashboard/categories', icon: Tags },
      { name: 'الحقول الديناميكية', href: '/admin-dashboard/dynamic-fields', icon: Layers },
      { name: 'إعدادات المنصة', href: '/admin-dashboard/settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState<DashboardCounts>({ pendingBusinesses: 0, pendingReports: 0 });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'نظرة عامة': true,
    'الحسابات والأعمال': true,
    'المحتوى والتفاعل': true,
    'الحجوزات والمدفوعات': true,
    'المالية': true,
    'الإعدادات والتقارير': true,
  });

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setCounts({
          pendingBusinesses: data?.stats?.pendingBusinesses || 0,
          pendingReports: data?.stats?.pendingReports || 0,
        });
      })
      .catch(() => {});
  }, []);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const getBadge = (item: NavGroup['items'][0]) => {
    if (!item.badgeKey) return undefined;
    const value = counts[item.badgeKey];
    return value > 0 ? value : undefined;
  };

  const isActive = (href: string) => {
    if (href === '/admin-dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const user = session?.user;

  const NavLink = ({ item, onClick }: { item: NavGroup['items'][0]; onClick?: () => void }) => {
    const active = isActive(item.href);
    const badge = getBadge(item);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
          active
            ? 'bg-primary text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title={collapsed ? item.name : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            {badge ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-danger/10 text-danger'}`}>
                {badge}
              </span>
            ) : (
              active && <ChevronLeft className="w-4 h-4" />
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-surface/90 backdrop-blur-lg border-b border-border px-4 h-16 flex items-center justify-between">
        <Link href="/admin-dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-primary">
            Gateo Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          type="button"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-16 bottom-0 w-72 bg-surface shadow-2xl border-l border-border overflow-y-auto"
            >
              <nav className="p-4 space-y-6">
                {navGroups.map((group) => (
                  <div key={group.title}>
                    <p className="text-xs font-bold text-muted mb-2 px-3 uppercase tracking-wider">{group.title}</p>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <NavLink key={item.name} item={item} onClick={() => setMobileOpen(false)} />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                    type="button"
                  >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </button>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-surface border-l border-border fixed right-0 top-0 bottom-0 z-40 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <Link href="/admin-dashboard" className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-lg font-bold text-primary">
                  Gateo Admin
                </div>
                <div className="text-[11px] text-muted font-medium">لوحة تحكم المشرف</div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="طي القائمة"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mb-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="توسيع القائمة"
            type="button"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 mb-2 text-xs font-bold text-muted uppercase tracking-wider hover:text-slate-600 transition-colors"
                  type="button"
                >
                  {group.title}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${expandedGroups[group.title] ? '' : '-rotate-90'}`}
                  />
                </button>
              )}
              {collapsed ? (
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink key={item.name} item={item} />
                  ))}
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {expandedGroups[group.title] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {group.items.map((item) => (
                        <NavLink key={item.name} item={item} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {!collapsed && user && (
            <div className="px-3 py-2 rounded-md bg-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{user.name || 'المشرف'}</p>
                <p className="text-[11px] text-muted truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            title={collapsed ? 'تسجيل الخروج' : undefined}
            type="button"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && 'تسجيل الخروج'}
          </button>
        </div>
      </aside>
    </>
  );
}
