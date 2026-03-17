
ALTER TABLE public.clinical_records
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;