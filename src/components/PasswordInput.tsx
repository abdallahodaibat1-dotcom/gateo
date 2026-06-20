'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  label?: string;
  error?: string;
}

export default function PasswordInput({
  name = 'password',
  value,
  onChange,
  placeholder = '******',
  required = false,
  className = '',
  id,
  label,
  error,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const inputId = id || `password-input-${name}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {required && <span className="text-danger mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full rounded-md border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition ${
            error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border hover:border-slate-300'
          }`}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
