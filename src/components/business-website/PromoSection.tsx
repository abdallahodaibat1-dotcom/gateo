import Link from 'next/link';
import { Percent, ArrowLeft, Phone } from 'lucide-react';
import { businessSlug } from '@/lib/utils';

interface PromoSectionProps {
  business: {
    id: string;
    name: string;
    slug?: string | null;
    phone?: string | null;
    websiteType: 'INTRO' | 'STORE';
  };
  title?: string;
  subtitle?: string;
  description?: string;
}

export function PromoSection({
  business,
  title = 'عروض حصرية',
  subtitle = 'لا تفوّت الفرصة',
  description = 'استفد من أحدث العروض والخصومات المخصصة لعملائنا الكرام.',
}: PromoSectionProps) {
  const slug = businessSlug(business);

  const isStore = business.websiteType === 'STORE';
  const ctaHref = isStore
    ? `/business/${slug}/offers`
    : business.phone
      ? `tel:${business.phone.replace(/[^0-9+]/g, '')}`
      : `/business/${slug}`;
  const ctaLabel = isStore ? 'اكتشف العروض' : business.phone ? 'اتصل بنا الآن' : 'تصفح المزيد';
  const CtaIcon = isStore ? ArrowLeft : Phone;

  return (
    <section className="container-narrow section-padding" dir="rtl">
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16 text-center"
        style={{
          background: `linear-gradient(135deg, var(--theme-primary, var(--color-primary)), var(--theme-secondary, var(--color-secondary)))`,
        }}
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-semibold mb-6">
            <Percent className="w-4 h-4" />
            {subtitle}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-white/85 text-base md:text-lg mb-8 leading-relaxed">{description}</p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[var(--theme-primary,var(--color-primary))] font-bold text-sm hover:bg-white/90 transition-colors shadow-lg"
          >
            {ctaLabel}
            <CtaIcon className="w-4 h-4 rtl-arrow" />
          </Link>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
    </section>
  );
}
