'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Check, Palette, Wand2, X, Eye, Filter, LayoutTemplate, Store, Globe } from 'lucide-react';
import {
  getDesignList,
  getDesignById,
  type WebsiteDesign,
  type WebsiteType,
} from '@/lib/business-design-library';
import { getThemePresetById } from '@/lib/business-template-generator';

interface DesignLibrarySelectorProps {
  selectedDesignId?: string;
  onSelect: (designId: string) => void;
  websiteType?: 'INTRO' | 'STORE' | '';
  businessName?: string;
  categoryName?: string;
  subcategoryName?: string;
  onPreview?: (design: WebsiteDesign) => void;
}

const ALL_DESIGNS = getDesignList();

const STYLE_LABELS: Record<string, string> = {
  modern: 'عصري',
  minimal: 'بسيط',
  corporate: 'شركاتي',
  creative: 'إبداعي',
  elegant: 'أنيق',
  bold: 'جريء',
  warm: 'دافئ',
  dark: 'داكن',
};

const TYPE_LABELS: Record<WebsiteType, string> = {
  INTRO: 'تعريفي',
  STORE: 'متجر',
  BOTH: 'الكل',
};

const TYPE_ICONS: Record<WebsiteType, typeof Globe> = {
  INTRO: Globe,
  STORE: Store,
  BOTH: Globe,
};

function suggestDesignId(
  websiteType: 'INTRO' | 'STORE' | '',
  categoryName?: string,
  subcategoryName?: string,
  businessName?: string
): string {
  const tokens = [categoryName, subcategoryName, businessName]
    .filter(Boolean)
    .map((s) => (s as string).toLowerCase()) as string[];

  const pool = websiteType
    ? ALL_DESIGNS.filter((d) => d.websiteType === websiteType || d.websiteType === 'BOTH')
    : ALL_DESIGNS;

  for (const design of pool) {
    const keywords = (design.categoryTags || []).map((k) => k.toLowerCase());
    for (const token of tokens) {
      if (keywords.some((k) => token.includes(k) || k.includes(token))) {
        return design.designId;
      }
    }
  }

  // fallback
  if (websiteType === 'STORE') return 'store-default';
  return 'intro-default';
}

export function DesignLibrarySelector({
  selectedDesignId,
  onSelect,
  websiteType,
  businessName,
  categoryName,
  subcategoryName,
  onPreview,
}: DesignLibrarySelectorProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | WebsiteType>(websiteType || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  useEffect(() => {
    if (websiteType === 'INTRO' || websiteType === 'STORE') {
      setTypeFilter(websiteType);
    }
  }, [websiteType]);

  const styles = useMemo(
    () => Array.from(new Set(ALL_DESIGNS.map((d) => d.style).filter(Boolean))) as string[],
    []
  );
  const sources = useMemo(
    () => Array.from(new Set(ALL_DESIGNS.map((d) => d.source).filter(Boolean))) as string[],
    []
  );
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    ALL_DESIGNS.forEach((d) => {
      d.categoryTags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, []);

  const filteredDesigns = useMemo(() => {
    return ALL_DESIGNS.filter((design) => {
      const matchesQuery =
        !query.trim() ||
        design.nameAr.toLowerCase().includes(query.toLowerCase()) ||
        design.name.toLowerCase().includes(query.toLowerCase()) ||
        (design.descriptionAr || '').toLowerCase().includes(query.toLowerCase()) ||
        design.categoryTags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

      const matchesType =
        typeFilter === 'ALL' ||
        design.websiteType === typeFilter ||
        design.websiteType === 'BOTH';

      const matchesCategory =
        !categoryFilter || design.categoryTags.some((t) => t === categoryFilter);

      const matchesStyle = !styleFilter || design.style === styleFilter;
      const matchesSource = !sourceFilter || design.source === sourceFilter;

      return matchesQuery && matchesType && matchesCategory && matchesStyle && matchesSource;
    });
  }, [query, typeFilter, categoryFilter, styleFilter, sourceFilter]);

  const handleAiSuggest = () => {
    setAiSuggesting(true);
    setTimeout(() => {
      const suggested = suggestDesignId(websiteType || '', categoryName, subcategoryName, businessName);
      onSelect(suggested);
      setAiSuggesting(false);
    }, 600);
  };

  const selectedDesign = selectedDesignId ? getDesignById(selectedDesignId) : undefined;
  const selectedPreset = selectedDesign ? getThemePresetById(selectedDesign.presetId) : undefined;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            اختر تصميم موقعك
          </h2>
          <p className="text-sm text-muted mt-0.5">
            مكتبة تصاميم متكاملة تتناسب مع نشاطك. كل تصميم يشمل الألوان والخطوط وتخطيط الصفحة الرئيسية.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAiSuggest}
          disabled={aiSuggesting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {aiSuggesting ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          اقتراح ذكي حسب النشاط
        </button>
      </div>

      {/* Selected banner */}
      <AnimatePresence>
        {selectedDesign && selectedPreset && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-md border border-border shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${selectedPreset.primaryColor}, ${selectedPreset.secondaryColor})`,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{selectedDesign.nameAr}</p>
              <p className="text-xs text-muted truncate">{selectedDesign.descriptionAr}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-white rounded-full px-2.5 py-1 shadow-sm">
              <Check className="w-3.5 h-3.5" />
              مختار
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو التصنيف..."
          className="w-full pr-9 pl-4 py-2.5 rounded-lg border border-border bg-surface text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            typeFilter === 'ALL'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-muted hover:bg-slate-200'
          }`}
        >
          الكل
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('INTRO')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            typeFilter === 'INTRO'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-muted hover:bg-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          تعريفي
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('STORE')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            typeFilter === 'STORE'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-muted hover:bg-slate-200'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          متاجر
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            categoryFilter === null
              ? 'bg-secondary text-white'
              : 'bg-slate-100 text-muted hover:bg-slate-200'
          }`}
        >
          جميع التصنيفات
        </button>
        {categories.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === tag ? null : tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === tag
                ? 'bg-secondary text-white'
                : 'bg-slate-100 text-muted hover:bg-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-lg p-3 border border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Filter className="w-3.5 h-3.5" />
          تصفية إضافية:
        </div>
        <select
          value={styleFilter || ''}
          onChange={(e) => setStyleFilter(e.target.value || null)}
          className="text-xs bg-white border border-border rounded-md px-2 py-1.5 text-foreground outline-none focus:border-primary"
        >
          <option value="">النمط</option>
          {styles.map((s) => (
            <option key={s} value={s}>
              {STYLE_LABELS[s] || s}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter || ''}
          onChange={(e) => setSourceFilter(e.target.value || null)}
          className="text-xs bg-white border border-border rounded-md px-2 py-1.5 text-foreground outline-none focus:border-primary"
        >
          <option value="">المصدر</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(styleFilter || sourceFilter) && (
          <button
            type="button"
            onClick={() => {
              setStyleFilter(null);
              setSourceFilter(null);
            }}
            className="text-xs text-primary hover:underline"
          >
            إعادة ضبط
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredDesigns.map((design) => {
            const preset = getThemePresetById(design.presetId);
            const isSelected = selectedDesignId === design.designId;
            const TypeIcon = TYPE_ICONS[design.websiteType];

            return (
              <motion.div
                layout
                key={design.designId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative rounded-xl border overflow-hidden transition-all flex flex-col ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-border hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                {/* Preview image */}
                <div className="h-40 w-full relative bg-slate-100 overflow-hidden">
                  {design.previewImage ? (
                    <img
                      src={design.previewImage}
                      alt={design.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${preset?.primaryColor || '#7c3aed'}, ${preset?.secondaryColor || '#ec4899'})`,
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className="text-[10px] bg-black/40 text-white px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                      <TypeIcon className="w-3 h-3" />
                      {TYPE_LABELS[design.websiteType]}
                    </span>
                    {design.source && (
                      <span className="text-[10px] bg-white/90 text-foreground px-2 py-0.5 rounded shadow-sm">
                        {design.source}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: preset?.primaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: preset?.secondaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: preset?.accentColor }}
                    />
                  </div>

                  <h3 className="font-bold text-foreground text-sm mb-1">{design.nameAr}</h3>
                  <p className="text-xs text-muted line-clamp-2 min-h-[2.5rem] mb-3 flex-1">
                    {design.descriptionAr}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    {onPreview && (
                      <button
                        type="button"
                        onClick={() => onPreview(design)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-100 text-foreground hover:bg-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        معاينة
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelect(design.designId)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-foreground hover:bg-primary hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          مختار
                        </>
                      ) : (
                        'اختيار القالب'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDesigns.length === 0 && (
        <div className="text-center py-12 text-muted">
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد تصاميم تطابق البحث</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setTypeFilter('ALL');
              setCategoryFilter(null);
              setStyleFilter(null);
              setSourceFilter(null);
            }}
            className="mt-2 text-primary text-xs font-medium hover:underline"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}
    </div>
  );
}

export default DesignLibrarySelector;
