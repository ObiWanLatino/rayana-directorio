import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { NextResponse, type NextRequest } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { initLemonSqueezy } from "@/lib/lemonsqueezy/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupplierPlan } from "@/types/proveedores";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!(await userHasListAccess(supabase, user.id))) {
    return NextResponse.json({ error: "Suscripción requerida" }, { status: 403 });
  }

  let body: { plan?: SupplierPlan; supplier_id?: string };
  try {
    body = (await request.json()) as { plan?: SupplierPlan; supplier_id?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const plan = body.plan;
  const supplierId = body.supplier_id?.trim();
  if ((plan !== "vitrina" && plan !== "pro") || !supplierId) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const variantId =
    plan === "pro"
      ? process.env.LEMON_SQUEEZY_PLAN_PRO_VARIANT_ID?.trim()
      : process.env.LEMON_SQUEEZY_PLAN_VITRINA_VARIANT_ID?.trim();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID?.trim();

  if (!storeId || !variantId) {
    return NextResponse.json(
      { error: "Lemon Squeezy no configurado para planes de proveedor" },
      { status: 500 },
    );
  }

  initLemonSqueezy();
  const origin = getAppUrl();
  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      custom: { user_id: user.id, supplier_id: supplierId },
    },
    productOptions: {
      redirectUrl: `${origin}/proveedor/dashboard`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Error al crear checkout" },
      { status: 500 },
    );
  }

  const url = data?.data?.attributes?.url;
  if (!url) {
    return NextResponse.json(
      { error: "Lemon Squeezy no devolvió URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url });
}
