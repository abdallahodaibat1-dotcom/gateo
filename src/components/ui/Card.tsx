import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md';
  border?: boolean;
  themed?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = 'md', shadow = 'sm', border = true, themed = false, style, ...props }, ref) => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden',
          themed ? 'bg-[var(--theme-surface,var(--color-surface))]' : 'bg-surface',
          border && 'border border-border',
          shadows[shadow],
          paddings[padding],
          className
        )}
        style={{
          borderRadius: themed ? 'var(--theme-radius, 1rem)' : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
