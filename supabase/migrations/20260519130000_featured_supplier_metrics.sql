-- Métricas de interacción con proveedores destacados (vitrina pública)
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
