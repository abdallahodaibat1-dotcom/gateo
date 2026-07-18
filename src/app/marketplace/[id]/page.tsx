'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  Star,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Tag,
  Shield,
  ShoppingCart,
  Minus,
  Plus,
  Heart,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useCart } from '@/components/CartProvider';
import { useToast } from '@/components/ui/Toast';
import { MarketplaceCartDrawer } from '@/components/marketplace/MarketplaceCartDrawer';

interface Listing {
  id: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    comparePrice: number | null;
    quantity: number;
    images: { url: string; alt?: string }[] | null;
    category: string | null;
    tags: string | null;
    business: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      city: string | null;
      logo: string | null;
      phone: string | null;
      email: string | null;
      isVerified: boolean;
      avgRating: number;
      reviewCount: number;
    };
  };
}

function ProductDetailSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="w-20 h-20" />
            <Skeleton className="w-20 h-20" />
            <Skeleton className="w-20 h-20" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { format, convert } = useCurrency();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const fetchListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketplace/${id}`);
      if (!res.ok) throw new Error('فشل في جلب المنتج');
      const data = await res.json();
      setListing(data.listing);
    } catch (e) {
      setError('المنتج غير موجود');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchListing();
  }, [id, fetchListing]);

  const handleBuyClick = async () => {
    if (!listing) return;
    try {
      await fetch(`/api/marketplace/${id}/click`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push(`/business/${listing.product.business.slug || listing.product.business.id}?product=${listing.product.id}`);
  };

  const handleAddToCart = () => {
    if (!listing) return;
    addItem({
      productId: listing.product.id,
      businessId: listing.product.business.id,
      businessName: listing.product.business.name,
      businessSlug: listing.product.business.slug || listing.product.business.id,
      name: listing.product.name,
      price: listing.product.price,
      image: listing.product.images?.[0]?.url || null,
    });
    showToast('تمت إضافة المنتج للسلة', 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-8" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
        <EmptyState
          icon={ShoppingBag}
          title={error || 'المنتج غير موجود'}
          actionLabel="العودة للمتجر"
          onAction={() => router.push('/marketplace')}
        />
      </div>
    );
  }

  const { product } = listing;
  const images = product.images || [];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمتجر
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-lg bg-slate-100 overflow-hidden mb-4">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-20 h-20 text-slate-300" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
                      }`}
                      aria-label={`عرض الصورة ${index + 1}`}
                    >
                      <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="text-sm text-muted mb-2">{product.category || 'منتج'}</div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">{format(convert(product.price))}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-muted line-through">{format(convert(product.comparePrice))}</span>
                    <span className="bg-danger/10 text-danger text-sm font-bold px-2 py-1 rounded-full">
                      وفر {discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-muted leading-relaxed mb-6 whitespace-pre-wrap">
                {product.description || 'لا يوجد وصف لهذا المنتج.'}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-sm text-muted">
                  <Tag className="w-4 h-4" />
                  الكمية المتاحة: {product.quantity}
                </div>
              </div>

              {product.tags && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tags.split(',').map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 text-foreground px-3 py-1 rounded-full">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-12 flex items-center justify-center hover:bg-slate-50 transition"
                      aria-label="تقليل"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-12 flex items-center justify-center hover:bg-slate-50 transition"
                      aria-label="زيادة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    أضف للسلة
                  </button>
                </div>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  شراء الآن
                </button>
                
                <button
                  onClick={handleBuyClick}
                  className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold text-base hover:bg-primary/5 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  الشراء من موقع النشاط
                </button>
                
                <p className="text-xs text-muted text-center">
                  خيار "شراء الآن" يضيف المنتج للسلة ويفتحها مباشرة. خيار "الشراء من موقع النشاط" يحولك لصفحة البائع.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <MarketplaceCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

        {/* Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-surface rounded-lg border border-border shadow-sm p-6"
        >
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            عن البائع
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Link href={`/business/${product.business.slug || product.business.id}`}>
              {product.business.logo ? (
                <img src={product.business.logo} alt={product.business.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="w-8 h-8 text-primary/60" />
                </div>
              )}
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/business/${product.business.slug || product.business.id}`}>
                  <h4 className="font-bold text-foreground hover:text-primary transition-colors">{product.business.name}</h4>
                </Link>
                {product.business.isVerified && (
                  <span className="text-primary text-xs" title="موثق" aria-label="موثق">
                    <CheckCircle className="w-4 h-4 inline" />
                  </span>
                )}
              </div>
              <p className="text-sm text-muted mt-1 line-clamp-2">{product.business.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                {product.business.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {product.business.city}
                  </span>
                )}
                {product.business.avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {product.business.avgRating.toFixed(1)} ({product.business.reviewCount})
                  </span>
                )}
                {product.business.phone && (
                  <a href={`tel:${product.business.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    {product.business.phone}
                  </a>
                )}
              </div>
            </div>
            <Link
              href={`/business/${product.business.slug || product.business.id}`}
              className="px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              زيارة المتجر
            </Link>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Shield, title: 'شراء آمن', desc: 'يتم التحويل مباشرة لموقع النشاط الأصلي' },
            { icon: Store, title: 'بائع موثوق', desc: 'جميع الأنشطة مرتبطة بملفاتها التجارية' },
            { icon: CheckCircle, title: 'منتجات مختارة', desc: 'منتجات مختارة بعناية من مختلف القطاعات' },
          ].map((badge) => (
            <div key={badge.title} className="bg-surface rounded-lg border border-border shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm">{badge.title}</div>
                <div className="text-xs text-muted">{badge.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
