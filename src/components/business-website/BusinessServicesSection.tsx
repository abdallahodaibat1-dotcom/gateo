'use client';

import Image from 'next/image';
import { Clock, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface BusinessService {
  id: string;
  name: string;
  description: string | null;
  price: number | string | null;
  duration: number | null;
  image: string | null;
}

interface BusinessServicesSectionProps {
  title?: string;
  subtitle?: string;
  services: BusinessService[];
}

export function BusinessServicesSection({
  title = 'خدماتنا',
  subtitle = 'ما نقدمه لكم',
  services,
}: BusinessServicesSectionProps) {
  const { format, convert } = useCurrency();

  if (!services || services.length === 0) return null;

  return (
    <section className="bg-[var(--theme-background,var(--color-background))] section-padding" dir="rtl">
      <div className="container-tight">
        <div className="text-center mb-12">
          <p className="section-subtitle">{subtitle}</p>
          <h2 className="section-title mb-4">{title}</h2>
        </div>

        <div
          className={`grid gap-6 ${
            services.length === 1
              ? 'max-w-xl mx-auto'
              : 'md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {services.map((service, idx) => (
            <div
              key={service.id || idx}
              className="theme-card overflow-hidden group animate-fade-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {service.image ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : null}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--theme-primary,var(--color-primary))]/10 text-[var(--theme-primary,var(--color-primary))] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--theme-text,var(--color-foreground))] leading-tight">
                    {service.name}
                  </h3>
                </div>

                {service.description && (
                  <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                    {service.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--theme-text,var(--color-foreground))]/10">
                  {service.price ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-[var(--theme-primary,var(--color-primary))]/10 text-[var(--theme-primary,var(--color-primary))]">
                      {format(convert(service.price))}
                    </span>
                  ) : null}
                  {service.duration ? (
                    <span className="inline-flex items-center gap-1 text-sm text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {service.duration} دقيقة
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
