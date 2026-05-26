import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminMobileShell } from "@/components/admin/AdminMobileShell";
import { isAdminRequestHost } from "@/lib/admin/request-host";
import "./admin-mobile.css";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headerStore = await headers();
  const rawHost =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!isAdminRequestHost(rawHost)) {
    redirect("/hub");
  }
  return <AdminMobileShell>{children}</AdminMobileShell>;
}
