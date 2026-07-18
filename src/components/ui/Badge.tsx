import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'muted' | 'theme';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'primary', size = 'sm', className, style, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20',
      outline: 'bg-transparent text-foreground border-border',
      success: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      danger: 'bg-danger/10 text-danger border-danger/20',
      muted: 'bg-slate-100 text-muted border-slate-200',
      theme: 'border-transparent',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    };

    const themeStyle =
      variant === 'theme'
        ? {
            backgroundColor: 'color-mix(in srgb, var(--theme-primary, var(--color-primary)) 10%, transparent)',
            color: 'var(--theme-primary, var(--color-primary))',
          }
        : undefined;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        style={{ ...themeStyle, ...style }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
export default Badge;
