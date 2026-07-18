'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, Children, cloneElement, forwardRef, isValidElement } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'theme' | 'theme-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      style,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm',
      secondary:
        'bg-secondary text-white hover:bg-secondary-light active:bg-secondary-light shadow-sm',
      outline:
        'border border-border bg-surface text-foreground hover:bg-slate-50 active:bg-slate-100',
      ghost:
        'text-foreground hover:bg-slate-100 active:bg-slate-200',
      danger:
        'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
      success:
        'bg-success text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm',
      theme:
        'text-white shadow-sm hover:brightness-105 active:brightness-95',
      'theme-outline':
        'border-[1.5px] bg-transparent hover:bg-black/5 active:bg-black/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const themeStyle =
      variant === 'theme'
        ? { backgroundColor: 'var(--theme-primary, var(--color-primary))' }
        : variant === 'theme-outline'
        ? { borderColor: 'var(--theme-primary, var(--color-primary))', color: 'var(--theme-primary, var(--color-primary))' }
        : undefined;

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && isValidElement(children)) {
      const child = Children.only(children);
      type ChildProps = {
        className?: string;
        style?: React.CSSProperties;
        disabled?: boolean;
        children?: React.ReactNode;
      };
      const childProps = child.props as ChildProps;
      return cloneElement(
        child as React.ReactElement<ChildProps>,
        {
          className: cn(classes, childProps.className),
          style: { ...themeStyle, ...style, ...childProps.style },
          disabled: disabled || isLoading || childProps.disabled,
          ...props,
          children: (
            <>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {!isLoading && leftIcon}
              {childProps.children}
              {!isLoading && rightIcon}
            </>
          ),
        }
      );
    }

    const content = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </>
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        style={{ ...themeStyle, ...style }}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
