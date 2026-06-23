'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ShoppingBag, Tag } from 'lucide-react';
import { ProductCard } from '@/components/business-website/ProductCard';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { TemplateBusiness, TemplateProduct } from './page-template-types';

interface ShopPageTemplateProps {
  business: TemplateBusiness;
  page: { id: string; slug: string; title: string; content: string | null };
  products: TemplateProduct[];
}

export function ShopPageTemplate({ business, page, products }: ShopPageTemplateProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { format, convert } = useCurrency();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    return ['all', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (sortBy === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }
    return list;
  }, [products, search, selectedCategory, sortBy]);

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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-64 shrink-0 space-y-6"
          >
            <div className="bg-[var(--theme-surface)] rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-foreground">
                <SlidersHorizontal className="w-4 h-4" />
                الفلترة والترتيب
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pr-9 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price-asc">السعر: من الأقل للأعلى</option>
                  <option value="price-desc">السعر: من الأعلى للأقل</option>
                </select>
              </div>
            </div>

            <div className="bg-[var(--theme-surface)] rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-foreground">
                <Tag className="w-4 h-4" />
                التصنيفات
              </div>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-right px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'text-white'
                        : 'text-foreground hover:bg-slate-100'
                    }`}
                    style={selectedCategory === cat ? { backgroundColor: 'var(--theme-primary)' } : undefined}
                  >
                    {cat === 'all' ? 'جميع المنتجات' : cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Products */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-[var(--theme-surface)] rounded-2xl border border-border p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted text-lg">لا توجد منتجات مطابقة</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <ProductCard
                      product={product}
                      businessId={business.id}
                      businessName={business.name}
                      businessSlug={business.slug || business.id}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
