'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  slug: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ContactSections {
  email?: string;
  phone?: string;
  address?: string;
  mapUrl?: string;
  whatsapp?: string;
  socialLinks?: { platform: string; url: string }[];
}

interface BusinessPage {
  id: string;
  slug: string;
  title: string;
  pageTemplate: string;
  content: string | null;
  sections: any;
  isVisible: boolean;
  isHomePage: boolean;
  sortOrder: number;
}

const PAGE_TEMPLATES = [
  { value: 'CUSTOM', label: 'محتوى مخصص', hasContent: true },
  { value: 'HOME', label: 'الرئيسية', hasContent: false },
  { value: 'SHOP', label: 'المتجر', hasContent: false },
  { value: 'ABOUT', label: 'من نحن', hasContent: true },
  { value: 'CONTACT', label: 'تواصل معنا', hasContent: true },
  { value: 'FAQ', label: 'الأسئلة الشائعة', hasContent: false },
  { value: 'TERMS', label: 'الشروط والأحكام', hasContent: true },
  { value: 'PRIVACY', label: 'سياسة الخصوصية', hasContent: true },
  { value: 'OFFERS', label: 'العروض', hasContent: false },
  { value: 'CART', label: 'السلة', hasContent: true },
  { value: 'WISHLIST', label: 'المفضلة', hasContent: true },
  { value: 'ACCOUNT', label: 'حسابي', hasContent: true },
  { value: 'CHECKOUT', label: 'إتمام الطلب', hasContent: true },
];

const RESERVED_SLUGS = ['home', 'shop', 'cart', 'wishlist', 'account', 'checkout', 'product'];

function parseSections(sections: any): any {
  if (!sections) return null;
  if (typeof sections === 'string') {
    try {
      return JSON.parse(sections);
    } catch {
      return null;
    }
  }
  return sections;
}

function getDefaultFaqItems(): FaqItem[] {
  return [
    { question: 'ما هي طرق الدفع المتاحة؟', answer: 'نقبل الدفع عند الاستلام والبطاقات الإئتمانية والمحافظ الإلكترونية.' },
    { question: 'كم مدة التوصيل؟', answer: 'مدة التوصيل تتراوح بين 1-3 أيام عمل حسب الموقع.' },
  ];
}

function getDefaultContact(): ContactSections {
  return {
    email: '',
    phone: '',
    address: '',
    mapUrl: '',
    whatsapp: '',
    socialLinks: [],
  };
}

export default function PageEditorPage() {
  const router = useRouter();
  const params = useParams<{ pageId: string }>();
  const { pageId } = params;

  const [business, setBusiness] = useState<Business | null>(null);
  const [page, setPage] = useState<BusinessPage | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>(getDefaultFaqItems());
  const [contact, setContact] = useState<ContactSections>(getDefaultContact());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [pageId]);

  const fetchData = async () => {
    try {
      const businessRes = await fetch('/api/businesses/my');
      if (!businessRes.ok) {
        if (businessRes.status === 404) {
          router.push('/business/apply/start');
          return;
        }
        throw new Error('فشل في جلب بيانات النشاط');
      }
      const businessData = await businessRes.json();
      setBusiness(businessData.business);

      const pageRes = await fetch(`/api/businesses/${businessData.business.id}/pages/${pageId}`);
      if (!pageRes.ok) throw new Error('فشل في جلب الصفحة');
      const pageData = await pageRes.json();
      const loadedPage = pageData.page as BusinessPage;
      loadedPage.sections = parseSections(loadedPage.sections);
      setPage(loadedPage);

      if (loadedPage.pageTemplate === 'FAQ') {
        const items = Array.isArray(loadedPage.sections?.items) ? loadedPage.sections.items : getDefaultFaqItems();
        setFaqItems(items);
      } else if (loadedPage.pageTemplate === 'CONTACT') {
        setContact({ ...getDefaultContact(), ...(loadedPage.sections || {}) });
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const buildSections = (): any => {
    if (!page) return undefined;
    if (page.pageTemplate === 'FAQ') {
      return { items: faqItems };
    }
    if (page.pageTemplate === 'CONTACT') {
      return contact;
    }
    return page.sections;
  };

  const handleSave = async () => {
    if (!business || !page) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const sections = buildSections();
      const res = await fetch(`/api/businesses/${business.id}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          pageTemplate: page.pageTemplate,
          content: page.content,
          isVisible: page.isVisible,
          sortOrder: page.sortOrder,
          sections,
        }),
      });
      if (!res.ok) throw new Error('فشل في حفظ الصفحة');
      setSuccess('تم حفظ الصفحة بنجاح');
    } catch (e) {
      setError('فشل في حفظ الصفحة');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!page) return null;

  const templateInfo = PAGE_TEMPLATES.find((t) => t.value === page.pageTemplate);
  const isReserved = RESERVED_SLUGS.includes(page.slug) && !page.isHomePage;
  const showContent = templateInfo?.hasContent ?? true;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/business-dashboard/website/pages"
            className="p-2 rounded-md bg-surface border border-border hover:bg-slate-50 transition-colors"
            aria-label="العودة"
          >
            <ArrowRight className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              تعديل الصفحة
            </h1>
            <p className="text-muted text-sm">{page.title}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ
        </button>
      </motion.div>

      {error && (
        <div className="bg-danger/5 border border-danger/10 rounded-lg p-4 flex items-center gap-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/5 border border-success/10 rounded-lg p-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="page-title" className="block text-sm text-muted mb-1">عنوان الصفحة</label>
            <input
              id="page-title"
              type="text"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="page-template" className="block text-sm text-muted mb-1">نوع الصفحة</label>
            <select
              id="page-template"
              value={page.pageTemplate}
              onChange={(e) => setPage({ ...page, pageTemplate: e.target.value })}
              disabled={page.isHomePage}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors disabled:bg-slate-100"
            >
              {PAGE_TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="page-slug" className="block text-sm text-muted mb-1">الرابط</label>
            <input
              id="page-slug"
              type="text"
              value={page.slug}
              onChange={(e) =>
                setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
              }
              disabled={page.isHomePage}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors dir-ltr disabled:bg-slate-100"
            />
            {isReserved && (
              <p className="text-xs text-amber-600 mt-1">هذا الرابط محجوز للنظام. يمكنك تعديل العنوان فقط.</p>
            )}
          </div>
          <div>
            <label htmlFor="page-order" className="block text-sm text-muted mb-1">الترتيب</label>
            <input
              id="page-order"
              type="number"
              value={page.sortOrder}
              onChange={(e) => setPage({ ...page, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={page.isVisible}
              onChange={(e) => setPage({ ...page, isVisible: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:border-primary"
            />
            ظاهر في الموقع
          </label>
        </div>

        {showContent && (
          <div>
            <label htmlFor="page-content" className="block text-sm text-muted mb-1">المحتوى</label>
            <textarea
              id="page-content"
              value={page.content || ''}
              onChange={(e) => setPage({ ...page, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
              placeholder="اكتب محتوى الصفحة هنا..."
            />
          </div>
        )}

        {page.pageTemplate === 'FAQ' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-muted flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                الأسئلة والأجوبة
              </label>
              <button
                type="button"
                onClick={() => setFaqItems([...faqItems, { question: '', answer: '' }])}
                className="text-sm flex items-center gap-1 text-primary hover:text-primary-dark"
              >
                <Plus className="w-4 h-4" />
                إضافة سؤال
              </button>
            </div>
            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <input
                    type="text"
                    placeholder="السؤال"
                    value={item.question}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[idx].question = e.target.value;
                      setFaqItems(next);
                    }}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                  <textarea
                    placeholder="الإجابة"
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[idx].answer = e.target.value;
                      setFaqItems(next);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFaqItems(faqItems.filter((_, i) => i !== idx))}
                      className="text-xs flex items-center gap-1 text-danger hover:text-danger/80"
                    >
                      <Trash2 className="w-3 h-3" />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {page.pageTemplate === 'CONTACT' && (
          <div className="space-y-4">
            <label className="block text-sm text-muted flex items-center gap-2">
              <Phone className="w-4 h-4" />
              بيانات التواصل
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={contact.email || ''}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full pr-9 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute right-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="رقم الهاتف"
                  value={contact.phone || ''}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full pr-9 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="العنوان"
                  value={contact.address || ''}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full pr-9 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Globe className="absolute right-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="رابط خريطة Google Maps"
                  value={contact.mapUrl || ''}
                  onChange={(e) => setContact({ ...contact, mapUrl: e.target.value })}
                  className="w-full pr-9 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors dir-ltr"
                />
              </div>
              <div className="relative">
                <Phone className="absolute right-3 top-2.5 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="رقم واتساب"
                  value={contact.whatsapp || ''}
                  onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                  className="w-full pr-9 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted pt-2 border-t border-border">
          ملاحظة: المحتوى يُعرض كنص بسيط حالياً. صفحات المتجر والسلة والدفع تعرض محتوى واجهة المستخدم الثابت.
        </div>
      </motion.div>
    </div>
  );
}
