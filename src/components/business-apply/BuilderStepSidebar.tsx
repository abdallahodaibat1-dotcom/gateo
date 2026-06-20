'use client';

import { CheckCircle, LucideIcon } from 'lucide-react';

export interface BuilderStep {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface BuilderStepSidebarProps {
  steps: BuilderStep[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function BuilderStepSidebar({ steps, currentStep, onStepClick }: BuilderStepSidebarProps) {
  const progress = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="h-full flex flex-col bg-surface border-l border-border">
      <div className="p-5 border-b border-border">
        <h3 className="font-bold text-foreground text-sm mb-1">خطوات الإنشاء</h3>
        <p className="text-xs text-muted">
          {currentStep} من {steps.length} خطوات
        </p>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === currentStep;
          const isDone = s.id < currentStep;
          const isClickable = s.id <= currentStep;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => isClickable && onStepClick(s.id)}
              disabled={!isClickable}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : isDone
                  ? 'text-foreground hover:bg-slate-50'
                  : 'text-muted opacity-60 cursor-not-allowed'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-primary text-white'
                    : isDone
                    ? 'bg-green-100 text-green-600'
                    : 'bg-slate-100 text-muted'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {s.title}
                </p>
                <p className="text-[10px] text-muted">
                  {isDone ? 'مكتملة' : isActive ? 'الخطوة الحالية' : 'غير متاحة'}
                </p>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
