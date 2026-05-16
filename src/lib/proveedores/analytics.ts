import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupplierEventType } from "@/types/proveedores";

export function trackSupplierEvent(
  supabase: SupabaseClient,
  supplierId: string,
  eventType: SupplierEventType,
  userId?: string | null,
): void {
  const row: {
    supplier_id: string;
    event_type: SupplierEventType;
    user_id?: string;
  } = { supplier_id: supplierId, event_type: eventType };
  if (userId) row.user_id = userId;
  void supabase.from("supplier_events").insert(row).then(() => {});
}
