'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Check, Palette, Wand2, X } from 'lucide-react';
import { getThemePresetList, getThemePresetById, ThemePreset } from '@/lib/business-template-generator';

interface ThemeSelectorProps {
  selectedPresetId?: string;
  onSelect: (presetId: string) => void;
  businessName?: string;
  categoryName?: string;
  subcategoryName?: string;
}

const ALL_PRESETS = getThemePresetList();

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

function suggestPresetId(categoryName?: string, subcategoryName?: string, businessName?: string): string {
  const tokens = [categoryName, subcategoryName, businessName]
    .filter(Boolean)
    .map((s) => (s as string).toLowerCase()) as string[];

  for (const preset of ALL_PRESETS) {
    const keywords = (preset.keywords || []).map((k) => k.toLowerCase());
    for (const token of tokens) {
      if (keywords.some((k) => token.includes(k))) {
        return preset.presetId;
      }
    }
  }

  // fallback by category tags
  for (const preset of ALL_PRESETS) {
    const tags = (preset.categoryTags || []).map((t) => t.toLowerCase());
    for (const token of tokens) {
      if (tags.some((t) => token.includes(t))) {
        return preset.presetId;
      }
    }
  }

  return 'default';
}

export function ThemeSelector({
  selectedPresetId,
  onSelect,
  businessName,
  categoryName,
  subcategoryName,
}: ThemeSelectorProps) {
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);

  const styles = useMemo(() => Array.from(new Set(ALL_PRESETS.map((p) => p.style).filter(Boolean))) as string[], []);
  const sources = useMemo(() => Array.from(new Set(ALL_PRESETS.map((p) => p.source).filter(Boolean))) as string[], []);

  const filteredPresets = useMemo(() => {
    return ALL_PRESETS.filter((preset) => {
      const matchesQuery =
        !query.trim() ||
        preset.nameAr.toLowerCase().includes(query.toLowerCase()) ||
        preset.name.toLowerCase().includes(query.toLowerCase()) ||
        (preset.descriptionAr || '').toLowerCase().includes(query.toLowerCase()) ||
        (preset.categoryTags || []).some((t) => t.toLowerCase().includes(query.toLowerCase()));

      const matchesStyle = !styleFilter || preset.style === styleFilter;
      const matchesSource = !sourceFilter || preset.source === sourceFilter;

      return matchesQuery && matchesStyle && matchesSource;
    });
  }, [query, styleFilter, sourceFilter]);

  const handleAiSuggest = () => {
    setAiSuggesting(true);
    // محاكاة تأخير الذكاء الاصطناعي لإعطاء الشعور بالتحليل
    setTimeout(() => {
      const suggested = suggestPresetId(categoryName, subcategoryName, businessName);
      onSelect(suggested);
      setAiSuggesting(false);
    }, 600);
  };

  const selectedPreset = selectedPresetId ? getThemePresetById(selectedPresetId) : undefined;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            اختر قالب موقعك
          </h2>
          <p className="text-sm text-muted mt-0.5">
            مكتبة تحتوي على {ALL_PRESETS.length} قالباً مجانياً مُلهمًا من أشهر مصادر التصميم.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={aiSuggesting}
            aria-label="اضغط هنا للاختيار التلقائي"
            title="اضغط هنا للاختيار التلقائي"
            className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            {aiSuggesting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </button>
          <span className="text-xs font-medium text-primary cursor-pointer hover:underline whitespace-nowrap">اضغط هنا للاختيار التلقائي</span>
        </div>
      </div>

      {/* Selected banner */}
      <AnimatePresence>
        {selectedPreset && (
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
              <p className="text-sm font-bold text-foreground truncate">{selectedPreset.nameAr}</p>
              <p className="text-xs text-muted truncate">{selectedPreset.descriptionAr}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-white rounded-full px-2.5 py-1 shadow-sm">
              <Check className="w-3.5 h-3.5" />
              مختار
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="space-y-3">
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

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted py-1.5">النمط:</span>
          {styles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setStyleFilter(styleFilter === style ? null : style)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                styleFilter === style
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-muted hover:bg-slate-200'
              }`}
            >
              {STYLE_LABELS[style || ''] || style}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted py-1.5">المصدر:</span>
          {sources.map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => setSourceFilter(sourceFilter === source ? null : source)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                sourceFilter === source
                  ? 'bg-secondary text-white'
                  : 'bg-slate-100 text-muted hover:bg-slate-200'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPresets.map((preset) => {
            const isSelected = selectedPresetId === preset.presetId;
            return (
              <motion.div
                layout
                key={preset.presetId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative rounded-xl border overflow-hidden transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-border hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                {/* Preview gradient */}
                <div
                  className="h-28 w-full relative"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.secondaryColor})`,
                  }}
                >
                  <div className="absolute top-2 right-2 flex gap-1">
                    {preset.categoryTags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-black/30 text-white px-1.5 py-0.5 rounded backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {preset.source && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[10px] bg-white/90 text-foreground px-1.5 py-0.5 rounded shadow-sm">
                        {preset.source}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: preset.secondaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>

                  <h3 className="font-bold text-foreground text-sm mb-0.5">{preset.nameAr}</h3>
                  <p className="text-xs text-muted line-clamp-2 min-h-[2.5rem]">
                    {preset.descriptionAr || preset.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => onSelect(preset.presetId)}
                    className={`mt-3 w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredPresets.length === 0 && (
        <div className="text-center py-10 text-muted">
          <Palette className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد قوالب تطابق البحث</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
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
