'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ShoppingCart,
  Heart,
  ArrowRight,
  ShoppingBag,
  Check,
  Tag,
  Store,
} from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { useRecentlyViewed } from '@/components/RecentlyViewedProvider';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/hooks/useCurrency';
import { BusinessThemeProvider } from '@/components/business-website/BusinessThemeProvider';
import { ProductCard } from '@/components/business-website/ProductCard';
import { TemplateBusiness, TemplateProduct } from '@/components/business-website/template-types';
const FashionOneProduct = dynamic(() => import('@/components/business-website/fashion-1/FashionOneProduct').then((m) => m.FashionOneProduct));

interface BusinessData extends TemplateBusiness {
  cover?: string | null;
  address?: string | null;
  workingHours?: { day: string; open: string; close: string }[] | Record<string, string> | string | null;
}

export default function ProductDetailPage() {
  const { id, productId } = useParams<{ id: string; productId: string }>();
  const router = useRouter();
  const { format, convert } = useCurrency();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [product, setProduct] = useState<TemplateProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<TemplateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const [businessRes, productRes] = await Promise.all([
        fetch(`/api/businesses/${id}`),
        fetch(`/api/businesses/${id}/products/${productId}/public`),
      ]);

      if (!businessRes.ok || !productRes.ok) {
        router.push(`/business/${id}`);
        return;
      }

      const businessData = await businessRes.json();
      const productData = await productRes.json();

      setBusiness(businessData.business);
      setProduct(productData.product);
      setSelectedImage(productData.product.images?.[0]?.url || null);

      const related = (businessData.business.products || [])
        .filter((p: TemplateProduct) => p.id !== productId)
        .slice(0, 4);
      setRelatedProducts(related);

      addRecentlyViewed({
        productId: productData.product.id,
        businessId: businessData.business.id,
        businessName: businessData.business.name,
        businessSlug: businessData.business.slug || businessData.business.id,
        name: productData.product.name,
        price: Number(productData.product.price) || 0,
        image: productData.product.images?.[0]?.url || null,
      });
    } catch (e) {
      console.error(e);
      router.push(`/business/${id}`);
    } finally {
      setLoading(false);
    }
  }, [id, productId, router, addRecentlyViewed]);

  useEffect(() => {
    if (!id || !productId) return;
    fetchData();
  }, [id, productId, fetchData]);

  useEffect(() => {
    if (business && product) {
      document.title = `${product.name} | ${business.name}`;
    }
  }, [business, product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--theme-primary)]" />
      </div>
    );
  }

  if (!business || !product) return null;

  if (business.theme?.homeTemplate === 'fashion-1') {
    return <FashionOneProduct business={business} product={product} relatedProducts={relatedProducts} />;
  }

  const price = Number(product.price) || 0;
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : 0;
  const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const images = product.images || [];
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug || business.id,
        name: product.name,
        price,
        image: images[0]?.url || null,
      });
    }
    showToast(`تمت إضافة ${quantity} من المنتج للسلة`, 'success');
  };

  const handleToggleWishlist = () => {
    toggleItem({
      productId: product.id,
      businessId: business.id,
      businessName: business.name,
      businessSlug: business.slug || business.id,
      name: product.name,
      price,
      image: images[0]?.url || null,
    });
    showToast(wishlisted ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة', 'success');
  };

  return (
    <BusinessThemeProvider theme={business.theme}>
      <div className="min-h-screen bg-[var(--theme-background)]" dir="rtl">
        {/* Simple header */}
        <header className="bg-[var(--theme-primary)]/95 backdrop-blur-md shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href={`/business/${business.slug || business.id}`} className="flex items-center gap-3">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
              )}
              <h1 className="text-white font-bold text-lg">{business.name}</h1>
            </Link>
            <Link
              href={`/business/${business.slug || business.id}/shop`}
              className="text-white/80 hover:text-white text-sm font-medium"
            >
              العودة للمتجر
            </Link>
          </div>
        </header>

        <main className="pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Link
                href={`/business/${business.slug || business.id}/shop`}
                className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
              >
                <ArrowRight className="w-4 h-4" />
                العودة للمتجر
              </Link>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Images */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div
                  className="aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-border"
                  style={{ borderRadius: 'var(--theme-radius, 1rem)' }}
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-20 h-20" />
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img.url)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                          selectedImage === img.url ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col"
              >
                {product.category && (
                  <span className="text-sm text-muted mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {product.category}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{product.name}</h1>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                    {format(convert(price))}
                  </span>
                  {comparePrice > price && (
                    <span className="text-lg text-muted line-through">{format(convert(comparePrice))}</span>
                  )}
                  {discount > 0 && (
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: 'var(--theme-accent)' }}
                    >
                      خصم {discount}%
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-foreground/80 leading-relaxed mb-6 whitespace-pre-wrap">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-12 flex items-center justify-center hover:bg-black/5"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-12 flex items-center justify-center hover:bg-black/5"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    أضف للسلة
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                      wishlisted
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-border text-foreground hover:bg-black/5'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="space-y-3 text-sm text-muted border-t border-border pt-6">
                  {(product.quantity ?? 0) > 0 ? (
                    <p className="flex items-center gap-2 text-emerald-600">
                      <Check className="w-4 h-4" />
                      متوفر في المخزون
                    </p>
                  ) : (
                    <p className="text-red-500">غير متوفر حالياً</p>
                  )}
                  <p>التوصيل: 1-3 أيام عمل</p>
                </div>
              </motion.div>
            </div>

            {relatedProducts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-6">منتجات مشابهة</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {relatedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      businessId={business.id}
                      businessName={business.name}
                      businessSlug={business.slug || business.id}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </BusinessThemeProvider>
  );
}
