import Skeleton from '@/components/ui/Skeleton';

export default function ProfessionalDirectoryCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="px-5 -mt-11 flex justify-center">
        <Skeleton circle className="w-24 h-24 border-4 border-white" />
      </div>
      <div className="px-5 pt-3 pb-5 text-center space-y-2">
        <Skeleton className="h-5 w-2/3 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="flex justify-center gap-2 mt-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-border">
          <Skeleton className="h-10 mx-auto w-16" />
          <Skeleton className="h-10 mx-auto w-16" />
          <Skeleton className="h-10 mx-auto w-16" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      </div>
    </div>
  );
}
