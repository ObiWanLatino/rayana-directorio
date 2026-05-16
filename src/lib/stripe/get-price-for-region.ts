export interface PricingInfo {
  priceId: string;
  currency: "CLP" | "USD";
  amount: number;
  displayPrice: string;
  country: string;
}

/**
 * Detecta país desde Vercel headers y retorna precio correcto.
 * @param country - Código ISO (CL, US, AR, etc.) desde x-vercel-ip-country
 */
export function getPriceForRegion(country: string | null): PricingInfo {
  if (country === "CL") {
    return {
      priceId: "price_1SUzrA4PLgqhpAuSnZ1DDLfT",
      currency: "CLP",
      amount: 14990,
      displayPrice: "$14.990 CLP/mes",
      country: "CL",
    };
  }

  return {
    priceId: "price_1TXVZJ4PLgqhpAuSMlYGf0u0",
    currency: "USD",
    amount: 15,
    displayPrice: "$15 USD/month",
    country: country || "UNKNOWN",
  };
}

/**
 * Extrae el país desde los headers (Vercel / Cloudflare).
 * En desarrollo, `STRIPE_GEO_DEV_COUNTRY` permite simular un país sin headers.
 */
export function getCountryFromHeaders(headers: Headers): string | null {
  if (process.env.NODE_ENV === "development") {
    const override = process.env.STRIPE_GEO_DEV_COUNTRY?.trim();
    if (override) {
      return override.toUpperCase();
    }
  }

  const vercelCountry = headers.get("x-vercel-ip-country");
  if (vercelCountry) {
    return vercelCountry.toUpperCase();
  }

  const cfCountry = headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX") {
    return cfCountry.toUpperCase();
  }

  return null;
}
