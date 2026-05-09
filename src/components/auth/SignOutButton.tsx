"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      }
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
