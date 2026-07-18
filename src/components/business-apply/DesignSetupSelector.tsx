'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe, LayoutTemplate, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui';
import { DesignLibrarySelector } from './DesignLibrarySelector';
import { SubcategoryMultiSelect } from './SubcategoryMultiSelect';

interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[];
}

interface DesignSetupSelectorProps {
  websiteType: 'INTRO' | 'STORE' | '';
  categoryId: string;
  subcategoryIds: string[];
  customSubcategories: string[];
  designId: string;
  businessName: string;
  categories: Category[];
  errors: Record<string, string>;
  onWebsiteTypeChange: (type: 'INTRO' | 'STORE') => void;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryIds: string[], customSubcategories: string[]) => void;
  onDesignChange: (designId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TYPE_OPTIONS = [
  {
    key: 'INTRO' as const,
    title: 'موقع تعريفي',
    description: 'عنّفي عملك، الخدمات، ومعلومات التواصل مع حجوزات online.',
    icon: Globe,
  },
  {
    key: 'STORE' as const,
    title: 'متجر إلكتروني',
    description: 'بيعي منتجاتك مع سلة، دفع، طلبات، وإدارة مخزون متكاملة.',
    icon: ShoppingBag,
  },
];

export function DesignSetupSelector({
  websiteType,
  categoryId,
  subcategoryIds,
  customSubcategories,
  designId,
  businessName,
  categories,
  errors,
  onWebsiteTypeChange,
  onCategoryChange,
  onSubcategoryChange,
  onDesignChange,
  onNext,
  onBack,
}: DesignSetupSelectorProps) {
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];
  const selectedSubcategoryNames = subcategories
    .filter((s) => subcategoryIds.includes(s.id))
    .map((s) => s.name);
  const subcategoryNames = [...selectedSubcategoryNames, ...customSubcategories];
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (designId && navigationRef.current) {
      navigationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [designId]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <main className="pt-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-primary/20">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              اختر تصميم موقعك
            </h1>
            <p className="text-muted max-w-xl mx-auto">
              حدد تصنيف نشاطك والتصميم الذي يمثّل عملك بأفضل شكل.
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Website Type — locked by selected plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-surface rounded-xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                نوع الموقع
              </h2>
              {websiteType ? (
                <div className="flex items-start gap-4 p-4 rounded-xl border border-primary bg-primary/5 shadow-sm">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-primary text-white">
                    {(() => {
                      const Icon = TYPE_OPTIONS.find((o) => o.key === websiteType)?.icon || Globe;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {TYPE_OPTIONS.find((o) => o.key === websiteType)?.title}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      {TYPE_OPTIONS.find((o) => o.key === websiteType)?.description}
                    </p>
                    <p className="text-xs text-primary mt-2 font-medium">
                      تم تحديد نوع الموقع تلقائياً بناءً على الخطة التي اخترتها.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => onWebsiteTypeChange(option.key)}
                        className="flex items-start gap-4 p-4 rounded-xl border text-right transition-all border-border bg-surface hover:bg-slate-50"
                      >
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 text-muted">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{option.title}</h3>
                          <p className="text-sm text-muted mt-1">{option.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.websiteType && (
                <p className="text-red-500 text-xs mt-3">{errors.websiteType}</p>
              )}
            </motion.div>

            {/* Category & Subcategory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface rounded-xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                التصنيف الرئيسي
              </h2>
              <div>
                <label htmlFor="setup-category" className="block text-sm font-medium text-foreground mb-1.5">
                  التصنيف الرئيسي <span className="text-red-500">*</span>
                </label>
                <select
                  id="setup-category"
                  value={categoryId}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-md border ${
                    errors.categoryId ? 'border-red-300' : 'border-border'
                  } focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface`}
                >
                  <option value="">اختر تصنيفاً رئيسياً</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>
            </motion.div>

            {/* Subcategory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-surface rounded-xl border border-border p-6 shadow-sm"
            >
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-secondary" />
                التصنيف الفرعي
              </h2>
              <SubcategoryMultiSelect
                subcategories={subcategories}
                selectedIds={subcategoryIds}
                customSubcategories={customSubcategories}
                onChange={onSubcategoryChange}
                disabled={!categoryId}
                error={errors.subcategoryId}
                emptyMessage={!categoryId ? 'اختر التصنيف الرئيسي أولاً' : 'لا توجد تصنيفات فرعية'}
              />
            </motion.div>

            {/* Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface rounded-xl border border-border p-6 shadow-sm"
            >
              <DesignLibrarySelector
                selectedDesignId={designId}
                onSelect={onDesignChange}
                websiteType={websiteType}
                businessName={businessName}
                categoryName={selectedCategory?.name}
                subcategoryName={subcategoryNames.join(' / ')}
              />
              {errors.designId && <p className="text-red-500 text-xs mt-3">{errors.designId}</p>}
            </motion.div>

            {/* Navigation */}
            <motion.div
              ref={navigationRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between gap-4 pt-6"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onBack}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="min-w-[140px]"
              >
                رجوع
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={onNext}
                leftIcon={<ArrowLeft className="w-5 h-5" />}
                className="min-w-[200px] shadow-md hover:shadow-lg"
              >
                متابعة إلى بناء الموقع
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
