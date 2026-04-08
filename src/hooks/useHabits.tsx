import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type DailyHabit = Tables<'daily_habits'>;
type Profile = Tables<'profiles'>;

const todayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const useHabits = () => {
  const { user } = useAuth();
  const [todayHabit, setTodayHabit] = useState<DailyHabit | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [monthHabits, setMonthHabits] = useState<DailyHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ water: 0, exercise: 0, study: 0, reading: 0 });

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setProfile(data);
  }, [user]);

  const fetchToday = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr())
      .single();
    
    if (data) {
      setTodayHabit(data);
    } else {
      // Create today's entry
      const { data: newData } = await supabase
        .from('daily_habits')
        .insert({ user_id: user.id, date: todayStr() })
        .select()
        .single();
      if (newData) setTodayHabit(newData);
    }
  }, [user]);

  const fetchMonth = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });
    
    if (data) setMonthHabits(data);
  }, [user]);

  const calculateStreaks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(60);
    
    if (!data) return;

    let waterStreak = 0;
    let exStreak = 0;
    let stStreak = 0;
    let rdStreak = 0;

    for (const h of data) {
      if (h.water_ml >= (profile?.water_goal_ml || 2000)) waterStreak++;
      else break;
    }

    for (const h of data) {
      if (h.exercise_done || h.exercise_justified) exStreak++;
      else break;
    }
    
    for (const h of data) {
      if (h.study_done || (h as any).study_justified) stStreak++;
      else break;
    }

    for (const h of data) {
      if (h.reading_done || (h as any).reading_justified) rdStreak++;
      else break;
    }

    setStreak({ water: waterStreak, exercise: exStreak, study: stStreak, reading: rdStreak });
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchProfile(), fetchToday(), fetchMonth(), calculateStreaks()])
        .finally(() => setLoading(false));
    }
  }, [user, fetchProfile, fetchToday, fetchMonth, calculateStreaks]);

  const updateHabit = async (updates: Partial<DailyHabit>) => {
    if (!todayHabit) return;
    const { data } = await supabase
      .from('daily_habits')
      .update(updates)
      .eq('id', todayHabit.id)
      .select()
      .single();
    if (data) {
      setTodayHabit(data);
      fetchMonth();
      calculateStreaks();
    }
  };

  const addWater = async () => {
    if (!todayHabit || !profile) return;
    await updateHabit({ water_ml: todayHabit.water_ml + profile.water_increment_ml });
  };

  const adjustWater = async () => {
    if (!todayHabit) return;
    const newVal = Math.max(0, todayHabit.water_ml - 100);
    await updateHabit({ water_ml: newVal });
  };

  return {
    todayHabit,
    profile,
    monthHabits,
    loading,
    streak,
    addWater,
    adjustWater,
    updateHabit,
    fetchProfile,
  };
};
