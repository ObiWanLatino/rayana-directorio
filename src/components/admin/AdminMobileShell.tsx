import type { ReactNode } from "react";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export function AdminMobileShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AdminMobileNav />
      <div className="admin-bottom-nav-spacer" aria-hidden />
    </>
  );
}
