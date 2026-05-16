import type {
  HotmartError,
  HotmartSalesResponse,
  HotmartSubscribersResponse,
  HotmartSubscription,
  HotmartToken,
} from "@/lib/hotmart/types";

const TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token";
const DATA_BASE = "https://api-hot-connect.hotmart.com";

let tokenCache: HotmartToken | null = null;

function basicAuthHeader(): string {
  const raw = process.env.HOTMART_BASIC_TOKEN?.trim();
  if (!raw) {
    throw new Error("Missing HOTMART_BASIC_TOKEN");
  }
  return raw.toLowerCase().startsWith("basic ")
    ? raw
    : `Basic ${raw}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 5000) {
    return tokenCache.access_token;
  }

  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing HOTMART_CLIENT_ID or HOTMART_CLIENT_SECRET");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!res.ok) {
    const message =
      typeof json?.error_description === "string"
        ? json.error_description
        : typeof json?.error === "string"
          ? json.error
          : `Hotmart token error (${res.status})`;
    throw new Error(message);
  }

  const access_token = json?.access_token;
  const token_type = json?.token_type;
  const expires_in = json?.expires_in;
  if (
    typeof access_token !== "string" ||
    typeof token_type !== "string" ||
    typeof expires_in !== "number"
  ) {
    throw new Error("Hotmart token response inválida");
  }

  tokenCache = {
    access_token,
    token_type,
    expires_in,
    expiresAt: Date.now() + expires_in * 1000,
  };
  return tokenCache.access_token;
}

function isDevLog(): boolean {
  return process.env.NODE_ENV === "development";
}

async function hotmartFetchOnce(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const url = `${DATA_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (isDevLog()) {
    console.debug("[Hotmart]", options.method ?? "GET", url);
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, { ...options, headers });
}

export async function hotmartFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const maxAttempts = 4;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await hotmartFetchOnce(endpoint, options);
      if (res.status === 429 || res.status === 502 || res.status === 503) {
        const backoff = Math.min(8000, 400 * 2 ** attempt);
        await sleep(backoff);
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      const backoff = Math.min(8000, 400 * 2 ** attempt);
      await sleep(backoff);
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Hotmart fetch falló tras reintentos");
}

export async function readHotmartJson<T>(
  res: Response,
): Promise<{ ok: true; data: T } | { ok: false; error: HotmartError }> {
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    return {
      ok: false,
      error: {
        status: res.status,
        message:
          typeof body === "object" &&
          body !== null &&
          "message" in body &&
          typeof (body as { message: unknown }).message === "string"
            ? (body as { message: string }).message
            : res.statusText,
        body,
      },
    };
  }
  return { ok: true, data: body as T };
}

function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function getSubscribers(
  productId: string,
  params?: {
    subscriberCode?: string;
    status?:
      | "ACTIVE"
      | "INACTIVE"
      | "CANCELLED_BY_CUSTOMER"
      | "CANCELLED_BY_SELLER"
      | "OVERDUE";
    pageToken?: string;
  },
): Promise<HotmartSubscribersResponse> {
  const q = buildQuery({
    product_id: productId,
    subscriber_code: params?.subscriberCode,
    status: params?.status,
    page_token: params?.pageToken,
  });
  const res = await hotmartFetch(
    `/payments/rest/v1/subscriptions/subscribers${q}`,
  );
  const parsed = await readHotmartJson<HotmartSubscribersResponse>(res);
  if (!parsed.ok) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}

export async function getSubscription(
  subscriberCode: string,
): Promise<HotmartSubscription> {
  const productId = process.env.HOTMART_PRODUCT_ID;
  const q = buildQuery({
    subscriber_code: subscriberCode,
    ...(productId ? { product_id: productId } : {}),
  });
  const res = await hotmartFetch(
    `/payments/rest/v1/subscriptions/subscribers${q}`,
  );
  const parsed = await readHotmartJson<HotmartSubscribersResponse | HotmartSubscription>(
    res,
  );
  if (!parsed.ok) {
    throw new Error(parsed.error.message);
  }
  const data = parsed.data;
  if ("items" in data && Array.isArray(data.items) && data.items[0]) {
    return data.items[0] as HotmartSubscription;
  }
  return data as HotmartSubscription;
}

export async function cancelSubscription(
  subscriberCode: string,
): Promise<void> {
  const res = await hotmartFetch(
    "/payments/rest/v1/subscriptions/cancel",
    {
      method: "POST",
      body: JSON.stringify({
        subscriber_code: [subscriberCode],
        send_mail: false,
      }),
    },
  );
  const parsed = await readHotmartJson<unknown>(res);
  if (!parsed.ok) {
    throw new Error(parsed.error.message);
  }
}

export async function getSalesHistory(params?: {
  startDate?: number;
  endDate?: number;
  productId?: string;
  buyerEmail?: string;
  pageToken?: string;
}): Promise<HotmartSalesResponse> {
  const q = buildQuery({
    start_date: params?.startDate,
    end_date: params?.endDate,
    product_id: params?.productId,
    buyer_email: params?.buyerEmail,
    page_token: params?.pageToken,
  });
  const res = await hotmartFetch(`/payments/rest/v1/sales/history${q}`);
  const parsed = await readHotmartJson<HotmartSalesResponse>(res);
  if (!parsed.ok) {
    throw new Error(parsed.error.message);
  }
  return parsed.data;
}
