'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Users, Navigation, Sparkles, Network } from 'lucide-react';

interface NetworkPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NetworkOption {
  name: string;
  description: string;
  href: string;
  icon: typeof Users;
  bg: string;
  text: string;
  ring: string;
  countKey: 'groups' | 'nearby' | 'suggestions';
}

const networkOptions: NetworkOption[] = [
  {
    name: 'المجموعات',
    description: 'انضم لمجتمعات تهتم بما يهمك',
    href: '/groups',
    icon: Users,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-200',
    countKey: 'groups',
  },
  {
    name: 'قريبة مني',
    description: 'اكتشف الأعمال والأشخاص حول موقعك',
    href: '/businesses/nearby',
    icon: Navigation,
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-200',
    countKey: 'nearby',
  },
  {
    name: 'اقتراحات الأصدقاء',
    description: 'أشخاص قد تعرفهم بناءً على اهتماماتك',
    href: '/friends/suggestions',
    icon: Sparkles,
    bg: 'bg-primary/10',
    text: 'text-primary',
    ring: 'ring-primary/20',
    countKey: 'suggestions',
  },
];

export default function NetworkPopup({ isOpen, onClose }: NetworkPopupProps) {
  const [counts, setCounts] = useState<Record<NetworkOption['countKey'], number | null>>({
    groups: null,
    nearby: null,
    suggestions: null,
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups?limit=1');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCounts((prev) => ({ ...prev, groups: data.pagination?.total ?? 0 }));
        }
      } catch {
        // silently ignore
      }
    };

    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/friends/suggestions?limit=1');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCounts((prev) => ({ ...prev, suggestions: data.total ?? 0 }));
        }
      } catch {
        // silently ignore
      }
    };

    const fetchNearby = async () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `/api/businesses/nearby?lat=${latitude}&lng=${longitude}&limit=1`
            );
            if (!res.ok) return;
            const data = await res.json();
            if (!cancelled) {
              setCounts((prev) => ({ ...prev, nearby: data.total ?? 0 }));
            }
          } catch {
            // silently ignore
          }
        },
        () => {
          // location denied — leave badge hidden
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
      );
    };

    Promise.all([fetchGroups(), fetchSuggestions(), fetchNearby()]);

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Wrapper — starts just below the navbar header */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl pointer-events-auto"
            >
              <div className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
                {/* Header */}
                <div className="relative bg-primary px-6 py-5 text-white text-center">
                  <button
                    onClick={onClose}
                    aria-label="إغلاق"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Network className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">شبكتي</h2>
                      <p className="text-xs text-white/80">اكتشف مجتمعك وتواصل مع من حولك</p>
                    </div>
                  </div>
                </div>

                {/* Horizontal Cards */}
                <div className="p-6 flex flex-col sm:flex-row items-stretch justify-center gap-4">
                  {networkOptions.map((option, index) => {
                    const Icon = option.icon;
                    const count = counts[option.countKey];
                    return (
                      <Link
                        key={option.name}
                        href={option.href}
                        onClick={onClose}
                        className="flex-1 min-w-[140px] max-w-[200px]"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                          whileHover={{ y: -4 }}
                          className={`
                            relative flex flex-col items-center text-center gap-3 p-5 rounded-xl
                            border border-border bg-surface
                            shadow-sm hover:ring-2 ${option.ring}
                            transition-colors cursor-pointer
                            h-full
                          `}
                        >
                          {/* Badge */}
                          <div className="absolute top-3 left-3">
                            <span
                              className={`
                                inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full
                                text-[11px] font-bold text-white
                                bg-primary
                                shadow-sm
                              `}
                            >
                              {count !== null ? (count > 99 ? '99+' : count) : '0'}
                            </span>
                          </div>

                          {/* Icon */}
                          <div
                            className={`
                              w-14 h-14 rounded-xl ${option.bg} ${option.text}
                              flex items-center justify-center
                            `}
                          >
                            <Icon className="w-7 h-7" />
                          </div>

                          {/* Text */}
                          <div>
                            <h3 className="font-bold text-foreground">{option.name}</h3>
                            <p className="text-xs text-muted mt-1 leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 text-center">
                  <p className="text-xs text-muted">
                    اختر القسم الذي تريد استكشافه
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
