import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md';
  border?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, padding = 'md', shadow = 'sm', border = true, ...props }, ref) => {
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
          'bg-surface rounded-lg overflow-hidden',
          border && 'border border-border',
          shadows[shadow],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
