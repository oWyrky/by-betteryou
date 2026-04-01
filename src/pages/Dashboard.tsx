import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import CircularProgress from '@/components/CircularProgress';
import HabitCalendar from '@/components/HabitCalendar';
import { Droplets, Dumbbell, BookOpen, LogOut, Check, Minus, Plus, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { todayHabit, profile, monthHabits, loading, streak, addWater, adjustWater, updateHabit } = useHabits();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-6 pb-20">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Olá,</p>
            <h1 className="text-lg font-bold">{profile.display_name || 'Usuário'}</h1>
          </div>
          <button onClick={signOut} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary">
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Circular Indicators */}
        <div className="mb-6 flex items-center justify-around">
          {/* Water */}
          <div className="flex flex-col items-center gap-2">
            <CircularProgress progress={waterProgress} color="hsl(210, 80%, 55%)">
              <Droplets className="h-5 w-5" style={{ color: 'hsl(210, 80%, 55%)' }} />
            </CircularProgress>
            <div className="text-center">
              <p className="text-xs font-semibold">{todayHabit.water_ml}ml</p>
              <p className="text-[10px] text-muted-foreground">/{profile.water_goal_ml}ml</p>
            </div>
          </div>

          {/* Exercise Streak */}
          <div className="flex flex-col items-center gap-2">
            <CircularProgress progress={exerciseActive ? 1 : 0} color="hsl(25, 90%, 55%)">
              <Dumbbell className="h-5 w-5" style={{ color: 'hsl(25, 90%, 55%)' }} />
            </CircularProgress>
            <div className="text-center">
              <p className="text-xs font-semibold">{streak.exercise} dias</p>
              <p className="text-[10px] text-muted-foreground">exercício</p>
            </div>
          </div>

          {/* Study/Reading Streak */}
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
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Droplets className="h-4 w-4" style={{ color: 'hsl(210, 80%, 55%)' }} />
              <span className="text-sm font-semibold">Água</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addWater}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-water-light py-3 text-sm font-medium transition-all hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: 'hsl(210, 80%, 92%)', color: 'hsl(210, 80%, 35%)' }}
              >
                <Plus className="h-4 w-4" />
                +{profile.water_increment_ml}ml
              </button>
              <button
                onClick={adjustWater}
                className="flex items-center justify-center gap-1 rounded-xl border px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary active:scale-[0.97]"
              >
                <Minus className="h-4 w-4" />
                Ajustar
              </button>
            </div>
          </div>

          {/* Exercise Actions */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Dumbbell className="h-4 w-4" style={{ color: 'hsl(25, 90%, 55%)' }} />
              <span className="text-sm font-semibold">Exercício</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateHabit({ exercise_done: !todayHabit.exercise_done, exercise_justified: false })}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                  todayHabit.exercise_done
                    ? 'text-primary-foreground'
                    : ''
                }`}
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
                className={`flex items-center justify-center gap-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                  todayHabit.exercise_justified ? 'border-orange-300 bg-orange-50' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Justificar
              </button>
            </div>
          </div>

          {/* Study/Reading Actions */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: 'hsl(145, 60%, 42%)' }} />
              <span className="text-sm font-semibold">Estudo / Leitura</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateHabit({ study_done: !todayHabit.study_done })}
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

        {/* Calendar */}
        <HabitCalendar habits={monthHabits} waterGoal={profile.water_goal_ml} />
      </div>
    </div>
  );
};

export default Dashboard;
