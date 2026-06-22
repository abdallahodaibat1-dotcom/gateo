'use client';

import { useMemo } from 'react';
import { Store, MapPin, Phone, Eye, ShoppingCart, Tag, Search, Star } from 'lucide-react';
import { getThemePresetById } from '@/lib/business-template-generator';
import { getDesignById, resolvePresetId } from '@/lib/business-design-library';
import { useCurrency } from '@/hooks/useCurrency';
import type { ExtractedThemeColors } from '@/lib/color-extraction';

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: string;
  comparePrice?: string;
  quantity?: string;
  category?: string;
  image?: string;
}

interface FormShape {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  logo?: string;
  cover?: string;
  gallery?: string[];
  products?: Product[];
  city?: string;
  phone?: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}

interface StoreWebsitePreviewProps {
  form: FormShape;
  categories?: Category[];
  designId?: string;
  themeColors?: ExtractedThemeColors | null;
}

export function StoreWebsitePreview({ form, categories = [], designId, themeColors }: StoreWebsitePreviewProps) {
  const { format } = useCurrency();
  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const gallery = form.gallery || [];
  const products = form.products || [];

  const design = designId ? getDesignById(designId) : undefined;
  const preset = getThemePresetById(resolvePresetId(design)) || getThemePresetById('default')!;
  const colors = themeColors || {
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    accentColor: preset.accentColor,
    backgroundColor: preset.backgroundColor,
    surfaceColor: preset.surfaceColor,
    textColor: preset.textColor,
  };

  const themeVars = {
    '--theme-primary': colors.primaryColor,
    '--theme-secondary': colors.secondaryColor,
    '--theme-accent': colors.accentColor,
    '--theme-background': colors.backgroundColor,
    '--theme-surface': colors.surfaceColor,
    '--theme-text': colors.textColor,
    '--theme-radius': preset.borderRadius,
  } as React.CSSProperties;

  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).slice(0, 4);
  }, [products]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-4" style={themeVars}>
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)' }}
        >
          <Eye className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">معاينة متجرك</h3>
          <p className="text-[11px] text-muted">تظهر التحديثات هنا فوراً</p>
        </div>
      </div>

      <div
        className="rounded-xl border border-border shadow-sm overflow-hidden"
        style={{ backgroundColor: 'var(--theme-surface)' }}
      >
        {/* Store Navbar */}
        <div
          className="h-12 px-3 flex items-center justify-between"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <div className="flex items-center gap-2">
            {form.logo ? (
              <img src={form.logo} alt={form.name || 'شعار المتجر'} className="w-7 h-7 rounded-full object-cover border border-white/30" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Store className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span className="text-white font-bold text-xs truncate max-w-[8rem]">{form.name || 'اسم المتجر'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-white text-[10px]">
              <Search className="w-3 h-3" />
              <span>بحث</span>
            </div>
            <div className="relative">
              <ShoppingCart className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-[var(--theme-accent)] text-[8px] font-bold text-white flex items-center justify-center">
                0
              </span>
            </div>
          </div>
        </div>

        {/* Cover / Hero */}
        <div
          className="h-28 relative"
          style={{ background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})` }}
        >
          {form.cover ? (
            <img src={form.cover} alt={form.name || 'صورة الغلاف'} className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 right-3 left-3">
            <h4 className="text-white font-bold text-sm truncate">{form.name || 'اسم المتجر'}</h4>
            <p className="text-white/80 text-[10px] line-clamp-1">{form.description || 'وصف المتجر يظهر هنا...'}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 pb-4 pt-3 space-y-4">
          {/* Categories */}
          {categoriesList.length > 0 && (
            <div>
              <p className="text-[10px] text-muted mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3" /> التصنيفات
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categoriesList.map((cat, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                      color: 'var(--theme-secondary)',
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category badges */}
          {(form.categoryId || form.subcategoryId) && (
            <div className="flex flex-wrap gap-1.5">
              {form.categoryId && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                    color: 'var(--theme-primary)',
                  }}
                >
                  {selectedCategory?.name || form.categoryId}
                </span>
              )}
              {form.subcategoryId && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 10%, transparent)',
                    color: 'var(--theme-secondary)',
                  }}
                >
                  {selectedCategory?.subcategories?.find((s) => s.id === form.subcategoryId)?.name || form.subcategoryId}
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {featuredProducts.length > 0 && (
            <div>
              <p className="text-[10px] text-muted mb-2 flex items-center justify-between">
                <span>المنتجات ({products.length})</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {featuredProducts.map((product, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border overflow-hidden"
                    style={{ backgroundColor: 'var(--theme-surface)' }}
                  >
                    <div className="aspect-square bg-slate-100 relative overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                      {product.comparePrice && Number(product.comparePrice) > Number(product.price || 0) && (
                        <span
                          className="absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: 'var(--theme-accent)' }}
                        >
                          خصم
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <h5 className="text-[11px] font-bold text-foreground truncate">{product.name}</h5>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-medium" style={{ color: 'var(--theme-primary)' }}>
                          {format(Number(product.price || 0))}
                        </span>
                        {product.comparePrice && Number(product.comparePrice) > 0 && (
                          <span className="text-[9px] text-muted line-through">{format(Number(product.comparePrice))}</span>
                        )}
                      </div>
                      <button
                        className="mt-1.5 w-full py-1 rounded-md text-[9px] font-bold text-white flex items-center justify-center gap-1"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {products.length > 4 && (
                <p className="text-[10px] text-center text-muted mt-2">+{products.length - 4} منتجات أخرى</p>
              )}
            </div>
          )}

          {/* Gallery Preview */}
          {gallery.length > 0 && (
            <div>
              <p className="text-[10px] text-muted mb-1.5">معرض الصور</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {gallery.slice(0, 4).map((url, i) => (
                  <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                    <img src={url} alt={'صورة ' + (i + 1)} className="w-full h-full object-cover" />
                  </div>
                ))}
                {gallery.length > 4 && (
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] text-muted font-medium">
                    +{gallery.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trust / Info */}
          <div className="flex flex-wrap gap-2">
            {form.city && (
              <span className="text-[10px] bg-slate-100 text-muted px-2 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {form.city}
              </span>
            )}
            {form.phone && (
              <span className="text-[10px] bg-slate-100 text-muted px-2 py-1 rounded-full flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" /> {form.phone}
              </span>
            )}
          </div>

          {/* Store CTA */}
          <div className="pt-3 border-t border-border flex gap-2">
            <div
              className="flex-1 py-2 rounded-lg text-white text-xs font-bold text-center flex items-center justify-center gap-1"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              تسوق الآن
            </div>
            <div className="flex-1 py-2 rounded-lg bg-slate-100 text-muted text-xs font-bold text-center">
              مراسلة
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-md border border-border p-4">
        <h4 className="font-bold text-foreground text-sm mb-2">لماذا متجر إلكتروني؟</h4>
        <ul className="space-y-2 text-xs text-muted">
          <li className="flex items-start gap-2">
            <Star className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
            عرض منتجاتك بشكل احترافي
          </li>
          <li className="flex items-start gap-2">
            <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
            سلة شراء متكاملة
          </li>
          <li className="flex items-start gap-2">
            <Store className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
            متجر خاص باسم نشاطك
          </li>
          <li className="flex items-start gap-2">
            <Tag className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
            عروض وتخفيضات ترويجية
          </li>
        </ul>
      </div>
    </div>
  );
}
