export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-brand-100 ${className}`} />;
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <Skeleton className="h-3 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-4 space-y-3 ${className}`}>
      <Skeleton className="h-3 w-1/3 rounded" />
      <Skeleton className="h-7 w-2/3 rounded" />
      <Skeleton className="h-2 w-1/2 rounded" />
    </div>
  );
}
