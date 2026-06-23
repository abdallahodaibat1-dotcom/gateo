'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useWishlist } from '@/components/WishlistProvider';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { TemplateBusiness, TemplateProduct } from './page-template-types';

interface WishlistPageTemplateProps {
  business: TemplateBusiness;
  page: { id: string; slug: string; title: string; content: string | null };
  products: TemplateProduct[];
}

export function WishlistPageTemplate({ business, page, products }: WishlistPageTemplateProps) {
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { format, convert } = useCurrency();

  const businessWishlist = wishlistItems
    .filter((i) => i.businessId === business.id)
    .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
    .filter((x) => x.product);

  const handleAddToCart = (product: TemplateProduct) => {
    addItem({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: business.slug,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0]?.url || null,
    });
    showToast('تمت إضافة المنتج للسلة', 'success');
  };

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          {page.content && <p className="text-muted max-w-2xl mx-auto">{page.content}</p>}
        </motion.div>

        {businessWishlist.length === 0 ? (
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-border p-12 text-center">
            <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-2">لا توجد منتجات في المفضلة</p>
            <Link
              href={`/business/${business.slug || business.id}/shop`}
              className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
            >
              <ArrowLeft className="w-4 h-4" />
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {businessWishlist.map(({ item, product }, idx) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[var(--theme-surface)] rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
                style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {product!.images?.[0]?.url ? (
                    <img src={product!.images[0].url} alt={product!.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-foreground text-sm mb-1 line-clamp-2">{product!.name}</h3>
                  <p className="text-lg font-bold mt-auto mb-3" style={{ color: 'var(--theme-primary)' }}>
                    {format(convert(Number(product!.price)))}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product!)}
                    className="w-full py-2 rounded-lg text-white text-sm font-bold flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    أضف للسلة
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
