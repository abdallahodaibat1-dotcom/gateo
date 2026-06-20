'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Trash2,
  Plus,
  Edit3,
  Tags,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

interface Subcategory {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  category?: { id: string; name: string };
  _count?: { businesses: number };
}

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description: string | null;
  isLadiesGate: boolean;
  sortOrder: number;
  subcategories: Subcategory[];
  _count: { businesses: number; subcategories: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSubcategory, setEditSubcategory] = useState<Subcategory | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'category' | 'subcategory'>('category');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSort, setFormSort] = useState('0');
  const [formLadiesGate, setFormLadiesGate] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/subcategories'),
      ]);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubcategories(subData.subcategories);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormNameEn('');
    setFormSlug('');
    setFormIcon('');
    setFormImage('');
    setFormDesc('');
    setFormSort('0');
    setFormLadiesGate(false);
    setEditCategory(null);
    setEditSubcategory(null);
    setShowCategoryForm(false);
    setShowSubForm(false);
    setFormCategoryId('');
  };

  const openEditCategory = (cat: Category) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormNameEn(cat.nameEn || '');
    setFormSlug(cat.slug);
    setFormIcon(cat.icon || '');
    setFormImage(cat.image || '');
    setFormDesc(cat.description || '');
    setFormSort(String(cat.sortOrder));
    setFormLadiesGate(cat.isLadiesGate);
    setShowCategoryForm(true);
  };

  const openEditSubcategory = (sub: Subcategory) => {
    setEditSubcategory(sub);
    setFormName(sub.name);
    setFormSlug(sub.slug);
    setFormIcon(sub.icon || '');
    setFormSort(String(sub.sortOrder));
    setShowSubForm(true);
  };

  const handleSaveCategory = async () => {
    setSaveLoading(true);
    try {
      const body = {
        name: formName,
        nameEn: formNameEn || undefined,
        slug: formSlug,
        icon: formIcon || undefined,
        image: formImage || undefined,
        description: formDesc || undefined,
        sortOrder: parseInt(formSort) || 0,
        isLadiesGate: formLadiesGate,
      };
      const url = editCategory ? `/api/admin/categories/${editCategory.id}` : '/api/admin/categories';
      const method = editCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetForm();
        fetchData();
      }
    } catch (e) {}
    setSaveLoading(false);
  };

  const handleSaveSubcategory = async () => {
    if (!formCategoryId && !editSubcategory) return;
    setSaveLoading(true);
    try {
      const body = {
        categoryId: formCategoryId,
        name: formName,
        nameEn: formNameEn || undefined,
        slug: formSlug,
        icon: formIcon || undefined,
        sortOrder: parseInt(formSort) || 0,
      };
      const url = editSubcategory ? `/api/admin/subcategories/${editSubcategory.id}` : '/api/admin/subcategories';
      const method = editSubcategory ? 'PATCH' : 'POST';
      const payload = editSubcategory
        ? { name: formName, nameEn: formNameEn || undefined, slug: formSlug, icon: formIcon || undefined, sortOrder: parseInt(formSort) || 0 }
        : body;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetForm();
        fetchData();
      }
    } catch (e) {}
    setSaveLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const url = deleteType === 'category' ? `/api/admin/categories/${deleteId}` : `/api/admin/subcategories/${deleteId}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        setDeleteId(null);
      }
    } catch (e) {}
    setDeleteLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الفئات</h1>
          <p className="text-muted text-sm mt-1">إدارة فئات وخدمات المنصة</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowCategoryForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          فئة جديدة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <EmptyState
          icon={Tags}
          title="لا توجد فئات"
          description="لم يتم إضافة أي فئات بعد."
        />
      )}

      <div className="space-y-3">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl">
                {cat.icon ? <span className="text-2xl">{cat.icon}</span> : <Tags className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{cat.name}</h3>
                  {cat.isLadiesGate && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                      البوابة العامة
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted mt-0.5">{cat.slug} · {cat._count.businesses} عمل · {cat._count.subcategories} تصنيف فرعي</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFormCategoryId(cat.id); resetForm(); setShowSubForm(true); }}
                  aria-label="إضافة تصنيف فرعي"
                  className="p-2 rounded-md text-muted hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditCategory(cat)}
                  aria-label="تعديل"
                  className="p-2 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setDeleteId(cat.id); setDeleteType('category'); }}
                  aria-label="حذف"
                  className="p-2 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                  aria-label={expandedId === cat.id ? 'طي' : 'توسيع'}
                  className="p-2 rounded-md text-muted hover:bg-slate-100 transition-colors"
                >
                  {expandedId === cat.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedId === cat.id && (
              <div className="border-t border-border px-4 pb-4">
                <div className="mt-3 space-y-2">
                  {cat.subcategories?.length === 0 && subcategories.filter((s) => s.category?.id === cat.id).length === 0 && (
                    <p className="text-sm text-muted py-2">لا توجد تصنيفات فرعية</p>
                  )}
                  {(cat.subcategories?.length ? cat.subcategories : subcategories.filter((s) => s.category?.id === cat.id)).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground">{sub.name}</span>
                        <span className="text-xs text-muted">{sub.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSubcategory(sub)}
                          aria-label="تعديل"
                          className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(sub.id); setDeleteType('subcategory'); }}
                          aria-label="حذف"
                          className="p-1.5 rounded-md text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Category Form Modal */}
      {(showCategoryForm || showSubForm) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={resetForm}>
          <div className="bg-surface rounded-lg shadow-xl border border-border w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {showSubForm ? (editSubcategory ? 'تعديل تصنيف فرعي' : 'تصنيف فرعي جديد') : (editCategory ? 'تعديل فئة' : 'فئة جديدة')}
            </h3>
            <div className="space-y-4">
              {showSubForm && !editSubcategory && (
                <div>
                  <label htmlFor="formCategoryId" className="block text-sm font-medium text-foreground mb-1">الفئة</label>
                  <select
                    id="formCategoryId"
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="formName" className="block text-sm font-medium text-foreground mb-1">الاسم</label>
                <input
                  id="formName"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {!showSubForm && (
                <div>
                  <label htmlFor="formNameEn" className="block text-sm font-medium text-foreground mb-1">الاسم بالإنجليزية</label>
                  <input
                    id="formNameEn"
                    type="text"
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}
              <div>
                <label htmlFor="formSlug" className="block text-sm font-medium text-foreground mb-1">الرابط (slug)</label>
                <input
                  id="formSlug"
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="formIcon" className="block text-sm font-medium text-foreground mb-1">الأيقونة</label>
                <input
                  id="formIcon"
                  type="text"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="اسم الأيقونة"
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {!showSubForm && (
                <>
                  <div>
                    <label htmlFor="formImage" className="block text-sm font-medium text-foreground mb-1">الصورة</label>
                    <input
                      id="formImage"
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="رابط الصورة"
                      className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="formDesc" className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                    <textarea
                      id="formDesc"
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="ladiesGate"
                      type="checkbox"
                      checked={formLadiesGate}
                      onChange={(e) => setFormLadiesGate(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="ladiesGate" className="text-sm text-foreground">البوابة العامة</label>
                  </div>
                </>
              )}
              <div>
                <label htmlFor="formSort" className="block text-sm font-medium text-foreground mb-1">الترتيب</label>
                <input
                  id="formSort"
                  type="number"
                  value={formSort}
                  onChange={(e) => setFormSort(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 rounded-md border border-border text-foreground font-medium hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={showSubForm ? handleSaveSubcategory : handleSaveCategory}
                disabled={saveLoading || !formName || !formSlug || (showSubForm && !editSubcategory && !formCategoryId)}
                className="flex-1 px-4 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saveLoading ? 'جاري...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title={deleteType === 'category' ? 'حذف الفئة' : 'حذف التصنيف الفرعي'}
        message={deleteType === 'category' ? 'هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع التصنيفات الفرعية المرتبطة.' : 'هل أنت متأكد من حذف هذا التصنيف الفرعي؟'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteLoading}
        confirmText="حذف"
      />
    </div>
  );
}
