export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "inactive";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  suspended: boolean;
  last_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  refunded_at: string | null;
  refunded_amount: number | null;
  refund_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: string;
  codigo: number;
  tienda: string;
  instagram: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  maps_url: string | null;
  categoria: string | null;
  direccion: string | null;
  tipo: string | null;
  observacion: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  destacado: boolean;
  verificado: boolean;
  foto_1_url: string | null;
  foto_2_url: string | null;
  foto_3_url: string | null;
  activo: boolean;
  pais_codigo: string;
  created_at: string;
  updated_at: string;
};

export type UploadLog = {
  id: string;
  admin_email: string;
  filename: string;
  total_rows: number | null;
  created: number;
  updated: number;
  deactivated: number;
  skipped_warnings: number;
  created_at: string;
};
