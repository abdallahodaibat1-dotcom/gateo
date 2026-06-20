'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Globe, Loader2, MapPin, Check } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  flagEmoji: string;
  phoneCode?: string;
}

interface CountrySelectProps {
  countries: Country[];
  value: string;
  onChange: (countryId: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  showPhoneCode?: boolean;
  autoDetect?: boolean;
  onAutoDetected?: (country: Country) => void;
  hideChevron?: boolean;
}

export default function CountrySelect({
  countries,
  value,
  onChange,
  label = 'الدولة',
  required = false,
  disabled = false,
  loading = false,
  placeholder = 'اختر الدولة',
  className = '',
  showPhoneCode = false,
  autoDetect = true,
  onAutoDetected,
  hideChevron = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [autoDetecting, setAutoDetecting] = useState(autoDetect && !value);
  const [detected, setDetected] = useState(false);
  const [detectMessage, setDetectMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedCountry = countries.find((c) => c.id === value);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    return countries.filter(
      (c) =>
        c.name.includes(searchQuery) ||
        c.flagEmoji.includes(searchQuery) ||
        (showPhoneCode && c.phoneCode?.includes(searchQuery))
    );
  }, [countries, searchQuery, showPhoneCode]);

  const updateSearchQuery = useCallback((next: string | ((prev: string) => string)) => {
    setSearchQuery(next);
    setFocusedIndex(-1);
  }, []);

  const handleSelect = useCallback((countryId: string) => {
    onChange(countryId);
    setIsOpen(false);
    updateSearchQuery('');
    setDetectMessage('');
  }, [onChange, updateSearchQuery]);

  // Auto-detect country on mount
  useEffect(() => {
    if (!autoDetect || value || detected) return;

    const detect = async () => {
      try {
        const res = await fetch('/api/geo/detect');
        const data = await res.json();
        if (data.country?.id) {
          onChange(data.country.id);
          onAutoDetected?.(data.country);
          setDetected(true);
        } else if (data.source === 'localhost') {
          setDetectMessage('لم نتمكن من تحديد موقعك تلقائياً — اختر دولتك يدوياً');
        }
      } catch {
        setDetectMessage('لم نتمكن من تحديد موقعك — اختر دولتك يدوياً');
      } finally {
        setAutoDetecting(false);
      }
    };

    detect();
  }, [autoDetect, value, detected, onChange, onAutoDetected]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep hidden input focused while dropdown is open
  useEffect(() => {
    if (isOpen && !disabled && !loading && !autoDetecting) {
      inputRef.current?.focus();
    }
  }, [isOpen, disabled, loading, autoDetecting]);

  // Type-ahead and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target === inputRef.current;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const idx = focusedIndex >= 0 ? focusedIndex : 0;
        const country = filteredCountries[idx];
        if (country) handleSelect(country.id);
        return;
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Capture printable characters to focus search input and append
      if (isTyping) return;
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;

      e.preventDefault();
      inputRef.current?.focus();
      updateSearchQuery((prev) => prev + e.key);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCountries, focusedIndex, handleSelect, updateSearchQuery]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  const triggerLabel = selectedCountry
    ? showPhoneCode
      ? `${selectedCountry.flagEmoji} ${selectedCountry.phoneCode}`
      : `${selectedCountry.flagEmoji} ${selectedCountry.name}`
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        className={`relative w-full rounded-md border transition-all text-sm text-right overflow-hidden ${
          disabled || loading || autoDetecting
            ? 'bg-slate-100 border-border text-muted cursor-not-allowed'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-surface'
            : 'border-border hover:border-slate-300 bg-surface'
        }`}
        onClick={() => {
          if (!disabled && !loading && !autoDetecting) {
            setIsOpen(true);
            updateSearchQuery('');
            inputRef.current?.focus();
          }
        }}
      >
        {/* Visible display */}
        <div className="w-full flex items-center gap-2 px-3 py-2.5 text-right pointer-events-none select-none">
          {loading || autoDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted" />
          ) : selectedCountry ? (
            <>
              <span className="text-sm shrink-0">{selectedCountry.flagEmoji}</span>
              <span className="flex-1 truncate">
                {showPhoneCode ? selectedCountry.phoneCode : selectedCountry.name}
              </span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <span className="flex-1 truncate text-muted">{placeholder}</span>
            </>
          )}
        </div>

        {/* Hidden input for typing/search */}
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          aria-label={label || 'بحث الدولة'}
          disabled={disabled || loading || autoDetecting}
          value={searchQuery}
          onChange={(e) => {
            updateSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onBlur={() => {
            // Delay to allow clicking a dropdown item
            setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
              }
            }, 150);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const idx = focusedIndex >= 0 ? focusedIndex : 0;
              const country = filteredCountries[idx];
              if (country) handleSelect(country.id);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              if (!isOpen) {
                setIsOpen(true);
              }
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text caret-transparent text-transparent outline-none z-10"
        />

        {!hideChevron && (
          <ChevronDown
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {/* Detection message */}
      {detectMessage && !value && (
        <p className="mt-1.5 text-xs text-warning bg-warning/10 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
          <MapPin className="w-3 h-3 shrink-0" />
          {detectMessage}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full min-w-[12rem] mt-1.5 bg-surface rounded-lg border border-border shadow-lg overflow-hidden">
          {/* Country list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                لا توجد نتائج
              </div>
            ) : (
              <>
                {/* Quick select: auto-detected */}
                {detected && selectedCountry && !searchQuery && (
                  <div className="px-2 pt-1">
                    <p className="text-[10px] text-muted px-2 py-1">تم الكشف تلقائياً</p>
                  </div>
                )}

                {filteredCountries.map((country, index) => (
                  <button
                    key={country.id}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    type="button"
                    onClick={() => handleSelect(country.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-right ${
                      value === country.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : focusedIndex === index
                        ? 'bg-slate-100 text-foreground'
                        : 'text-foreground hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{country.flagEmoji}</span>
                    <span className="flex-1 truncate">{country.name}</span>
                    {showPhoneCode && country.phoneCode && (
                      <span className="text-xs text-muted shrink-0">{country.phoneCode}</span>
                    )}
                    {value === country.id && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer count */}
          <div className="px-4 py-1.5 border-t border-border bg-slate-50 text-[10px] text-muted text-center">
            {filteredCountries.length} دولة
          </div>
        </div>
      )}
    </div>
  );
}
