import { SubscriptionsAdminTable } from "@/components/admin/SubscriptionsAdminTable";
import { getAdminUser } from "@/lib/auth/require-admin";
import { getStripe } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type DbRow = {
  user_id: string;
  status: string;
  created_at: string;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
  refunded_at: string | null;
  profile: { email: string | null } | null;
};

type UiRow = {
  user_id: string;
  email: string;
  started_at: string | null;
  expires_at: string | null;
  amount_clp: number | null;
  status: string;
  refunded_at: string | null;
};

async function loadRows(): Promise<UiRow[]> {
  const db = createAdminSupabaseClient();
  const { data, error } = await db
    .from("subscriptions")
    .select(
      "user_id, status, created_at, current_period_end, stripe_subscription_id, refunded_at, profile:profiles(email)",
    )
    .in("status", ["active", "past_due"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as DbRow[];
  const stripe = getStripe();

  const amountMap = new Map<string, number | null>();
  await Promise.all(
    rows.map(async (row) => {
      if (!row.stripe_subscription_id) {
        amountMap.set(row.user_id, null);
        return;
      }
      try {
        const subscription = await stripe.subscriptions.retrieve(
          row.stripe_subscription_id,
          { expand: ["items.data.price"] },
        );
        const firstPrice = subscription.items.data[0]?.price;
        amountMap.set(row.user_id, firstPrice?.unit_amount ?? null);
      } catch {
        amountMap.set(row.user_id, null);
      }
    }),
  );

  return rows.map((row) => ({
    user_id: row.user_id,
    email: row.profile?.email ?? "(sin email)",
    started_at: row.created_at,
    expires_at: row.current_period_end,
    amount_clp: amountMap.get(row.user_id) ?? null,
    status: row.status,
    refunded_at: row.refunded_at,
  }));
}

export default async function AdminSubscriptionsPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/login?next=/admin/subscriptions");
  }

  const rows = await loadRows();

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Volver a Admin
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          Gestión de suscripciones
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">
          Administra suscripciones activas, cancelaciones y reembolsos desde un
          solo lugar.
        </p>

        <SubscriptionsAdminTable rows={rows} />
      </div>
    </div>
  );
}
