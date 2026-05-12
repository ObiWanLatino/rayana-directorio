import { NextResponse, type NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Supplier } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const raw = request.nextUrl.searchParams.get("pais_codigo");
  const pais_codigo =
    typeof raw === "string" && raw.trim() !== "" ? raw.trim() : "56";

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("suppliers")
    .select("*")
    .eq("pais_codigo", pais_codigo)
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Supplier[];
  const headers = [
    "Código",
    "Tienda",
    "Instagram",
    "Categoría",
    "Dirección",
    "Tipo",
    "Observación",
    "Whatsapp",
    "Activo",
  ];
  const aoa: (string | number)[][] = [
    headers,
    ...rows.map((s) => [
      s.codigo,
      s.tienda,
      s.instagram ? `@${s.instagram}` : "",
      s.categoria ?? "",
      s.direccion ?? "",
      s.tipo ?? "",
      s.observacion ?? "",
      s.whatsapp ?? "",
      s.activo ? "Sí" : "No",
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
  const buf = XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;
  const body = new Uint8Array(buf);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `proveedores_backup_${pais_codigo}_${date}.xlsx`;

  return new NextResponse(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
