// DEPRECATED: Esta ruta será migrada a admin.makeray.cl
// TODO: Eliminar después de migración completa

import { SubscriptionsAdminTable } from "@/components/admin/SubscriptionsAdminTable";
import type { AdminSubscriptionRow } from "@/components/admin/SubscriptionsAdminTable";
import { getAdminUser } from "@/lib/auth/require-admin";
import { getStripe } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { rpcGetActiveGiftedAccess } from "@/lib/supabase/gifted-access-client";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SubscriptionRow = {
  user_id: string;
  status: "active" | "past_due" | "canceled" | "inactive";
  created_at: string | null;
  updated_at: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  suspended: boolean | null;
};

type Metrics = {
  totalActive: number;
  mrrUsd: number;
  newThisMonth: number;
  canceledThisMonth: number;
};

function logSubscriptionsQueryError(label: string, err: unknown) {
  const e = err as { message?: string };
  console.error(`[subscriptions page] ${label} error:`, e?.message ?? err);
}

async function loadData(): Promise<{ rows: AdminSubscriptionRow[]; metrics: Metrics }> {
  const db = createAdminSupabaseClient();

  let profileRows: ProfileRow[] = [];
  let subsRows: SubscriptionRow[] = [];

  try {
    const [{ data: profiles, error: profilesError }, { data: subscriptions, error: subsError }] =
      await Promise.all([
        db
          .from("profiles")
          .select("id, email, full_name, avatar_url, created_at, suspended")
          .order("created_at", { ascending: false }),
        db
          .from("subscriptions")
          .select(
            "user_id, status, created_at, updated_at, current_period_end, stripe_customer_id, stripe_subscription_id",
          ),
      ]);

    if (profilesError) {
      throw profilesError;
    }
    if (subsError) {
      throw subsError;
    }

    profileRows = (profiles ?? []) as ProfileRow[];
    subsRows = (subscriptions ?? []) as SubscriptionRow[];
  } catch (err) {
    logSubscriptionsQueryError("profiles/subscriptions", err);
  }

  const subByUser = new Map(subsRows.map((s) => [s.user_id, s]));

  let giftedRows: {
    id: string;
    user_id: string;
    reason: string | null;
    expires_at: string | null;
    created_at: string;
  }[] = [];

  try {
    const { data, error } = await rpcGetActiveGiftedAccess();

    if (error) {
      throw error;
    }
    giftedRows = data.map((g) => ({
      id: g.id,
      user_id: g.user_id,
      reason: g.reason,
      expires_at: g.expires_at,
      created_at: g.created_at,
    }));
  } catch (err) {
    logSubscriptionsQueryError("gifted_access", err);
  }

  const giftedByUser = new Map(
    giftedRows.map((g) => [
      g.user_id,
      {
        id: g.id,
        reason: g.reason ?? null,
        expires_at: g.expires_at ?? null,
      },
    ]),
  );

  const stripe = getStripe();
  const totalPaidByUser = new Map<string, number>();
  await Promise.all(
    subsRows.map(async (sub) => {
      if (!sub.stripe_customer_id) {
        totalPaidByUser.set(sub.user_id, 0);
        return;
      }
      try {
        const intents = await stripe.paymentIntents.list({
          customer: sub.stripe_customer_id,
          limit: 100,
        });
        const paid = intents.data
          .filter((pi) => pi.status === "succeeded")
          .reduce((sum, pi) => sum + (pi.amount_received ?? 0), 0);
        totalPaidByUser.set(sub.user_id, paid);
      } catch {
        totalPaidByUser.set(sub.user_id, 0);
      }
    }),
  );

  const rows: AdminSubscriptionRow[] = profileRows.map((profile) => {
    const sub = subByUser.get(profile.id);
    return {
      user_id: profile.id,
      avatar_url: profile.avatar_url,
      full_name: profile.full_name,
      email: profile.email ?? "(sin email)",
      registered_at: profile.created_at,
      subscription_started_at: sub?.created_at ?? null,
      next_billing_at: sub?.current_period_end ?? null,
      total_paid_usd_cents: totalPaidByUser.get(profile.id) ?? 0,
      status: sub?.status ?? "inactive",
      suspended: Boolean(profile.suspended),
      gifted_access: giftedByUser.get(profile.id) ?? null,
    };
  });

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const isThisMonth = (value: string | null) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getMonth() === month && d.getFullYear() === year;
  };
  const totalActive = rows.filter(
    (r) => !r.suspended && (r.status === "active" || r.status === "past_due"),
  ).length;
  const newThisMonth = rows.filter(
    (r) =>
      !r.suspended &&
      (r.status === "active" || r.status === "past_due") &&
      isThisMonth(r.subscription_started_at),
  ).length;
  const canceledThisMonth = subsRows.filter(
    (s) => s.status === "canceled" && isThisMonth(s.updated_at),
  ).length;

  return {
    rows,
    metrics: {
      totalActive,
      mrrUsd: totalActive * 19,
      newThisMonth,
      canceledThisMonth,
    },
  };
}

export default async function AdminSubscriptionsPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const { rows, metrics } = await loadData();

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Volver a Admin
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          Panel de suscriptores
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">
          Métricas y gestión completa de accesos, suscripciones y reembolsos.
        </p>

        <SubscriptionsAdminTable rows={rows} metrics={metrics} />
      </div>
    </div>
  );
}
