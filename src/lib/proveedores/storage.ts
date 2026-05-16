import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "supplier-assets";

export function publicSupplierAssetUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL?.replace(/\/$/, "") ?? "";
  if (!base) return "";
  return `${base}/${BUCKET}/${path.replace(/^\//, "")}`;
}

export async function uploadSupplierAsset(
  supabase: SupabaseClient,
  path: string,
  body: Blob | ArrayBuffer | File,
  contentType: string,
): Promise<{ path: string; publicUrl: string; error: Error | null }> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType,
      upsert: true,
    });
  if (error) {
    return { path, publicUrl: "", error: new Error(error.message) };
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, publicUrl, error: null };
}
