'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Percent, Sparkles, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/business-website/ProductCard';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { TemplateBusiness, TemplateProduct } from './page-template-types';

interface OffersPageTemplateProps {
  business: TemplateBusiness;
  page: { id: string; slug: string; title: string; content: string | null };
  products: TemplateProduct[];
}

export function OffersPageTemplate({ business, page, products }: OffersPageTemplateProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const saleProducts = useMemo(() => {
    return products.filter((p) => p.comparePrice && Number(p.comparePrice) > Number(p.price));
  }, [products]);

  const newProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      const days = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return days <= 14;
    });
  }, [products]);

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

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-[60vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{page.title}</h1>
          {page.content && (
            <p className="text-muted max-w-2xl mx-auto">{page.content}</p>
          )}
        </motion.div>

        {saleProducts.length > 0 && (
          <section className="mb-12">
            <SectionHeader icon={Percent} title="تخفيضات خاصة" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {saleProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <ProductCard product={{ ...product, badge: 'sale' }} businessId={business.id} businessName={business.name} businessSlug={business.slug || business.id} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {newProducts.length > 0 && (
          <section className="mb-12">
            <SectionHeader icon={Sparkles} title="وصل حديثاً" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {newProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <ProductCard product={{ ...product, badge: 'new' }} businessId={business.id} businessName={business.name} businessSlug={business.slug || business.id} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {saleProducts.length === 0 && newProducts.length === 0 && (
          <div className="bg-[var(--theme-surface)] rounded-2xl border border-border p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg">لا توجد عروض متاحة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
