'use client';

import { useEffect, useId, useState } from 'react';
import { Plus, Pencil, Trash2, X, Clock, ImagePlus, Loader2, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/hooks/useConfirm';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number | null;
  image: string | null;
  isActive: boolean;
}

interface Business {
  id: string;
  services: Service[];
}

export default function BusinessServicesPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image: '',
  });
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  const nameId = useId();
  const descId = useId();
  const priceId = useId();
  const durationId = useId();
  const imageId = useId();

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/businesses/my');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data.business);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', duration: '', image: '' });
    setEditingService(null);
    setShowForm(false);
  };

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
        setForm((prev) => ({ ...prev, image: data.url }));
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

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price ? String(Number(service.price)) : '',
      duration: service.duration ? String(service.duration) : '',
      image: service.image || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!business || !form.name) return;
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        image: form.image || undefined,
      };

      let res;
      if (editingService) {
        res = await fetch(`/api/businesses/${business.id}/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/businesses/${business.id}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        resetForm();
        fetchBusiness();
      } else {
        showToast('فشل في حفظ الخدمة', 'error');
      }
    } catch (e) {
      showToast('فشل في حفظ الخدمة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!business) return;
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذه الخدمة؟' });
    if (!ok) return;
    setDeletingId(serviceId);
    try {
      const res = await fetch(`/api/businesses/${business.id}/services/${serviceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBusiness();
      } else {
        showToast('فشل في حذف الخدمة', 'error');
      }
    } catch (e) {
      showToast('فشل في حذف الخدمة', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-28 h-10 rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border shadow-sm p-4 flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-48 h-4" />
              </div>
              <Skeleton className="w-16 h-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      {/* Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-foreground">الخدمات ({business.services.length})</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          خدمة جديدة
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-surface rounded-lg border border-border shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">
                  {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="إغلاق النموذج"
                  title="إغلاق"
                >
                  <X className="w-5 h-5 text-muted" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor={nameId} className="block text-sm font-medium text-foreground mb-1.5">
                    اسم الخدمة *
                  </label>
                  <input
                    id={nameId}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                    placeholder="مثال: قص الشعر"
                  />
                </div>
                <div>
                  <label htmlFor={descId} className="block text-sm font-medium text-foreground mb-1.5">
                    الوصف
                  </label>
                  <textarea
                    id={descId}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
                    placeholder="وصف مختصر للخدمة..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={priceId} className="block text-sm font-medium text-foreground mb-1.5">
                      السعر (ر.س)
                    </label>
                    <input
                      id={priceId}
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor={durationId} className="block text-sm font-medium text-foreground mb-1.5">
                      المدة (دقيقة)
                    </label>
                    <input
                      id={durationId}
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                      placeholder="30"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor={imageId} className="block text-sm font-medium text-foreground mb-1.5">
                    صورة الخدمة
                  </label>
                  {form.image && (
                    <div className="mb-2 w-16 h-16 rounded-lg overflow-hidden border border-border">
                      <img src={form.image} alt={form.name || 'صورة الخدمة'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="relative w-full px-4 py-2.5 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer text-center"
                  >
                    <input
                      id={imageId}
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
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 rounded-md text-foreground hover:bg-slate-100 transition-colors text-sm font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !form.name}
                    className="px-6 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {editingService ? 'حفظ التعديلات' : 'إضافة'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      <div className="space-y-3">
        {business.services.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="لا توجد خدمات"
            description="أضف خدماتك لتظهر للعملاء"
            actionLabel="أضف أول خدمة"
            onAction={() => {
              resetForm();
              setShowForm(true);
            }}
          />
        ) : (
          business.services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-surface rounded-lg border border-border shadow-sm p-4 flex items-start gap-4"
            >
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scissors className="w-6 h-6 text-primary/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-muted mt-0.5 truncate">{service.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                  {service.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {service.duration} دقيقة
                    </span>
                  )}
                  {service.price && (
                    <span className="font-medium text-primary">
                      {Number(service.price).toFixed(0)} ر.س
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="تعديل الخدمة"
                  title="تعديل"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="p-2 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="حذف الخدمة"
                  title="حذف"
                >
                  {deletingId === service.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
