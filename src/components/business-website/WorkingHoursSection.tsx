'use client';

import { Clock } from 'lucide-react';

interface WorkingHour {
  day: string;
  open: string;
  close: string;
}

interface WorkingHoursSectionProps {
  workingHours: WorkingHour[];
}

export function WorkingHoursSection({ workingHours }: WorkingHoursSectionProps) {
  if (!workingHours || workingHours.length === 0) return null;

  return (
    <section className="container-narrow section-padding" dir="rtl">
      <div className="theme-card p-6 md:p-8">
        <h2 className="text-xl font-bold text-[var(--theme-text,var(--color-foreground))] mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--theme-primary,var(--color-primary))]" />
          أوقات العمل
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {workingHours.map((wh) => (
            <div
              key={wh.day}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--theme-background,var(--color-background))] border border-border"
            >
              <span className="font-medium text-[var(--theme-text,var(--color-foreground))]">{wh.day}</span>
              <span className="text-sm text-muted">
                {wh.open} - {wh.close}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
