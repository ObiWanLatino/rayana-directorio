export interface CheckoutParams {
  email?: string;
  name?: string;
  offerId?: string;
}

function isHotmartSandbox(): boolean {
  if (process.env.NEXT_PUBLIC_HOTMART_SANDBOX === "true") return true;
  if (process.env.NEXT_PUBLIC_HOTMART_SANDBOX === "false") return false;
  return process.env.HOTMART_SANDBOX === "true";
}

export function getHotmartCheckoutUrl(params?: CheckoutParams): string {
  const isSandbox = isHotmartSandbox();
  const productId =
    process.env.NEXT_PUBLIC_HOTMART_PRODUCT_ID?.trim() ||
    process.env.HOTMART_PRODUCT_ID?.trim();
  if (!productId) {
    throw new Error(
      "Missing HOTMART_PRODUCT_ID (o NEXT_PUBLIC_HOTMART_PRODUCT_ID en el cliente)",
    );
  }

  const baseUrl = isSandbox
    ? `https://pay.hotmart.com/${productId}?off=sandbox`
    : `https://pay.hotmart.com/${productId}`;

  const searchParams = new URLSearchParams();
  if (params?.email) searchParams.set("checkoutEmail", params.email);
  if (params?.name) searchParams.set("buyerName", params.name);
  if (params?.offerId) searchParams.set("off", params.offerId);

  const query = searchParams.toString();
  if (!query) return baseUrl;
  return baseUrl.includes("?") ? `${baseUrl}&${query}` : `${baseUrl}?${query}`;
}
