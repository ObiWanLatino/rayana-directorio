import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type Badge = "nuevo" | "verificado" | "top" | "destacado_mes";

const BADGE_CRITERIA = {
  verificado: { min_wa_clicks_30d: 20 },
  top: { min_wa_clicks_30d: 50 },
} as const;

function computeBadge(
  analytics: {
    wa_clicks: number;
  },
  reviewStats: {
    avg_rating: number;
    verified_reviews: number;
  },
  currentBadge: Badge,
): Badge {
  if (currentBadge === "destacado_mes") return "destacado_mes";
  const wa = Number(analytics.wa_clicks ?? 0);
  const avg = Number(reviewStats.avg_rating ?? 0);
  const vr = Number(reviewStats.verified_reviews ?? 0);
  if (wa >= BADGE_CRITERIA.top.min_wa_clicks_30d || (avg >= 4 && vr >= 5)) {
    return "top";
  }
  if (wa >= BADGE_CRITERIA.verificado.min_wa_clicks_30d || vr >= 1) {
    return "verificado";
  }
  return currentBadge;
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("BADGE_UPDATER_CRON_SECRET");
  const auth = req.headers.get("Authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response("Missing env", { status: 500 });
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profiles } = await supabase
    .from("supplier_profiles")
    .select("id, supplier_id, badge")
    .in("plan", ["vitrina", "pro"])
    .eq("activo", true);

  let updated = 0;

  for (const profile of profiles ?? []) {
    const [{ data: analytics }, { data: reviews }] = await Promise.all([
      supabase
        .from("supplier_analytics_30d")
        .select("*")
        .eq("supplier_id", profile.supplier_id)
        .maybeSingle(),
      supabase
        .from("supplier_review_stats")
        .select("*")
        .eq("supplier_id", profile.supplier_id)
        .maybeSingle(),
    ]);

    if (!analytics) continue;

    const newBadge = computeBadge(
      analytics as { wa_clicks: number },
      (reviews ?? {
        supplier_id: profile.supplier_id,
        total_reviews: 0,
        avg_rating: 0,
        verified_reviews: 0,
      }) as { avg_rating: number; verified_reviews: number },
      profile.badge as Badge,
    );

    if (newBadge !== profile.badge) {
      await supabase
        .from("supplier_profiles")
        .update({
          badge: newBadge,
          badge_updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      updated++;
    }
  }

  return new Response(JSON.stringify({ updated }), {
    headers: { "Content-Type": "application/json" },
  });
});
