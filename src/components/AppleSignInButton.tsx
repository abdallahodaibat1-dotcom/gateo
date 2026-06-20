'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AppleSignInButtonProps {
  mode?: 'signin' | 'signup';
  callbackUrl?: string;
}

export default function AppleSignInButton({ mode = 'signin', callbackUrl }: AppleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    signIn('apple', { callbackUrl: callbackUrl || '/' });
  };

  const label = mode === 'signup' ? 'إنشاء حساب بـ Apple' : 'تسجيل الدخول بـ Apple';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.74 3.8-.74 1.52.03 2.85.88 3.7 2.26-3.1 1.54-2.74 5.98.22 7.13-.57 1.5-1.31 2.99-2.8 4.58zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      )}
      {loading ? 'جاري الاتصال...' : label}
    </button>
  );
}
