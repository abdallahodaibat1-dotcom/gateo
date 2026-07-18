'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CompareItem {
  productId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  name: string;
  price: number;
  image: string | null;
  category?: string | null;
}

interface CompareContextValue {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  toggleItem: (item: CompareItem) => void;
  clear: () => void;
  totalCount: number;
}

const CompareContext = createContext<CompareContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInCompare: () => false,
  toggleItem: () => {},
  clear: () => {},
  totalCount: 0,
});

const STORAGE_KEY = 'gateo-compare';
const MAX_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let loaded = false;
    const init = async () => {
      if (loaded) return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch {
        // ignore corrupted storage
      }
      loaded = true;
      setMounted(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) return prev;
      return [...prev, item].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) {
        return prev.filter((i) => i.productId !== item.productId);
      }
      return [...prev, item].slice(0, MAX_ITEMS);
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => items.length, [items]);

  return (
    <CompareContext.Provider value={{ items, addItem, removeItem, isInCompare, toggleItem, clear, totalCount }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
