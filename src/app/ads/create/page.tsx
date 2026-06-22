'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { compressImage } from '@/lib/media-compression';
import {
  Loader2, Megaphone, Image as ImageIcon, Link as LinkIcon, Upload, CheckCircle,
  AlertCircle, Calendar, Type, AlignRight, MousePointerClick
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SHOW_ADS } from '@/lib/features';

const placements = [
  { key: 'FEED', label: 'خلاصة المنشورات', description: 'يظهر بين منشورات المستخدمين في الصفحة الرئيسية' },
  { key: 'SIDEBAR', label: 'الشريط الجانبي', description: 'يظهر في العمود الجانبي بجانب الخلاصة' },
  { key: 'HERO', label: 'البنر العلوي', description: 'يظهر في أعلى الخلاصة بشكل بارز' },
  { key: 'BANNER', label: 'بنر عريض', description: 'يظهر كبنر عريض في أعلى الصفحات' },
  { key: 'BUSINESS_LISTING', label: 'قائمة الأعمال', description: 'يظهر في صفحات تصفح الأعمال والمحترفين' },
];

export default function CreateAdPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    buttonText: 'اعرف المزيد',
    advertiserName: '',
    advertiserLogo: '',
    placement: 'FEED',
    startAt: '',
    endAt: '',
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!SHOW_ADS) {
      router.push('/');
      return;
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user?.name) {
      setForm((prev) => ({ ...prev, advertiserName: session.user.name || '' }));
    }
  }, [status, session, router]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('variant', 'post');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('فشل في رفع الملف');
    const data = await res.json();
    return data.url as string;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const compressedFile = file.type.startsWith('image/')
        ? await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.88, maxSizeBytes: 4 * 1024 * 1024 })
        : file;
      const url = await uploadFile(compressedFile);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setError('فشل في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const compressedFile = file.type.startsWith('image/')
        ? await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.88, maxSizeBytes: 1 * 1024 * 1024 })
        : file;
      const url = await uploadFile(compressedFile);
      setForm((prev) => ({ ...prev, advertiserLogo: url }));
    } catch (err) {
      setError('فشل في رفع الشعار');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('عنوان الإعلان مطلوب');
      return;
    }
    if (!form.image && !form.description) {
      setError('يرجى إضافة صورة أو وصف للإعلان');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startAt: form.startAt ? new Date(form.startAt).toISOString() : undefined,
          endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/feed'), 2000);
      } else {
        setError(data.error || 'فشل في إنشاء الإعلان');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-10 min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">إنشاء إعلان جديد</h1>
                  <p className="text-white/80 text-sm">وصل لجمهورك المستهدف بشكل احترافي</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">تم استلام إعلانك بنجاح</h2>
                  <p className="text-muted">سيتم مراجعة إعلانك قبل نشره في المنصة</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg bg-danger/5 border border-danger/10 p-3 text-sm text-danger flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label htmlFor="ad-title" className="block text-sm font-medium text-foreground mb-1.5">
                      عنوان الإعلان <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <Type className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="ad-title"
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                        placeholder="مثال: نحو مستقبل رقمي أفضل"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="ad-description" className="block text-sm font-medium text-foreground mb-1.5">نص الإعلان</label>
                    <div className="relative">
                      <AlignRight className="absolute right-3 top-3 w-4 h-4 text-muted" />
                      <textarea
                        id="ad-description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
                        placeholder="اكتب وصفاً جذاباً يوضح ما تقدمه..."
                      />
                    </div>
                  </div>

                  {/* Advertiser Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ad-advertiser-name" className="block text-sm font-medium text-foreground mb-1.5">اسم المعلن</label>
                      <input
                        id="ad-advertiser-name"
                        type="text"
                        value={form.advertiserName}
                        onChange={(e) => setForm({ ...form, advertiserName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                        placeholder="اسم الشركة أو العلامة التجارية"
                      />
                    </div>
                    <div>
                      <label htmlFor="ad-link" className="block text-sm font-medium text-foreground mb-1.5">رابط الإعلان</label>
                      <div className="relative">
                        <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          id="ad-link"
                          type="url"
                          value={form.link}
                          onChange={(e) => setForm({ ...form, link: e.target.value })}
                          className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button Text */}
                  <div>
                    <label htmlFor="ad-button-text" className="block text-sm font-medium text-foreground mb-1.5">نص الزر</label>
                    <div className="relative">
                      <MousePointerClick className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="ad-button-text"
                        type="text"
                        value={form.buttonText}
                        onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                        className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                        placeholder="اعرف المزيد"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label htmlFor="ad-image" className="block text-sm font-medium text-foreground mb-1.5">صورة الإعلان</label>
                    <label htmlFor="ad-image" className="flex items-center justify-center gap-2 px-4 py-8 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                      <input id="ad-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : form.image ? (
                        <img src={form.image} alt={form.title || 'صورة الإعلان'} className="w-full h-48 object-contain rounded-md" />
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-muted" />
                          <span className="text-sm text-muted">اضغط لرفع صورة الإعلان</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label htmlFor="ad-logo" className="block text-sm font-medium text-foreground mb-1.5">شعار المعلن</label>
                    <label htmlFor="ad-logo" className="flex items-center gap-4 cursor-pointer">
                      <input id="ad-logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <div className="w-16 h-16 rounded-md bg-slate-100 border border-border overflow-hidden flex items-center justify-center shrink-0">
                        {form.advertiserLogo ? (
                          <img src={form.advertiserLogo} alt={form.advertiserName || 'شعار المعلن'} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-6 h-6 text-muted" />
                        )}
                      </div>
                      <span className="text-sm text-muted hover:text-primary transition-colors">
                        {form.advertiserLogo ? 'تغيير الشعار' : 'رفع شعار المعلن'}
                      </span>
                    </label>
                  </div>

                  {/* Placement */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">مكان عرض الإعلان</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {placements.map((p) => (
                        <label
                          key={p.key}
                          htmlFor={`placement-${p.key}`}
                          className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                            form.placement === p.key
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              id={`placement-${p.key}`}
                              type="radio"
                              name="placement"
                              value={p.key}
                              checked={form.placement === p.key}
                              onChange={(e) => setForm({ ...form, placement: e.target.value })}
                              className="text-primary focus:ring-primary/20"
                            />
                            <span className="font-medium text-sm text-foreground">{p.label}</span>
                          </div>
                          <span className="text-xs text-muted mr-6">{p.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ad-start" className="block text-sm font-medium text-foreground mb-1.5">تاريخ البدء</label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          id="ad-start"
                          type="datetime-local"
                          value={form.startAt}
                          onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                          className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ad-end" className="block text-sm font-medium text-foreground mb-1.5">تاريخ الانتهاء</label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                          id="ad-end"
                          type="datetime-local"
                          value={form.endAt}
                          onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                          className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-4 border-t border-border">
                    <button
                      type="submit"
                      disabled={submitting || uploading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Megaphone className="w-5 h-5" />
                      )}
                      {submitting ? 'جاري الإرسال...' : 'إرسال الإعلان للمراجعة'}
                    </button>
                    <p className="text-center text-xs text-muted mt-3">
                      سيتم مراجعة إعلانك قبل النشر. سعر الإعلان يتحدد حسب المكان والمدة.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
