'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Search, User, LogOut, Home, Bell, PlusSquare,
  MessageCircle, Calendar, Users, Trophy, Store, ChevronDown,
  BarChart3, ShoppingBag, Navigation, Sparkles, Shield
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserMenuDrawer from './UserMenuDrawer';
import NetworkPopup from './NetworkPopup';

interface SubNavItem {
  name: string;
  href: string;
  icon: typeof Home;
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
  badge?: number;
  subItems?: SubNavItem[];
}

const publicLinks = [
  { name: 'الرئيسية', href: '/' },
  { name: 'الأعمال الاحترافية', href: '/businesses' },
  { name: 'المتجر', href: '/marketplace' },
  { name: 'البوابة العامة', href: '/ladies-gate' },
];

const authNavItems: NavItem[] = [
  { name: 'الخلاصة', href: '/feed', icon: Home },
  {
    name: 'شبكتي',
    href: '/groups',
    icon: Users,
    subItems: [
      { name: 'المجموعات', href: '/groups', icon: Users },
      { name: 'قريبة مني', href: '/businesses/nearby', icon: Navigation },
      { name: 'اقتراحات', href: '/friends/suggestions', icon: Sparkles },
    ],
  },
  { name: 'الأعمال', href: '/businesses', icon: Store },
  { name: 'المتجر', href: '/marketplace', icon: ShoppingBag },
  { name: 'الرسائل', href: '/conversations', icon: MessageCircle },
  { name: 'الإشعارات', href: '/notifications', icon: Bell },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [networkPopupOpen, setNetworkPopupOpen] = useState(false);
  const [mobileNetworkExpanded, setMobileNetworkExpanded] = useState(true);
  const networkMenuRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadInvitations, setUnreadInvitations] = useState(0);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (networkMenuRef.current && !networkMenuRef.current.contains(e.target as Node)) {
        setNetworkPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications?unread=true&limit=1');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchUnreadConversations = async () => {
      try {
        const res = await fetch('/api/conversations?limit=50');
        if (res.ok) {
          const data = await res.json();
          const totalUnread = (data.conversations || []).reduce(
            (sum: number, c: any) => sum + (c.unreadCount || 0),
            0
          );
          setUnreadMessages(totalUnread);
        }
      } catch (e) {}
    };
    fetchUnreadConversations();
    const interval = setInterval(fetchUnreadConversations, 15000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchInvitations = async () => {
      try {
        const res = await fetch('/api/invitations');
        if (res.ok) {
          const data = await res.json();
          setUnreadInvitations((data.invitations || []).length);
        }
      } catch (e) {}
    };
    fetchInvitations();
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const fetchPoints = async () => {
      try {
        const res = await fetch('/api/account/me/points');
        if (res.ok) {
          const data = await res.json();
          setPoints(data.points || 0);
          setLevel(data.level || 1);
        }
      } catch (e) {}
    };
    fetchPoints();
    const interval = setInterval(fetchPoints, 60000);
    return () => clearInterval(interval);
  }, [status]);

  const isLoggedIn = status === 'authenticated';
  const user = session?.user;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdmin = user?.role === 'ADMIN';

  const getBadge = (item: NavItem) => {
    if (item.name === 'الإشعارات') return unreadCount;
    if (item.name === 'الرسائل') return unreadMessages;
    return 0;
  };

  const activeClass = 'text-primary bg-primary/5';
  const inactiveClass = 'text-slate-500 hover:text-foreground hover:bg-slate-100';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isAuthPage
            ? 'bg-surface/95 backdrop-blur-lg shadow-sm border-b border-border'
            : 'bg-surface/90 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Left: Logo + Search */}
            <div className="flex items-center gap-4 flex-1">
              <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                <img
                  src="/logo/favicon.svg"
                  alt="Gateo"
                  className="w-9 h-9 group-hover:scale-105 transition-transform"
                />
                <span className="text-xl font-bold text-primary hidden sm:block">
                  Gateo
                </span>
              </Link>

              <div className="hidden md:flex items-center max-w-xs w-full">
                <div className="relative w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const q = (e.target as HTMLInputElement).value;
                        if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q)}`;
                      }
                    }}
                    className="w-full pr-9 pl-4 py-1.5 rounded-md bg-slate-100 border border-transparent text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Center: Nav Icons (desktop) */}
            {isLoggedIn && !isAuthPage && (
              <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
                {authNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const isSubActive = item.subItems?.some(
                    (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
                  );
                  const badge = getBadge(item);
                  const hasSubItems = !!item.subItems?.length;

                  if (hasSubItems) {
                    return (
                      <div key={item.name} className="relative" ref={networkMenuRef}>
                        <button
                          onClick={() => setNetworkPopupOpen(!networkPopupOpen)}
                          className={`relative flex flex-col items-center justify-center px-4 py-1 rounded-md transition-all group ${
                            isActive || isSubActive ? activeClass : inactiveClass
                          }`}
                        >
                          <div className="relative">
                            <item.icon className={`w-5 h-5 ${isActive || isSubActive ? 'text-primary' : ''}`} />
                            {badge > 0 && (
                              <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[10px] font-bold px-1 py-0 rounded-full min-w-[16px] text-center leading-4">
                                {badge > 99 ? '99+' : badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium mt-0.5 flex items-center gap-0.5">
                            {item.name}
                            <ChevronDown className={`w-3 h-3 transition-transform ${networkPopupOpen ? 'rotate-180' : ''}`} />
                          </span>
                          {(isActive || isSubActive) && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                          )}
                        </button>

                        <NetworkPopup isOpen={networkPopupOpen} onClose={() => setNetworkPopupOpen(false)} />
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex flex-col items-center justify-center px-4 py-1 rounded-md transition-all group ${
                        isActive ? activeClass : inactiveClass
                      }`}
                    >
                      <div className="relative">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                        {badge > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[10px] font-bold px-1 py-0 rounded-full min-w-[16px] text-center leading-4">
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium mt-0.5">{item.name}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Public links (desktop, not logged in) */}
            {!isLoggedIn && !isAuthPage && (
              <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
                {publicLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      pathname === link.href
                        ? activeClass
                        : inactiveClass
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2 lg:gap-3 flex-1 justify-end">
              {/* Mobile Search */}
              <Link
                href="/search"
                className="md:hidden p-2 rounded-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* New Post (desktop) */}
              {isLoggedIn && !isAuthPage && (
                <Link
                  href="/create-post"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-medium shadow-sm hover:bg-primary-dark transition-all"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">نشر</span>
                </Link>
              )}

              {/* Points Badge */}
              {isLoggedIn && !isAuthPage && (
                <Link
                  href="/leaderboard"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-warning/10 text-warning text-xs font-bold border border-warning/20 hover:bg-warning/20 transition-all"
                  title="لوحة المتصدرين"
                >
                  <Trophy className="w-3 h-3" />
                  <span>{points}</span>
                </Link>
              )}

              {/* Auth Actions */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2" ref={userMenuRef}>
                  {/* Admin Badge */}
                  {isAdmin && (
                    <Link
                      href="/admin-dashboard"
                      className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                    >
                      <Shield className="w-3 h-3" />
                      إدارة
                    </Link>
                  )}

                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <img
                      src={user?.image || '/logo/favicon.svg'}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-border"
                    />
                    <span className="hidden md:block text-xs font-medium text-foreground max-w-[80px] truncate">
                      {user?.name || 'حسابي'}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <UserMenuDrawer
                    isOpen={userMenuOpen}
                    onClose={() => setUserMenuOpen(false)}
                    user={user}
                    level={level}
                    points={points}
                    unreadInvitations={unreadInvitations}
                    isAdmin={isAdmin}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-slate-100 transition-all"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">انضمام</span>
                  </Link>
                </div>
              )}

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-md text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface shadow-2xl"
            >
              <div className="p-6 pt-20">
                {isLoggedIn && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={user?.image || '/logo/favicon.svg'}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="font-bold text-foreground">{user?.name || 'مستخدم'}</p>
                        <p className="text-xs text-muted">{user?.email || ''}</p>
                      </div>
                    </div>
                    <Link
                      href={`/profile/${user?.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="mt-3 block text-center text-xs font-bold text-primary border border-primary/20 rounded-md py-2 hover:bg-primary/5 transition-colors"
                    >
                      عرض الملف الشخصي
                    </Link>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  {(isLoggedIn && !isAuthPage ? authNavItems : publicLinks).map((link: any) => {
                    const Icon = link.icon;
                    const hasSubItems = !!link.subItems?.length;

                    if (hasSubItems) {
                      return (
                        <div key={link.name} className="flex flex-col gap-1">
                          <button
                            onClick={() => setMobileNetworkExpanded(!mobileNetworkExpanded)}
                            className={`px-4 py-3 rounded-md text-base font-medium transition-all flex items-center gap-3 ${
                              pathname === link.href || link.subItems.some((sub: any) => pathname === sub.href || pathname.startsWith(sub.href + '/'))
                                ? activeClass
                                : inactiveClass
                            }`}
                          >
                            {Icon && <Icon className="w-5 h-5" />}
                            {link.name}
                            <ChevronDown className={`w-4 h-4 mr-auto transition-transform ${mobileNetworkExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {mobileNetworkExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mr-4 pr-2 border-r-2 border-primary/20 flex flex-col gap-1 overflow-hidden"
                              >
                                {link.subItems.map((sub: any) => {
                                  const SubIcon = sub.icon;
                                  return (
                                    <Link
                                      key={sub.name}
                                      href={sub.href}
                                      onClick={() => setMobileOpen(false)}
                                      className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-3 ${
                                        pathname === sub.href || pathname.startsWith(sub.href + '/')
                                          ? activeClass
                                          : inactiveClass
                                      }`}
                                    >
                                      {SubIcon && <SubIcon className="w-4 h-4" />}
                                      {sub.name}
                                    </Link>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-3 rounded-md text-base font-medium transition-all flex items-center gap-3 ${
                          pathname === link.href ? activeClass : inactiveClass
                        }`}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        {link.name}
                        {link.name === 'الإشعارات' && unreadCount > 0 && (
                          <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full mr-auto">
                            {unreadCount}
                          </span>
                        )}
                        {link.name === 'الرسائل' && unreadMessages > 0 && (
                          <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full mr-auto">
                            {unreadMessages}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                  {isLoggedIn ? (
                    <>
                      <div className={`grid gap-2 mb-2 ${session?.user?.accountType === 'BUSINESS' || session?.user?.accountType === 'COMPANY' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <Link
                          href="/bookings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                          حجوزاتي
                        </Link>
                        {(session?.user?.accountType === 'BUSINESS' || session?.user?.accountType === 'COMPANY') && (
                          <Link
                            href="/business-dashboard"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4" />
                            لوحة العمل
                          </Link>
                        )}
                      </div>
                      <Link
                        href="/create-post"
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-all"
                      >
                        <PlusSquare className="w-4 h-4" />
                        منشور جديد
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-red-50 text-danger font-medium hover:bg-red-100 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-all"
                      >
                        <User className="w-4 h-4" />
                        تسجيل الدخول
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-border text-foreground font-medium hover:bg-slate-50 transition-all"
                      >
                        إنشاء حساب جديد
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
