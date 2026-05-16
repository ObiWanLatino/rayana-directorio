-- Hotmart + columnas multi-proveedor en subscriptions (compatible con Stripe/Lemon existentes)

CREATE TABLE IF NOT EXISTS public.hotmart_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processed', 'failed')),
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_processor TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_name TEXT,
  ADD COLUMN IF NOT EXISTS plan_id TEXT,
  ADD COLUMN IF NOT EXISTS buyer_email TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_purchase_currency TEXT,
  ADD COLUMN IF NOT EXISTS last_purchase_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_variant_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_portal_url TEXT;

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'past_due', 'canceled', 'inactive', 'expired', 'trialing'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_provider_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IS NULL OR provider IN ('stripe', 'hotmart', 'lemonsqueezy'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_provider_subscription
  ON public.subscriptions (provider, provider_subscription_id)
  WHERE provider IS NOT NULL AND provider_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_buyer_email ON public.subscriptions (buyer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON public.subscriptions (provider);

ALTER TABLE public.hotmart_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.hotmart_webhook_events;
CREATE POLICY "Service role can manage webhook events"
  ON public.hotmart_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Subscribers can view active suppliers" ON public.suppliers;
CREATE POLICY "Subscribers can view active suppliers"
  ON public.suppliers FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = auth.uid()
        AND (
          s.status = 'active'
          OR s.status = 'past_due'
          OR s.status = 'trialing'
          OR (
            s.cancel_at_period_end = true
            AND s.current_period_end IS NOT NULL
            AND s.current_period_end > now()
          )
        )
    )
    AND activo = true
  );
