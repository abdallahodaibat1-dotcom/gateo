'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import {
  Loader2,
  Search,
  X,
  User,
  Store,
  FileText,
  Users,
  LayoutGrid,
  MapPin,
  Star,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type SearchTab = 'all' | 'users' | 'businesses' | 'posts' | 'groups';

interface SearchUser {
  id: string;
  name: string | null;
  avatar: string | null;
  _count?: { followers: number };
}

interface SearchBusiness {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  cover: string | null;
  city: string | null;
  avgRating: number;
  reviewCount: number;
  category: { id: string; name: string } | null;
}

interface SearchPost {
  id: string;
  content: string | null;
  images: any;
  video: string | null;
  location: string | null;
  createdAt: string;
  isPublic: boolean;
  isLiked: boolean;
  isSaved: boolean;
  user: { id: string; name: string | null; avatar: string | null } | null;
  business: { id: string; name: string | null; logo: string | null } | null;
  _count: { likes: number; comments: number };
}

interface SearchGroup {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  _count?: { members: number };
}

interface SearchResults {
  users: SearchUser[];
  businesses: SearchBusiness[];
  posts: SearchPost[];
  groups: SearchGroup[];
}

interface Suggestion {
  id: string;
  type: 'user' | 'business' | 'group';
  name: string;
  image: string | null;
  subtitle?: string;
}

const tabs: { key: SearchTab; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'الكل', icon: LayoutGrid },
  { key: 'users', label: 'المستخدمين', icon: User },
  { key: 'businesses', label: 'الأعمال', icon: Store },
  { key: 'posts', label: 'المنشورات', icon: FileText },
  { key: 'groups', label: 'المجموعات', icon: Users },
];

function SearchResultSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 flex items-center gap-3">
          <Skeleton circle className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as SearchTab) || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gateo_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    try {
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item !== q);
        const updated = [q, ...filtered].slice(0, 8);
        localStorage.setItem('gateo_recent_searches', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {}
  }, []);

  // Fetch search results
  const fetchResults = useCallback(
    async (q: string, tab: SearchTab) => {
      if (!q.trim()) {
        setResults(null);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams();
        params.set('q', q.trim());
        if (tab !== 'all') {
          params.set('type', tab);
        }
        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            users: data.users || [],
            businesses: data.businesses || [],
            posts: data.posts || [],
            groups: data.groups || [],
          });
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (e) {
      setSuggestions([]);
    }
  }, []);

  // Debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Initial search from URL
  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery, initialTab);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when search/tab changes
  const updateUrl = useCallback(
    (q: string, tab: SearchTab) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (tab !== 'all') params.set('tab', tab);
      const url = `/search${params.toString() ? `?${params}` : ''}`;
      router.replace(url, { scroll: false });
    },
    [router]
  );

  const handleSearch = useCallback(
    (q: string, tab: SearchTab) => {
      setQuery(q);
      setActiveTab(tab);
      setShowSuggestions(false);
      updateUrl(q, tab);
      fetchResults(q, tab);
      if (q.trim()) {
        saveRecentSearch(q.trim());
      }
    },
    [fetchResults, updateUrl, saveRecentSearch]
  );

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    updateUrl(query, tab);
    if (query.trim()) {
      fetchResults(query, tab);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setSearched(false);
    setSuggestions([]);
    updateUrl('', activeTab);
    inputRef.current?.focus();
  };

  const removeRecentSearch = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== item);
      localStorage.setItem('gateo_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults =
    (results?.users?.length || 0) +
    (results?.businesses?.length || 0) +
    (results?.posts?.length || 0) +
    (results?.groups?.length || 0);

  const getFilteredResults = () => {
    if (!results) return results;
    if (activeTab === 'all') return results;
    return {
      users: activeTab === 'users' ? results.users : [],
      businesses: activeTab === 'businesses' ? results.businesses : [],
      posts: activeTab === 'posts' ? results.posts : [],
      groups: activeTab === 'groups' ? results.groups : [],
    };
  };

  const filtered = getFilteredResults();

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          {/* Search Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm pb-4 pt-2"
          >
            <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
              {/* Search Input */}
              <div className="relative flex items-center">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  ref={inputRef}
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(query, activeTab);
                    }
                  }}
                  placeholder="ابحث عن مستخدمين، أعمال، منشورات..."
                  className="w-full pr-12 pl-12 py-4 text-foreground placeholder:text-muted focus:outline-none text-base bg-transparent"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="مسح البحث"
                  >
                    <X className="w-4 h-4 text-muted" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (query.trim().length > 0 || recentSearches.length > 0) && !searched && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border"
                  >
                    {query.trim().length > 0 && suggestions.length > 0 && (
                      <div className="py-2">
                        {suggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.type}-${suggestion.id}`}
                            onClick={() => {
                              handleSearch(suggestion.name, activeTab);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-right"
                          >
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {suggestion.type === 'user' && <User className="w-4 h-4 text-primary" />}
                              {suggestion.type === 'business' && <Store className="w-4 h-4 text-primary" />}
                              {suggestion.type === 'group' && <Users className="w-4 h-4 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{suggestion.name}</div>
                              {suggestion.subtitle && (
                                <div className="text-xs text-muted">{suggestion.subtitle}</div>
                              )}
                            </div>
                            <Search className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && !query.trim() && (
                      <div className="py-2">
                        <div className="px-4 py-1.5 text-xs font-medium text-muted flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          عمليات البحث الأخيرة
                        </div>
                        {recentSearches.map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition-colors group"
                          >
                            <button
                              onClick={() => handleSearch(item, activeTab)}
                              className="flex-1 flex items-center gap-3 text-right"
                            >
                              <Clock className="w-4 h-4 text-slate-300" />
                              <span className="text-sm text-foreground">{item}</span>
                            </button>
                            <button
                              onClick={(e) => removeRecentSearch(item, e)}
                              className="p-1 rounded-full hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="حذف من البحث الأخير"
                            >
                              <X className="w-3.5 h-3.5 text-muted" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {query.trim().length > 0 && suggestions.length === 0 && !loading && (
                      <div className="px-4 py-3 text-sm text-muted text-center">
                        اضغط Enter للبحث عن &quot;{query.trim()}&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tabs */}
            {searched && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const count =
                    tab.key === 'all'
                      ? totalResults
                      : tab.key === 'users'
                      ? results?.users?.length || 0
                      : tab.key === 'businesses'
                      ? results?.businesses?.length || 0
                      : tab.key === 'posts'
                      ? results?.posts?.length || 0
                      : results?.groups?.length || 0;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === tab.key
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-surface text-foreground hover:bg-slate-100 border border-border'
                      }`}
                      aria-pressed={activeTab === tab.key}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {searched && count > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100 text-muted'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="mt-4">
              <SearchResultSkeleton />
            </div>
          ) : searched && filtered ? (
            <div className="space-y-6 mt-4">
              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && filtered.users && filtered.users.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        المستخدمين
                      </h2>
                      {(results?.users?.length || 0) > 3 && (
                        <button
                          onClick={() => handleTabChange('users')}
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeTab === 'all' ? filtered.users.slice(0, 3) : filtered.users).map((user) => (
                      <Link key={user.id} href={`/profile/${user.id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-surface rounded-lg shadow-sm border border-border p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all"
                        >
                          <img
                            src={user.avatar || '/logo/favicon.svg'}
                            alt={user.name || ''}
                            className="w-12 h-12 rounded-full object-cover border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground text-sm truncate">{user.name || 'مستخدم'}</div>
                            <div className="text-xs text-muted">
                              {user._count?.followers || 0} متابع
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Businesses */}
              {(activeTab === 'all' || activeTab === 'businesses') && filtered.businesses && filtered.businesses.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary" />
                        الأعمال
                      </h2>
                      {(results?.businesses?.length || 0) > 3 && (
                        <button
                          onClick={() => handleTabChange('businesses')}
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeTab === 'all' ? filtered.businesses.slice(0, 3) : filtered.businesses).map((business) => (
                      <Link key={business.id} href={`/business/${business.id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
                        >
                          <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 relative">
                            {business.cover && (
                              <img src={business.cover} alt={business.name || 'صورة الغلاف'} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute bottom-2 right-3">
                              <img
                                src={business.logo || '/logo/favicon.svg'}
                                alt={business.name || 'شعار النشاط'}
                                className="w-12 h-12 rounded-lg object-cover border-2 border-surface shadow-sm bg-surface"
                              />
                            </div>
                          </div>
                          <div className="p-3 pt-2">
                            <h3 className="font-bold text-sm text-foreground">{business.name}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              {business.category && (
                                <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                  {business.category.name}
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-medium text-foreground">{business.avgRating.toFixed(1)}</span>
                              </div>
                            </div>
                            {business.city && (
                              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted">
                                <MapPin className="w-3 h-3" />
                                {business.city}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Posts */}
              {(activeTab === 'all' || activeTab === 'posts') && filtered.posts && filtered.posts.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        المنشورات
                      </h2>
                      {(results?.posts?.length || 0) > 3 && (
                        <button
                          onClick={() => handleTabChange('posts')}
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    {(activeTab === 'all' ? filtered.posts.slice(0, 3) : filtered.posts).map((post) => (
                      <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
                    ))}
                  </div>
                </section>
              )}

              {/* Groups */}
              {(activeTab === 'all' || activeTab === 'groups') && filtered.groups && filtered.groups.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        المجموعات
                      </h2>
                      {(results?.groups?.length || 0) > 3 && (
                        <button
                          onClick={() => handleTabChange('groups')}
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          عرض الكل
                        </button>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(activeTab === 'all' ? filtered.groups.slice(0, 3) : filtered.groups).map((group) => (
                      <Link key={group.id} href={`/groups/${group.id}`}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-surface rounded-lg shadow-sm border border-border p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all"
                        >
                          <img
                            src={group.image || '/logo/favicon.svg'}
                            alt={group.name}
                            className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground text-sm truncate">{group.name}</div>
                            {group.description && (
                              <div className="text-xs text-muted truncate mt-0.5">{group.description}</div>
                            )}
                            <div className="text-xs text-muted mt-1">
                              {group._count?.members || 0} عضو
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {totalResults === 0 && (
                <EmptyState
                  icon={Search}
                  title="لا توجد نتائج"
                  description="جربي البحث بكلمات مختلفة أو تحققي من الإملاء"
                />
              )}
            </div>
          ) : !searched ? (
            /* Default State - Not searched yet */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">ابدأ البحث</h2>
              <p className="text-muted mb-8 max-w-sm mx-auto">
                اكتب كلمة البحث في الأعلى لتجدي مستخدمين، أعمال، منشورات، ومجموعات
              </p>

              {recentSearches.length > 0 && (
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-medium text-muted mb-3 flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    عمليات البحث الأخيرة
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSearch(item, activeTab)}
                        className="px-4 py-2 rounded-md bg-surface border border-border text-sm text-foreground hover:border-primary/30 hover:text-primary transition-all"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </main>
    </>
  );
}
