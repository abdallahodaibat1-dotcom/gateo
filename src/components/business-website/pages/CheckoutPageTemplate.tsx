'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CreditCard, Truck, User, MapPin, Phone, CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { TemplateBusiness } from './page-template-types';

interface CheckoutPageTemplateProps {
  business: TemplateBusiness;
  page: { id: string; slug: string; title: string; content: string | null };
}

export function CheckoutPageTemplate({ business, page }: CheckoutPageTemplateProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const { format, convert } = useCurrency();
  const businessItems = items.filter((i) => i.businessId === business.id);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: business.city || '',
    notes: '',
    paymentMethod: 'cod',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (businessItems.length === 0) {
      showToast('السلة فارغة', 'error');
      return;
    }
    if (!form.fullName || !form.phone || !form.address) {
      showToast('يرجى تعبئة جميع البيانات المطلوبة', 'error');
      return;
    }
    setSubmitting(true);
    // Simulate order placement
    await new Promise((resolve) => setTimeout(resolve, 1500));
    clearCart();
    setOrderPlaced(true);
    setSubmitting(false);
    showToast('تم تأكيد الطلب بنجاح', 'success');
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center bg-[var(--theme-surface)] rounded-2xl border border-border p-8 shadow-sm"
          style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">تم تأكيد طلبك</h2>
          <p className="text-muted mb-6">سنتواصل معك قريباً لتأكيد التفاصيل وتوصيل الطلب.</p>
          <Link
            href={`/business/${business.slug || business.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          {page.content && <p className="text-muted max-w-2xl mx-auto">{page.content}</p>}
        </motion.div>

        {businessItems.length === 0 ? (
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-border p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-2">السلة فارغة</p>
            <Link
              href={`/business/${business.slug || business.id}/shop`}
              className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              تسوق الآن
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--theme-surface)] rounded-2xl border border-border p-6 shadow-sm"
                style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
              >
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  بيانات التوصيل
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1">الاسم الكامل *</label>
                    <input
                      required
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1">رقم الهاتف *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-muted mb-1">العنوان *</label>
                    <input
                      required
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1">المدينة</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1">ملاحظات</label>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[var(--theme-surface)] rounded-2xl border border-border p-6 shadow-sm"
                style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
              >
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  طريقة الدفع
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-[var(--theme-background)] cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <Truck className="w-5 h-5 text-muted" />
                    <span className="text-foreground">الدفع عند الاستلام</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border bg-[var(--theme-background)] cursor-pointer opacity-60">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={form.paymentMethod === 'card'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <CreditCard className="w-5 h-5 text-muted" />
                    <span className="text-foreground">بطاقة ائتمانية (قريباً)</span>
                  </label>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--theme-surface)] rounded-2xl border border-border p-6 shadow-sm h-fit"
              style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
            >
              <h2 className="text-lg font-bold text-foreground mb-4">ملخص الطلب</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {businessItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="text-foreground truncate max-w-[60%]">{item.name} x{item.quantity}</span>
                    <span className="font-medium" style={{ color: 'var(--theme-primary)' }}>
                      {format(convert(item.price * item.quantity))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex items-center justify-between text-muted text-sm">
                  <span>التوصيل</span>
                  <span>مجاني</span>
                </div>
                <div className="flex items-center justify-between text-foreground font-bold text-lg">
                  <span>الإجمالي</span>
                  <span style={{ color: 'var(--theme-primary)' }}>{format(convert(totalPrice))}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                تأكيد الطلب
              </button>
            </motion.div>
          </form>
        )}
      </div>
    </div>
  );
}
