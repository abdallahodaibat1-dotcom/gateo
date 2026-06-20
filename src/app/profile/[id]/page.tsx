'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import OnboardingModal from '@/components/OnboardingModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Card from '@/components/ui/Card';
import {
  Loader2, UserCheck, UserPlus, Calendar, Store, ArrowRight, User, AlertCircle,
  TrendingUp, Award, Briefcase, Building2, Shield, MapPin, GraduationCap, Zap,
  LayoutDashboard, Pencil, Phone, Mail, Globe, MessageCircle, CheckCircle, Clock,
  Layers, MapPinned, BriefcaseBusiness, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ServiceItem {
  name: string;
  description?: string | null;
  startingPrice?: number | null;
  duration?: string | null;
}

interface PortfolioProject {
  title: string;
  description?: string | null;
  images?: string[];
  videos?: string[];
  files?: string[];
}

interface ProfessionalProfileFull {
  id: string;
  title: string | null;
  bio: string | null;
  personalLogo: string | null;
  skills: string | null;
  keywords: string | null;
  degree: string | null;
  academicSpecialization: string | null;
  experienceYears: number | null;
  courses: string | null;
  certifications: string | null;
  professionalAccreditations: string | null;
  services: ServiceItem[] | null;
  workScope: string;
  city: string | null;
  willingToTravel: boolean;
  languages: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  portfolioProjects: PortfolioProject[] | null;
  availableForWork: boolean;
  availableForHiring: boolean;
  availableForFreelance: boolean;
  availableForConsultation: boolean;
  completedProjectsCount: number;
  clientsCount: number;
  isVerified: boolean;
  status: string;
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  country: { id: string; name: string; flagEmoji: string } | null;
}

interface ProfileUser {
  id: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  accountType?: string;
  completionPercent?: number;
  profile?: {
    onboardingCompleted?: boolean;
    onboardingSkipped?: boolean;
    gender?: string;
    bio?: string;
    city?: string;
    country?: string;
  } | null;
  business?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    isVerified: boolean;
  } | null;
  professionalProfile?: ProfessionalProfileFull | null;
  _count?: { followers: number; following: number; posts: number };
}

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
  user: { id: string; name: string | null; avatar: string | null } | null;
  _count: { likes: number; comments: number };
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isOwnProfile = session?.user?.id === id;
  const prof = user?.professionalProfile;
  const isProfessional = user?.accountType === 'PROFESSIONAL' || !!prof;

  const hasAccountOptions =
    (user?.completionPercent || 0) < 100 || !user?.professionalProfile || !user?.business;

  useEffect(() => {
    if (!id) return;
    fetchProfile();
    fetchPosts();
    if (!isOwnProfile && session?.user?.id) {
      checkFollowStatus();
    }
  }, [id, session?.user?.id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?page=1&limit=50`);
      if (res.ok) {
        const data = await res.json();
        const userPosts = data.posts.filter((p: Post) => p.user?.id === id);
        setPosts(userPosts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/users/${id}/followers`);
      if (res.ok) {
        const data = await res.json();
        const isFollowed = data.followers.some((f: any) => f.id === session?.user?.id);
        setIsFollowing(isFollowed);
      }
    } catch (e) {}
  };

  const handleFollow = async () => {
    if (!session?.user?.id) {
      setShowAuthModal(true);
      return;
    }
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${id}/follow`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
      }
    } catch (e) {}
    setFollowLoading(false);
  };

  const handleSendMessage = async () => {
    if (!session?.user?.id) {
      setShowAuthModal(true);
      return;
    }
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: [id] }),
      });
      const data = await res.json();
      if (data.conversation?.id) {
        router.push(`/conversations/${data.conversation.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const formatPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };

  const contactPhone = formatPhone(prof?.whatsapp || prof?.phone);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 pb-10 min-h-screen bg-slate-50">
          <div className="max-w-xl mx-auto px-4">
            <Card padding="none" shadow="sm">
              <Skeleton className="h-32 w-full" />
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <Skeleton circle className="w-24 h-24 border-4 border-surface" />
                </div>
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="grid grid-cols-3 gap-2 pt-5 border-t border-border">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="none" shadow="sm" className="mb-4 overflow-hidden">
              <div className="h-32 bg-primary" />
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <img
                    src={prof?.personalLogo || user?.avatar || '/logo/favicon.svg'}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-lg bg-surface"
                  />
                  {prof?.isVerified && (
                    <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-surface">
                      <Shield className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate">{user?.name || 'مستخدم'}</h1>
                    {prof?.title && (
                      <p className="text-primary font-medium text-sm mt-1 truncate">{prof.title}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted">
                      {prof?.category && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          <Layers className="w-3.5 h-3.5" />
                          {prof.category.name}
                        </span>
                      )}
                      {prof?.subcategory && (
                        <span className="text-xs bg-slate-100 text-muted px-2 py-0.5 rounded-full">
                          {prof.subcategory.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        انضم {new Date(user?.createdAt || Date.now()).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium text-sm transition-colors ${
                        isFollowing
                          ? 'bg-slate-100 text-foreground hover:bg-slate-200'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          متابع
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          متابعة
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Professional Quick Stats */}
                {prof && (
                  <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-border">
                    <div className="text-center bg-surface border border-border rounded-lg p-2">
                      <div className="text-lg font-bold text-primary">{prof.experienceYears || 0}</div>
                      <div className="text-[10px] text-muted">سنوات خبرة</div>
                    </div>
                    <div className="text-center bg-surface border border-border rounded-lg p-2">
                      <div className="text-lg font-bold text-primary">{prof.completedProjectsCount}</div>
                      <div className="text-[10px] text-muted">مشروع</div>
                    </div>
                    <div className="text-center bg-surface border border-border rounded-lg p-2">
                      <div className="text-lg font-bold text-primary">{prof.clientsCount}</div>
                      <div className="text-[10px] text-muted">عميل</div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                {!prof && (
                  <div className="flex items-center gap-6 mt-5 pt-5 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{posts.length}</div>
                      <div className="text-xs text-muted">منشور</div>
                    </div>
                    <Link href={`/profile/${id}/followers`} className="text-center">
                      <div className="text-lg font-bold text-foreground">{user?._count?.followers || 0}</div>
                      <div className="text-xs text-muted">متابع</div>
                    </Link>
                    <Link href={`/profile/${id}/following`} className="text-center">
                      <div className="text-lg font-bold text-foreground">{user?._count?.following || 0}</div>
                      <div className="text-xs text-muted">يتابع</div>
                    </Link>
                  </div>
                )}

                {/* Profile Strength Indicator */}
                {isOwnProfile && (
                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        قوة الحساب
                      </span>
                      <span className="text-sm font-bold text-primary">{user?.completionPercent || 0}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${user?.completionPercent || 0}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <p className="text-xs text-muted mt-1.5">
                      {(user?.completionPercent || 0) >= 80
                        ? 'ملفك قوي ومكتمل. استمر في التميز!'
                        : (user?.completionPercent || 0) >= 50
                        ? 'ملفك في مستوى جيد. أكمل النقص لزيادة ظهورك.'
                        : 'أكمل ملفك لزيادة فرص التواصل والظهور في المنصة.'}
                    </p>
                  </div>
                )}

                {/* Contact Actions */}
                {prof && !isOwnProfile && (
                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={handleSendMessage}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        رسالة
                      </button>
                      {contactPhone && (
                        <>
                          <a
                            href={`tel:${contactPhone}`}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            اتصال
                          </a>
                          <a
                            href={`https://wa.me/${contactPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            واتساب
                          </a>
                        </>
                      )}
                      {!contactPhone && (
                        <a
                          href={`mailto:${prof.email || ''}`}
                          className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          بريد
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Profile Control Panel */}
                {isOwnProfile && (
                  <div className="mt-5 pt-5 border-t border-border space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      لوحة تحكم الملف الشخصي
                    </h3>

                    <Link
                      href="/profile/edit"
                      className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Pencil className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground">تعديل الملف الشخصي</h4>
                        <p className="text-xs text-muted">تحديث الصورة والبيانات الشخصية</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </Link>

                    {user?.professionalProfile && (
                      <Link
                        href="/professional/apply"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">
                              {user.professionalProfile.title || 'ملف المحترف'}
                            </h4>
                            {user.professionalProfile.isVerified && (
                              <Shield className="w-3.5 h-3.5 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs mt-0.5">
                            <span className={`px-2 py-0.5 rounded-full ${
                              user.professionalProfile.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : user.professionalProfile.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.professionalProfile.status === 'ACTIVE' ? 'نشط' : user.professionalProfile.status === 'PENDING' ? 'قيد المراجعة' : 'غير نشط'}
                            </span>
                            <span className="text-muted">تعديل ملف المحترف</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      </Link>
                    )}

                    {user?.business && (
                      <>
                        <Link
                          href={`/business/${user.business.slug || user.business.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Store className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground">{user.business.name}</h4>
                              {user.business.isVerified && (
                                <Shield className="w-3.5 h-3.5 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs mt-0.5">
                              <span className={`px-2 py-0.5 rounded-full ${
                                user.business.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : user.business.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {user.business.status === 'ACTIVE' ? 'نشط' : user.business.status === 'PENDING' ? 'قيد المراجعة' : 'غير نشط'}
                              </span>
                              <span className="text-muted">صفحة النشاط التجاري</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                        </Link>

                        <Link
                          href="/business-dashboard"
                          className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-foreground">لوحة إدارة النشاط</h4>
                            <p className="text-xs text-muted">إدارة الخدمات والحجوزات والتقييمات</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                        </Link>
                      </>
                    )}
                  </div>
                )}

                {/* Account Services / Options */}
                {isOwnProfile && hasAccountOptions && (
                  <div className="mt-5 pt-5 border-t border-border space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      خيارات الحساب
                    </h3>

                    {(user?.completionPercent || 0) < 100 && (
                      <Link
                        href="/profile/edit"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-foreground">استكمال الملف الشخصي</h4>
                          <p className="text-xs text-muted">أضف المعلومات الناقصة لرفع قوة حسابك</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      </Link>
                    )}

                    {user?.accountType === 'USER' && !user?.professionalProfile && (
                      <Link
                        href="/upgrade"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-foreground">ترقية إلى حساب احترافي</h4>
                          <p className="text-xs text-muted">احصل على مزايا إضافية وخيارات عمل متقدمة</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      </Link>
                    )}

                    {!user?.professionalProfile && (
                      <Link
                        href="/professional/apply"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-foreground">الانضمام لدليل المحترفين</h4>
                          <p className="text-xs text-muted">اعرض مهاراتك وخدماتك للعملاء والشركات</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      </Link>
                    )}

                    {!user?.business && (
                      <Link
                        href="/business/apply"
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-foreground">تسجيل نشاط تجاري</h4>
                          <p className="text-xs text-muted">أضف نشاطك التجاري للدليل العام</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Professional Bio */}
          {prof?.bio && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                  <User className="w-4 h-4 text-primary" />
                  نبذة تعريفية
                </h3>
                <p className="text-muted text-sm leading-relaxed">{prof.bio}</p>
              </Card>
            </motion.div>
          )}

          {/* Professional Details */}
          {prof && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  المؤهلات والخبرات
                </h3>
                <div className="space-y-3">
                  {prof.degree && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{prof.degree}</p>
                        {prof.academicSpecialization && (
                          <p className="text-xs text-muted">{prof.academicSpecialization}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {prof.experienceYears ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{prof.experienceYears} سنوات خبرة</p>
                        <p className="text-xs text-muted">خبرة عملية في المجال</p>
                      </div>
                    </div>
                  ) : null}
                  {prof.certifications && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">الشهادات والاعتمادات</p>
                        <p className="text-xs text-muted">{prof.certifications}</p>
                      </div>
                    </div>
                  )}
                  {prof.skills && (
                    <div className="pt-2">
                      <p className="text-xs text-muted mb-2">المهارات</p>
                      <div className="flex flex-wrap gap-1.5">
                        {prof.skills.split(',').map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-foreground text-xs">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {prof.languages && (
                    <div className="pt-2">
                      <p className="text-xs text-muted mb-2">اللغات</p>
                      <div className="flex flex-wrap gap-1.5">
                        {prof.languages.split(',').map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Professional Services */}
          {prof?.services && prof.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                  <BriefcaseBusiness className="w-4 h-4 text-primary" />
                  الخدمات المقدمة
                </h3>
                <div className="space-y-3">
                  {prof.services.map((svc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-foreground text-sm">{svc.name}</h4>
                        {svc.startingPrice ? (
                          <span className="text-primary font-bold text-sm">{svc.startingPrice} ر.س</span>
                        ) : null}
                      </div>
                      {svc.description && <p className="text-xs text-muted mb-2">{svc.description}</p>}
                      {svc.duration && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <Clock className="w-3 h-3" />
                          {svc.duration}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Portfolio Projects */}
          {prof?.portfolioProjects && prof.portfolioProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  معرض الأعمال
                </h3>
                <div className="space-y-4">
                  {prof.portfolioProjects.map((project, i) => (
                    <div key={i} className="rounded-lg border border-border overflow-hidden">
                      {project.images && project.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {project.images.slice(0, 2).map((img, idx) => (
                            <img key={idx} src={img} alt={project.title || 'صورة المشروع'} className="w-full h-32 object-cover" />
                          ))}
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-bold text-foreground text-sm">{project.title}</h4>
                        {project.description && <p className="text-xs text-muted mt-1">{project.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Contact Info */}
          {prof && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card id="contact" className="mb-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                  <MapPinned className="w-4 h-4 text-primary" />
                  التواصل والموقع
                </h3>
                <div className="space-y-2 text-sm">
                  {prof.city && (
                    <div className="flex items-center gap-2 text-muted">
                      <MapPin className="w-4 h-4 text-muted" />
                      {prof.city}
                      {prof.country && <span className="text-foreground">{prof.country.name}</span>}
                    </div>
                  )}
                  {prof.workScope && (
                    <div className="flex items-center gap-2 text-muted">
                      <Clock className="w-4 h-4 text-muted" />
                      {prof.workScope === 'REMOTE' ? 'عمل عن بُعد' : prof.workScope === 'IN_PERSON' ? 'عمل حضوري' : 'عمل حضوري وعن بُعد'}
                    </div>
                  )}
                  {prof.willingToTravel && (
                    <div className="flex items-center gap-2 text-muted">
                      <CheckCircle className="w-4 h-4 text-muted" />
                      مستعد للسفر
                    </div>
                  )}
                  {prof.email && (
                    <a href={`mailto:${prof.email}`} className="flex items-center gap-2 text-muted hover:text-primary-dark transition-colors">
                      <Mail className="w-4 h-4 text-muted" />
                      {prof.email}
                    </a>
                  )}
                  {prof.website && (
                    <a href={prof.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted hover:text-primary-dark transition-colors">
                      <Globe className="w-4 h-4 text-muted" />
                      {prof.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {prof.phone && (
                    <a href={`tel:${formatPhone(prof.phone)}`} className="flex items-center gap-2 text-muted hover:text-primary-dark transition-colors">
                      <Phone className="w-4 h-4 text-muted" />
                      {prof.phone}
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Onboarding reminder for own profile */}
          {isOwnProfile && user?.profile?.onboardingSkipped && !user?.profile?.onboardingCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4 border-amber-200 bg-amber-50/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm"> أكمل تحديد الجنس</h3>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                      اختيار الجنس يساعدنا في توجيه المحتوى والاهتمامات الأنسب لك.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch('/api/account/me', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ onboardingSkipped: false }),
                        });
                        setUser((prev) =>
                          prev
                            ? {
                                ...prev,
                                profile: { ...prev.profile, onboardingSkipped: false },
                              }
                            : prev
                        );
                        setShowOnboarding(true);
                      } catch {
                        // ignore
                      }
                    }}
                    className="shrink-0 px-4 py-2 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors"
                  >
                    إكمال الآن
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Posts */}
          {!isProfessional && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={session?.user?.id}
                  onDelete={isOwnProfile ? handleDeletePost : undefined}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
              ))}
            </div>
          )}

          {posts.length === 0 && !isProfessional && (
            <EmptyState
              icon={ImageIcon}
              title="لا توجد منشورات"
              description={isOwnProfile ? 'شارك لحظاتك مع الجميع!' : 'هذا المستخدم لم ينشر أي شيء بعد'}
              className="mt-6"
            />
          )}
        </div>
      </main>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          fetchProfile();
        }}
        onSkip={async () => {
          try {
            await fetch('/api/account/me', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ onboardingSkipped: true }),
            });
            fetchProfile();
          } catch {
            // ignore
          }
          setShowOnboarding(false);
        }}
      />

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="متابعة الحساب"
        description="للحفاظ على أمان حسابات المستخدمين، يجب تسجيل الدخول أو إنشاء حساب لمتابعة هذا الحساب أو التفاعل معه."
      />
    </>
  );
}
