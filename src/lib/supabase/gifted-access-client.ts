import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type RpcGiftedAccessRow = {
  id: string;
  user_id: string;
  reason: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type RpcGrantGiftedAccessRow = {
  id: string;
  user_id: string;
  granted_by: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
};

function admin() {
  return createAdminSupabaseClient();
}

export async function rpcGrantGiftedAccess(
  userId: string,
  grantedBy: string,
  reason: string | null,
  expiresAt: string | null,
): Promise<{ data: RpcGrantGiftedAccessRow | null; error: Error | null }> {
  const { data, error } = await admin().rpc("grant_gifted_access", {
    p_user_id: userId,
    p_granted_by: grantedBy,
    p_reason: reason,
    p_expires_at: expiresAt,
  });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const rows = (data ?? []) as RpcGrantGiftedAccessRow[];
  return { data: rows[0] ?? null, error: null };
}

export async function rpcRevokeGiftedAccess(
  giftedAccessId: string,
): Promise<{ data: boolean; error: Error | null }> {
  const { data, error } = await admin().rpc("revoke_gifted_access", {
    p_gifted_access_id: giftedAccessId,
  });

  if (error) {
    return { data: false, error: new Error(error.message) };
  }

  return { data: Boolean(data), error: null };
}

export async function rpcGetActiveGiftedAccess(
  userId?: string | null,
): Promise<{ data: RpcGiftedAccessRow[]; error: Error | null }> {
  const { data, error } = await admin().rpc("get_active_gifted_access", {
    p_user_id: userId ?? null,
  });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data ?? []) as RpcGiftedAccessRow[], error: null };
}

export async function rpcCheckActiveGiftedAccess(
  userId: string,
): Promise<{ data: boolean; error: Error | null }> {
  const { data, error } = await admin().rpc("check_active_gifted_access", {
    p_user_id: userId,
  });

  if (error) {
    return { data: false, error: new Error(error.message) };
  }

  return { data: Boolean(data), error: null };
}
