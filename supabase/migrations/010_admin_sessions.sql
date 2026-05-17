-- Opaque admin session tokens (service role only; no client access)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '8 hours'),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions (token);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated cannot read/write; service_role bypasses RLS.
