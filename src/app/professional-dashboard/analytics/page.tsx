'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, Eye, MessageSquare, CalendarDays } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface ProfessionalProfile {
  id: string;
  completedProjectsCount: number;
  clientsCount: number;
  experienceYears: number | null;
  createdAt: string;
}

export default function ProfessionalAnalyticsPage() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
        <div>
          <Skeleton className="w-56 h-7 mb-2" />
          <Skeleton className="w-40 h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  if (!profile) return null;

  const daysSinceJoined = Math.max(
    1,
    Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );

  const stats = [
    {
      label: 'إجمالي مشاهدات الملف',
      value: '—',
      icon: Eye,
      color: 'text-primary',
      bg: 'bg-primary/10',
      note: 'سيتم تفعيلها قريباً',
    },
    {
      label: 'رسائل التواصل',
      value: '—',
      icon: MessageSquare,
      color: 'text-success',
      bg: 'bg-success/10',
      note: 'سيتم تفعيلها قريباً',
    },
    {
      label: 'المشاريع المكتملة',
      value: profile.completedProjectsCount,
      icon: TrendingUp,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      note: null,
    },
    {
      label: 'عدد الأيام منذ الانضمام',
      value: daysSinceJoined,
      icon: CalendarDays,
      color: 'text-accent',
      bg: 'bg-accent/10',
      note: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">إحصائيات الملف المهني</h2>
        <p className="text-sm text-muted mt-1">متابعة أداء ملفك ونشاطه في المنصة.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted mt-0.5">{stat.label}</div>
            {stat.note && <div className="text-xs text-accent mt-2">{stat.note}</div>}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.25 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-5"
      >
        <h3 className="text-sm font-bold text-foreground mb-3">ملاحظة</h3>
        <p className="text-sm text-muted leading-relaxed">
          سيتم إضافة مؤشرات أداء أكثر تفصيلاً (مثل عدد المشاهدات، نسبة التفاعل، والاستفسارات)
          في التحديثات القادمة دون الحاجة لتغيير هيكل الملف المهني الحالي.
        </p>
      </motion.div>
    </div>
  );
}
