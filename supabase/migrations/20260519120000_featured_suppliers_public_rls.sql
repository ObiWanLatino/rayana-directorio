-- Public read for featured active suppliers (vitrina gratuita, sin login)
DROP POLICY IF EXISTS "Public can view featured active suppliers" ON public.suppliers;
CREATE POLICY "Public can view featured active suppliers"
  ON public.suppliers
  FOR SELECT
  TO anon, authenticated
  USING (activo = true AND destacado = true);
