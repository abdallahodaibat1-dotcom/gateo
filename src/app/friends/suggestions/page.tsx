'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, UserPlus, UserCheck, MapPin, Heart, Users,
  ChevronLeft, RefreshCw, Search
} from 'lucide-react';
import Link from 'next/link';

interface Suggestion {
  id: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  score: number;
  matchPercent: number;
  reasons: string[];
  mutualFriends: number;
  commonInterests: string[];
  postsCount: number;
  following?: boolean;
}

export default function FriendSuggestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSuggestions();
    }
  }, [status]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/suggestions?limit=30');
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFollow = async (userId: string) => {
    setFollowLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSuggestions((prev) =>
          prev.map((s) => (s.id === userId ? { ...s, following: data.following } : s))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const filtered = suggestions.filter((s) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      (s.name?.toLowerCase().includes(q) ?? false) ||
      (s.city?.toLowerCase().includes(q) ?? false) ||
      (s.country?.toLowerCase().includes(q) ?? false) ||
      s.commonInterests.some((i) => i.toLowerCase().includes(q)) ||
      s.reasons.some((r) => r.toLowerCase().includes(q))
    );
  });

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary-dark transition-colors mb-3"
            >
              <ChevronLeft className="w-4 h-4" />
              العودة للخلاصة
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">اقتراحات أصدقاء</h1>
                <p className="text-muted text-sm">
                  نختار لك أصدقاء بناءً على موقعك، عمرك، واهتماماتك
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search & Refresh */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="relative flex-1">
              <label htmlFor="suggestions-search" className="sr-only">
                البحث في الاقتراحات
              </label>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                id="suggestions-search"
                type="text"
                placeholder="ابحث بالاسم أو المدينة أو الاهتمام..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-surface border border-border text-foreground text-sm rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => { setRefreshing(true); fetchSuggestions(); }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-surface border border-border text-foreground text-sm font-medium hover:bg-slate-50 hover:text-primary-dark transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </motion.div>

          {/* Results Count */}
          {filtered.length > 0 && (
            <div className="mb-4 text-sm text-muted">
              {filtered.length} اقتراح{filtered.length !== 1 ? 'ات' : ''}
              {filterText && ' (نتائج البحث)'}
            </div>
          )}

          {/* Suggestions Grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={suggestions.length === 0 ? 'لا توجد اقتراحات حالياً' : 'لا توجد نتائج مطابقة'}
              description={
                suggestions.length === 0
                  ? 'أكمل ملفك الشخصي (المدينة، العمر، الاهتمامات) لتحصلي على اقتراحات أفضل'
                  : 'جربي تعديل كلمات البحث'
              }
              actionLabel={suggestions.length === 0 ? 'تعديل الملف الشخصي' : undefined}
              onAction={suggestions.length === 0 ? () => router.push(`/profile/${session?.user?.id}/edit`) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((s, i) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    className="bg-surface rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar with match ring */}
                      <div className="relative flex-shrink-0">
                        <Link href={`/profile/${s.id}`}>
                          <img
                            src={s.avatar || '/logo/favicon.svg'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover border-2 border-border hover:border-primary/50 transition-colors"
                          />
                        </Link>
                        {/* Match Percent Badge */}
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold shadow-sm border-2 border-surface">
                          {s.matchPercent}%
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${s.id}`} className="font-bold text-foreground hover:text-primary-dark transition-colors truncate">
                            {s.name || 'مستخدم'}
                          </Link>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {s.matchPercent >= 80
                              ? 'توافق ممتاز'
                              : s.matchPercent >= 60
                              ? 'توافق جيد'
                              : s.matchPercent >= 40
                              ? 'توافق متوسط'
                              : 'توافق بسيط'}
                          </span>
                        </div>

                        {/* Bio */}
                        {s.bio && (
                          <p className="text-xs text-muted mb-2 line-clamp-1">{s.bio}</p>
                        )}

                        {/* Location */}
                        {(s.city || s.country) && (
                          <div className="flex items-center gap-1 text-xs text-muted mb-2">
                            <MapPin className="w-3 h-3" />
                            {[s.city, s.country].filter(Boolean).join('، ')}
                          </div>
                        )}

                        {/* Reasons chips */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {s.reasons.slice(0, 3).map((reason, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-foreground border border-border font-medium"
                            >
                              {reason}
                            </span>
                          ))}
                          {s.commonInterests.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5" />
                              {s.commonInterests.join('، ')}
                            </span>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-xs text-muted mb-3">
                          {s.mutualFriends > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {s.mutualFriends} صديق مشترك
                            </span>
                          )}
                          {s.postsCount > 0 && (
                            <span>{s.postsCount} منشور</span>
                          )}
                        </div>

                        {/* Follow Button */}
                        <button
                          onClick={() => handleFollow(s.id)}
                          disabled={followLoading[s.id] || s.following}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            s.following
                              ? 'bg-slate-100 text-muted cursor-default'
                              : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                        >
                          {followLoading[s.id] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : s.following ? (
                            <>
                              <UserCheck className="w-4 h-4" />
                              تتابعنها
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              متابعة
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
