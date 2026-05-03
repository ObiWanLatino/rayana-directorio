import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { getStripe } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: row, error: qErr } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (qErr || !row?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No hay cliente de facturación asociado" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const origin = getAppUrl();
    const portal = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: `${origin}/hub`,
    });

    if (!portal.url) {
      return NextResponse.json(
        { error: "Stripe no devolvió URL del portal" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al abrir el portal de facturación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
