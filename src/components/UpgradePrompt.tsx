'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'hideUpgradePrompt';

function useLocalStorageBoolean(key: string, defaultValue: boolean) {
  return useSyncExternalStore(
    () => () => {},
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem(key) === 'true'
        : defaultValue,
    () => defaultValue
  );
}

export default function UpgradePrompt() {
  const { data: session, status } = useSession();
  const calledRef = useRef(false);
  const storageHidden = useLocalStorageBoolean(STORAGE_KEY, false);
  const [userHidden, setUserHidden] = useState(false);

  const hidden = storageHidden || userHidden;

  useEffect(() => {
    if (status !== 'authenticated' || calledRef.current) return;
    if (session?.user?.accountType !== 'USER') return;

    calledRef.current = true;
    fetch('/api/notifications/prompt', { method: 'POST' }).catch(() => {});
  }, [status, session]);

  const handleHide = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setUserHidden(true);
  };

  if (
    hidden ||
    status !== 'authenticated' ||
    session?.user?.accountType !== 'USER'
  ) {
    return null;
  }

  return (
    <div className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium text-center sm:text-right flex-1">
            طوّر حسابك إلى احترافي فردي أو شركة وانضم إلى بوابة الأعمال العامة.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/users/upgrade"
              className="px-4 py-1.5 rounded-full bg-surface text-primary text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              ترقية الحساب
            </Link>
            <button
              type="button"
              onClick={handleHide}
              className="px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-medium hover:bg-white/10 transition-colors"
            >
              إخفاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
