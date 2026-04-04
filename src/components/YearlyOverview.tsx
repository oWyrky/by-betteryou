import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type DailyHabit = Tables<'daily_habits'>;

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface YearlyOverviewProps {
  waterGoal: number;
}

const YearlyOverview = ({ waterGoal }: YearlyOverviewProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [yearHabits, setYearHabits] = useState<DailyHabit[]>([]);
  const [loading, setLoading] = useState(false);

  const year = new Date().getFullYear();

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (data) setYearHabits(data);
        setLoading(false);
      });
  }, [open, user, year]);

  const habitMap = new Map<string, DailyHabit>();
  yearHabits.forEach(h => habitMap.set(h.date, h));

  const getColor = (habit: DailyHabit | undefined) => {
    if (!habit) return 'bg-muted/40';
    const waterDone = waterGoal > 0 && habit.water_ml >= waterGoal;
    const exerciseDone = habit.exercise_done || habit.exercise_justified;
    const studyDone = habit.study_done || habit.reading_done;
    const count = [waterDone, exerciseDone, studyDone].filter(Boolean).length;
    if (count === 3) return 'bg-green-500';
    if (count === 2) return 'bg-yellow-500';
    if (count === 1) return 'bg-orange-400';
    return 'bg-muted/40';
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border bg-card py-3 text-sm font-semibold transition-all hover:bg-secondary active:scale-[0.98]"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Visão Anual {year}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border bg-card p-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3">
                {MONTHS_SHORT.map((monthName, monthIdx) => {
                  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
                  return (
                    <div key={monthIdx} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground">{monthName}</span>
                      <div className="grid grid-cols-7 gap-[2px]">
                        {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                          const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayIdx + 1).padStart(2, '0')}`;
                          const habit = habitMap.get(dateStr);
                          return (
                            <div
                              key={dayIdx}
                              className={`h-[6px] w-[6px] rounded-[1px] ${getColor(habit)}`}
                              title={`${dayIdx + 1}/${monthIdx + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-green-500" /> 3/3 metas</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-yellow-500" /> 2/3 metas</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-orange-400" /> 1/3 metas</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-muted/40" /> Nenhuma</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default YearlyOverview;
