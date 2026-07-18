'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, X, Plus, Check, Tag, Info } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  slug?: string;
}

interface SubcategoryMultiSelectProps {
  subcategories: Subcategory[];
  selectedIds: string[];
  customSubcategories: string[];
  onChange: (selectedIds: string[], customSubcategories: string[]) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  emptyMessage?: string;
}

export function SubcategoryMultiSelect({
  subcategories,
  selectedIds,
  customSubcategories,
  onChange,
  disabled,
  error,
  placeholder = 'ابحث عن تصنيف فرعي أو اكتب واحداً جديداً...',
  emptyMessage = 'لا توجد تصنيفات فرعية',
}: SubcategoryMultiSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = inputValue.trim();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Available = all subcategories that are NOT selected yet
  const available = useMemo(
    () => subcategories.filter((s) => !selectedSet.has(s.id)),
    [subcategories, selectedSet]
  );

  const filtered = useMemo(() => {
    if (!normalized) return available;
    return available.filter((s) => s.name.toLowerCase().includes(normalized.toLowerCase()));
  }, [normalized, available]);

  const selectedSubcategories = useMemo(
    () => subcategories.filter((s) => selectedSet.has(s.id)),
    [subcategories, selectedSet]
  );

  const hasSelection = selectedIds.length > 0 || customSubcategories.length > 0;

  const isCustomAlreadyAdded = useMemo(() => {
    return customSubcategories.some((c) => c.toLowerCase() === normalized.toLowerCase());
  }, [normalized, customSubcategories]);

  const exactMatchInAvailable = useMemo(() => {
    return available.some((s) => s.name.toLowerCase() === normalized.toLowerCase());
  }, [normalized, available]);

  const selectSubcategory = (id: string) => {
    if (disabled) return;
    onChange([...selectedIds, id], customSubcategories);
    setInputValue('');
    inputRef.current?.focus();
  };

  const removeSubcategory = (id: string) => {
    if (disabled) return;
    onChange(selectedIds.filter((sid) => sid !== id), customSubcategories);
  };

  const addCustom = () => {
    if (disabled || !normalized || isCustomAlreadyAdded) return;
    onChange(selectedIds, [...customSubcategories, normalized]);
    setInputValue('');
    inputRef.current?.focus();
  };

  const removeCustom = (name: string) => {
    if (disabled) return;
    onChange(selectedIds, customSubcategories.filter((c) => c !== name));
  };

  const clearAll = () => {
    if (disabled) return;
    onChange([], []);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const exactMatch = filtered.find(
        (s) => s.name.toLowerCase() === normalized.toLowerCase()
      );
      if (exactMatch) {
        selectSubcategory(exactMatch.id);
      } else if (normalized && !isCustomAlreadyAdded && !exactMatchInAvailable) {
        addCustom();
      }
    }
  };

  const showAddCustom =
    normalized && !exactMatchInAvailable && !isCustomAlreadyAdded;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          التصنيف الفرعي {subcategories.length > 0 && <span className="text-red-500">*</span>}
        </label>
        {hasSelection && !disabled && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted hover:text-danger transition-colors"
          >
            مسح الكل
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Search */}
      <div
        className={`relative flex items-center w-full px-5 py-4 rounded-2xl transition-all border-0 shadow-none ${
          error ? 'bg-red-50' : 'bg-slate-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:bg-slate-50'}`}
      >
        <Search className="w-6 h-6 text-muted ml-4 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none focus:outline-none focus-visible:outline-none outline-0 focus:outline-0 focus-visible:outline-0 ring-0 focus:ring-0 focus-visible:ring-0 border-0 focus:border-0 text-base text-foreground placeholder:text-muted"
          style={{ outline: 'none', outlineOffset: '0' }}
          autoComplete="off"
        />
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              inputRef.current?.focus();
            }}
            className="mr-2 p-1 rounded-full hover:bg-slate-200 text-muted"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Available options panel — order 2 on mobile, right on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-1 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium text-muted mb-3 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            التصنيفات الفرعية المتاحة
          </p>

          {/* Chips */}
          {subcategories.length === 0 && !showAddCustom ? (
            <p className="text-sm text-muted text-center py-4">{emptyMessage}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  data-testid="subcategory-chip"
                  onClick={() => selectSubcategory(sub.id)}
                  disabled={disabled}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all whitespace-normal text-right leading-snug ${
                    disabled
                      ? 'cursor-not-allowed opacity-60 bg-surface text-muted border-border'
                      : 'bg-surface text-foreground border-border hover:border-primary hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {sub.name}
                </button>
              ))}

              {showAddCustom && (
                <button
                  type="button"
                  onClick={addCustom}
                  disabled={disabled}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-dashed border-secondary text-secondary bg-secondary/5 hover:bg-secondary/10 transition-all whitespace-normal text-right leading-snug"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  إضافة &quot;{normalized}&quot;
                </button>
              )}
            </div>
          )}

          {normalized && filtered.length === 0 && !showAddCustom && (
            <p className="text-xs text-muted text-center py-3">لا توجد نتائج مطابقة</p>
          )}
        </div>

        {/* Selected panel — order 1 on mobile, left on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-2 rounded-xl border border-accent/20 bg-accent/[0.06] p-5 min-h-[240px]">
          <p className="text-sm font-bold text-accent mb-4 flex items-center gap-2">
            <Check className="w-4 h-4" />
            التصنيفات المختارة
          </p>

          {!hasSelection ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center h-full">
              <div className="w-14 h-14 rounded-full bg-white border border-accent/10 flex items-center justify-center shadow-sm">
                <Tag className="w-6 h-6 text-accent/50" />
              </div>
              <p className="text-sm text-muted">لم تختر أي تصنيف بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
              {selectedSubcategories.map((sub) => (
                <span
                  key={sub.id}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-accent text-white shadow-sm text-center whitespace-normal break-words leading-snug"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{sub.name}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeSubcategory(sub.id)}
                      className="mr-auto hover:bg-white/20 rounded-full p-0.5 shrink-0"
                      aria-label={`إزالة ${sub.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
              {customSubcategories.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-warning text-white shadow-sm text-center whitespace-normal break-words leading-snug"
                >
                  <span>{name}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeCustom(name)}
                      className="mr-auto hover:bg-white/20 rounded-full p-0.5 shrink-0"
                      aria-label={`إزالة ${name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
        <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-red-700 leading-relaxed">
          هذه الخيارات تساعدك ببناء موقعك، ويمكنك إضافة خدمات أثناء البناء لاحقاً.
          اختر من التصنيفات المتاحة، أو اكتب تصنيفاً جديداً واضغط Enter لإضافته.
        </p>
      </div>
    </div>
  );
}
