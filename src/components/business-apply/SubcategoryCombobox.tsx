'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
  slug?: string;
}

interface SubcategoryComboboxProps {
  subcategories: Subcategory[];
  value?: string;
  selectedId?: string;
  customValue?: string;
  onChange: (payload: { subcategoryId: string; customSubcategory: string }) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  emptyMessage?: string;
}

export function SubcategoryCombobox({
  subcategories,
  value,
  selectedId,
  customValue,
  onChange,
  disabled,
  error,
  placeholder = 'ابحث أو اكتب تخصصك الفرعي...',
  emptyMessage = 'لا توجد تصنيفات فرعية',
}: SubcategoryComboboxProps) {
  const initialId = selectedId || value || '';
  const initialText = customValue || (initialId ? undefined : value) || '';

  const selectedSub = subcategories.find((s) => s.id === initialId);
  const [inputValue, setInputValue] = useState(selectedSub?.name || initialText);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = inputValue.trim();
  const filtered = normalized
    ? subcategories.filter((s) => s.name.toLowerCase().includes(normalized.toLowerCase()))
    : subcategories;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [inputValue]);

  // Sync when value/selectedId/customValue change from parent
  useEffect(() => {
    const id = selectedId || value || '';
    const text = customValue || '';
    const sub = subcategories.find((s) => s.id === id);
    if (sub) {
      setInputValue(sub.name);
    } else if (text) {
      setInputValue(text);
    } else if (!id && !text) {
      setInputValue('');
    }
  }, [selectedId, value, customValue, subcategories]);

  const handleSelect = (sub: Subcategory) => {
    setInputValue(sub.name);
    setIsOpen(false);
    onChange({ subcategoryId: sub.id, customSubcategory: '' });
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    setIsOpen(true);

    const match = subcategories.find(
      (s) => s.name.toLowerCase() === text.trim().toLowerCase()
    );

    if (match) {
      onChange({ subcategoryId: match.id, customSubcategory: '' });
    } else {
      onChange({ subcategoryId: '', customSubcategory: text.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filtered[activeIndex]) {
        handleSelect(filtered[activeIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange({ subcategoryId: '', customSubcategory: '' });
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor="business-subcategory" className="block text-sm font-medium text-foreground mb-1.5">
        التصنيف الفرعي {subcategories.length > 0 && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`relative flex items-center w-full px-4 py-2.5 rounded-md border bg-surface transition-all ${
          error ? 'border-red-300' : 'border-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}
      >
        <Search className="w-4 h-4 text-muted ml-2 shrink-0" />
        <input
          ref={inputRef}
          id="business-subcategory"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        {inputValue ? (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="mr-2 p-0.5 rounded-full hover:bg-slate-100 text-muted"
            aria-label="مسح"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className={`w-4 h-4 text-muted mr-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 max-h-56 overflow-auto rounded-md border border-border bg-surface shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted text-center">
              {normalized ? (
                <>
                  <p>لا توجد نتائج مطابقة</p>
                  <p className="text-xs mt-1 text-primary">سيتم حفظ &quot;{normalized}&quot; كتخصص فرعي مخصص</p>
                </>
              ) : (
                emptyMessage
              )}
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((sub, index) => (
                <li
                  key={sub.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelect(sub)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    index === activeIndex ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-slate-50'
                  }`}
                >
                  {sub.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
