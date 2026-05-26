"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/suppliers?pais=cl",
    label: "Proveedores",
    match: (path: string) => path.startsWith("/suppliers"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/categorias",
    label: "Categorías",
    match: (path: string) => path.startsWith("/categorias"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    href: "/subscriptions",
    label: "Accesos",
    match: (path: string) => path.startsWith("/subscriptions"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="8"
          width="18"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 8V5a2 2 0 012-2h0a2 2 0 012 2v3M12 8H8M12 8h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/",
    label: "Stats",
    match: (path: string) =>
      path === "/" ||
      path === "/proveedores" ||
      path === "/upload",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19V5M10 19V11M16 19V8M22 19V3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-bottom-nav" aria-label="Navegación admin">
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-bottom-nav-link${active ? " admin-bottom-nav-link--active" : ""}`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
