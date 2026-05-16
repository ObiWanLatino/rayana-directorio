import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ProveedorIndexPage() {
  redirect("/proveedor/dashboard");
}
