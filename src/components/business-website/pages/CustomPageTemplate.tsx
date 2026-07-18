'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Calendar, Images } from 'lucide-react';
import Link from 'next/link';
import { PageTemplateProps } from './page-template-types';

function normalizeWorkingHours(value: unknown): { day: string; open: string; close: string }[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as { day: string; open: string; close: string }[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function CustomPageTemplate({ business, page }: PageTemplateProps) {
  const content = page.content || 'لا يوجد محتوى لهذه الصفحة بعد.';
  const isHome = page.isHomePage;
  const workingHours = normalizeWorkingHours(business.workingHours);
  const galleryImages =
    business.images?.filter((img) => !img.type || img.type === 'gallery').map((img) => img.url) || [];

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {isHome && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden mb-8 shadow-md bg-[var(--theme-surface)] border border-border"
          >
            {/* Cover */}
            <div
              className="h-32 md:h-44 w-full bg-cover bg-center"
              style={{
                backgroundImage: business.cover
                  ? `url(${business.cover})`
                  : `linear-gradient(135deg, ${business.theme?.primaryColor || '#7c3aed'}, ${business.theme?.secondaryColor || '#ec4899'})`,
              }}
            />

            {/* Profile header */}
            <div className="relative px-5 pb-5 md:px-8 md:pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16 mb-4">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-[var(--theme-surface)] shadow-lg bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[var(--theme-primary)] text-white flex items-center justify-center text-3xl font-bold border-4 border-[var(--theme-surface)] shadow-lg">
                    {business.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 md:pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{business.name}</h1>
                  {business.description && (
                    <p className="text-sm text-muted mt-1 line-clamp-2 max-w-xl">{business.description}</p>
                  )}
                </div>
                <Link
                  href={`/book/${business.id}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: 'var(--theme-accent)' }}
                >
                  <Calendar className="w-4 h-4" />
                  احجز موعد
                </Link>
              </div>

              {/* Compact info chips */}
              <div className="flex flex-wrap items-center gap-2">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-foreground hover:bg-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="dir-ltr">{business.phone}</span>
                  </a>
                )}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-foreground hover:bg-slate-200 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate max-w-[140px]">{business.email}</span>
                  </a>
                )}
                {(business.city || business.address) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {[business.city, business.address].filter(Boolean).join(' · ')}
                  </span>
                )}
                {workingHours.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {workingHours.length === 1
                      ? `${workingHours[0].day}: ${workingHours[0].open} - ${workingHours[0].close}`
                      : `مفتوح ${workingHours.length} أيام`}
                  </span>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {!isHome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--theme-primary)' }} />
          </motion.div>
        )}

        {isHome && page.content && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm p-8 md:p-12 mb-10"
            style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
          >
            <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}

        {!isHome && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--theme-surface)] rounded-2xl border border-border shadow-sm p-8 md:p-12"
            style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
          >
            <div className="prose prose-lg max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          </motion.div>
        )}

        {isHome && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Images className="w-6 h-6 text-primary" />
              معرض الصور
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((url, idx) => (
                <div key={`${url}-${idx}`} className="aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
