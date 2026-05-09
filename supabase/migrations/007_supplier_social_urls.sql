-- Optional full URLs for directory social buttons (Instagram, TikTok, Google Maps).
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS maps_url TEXT DEFAULT NULL;
