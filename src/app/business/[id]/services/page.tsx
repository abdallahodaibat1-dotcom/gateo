'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2, Plus, Trash2, Edit3, X, Check, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/ui';
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

export default function ManageServicesPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image: '',
  });
  const { showToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [imagePromptOpen, setImagePromptOpen] = useState(false);
  const [imagePromptValue, setImagePromptValue] = useState('');
  const imagePromptResolveRef = useRef<((value: string | null) => void) | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchServices();
  }, [id]);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/businesses/${id}/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', duration: '', image: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const promptImage = () => {
    setImagePromptValue('');
    setImagePromptOpen(true);
    return new Promise<string | null>((resolve) => {
      imagePromptResolveRef.current = resolve;
    });
  };

  const closeImagePrompt = (url: string | null) => {
    setImagePromptOpen(false);
    imagePromptResolveRef.current?.(url);
    imagePromptResolveRef.current = null;
  };

  const handleSubmit = async () => {
    if (!form.name) return;
    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/businesses/${id}/services/${editingId}`
        : `/api/businesses/${id}/services`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: form.price ? parseFloat(form.price) : null,
          duration: form.duration ? parseInt(form.duration) : null,
          image: form.image || null,
        }),
      });

      if (res.ok) {
        resetForm();
        fetchServices();
      } else {
        showToast('فشل في الحفظ', 'error');
      }
    } catch (e) {
      showToast('فشل في الحفظ', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذه الخدمة؟' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/businesses/${id}/services/${serviceId}`, { method: 'DELETE' });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
      }
    } catch (e) {}
  };

  const startEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '',
      image: service.image || '',
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-foreground">إدارة الخدمات</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 rounded-md bg-primary text-white font-medium text-sm shadow-sm flex items-center gap-2 hover:bg-primary-dark transition-colors"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'إلغاء' : 'خدمة جديدة'}
            </button>
          </div>

          {/* Add/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-surface rounded-lg border border-border shadow-sm p-5 mb-4 overflow-hidden"
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="service-name" className="block text-sm font-medium text-foreground mb-1">اسم الخدمة *</label>
                    <input
                      id="service-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="مثال: قص شعر"
                    />
                  </div>
                  <div>
                    <label htmlFor="service-description" className="block text-sm font-medium text-foreground mb-1">الوصف</label>
                    <textarea
                      id="service-description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      placeholder="وصف مختصر للخدمة..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="service-price" className="block text-sm font-medium text-foreground mb-1">السعر (ر.س)</label>
                      <input
                        id="service-price"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label htmlFor="service-duration" className="block text-sm font-medium text-foreground mb-1">المدة (دقيقة)</label>
                      <input
                        id="service-duration"
                        type="number"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="60"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="service-image" className="block text-sm font-medium text-foreground mb-1">صورة</label>
                    <div className="flex gap-2">
                      <input
                        id="service-image"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="flex-1 px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="رابط الصورة..."
                      />
                      <button
                        onClick={async () => {
                          const url = await promptImage();
                          if (url) setForm({ ...form, image: url });
                        }}
                        className="px-3 py-2.5 rounded-md border border-border bg-surface hover:bg-slate-50 transition-colors"
                        aria-label="إضافة رابط صورة"
                      >
                        <ImagePlus className="w-5 h-5 text-muted" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-md text-foreground hover:bg-slate-100 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !form.name}
                      className="px-6 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm disabled:opacity-50 flex items-center gap-2 hover:bg-primary-dark transition-colors"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {editingId ? 'تحديث' : 'إضافة'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Services List */}
          <div className="space-y-3">
            {services.length === 0 && !showForm && (
              <EmptyState
                icon={ImagePlus}
                title="لا توجد خدمات مسجلة"
                description="أضف خدمتك الأولى"
              />
            )}
            {services.map((service) => (
              <motion.div
                key={service.id}
                layout
                className="bg-surface rounded-lg shadow-sm border border-border p-4 flex items-center gap-4"
              >
                {service.image ? (
                  <img src={service.image} alt={service.name || 'صورة الخدمة'} className="w-16 h-16 rounded-md object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-muted" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted">{service.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                    {service.price && <span className="text-primary font-medium">{Number(service.price).toFixed(0)} ر.س</span>}
                    {service.duration && <span>{service.duration} دقيقة</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-2 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label="تعديل الخدمة"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors"
                    aria-label="حذف الخدمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <ConfirmDialog />
      {imagePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => closeImagePrompt(null)} />
          <div className="relative bg-surface rounded-lg shadow-xl w-full max-w-sm p-5">
            <h3 className="text-lg font-bold text-foreground mb-3">رابط الصورة</h3>
            <input
              type="text"
              value={imagePromptValue}
              onChange={(e) => setImagePromptValue(e.target.value)}
              placeholder="أدخل رابط الصورة"
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => closeImagePrompt(null)}
                className="px-4 py-2 rounded-md text-muted hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => closeImagePrompt(imagePromptValue.trim() || null)}
                className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
