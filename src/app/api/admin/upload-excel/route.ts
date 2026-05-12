import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { computeImportPreview } from "@/lib/suppliers/excel-import";
import { readPaisCodigoFromFormData } from "@/lib/suppliers/pais-codigo-form";
import { needsLowVolumeConfirmation } from "@/lib/suppliers/import-validation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Supplier } from "@/types";
import { parseSupplierExcel } from "@/lib/utils/excel-parser";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const form = await request.formData();
  const paisParsed = readPaisCodigoFromFormData(form);
  if (!paisParsed.ok) {
    return NextResponse.json({ error: paisParsed.message }, { status: 400 });
  }
  const pais_codigo = paisParsed.value;

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json(
      { error: "Solo se admiten archivos .xlsx" },
      { status: 400 },
    );
  }

  const buffer = await file.arrayBuffer();
  const parsed = parseSupplierExcel(buffer);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: dbRows, error: dbErr } = await admin
    .from("suppliers")
    .select("*")
    .eq("pais_codigo", pais_codigo);

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  const dbSuppliers = (dbRows ?? []) as Supplier[];
  const preview = computeImportPreview(parsed.rows, dbSuppliers, pais_codigo);
  const activeDbCount = dbSuppliers.filter((s) => s.activo).length;
  const lowVolumeWarning = needsLowVolumeConfirmation(
    parsed.rows.length,
    activeDbCount,
  );

  return NextResponse.json({
    filename: file.name,
    sheetName: parsed.sheetName,
    rowCount: parsed.rows.length,
    incompleteCount: parsed.rows.filter((r) => r.incompleteWarning).length,
    preview,
    lowVolumeWarning,
    databaseActiveCount: activeDbCount,
  });
}
