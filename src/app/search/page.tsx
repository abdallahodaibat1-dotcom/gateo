import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchContent from './SearchContent';
import Skeleton from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'البحث | Gateo',
  description: 'ابحث عن مستخدمين، أعمال، منشورات، ومجموعات في Gateo',
};

function SearchFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-20">
      <Skeleton className="w-12 h-12 rounded-full" />
      <p className="text-sm text-muted mt-4">جاري التحميل...</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
