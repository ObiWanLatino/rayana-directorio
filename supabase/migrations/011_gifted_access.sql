-- Manual list access grants (admin obsequio; service role only)
CREATE TABLE IF NOT EXISTS public.gifted_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES auth.users (id),
  reason TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gifted_access_user_id ON public.gifted_access (user_id);

ALTER TABLE public.gifted_access ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated cannot read/write; service_role bypasses RLS.

-- Users can read their own gifted access (required for RLS subquery in suppliers policy)
CREATE POLICY "Users can view own gifted access" ON public.gifted_access
FOR SELECT USING (auth.uid() = user_id);
