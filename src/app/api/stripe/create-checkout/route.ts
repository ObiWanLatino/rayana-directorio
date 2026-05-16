import { NextResponse } from "next/server";
import { createRegionalStripeSubscriptionCheckoutSession } from "@/lib/stripe/create-regional-checkout-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await createRegionalStripeSubscriptionCheckoutSession(
      request.headers,
      supabase,
      user,
      { cancelPath: "/checkout" },
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ url: result.url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al crear la sesión de pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
