-- Columnas y buckets usados por vitrina destacada / admin (idempotente)
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verificado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS foto_1_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_2_url TEXT,
  ADD COLUMN IF NOT EXISTS foto_3_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-photos', 'supplier-photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-logos', 'supplier-logos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read supplier photos" ON storage.objects;
CREATE POLICY "Public read supplier photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'supplier-photos');

DROP POLICY IF EXISTS "Public read supplier logos" ON storage.objects;
CREATE POLICY "Public read supplier logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'supplier-logos');
