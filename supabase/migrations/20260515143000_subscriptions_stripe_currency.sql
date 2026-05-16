-- Stripe regional pricing: persist checkout currency on subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS currency TEXT;

UPDATE public.subscriptions
SET currency = 'USD'
WHERE currency IS NULL
  AND stripe_subscription_id IS NOT NULL;
