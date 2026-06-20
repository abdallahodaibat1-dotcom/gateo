'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import {
  Loader2, ShieldCheck, MapPin, Mail, Globe, Phone, MessageCircle,
  BriefcaseBusiness, GraduationCap, Award, CheckCircle, Clock,
  Image as ImageIcon, MapPinned, Star, Calendar, ArrowRight,
  User, ExternalLink, AlertCircle, List, Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DynamicFieldRenderer } from '@/components/dynamic-fields/DynamicFieldRenderer';

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

interface ProfessionalProfile {
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
  fieldValues: { field: { id: string; name: string; label: string; fieldType: string; options: any }; value: string | null }[];
}

interface ProfileUser {
  id: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  professionalProfile?: ProfessionalProfile | null;
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 space-y-4">
      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <Skeleton className="h-32 w-full" />
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex items-end justify-between">
            <Skeleton circle className="w-24 h-24 border-4 border-surface" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-7 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-4" />
          <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-border">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>
      <div className="bg-surface rounded-lg border border-border shadow-sm p-5">
        <Skeleton className="h-4 w-1/4 mb-3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6 mt-2" />
      </div>
    </div>
  );
}

export default function BusinessProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const prof = user?.professionalProfile;
  const isOwnProfile = session?.user?.id === id;
  const isActive = prof?.status === 'ACTIVE';

  useEffect(() => {
    if (!id) return;
    resolveProfile();
  }, [id]);

  const parseJsonArray = (value: unknown): any[] | null => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const resolveProfile = async () => {
    try {
      // If the id refers to a commercial business, redirect to its custom home page.
      const businessRes = await fetch(`/api/businesses/${id}`);
      if (businessRes.ok) {
        const businessData = await businessRes.json();
        const homePage = businessData.business?.pages?.find((p: any) => p.isHomePage);
        router.replace(`/business/${businessData.business.slug || businessData.business.id}/${homePage?.slug || 'home'}`);
        return;
      }
    } catch {
      // ignore and fall through to professional profile
    }

    await fetchProfile();
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.professionalProfile) {
          data.professionalProfile.services = parseJsonArray(data.professionalProfile.services);
          data.professionalProfile.portfolioProjects = parseJsonArray(data.professionalProfile.portfolioProjects);
          data.professionalProfile.socialLinks = (() => {
            const v = data.professionalProfile.socialLinks;
            if (v && typeof v === 'object') return v;
            if (typeof v === 'string') {
              try { return JSON.parse(v); } catch { return null; }
            }
            return null;
          })();
        }
        setUser(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  const formatPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };

  const contactPhone = formatPhone(prof?.whatsapp || prof?.phone);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 pt-20 pb-10" dir="rtl">
          <ProfileSkeleton />
        </main>
      </>
    );
  }

  if (!user || !prof) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-10 min-h-screen bg-slate-50" dir="rtl">
          <div className="max-w-md mx-auto px-4">
            <EmptyState
              icon={AlertCircle}
              title="الملف الاحترافي غير متاح"
              description="لا يوجد ملف أعمال احترافي عام لهذا المستخدم."
              actionLabel="العودة إلى دليل الأعمال الاحترافية"
              onAction={() => router.push('/businesses')}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-3xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted mb-4">
            <Link href="/businesses" className="hover:text-primary transition-colors">دليل الأعمال الاحترافية</Link>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            {prof.category && (
              <Link href={`/businesses/${prof.category.slug}`} className="hover:text-primary transition-colors">
                {prof.category.name}
              </Link>
            )}
          </div>

          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-4"
          >
            <div className="h-32 bg-gradient-to-r from-primary to-primary-dark" />
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4 flex items-end justify-between">
                <img
                  src={prof.personalLogo || user.avatar || '/logo/favicon.svg'}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover border-4 border-surface shadow-lg bg-surface"
                />
                {prof.isVerified && (
                  <div className="mb-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    محترف موثق
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">{user.name || 'محترف'}</h1>
                {prof.title && (
                  <p className="text-primary font-medium text-base mt-1">{prof.title}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted">
                  {prof.category && (
                    <Link
                      href={`/businesses/${prof.category.slug}`}
                      className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {prof.category.name}
                    </Link>
                  )}
                  {prof.subcategory && (
                    <span className="text-xs text-muted bg-slate-50 px-2.5 py-1 rounded-full">
                      {prof.subcategory.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    انضم {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-border">
                <div className="text-center bg-slate-50 rounded-lg p-3 border border-border">
                  <div className="text-xl font-bold text-primary">{prof.experienceYears || 0}</div>
                  <div className="text-xs text-muted">سنوات خبرة</div>
                </div>
                <div className="text-center bg-slate-50 rounded-lg p-3 border border-border">
                  <div className="text-xl font-bold text-primary">{prof.completedProjectsCount}</div>
                  <div className="text-xs text-muted">مشروع</div>
                </div>
                <div className="text-center bg-slate-50 rounded-lg p-3 border border-border">
                  <div className="text-xl font-bold text-primary">{prof.clientsCount}</div>
                  <div className="text-xs text-muted">عميل</div>
                </div>
              </div>

              {/* Availability chips */}
              <div className="flex flex-wrap gap-2 mt-4">
                {prof.availableForWork && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
                    <CheckCircle className="w-3 h-3" />
                    متاح للعمل
                  </span>
                )}
                {prof.availableForHiring && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <Building2 className="w-3 h-3" />
                    متاح للتوظيف
                  </span>
                )}
                {prof.availableForFreelance && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium border border-warning/20">
                    <BriefcaseBusiness className="w-3 h-3" />
                    عمل حر
                  </span>
                )}
                {prof.availableForConsultation && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-info/10 text-info text-xs font-medium border border-info/20">
                    <User className="w-3 h-3" />
                    استشارات
                  </span>
                )}
              </div>

              {/* Contact Actions */}
              {!isOwnProfile && (
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleSendMessage}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-foreground text-white text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      رسالة
                    </button>
                    {contactPhone && (
                      <>
                        <a
                          href={`tel:${contactPhone}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          اتصال
                        </a>
                        <a
                          href={`https://wa.me/${contactPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          واتساب
                        </a>
                      </>
                    )}
                    {!contactPhone && (
                      <a
                        href={`mailto:${prof.email || ''}`}
                        className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        بريد
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Status warning if not active */}
              {!isActive && isOwnProfile && (
                <div className="mt-5 p-4 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-medium">ملفك المهني قيد المراجعة</p>
                      <p className="text-amber-700/80 mt-0.5">
                        سيتم نشر ملفك تلقائياً بمجرد اعتماده من الإدارة.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bio */}
          {prof.bio && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                <User className="w-4 h-4 text-primary" />
                نبذة تعريفية
              </h3>
              <p className="text-muted text-sm leading-relaxed">{prof.bio}</p>
            </motion.div>
          )}

          {/* Dynamic Fields */}
          {prof.fieldValues && prof.fieldValues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                <List className="w-4 h-4 text-primary" />
                تفاصيل إضافية
              </h3>
              <DynamicFieldRenderer fieldValues={prof.fieldValues} />
            </motion.div>
          )}

          {/* Qualifications */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4"
          >
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
              {prof.professionalAccreditations && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">الاعتمادات المهنية</p>
                    <p className="text-xs text-muted">{prof.professionalAccreditations}</p>
                  </div>
                </div>
              )}
              {prof.courses && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">الدورات التدريبية</p>
                    <p className="text-xs text-muted">{prof.courses}</p>
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
                      <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Services */}
          {prof.services && prof.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4"
            >
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
            </motion.div>
          )}

          {/* Portfolio */}
          {prof.portfolioProjects && prof.portfolioProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4"
            >
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
            </motion.div>
          )}

          {/* Contact & Location */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            id="contact"
            className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4"
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
              <MapPinned className="w-4 h-4 text-primary" />
              التواصل والموقع
            </h3>
            <div className="space-y-2 text-sm">
              {prof.city && (
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {prof.city}
                  {prof.country && <span><Globe className="w-3 h-3 inline ml-1" /> {prof.country.name}</span>}
                </div>
              )}
              {prof.workScope && (
                <div className="flex items-center gap-2 text-muted">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {prof.workScope === 'REMOTE' ? 'عمل عن بُعد' : prof.workScope === 'IN_PERSON' ? 'عمل حضوري' : 'عمل حضوري وعن بُعد'}
                </div>
              )}
              {prof.willingToTravel && (
                <div className="flex items-center gap-2 text-muted">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  مستعد للسفر
                </div>
              )}
              {prof.email && (
                <a href={`mailto:${prof.email}`} className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {prof.email}
                </a>
              )}
              {prof.website && (
                <a
                  href={prof.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  {prof.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {prof.phone && (
                <a href={`tel:${formatPhone(prof.phone)}`} className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {prof.phone}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="التواصل مع المحترف"
        description="يجب تسجيل الدخول أو إنشاء حساب للتواصل مع المحترفين."
      />
    </>
  );
}
