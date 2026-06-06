export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-4/5 w-full animate-pulse rounded-lg bg-secondary" />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
