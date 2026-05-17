-- Gifted access via RPC (bypasses PostgREST schema cache for gifted_access table)

CREATE OR REPLACE FUNCTION public.grant_gifted_access(
  p_user_id UUID,
  p_granted_by UUID,
  p_reason TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.gifted_access (user_id, granted_by, reason, expires_at)
  VALUES (p_user_id, p_granted_by, p_reason, p_expires_at)
  RETURNING
    gifted_access.id,
    gifted_access.user_id,
    gifted_access.granted_by,
    gifted_access.reason,
    gifted_access.expires_at,
    gifted_access.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_gifted_access(p_gifted_access_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.gifted_access
  SET revoked_at = now()
  WHERE id = p_gifted_access_id
    AND revoked_at IS NULL;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_gifted_access(p_user_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ga.id,
    ga.user_id,
    ga.reason,
    ga.expires_at,
    ga.revoked_at,
    ga.created_at
  FROM public.gifted_access ga
  WHERE ga.revoked_at IS NULL
    AND (ga.expires_at IS NULL OR ga.expires_at > now())
    AND (p_user_id IS NULL OR ga.user_id = p_user_id)
  ORDER BY ga.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_active_gifted_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.gifted_access
    WHERE user_id = p_user_id
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_exists;
  RETURN v_exists;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_gifted_access(UUID, UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_gifted_access(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_active_gifted_access(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_active_gifted_access(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.grant_gifted_access(UUID, UUID, TEXT, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_gifted_access(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_active_gifted_access(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_active_gifted_access(UUID) TO service_role;
