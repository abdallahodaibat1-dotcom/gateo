'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Search, User, MapPin, Users, Heart, Share2, UserPlus, Loader2, Sparkles, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface UserResult {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  profile?: { city?: string | null; country?: string | null; bio?: string | null } | null;
  _count?: { followers: number; following: number };
  isFollowing?: boolean;
}

function PersonCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-5 shadow-sm border border-border text-center">
      <Skeleton circle className="w-20 h-20 mx-auto mb-3" />
      <Skeleton className="h-4 w-2/3 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/2 mx-auto mb-3" />
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="w-9 h-9" />
        <Skeleton className="w-9 h-9" />
      </div>
    </div>
  );
}

export default function SearchPeoplePage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/search/users?q=${encodeURIComponent(debouncedQuery)}&limit=24`)
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((data) => setResults(data.users || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleAction = (action: string) => {
    if (!session?.user) {
      setAuthAction(action);
      setShowAuthModal(true);
      return;
    }
    // If logged in, redirect to login-required or perform action
    // For public users, the modal is shown
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              بحث ذكي عن الأشخاص
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">ابحث عن أصدقائك ومعارفك</h1>
            <p className="text-sm text-muted">اكتب الاسم الأول، الأخير، أو البريد الإلكتروني للعثور على الحساب</p>
          </motion.div>

          {/* Search box */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                id="people-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: نورة السالم"
                className="w-full rounded-md border border-border pr-12 pl-12 py-4 text-base shadow-sm bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-muted hover:text-foreground transition-colors"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {query && !loading && (
              <p className="text-xs text-muted mt-2 text-center">
                {results.length === 0 ? 'لا توجد نتائج' : `تم العثور على ${results.length} نتيجة`}
              </p>
            )}
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <PersonCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.15) }}
                  className="bg-surface rounded-lg p-5 shadow-sm border border-border hover:shadow-md transition group"
                >
                  <Link href={`/profile/${user.id}`} className="block text-center">
                    <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{user.name}</h3>
                    {(user.profile?.city || user.profile?.country) && (
                      <p className="text-xs text-muted flex items-center justify-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {[user.profile.city, user.profile.country].filter(Boolean).join('، ')}
                      </p>
                    )}
                    {user.profile?.bio && (
                      <p className="text-xs text-muted line-clamp-2 mb-3">{user.profile.bio}</p>
                    )}
                    <div className="flex items-center justify-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {user._count?.followers || 0} متابع
                      </span>
                    </div>
                  </Link>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleAction('follow')}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary text-white px-3 py-2 text-xs font-bold hover:bg-primary-dark transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {user.isFollowing ? 'متابَعة' : 'متابعة'}
                    </button>
                    <button
                      onClick={() => handleAction('like')}
                      className="w-9 h-9 rounded-md bg-slate-100 text-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition"
                      aria-label="إبداء الإعجاب"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction('share')}
                      className="w-9 h-9 rounded-md bg-slate-100 text-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition"
                      aria-label="مشاركة الحساب"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : query ? (
            <EmptyState
              icon={User}
              title="لا توجد نتائج"
              description="جرّب كتابة الاسم بطريقة أخرى"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="ابدأ البحث"
              description="اكتب اسم الشخص للعثور عليه"
            />
          )}
        </div>
      </main>

      <Footer />

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authAction === 'follow' ? 'متابعة الحساب' : authAction === 'like' ? 'إبداء الإعجاب' : 'مشاركة الحساب'}
        description="للحفاظ على الخصوصية والأمان، يجب تسجيل الدخول أو إنشاء حساب للتفاعل مع حسابات المستخدمين."
      />
    </div>
  );
}
