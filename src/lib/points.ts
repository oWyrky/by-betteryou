import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PointReason =
  | 'water_goal'
  | 'exercise_done'
  | 'study_done'
  | 'reading_done'
  | 'day_completed'
  | 'habit_justified'
  | 'purchase'
  | 'admin_adjustment';

export const POINT_RULES: Record<PointReason, { amount: number; label: string }> = {
  water_goal: { amount: 10, label: 'Meta de água' },
  exercise_done: { amount: 15, label: 'Exercício concluído' },
  study_done: { amount: 15, label: 'Estudo concluído' },
  reading_done: { amount: 15, label: 'Leitura concluída' },
  day_completed: { amount: 25, label: 'Dia completo' },
  habit_justified: { amount: 5, label: 'Hábito justificado' },
  purchase: { amount: 0, label: 'Compra na loja' },
  admin_adjustment: { amount: 0, label: 'Ajuste' },
};

export const POINTS_EVENT = 'by-points-awarded';

export async function awardPoints(
  reason: PointReason,
  referenceDate: string,
  opts: { silent?: boolean; amount?: number } = {},
) {
  const amount = opts.amount ?? POINT_RULES[reason].amount;
  if (amount === 0) return { awarded: false, newBalance: 0 };

  const { data, error } = await (supabase as any).rpc('award_points', {
    _reason: reason,
    _amount: amount,
    _reference_date: referenceDate,
  });

  if (error) {
    console.error('award_points error', error);
    return { awarded: false, newBalance: 0 };
  }

  const row = Array.isArray(data) ? data[0] : (data as any);
  const awarded = !!row?.awarded;
  const newBalance = row?.new_balance ?? 0;

  if (awarded) {
    window.dispatchEvent(
      new CustomEvent(POINTS_EVENT, { detail: { amount, reason, newBalance } }),
    );
    if (!opts.silent) {
      toast.success(`+${amount} pontos`, {
        description: POINT_RULES[reason].label,
        duration: 2500,
      });
    }
  }

  return { awarded, newBalance };
}
