'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useCurrency } from '@/hooks/useCurrency';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalCount, totalPrice } = useCart();
  const { format, convert } = useCurrency();

  // lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--theme-background)] z-[70] shadow-2xl flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-[var(--theme-surface)]">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                السلة
                {totalCount > 0 && (
                  <span className="text-sm font-normal text-muted">({totalCount})</span>
                )}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <ShoppingBag className="w-16 h-16 text-muted/50" />
                  <p className="text-muted font-medium">السلة فارغة</p>
                  <p className="text-xs text-muted/70">أضف منتجات لتظهر هنا</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-3 rounded-xl bg-[var(--theme-surface)] border border-border shadow-sm"
                  >
                    <div className="relative w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link
                        href={`/business/${item.businessSlug}`}
                        className="text-[11px] text-primary truncate hover:underline"
                      >
                        {item.businessName}
                      </Link>
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{item.name}</h3>
                      <p className="text-sm font-bold mt-auto" style={{ color: 'var(--theme-primary)' }}>
                        {format(convert(item.price))}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-black/5 transition-colors"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-black/5 transition-colors"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-muted hover:text-red-500 transition-colors"
                          aria-label="حذف من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-4 space-y-3 bg-[var(--theme-surface)]">
                <div className="flex items-center justify-between text-foreground">
                  <span className="font-medium">الإجمالي</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                    {format(convert(totalPrice))}
                  </span>
                </div>
                {(() => {
                  const checkoutSlug = items[0]?.businessSlug || items[0]?.businessId;
                  return checkoutSlug ? (
                    <Link
                      href={`/business/${checkoutSlug}/checkout`}
                      onClick={onClose}
                      className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--theme-primary)' }}
                    >
                      <CreditCard className="w-4 h-4" />
                      إتمام الطلب
                    </Link>
                  ) : null;
                })()}
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full py-2 rounded-xl border border-border text-muted text-sm font-medium hover:bg-black/5 transition-colors"
                >
                  إفراغ السلة
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
