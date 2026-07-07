-- Points system tables
CREATE TABLE public.user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_points TO authenticated;
GRANT ALL ON public.user_points TO service_role;

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own points" ON public.user_points
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own points" ON public.user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own points" ON public.user_points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transactions ledger
CREATE TYPE public.point_reason AS ENUM (
  'water_goal',
  'exercise_done',
  'study_done',
  'reading_done',
  'day_completed',
  'habit_justified',
  'purchase',
  'admin_adjustment'
);

CREATE TABLE public.point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason public.point_reason NOT NULL,
  reference_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reason, reference_date)
);

GRANT SELECT, INSERT ON public.point_transactions TO authenticated;
GRANT ALL ON public.point_transactions TO service_role;

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_point_tx_user_created ON public.point_transactions (user_id, created_at DESC);

-- Function: award points atomically. Uses ON CONFLICT DO NOTHING to prevent duplicate awards per (user, reason, date).
CREATE OR REPLACE FUNCTION public.award_points(
  _reason public.point_reason,
  _amount integer,
  _reference_date date DEFAULT CURRENT_DATE,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(awarded boolean, new_balance integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _inserted uuid;
  _balance integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.point_transactions (user_id, amount, reason, reference_date, metadata)
  VALUES (_uid, _amount, _reason, _reference_date, _metadata)
  ON CONFLICT (user_id, reason, reference_date) DO NOTHING
  RETURNING id INTO _inserted;

  IF _inserted IS NULL THEN
    SELECT balance INTO _balance FROM public.user_points WHERE user_id = _uid;
    RETURN QUERY SELECT false, COALESCE(_balance, 0);
    RETURN;
  END IF;

  INSERT INTO public.user_points (user_id, balance, total_earned, total_spent)
  VALUES (_uid, GREATEST(_amount, 0), GREATEST(_amount, 0), GREATEST(-_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.user_points.balance + _amount,
        total_earned = public.user_points.total_earned + GREATEST(_amount, 0),
        total_spent = public.user_points.total_spent + GREATEST(-_amount, 0),
        updated_at = now()
  RETURNING balance INTO _balance;

  RETURN QUERY SELECT true, _balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_points(public.point_reason, integer, date, jsonb) TO authenticated;