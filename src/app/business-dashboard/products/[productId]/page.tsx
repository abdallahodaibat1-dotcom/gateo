'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  ArrowRight,
  Package,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  ImageIcon,
} from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';

interface Business {
  id: string;
  slug: string;
  name: string;
}

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  sku: string | null;
  quantity: number;
  images: ProductImage[] | null;
  category: string | null;
  tags: string | null;
  status: string;
  isInMarketplace: boolean;
}

export default function ProductEditorPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const { productId } = params;
  const isNew = productId === 'new';

  const [business, setBusiness] = useState<Business | null>(null);
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    comparePrice: null,
    sku: '',
    quantity: 0,
    images: [],
    category: '',
    tags: '',
    status: 'ACTIVE',
    isInMarketplace: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      const businessRes = await fetch('/api/businesses/my');
      if (!businessRes.ok) {
        if (businessRes.status === 404) {
          router.push('/business/apply/start');
          return;
        }
        throw new Error('فشل في جلب بيانات النشاط');
      }
      const businessData = await businessRes.json();
      setBusiness(businessData.business);

      if (!isNew) {
        const productRes = await fetch(`/api/businesses/${businessData.business.id}/products/${productId}`);
        if (!productRes.ok) throw new Error('فشل في جلب المنتج');
        const productData = await productRes.json();
        setProduct(productData.product);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business) return;
    if (!product.name || product.price === undefined) {
      setError('يرجى إدخال الاسم والسعر');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const url = isNew
        ? `/api/businesses/${business.id}/products`
        : `/api/businesses/${business.id}/products/${productId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
          quantity: Number(product.quantity),
        }),
      });

      if (!res.ok) throw new Error('فشل في حفظ المنتج');
      const data = await res.json();
      setSuccess(isNew ? 'تم إنشاء المنتج بنجاح' : 'تم حفظ المنتج بنجاح');
      if (isNew) {
        router.push(`/business-dashboard/products/${data.product.id}`);
      }
    } catch (e) {
      setError('فشل في حفظ المنتج');
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => {
    if (!newImageUrl) return;
    setProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), { url: newImageUrl, alt: product.name }],
    }));
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/business-dashboard/products"
            className="p-2 rounded-md bg-surface border border-border hover:bg-slate-50 transition-colors"
            aria-label="العودة"
          >
            <ArrowRight className="w-5 h-5 text-muted" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {isNew ? 'منتج جديد' : 'تعديل المنتج'}
            </h1>
            <p className="text-muted text-sm">{product.name || 'أدخل بيانات المنتج'}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ
        </button>
      </motion.div>

      {error && (
        <div className="bg-danger/5 border border-danger/10 rounded-lg p-4 flex items-center gap-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/5 border border-success/10 rounded-lg p-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-name" className="block text-sm text-muted mb-1">اسم المنتج *</label>
            <input
              id="product-name"
              type="text"
              value={product.name || ''}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="product-category" className="block text-sm text-muted mb-1">التصنيف</label>
            <input
              id="product-category"
              type="text"
              value={product.category || ''}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              placeholder="مثال: مستحضرات تجميل"
            />
          </div>
        </div>

        <div>
          <label htmlFor="product-description" className="block text-sm text-muted mb-1">الوصف</label>
          <textarea
            id="product-description"
            value={product.description || ''}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="product-price" className="block text-sm text-muted mb-1">السعر *</label>
            <input
              id="product-price"
              type="number"
              min={0}
              step="0.01"
              value={product.price ?? ''}
              onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="product-compare-price" className="block text-sm text-muted mb-1">السعر قبل الخصم</label>
            <input
              id="product-compare-price"
              type="number"
              min={0}
              step="0.01"
              value={product.comparePrice ?? ''}
              onChange={(e) => setProduct({ ...product, comparePrice: e.target.value ? parseFloat(e.target.value) : null })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="product-quantity" className="block text-sm text-muted mb-1">الكمية</label>
            <input
              id="product-quantity"
              type="number"
              min={0}
              value={product.quantity ?? ''}
              onChange={(e) => setProduct({ ...product, quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="product-sku" className="block text-sm text-muted mb-1">رمز SKU</label>
            <input
              id="product-sku"
              type="text"
              value={product.sku || ''}
              onChange={(e) => setProduct({ ...product, sku: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-status" className="block text-sm text-muted mb-1">الحالة</label>
            <select
              id="product-status"
              value={product.status}
              onChange={(e) => setProduct({ ...product, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
            >
              <option value="ACTIVE">نشط</option>
              <option value="OUT_OF_STOCK">نفدت الكمية</option>
              <option value="DRAFT">مسودة</option>
              <option value="ARCHIVED">مؤرشف</option>
            </select>
          </div>
          <div>
            <label htmlFor="product-tags" className="block text-sm text-muted mb-1">الوسوم</label>
            <input
              id="product-tags"
              type="text"
              value={product.tags || ''}
              onChange={(e) => setProduct({ ...product, tags: e.target.value })}
              className="w-full px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
              placeholder="مفصولة بفاصلة"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={product.isInMarketplace}
            onChange={(e) => setProduct({ ...product, isInMarketplace: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 focus:border-primary"
          />
          عرض في المتجر المركزي
        </label>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-6 space-y-4"
      >
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          صور المنتج
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="رابط الصورة"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
          />
          <button
            onClick={addImage}
            className="px-4 py-2.5 rounded-md bg-slate-100 text-foreground text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {product.images?.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-slate-50">
              <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                aria-label="حذف الصورة"
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
