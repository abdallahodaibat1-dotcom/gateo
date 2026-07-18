'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface RecentlyViewedItem {
  productId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  name: string;
  price: number;
  image: string | null;
  viewedAt: string;
}

interface RecentlyViewedContextValue {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clear: () => {},
});

const STORAGE_KEY = 'gateo-recently-viewed';
const MAX_ITEMS = 12;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
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

  const addItem = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== item.productId);
      return [
        { ...item, viewedAt: new Date().toISOString() },
        ...next,
      ].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(() => ({ items, addItem, removeItem, clear }), [items, addItem, removeItem, clear]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
