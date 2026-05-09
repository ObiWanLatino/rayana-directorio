"use client";

import { MakerayLogo } from "@/components/MakerayLogo";

export const CATEGORY_SIDEBAR_ALL = "__all__";

export type CategorySidebarRow = {
  name: string;
  emoji: string;
  count: number;
};

type CategorySidebarProps = {
  categories: CategorySidebarRow[];
  active: string;
  onSelect: (categoryKey: string) => void;
  totalCount: number;
  footer?: React.ReactNode;
  /** Raw keys parallel to categories (same order); defaults to name */
  keys?: string[];
};

export function CategorySidebar({
  categories,
  active,
  onSelect,
  totalCount,
  footer,
  keys,
}: CategorySidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <MakerayLogo size="sm" invert href="/hub" />
      <p className="mb-3 mt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">
        Categorías
      </p>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onSelect(CATEGORY_SIDEBAR_ALL)}
          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${
            active === CATEGORY_SIDEBAR_ALL
              ? "bg-accent/15 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span>Todas</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
            {totalCount}
          </span>
        </button>
        {categories.map((row, i) => {
          const key = keys?.[i] ?? row.name;
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors ${
                isActive
                  ? "bg-accent/15 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="min-w-0 truncate">
                <span className="mr-1.5" aria-hidden>
                  {row.emoji}
                </span>
                {row.name}
              </span>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                {row.count}
              </span>
            </button>
          );
        })}
      </div>
      {footer ? <div className="mt-auto border-t border-white/10 pt-4">{footer}</div> : null}
    </div>
  );
}
