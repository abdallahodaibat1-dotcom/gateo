'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const pageTitles: Record<string, string> = {
  '/admin-dashboard': 'لوحة التحكم',
  '/admin-dashboard/users': 'المستخدمين',
  '/admin-dashboard/applications': 'طلبات الانضمام',
  '/admin-dashboard/businesses': 'الأعمال',
  '/admin-dashboard/posts': 'المنشورات',
  '/admin-dashboard/bookings': 'الحجوزات',
  '/admin-dashboard/reviews': 'التقييمات',
  '/admin-dashboard/reports': 'التقارير والإحصائيات',
  '/admin-dashboard/reports/items': 'البلاغات',
  '/admin-dashboard/groups': 'المجموعات',
  '/admin-dashboard/categories': 'الفئات والتصنيفات',
  '/admin-dashboard/settings': 'إعدادات المنصة',
  '/admin-dashboard/audit-logs': 'سجل المراجعة',
  '/admin-dashboard/professionals': 'المحترفون',
  '/admin-dashboard/dynamic-fields': 'الحقول الديناميكية',
  '/admin-dashboard/finance': 'المالية',
  '/admin-dashboard/finance/transactions': 'العمليات المالية',
  '/admin-dashboard/finance/withdrawals': 'السحوبات',
  '/admin-dashboard/finance/payouts': 'مدفوعات الأعمال',
  '/admin-dashboard/finance/gateways': 'بوابات الدفع',
  '/admin-dashboard/finance/commission-rules': 'قواعد العمولة',
  '/admin-dashboard/finance/coupons': 'الكوبونات',
  '/admin-dashboard/finance/subscriptions': 'خطط الاشتراك',
  '/admin-dashboard/finance/taxes': 'الضرائب',
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null;
  }

  const pageTitle = pageTitles[pathname] || 'لوحة التحكم';

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:mr-72 pt-16 lg:pt-0">
        <main className="p-4 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted mt-1">إدارة منصة Gateo</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
