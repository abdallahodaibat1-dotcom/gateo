'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Flame, Heart, MessageCircle, Share2, Bookmark, Loader2, TrendingUp, Clock, Calendar, Filter, Crown, Users, MapPin, UserPlus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import { EmptyState, Skeleton } from '@/components/ui';

interface TrendingPost {
  id: string;
  content: string | null;
  images: string[] | null;
  video: string | null;
  postType: 'POST' | 'REEL';
  createdAt: string;
  user: { id: string; name: string; avatar: string | null } | null;
  business: { id: string; name: string; logo: string | null } | null;
  stats: { likes: number; comments: number };
  score: number;
}

interface TrendingUser {
  id: string;
  name: string | null;
  avatar: string | null;
  email: string;
  profile?: { city?: string | null; country?: string | null; bio?: string | null } | null;
  stats: { followers: number; following: number; posts: number };
  score: number;
}

const TABS = [
  { key: 'celebrities', label: 'مشاهير', icon: Crown },
  { key: 'content', label: 'محتوى', icon: Flame },
];

const PERIODS = [
  { key: '24h', label: '24 ساعة', icon: Clock },
  { key: '7d', label: '7 أيام', icon: Calendar },
  { key: '30d', label: '30 يوم', icon: Calendar },
  { key: 'all', label: 'الكل', icon: TrendingUp },
];

const TYPES = [
  { key: 'all', label: 'الكل' },
  { key: 'post', label: 'منشورات' },
  { key: 'reel', label: 'ريلز' },
];

export default function TrendingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'celebrities' | 'content'>('content');
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [users, setUsers] = useState<TrendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [type, setType] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'content') {
      fetch(`/api/trending?type=${type}&period=${period}&limit=24`)
        .then((r) => (r.ok ? r.json() : { posts: [] }))
        .then((data) => setPosts(data.posts || []))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    } else {
      fetch(`/api/trending/users?period=${period}&limit=24`)
        .then((r) => (r.ok ? r.json() : { users: [] }))
        .then((data) => setUsers(data.users || []))
        .catch(() => setUsers([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab, period, type]);

  const handleAction = (action: string) => {
    if (!session?.user) {
      setAuthAction(action);
      setShowAuthModal(true);
    }
  };

  const handleFollowCelebrity = () => {
    if (!session?.user) {
      setAuthAction('follow');
      setShowAuthModal(true);
    }
  };

  const getImageUrl = (post: TrendingPost) => {
    if (post.video) return post.video;
    if (post.images && post.images.length > 0) return post.images[0];
    return null;
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
            transition={{ duration: 0.25 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              <Crown className="w-4 h-4" />
              الأكثر شهرة على المنصة
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">مشاهير ومحتوى مميز</h1>
            <p className="text-sm text-muted">اكتشف أشهر الحسابات وأقوى المحتويات على Gateo</p>
          </motion.div>

          {/* Main tabs */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex bg-surface rounded-lg p-1 shadow-sm border border-border" role="tablist" aria-label="تصنيف الاكثر شهرة">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={activeTab === t.key}
                    onClick={() => setActiveTab(t.key as 'celebrities' | 'content')}
                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === t.key ? 'bg-primary text-white shadow-sm' : 'text-foreground hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period filter */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {PERIODS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border ${
                    period === p.key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-surface text-muted hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {p.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'content' && (
            <div className="flex items-center justify-center gap-1 bg-surface rounded-lg p-1 shadow-sm border border-border mb-8 w-fit mx-auto">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
                    type === t.key ? 'bg-foreground text-white shadow-sm' : 'text-muted hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
                  <Skeleton className="w-full aspect-square" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton circle className="w-8 h-8" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                    <Skeleton className="w-full h-3" />
                    <div className="flex gap-2">
                      <Skeleton className="w-16 h-8" />
                      <Skeleton className="w-16 h-8" />
                      <Skeleton className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'celebrities' ? (
            <>
              {users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {users.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                      className="bg-surface rounded-lg p-5 shadow-sm border border-border hover:shadow-md transition group"
                    >
                      <Link href={`/profile/${user.id}`} className="block text-center">
                        <div className="relative inline-block mb-3">
                          <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-foreground text-2xl font-bold overflow-hidden border-4 border-border">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name || ''} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary">{(user.name || 'م').charAt(0)}</span>
                            )}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">
                              #{index + 1}
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition">{user.name || 'مستخدم'}</h3>
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
                            <Users className="w-3.5 h-3.5" />
                            {user.stats.followers} متابع
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            {user.stats.posts} منشور
                          </span>
                        </div>
                      </Link>

                      <div className="mt-4 pt-4 border-t border-border">
                        <button
                          onClick={handleFollowCelebrity}
                          className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary text-white px-3 py-2.5 text-xs font-bold hover:bg-primary-dark transition"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          متابعة
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="لا يوجد مشاهير في هذا التصنيف"
                  description="جرّب تغيير الفترة"
                />
              )}
            </>
          ) : (
            <>
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {posts.map((post, index) => {
                    const imageUrl = getImageUrl(post);
                    const author = post.user || post.business;
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                        className="bg-surface rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition group"
                      >
                        <Link href={`/post/${post.id}`} className="block">
                          {imageUrl ? (
                            <div className="relative aspect-square bg-slate-100 overflow-hidden">
                              {post.video ? (
                                <video src={imageUrl} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={imageUrl} alt="محتوى المنشور" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              )}
                              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
                                #{index + 1}
                              </div>
                              {post.postType === 'REEL' && (
                                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-primary text-white text-[10px] font-bold">
                                  ريلز
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="aspect-square bg-slate-100 flex items-center justify-center p-6">
                              <p className="text-sm text-foreground text-center line-clamp-4">{post.content}</p>
                            </div>
                          )}
                        </Link>

                        <div className="p-4">
                          {author && (
                            <Link
                              href={post.user ? `/profile/${post.user.id}` : `/businesses/${post.business?.id}`}
                              className="flex items-center gap-2 mb-3"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-foreground text-xs font-bold border border-border overflow-hidden">
                                {((author as any).avatar || (author as any).logo) ? (
                                  <img src={(author as any).avatar || (author as any).logo} alt={author.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-primary">{author.name.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-foreground hover:text-primary transition">{author.name}</span>
                            </Link>
                          )}

                          {post.content && imageUrl && (
                            <p className="text-xs text-muted line-clamp-2 mb-3">{post.content}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted mb-3">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-danger" />
                              {post.stats.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5 text-primary" />
                              {post.stats.comments}
                            </span>
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {post.score}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction('like')}
                              aria-label="إعجاب"
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary/5 text-primary px-3 py-2 text-xs font-bold hover:bg-primary/10 transition"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              إعجاب
                            </button>
                            <button
                              onClick={() => handleAction('comment')}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-slate-100 text-foreground px-3 py-2 text-xs font-bold hover:bg-slate-200 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              تعليق
                            </button>
                            <button
                              onClick={() => handleAction('save')}
                              aria-label="حفظ"
                              className="w-9 h-9 rounded-md bg-slate-100 text-muted flex items-center justify-center hover:bg-slate-200 transition"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction('share')}
                              aria-label="مشاركة"
                              className="w-9 h-9 rounded-md bg-slate-100 text-muted flex items-center justify-center hover:bg-slate-200 transition"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Filter}
                  title="لا يوجد محتوى مشهور في هذا التصنيف"
                  description="جرّب تغيير الفترة أو النوع"
                />
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={
          authAction === 'follow'
            ? 'متابعة المشهور'
            : authAction === 'like'
            ? 'إبداء الإعجاب'
            : authAction === 'comment'
            ? 'إضافة تعليق'
            : authAction === 'save'
            ? 'حفظ المحتوى'
            : 'مشاركة المحتوى'
        }
        description="للحفاظ على أمان حسابات مستخدمي المنصة، يجب تسجيل الدخول أو إنشاء حساب للتفاعل مع المشاهير ومحتواهم."
      />
    </div>
  );
}
