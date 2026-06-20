'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Star,
  Briefcase,
  MapPin,
  CalendarDays,
  TrendingUp,
  Phone,
  MessageCircle,
  User,
  MoreHorizontal,
} from 'lucide-react';

export interface ProfessionalDirectoryCardProps {
  professional: {
    id: string;
    title: string | null;
    bio: string | null;
    personalLogo: string | null;
    city: string | null;
    phone: string | null;
    whatsapp: string | null;
    experienceYears: number | null;
    completedProjectsCount: number;
    clientsCount: number;
    isVerified: boolean;
    category: { id: string; name: string; slug: string } | null;
    subcategory: { id: string; name: string; slug: string } | null;
    country: { id: string; name: string; flagEmoji: string } | null;
    user: { id: string; name: string | null; avatar: string | null; createdAt: string } | null;
  };
  index?: number;
}

const coverGradients = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
  'from-indigo-500 to-indigo-700',
  'from-teal-500 to-teal-700',
];

function getCoverGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % coverGradients.length;
  return coverGradients[index];
}

function formatPhone(phone?: string | null) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

export default function ProfessionalDirectoryCard({ professional, index = 0 }: ProfessionalDirectoryCardProps) {
  const profileUrl = `/business/${professional.user?.id}`;
  const displayName = professional.user?.name || 'محترف';
  const displayTitle = professional.title || professional.category?.name || '';
  const avatarUrl = professional.personalLogo || professional.user?.avatar || '/logo/favicon.svg';
  const phone = formatPhone(professional.whatsapp || professional.phone);
  const coverGradient = getCoverGradient(professional.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min((index % 8) * 0.04, 0.25), duration: 0.35 }}
      className="group bg-surface rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover */}
      <div className={`relative h-28 bg-gradient-to-r ${coverGradient}`}>
        <div className="absolute inset-0 bg-black/10" />

        {/* Verified badge */}
        {professional.isVerified && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-sm" title="حساب موثق">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}

        {/* More menu placeholder */}
        <button
          aria-label="خيارات"
          className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Avatar */}
      <div className="relative px-5 -mt-11 flex justify-center">
        <Link href={profileUrl} className="relative">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white bg-surface shadow-md group-hover:scale-105 transition-transform duration-300"
          />
          {professional.isVerified && (
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="px-5 pt-3 pb-5 text-center">
        <Link href={profileUrl}>
          <h3 className="font-bold text-foreground text-lg hover:text-primary transition-colors truncate">
            {displayName}
          </h3>
        </Link>

        {displayTitle && (
          <p className="text-sm text-primary font-medium mt-0.5 truncate">{displayTitle}</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {professional.subcategory && (
            <span className="text-xs text-muted bg-slate-100 px-2.5 py-1 rounded-full">
              {professional.subcategory.name}
            </span>
          )}
          {professional.city && (
            <span className="text-xs text-muted bg-slate-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {professional.city}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-y border-border mt-4 py-3">
          <div className="px-1">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="font-bold text-foreground text-base">
                {professional.experienceYears ?? 0}
              </span>
            </div>
            <p className="text-[11px] text-muted">سنة خبرة</p>
          </div>
          <div className="px-1">
            <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
              <Briefcase className="w-4 h-4" />
              <span className="font-bold text-foreground text-base">
                {professional.completedProjectsCount}
              </span>
            </div>
            <p className="text-[11px] text-muted">مشروع</p>
          </div>
          <div className="px-1">
            <div className="flex items-center justify-center gap-1 text-success mb-0.5">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold text-foreground text-base">
                {professional.clientsCount}
              </span>
            </div>
            <p className="text-[11px] text-muted">عميل</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Link
            href={profileUrl}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-slate-50 text-foreground text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            الملف
          </Link>
          {phone ? (
            <>
              <a
                href={`tel:${phone}`}
                className="flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                اتصال
              </a>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                واتساب
              </a>
            </>
          ) : (
            <Link
              href={`${profileUrl}#contact`}
              className="col-span-2 flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              تواصل
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
