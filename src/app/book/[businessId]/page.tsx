'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Loader2, Calendar, Clock, MapPin, Phone, Store, ChevronRight, Check, CreditCard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface Business {
  id: string;
  name: string;
  logo: string | null;
  city: string | null;
  phone: string | null;
  address: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number | null;
  image: string | null;
}

export default function CreateBookingPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    serviceId: '',
    date: '',
    time: '',
    notes: '',
    totalPrice: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!businessId || status !== 'authenticated') return;
    fetchData();
  }, [businessId, status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [businessRes, servicesRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}`),
        fetch(`/api/businesses/${businessId}/services`),
      ]);

      if (businessRes.ok) {
        const data = await businessRes.json();
        setBusiness(data.business);
      } else if (businessRes.status === 404) {
        router.push('/businesses');
        return;
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === form.serviceId);

  useEffect(() => {
    if (selectedService?.price) {
      setForm((prev) => ({ ...prev, totalPrice: String(selectedService.price) }));
    }
  }, [selectedService]);

  const handleSubmit = async () => {
    if (!form.date || !form.time) {
      showToast('يرجى تحديد التاريخ والوقت', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, any> = {
        businessId,
        date: new Date(form.date).toISOString(),
        time: form.time,
        notes: form.notes || undefined,
        totalPrice: form.totalPrice ? parseFloat(form.totalPrice) : undefined,
      };
      if (form.serviceId) {
        body.serviceId = form.serviceId;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/bookings/${data.booking.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'فشل في إنشاء الحجز', 'error');
      }
    } catch (e) {
      showToast('فشل في إنشاء الحجز', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!business) return null;

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-10 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted">
            <Link href="/businesses" className="hover:text-primary transition-colors">
              الأعمال
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/business/${businessId}`} className="hover:text-primary transition-colors truncate max-w-[120px]">
              {business.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">حجز موعد</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Business Summary */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-5">
              <div className="flex items-center gap-4">
                <img
                  src={business.logo || '/logo/favicon.svg'}
                  alt={business.name}
                  className="w-14 h-14 rounded-lg object-cover border border-border"
                />
                <div>
                  <h1 className="font-bold text-foreground">{business.name}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                    {business.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {business.city}
                      </span>
                    )}
                    {business.phone && (
                      <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        {business.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                تفاصيل الحجز
              </h2>

              <div className="space-y-5">
                {/* Service Select */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">اختيار الخدمة (اختياري)</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setForm((prev) => ({ ...prev, serviceId: '' }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-md border transition-colors text-right ${
                        form.serviceId === ''
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        form.serviceId === '' ? 'border-primary' : 'border-border'
                      }`}>
                        {form.serviceId === '' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">زيارة عامة</div>
                        <div className="text-xs text-muted">حجز موعد بدون تحديد خدمة محددة</div>
                      </div>
                    </button>

                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setForm((prev) => ({ ...prev, serviceId: service.id }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-md border transition-colors text-right ${
                          form.serviceId === service.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          form.serviceId === service.id ? 'border-primary' : 'border-border'
                        }`}>
                          {form.serviceId === service.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">{service.name}</div>
                          {service.description && (
                            <div className="text-xs text-muted truncate">{service.description}</div>
                          )}
                        </div>
                        <div className="text-left flex-shrink-0">
                          {service.price && (
                            <div className="text-sm font-bold text-primary">{Number(service.price).toFixed(0)} ر.س</div>
                          )}
                          {service.duration && (
                            <div className="text-xs text-muted">{service.duration} دقيقة</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="booking-date" className="block text-sm font-medium text-foreground mb-1.5">التاريخ *</label>
                    <input
                      id="booking-date"
                      type="date"
                      min={today}
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-time" className="block text-sm font-medium text-foreground mb-1.5">الوقت *</label>
                    <input
                      id="booking-time"
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="booking-price" className="block text-sm font-medium text-foreground mb-1.5">السعر المتوقع (ر.س)</label>
                  <div className="relative">
                    <CreditCard className="absolute right-3 top-3 w-5 h-5 text-muted" />
                    <input
                      id="booking-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.totalPrice}
                      onChange={(e) => setForm((prev) => ({ ...prev, totalPrice: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pr-10 pl-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  {selectedService?.price && (
                    <p className="text-xs text-muted mt-1">السعر الافتراضي بناءً على الخدمة المختارة</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="booking-notes" className="block text-sm font-medium text-foreground mb-1.5">ملاحظات</label>
                  <div className="relative">
                    <FileText className="absolute right-3 top-3 w-5 h-5 text-muted" />
                    <textarea
                      id="booking-notes"
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder="أي تفاصيل إضافية ترغبين بذكرها..."
                      className="w-full pr-10 pl-4 py-2.5 rounded-md border bg-surface border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
                <button
                  onClick={() => router.push(`/business/${businessId}`)}
                  className="px-5 py-2.5 rounded-md text-muted hover:bg-slate-100 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.date || !form.time}
                  className="px-8 py-2.5 rounded-md bg-primary text-white font-medium shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  تأكيد الحجز
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
