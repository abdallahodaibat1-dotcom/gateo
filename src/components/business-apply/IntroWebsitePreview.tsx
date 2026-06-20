'use client';

import { Store, MapPin, Phone, Eye, CheckCircle, Sparkles } from 'lucide-react';
import { getThemePresetById } from '@/lib/business-template-generator';

interface Service {
  name: string;
  description?: string;
  price?: string;
  duration?: string;
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
  services?: Service[];
  city?: string;
  phone?: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: { id: string; name: string }[];
}

interface IntroWebsitePreviewProps {
  form: FormShape;
  categories?: Category[];
  themePresetId?: string;
}

export function IntroWebsitePreview({ form, categories = [], themePresetId }: IntroWebsitePreviewProps) {
  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const gallery = form.gallery || [];
  const services = form.services || [];
  const theme = getThemePresetById(themePresetId || 'default') || getThemePresetById('default')!;
  const themeVars = {
    '--theme-primary': theme.primaryColor,
    '--theme-secondary': theme.secondaryColor,
    '--theme-accent': theme.accentColor,
    '--theme-background': theme.backgroundColor,
    '--theme-surface': theme.surfaceColor,
    '--theme-text': theme.textColor,
    '--theme-radius': theme.borderRadius,
  } as React.CSSProperties;

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
          <h3 className="font-bold text-foreground text-sm">معاينة صفحة عملك</h3>
          <p className="text-[11px] text-muted">تظهر التحديثات هنا فوراً</p>
        </div>
      </div>

      <div className="rounded-xl border border-border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)' }}>
        {/* Cover */}
        <div
          className="h-32 relative"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
        >
          {form.cover ? (
            <img src={form.cover} alt={form.name || 'صورة الغلاف'} className="w-full h-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Profile Header */}
        <div className="px-4 pb-4 -mt-10 relative">
          <div className="flex items-end gap-3">
            <div className="w-20 h-20 rounded-xl bg-surface border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              {form.logo ? (
                <img src={form.logo} alt={form.name || 'شعار النشاط'} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <div className="mb-2 flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-base truncate">{form.name || 'اسم العمل'}</h4>
              <p className="text-xs text-muted truncate">gateo.com/business/{form.slug || '...'}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
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

            <p className="text-xs text-muted line-clamp-3 leading-relaxed">
              {form.description || 'الوصف سيظهر هنا بمجرد إضافته...'}
            </p>

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

            {/* Services Preview */}
            {services.length > 0 && (
              <div>
                <p className="text-[10px] text-muted mb-1.5">الخدمات ({services.length})</p>
                <div className="space-y-1.5">
                  {services.slice(0, 3).map((service, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-md px-2 py-1.5">
                      <span className="text-xs text-foreground truncate flex-1">{service.name}</span>
                      {service.price && (
                        <span className="text-xs font-medium mr-2" style={{ color: 'var(--theme-primary)' }}>
                          {service.price} ر.س
                        </span>
                      )}
                    </div>
                  ))}
                  {services.length > 3 && (
                    <p className="text-[10px] text-muted">+{services.length - 3} خدمات أخرى</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact chips */}
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

            {/* CTA Buttons */}
            <div className="pt-3 border-t border-border flex gap-2">
              <div
                className="flex-1 py-2 rounded-lg text-white text-xs font-bold text-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                حجز موعد
              </div>
              <div className="flex-1 py-2 rounded-lg bg-slate-100 text-muted text-xs font-bold text-center">
                مراسلة
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-md border border-border p-4">
        <h4 className="font-bold text-foreground text-sm mb-2">لماذا حساب تجاري؟</h4>
        <ul className="space-y-2 text-xs text-muted">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            موقع إلكتروني خاص بعملك
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            رابط قابل للمشاركة مع العملاء
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            لوحة تحكم متكاملة
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            نظام حجوزات وخدمات
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
            ظهور في نتائج البحث
          </li>
        </ul>
      </div>
    </div>
  );
}
