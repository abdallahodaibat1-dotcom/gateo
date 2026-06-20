'use client';

import { getThemeStyleVars, BusinessThemeInput } from '@/lib/business-template-generator';

interface BusinessThemeProviderProps {
  theme?: BusinessThemeInput | null;
  children: React.ReactNode;
}

export function BusinessThemeProvider({ theme, children }: BusinessThemeProviderProps) {
  return (
    <div
      style={getThemeStyleVars(theme)}
      className="min-h-screen"
      dir="rtl"
    >
      {children}
    </div>
  );
}
