"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  user_id: string;
  email: string;
  started_at: string | null;
  expires_at: string | null;
  amount_clp: number | null;
  status: string;
  refunded_at: string | null;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("es-CL");
}

function formatCurrency(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SubscriptionsAdminTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function postAction(
    endpoint: string,
    userId: string,
    confirmation: string,
  ) {
    if (!window.confirm(confirmation)) return;
    setError(null);
    setBusyId(`${endpoint}:${userId}`);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Operación fallida");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {error ? (
        <p className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Vencimiento</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Reembolso</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={7}>
                  No hay suscripciones activas.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const cancelBusy =
                busyId === "/api/admin/subscriptions/cancel:" + row.user_id;
              const refundBusy =
                busyId === "/api/admin/subscriptions/refund:" + row.user_id;
              return (
                <tr key={row.user_id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 text-zinc-900">{row.email}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(row.started_at)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatDate(row.expires_at)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {formatCurrency(row.amount_clp)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {row.refunded_at ? formatDate(row.refunded_at) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={cancelBusy || refundBusy}
                        onClick={() =>
                          postAction(
                            "/api/admin/subscriptions/cancel",
                            row.user_id,
                            `Cancelar suscripción de ${row.email}?`,
                          )
                        }
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancelBusy ? "Cancelando..." : "Cancelar suscripción"}
                      </button>
                      <button
                        type="button"
                        disabled={cancelBusy || refundBusy}
                        onClick={() =>
                          postAction(
                            "/api/admin/subscriptions/refund",
                            row.user_id,
                            `Reembolsar último pago de ${row.email}?`,
                          )
                        }
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {refundBusy ? "Reembolsando..." : "Reembolsar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
