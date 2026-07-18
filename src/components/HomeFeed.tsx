'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Image as ImageIcon, Video, CalendarDays, Film,
  Heart, MessageCircle, TrendingUp, Users, MapPin,
  Compass, Star, ArrowLeft, Sun, Moon, Sunrise, Sunset
} from 'lucide-react';
import Navbar from './Navbar';
import PostCard from './PostCard';
import StoriesBar from './StoriesBar';
import AdCard from './AdCard';
import AdBanner from './AdBanner';
import AdSidebar from './AdSidebar';
import FeedAdCard from './FeedAdCard';
import OnboardingModal from './OnboardingModal';
import ProfileCompletionPrompt from './ProfileCompletionPrompt';
import EmptyState from './ui/EmptyState';
import Skeleton from './ui/Skeleton';

interface Post {
  id: string;
  content: string | null;
  images: any;
  video: string | null;
  location: string | null;
  createdAt: string;
  isPublic: boolean;
  isLiked: boolean;
  isSaved: boolean;
  postType?: string;
  user: { id: string; name: string | null; avatar: string | null } | null;
  business: { id: string; name: string | null; logo: string | null } | null;
  _count: { likes: number; comments: number; views: number; shares: number };
}

interface SuggestedUser {
  id: string;
  name: string | null;
  avatar: string | null;
  _count: { followers: number };
  isFollowing?: boolean;
}

interface BusinessSuggestion {
  id: string;
  name: string;
  logo: string | null;
  category: { name: string } | null;
  avgRating: number;
}

type FilterType = 'all' | 'posts' | 'reels' | 'videos' | 'suggested';

function getGreeting(): { text: string; icon: typeof Sun; color: string; subText: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'صباح الخير', icon: Sunrise, color: 'text-amber-600', subText: 'يومك جميل مثل جمالك، استمتعي بكل لحظة' };
  if (hour >= 12 && hour < 17) return { text: 'مساء النور', icon: Sun, color: 'text-orange-500', subText: 'استمتعي بوقتك واكتشف الجديد' };
  if (hour >= 17 && hour < 21) return { text: 'مساء الفل', icon: Sunset, color: 'text-primary', subText: 'وقت الاسترخاء والعناية بالذات' };
  return { text: 'تصبحين على خير', icon: Moon, color: 'text-indigo-400', subText: 'استرخي واستعدي ليوم جديد' };
}

export default function HomeFeed() {
  const { data: session } = useSession();
  const router = useRouter();
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [businesses, setBusinesses] = useState<BusinessSuggestion[]>([]);
  const [stats, setStats] = useState({ posts: 0, users: 0, businesses: 0 });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, currentFilter: FilterType = filter) => {
    try {
      let url = `/api/posts?page=${pageNum}&limit=10`;
      if (currentFilter === 'reels') url += '&type=REEL';
      else if (currentFilter === 'posts') url += '&type=POST';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const fetchedPosts = data.posts || [];

        // Client-side filtering for videos (posts with video but not reels)
        let filteredPosts = fetchedPosts;
        if (currentFilter === 'videos') {
          filteredPosts = fetchedPosts.filter((p: Post) => p.video && p.postType !== 'REEL');
        }

        if (pageNum === 1) {
          setPosts(filteredPosts);
        } else {
          setPosts((prev) => [...prev, ...filteredPosts]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts(1, filter);
    setPage(1);
  }, [filter, fetchPosts]);

  useEffect(() => {
    // Fetch current user profile and check onboarding status
    if (session?.user?.id) {
      fetch('/api/account/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setUserProfile(data);
            if (data.profile && !data.profile.onboardingCompleted && !data.profile.onboardingSkipped) {
              setShowOnboarding(true);
            }
          }
        })
        .catch(() => {});
    }

    // Fetch suggestions
    fetch('/api/users/suggestions?limit=5')
      .then((r) => r.ok ? r.json() : { users: [] })
      .then((data) => setSuggestedUsers(data.users || []))
      .catch(() => {});

    // Fetch trending (top liked posts)
    fetch('/api/posts?limit=5')
      .then((r) => r.ok ? r.json() : { posts: [] })
      .then((data) => {
        const sorted = (data.posts || []).sort((a: Post, b: Post) => (b._count?.likes || 0) - (a._count?.likes || 0));
        setTrendingPosts(sorted.slice(0, 3));
      })
      .catch(() => {});

    // Fetch businesses
    fetch('/api/businesses?limit=4&featured=true')
      .then((r) => r.ok ? r.json() : { businesses: [] })
      .then((data) => setBusinesses(data.businesses || []))
      .catch(() => {});

    // Fetch stats
    fetch('/api/stats/home')
      .then((r) => r.ok ? r.json() : {})
      .then((data: any) => setStats({
        posts: data.posts || 0,
        users: data.users || 0,
        businesses: data.businesses || 0,
      }))
      .catch(() => {});
  }, []);

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' });
      if (res.ok) {
        setSuggestedUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u))
        );
      }
    } catch (e) {}
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const filters: { key: FilterType; label: string; icon: typeof Heart }[] = [
    { key: 'all', label: 'الكل', icon: Compass },
    { key: 'posts', label: 'المنشورات', icon: ImageIcon },
    { key: 'reels', label: 'الريلز', icon: Film },
    { key: 'videos', label: 'الفيديوهات', icon: Video },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ─── LEFT SIDEBAR ─── */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
              <div className="sticky top-24 space-y-4">

                {/* Welcome Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface rounded-lg border border-border shadow-sm p-5 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center ${greeting.color}`}>
                        <GreetingIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${greeting.color}`}>{greeting.text}</p>
                        <p className="text-xs text-muted">{session?.user?.name || 'زائرتنا العزيزة'}</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{greeting.subText}</p>
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-surface rounded-lg border border-border shadow-sm p-4"
                >
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-md bg-primary/10">
                      <div className="text-lg font-bold text-primary">{stats.posts || '---'}</div>
                      <div className="text-[10px] text-muted">منشور</div>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/10">
                      <div className="text-lg font-bold text-secondary">{stats.users || '---'}</div>
                      <div className="text-[10px] text-muted">مستخدم</div>
                    </div>
                    <div className="p-2 rounded-md bg-accent/10">
                      <div className="text-lg font-bold text-accent">{stats.businesses || '---'}</div>
                      <div className="text-[10px] text-muted">عمل</div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
                >
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">استكشفي</h3>
                  </div>
                  <div className="divide-y divide-border">
                    <Link href="/reels" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Film className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary-dark transition-colors">الريلز</span>
                    </Link>
                    <Link href="/businesses" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-secondary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary-dark transition-colors">الأعمال</span>
                    </Link>
                    <Link href="/groups" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary-dark transition-colors">المجموعات</span>
                    </Link>
                    <Link href="/ladies-gate" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                      <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
                        <Star className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm text-foreground group-hover:text-primary-dark transition-colors">البوابة العامة</span>
                    </Link>
                  </div>
                </motion.div>

                {/* Footer */}
                <div className="px-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted">
                  <Link href="/" className="hover:text-foreground">عن Gateo</Link>
                  <Link href="/" className="hover:text-foreground">الشروط</Link>
                  <Link href="/" className="hover:text-foreground">الخصوصية</Link>
                  <span>Gateo © 2026</span>
                </div>
              </div>
            </div>

            {/* ─── CENTER FEED ─── */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-4">

              {/* Mobile Welcome */}
              <div className="lg:hidden bg-surface rounded-lg border border-border shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-md bg-slate-50 flex items-center justify-center ${greeting.color}`}>
                  <GreetingIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${greeting.color}`}>{greeting.text}، {session?.user?.name || ''}</p>
                  <p className="text-xs text-muted">{greeting.subText}</p>
                </div>
              </div>

              {/* Hero Ad */}
              <AdBanner />

              {/* Create Post */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg border border-border shadow-sm p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={session?.user?.image || '/logo/favicon.svg'}
                    alt={session?.user?.name || 'صورة المستخدم'}
                    className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex-1 text-right px-4 py-2.5 rounded-md border border-border text-muted text-sm hover:bg-slate-50 hover:border-primary/30 transition-all"
                  >
                    شارك أفكارك وإبداعاتك...
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-slate-50 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline">صورة</span>
                  </button>
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-slate-50 transition-colors"
                  >
                    <Video className="w-4 h-4 text-success" />
                    <span className="hidden sm:inline">فيديو</span>
                  </button>
                  <button
                    onClick={() => router.push('/create-post?type=reel')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-slate-50 transition-colors"
                  >
                    <Film className="w-4 h-4 text-primary" />
                    <span className="hidden sm:inline">ريل</span>
                  </button>
                  <button
                    onClick={() => router.push('/create-post')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-foreground hover:bg-slate-50 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4 text-accent" />
                    <span className="hidden sm:inline">حدث</span>
                  </button>
                </div>
              </motion.div>

              {/* Stories */}
              <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
                <StoriesBar />
              </div>

              {/* Filters */}
              <div className="bg-surface rounded-lg border border-border shadow-sm p-2 flex gap-1 overflow-x-auto">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === f.key
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-slate-50'
                    }`}
                  >
                    <f.icon className="w-4 h-4" />
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Posts Feed */}
              <AnimatePresence mode="wait">
                {loading && posts.length === 0 ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-surface rounded-lg border border-border shadow-sm p-8 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton circle className="w-10 h-10" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-64 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </motion.div>
                ) : posts.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState
                      icon={MessageCircle}
                      title="لا توجد منشورات بعد"
                      description="كني أولى من يشارك في هذه الفئة"
                      actionLabel="إنشاء منشور"
                      onAction={() => router.push('/create-post')}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-0"
                  >
                    {posts.map((post, index) => (
                      <Fragment key={post.id}>
                        <PostCard
                          post={post}
                          currentUserId={session?.user?.id}
                          onDelete={handleDelete}
                        />
                        {index === 2 && <FeedAdCard />}
                      </Fragment>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Load More */}
              {hasMore && posts.length > 0 && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-md bg-surface border border-border text-foreground font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </div>

            {/* ─── RIGHT SIDEBAR ─── */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
              <div className="sticky top-24 space-y-4">

                {/* Sidebar Ad */}
                <AdSidebar />

                {/* Suggested Users */}
                {suggestedUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-foreground">أشخاص قد تعرفهم</h3>
                      <Users className="w-4 h-4 text-muted" />
                    </div>
                    <div className="divide-y divide-border">
                      {suggestedUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                          <Link href={`/profile/${user.id}`} className="flex-shrink-0">
                            <img
                              src={user.avatar || '/logo/favicon.svg'}
                              alt={user.name || ''}
                              className="w-9 h-9 rounded-full object-cover border border-border hover:scale-105 transition-transform"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/profile/${user.id}`} className="text-sm font-medium text-foreground hover:text-primary-dark transition-colors truncate block">
                              {user.name || 'مستخدم'}
                            </Link>
                            <p className="text-[11px] text-muted">{user._count?.followers || 0} متابع</p>
                          </div>
                          <button
                            onClick={() => handleFollow(user.id)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                              user.isFollowing
                                ? 'bg-slate-100 text-foreground hover:bg-slate-200'
                                : 'bg-primary text-white hover:bg-primary-dark'
                            }`}
                          >
                            {user.isFollowing ? 'متابَع' : 'متابعة'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/search"
                      className="block px-4 py-3 text-xs font-medium text-primary hover:text-primary-dark hover:bg-slate-50 transition-colors border-t border-border"
                    >
                      عرض المزيد
                    </Link>
                  </motion.div>
                )}

                {/* Trending Posts */}
                {trendingPosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-foreground">الأكثر تفاعلاً</h3>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div className="divide-y divide-border">
                      {trendingPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/post/${post.id}`}
                          className="block px-4 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-10 h-10 rounded-md bg-slate-100 flex-shrink-0 overflow-hidden">
                              {Array.isArray(post.images) && post.images.length > 0 ? (
                                <img src={post.images[0]} alt="محتوى المنشور" className="w-full h-full object-cover" />
                              ) : post.video ? (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                  <Video className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                  <MessageCircle className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground group-hover:text-primary-dark transition-colors line-clamp-2">
                                {post.content || 'منشور بدون نص'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] text-muted flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {post._count?.likes || 0}
                                </span>
                                <span className="text-[11px] text-muted flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {post._count?.comments || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Business Suggestions */}
                {businesses.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-foreground">أعمال مميزة</h3>
                      <Star className="w-4 h-4 text-accent" />
                    </div>
                    <div className="divide-y divide-border">
                      {businesses.map((biz) => (
                        <Link
                          key={biz.id}
                          href={`/business/${biz.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group"
                        >
                          <img
                            src={biz.logo || '/logo/favicon.svg'}
                            alt={biz.name}
                            className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary-dark transition-colors">
                              {biz.name}
                            </p>
                            <p className="text-[11px] text-muted">{biz.category?.name || 'عمل تجاري'}</p>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-border" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Promo */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-primary rounded-lg shadow-sm p-5 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <h3 className="font-semibold text-sm mb-1">أنشئ حسابك التجاري</h3>
                    <p className="text-xs text-white/80 mb-3 leading-relaxed">
                      احصلي على موقع إلكتروني خاص وحلول حجز متكاملة
                    </p>
                    <Link
                      href="/business/apply/start"
                      className="inline-block px-4 py-2 bg-surface text-primary text-xs font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      ابدأ الآن
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          router.push('/upgrade?phase=profile&from=onboarding');
        }}
        onSkip={async () => {
          try {
            await fetch('/api/account/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ onboardingSkipped: true }),
            });
            setUserProfile((prev: any) =>
              prev
                ? {
                    ...prev,
                    profile: { ...prev.profile, onboardingSkipped: true },
                  }
                : prev
            );
          } catch {
            // ignore
          }
          setShowOnboarding(false);
        }}
      />

      <ProfileCompletionPrompt
        isOpen={showCompletionPrompt}
        onClose={() => setShowCompletionPrompt(false)}
        completionPercent={userProfile?.completionPercent || 0}
      />
    </>
  );
}
