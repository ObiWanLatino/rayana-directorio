import { NextResponse } from "next/server";
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
      .select("customer_portal_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    const portalUrl = row?.customer_portal_url;
    if (!portalUrl || typeof portalUrl !== "string") {
      return NextResponse.json(
        {
          error:
            "No hay portal de cliente. Completa una suscripción con Lemon Squeezy o espera a que el webhook registre la URL.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ url: portalUrl });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al abrir el portal de facturación";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
