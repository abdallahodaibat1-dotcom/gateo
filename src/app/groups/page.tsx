'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { EmptyState, Skeleton } from '@/components/ui';
import { Loader2, Search, Users, FileText, Lock, Globe, Plus, X, MessageCircle, Star, Sparkles, TrendingUp, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface Group {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isPublic: boolean;
  category: string | null;
  createdAt: string;
  _count: { members: number; posts: number };
  isMember?: boolean;
  memberRole?: string | null;
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    image: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchGroups();
      fetchMyGroups();
    }
  }, [status]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups?limit=50');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await fetch('/api/groups/my?limit=50');
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchGroups();
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search/groups?q=${encodeURIComponent(searchQuery)}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(handleSearch, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('يرجى اختيار صورة بصيغة JPEG, PNG, WebP, أو GIF', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setCreateForm((prev) => ({ ...prev, image: data.url }));
      } else {
        showToast(data.error || 'فشل في رفع الصورة', 'error');
      }
    } catch {
      showToast('فشل في رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setCreateError('يرجى إدخال اسم المجموعة');
      return;
    }
    setCreateError('');
    setCreateLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description || undefined,
          category: createForm.category || undefined,
          isPublic: createForm.isPublic,
          image: createForm.image || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        setCreateForm({ name: '', description: '', category: '', isPublic: true, image: '' });
        router.push(`/groups/${data.group.id}`);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'حدث خطأ غير متوقع' }));
        setCreateError(errorData.error || `خطأ ${res.status}: فشل في إنشاء المجموعة`);
      }
    } catch (e) {
      console.error(e);
      setCreateError('فشل الاتصال بالخادم، تأكد من اتصالك بالإنترنت');
    } finally {
      setCreateLoading(false);
    }
  };

  const displayedGroups = activeTab === 'my' ? myGroups : groups;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">المجموعات</h1>
                  <p className="text-sm text-muted mt-1">اكتشف مجموعات تهمك وانضم للنقاش</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white font-medium text-sm shadow-sm hover:bg-primary-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء مجموعة
                </button>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث في المجموعات..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                />
                {searchLoading && (
                  <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted" />
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-4 border-b border-border">
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'discover'
                      ? 'text-primary border-primary'
                      : 'text-muted border-transparent hover:text-foreground'
                  }`}
                >
                  استكشاف
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'my'
                      ? 'text-primary border-primary'
                      : 'text-muted border-transparent hover:text-foreground'
                  }`}
                >
                  مجموعاتي
                  {myGroups.length > 0 && (
                    <span className="mr-1.5 bg-slate-100 text-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {myGroups.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
                  <Skeleton className="h-36" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="w-2/3 h-5" />
                    <Skeleton className="w-full h-3" />
                    <Skeleton className="w-1/2 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedGroups.length === 0 ? (
            <EmptyState
              icon={Users}
              title={activeTab === 'my' ? 'لم تنضم لأي مجموعة بعد' : 'لا توجد مجموعات'}
              description={
                activeTab === 'my'
                  ? 'استكشف المجموعات وانضم للمجتمعات التي تهمك'
                  : 'جرّب البحث بكلمات مختلفة'
              }
              actionLabel={activeTab === 'my' ? 'استكشاف المجموعات' : 'إنشاء مجموعة'}
              onAction={() =>
                activeTab === 'my' ? setActiveTab('discover') : setShowCreateModal(true)
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-surface rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">إنشاء مجموعة جديدة</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
                <div>
                  <label htmlFor="group-name" className="block text-sm font-medium text-foreground mb-1">اسم المجموعة *</label>
                  <input
                    id="group-name"
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    placeholder="مثال: مجتمع مهني"
                  />
                </div>
                <div>
                  <label htmlFor="group-description" className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                  <textarea
                    id="group-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
                    placeholder="وصف مختصر للمجموعة..."
                  />
                </div>
                <div>
                  <label htmlFor="group-category" className="block text-sm font-medium text-foreground mb-1">التصنيف</label>
                  <input
                    id="group-category"
                    type="text"
                    value={createForm.category}
                    onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    placeholder="مثال: أعمال، تعليم، صحة، تكنولوجيا"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">صورة الغلاف</label>
                  {createForm.image && (
                    <div className="mb-2 w-full h-24 rounded-md overflow-hidden border border-border">
                      <img src={createForm.image} alt={createForm.name || 'صورة المجموعة'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="relative w-full px-4 py-2.5 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-center"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {uploadingImage ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري الرفع...</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted">
                        <span className="text-primary font-medium">اضغط لاختيار صورة</span>
                        <span className="mx-1">أو اسحبها هنا</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">JPEG, PNG, WebP, GIF — بحد أقصى 5 ميجابايت</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={createForm.isPublic}
                    onChange={(e) => setCreateForm((f) => ({ ...f, isPublic: e.target.checked }))}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPublic" className="text-sm text-foreground">
                    مجموعة عامة (يمكن للجميع الانضمام والمشاهدة)
                  </label>
                </div>
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 text-center">
                    {createError}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={createLoading || !createForm.name.trim()}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark disabled:opacity-50 transition-colors"
                  >
                    {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء المجموعة'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Unique cover color per group based on id hash
function getGroupCover(id: string): string {
  const covers = [
    'bg-blue-100',
    'bg-slate-200',
    'bg-sky-100',
    'bg-indigo-100',
    'bg-teal-100',
    'bg-cyan-100',
    'bg-gray-200',
    'bg-emerald-100',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return covers[Math.abs(hash) % covers.length];
}

function isNewGroup(createdAt: string): boolean {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days < 7;
}

function GroupCard({ group }: { group: Group }) {
  const coverClass = getGroupCover(group.id);
  const isNew = isNewGroup(group.createdAt);
  const isTrending = group._count.members >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
    >
      <Link href={`/groups/${group.id}`} className="block">
        {/* Cover */}
        <div className={`h-36 ${coverClass} relative overflow-hidden`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`pat-${group.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#pat-${group.id})`} />
            </svg>
          </div>

          {group.image && (
            <img
              src={group.image}
              alt={group.name}
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
            />
          )}

          {/* Floating labels */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {/* Public/Private badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-sm ${
              group.isPublic
                ? 'bg-white/80 text-foreground border border-border'
                : 'bg-surface/80 text-foreground border border-border'
            }`}>
              {group.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {group.isPublic ? 'عامة' : 'خاصة'}
            </span>

            {/* New badge */}
            {isNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm">
                <Sparkles className="w-3 h-3" />
                جديدة
              </span>
            )}

            {/* Trending badge */}
            {isTrending && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                <TrendingUp className="w-3 h-3" />
                نشط
              </span>
            )}

            {/* Admin badge */}
            {group.memberRole === 'ADMIN' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-white shadow-sm">
                <Star className="w-3 h-3" />
                مشرف
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4">
        <Link href={`/groups/${group.id}`}>
          <h3 className="font-bold text-foreground text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {group.name}
          </h3>
        </Link>
        {group.description && (
          <p className="text-sm text-muted line-clamp-2 mb-3 leading-relaxed">{group.description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-muted mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{group._count.members}</span>
            <span>عضو</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{group._count.posts}</span>
            <span>منشور</span>
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{group._count.posts}</span>
            <span>محادثة</span>
          </span>
        </div>

        {/* Category chip */}
        {group.category && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              {group.category}
            </span>
          </div>
        )}

        {/* Member status */}
        {group.isMember && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-600">
              عضو {group.memberRole === 'ADMIN' && '· مشرف'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
