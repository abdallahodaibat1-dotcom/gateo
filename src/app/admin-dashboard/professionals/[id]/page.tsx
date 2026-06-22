'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Globe,
  GraduationCap,
  Award,
  Clock,
  Star,
  Image as ImageIcon,
  ShieldCheck,
  User,
  CalendarDays,
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useCurrency } from '@/hooks/useCurrency';

interface ProfessionalDetail {
  id: string;
  title: string | null;
  bio: string | null;
  personalLogo: string | null;
  skills: string | null;
  degree: string | null;
  academicSpecialization: string | null;
  experienceYears: number | null;
  courses: string | null;
  certifications: string | null;
  professionalAccreditations: string | null;
  services: { name: string; description?: string | null; startingPrice?: number | null; duration?: string | null }[] | null;
  workScope: string;
  city: string | null;
  willingToTravel: boolean;
  languages: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  portfolioProjects: { title: string; description?: string | null; images?: string[] }[] | null;
  availableForWork: boolean;
  availableForHiring: boolean;
  availableForFreelance: boolean;
  availableForConsultation: boolean;
  completedProjectsCount: number;
  clientsCount: number;
  status: string;
  isVerified: boolean;
  isPublicOnGateway: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    avatar: string | null;
    createdAt: string;
  };
  category: { id: string; name: string; slug: string } | null;
  subcategory: { id: string; name: string; slug: string } | null;
  country: { id: string; name: string; flagEmoji: string } | null;
}

export default function ProfessionalReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { format, convert } = useCurrency();
  const [professional, setProfessional] = useState<ProfessionalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProfessional();
  }, [id]);

  const fetchProfessional = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/professionals/${id}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/admin/login');
          return;
        }
        throw new Error('فشل في تحميل البيانات');
      }
      const data = await res.json();
      setProfessional(data.professional);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل بيانات المحترف');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'ACTIVE' | 'REJECTED' | 'SUSPENDED') => {
    if (status === 'REJECTED' && (!rejectReason || rejectReason.trim().length < 3)) {
      setShowRejectInput(true);
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/professionals/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          isVerified: status === 'ACTIVE',
          reason: rejectReason.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('فشل في تنفيذ الإجراء');
      await fetchProfessional();
      setShowRejectInput(false);
      setRejectReason('');
    } catch (e) {
      setError('حدث خطأ أثناء تنفيذ الإجراء');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="bg-surface rounded-lg border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton circle className="w-16 h-16" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/5" />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="py-8">
        <EmptyState
          icon={AlertCircle}
          title="الملف غير موجود"
          description="لم يتم العثور على بيانات المحترف المطلوب."
          actionLabel="العودة إلى قائمة المحترفين"
          onAction={() => router.push('/admin-dashboard/professionals')}
        />
      </div>
    );
  }

  const prof = professional;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link href="/admin-dashboard/professionals" className="hover:text-primary transition-colors">
          المحترفون
        </Link>
        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-foreground font-medium">مراجعة الملف</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-5"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden">
              {prof.user.avatar ? (
                <img src={prof.user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{prof.user.name || 'محترف'}</h1>
              <p className="text-primary font-medium">{prof.title || '—'}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={prof.status} />
                {prof.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    <ShieldCheck className="w-3 h-3" />
                    موثق
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {prof.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleAction('ACTIVE')}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  اعتماد
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  رفض
                </button>
              </>
            )}
            {prof.status === 'ACTIVE' && (
              <button
                onClick={() => handleAction('SUSPENDED')}
                disabled={processing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-warning/10 text-warning border border-warning/20 text-sm font-medium hover:bg-warning/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                تعليق
              </button>
            )}
            {(prof.status === 'REJECTED' || prof.status === 'SUSPENDED') && (
              <button
                onClick={() => handleAction('ACTIVE')}
                disabled={processing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                إعادة اعتماد
              </button>
            )}
            <Link
              href={`/professional/${prof.user.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-50 text-foreground text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              <Globe className="w-4 h-4" />
              عرض الملف العام
            </Link>
          </div>
        </div>

        {showRejectInput && (
          <div className="mt-5 pt-5 border-t border-border">
            <label htmlFor="rejectReason" className="block text-sm font-medium text-foreground mb-2">سبب الرفض</label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض بوضوح..."
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm mb-3"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction('REJECTED')}
                disabled={processing || rejectReason.trim().length < 3}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                className="px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {prof.bio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary" />
                نبذة تعريفية
              </h3>
              <p className="text-muted text-sm leading-relaxed">{prof.bio}</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5"
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              المؤهلات والخبرات
            </h3>
            <div className="space-y-3">
              {prof.degree && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{prof.degree}</p>
                    {prof.academicSpecialization && <p className="text-xs text-muted">{prof.academicSpecialization}</p>}
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
                  </div>
                </div>
              ) : null}
              {prof.certifications && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">الشهادات</p>
                    <p className="text-xs text-muted">{prof.certifications}</p>
                  </div>
                </div>
              )}
              {prof.skills && (
                <div className="pt-2">
                  <p className="text-xs text-muted mb-2">المهارات</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prof.skills.split(',').map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-slate-100 text-foreground text-xs">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {prof.services && prof.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                الخدمات المقدمة
              </h3>
              <div className="space-y-3">
                {prof.services.map((svc, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-foreground text-sm">{svc.name}</h4>
                      {svc.startingPrice ? <span className="text-primary font-bold text-sm">{format(convert(svc.startingPrice))}</span> : null}
                    </div>
                    {svc.description && <p className="text-xs text-muted mb-2">{svc.description}</p>}
                    {svc.duration && <p className="text-xs text-muted">المدة: {svc.duration}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {prof.portfolioProjects && prof.portfolioProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-5"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5"
          >
            <h3 className="text-sm font-bold text-foreground mb-4">معلومات التواصل</h3>
            <div className="space-y-3 text-sm">
              {prof.email && (
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="truncate">{prof.email}</span>
                </div>
              )}
              {prof.phone && (
                <div className="flex items-center gap-2 text-muted" dir="ltr">
                  <Phone className="w-4 h-4 text-muted" />
                  <span>{prof.phone}</span>
                </div>
              )}
              {prof.whatsapp && (
                <div className="flex items-center gap-2 text-muted" dir="ltr">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{prof.whatsapp} (واتساب)</span>
                </div>
              )}
              {prof.website && (
                <a href={prof.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:text-primary-dark">
                  <Globe className="w-4 h-4" />
                  <span className="truncate">{prof.website}</span>
                </a>
              )}
              {prof.city && (
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="w-4 h-4 text-muted" />
                  {prof.city}
                  {prof.country && <span>{prof.country.name}</span>}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted">
                <Star className="w-4 h-4 text-muted" />
                {prof.workScope === 'REMOTE' ? 'عمل عن بُعد' : prof.workScope === 'IN_PERSON' ? 'عمل حضوري' : 'عمل حضوري وعن بُعد'}
              </div>
              {prof.willingToTravel && (
                <div className="flex items-center gap-2 text-muted">
                  <CheckCircle2 className="w-4 h-4 text-muted" />
                  مستعد للسفر
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5"
          >
            <h3 className="text-sm font-bold text-foreground mb-4">إحصائيات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">سنوات الخبرة</span>
                <span className="font-bold text-foreground">{prof.experienceYears || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">المشاريع المكتملة</span>
                <span className="font-bold text-foreground">{prof.completedProjectsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">العملاء</span>
                <span className="font-bold text-foreground">{prof.clientsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">متاح للعمل</span>
                <span className={`font-bold ${prof.availableForWork ? 'text-emerald-600' : 'text-muted'}`}>
                  {prof.availableForWork ? 'نعم' : 'لا'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">متاح للاستشارة</span>
                <span className={`font-bold ${prof.availableForConsultation ? 'text-emerald-600' : 'text-muted'}`}>
                  {prof.availableForConsultation ? 'نعم' : 'لا'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm p-5"
          >
            <h3 className="text-sm font-bold text-foreground mb-4">بيانات الحساب</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <User className="w-4 h-4 text-muted" />
                <span>{prof.user.name || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Mail className="w-4 h-4 text-muted" />
                <span className="truncate">{prof.user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <CalendarDays className="w-4 h-4 text-muted" />
                <span>انضم {formatDate(prof.user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <Clock className="w-4 h-4 text-muted" />
                <span>آخر تحديث {formatDate(prof.updatedAt)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
