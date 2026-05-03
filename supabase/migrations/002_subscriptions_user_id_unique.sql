-- One subscription row per user (upserts from Stripe webhooks).
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_id_unique ON public.subscriptions (user_id);
