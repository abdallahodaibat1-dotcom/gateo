'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  Layers,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface DynamicField {
  id: string;
  name: string;
  label: string;
  labelEn: string | null;
  description: string | null;
  fieldType: string;
  options: { value: string; label: string }[] | null;
  placeholder: string | null;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  appliesTo: string;
  categoryId: string | null;
  subcategoryId: string | null;
}

const fieldTypes = [
  { value: 'TEXT', label: 'نص قصير' },
  { value: 'TEXTAREA', label: 'نص طويل' },
  { value: 'NUMBER', label: 'رقم' },
  { value: 'BOOLEAN', label: 'نعم/لا' },
  { value: 'SELECT', label: 'قائمة منسدلة' },
  { value: 'MULTISELECT', label: 'اختيار متعدد' },
  { value: 'DATE', label: 'تاريخ' },
  { value: 'URL', label: 'رابط' },
];

export default function AdminDynamicFieldEditorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { id } = params;
  const isNew = id === 'new';

  const [field, setField] = useState<Partial<DynamicField>>({
    name: '',
    label: '',
    labelEn: '',
    description: '',
    fieldType: 'TEXT',
    options: [],
    placeholder: '',
    isRequired: false,
    isActive: true,
    sortOrder: 0,
    appliesTo: 'BOTH',
    categoryId: '',
    subcategoryId: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newOption, setNewOption] = useState({ value: '', label: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (field.categoryId) {
      fetchSubcategories(field.categoryId);
    } else {
      setSubcategories([]);
    }
  }, [field.categoryId]);

  const fetchData = async () => {
    try {
      const [categoriesRes] = await Promise.all([
        fetch('/api/categories'),
        isNew ? Promise.resolve(null) : fetch(`/api/admin/dynamic-fields/${id}`),
      ]);

      if (!categoriesRes.ok) throw new Error('فشل في جلب التصنيفات');
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.categories || []);

      if (!isNew) {
        const fieldRes = await fetch(`/api/admin/dynamic-fields/${id}`);
        if (!fieldRes.ok) {
          if (fieldRes.status === 401 || fieldRes.status === 403) {
            router.push('/admin/login');
            return;
          }
          throw new Error('فشل في جلب الحقل');
        }
        const fieldData = await fieldRes.json();
        setField(fieldData.field);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}/subcategories`);
      if (!res.ok) throw new Error('فشل في جلب التصنيفات الفرعية');
      const data = await res.json();
      setSubcategories(data.subcategories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!field.name || !field.label || !field.fieldType) {
      setError('يرجى إدخال الاسم والعنوان ونوع الحقل');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = isNew ? '/api/admin/dynamic-fields' : `/api/admin/dynamic-fields/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = {
        ...field,
        categoryId: field.categoryId || null,
        subcategoryId: field.subcategoryId || null,
        labelEn: field.labelEn || null,
        description: field.description || null,
        placeholder: field.placeholder || null,
        options: field.options || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('فشل في حفظ الحقل');
      setSuccess(isNew ? 'تم إنشاء الحقل بنجاح' : 'تم حفظ الحقل بنجاح');
      if (isNew) {
        router.push('/admin-dashboard/dynamic-fields');
      }
    } catch (e) {
      setError('فشل في حفظ الحقل');
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    if (!newOption.value || !newOption.label) return;
    setField((prev) => ({
      ...prev,
      options: [...(prev.options || []), { ...newOption }],
    }));
    setNewOption({ value: '', label: '' });
  };

  const removeOption = (index: number) => {
    setField((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const showOptions = field.fieldType === 'SELECT' || field.fieldType === 'MULTISELECT';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/admin-dashboard/dynamic-fields"
            aria-label="العودة"
            className="p-2 rounded-md bg-surface border border-border hover:bg-slate-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Layers className="w-6 h-6 text-primary" />
              {isNew ? 'حقل جديد' : 'تعديل الحقل'}
            </h1>
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
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-2 text-emerald-700">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="label" className="block text-sm text-muted mb-1">العنوان بالعربية *</label>
            <input
              id="label"
              type="text"
              value={field.label || ''}
              onChange={(e) => setField({ ...field, label: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm text-muted mb-1">المعرف التقني *</label>
            <input
              id="name"
              type="text"
              value={field.name || ''}
              onChange={(e) => setField({ ...field, name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm dir-ltr"
              placeholder="مثال: license_number"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="labelEn" className="block text-sm text-muted mb-1">العنوان بالإنجليزية</label>
            <input
              id="labelEn"
              type="text"
              value={field.labelEn || ''}
              onChange={(e) => setField({ ...field, labelEn: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm dir-ltr"
            />
          </div>
          <div>
            <label htmlFor="fieldType" className="block text-sm text-muted mb-1">نوع الحقل *</label>
            <select
              id="fieldType"
              value={field.fieldType}
              onChange={(e) => setField({ ...field, fieldType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {fieldTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm text-muted mb-1">الوصف</label>
          <input
            id="description"
            type="text"
            value={field.description || ''}
            onChange={(e) => setField({ ...field, description: e.target.value })}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="appliesTo" className="block text-sm text-muted mb-1">ينطبق على</label>
            <select
              id="appliesTo"
              value={field.appliesTo}
              onChange={(e) => setField({ ...field, appliesTo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="BUSINESS">الأنشطة التجارية</option>
              <option value="PROFESSIONAL">الملفات الاحترافية</option>
              <option value="BOTH">كلاهما</option>
            </select>
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm text-muted mb-1">التصنيف</label>
            <select
              id="categoryId"
              value={field.categoryId || ''}
              onChange={(e) => setField({ ...field, categoryId: e.target.value || null, subcategoryId: null })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">عام (كل التصنيفات)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subcategoryId" className="block text-sm text-muted mb-1">التصنيف الفرعي</label>
            <select
              id="subcategoryId"
              value={field.subcategoryId || ''}
              onChange={(e) => setField({ ...field, subcategoryId: e.target.value || null })}
              disabled={!field.categoryId}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50"
            >
              <option value="">عام</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="placeholder" className="block text-sm text-muted mb-1">نص توضيحي (placeholder)</label>
            <input
              id="placeholder"
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => setField({ ...field, placeholder: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="sortOrder" className="block text-sm text-muted mb-1">الترتيب</label>
            <input
              id="sortOrder"
              type="number"
              value={field.sortOrder || 0}
              onChange={(e) => setField({ ...field, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-4 pt-6">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={field.isRequired}
                onChange={(e) => setField({ ...field, isRequired: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              مطلوب
            </label>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={field.isActive}
                onChange={(e) => setField({ ...field, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              نشط
            </label>
          </div>
        </div>

        {showOptions && (
          <div className="border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-foreground">الخيارات</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="القيمة (value)"
                value={newOption.value}
                onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                className="flex-1 px-4 py-2 rounded-md border border-border bg-surface text-foreground text-sm dir-ltr focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder="العنوان (label)"
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                className="flex-1 px-4 py-2 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={addOption}
                className="px-4 py-2 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(field.options || []).map((opt, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 text-sm text-foreground"
                >
                  {opt.label} ({opt.value})
                  <button
                    onClick={() => removeOption(index)}
                    aria-label="إزالة الخيار"
                    className="text-muted hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
