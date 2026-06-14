function SkeletonLoader({ count = 6, variant = 'card' }) {
  if (variant === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-zinc-800 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-video bg-zinc-700" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-700 rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-6 bg-zinc-700 rounded w-16" />
                <div className="h-6 bg-zinc-700 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'list') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-zinc-800 rounded-lg p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="h-20 w-20 bg-zinc-700 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-700 rounded w-1/2" />
                <div className="h-3 bg-zinc-700 rounded w-3/4" />
                <div className="h-3 bg-zinc-700 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'grid') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-zinc-800 rounded-lg animate-pulse aspect-[2/3]">
            <div className="w-full h-full bg-zinc-700 rounded-lg" />
          </div>
        ))}
      </>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 bg-zinc-700 rounded animate-pulse w-full" />
        ))}
      </div>
    );
  }

  return null;
}

export default SkeletonLoader;
