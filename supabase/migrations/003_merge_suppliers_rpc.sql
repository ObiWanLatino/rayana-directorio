-- Import atómico: upsert por codigo (sin tocar logo_url en updates) + soft-delete del resto.
CREATE OR REPLACE FUNCTION public.merge_suppliers_from_excel(p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_codes int[];
BEGIN
  IF p_rows IS NULL OR jsonb_array_length(p_rows) = 0 THEN
    RAISE EXCEPTION 'import_empty';
  END IF;

  SELECT coalesce(array_agg(DISTINCT (elem->>'codigo')::int), ARRAY[]::int[])
  INTO v_codes
  FROM jsonb_array_elements(p_rows) AS elem;

  INSERT INTO public.suppliers (
    codigo,
    tienda,
    instagram,
    categoria,
    direccion,
    tipo,
    observacion,
    whatsapp,
    activo,
    pais_codigo,
    updated_at,
    created_at
  )
  SELECT
    (elem->>'codigo')::int,
    elem->>'tienda',
    nullif(trim(elem->>'instagram'), ''),
    nullif(trim(elem->>'categoria'), ''),
    nullif(trim(elem->>'direccion'), ''),
    elem->>'tipo',
    nullif(trim(elem->>'observacion'), ''),
    nullif(trim(elem->>'whatsapp'), ''),
    true,
    '56',
    v_now,
    v_now
  FROM jsonb_array_elements(p_rows) AS elem
  ON CONFLICT (codigo) DO UPDATE SET
    tienda = EXCLUDED.tienda,
    instagram = EXCLUDED.instagram,
    categoria = EXCLUDED.categoria,
    direccion = EXCLUDED.direccion,
    tipo = EXCLUDED.tipo,
    observacion = EXCLUDED.observacion,
    whatsapp = EXCLUDED.whatsapp,
    activo = true,
    updated_at = EXCLUDED.updated_at;

  UPDATE public.suppliers s
  SET activo = false, updated_at = v_now
  WHERE s.activo = true
    AND NOT (s.codigo = ANY (v_codes));
END;
$$;

REVOKE ALL ON FUNCTION public.merge_suppliers_from_excel(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_suppliers_from_excel(jsonb) TO service_role;
