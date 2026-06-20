'use client';

import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED_BY_USER: 'bg-red-100 text-red-700',
  CANCELLED_BY_BUSINESS: 'bg-orange-100 text-orange-700',
  NO_SHOW: 'bg-slate-100 text-slate-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  DISMISSED: 'bg-slate-100 text-slate-700',
  REVIEWING: 'bg-blue-100 text-blue-700',
  USER: 'bg-slate-100 text-slate-700',
  ADMIN: 'bg-primary/10 text-primary',
  MODERATOR: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  UNPAID: 'bg-amber-100 text-amber-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
  FAILED: 'bg-red-100 text-red-700',
  true: 'bg-emerald-100 text-emerald-700',
  false: 'bg-red-100 text-red-700',
};

interface StatusBadgeProps {
  status: string | boolean;
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = String(status);
  const colorClass = statusColors[key] || 'bg-slate-100 text-slate-700';
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass)}>
      {label || key}
    </span>
  );
}
