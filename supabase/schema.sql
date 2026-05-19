-- Rayana Platform — run in Supabase SQL Editor (or split into migrations).
-- Order: extensions (if needed) → tables → indexes → triggers → RLS → policies → storage.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  suspended BOOLEAN DEFAULT false NOT NULL,
  last_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('active', 'past_due', 'canceled', 'inactive')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  refunded_at TIMESTAMPTZ,
  refunded_amount INTEGER,
  refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id_unique ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions (stripe_customer_id);

-- ---------------------------------------------------------------------------
-- suppliers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo INTEGER NOT NULL UNIQUE,
  tienda TEXT NOT NULL,
  instagram TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  maps_url TEXT,
  categoria TEXT,
  direccion TEXT,
  tipo TEXT,
  observacion TEXT,
  whatsapp TEXT,
  logo_url TEXT,
  cover_url TEXT,
  destacado BOOLEAN DEFAULT false,
  verificado BOOLEAN DEFAULT false,
  foto_1_url TEXT,
  foto_2_url TEXT,
  foto_3_url TEXT,
  activo BOOLEAN DEFAULT true,
  pais_codigo TEXT DEFAULT '56',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_suppliers_categoria ON public.suppliers (categoria);
CREATE INDEX IF NOT EXISTS idx_suppliers_activo ON public.suppliers (activo);

-- ---------------------------------------------------------------------------
-- upload_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.upload_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  filename TEXT NOT NULL,
  total_rows INTEGER,
  created INTEGER DEFAULT 0,
  updated INTEGER DEFAULT 0,
  deactivated INTEGER DEFAULT 0,
  skipped_warnings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_logs ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- subscriptions (read own row; writes via service_role / webhooks)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- suppliers: active, past_due, or canceled but still within paid period
DROP POLICY IF EXISTS "Subscribers can view active suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Active subscribers can view active suppliers" ON public.suppliers;
CREATE POLICY "Subscribers can view active suppliers"
  ON public.suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
        AND (
          s.status = 'active'
          OR s.status = 'past_due'
          OR (
            s.cancel_at_period_end = true
            AND s.current_period_end IS NOT NULL
            AND s.current_period_end > now()
          )
        )
    )
    AND activo = true
  );

DROP POLICY IF EXISTS "Public can view featured active suppliers" ON public.suppliers;
CREATE POLICY "Public can view featured active suppliers"
  ON public.suppliers
  FOR SELECT
  TO anon, authenticated
  USING (activo = true AND destacado = true);

-- featured_supplier_events (vitrina pública)
CREATE TABLE IF NOT EXISTS public.featured_supplier_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,
  pais_codigo TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT featured_supplier_events_type_check
    CHECK (event_type IN ('view', 'wa_click', 'catalog_click', 'profile_click'))
);

CREATE INDEX IF NOT EXISTS idx_featured_supplier_events_supplier
  ON public.featured_supplier_events (supplier_id, event_type, created_at);

ALTER TABLE public.featured_supplier_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert featured events" ON public.featured_supplier_events;
CREATE POLICY "Anyone can insert featured events"
  ON public.featured_supplier_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read featured events" ON public.featured_supplier_events;
CREATE POLICY "Admin can read featured events"
  ON public.featured_supplier_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- upload_logs: no end-user policies; admin APIs use service_role.

-- ---------------------------------------------------------------------------
-- Storage: supplier-logos (public read)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-logos', 'supplier-logos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read supplier logos" ON storage.objects;
CREATE POLICY "Public read supplier logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'supplier-logos');

-- ---------------------------------------------------------------------------
-- Storage: supplier-photos (public read)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-photos', 'supplier-photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read supplier photos" ON storage.objects;
CREATE POLICY "Public read supplier photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'supplier-photos');
