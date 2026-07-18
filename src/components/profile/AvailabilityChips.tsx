'use client';

import { CheckCircle, Building2, BriefcaseBusiness, User } from 'lucide-react';

interface AvailabilityChipsProps {
  availableForWork: boolean;
  availableForHiring: boolean;
  availableForFreelance: boolean;
  availableForConsultation: boolean;
}

export function AvailabilityChips({
  availableForWork,
  availableForHiring,
  availableForFreelance,
  availableForConsultation,
}: AvailabilityChipsProps) {
  const chips = [
    availableForWork && { icon: CheckCircle, label: 'متاح للعمل', color: 'success' },
    availableForHiring && { icon: Building2, label: 'متاح للتوظيف', color: 'primary' },
    availableForFreelance && { icon: BriefcaseBusiness, label: 'عمل حر', color: 'warning' },
    availableForConsultation && { icon: User, label: 'استشارات', color: 'info' },
  ].filter(Boolean) as { icon: React.ElementType; label: string; color: string }[];

  if (chips.length === 0) return null;

  const colorMap: Record<string, string> = {
    success: 'bg-success/10 text-success border-success/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-info/10 text-info border-info/20',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${colorMap[chip.color]}`}
        >
          <chip.icon className="w-3.5 h-3.5" />
          {chip.label}
        </span>
      ))}
    </div>
  );
}
