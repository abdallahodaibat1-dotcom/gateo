import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
  style?: CSSProperties;
}

export default function Skeleton({ className, circle, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-skeleton bg-slate-200',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      style={style}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 2, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
            'h-3.5'
          )}
        />
      ))}
    </div>
  );
}
