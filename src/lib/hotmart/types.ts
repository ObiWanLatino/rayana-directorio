/** Hotmart webhook payload (v2.0). */
export type HotmartEventType =
  | "PURCHASE_APPROVED"
  | "PURCHASE_CANCELED"
  | "PURCHASE_REFUNDED"
  | "PURCHASE_CHARGEBACK"
  | "PURCHASE_DISPUTE"
  | "PURCHASE_COMPLETE"
  | "SUBSCRIPTION_CANCELLATION"
  | "SWITCH_PLAN"
  | "PURCHASE_DELAYED"
  | "PURCHASE_EXPIRED"
  | "PURCHASE_OVERDUE";

export type HotmartPurchaseStatus =
  | "approved"
  | "canceled"
  | "refunded"
  | "dispute"
  | "chargeback"
  | "billet_printed"
  | "completed"
  | "blocked"
  | "delayed"
  | "expired";

export type HotmartSubscriptionStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "CANCELLED_BY_CUSTOMER"
  | "CANCELLED_BY_SELLER"
  | "OVERDUE"
  | "STARTED";

export interface HotmartWebhookEvent {
  id: string;
  creation_date: number;
  event: HotmartEventType;
  version: "2.0.0";
  data: {
    product: {
      id: number;
      ucode: string;
      name: string;
    };
    buyer: {
      email: string;
      name: string;
      document: string;
      address?: {
        country: string;
        country_iso: string;
      };
    };
    purchase: {
      transaction: string;
      status: HotmartPurchaseStatus;
      price: {
        value: number;
        currency_value: string;
      };
      payment: {
        type: string;
        installments_number: number;
      };
      approved_date?: number;
      full_price?: {
        value: number;
        currency_value: string;
      };
    };
    subscription?: {
      subscriber_code: string;
      status: HotmartSubscriptionStatus;
      plan: {
        name: string;
        id: string;
      };
    };
  };
}

export interface HotmartSubscriberItem {
  subscriber_code?: string;
  subscriberCode?: string;
  status?: HotmartSubscriptionStatus | string;
  email?: string;
  name?: string;
  /** API may return nested plan info */
  plan?: { name?: string; id?: string };
  [key: string]: unknown;
}

export interface HotmartSubscribersResponse {
  items: HotmartSubscriberItem[];
  page_info: {
    results_per_page: number;
    total_results: number;
    next_page_token?: string;
  };
}

export interface HotmartSubscription {
  subscriber_code?: string;
  subscriberCode?: string;
  status?: HotmartSubscriptionStatus | string;
  plan?: { name?: string; id?: string };
  [key: string]: unknown;
}

export interface HotmartSalesItem {
  purchase_id?: string;
  transaction?: string;
  buyer_email?: string;
  buyerEmail?: string;
  product_id?: string;
  [key: string]: unknown;
}

export interface HotmartSalesResponse {
  items?: HotmartSalesItem[];
  page_info?: {
    results_per_page?: number;
    total_results?: number;
    next_page_token?: string;
  };
}

export interface HotmartToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expiresAt: number;
}

export interface HotmartError {
  status: number;
  message: string;
  body?: unknown;
}
