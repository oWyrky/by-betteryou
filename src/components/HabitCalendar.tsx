import type { Tables } from '@/integrations/supabase/types';

type DailyHabit = Tables<'daily_habits'>;

interface HabitCalendarProps {
  habits: DailyHabit[];
  waterGoal: number;
}

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const HabitCalendar = ({ habits, waterGoal }: HabitCalendarProps) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = now.getDate();

  const habitMap = new Map<number, DailyHabit>();
  habits.forEach(h => {
    const day = new Date(h.date + 'T12:00:00').getDate();
    habitMap.set(day, h);
  });

  const renderDayDot = (day: number) => {
    const habit = habitMap.get(day);
    const isToday = day === today;
    const size = 28;
    const r = 10;
    const cx = size / 2;
    const cy = size / 2;
    const innerR = 6.5;

    if (!habit) {
      return (
        <div
          className={`flex items-center justify-center rounded-full text-xs ${isToday ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground'}`}
          style={{ width: size, height: size }}
        >
          {day}
        </div>
      );
    }

    const exerciseDone = habit.exercise_done || habit.exercise_justified;
    const studyDone = habit.study_done || (habit as any).study_justified;
    const readingDone = habit.reading_done || (habit as any).reading_justified;
    const waterProgress = waterGoal > 0 ? Math.min(habit.water_ml / waterGoal, 1) : 0;

    // 3 arc segments: Exercise, Study, Reading
    const segments = [
      { done: exerciseDone, color: 'hsl(25, 90%, 55%)' },
      { done: studyDone, color: 'hsl(45, 90%, 50%)' },
      { done: readingDone, color: 'hsl(145, 60%, 42%)' },
    ];

    const gap = 0.04;
    const totalSegments = 3;
    const segmentAngle = (2 * Math.PI - gap * totalSegments) / totalSegments;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Water fill circle inside */}
          {waterProgress > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={innerR}
              fill="none"
              stroke="hsl(210, 80%, 55%)"
              strokeWidth={innerR * 2}
              strokeDasharray={`${waterProgress * 2 * Math.PI * innerR} ${2 * Math.PI * innerR}`}
              opacity={0.25}
            />
          )}

          {/* 3 outer segments */}
          {segments.map((seg, i) => {
            const startAngle = i * (segmentAngle + gap);
            const circumference = 2 * Math.PI * r;
            const dashLength = (segmentAngle / (2 * Math.PI)) * circumference;
            const dashOffset = -(startAngle / (2 * Math.PI)) * circumference;

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.done ? seg.color : 'hsl(var(--border))'}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-dashOffset}
                opacity={seg.done ? 1 : 0.4}
              />
            );
          })}
        </svg>
        <span className={`absolute text-[10px] ${isToday ? 'font-bold' : 'text-muted-foreground'}`}>
          {day}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold capitalize">{MONTHS[month]}</h3>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d, i) => (
          <div key={i} className="flex items-center justify-center text-[10px] font-medium text-muted-foreground" style={{ height: 20 }}>
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={{ width: 28, height: 28 }} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div key={i + 1} className="flex items-center justify-center">
            {renderDayDot(i + 1)}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(210, 80%, 55%)' }} /> Água
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(25, 90%, 55%)' }} /> Exercício
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(45, 90%, 50%)' }} /> Estudo
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'hsl(145, 60%, 42%)' }} /> Leitura
        </span>
      </div>
    </div>
  );
};

export default HabitCalendar;
