
ALTER TABLE public.daily_habits
ADD COLUMN study_justified boolean NOT NULL DEFAULT false,
ADD COLUMN reading_justified boolean NOT NULL DEFAULT false;
