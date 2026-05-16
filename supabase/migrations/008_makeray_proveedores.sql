-- ============================================================
-- MAKERAY PROVEEDORES — Migración completa
-- Ejecutar en Supabase SQL Editor o vía migraciones locales
-- Proyecto: Listado Rayana (ncneqaypxtrqgioafigx)
-- ============================================================

-- ── FUNCIÓN COMPARTIDA updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── 1. SUPPLIER_PROFILES ────────────────────────────────────
CREATE TABLE public.supplier_profiles (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id                   uuid UNIQUE NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id                       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  bio                           text CHECK (char_length(bio) <= 600),
  cover_url                     text,
  whatsapp_negocio              text,
  website_url                   text,
  ships_nationally              boolean NOT NULL DEFAULT true,
  ships_internationally         boolean NOT NULL DEFAULT false,
  shipping_agent_info           text,

  plan                          text NOT NULL DEFAULT 'basico'
                                CHECK (plan IN ('basico', 'vitrina', 'pro')),
  plan_started_at               timestamptz,
  plan_expires_at               timestamptz,
  lemon_squeezy_customer_id     text,
  lemon_squeezy_subscription_id text UNIQUE,
  lemon_squeezy_variant_id      text,

  badge                         text NOT NULL DEFAULT 'nuevo'
                                CHECK (badge IN ('nuevo', 'verificado', 'top', 'destacado_mes')),
  badge_updated_at              timestamptz,

  onboarding_completed          boolean NOT NULL DEFAULT false,
  activo                        boolean NOT NULL DEFAULT true,

  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_profiles_supplier_id ON public.supplier_profiles(supplier_id);
CREATE INDEX idx_supplier_profiles_user_id     ON public.supplier_profiles(user_id);
CREATE INDEX idx_supplier_profiles_plan        ON public.supplier_profiles(plan);
CREATE INDEX idx_supplier_profiles_badge       ON public.supplier_profiles(badge);

ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sp_select_public"
  ON public.supplier_profiles FOR SELECT USING (true);

CREATE POLICY "sp_insert_own"
  ON public.supplier_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sp_update_own"
  ON public.supplier_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_supplier_profiles_updated_at
  BEFORE UPDATE ON public.supplier_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 2. SUPPLIER_PRODUCTS ────────────────────────────────────
CREATE TABLE public.supplier_products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id      uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  nombre           text NOT NULL CHECK (char_length(nombre) <= 120),
  descripcion      text CHECK (char_length(descripcion) <= 400),
  precio_clp       integer CHECK (precio_clp >= 0),
  precio_mayorista integer CHECK (precio_mayorista >= 0),
  minimo_unidades  integer DEFAULT 1 CHECK (minimo_unidades >= 1),
  foto_url         text,
  categoria        text,
  activo           boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_products_supplier_id ON public.supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_activo      ON public.supplier_products(activo);

ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sprod_select_auth"
  ON public.supplier_products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "sprod_insert_own"
  ON public.supplier_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_products.supplier_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "sprod_update_own"
  ON public.supplier_products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_products.supplier_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "sprod_delete_own"
  ON public.supplier_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_products.supplier_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE TRIGGER set_supplier_products_updated_at
  BEFORE UPDATE ON public.supplier_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 3. SUPPLIER_OFFERS ──────────────────────────────────────
CREATE TABLE public.supplier_offers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id   uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  titulo        text NOT NULL CHECK (char_length(titulo) <= 100),
  descripcion   text CHECK (char_length(descripcion) <= 300),
  descuento_pct integer CHECK (descuento_pct BETWEEN 1 AND 90),
  foto_url      text,
  activo        boolean NOT NULL DEFAULT true,
  starts_at     timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offer_dates_valid CHECK (expires_at > starts_at)
);

CREATE INDEX idx_supplier_offers_supplier_id ON public.supplier_offers(supplier_id);
CREATE INDEX idx_supplier_offers_expires_at  ON public.supplier_offers(expires_at);
CREATE INDEX idx_supplier_offers_activo      ON public.supplier_offers(activo);

ALTER TABLE public.supplier_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "soffer_select_auth"
  ON public.supplier_offers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "soffer_insert_own"
  ON public.supplier_offers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_offers.supplier_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "soffer_update_own"
  ON public.supplier_offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_offers.supplier_id
        AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "soffer_delete_own"
  ON public.supplier_offers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_offers.supplier_id
        AND sp.user_id = auth.uid()
    )
  );


-- ── 4. SUPPLIER_EVENTS (analytics) ─────────────────────────
CREATE TABLE public.supplier_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  event_type  text NOT NULL CHECK (event_type IN (
                'profile_view', 'wa_click', 'catalog_view',
                'product_view', 'offer_view', 'offer_wa_click'
              )),
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_supplier_events_supplier_date
  ON public.supplier_events(supplier_id, created_at DESC);
CREATE INDEX idx_supplier_events_type
  ON public.supplier_events(event_type, created_at DESC);

ALTER TABLE public.supplier_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sevents_insert_auth"
  ON public.supplier_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "sevents_select_own"
  ON public.supplier_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.supplier_profiles sp
      WHERE sp.supplier_id = supplier_events.supplier_id
        AND sp.user_id = auth.uid()
    )
  );


-- ── 5. SUPPLIER_REVIEWS ─────────────────────────────────────
CREATE TABLE public.supplier_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comentario  text CHECK (char_length(comentario) <= 400),
  verified    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, user_id)
);

CREATE INDEX idx_supplier_reviews_supplier_id ON public.supplier_reviews(supplier_id);

ALTER TABLE public.supplier_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srev_select_auth"
  ON public.supplier_reviews FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "srev_insert_auth"
  ON public.supplier_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "srev_update_own"
  ON public.supplier_reviews FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 6. VISTAS DE ANALYTICS ──────────────────────────────────
CREATE OR REPLACE VIEW public.supplier_analytics_30d AS
SELECT
  supplier_id,
  COUNT(*) FILTER (WHERE event_type = 'profile_view')   AS profile_views,
  COUNT(*) FILTER (WHERE event_type = 'wa_click')        AS wa_clicks,
  COUNT(*) FILTER (WHERE event_type = 'catalog_view')    AS catalog_views,
  COUNT(*) FILTER (WHERE event_type = 'offer_view')      AS offer_views,
  COUNT(*) FILTER (WHERE event_type = 'offer_wa_click')  AS offer_wa_clicks,
  COUNT(DISTINCT user_id)                                AS unique_visitors
FROM public.supplier_events
WHERE created_at >= now() - interval '30 days'
GROUP BY supplier_id;

CREATE OR REPLACE VIEW public.supplier_analytics_all AS
SELECT
  supplier_id,
  COUNT(*) FILTER (WHERE event_type = 'profile_view')   AS profile_views,
  COUNT(*) FILTER (WHERE event_type = 'wa_click')        AS wa_clicks,
  COUNT(*) FILTER (WHERE event_type = 'catalog_view')    AS catalog_views,
  COUNT(DISTINCT user_id)                                AS unique_visitors,
  MIN(created_at)                                        AS first_event_at
FROM public.supplier_events
GROUP BY supplier_id;

CREATE OR REPLACE VIEW public.supplier_review_stats AS
SELECT
  supplier_id,
  COUNT(*)::integer              AS total_reviews,
  ROUND(AVG(rating), 1)         AS avg_rating,
  COUNT(*) FILTER (WHERE verified) AS verified_reviews
FROM public.supplier_reviews
GROUP BY supplier_id;

-- PostgREST / cliente JS: lectura de vistas con rol autenticado
GRANT SELECT ON public.supplier_analytics_30d TO authenticated, service_role;
GRANT SELECT ON public.supplier_analytics_all TO authenticated, service_role;
GRANT SELECT ON public.supplier_review_stats TO authenticated, service_role;


-- ── 7. STORAGE BUCKET ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-assets', 'supplier-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "supplier_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'supplier-assets');

CREATE POLICY "supplier_assets_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'supplier-assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "supplier_assets_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'supplier-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── VERIFICACIÓN (ejecutar aparte en SQL Editor) ─────────────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'supplier_%'
-- ORDER BY table_name;
--
-- SELECT viewname FROM pg_views
-- WHERE schemaname = 'public' AND viewname LIKE 'supplier_%';
