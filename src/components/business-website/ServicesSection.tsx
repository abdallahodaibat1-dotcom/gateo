interface Service {
  title: string;
  description?: string;
}

interface ServicesSectionProps {
  title?: string;
  subtitle?: string;
  services: Service[];
}

export function ServicesSection({
  title = 'ما نقدمه',
  subtitle = 'خدماتنا المميزة',
  services,
}: ServicesSectionProps) {
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
              key={idx}
              className="theme-card p-6 md:p-8 group animate-fade-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-5">
                <div className="service-number group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-lg font-bold text-[var(--theme-text,var(--color-foreground))] mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-muted leading-relaxed line-clamp-4">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
