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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createRegionalStripeSubscriptionCheckoutSession(
      request.headers,
      supabase,
      user,
      { cancelPath: "/pricing" },
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      url: result.url,
      pricing: result.pricing,
    });
  } catch (e) {
    console.error("Error creating checkout session:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
