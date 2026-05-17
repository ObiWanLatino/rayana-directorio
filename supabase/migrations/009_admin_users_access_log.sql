-- Admin allowlist + audit log (accessed via service role from app / proxy only)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_access_log_created_at ON public.admin_access_log (created_at DESC);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated cannot read/write; service_role bypasses RLS.

INSERT INTO public.admin_users (email, active)
VALUES
  ('benjaminriquelme.e@gmail.com', true),
  ('benjamin@fazzil.app', true)
ON CONFLICT (email) DO UPDATE SET active = EXCLUDED.active;
