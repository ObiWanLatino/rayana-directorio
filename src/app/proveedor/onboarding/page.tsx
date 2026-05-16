import { OnboardingWizard } from "@/components/proveedores/OnboardingWizard";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { getMySupplierProfile } from "@/lib/proveedores/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProveedorOnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/proveedor/onboarding");

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  if (!hasSubscriptionAccess(sub)) redirect("/checkout");

  const existing = await getMySupplierProfile(supabase);
  if (existing?.onboarding_completed) {
    redirect("/proveedor/dashboard");
  }

  return (
    <div className="min-h-screen bg-off">
      <OnboardingWizard />
    </div>
  );
}
