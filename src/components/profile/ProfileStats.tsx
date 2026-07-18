'use client';

interface ProfileStatsProps {
  experienceYears: number | null;
  completedProjectsCount: number;
  clientsCount: number;
}

export function ProfileStats({ experienceYears, completedProjectsCount, clientsCount }: ProfileStatsProps) {
  const stats = [
    { value: experienceYears || 0, label: 'سنوات خبرة' },
    { value: completedProjectsCount, label: 'مشروع' },
    { value: clientsCount, label: 'عميل' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="text-center bg-slate-50 rounded-xl p-4 border border-border"
        >
          <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
          <div className="text-xs text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
