import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export default function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const variants = {
    info: {
      wrapper: 'bg-primary/5 border-primary/20 text-primary-dark',
      icon: Info,
    },
    success: {
      wrapper: 'bg-success/5 border-success/20 text-success',
      icon: CheckCircle2,
    },
    warning: {
      wrapper: 'bg-warning/5 border-warning/20 text-warning',
      icon: AlertTriangle,
    },
    error: {
      wrapper: 'bg-danger/5 border-danger/20 text-danger',
      icon: AlertCircle,
    },
  };

  const { wrapper, icon: Icon } = variants[variant];

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        wrapper,
        className
      )}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
