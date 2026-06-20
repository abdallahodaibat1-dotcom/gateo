'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Star,
  FileText,
  BarChart3,
  ExternalLink,
  Settings,
  Loader2,
  Copy,
  CheckCircle,
  Globe,
  Package,
  Check,
  CreditCard,
  Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Business {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  status: string;
  isVerified: boolean;
}

const navItems = [
  { href: '/business-dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/business-dashboard/bookings', label: 'الحجوزات', icon: CalendarDays },
  { href: '/business-dashboard/services', label: 'الخدمات', icon: Scissors },
  { href: '/business-dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/business-dashboard/reviews', label: 'التقييمات', icon: Star },
  { href: '/business-dashboard/posts', label: 'المنشورات', icon: FileText },
  { href: '/business-dashboard/analytics', label: 'الإحصائيات', icon: BarChart3 },
  { href: '/business-dashboard/subscription', label: 'الاشتراك', icon: CreditCard },
  { href: '/business-dashboard/withdrawals', label: 'السحوبات', icon: Banknote },
  { href: '/business-dashboard/website', label: 'الموقع', icon: Globe },
];

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchBusiness();
    }
  }, [status, router]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch('/api/businesses/my');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data.business);
      } else if (res.status === 404) {
        router.push('/business/apply');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (status === 'unauthenticated' || !business) return null;

  const statusLabel: Record<string, string> = {
    PENDING: 'قيد المراجعة',
    ACTIVE: 'نشط',
    REJECTED: 'مرفوض',
    SUSPENDED: 'موقوف',
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    SUSPENDED: 'bg-surface text-muted border-border',
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Business Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  <img
                    src={business.logo || '/logo/favicon.svg'}
                    alt={business.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-border bg-surface"
                  />
                  {business.isVerified && (
                    <span
                      className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                      aria-label="موثق"
                      title="موثق"
                    >
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">{business.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColor[business.status] || 'bg-slate-50 text-muted border-border'}`}
                    >
                      {statusLabel[business.status] || business.status}
                    </span>
                    {business.status === 'PENDING' && (
                      <span className="text-xs text-muted">سيتم مراجعة طلبك قريباً</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-border">
                  <span className="text-xs text-muted truncate max-w-[140px] dir-ltr text-left">
                    gateo.com/business/{business.slug}
                  </span>
                  <button
                    onClick={async () => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/business/${business.slug}`;
                      try {
                        await navigator.clipboard.writeText(url);
                      } catch {
                        const ta = document.createElement('textarea');
                        ta.value = url;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                      }
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-md hover:bg-surface transition-colors"
                    aria-label="نسخ الرابط"
                    title="نسخ الرابط"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                  </button>
                </div>
                <Link
                  href={`/business/${business.slug || business.id}`}
                  className="px-4 py-2 rounded-md bg-slate-50 text-foreground text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  عرض الموقع
                </Link>
                <Link
                  href={`/business/${business.id}/edit`}
                  className="px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  إعدادات النشاط
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Secondary Nav */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-1 mb-6 flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:text-foreground hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Content */}
          {children}
        </div>
      </main>
    </>
  );
}
