'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  Edit3,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { useConfirm } from '@/hooks/useConfirm';
import { useCurrency } from '@/hooks/useCurrency';

interface Business {
  id: string;
  slug: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice: number | null;
  quantity: number;
  status: string;
  isInMarketplace: boolean;
  images: { url: string; alt?: string }[] | null;
  category: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'نشط',
  OUT_OF_STOCK: 'نفدت الكمية',
  DRAFT: 'مسودة',
  ARCHIVED: 'مؤرشف',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  OUT_OF_STOCK: 'bg-red-50 text-red-700 border-red-200',
  DRAFT: 'bg-surface text-muted border-border',
  ARCHIVED: 'bg-warning/10 text-warning border-warning/20',
};

export default function ProductsDashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const searchId = useId();
  const { confirm, ConfirmDialog } = useConfirm();
  const { format, convert } = useCurrency();

  useEffect(() => {
    fetchData();
  }, []);

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

      const productsRes = await fetch(`/api/businesses/${businessData.business.id}/products`);
      if (!productsRes.ok) throw new Error('فشل في جلب المنتجات');
      const productsData = await productsRes.json();
      setProducts(productsData.products);
    } catch (e) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!business) return;
    const ok = await confirm({ title: 'هل أنت متأكد من حذف هذا المنتج؟' });
    if (!ok) return;
    setDeletingId(productId);
    setError('');
    try {
      const res = await fetch(`/api/businesses/${business.id}/products/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('فشل في حذف المنتج');
      setSuccess('تم حذف المنتج بنجاح');
      await fetchData();
    } catch (e) {
      setError('فشل في حذف المنتج');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="w-40 h-7" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-28 h-10 rounded-md" />
        </div>
        <div className="bg-surface rounded-lg border border-border shadow-sm p-4">
          <Skeleton className="w-full h-10 rounded-md" />
        </div>
        <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4 border-b border-border last:border-0">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-48 h-4" />
              </div>
              <Skeleton className="w-16 h-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            المنتجات
          </h1>
          <p className="text-muted text-sm mt-1">إدارة منتجات نشاطك التجاري وعرضها في المتجر المركزي.</p>
        </div>
        <Link
          href="/business-dashboard/products/new"
          className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium shadow-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          منتج جديد
        </Link>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-2 text-danger">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-surface rounded-lg border border-border shadow-sm p-4"
      >
        <label htmlFor={searchId} className="sr-only">
          البحث في المنتجات
        </label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            id={searchId}
            type="text"
            placeholder="البحث في المنتجات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-md border bg-surface border-border text-foreground placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors text-sm"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden"
      >
        {filteredProducts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Package}
              title="لا توجد منتجات بعد"
              description="أضف منتجاتك لعرضها في المتجر المركزي"
            />
            <div className="flex justify-center mt-4">
              <Link
                href="/business-dashboard/products/new"
                className="inline-flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                أضف أول منتج
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-border">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground">{product.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[product.status]}`}>
                      {statusLabels[product.status]}
                    </span>
                    {product.isInMarketplace ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                        <Store className="w-3 h-3" /> في المتجر
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-muted px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> مخفي
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                    <span className="font-medium text-primary">{format(convert(product.price))}</span>
                    {product.comparePrice && (
                      <span className="line-through text-muted">{format(convert(product.comparePrice))}</span>
                    )}
                    <span>•</span>
                    <span>الكمية: {product.quantity}</span>
                    {product.category && <span>• {product.category}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/business-dashboard/products/${product.id}`}
                    className="p-2 rounded-md hover:bg-slate-100 text-muted hover:text-foreground"
                    aria-label="تعديل المنتج"
                    title="تعديل"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="p-2 rounded-md hover:bg-red-50 text-muted hover:text-danger transition-colors disabled:opacity-60"
                    aria-label="حذف المنتج"
                    title="حذف"
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
