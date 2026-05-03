import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import {
  applyExcelImport,
  BulkDeactivateConfirmationError,
  LowVolumeConfirmationError,
} from "@/lib/suppliers/apply-excel-import";
import { parseSupplierExcel } from "@/lib/utils/excel-parser";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const form = await request.formData();
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

  const excludeIncomplete =
    form.get("exclude_incomplete") === "true" ||
    form.get("exclude_incomplete") === "1";
  const confirmBulkDeactivate =
    form.get("confirm_bulk_deactivate") === "true" ||
    form.get("confirm_bulk_deactivate") === "1";
  const confirmLowVolume =
    form.get("confirm_low_volume") === "true" ||
    form.get("confirm_low_volume") === "1";

  const buffer = await file.arrayBuffer();
  const parsed = parseSupplierExcel(buffer);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const result = await applyExcelImport({
      rows: parsed.rows,
      adminEmail: user.email,
      filename: file.name,
      excludeIncomplete,
      confirmBulkDeactivate,
      confirmLowVolume,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof BulkDeactivateConfirmationError) {
      return NextResponse.json(
        {
          error: "bulk_deactivate_confirm",
          message:
            "Hay muchas filas que se desactivarán. Confirma explícitamente para continuar.",
        },
        { status: 409 },
      );
    }
    if (e instanceof LowVolumeConfirmationError) {
      return NextResponse.json(
        {
          error: "low_volume_confirm",
          message:
            "El archivo tiene muchas menos filas que el directorio actual. Confirma para continuar.",
        },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "Error al aplicar cambios";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
