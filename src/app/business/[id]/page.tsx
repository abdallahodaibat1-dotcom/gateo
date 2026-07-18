'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Globe,
  Phone,
  CheckCircle,
  Clock,
  Award,
  Star,
  GraduationCap,
  BriefcaseBusiness,
  User,
  List,
  Image as ImageIcon,
  MapPinned,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DynamicFieldRenderer } from '@/components/dynamic-fields/DynamicFieldRenderer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AvailabilityChips } from '@/components/profile/AvailabilityChips';
import { ContactActions } from '@/components/profile/ContactActions';
import { ProfileSection } from '@/components/profile/ProfileSection';

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
  customSubcategory?: string | null;
  subcategories: { id: string; name: string; slug: string }[] | null;
  customSubcategories: string[] | null;
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
            <ArrowLeft className="w-3.5 h-3.5 rtl-arrow" />
            {prof.category && (
              <Link href={`/businesses/${prof.category.slug}`} className="hover:text-primary transition-colors">
                {prof.category.name}
              </Link>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <ProfileHeader user={user} prof={prof} />

            <ProfileStats
              experienceYears={prof.experienceYears}
              completedProjectsCount={prof.completedProjectsCount}
              clientsCount={prof.clientsCount}
            />

            <AvailabilityChips
              availableForWork={prof.availableForWork}
              availableForHiring={prof.availableForHiring}
              availableForFreelance={prof.availableForFreelance}
              availableForConsultation={prof.availableForConsultation}
            />

            <ContactActions
              onSendMessage={handleSendMessage}
              phone={prof.phone}
              whatsapp={prof.whatsapp}
              email={prof.email}
              isOwnProfile={isOwnProfile}
            />

            {!isActive && isOwnProfile && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
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

            {prof.bio && (
              <ProfileSection title="نبذة تعريفية" icon={User}>
                <p className="text-muted text-sm leading-relaxed">{prof.bio}</p>
              </ProfileSection>
            )}

            {prof.fieldValues && prof.fieldValues.length > 0 && (
              <ProfileSection title="تفاصيل إضافية" icon={List}>
                <DynamicFieldRenderer fieldValues={prof.fieldValues} />
              </ProfileSection>
            )}

            <ProfileSection title="المؤهلات والخبرات" icon={GraduationCap}>
              <div className="space-y-4">
                {prof.degree && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{prof.degree}</p>
                      {prof.academicSpecialization && (
                        <p className="text-xs text-muted">{prof.academicSpecialization}</p>
                      )}
                    </div>
                  </div>
                )}
                {prof.experienceYears ? (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{prof.experienceYears} سنوات خبرة</p>
                      <p className="text-xs text-muted">خبرة عملية في المجال</p>
                    </div>
                  </div>
                ) : null}
                {prof.certifications && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">الشهادات والاعتمادات</p>
                      <p className="text-xs text-muted">{prof.certifications}</p>
                    </div>
                  </div>
                )}
                {prof.professionalAccreditations && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">الاعتمادات المهنية</p>
                      <p className="text-xs text-muted">{prof.professionalAccreditations}</p>
                    </div>
                  </div>
                )}
                {prof.courses && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">الدورات التدريبية</p>
                      <p className="text-xs text-muted">{prof.courses}</p>
                    </div>
                  </div>
                )}
                {prof.skills && (
                  <div className="pt-2 border-t border-border">
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
                  <div className="pt-2 border-t border-border">
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
            </ProfileSection>

            {prof.services && prof.services.length > 0 && (
              <ProfileSection title="الخدمات المقدمة" icon={BriefcaseBusiness}>
                <div className="space-y-3">
                  {prof.services.map((svc, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-border">
                      <h4 className="font-semibold text-foreground text-sm mb-1">{svc.name}</h4>
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
              </ProfileSection>
            )}

            {prof.portfolioProjects && prof.portfolioProjects.length > 0 && (
              <ProfileSection title="معرض الأعمال" icon={ImageIcon}>
                <div className="space-y-4">
                  {prof.portfolioProjects.map((project, i) => (
                    <div key={i} className="rounded-xl border border-border overflow-hidden bg-slate-50">
                      {project.images && project.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {project.images.slice(0, 2).map((img, idx) => (
                            <div key={idx} className="relative h-40 bg-slate-100">
                              <Image
                                src={img}
                                alt={project.title || 'صورة المشروع'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 400px"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-semibold text-foreground text-sm">{project.title}</h4>
                        {project.description && <p className="text-xs text-muted mt-1">{project.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            <ProfileSection title="التواصل والموقع" icon={MapPinned}>
              <div className="space-y-3 text-sm">
                {prof.city && (
                  <div className="flex items-center gap-2 text-muted">
                    <MapPin className="w-4 h-4 text-primary" />
                    {prof.city}
                    {prof.country && <span><Globe className="w-3 h-3 inline ml-1" /> {prof.country.name}</span>}
                  </div>
                )}
                {prof.workScope && (
                  <div className="flex items-center gap-2 text-muted">
                    <Clock className="w-4 h-4 text-primary" />
                    {prof.workScope === 'REMOTE' ? 'عمل عن بُعد' : prof.workScope === 'IN_PERSON' ? 'عمل حضوري' : 'عمل حضوري وعن بُعد'}
                  </div>
                )}
                {prof.willingToTravel && (
                  <div className="flex items-center gap-2 text-muted">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    مستعد للسفر
                  </div>
                )}
                {prof.email && (
                  <a href={`mailto:${prof.email}`} className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
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
                    <Globe className="w-4 h-4 text-primary" />
                    {prof.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {prof.phone && (
                  <a href={`tel:${formatPhone(prof.phone)}`} className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                    {prof.phone}
                  </a>
                )}
              </div>
            </ProfileSection>
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
