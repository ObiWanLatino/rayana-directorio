import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { NextResponse, type NextRequest } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { initLemonSqueezy } from "@/lib/lemonsqueezy/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (await userHasListAccess(supabase, user.id)) {
      return NextResponse.json(
        { error: "Ya tienes una suscripción activa" },
        { status: 400 },
      );
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantCl = process.env.LEMONSQUEEZY_VARIANT_ID_CL;
    if (!storeId || !variantCl) {
      return NextResponse.json(
        { error: "Lemon Squeezy store o variant no configurados" },
        { status: 500 },
      );
    }

    const country = request.headers.get("x-vercel-ip-country") ?? "CL";
    const variantBr = process.env.LEMONSQUEEZY_VARIANT_ID_BR;
    const variantId =
      country === "BR" && variantBr && variantBr.trim() !== ""
        ? variantBr
        : variantCl;

    initLemonSqueezy();
    const origin = getAppUrl();
    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.email,
        custom: { user_id: user.id },
      },
      productOptions: {
        redirectUrl: `${origin}/hub`,
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
        { error: "Lemon Squeezy no devolvió URL de checkout" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al crear la sesión de pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
