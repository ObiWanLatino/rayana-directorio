export function ProviderSkeleton() {
  return (
    <div className="animate-pulse rounded-[20px] border border-primary/10 bg-white p-5">
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-soft" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-[60%] rounded bg-soft" />
          <div className="h-3 w-[40%] rounded bg-soft" />
          <div className="h-3 w-[80%] rounded bg-soft" />
        </div>
      </div>
      <div className="mt-4 h-px bg-primary/5" />
      <div className="mt-4 h-11 rounded-xl bg-soft" />
    </div>
  );
}
