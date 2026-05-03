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
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: string;
  codigo: number;
  tienda: string;
  instagram: string | null;
  categoria: string | null;
  direccion: string | null;
  tipo: string | null;
  observacion: string | null;
  whatsapp: string | null;
  logo_url: string | null;
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
