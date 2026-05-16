import { SupplierPublicProfile } from "@/components/proveedores/SupplierPublicProfile";
import {
  getPublicSupplierProfile,
  getSupplierReviews,
  userHadWaClickForSupplier,
} from "@/lib/proveedores/queries";
import { parsePublicSupplierRow } from "@/lib/proveedores/public-supplier";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ supplierCodigo: string }>;
}): Promise<Metadata> {
  const { supplierCodigo } = await params;
  const codigo = Number(supplierCodigo);
  if (!Number.isFinite(codigo)) {
    return { title: "Proveedor | Makeray" };
  }
  const supabase = await createServerSupabaseClient();
  const raw = await getPublicSupplierProfile(supabase, codigo);
  const row = raw as Record<string, unknown> | null;
  const tienda = typeof row?.tienda === "string" ? row.tienda : "Proveedor";
  return { title: `${tienda} | Makeray Proveedores` };
}

export default async function DirectorioProveedorPage({
  params,
}: {
  params: Promise<{ supplierCodigo: string }>;
}) {
  const { supplierCodigo } = await params;
  const codigo = Number(supplierCodigo);
  if (!Number.isFinite(codigo)) notFound();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const raw = await getPublicSupplierProfile(supabase, codigo);
  const parsed = parsePublicSupplierRow(raw as Record<string, unknown> | null);
  if (!parsed) notFound();

  const reviews = await getSupplierReviews(supabase, parsed.supplier.id);
  let canReview = false;
  if (user) {
    canReview = await userHadWaClickForSupplier(
      supabase,
      parsed.supplier.id,
      user.id,
    );
  }

  return (
    <SupplierPublicProfile
      supplier={parsed.supplier}
      profile={parsed.profile}
      products={parsed.products}
      offers={parsed.offers}
      reviews={reviews}
      viewerUserId={user?.id ?? null}
      canReview={canReview}
    />
  );
}
