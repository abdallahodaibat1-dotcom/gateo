'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { TemplateBusiness } from './page-template-types';

interface CartPageTemplateProps {
  business: TemplateBusiness;
  page: { id: string; slug: string; title: string; content: string | null };
}

export function CartPageTemplate({ business, page }: CartPageTemplateProps) {
  const { items, removeItem, updateQuantity, clearCart, totalCount, totalPrice } = useCart();
  const { format, convert } = useCurrency();
  const businessItems = items.filter((i) => i.businessId === business.id);

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
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {businessItems.map((item, idx) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-4 p-4 rounded-xl bg-[var(--theme-surface)] border border-border shadow-sm"
                >
                  <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                    <p className="text-sm font-bold mt-auto" style={{ color: 'var(--theme-primary)' }}>
                      {format(convert(item.price))}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-md border border-border flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--theme-surface)] rounded-2xl border border-border p-6 shadow-sm h-fit"
              style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
            >
              <h2 className="text-lg font-bold text-foreground mb-4">ملخص الطلب</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between text-muted">
                  <span>عدد المنتجات</span>
                  <span>{totalCount}</span>
                </div>
                <div className="flex items-center justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span style={{ color: 'var(--theme-primary)' }}>{format(convert(totalPrice))}</span>
                </div>
              </div>
              <Link
                href={`/business/${business.slug || business.id}/checkout`}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <CreditCard className="w-4 h-4" />
                إتمام الطلب
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="w-full mt-3 py-2 rounded-xl border border-border text-muted text-sm font-medium hover:bg-black/5 transition-colors"
              >
                إفراغ السلة
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
