export function SupplierListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="clay-card p-3.5">
          <div className="flex items-center gap-3">
            <div
              className="clay-skeleton h-[30px] w-12 shrink-0 rounded-xl"
              aria-hidden
            />
            <div
              className="clay-skeleton h-[42px] w-[42px] shrink-0 rounded-full"
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div
                className="clay-skeleton h-[13px] w-[55%] rounded-[5px]"
                aria-hidden
              />
              <div
                className="clay-skeleton mt-1.5 h-[11px] w-[38%] rounded-[5px]"
                aria-hidden
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <div
              className="clay-skeleton h-[38px] w-[38px] rounded-full"
              aria-hidden
            />
            <div
              className="clay-skeleton h-[38px] w-[38px] rounded-full"
              aria-hidden
            />
            <div
              className="clay-skeleton h-[38px] w-[38px] rounded-full"
              aria-hidden
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
