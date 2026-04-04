ALTER TABLE public.profiles
ADD COLUMN height_cm numeric NULL,
ADD COLUMN weight_kg numeric NULL,
ADD COLUMN height_visible boolean NOT NULL DEFAULT true,
ADD COLUMN weight_visible boolean NOT NULL DEFAULT true;