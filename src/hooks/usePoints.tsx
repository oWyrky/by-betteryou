import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { POINTS_EVENT } from '@/lib/points';

export interface PointsSummary {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export const usePoints = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PointsSummary>({ balance: 0, totalEarned: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('user_points')
      .select('balance,total_earned,total_spent')
      .eq('user_id', user.id)
      .maybeSingle();
    setSummary({
      balance: data?.balance ?? 0,
      totalEarned: data?.total_earned ?? 0,
      totalSpent: data?.total_spent ?? 0,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const handler = () => fetchSummary();
    window.addEventListener(POINTS_EVENT, handler);
    return () => window.removeEventListener(POINTS_EVENT, handler);
  }, [fetchSummary]);

  return { ...summary, loading, refetch: fetchSummary };
};

export interface PointTransaction {
  id: string;
  amount: number;
  reason: string;
  reference_date: string | null;
  created_at: string;
}

export const usePointTransactions = (limit = 10) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  const fetchTx = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from('point_transactions')
      .select('id,amount,reason,reference_date,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (data) setTransactions(data as PointTransaction[]);
  }, [user, limit]);

  useEffect(() => {
    fetchTx();
  }, [fetchTx]);

  useEffect(() => {
    const handler = () => fetchTx();
    window.addEventListener(POINTS_EVENT, handler);
    return () => window.removeEventListener(POINTS_EVENT, handler);
  }, [fetchTx]);

  return { transactions, refetch: fetchTx };
};
