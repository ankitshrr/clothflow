import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-24 rounded-lg" />
                <Skeleton className="w-20 h-24 rounded-lg" />
                <Skeleton className="w-20 h-24 rounded-lg" />
              </div>
            </div>
            
            {/* Info Skeleton */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-6 w-1/3 rounded-lg" />
              </div>
              
              <Skeleton className="h-24 w-full rounded-lg" />
              
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-12 rounded-lg" />
                  <Skeleton className="h-10 w-12 rounded-lg" />
                  <Skeleton className="h-10 w-12 rounded-lg" />
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
