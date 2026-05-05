"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type AdminSubscriptionRow = {
  user_id: string;
  avatar_url: string | null;
  full_name: string | null;
  email: string;
  registered_at: string;
  subscription_started_at: string | null;
  next_billing_at: string | null;
  total_paid_usd_cents: number;
  status: string;
  suspended: boolean;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CL");
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusLabel(row: AdminSubscriptionRow): {
  text: string;
  className: string;
} {
  if (row.suspended) {
    return {
      text: "Suspendida",
      className: "bg-orange-100 text-orange-800",
    };
  }
  if (row.status === "active" || row.status === "past_due") {
    return {
      text: "Activa",
      className: "bg-emerald-100 text-emerald-800",
    };
  }
  if (row.status === "canceled") {
    return {
      text: "Cancelada",
      className: "bg-red-100 text-red-800",
    };
  }
  return {
    text: "Sin suscripción",
    className: "bg-zinc-200 text-zinc-700",
  };
}

type Props = {
  rows: AdminSubscriptionRow[];
  metrics: {
    totalActive: number;
    mrrUsd: number;
    newThisMonth: number;
    canceledThisMonth: number;
  };
};

export function SubscriptionsAdminTable({ rows, metrics }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "canceled" | "suspended" | "none"
  >("all");
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [magicEmail, setMagicEmail] = useState<string | null>(null);

  async function postAction(
    endpoint: string,
    payload: Record<string, unknown>,
    confirmation?: string,
  ) {
    if (confirmation && !window.confirm(confirmation)) return;
    setError(null);
    setBusyId(`${endpoint}:${String(payload.user_id ?? payload.email ?? "global")}`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; magic_link?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Operación fallida");
      }
      if (endpoint.endsWith("/magic-link")) {
        setMagicLink(data.magic_link ?? "");
        setMagicEmail(String(payload.email ?? ""));
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  }

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const label = statusLabel(row).text;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && label === "Activa") ||
        (statusFilter === "canceled" && label === "Cancelada") ||
        (statusFilter === "suspended" && label === "Suspendida") ||
        (statusFilter === "none" && label === "Sin suscripción");
      if (!matchesStatus) return false;
      if (!q) return true;
      const haystack = `${row.email} ${row.full_name ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, statusFilter]);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Total suscriptores activos</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {metrics.totalActive}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">MRR en USD</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            ${metrics.mrrUsd}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Nuevos este mes</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {metrics.newThisMonth}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-zinc-500">Cancelaciones este mes</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">
            {metrics.canceledThisMonth}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por email o nombre"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-300 focus:ring-2"
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as "all" | "active" | "canceled" | "suspended" | "none",
            )
          }
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none ring-zinc-300 focus:ring-2"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="canceled">Cancelada</option>
          <option value="suspended">Suspendida</option>
          <option value="none">Sin suscripción</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {error ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Próximo cobro</th>
              <th className="px-4 py-3 font-medium">Total pagado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                  No hay resultados para este filtro.
                </td>
              </tr>
            ) : null}
            {filteredRows.map((row) => {
              const cancelBusy =
                busyId === "/api/admin/subscriptions/cancel:" + row.user_id;
              const refundBusy =
                busyId === "/api/admin/subscriptions/refund:" + row.user_id;
              const suspendBusy =
                busyId === "/api/admin/subscriptions/suspend:" + row.user_id;
              const magicBusy =
                busyId === "/api/admin/subscriptions/magic-link:" + row.email;
              const badge = statusLabel(row);
              const displayName =
                row.full_name?.trim() || row.email.split("@")[0] || "Usuario";
              return (
                <tr key={row.user_id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.avatar_url ? (
                        <div
                          className="h-9 w-9 rounded-full bg-zinc-200 bg-cover bg-center"
                          style={{ backgroundImage: `url(${row.avatar_url})` }}
                          aria-label={displayName}
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {displayName}
                        </p>
                        <p className="text-xs text-zinc-500">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(row.registered_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                    >
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(row.next_billing_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-zinc-700">
                      {formatUsd(row.total_paid_usd_cents)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <details className="relative">
                      <summary className="cursor-pointer list-none rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100">
                        Acciones
                      </summary>
                      <div className="absolute right-0 z-10 mt-2 w-52 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                        <button
                          type="button"
                          disabled={magicBusy}
                          onClick={() =>
                            postAction("/api/admin/subscriptions/magic-link", {
                              email: row.email,
                            })
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-100 disabled:opacity-60"
                        >
                          Enviar magic link
                        </button>
                        <button
                          type="button"
                          disabled={cancelBusy}
                          onClick={() =>
                            postAction(
                              "/api/admin/subscriptions/cancel",
                              { user_id: row.user_id },
                              `Cancelar suscripción de ${row.email}?`,
                            )
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-100 disabled:opacity-60"
                        >
                          Cancelar suscripción
                        </button>
                        <button
                          type="button"
                          disabled={refundBusy}
                          onClick={() =>
                            postAction(
                              "/api/admin/subscriptions/refund",
                              { user_id: row.user_id },
                              `Reembolsar último pago de ${row.email}?`,
                            )
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-100 disabled:opacity-60"
                        >
                          Reembolsar
                        </button>
                        <button
                          type="button"
                          disabled={suspendBusy}
                          onClick={() =>
                            postAction(
                              "/api/admin/subscriptions/suspend",
                              { user_id: row.user_id, suspended: !row.suspended },
                              row.suspended
                                ? `Restaurar acceso de ${row.email}?`
                                : `Suspender acceso de ${row.email}?`,
                            )
                          }
                          className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-100 disabled:opacity-60"
                        >
                          {row.suspended ? "Restaurar acceso" : "Suspender acceso"}
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
      {magicLink ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900">Magic link</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Copia este link y envíalo manualmente a {magicEmail}.
            </p>
            <textarea
              readOnly
              value={magicLink}
              className="mt-3 h-28 w-full rounded-lg border border-zinc-200 p-3 text-xs text-zinc-700"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(magicLink);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
              >
                Copiar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMagicLink(null);
                  setMagicEmail(null);
                }}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
