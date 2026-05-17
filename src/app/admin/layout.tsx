import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminRequestHost } from "@/lib/admin/request-host";

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
  return children;
}
