import Link from "next/link";

export function PlanUpgradeCard() {
  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/10 p-6 text-center">
      <p className="font-display text-lg font-bold text-navy">
        Desbloqueá catálogo y ofertas
      </p>
      <p className="mt-2 text-sm text-navy/60">
        Los planes Vitrina y Pro incluyen catálogo digital y vitrina de ofertas flash.
      </p>
      <Link
        href="/proveedor/onboarding"
        className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white"
      >
        Ver planes
      </Link>
    </div>
  );
}
