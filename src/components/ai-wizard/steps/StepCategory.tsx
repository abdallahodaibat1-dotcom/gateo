'use client';

import { useState, useMemo } from 'react';
import { Search, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameEn?: string | null;
}

interface StepCategoryProps {
  categories: Category[];
  value: string;
  customValue?: string;
  onChange: (categoryId: string, customCategory?: string) => void;
}

export function StepCategory({ categories, value, customValue, onChange }: StepCategoryProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn?.toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تصنيف النشاط</h2>
        <p className="text-gray-600">اختر التصنيف الذي يصف نشاطك بأفضل شكل.</p>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في التصنيفات..."
          className="w-full pr-10 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
        {filtered.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id, undefined)}
            className={`p-4 rounded-xl border text-right transition-all ${
              value === cat.id
                ? 'border-violet-500 bg-violet-50 text-violet-900 ring-1 ring-violet-500'
                : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{cat.name}</div>
            {cat.nameEn && (
              <div className="text-xs text-gray-500 mt-0.5">{cat.nameEn}</div>
            )}
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            لا توجد نتائج. يمكنك اختيار أخرى أدناه.
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-5">
        <button
          type="button"
          onClick={() => onChange('other', customValue || '')}
          className={`w-full p-4 rounded-xl border text-right transition-all ${
            value === 'other'
              ? 'border-violet-500 bg-violet-50 text-violet-900 ring-1 ring-violet-500'
              : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
          }`}
        >
          <div className="font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            أخرى
          </div>
        </button>

        {value === 'other' && (
          <input
            type="text"
            value={customValue || ''}
            onChange={(e) => onChange('other', e.target.value)}
            placeholder="اكتب تصنيف نشاطك"
            className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
        )}
      </div>
    </div>
  );
}
