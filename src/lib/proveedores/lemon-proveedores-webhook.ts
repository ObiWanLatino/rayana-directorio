import { getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { initLemonSqueezy } from "@/lib/lemonsqueezy/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { SupplierPlan } from "@/types/proveedores";

type JsonObject = Record<string, unknown>;

function asObject(v: unknown): JsonObject | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as JsonObject)
    : null;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function resourceAttributes(root: JsonObject | null): JsonObject | null {
  const inner = asObject(root?.data);
  return asObject(inner?.attributes);
}

function resourceId(root: JsonObject | null): string | null {
  const inner = asObject(root?.data);
  return str(inner?.id);
}

function parseUuid(v: unknown): string | null {
  const s = str(v)?.trim().toLowerCase();
  if (!s || !/^[0-9a-f-]{36}$/i.test(s)) return null;
  return s;
}

function customDataFromAttrs(attrs: JsonObject | null): JsonObject | null {
  if (!attrs) return null;
  const direct = asObject(attrs.custom_data ?? attrs.customData);
  if (direct) return direct;
  const meta = asObject(attrs.meta);
  return asObject(meta?.custom_data ?? meta?.customData);
}

function resolvePlanFromVariant(variantId: string | null): SupplierPlan | null {
  const v = variantId?.trim() ?? "";
  const vitrina = process.env.LEMON_SQUEEZY_PLAN_VITRINA_VARIANT_ID?.trim() ?? "";
  const pro = process.env.LEMON_SQUEEZY_PLAN_PRO_VARIANT_ID?.trim() ?? "";
  if (v && vitrina && v === vitrina) return "vitrina";
  if (v && pro && v === pro) return "pro";
  return null;
}

async function renewsAtFromApi(subscriptionId: string): Promise<string | null> {
  initLemonSqueezy();
  const { data, error } = await getSubscription(subscriptionId);
  if (error || !data?.data?.attributes) return null;
  const a = data.data.attributes as JsonObject;
  return str(a.renews_at ?? a.renewsAt);
}

export async function processLemonSqueezyProveedoresWebhook(
  body: unknown,
): Promise<void> {
  const root = asObject(body);
  if (!root) return;

  const meta = asObject(root.meta);
  const eventName = str(meta?.event_name ?? meta?.eventName);
  if (!eventName) return;

  const attrs = resourceAttributes(root);
  const custom = customDataFromAttrs(attrs);
  const supplierId = parseUuid(custom?.supplier_id ?? custom?.supplierId);
  const userId = parseUuid(custom?.user_id ?? custom?.userId);
  const variantId = str(attrs?.variant_id ?? attrs?.variantId);
  const plan = resolvePlanFromVariant(variantId);

  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();

  async function updateProfile(
    patch: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await admin
      .from("supplier_profiles")
      .update({ ...patch, updated_at: now })
      .eq("supplier_id", supplierId)
      .eq("user_id", userId);
    if (error) throw new Error(`proveedores profile: ${error.message}`);
  }

  async function updateProfileByLemonSubscriptionId(
    lemonSubId: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const { error } = await admin
      .from("supplier_profiles")
      .update({ ...patch, updated_at: now })
      .eq("lemon_squeezy_subscription_id", lemonSubId);
    if (error) {
      throw new Error(`proveedores profile by sub: ${error.message}`);
    }
  }

  if (eventName === "subscription_created") {
    if (!supplierId || !userId || !plan) return;
    const subId = resourceId(root);
    const customerId = str(attrs?.customer_id ?? attrs?.customerId);
    await updateProfile({
      plan,
      plan_started_at: now,
      plan_expires_at: str(attrs?.renews_at ?? attrs?.renewsAt),
      lemon_squeezy_customer_id: customerId,
      lemon_squeezy_subscription_id: subId,
      lemon_squeezy_variant_id: variantId,
    });
    return;
  }

  if (eventName === "subscription_updated" || eventName === "subscription_payment_success") {
    const subId = resourceId(root) ?? str(attrs?.first_subscription_item_id);
    const renews =
      str(attrs?.renews_at ?? attrs?.renewsAt) ??
      (subId ? await renewsAtFromApi(subId) : null);
    const patch: Record<string, unknown> = {
      plan_expires_at: renews,
      lemon_squeezy_variant_id: variantId ?? undefined,
    };
    const mapped = resolvePlanFromVariant(variantId);
    if (mapped) patch.plan = mapped;
    if (supplierId && userId) {
      await updateProfile(patch);
    } else if (subId) {
      await updateProfileByLemonSubscriptionId(subId, patch);
    }
    return;
  }

  if (eventName === "subscription_cancelled") {
    const endsAt = str(attrs?.ends_at ?? attrs?.endsAt);
    const renews = str(attrs?.renews_at ?? attrs?.renewsAt);
    const subId = resourceId(root);
    const downgrade = () => ({
      plan: "basico" as const,
      plan_expires_at: null,
    });
    if (endsAt) {
      const end = new Date(endsAt);
      if (!Number.isNaN(end.getTime()) && end <= new Date()) {
        if (supplierId && userId) {
          await updateProfile(downgrade());
        } else if (subId) {
          await updateProfileByLemonSubscriptionId(subId, downgrade());
        }
        return;
      }
    }
    if (supplierId && userId) {
      await updateProfile({ plan_expires_at: renews });
    } else if (subId) {
      await updateProfileByLemonSubscriptionId(subId, { plan_expires_at: renews });
    }
    return;
  }

  if (eventName === "subscription_expired") {
    const subId = resourceId(root);
    if (supplierId && userId) {
      await updateProfile({
        plan: "basico",
        plan_expires_at: null,
      });
    } else if (subId) {
      await updateProfileByLemonSubscriptionId(subId, {
        plan: "basico",
        plan_expires_at: null,
      });
    }
  }
}
