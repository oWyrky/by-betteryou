import { useState, useEffect } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { getAvatarSignedUrl } from '@/lib/avatar';
import CircularProgress from '@/components/CircularProgress';
import HabitCalendar from '@/components/HabitCalendar';
import DayCompleteModal from '@/components/DayCompleteModal';
import DashboardHeader from '@/components/DashboardHeader';
import { Droplets, Dumbbell, BookOpen, Check, Minus, Plus, ShieldCheck, Lock, Unlock } from 'lucide-react';

const Dashboard = () => {
  const { todayHabit, profile, monthHabits, loading, streak, addWater, adjustWater, updateHabit } = useHabits();
  const [showCongrats, setShowCongrats] = useState(false);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.avatar_url) {
      getAvatarSignedUrl(profile.avatar_url).then(url => setResolvedAvatarUrl(url));
    }
  }, [profile?.avatar_url]);

  if (loading || !todayHabit || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const waterProgress = profile.water_goal_ml > 0 ? todayHabit.water_ml / profile.water_goal_ml : 0;
  const exerciseActive = todayHabit.exercise_done || todayHabit.exercise_justified;
  const studyActive = todayHabit.study_done || todayHabit.reading_done;
  const dayCompleted = (todayHabit as any).day_completed as boolean;

  // Easter egg: water >= 2x goal → darker blue
  const waterOver2x = profile.water_goal_ml > 0 && todayHabit.water_ml >= profile.water_goal_ml * 2;
  const waterColor = waterOver2x ? 'hsl(210, 90%, 35%)' : 'hsl(210, 80%, 55%)';
  const waterBgColor = waterOver2x ? 'hsl(210, 90%, 85%)' : 'hsl(210, 80%, 92%)';
  const waterTextColor = waterOver2x ? 'hsl(210, 90%, 20%)' : 'hsl(210, 80%, 35%)';

  // Can complete day: water goal met + exercise done + (study or reading done)
  const waterGoalMet = profile.water_goal_ml > 0 && todayHabit.water_ml >= profile.water_goal_ml;
  const canCompleteDay = waterGoalMet && exerciseActive && studyActive;

  const handleCompleteDay = async () => {
    await updateHabit({ day_completed: true } as any);
    setShowCongrats(true);
  };

  const handleReopenDay = async () => {
    await updateHabit({ day_completed: false } as any);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-6 pb-20">
        <DashboardHeader displayName={profile.display_name || 'Usuário'} avatarUrl={profile.avatar_url} />

        {/* Day completed banner */}
        {dayCompleted && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Dia concluído! 🎉</span>
            </div>
            <button
              onClick={handleReopenDay}
              className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-all hover:bg-green-200 active:scale-95"
            >
              <Unlock className="h-3 w-3" />
              Reabrir
            </button>
          </div>
        )}

        {/* 3 Circular Indicators */}
        <div className="mb-6 flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <CircularProgress progress={waterProgress} color={waterColor}>
              <Droplets className="h-5 w-5" style={{ color: waterColor }} />
            </CircularProgress>
            <div className="text-center">
              <p className="text-xs font-semibold">{todayHabit.water_ml}ml</p>
              <p className="text-[10px] text-muted-foreground">/{profile.water_goal_ml}ml</p>
              {waterOver2x && <p className="text-[9px] font-bold text-blue-800">🏆 2x Meta!</p>}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <CircularProgress progress={exerciseActive ? 1 : 0} color="hsl(25, 90%, 55%)">
              <Dumbbell className="h-5 w-5" style={{ color: 'hsl(25, 90%, 55%)' }} />
            </CircularProgress>
            <div className="text-center">
              <p className="text-xs font-semibold">{streak.exercise} dias</p>
              <p className="text-[10px] text-muted-foreground">exercício</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <CircularProgress progress={studyActive ? 1 : 0} color="hsl(145, 60%, 42%)">
              <BookOpen className="h-5 w-5" style={{ color: 'hsl(145, 60%, 42%)' }} />
            </CircularProgress>
            <div className="text-center">
              <p className="text-xs font-semibold">{streak.study} dias</p>
              <p className="text-[10px] text-muted-foreground">estudo</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 space-y-3">
          {/* Water Actions */}
          <div className={`rounded-2xl border bg-card p-4 ${dayCompleted ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="mb-2 flex items-center gap-2">
              <Droplets className="h-4 w-4" style={{ color: waterColor }} />
              <span className="text-sm font-semibold">Água</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addWater}
                disabled={dayCompleted}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: waterBgColor, color: waterTextColor }}
              >
                <Plus className="h-4 w-4" />
                {profile.water_increment_ml}ml
              </button>
              <button
                onClick={adjustWater}
                disabled={dayCompleted}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl border py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary active:scale-[0.97]"
              >
                <Minus className="h-4 w-4" />
                100ml
              </button>
            </div>
          </div>

          {/* Exercise Actions */}
          <div className={`rounded-2xl border bg-card p-4 ${dayCompleted ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="mb-2 flex items-center gap-2">
              <Dumbbell className="h-4 w-4" style={{ color: 'hsl(25, 90%, 55%)' }} />
              <span className="text-sm font-semibold">Exercício</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateHabit({ exercise_done: !todayHabit.exercise_done, exercise_justified: false })}
                disabled={dayCompleted}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: todayHabit.exercise_done ? 'hsl(25, 90%, 55%)' : 'hsl(25, 90%, 92%)',
                  color: todayHabit.exercise_done ? 'white' : 'hsl(25, 90%, 35%)',
                }}
              >
                <Check className="h-4 w-4" />
                {todayHabit.exercise_done ? 'Concluído' : 'Treino Concluído'}
              </button>
              <button
                onClick={() => updateHabit({ exercise_justified: !todayHabit.exercise_justified, exercise_done: false })}
                disabled={dayCompleted}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl border py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                  todayHabit.exercise_justified ? 'border-orange-300 bg-orange-50' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Justificar
              </button>
            </div>
          </div>

          {/* Study/Reading Actions */}
          <div className={`rounded-2xl border bg-card p-4 ${dayCompleted ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: 'hsl(145, 60%, 42%)' }} />
              <span className="text-sm font-semibold">Estudo / Leitura</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateHabit({ study_done: !todayHabit.study_done })}
                disabled={dayCompleted}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: todayHabit.study_done ? 'hsl(45, 90%, 50%)' : 'hsl(45, 90%, 90%)',
                  color: todayHabit.study_done ? 'white' : 'hsl(45, 90%, 30%)',
                }}
              >
                <Check className="h-4 w-4" />
                {todayHabit.study_done ? 'Estudado ✓' : 'Estudo Concluído'}
              </button>
              <button
                onClick={() => updateHabit({ reading_done: !todayHabit.reading_done })}
                disabled={dayCompleted}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: todayHabit.reading_done ? 'hsl(145, 60%, 42%)' : 'hsl(145, 60%, 90%)',
                  color: todayHabit.reading_done ? 'white' : 'hsl(145, 60%, 25%)',
                }}
              >
                <Check className="h-4 w-4" />
                {todayHabit.reading_done ? 'Lido ✓' : 'Leitura Concluída'}
              </button>
            </div>
          </div>
        </div>

        {/* Complete Day Button */}
        {!dayCompleted && canCompleteDay && (
          <button
            onClick={handleCompleteDay}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          >
            <Lock className="h-5 w-5" />
            Concluir o Dia
          </button>
        )}

        {/* Calendar */}
        <HabitCalendar habits={monthHabits} waterGoal={profile.water_goal_ml} />
      </div>

      <DayCompleteModal open={showCongrats} onClose={() => setShowCongrats(false)} />
    </div>
  );
};

export default Dashboard;
