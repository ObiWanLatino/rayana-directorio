-- Categorías configurables para la landing (fotos + emoji)

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL DEFAULT '📦',
  foto_url TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_activo_orden
  ON public.categories (activo, orden);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (activo = true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('category-photos', 'category-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read category photos" ON storage.objects;
CREATE POLICY "Public read category photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-photos');

INSERT INTO public.categories (nombre, emoji, orden) VALUES
  ('Moda Femenina', '👗', 1),
  ('Moda Masculina', '👔', 2),
  ('Moda Infantil', '👶', 3),
  ('Moda Deportiva', '🏃', 4),
  ('Lenceria', '💜', 5),
  ('Sex Shop', '🔥', 6),
  ('Accesorios para mascotas', '🐾', 7),
  ('Calzados', '👟', 8),
  ('Carteras y accesorios', '👜', 9),
  ('Joyas y Bisutería', '💍', 10),
  ('Cosmética y Maquillaje', '💄', 11),
  ('Deco Hogar', '🏠', 12),
  ('Fardos de ropa', '📦', 13),
  ('Electronicos', '💻', 14),
  ('Importadoras', '🚢', 15)
ON CONFLICT (nombre) DO NOTHING;
