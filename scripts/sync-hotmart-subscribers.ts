/**
 * Reconcilia suscriptores ACTIVE en Hotmart con `public.subscriptions`.
 *
 * Ejemplo:
 *   npx tsx --env-file=.env.local scripts/sync-hotmart-subscribers.ts
 */
import { getSubscribers } from "@/lib/hotmart/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function subscriberCode(item: Record<string, unknown>): string | null {
  const a = item.subscriber_code ?? item.subscriberCode;
  return typeof a === "string" && a.trim() ? a.trim() : null;
}

function buyerEmail(item: Record<string, unknown>): string | null {
  const e = item.email ?? item.buyer_email ?? item.buyerEmail;
  return typeof e === "string" && e.trim() ? e.trim() : null;
}

function escapeForIlikeExact(email: string): string {
  return email
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

async function main() {
  const productId = process.env.HOTMART_PRODUCT_ID?.trim();
  if (!productId) {
    console.error("Falta HOTMART_PRODUCT_ID");
    process.exit(1);
  }

  const admin = createAdminSupabaseClient();
  const activeCodes = new Set<string>();
  let activated = 0;
  let cancelled = 0;
  let errors = 0;
  let pageToken: string | undefined;

  do {
    let page: Awaited<ReturnType<typeof getSubscribers>>;
    try {
      page = await getSubscribers(productId, {
        status: "ACTIVE",
        pageToken,
      });
    } catch (e) {
      console.error("Error listando suscriptores Hotmart:", e);
      process.exit(1);
    }

    for (const raw of page.items ?? []) {
      const item = raw as Record<string, unknown>;
      const code = subscriberCode(item);
      if (!code) {
        errors += 1;
        continue;
      }
      activeCodes.add(code);
      const email = buyerEmail(item);
      if (!email) {
        console.warn("Sin email para subscriber", code);
        errors += 1;
        continue;
      }

      const { data: profile, error: pErr } = await admin
        .from("profiles")
        .select("id")
        .ilike("email", escapeForIlikeExact(email))
        .maybeSingle();

      if (pErr || !profile?.id) {
        console.warn("Sin perfil para", email, code);
        errors += 1;
        continue;
      }

      const plan = item.plan as { name?: string; id?: string } | undefined;
      const { error: uErr } = await admin.from("subscriptions").upsert(
        {
          user_id: profile.id,
          payment_processor: "hotmart",
          provider: "hotmart",
          provider_subscription_id: code,
          status: "active" as const,
          plan_name: typeof plan?.name === "string" ? plan.name : null,
          plan_id:
            plan?.id != null && plan.id !== ""
              ? String(plan.id)
              : null,
          buyer_email: email,
          updated_at: new Date().toISOString(),
          cancel_at_period_end: false,
        },
        { onConflict: "user_id" },
      );
      if (uErr) {
        console.error("Upsert falló", code, uErr.message);
        errors += 1;
      } else {
        activated += 1;
      }
    }

    pageToken = page.page_info?.next_page_token;
  } while (pageToken);

  const { data: localRows, error: listErr } = await admin
    .from("subscriptions")
    .select("id, provider_subscription_id")
    .eq("provider", "hotmart")
    .eq("status", "active");

  if (listErr) {
    console.error("No se pudo listar suscripciones locales:", listErr.message);
    process.exit(1);
  }

  for (const row of localRows ?? []) {
    const sid = row.provider_subscription_id as string | null;
    if (!sid || activeCodes.has(sid)) continue;
    const { error: cErr } = await admin
      .from("subscriptions")
      .update({
        status: "canceled" as const,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (cErr) {
      console.error("Cancel local falló", row.id, cErr.message);
      errors += 1;
    } else {
      cancelled += 1;
    }
  }

  console.log(
    JSON.stringify(
      { activated, cancelled, errors, hotmartActiveCount: activeCodes.size },
      null,
      2,
    ),
  );
}

void main();
