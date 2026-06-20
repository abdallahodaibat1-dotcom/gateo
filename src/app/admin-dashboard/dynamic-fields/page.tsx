'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  Layers,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { useConfirm } from '@/hooks/useConfirm';

interface DynamicField {
  id: string;
  name: string;
  label: string;
  appliesTo: string;
  fieldType: string;
  isActive: boolean;
  isRequired: boolean;
  sortOrder: number;
  category: { id: string; name: string } | null;
}

const typeLabels: Record<string, string> = {
  TEXT: 'نص',
  TEXTAREA: 'نص طويل',
  NUMBER: 'رقم',
  BOOLEAN: 'نعم/لا',
  SELECT: 'قائمة منسدلة',
  MULTISELECT: 'اختيار متعدد',
  DATE: 'تاريخ',
  URL: 'رابط',
};

const appliesToLabels: Record<string, string> = {
  BUSINESS: 'تجاري',
  PROFESSIONAL: 'احترافي',
  BOTH: 'كلاهما',
};

export default function AdminDynamicFieldsPage() {
  const router = useRouter();
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const res = await fetch('/api/admin/dynamic-fields');
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/admin/login');
          return;
        }
        throw new Error('فشل في جلب الحقول');
      }
      const data = await res.json();
      setFields(data.fields);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الحقول');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذا الحقل؟' });
    if (!ok) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/dynamic-fields/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في حذف الحقل');
      setSuccess('تم حذف الحقل بنجاح');
      await fetchFields();
    } catch (e) {
      setError('فشل في حذف الحقل');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (field: DynamicField) => {
    try {
      const res = await fetch(`/api/admin/dynamic-fields/${field.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !field.isActive }),
      });
      if (!res.ok) throw new Error('فشل في تحديث الحقل');
      await fetchFields();
    } catch (e) {
      setError('فشل في تحديث حالة الحقل');
    }
  };

  const filteredFields = fields.filter(
    (f) =>
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            الحقول الديناميكية
          </h1>
          <p className="text-muted text-sm mt-1">إدارة الحقول الإضافية حسب القطاع ونوع الحساب.</p>
        </div>
        <Link
          href="/admin-dashboard/dynamic-fields/new"
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          حقل جديد
        </Link>
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
        className="bg-surface rounded-lg border border-border shadow-sm p-4"
      >
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            id="search"
            type="text"
            placeholder="البحث في الحقول..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-md border border-border bg-surface text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        {filteredFields.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="لا توجد حقول"
            description="لا توجد حقول ديناميكية مطابقة للبحث."
          />
        ) : (
          <div className="divide-y divide-border">
            {filteredFields.map((field) => (
              <div key={field.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground">{field.label}</h3>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{field.name}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {typeLabels[field.fieldType]}
                    </span>
                    <span className="text-xs bg-slate-50 text-muted px-2 py-0.5 rounded-md">
                      {appliesToLabels[field.appliesTo]}
                    </span>
                    {field.isRequired && (
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-md">مطلوب</span>
                    )}
                  </div>
                  <div className="text-sm text-muted mt-1">
                    الترتيب: {field.sortOrder}
                    {field.category && <span className="mr-2">• {field.category.name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(field)}
                    aria-label={field.isActive ? 'تعطيل' : 'تفعيل'}
                    className="p-2 rounded-md hover:bg-slate-100 text-muted hover:text-foreground"
                  >
                    {field.isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-muted" />
                    )}
                  </button>
                  <Link
                    href={`/admin-dashboard/dynamic-fields/${field.id}`}
                    aria-label="تعديل"
                    className="p-2 rounded-md hover:bg-slate-100 text-muted hover:text-foreground"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(field.id)}
                    disabled={deletingId === field.id}
                    aria-label="حذف"
                    className="p-2 rounded-md hover:bg-red-50 text-muted hover:text-red-600 transition-colors disabled:opacity-60"
                  >
                    {deletingId === field.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
