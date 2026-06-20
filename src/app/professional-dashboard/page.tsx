'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Star,
  User,
  TrendingUp,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from '@/components/ui/Skeleton';

interface ProfessionalProfile {
  id: string;
  title: string | null;
  bio: string | null;
  status: string;
  isVerified: boolean;
  experienceYears: number | null;
  completedProjectsCount: number;
  clientsCount: number;
  isPublicOnGateway: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  subcategory: { id: string; name: string } | null;
  user: { id: string; name: string | null };
}

export default function ProfessionalDashboardPage() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/professionals/apply');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-5">
              <Skeleton className="w-10 h-10 rounded-lg mb-3" />
              <Skeleton className="w-16 h-6 rounded-md mb-2" />
              <Skeleton className="w-24 h-4 rounded-md" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface rounded-lg border border-border shadow-sm p-5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-10 rounded-md" />
            ))}
          </div>
          <div className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-10 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const statusLabels: Record<string, string> = {
    PENDING: 'قيد المراجعة',
    ACTIVE: 'نشط',
    REJECTED: 'مرفوض',
    SUSPENDED: 'موقوف',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    SUSPENDED: 'bg-surface text-muted border-border',
  };

  const stats = [
    {
      label: 'سنوات الخبرة',
      value: profile.experienceYears || 0,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/professional/apply',
    },
    {
      label: 'المشاريع المكتملة',
      value: profile.completedProjectsCount,
      icon: Briefcase,
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/professional/apply',
    },
    {
      label: 'العملاء',
      value: profile.clientsCount,
      icon: User,
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/professional/apply',
    },
    {
      label: 'حالة الظهور',
      value: profile.isPublicOnGateway ? 'منشور' : 'غير منشور',
      icon: TrendingUp,
      color: profile.isPublicOnGateway ? 'text-green-600' : 'text-muted',
      bg: profile.isPublicOnGateway ? 'bg-green-50' : 'bg-slate-100',
      href: '/professional-dashboard/profile',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {profile.status === 'PENDING' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 text-sm">ملفك المهني قيد المراجعة</h3>
            <p className="text-amber-700/80 text-sm mt-1">
              سيتم نشر ملفك تلقائياً بمجرد اعتماده من الإدارة. يمكنك متابعة الحالة من هنا.
            </p>
          </div>
        </motion.div>
      )}

      {profile.status === 'REJECTED' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 text-sm">تم رفض ملفك المهني</h3>
            <p className="text-red-700/80 text-sm mt-1">
              يرجى مراجعة بياناتك وإعادة التقديم بعد التعديل.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={stat.href}
              className="block bg-surface rounded-lg shadow-sm border border-border p-4 sm:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted mt-0.5">{stat.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-surface rounded-lg shadow-sm border border-border p-5"
        >
          <h2 className="font-bold text-foreground mb-4">نظرة سريعة</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted">التخصص الرئيسي</span>
              <span className="text-sm font-medium text-foreground">{profile.category?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted">التخصص الفرعي</span>
              <span className="text-sm font-medium text-foreground">{profile.subcategory?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted">حالة الملف</span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColors[profile.status]}`}>
                {statusLabels[profile.status]}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-muted">التوثيق</span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${profile.isVerified ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 text-muted border-border'}`}>
                {profile.isVerified ? 'موثق' : 'غير موثق'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted">آخر تحديث</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(profile.updatedAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-surface rounded-lg shadow-sm border border-border p-5"
        >
          <h2 className="font-bold text-foreground mb-4">إجراءات سريعة</h2>
          <div className="space-y-2">
            <Link
              href="/professional/apply"
              className="flex items-center gap-3 p-3 rounded-md bg-slate-100 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              تعديل الملف المهني
            </Link>
            <Link
              href="/professional-dashboard/profile"
              className="flex items-center gap-3 p-3 rounded-md bg-slate-100 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              إعدادات الظهور
            </Link>
            <Link
              href={`/professional/${profile.user?.id}`}
              className="flex items-center gap-3 p-3 rounded-md bg-slate-100 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              معاينة الملف العام
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
