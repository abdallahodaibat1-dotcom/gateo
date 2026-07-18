'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Store, ExternalLink } from 'lucide-react';
import { useCart, CartItem } from '@/components/CartProvider';
import { useCurrency } from '@/hooks/useCurrency';

interface MarketplaceCartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MarketplaceCartDrawer({ open, onClose }: MarketplaceCartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, totalCount, totalPrice } = useCart();
  const { format, convert } = useCurrency();

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

  // Group items by business
  const grouped = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    if (!acc[item.businessId]) acc[item.businessId] = [];
    acc[item.businessId].push(item);
    return acc;
  }, {});

  const businessIds = Object.keys(grouped);

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
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                سلة مشترياتك
                {totalCount > 0 && (
                  <span className="text-sm font-normal text-muted">({totalCount})</span>
                )}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-foreground font-bold">السلة فارغة</p>
                  <p className="text-sm text-muted">استكشف المتجر وأضف منتجاتك المفضلة</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-6 py-2 rounded-full bg-primary text-white text-sm font-bold"
                  >
                    تسوق الآن
                  </button>
                </div>
              ) : (
                businessIds.map((businessId) => {
                  const group = grouped[businessId];
                  const businessName = group[0].businessName;
                  const businessSlug = group[0].businessSlug;
                  const groupTotal = group.reduce((sum, i) => sum + i.price * i.quantity, 0);

                  return (
                    <div key={businessId} className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                        <Link
                          href={`/business/${businessSlug}`}
                          onClick={onClose}
                          className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                        >
                          <Store className="w-4 h-4" />
                          {businessName}
                        </Link>
                        <span className="text-xs text-muted">{group.length} منتج</span>
                      </div>
                      <div className="space-y-3">
                        {group.map((item) => (
                          <div key={item.productId} className="flex gap-3">
                            <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ShoppingBag className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <h3 className="font-bold text-foreground text-xs line-clamp-2 mb-1">
                                {item.name}
                              </h3>
                              <p className="text-primary font-bold text-xs mt-auto">
                                {format(convert(item.price))}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
                                    aria-label="تقليل الكمية"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-medium">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="w-6 h-6 rounded-md border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
                                    aria-label="زيادة الكمية"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.productId)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                  aria-label="حذف من السلة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-muted">إجمالي البائع</span>
                        <span className="text-sm font-bold text-foreground">{format(convert(groupTotal))}</span>
                      </div>
                      <Link
                        href={`/business/${businessSlug}/checkout`}
                        onClick={onClose}
                        className="mt-2 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        شراء من {businessName}
                      </Link>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between text-foreground">
                  <span className="font-medium">الإجمالي الكلي</span>
                  <span className="text-xl font-bold text-primary">
                    {format(convert(totalPrice))}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  الطلبات موزعة حسب البائع. يمكنك إتمام كل طلب من موقع البائع مباشرة.
                </p>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full py-2 rounded-xl border border-slate-200 text-muted text-sm font-medium hover:bg-slate-50 transition-colors"
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
