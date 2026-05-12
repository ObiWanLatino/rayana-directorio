import { Suspense } from "react";
import { ProveedoresView } from "@/components/suppliers/ProveedoresView";
import { ProviderSkeleton } from "@/components/ProviderSkeleton";

function DirectorioFallback() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-off px-4 py-10">
      <div className="w-full max-w-4xl space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-navy/10" />
        <div className="h-12 w-full max-w-md animate-pulse rounded-xl bg-navy/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProviderSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DirectorioViewShell() {
  return (
    <Suspense fallback={<DirectorioFallback />}>
      <ProveedoresView />
    </Suspense>
  );
}
