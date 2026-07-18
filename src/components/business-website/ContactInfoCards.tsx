'use client';

import { Phone, Mail, MapPin, Clock } from 'lucide-react';

interface WorkingHour {
  day: string;
  open: string;
  close: string;
}

interface ContactInfoCardsProps {
  business: {
    phone?: string | null;
    email?: string | null;
    city?: string | null;
    address?: string | null;
    workingHours?: WorkingHour[];
  };
}

export function ContactInfoCards({ business }: ContactInfoCardsProps) {
  const items = [
    business.phone && {
      icon: Phone,
      label: 'الهاتف',
      value: business.phone,
      href: `tel:${business.phone.replace(/[^0-9+]/g, '')}`,
      color: 'var(--theme-primary, var(--color-primary))',
    },
    business.email && {
      icon: Mail,
      label: 'البريد الإلكتروني',
      value: business.email,
      href: `mailto:${business.email}`,
      color: 'var(--theme-secondary, var(--color-secondary))',
    },
    (business.city || business.address) && {
      icon: MapPin,
      label: 'العنوان',
      value: [business.city, business.address].filter(Boolean).join(' - '),
      color: 'var(--theme-accent, var(--color-accent))',
    },
    business.workingHours && business.workingHours.length > 0 && {
      icon: Clock,
      label: 'أوقات العمل',
      value: `${business.workingHours[0].day}: ${business.workingHours[0].open} - ${business.workingHours[0].close}`,
      color: 'var(--theme-primary, var(--color-primary))',
    },
  ].filter(Boolean) as {
    icon: React.ElementType;
    label: string;
    value: string;
    href?: string;
    color: string;
  }[];

  if (items.length === 0) return null;

  const CardWrapper = ({ href, children }: { href?: string; children: React.ReactNode }) =>
    href ? (
      <a href={href} className="group block">
        {children}
      </a>
    ) : (
      <div>{children}</div>
    );

  return (
    <section className="container-narrow -mt-10 relative z-20" dir="rtl">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <CardWrapper key={idx} href={item.href}>
            <div className="theme-card p-5 h-full group-hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted mb-0.5">{item.label}</p>
                  <p className="text-sm font-bold text-[var(--theme-text,var(--color-foreground))] truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          </CardWrapper>
        ))}
      </div>
    </section>
  );
}
