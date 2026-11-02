import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { AddSessionModal } from '../../components/modals/AddSessionModal';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Coffee,
  CheckCircle2,
  Clock,
  BookOpen,
  Layers,
  Filter,
  Flame,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO
} from 'date-fns';

export const CalendarPage: React.FC = () => {
  const {
    sessions,
    planned,
    vocabulary,
    grammar,
    restDays,
    profile,
    toggleRestDay,
  } = useData();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filters
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [showRestDaysOnly, setShowRestDaysOnly] = useState(false);

  // Add Session modal from calendar day click
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [presetDateForSession, setPresetDateForSession] = useState<string | null>(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Generate calendar grid days for current month view
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Aggregate day-by-day indicators
  const daysDataMap = useMemo(() => {
    const map = new Map<string, {
      sessionsCount: number;
      durationMinutes: number;
      isRestDay: boolean;
      plannedCount: number;
      vocabCount: number;
      grammarCount: number;
      goalMet: boolean;
    }>();

    const dailyTarget = profile?.daily_study_goal_minutes || 30;

    monthDays.forEach((day) => {
      const dStr = format(day, 'yyyy-MM-dd');
      let daySessions = sessions.filter((s) => s.study_date === dStr);
      if (skillFilter !== 'all') {
        daySessions = daySessions.filter((s) => s.skill === skillFilter);
      }

      const totalMins = daySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
      const isRest = restDays.some((r) => r.rest_date === dStr);
      const dayPlanned = planned.filter((p) => p.planned_date === dStr);
      const dayVocab = vocabulary.filter((v) => v.date_added === dStr);
      const dayGrammar = grammar.filter((g) => g.date_added === dStr && g.status === 'Completed');

      map.set(dStr, {
        sessionsCount: daySessions.length,
        durationMinutes: totalMins,
        isRestDay: isRest,
        plannedCount: dayPlanned.length,
        vocabCount: dayVocab.length,
        grammarCount: dayGrammar.length,
        goalMet: totalMins >= dailyTarget,
      });
    });

    return map;
  }, [monthDays, sessions, planned, vocabulary, grammar, restDays, profile, skillFilter]);

  // Monthly summary metrics
  const monthSummary = useMemo(() => {
    const monthStartStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const monthEndStr = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const inMonthSessions = sessions.filter(
      (s) => s.study_date >= monthStartStr && s.study_date <= monthEndStr
    );
    const totalMinutes = inMonthSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
    const uniqueDays = new Set(inMonthSessions.map((s) => s.study_date)).size;
    const restDayCount = restDays.filter(
      (r) => r.rest_date >= monthStartStr && r.rest_date <= monthEndStr
    ).length;

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalSessions: inMonthSessions.length,
      studyDays: uniqueDays,
      restDays: restDayCount,
    };
  }, [currentMonth, sessions, restDays]);

  // Selected date details
  const selectedDayInfo = useMemo(() => {
    if (!selectedDate) return null;
    const daySessions = sessions.filter((s) => s.study_date === selectedDate);
    const dayPlanned = planned.filter((p) => p.planned_date === selectedDate);
    const dayVocab = vocabulary.filter((v) => v.date_added === selectedDate);
    const dayGrammar = grammar.filter((g) => g.date_added === selectedDate);
    const dayRest = restDays.find((r) => r.rest_date === selectedDate);
    const totalMins = daySessions.reduce((acc, s) => acc + s.duration_minutes, 0);

    return {
      date: selectedDate,
      sessions: daySessions,
      planned: dayPlanned,
      vocabulary: dayVocab,
      grammar: dayGrammar,
      restDay: dayRest,
      totalMinutes: totalMins,
      isGoalMet: totalMins >= (profile?.daily_study_goal_minutes || 30),
    };
  }, [selectedDate, sessions, planned, vocabulary, grammar, restDays, profile]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Study Calendar & Consistency
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Visual inspection of your habit streak, rest days, and study distribution.
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2] hover:bg-[#EFE7DF] dark:bg-[#203128] dark:hover:bg-[#2A3F33] text-xs font-semibold"
          >
            Today
          </button>
          <div className="flex items-center gap-1 border border-[#E4D7CC] dark:border-[#2C4236] rounded-xl bg-[#FFF9F2] dark:bg-[#203128] p-1">
            <button
              onClick={prevMonth}
              className="p-1 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-lg"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2 text-[#352820] dark:text-[#E8F0E8] min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-lg"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Month's Study Hours
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {monthSummary.totalHours}h
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Active Study Days
          </span>
          <span className="text-2xl font-bold font-editorial text-emerald-700 dark:text-emerald-400">
            {monthSummary.studyDays} days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Total Sessions
          </span>
          <span className="text-2xl font-bold font-editorial text-[#755744] dark:text-[#A7BDA9]">
            {monthSummary.totalSessions}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Planned Rest Days
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {monthSummary.restDays}
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-0.5">
            Preserves habit streak
          </span>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="p-4 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
          >
            <option value="all">All Skills</option>
            <option value="Reading">Reading</option>
            <option value="Listening">Listening</option>
            <option value="Speaking">Speaking</option>
            <option value="Writing">Writing</option>
            <option value="Vocabulary">Vocabulary</option>
            <option value="Grammar">Grammar</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-[#766456] dark:text-[#9CB29F] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            <span>Goal Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#755744] dark:bg-[#A7BDA9]" />
            <span>Study Recorded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Planned Rest Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Scheduled Task</span>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60 bg-[#F5EFE7]/80 dark:bg-[#17251D] text-center py-2.5 text-xs font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F]">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E4D7CC]/40 dark:divide-[#2C4236]/40">
          {monthDays.map((day) => {
            const dStr = format(day, 'yyyy-MM-dd');
            const data = daysDataMap.get(dStr);
            const inCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors cursor-pointer group ${
                  inCurrentMonth
                    ? 'bg-[#FFFDF9] dark:bg-[#203128] hover:bg-[#EFE7DF]/50 dark:hover:bg-[#2A3F33]'
                    : 'bg-[#F5EFE7]/40 dark:bg-[#17251D]/40 text-[#766456]/40 dark:text-[#9CB29F]/40 hover:bg-[#EFE7DF]/30'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-[#755744] text-white dark:bg-[#3F6650]'
                        : inCurrentMonth
                        ? 'text-[#352820] dark:text-[#E8F0E8]'
                        : 'text-[#766456]/50 dark:text-[#9CB29F]/50'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {data?.isRestDay && (
                    <span title="Planned Rest Day">
                      <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </span>
                  )}
                </div>

                {/* Day Visual Indicators */}
                <div className="space-y-1 my-1">
                  {data && data.durationMinutes > 0 && (
                    <div
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate flex items-center justify-between ${
                        data.goalMet
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-[#EFE7DF] text-[#755744] dark:bg-[#2A3F33] dark:text-[#A7BDA9]'
                      }`}
                    >
                      <span>{data.durationMinutes}m</span>
                      {data.goalMet && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  )}

                  {data && data.plannedCount > 0 && (
                    <div className="text-[9px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-1 rounded-sm truncate">
                      {data.plannedCount} plan{data.plannedCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Indicator dots */}
                <div className="flex items-center gap-1 self-end mt-auto">
                  {data && data.vocabCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" title={`${data.vocabCount} vocabulary`} />
                  )}
                  {data && data.grammarCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title={`${data.grammarCount} grammar`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Modal */}
      {selectedDayInfo && (
        <Modal
          isOpen={Boolean(selectedDate)}
          onClose={() => setSelectedDate(null)}
          title={`Day Overview: ${selectedDate}`}
          subtitle="Detailed breakdown of recorded activities, study time, and goals."
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Action Bar for Selected Day */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5EFE7] dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRestDay(selectedDayInfo.date)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDayInfo.restDay
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                      : 'bg-[#FFFDF9] dark:bg-[#203128] text-[#352820] dark:text-[#E8F0E8] border-[#E4D7CC] dark:border-[#2C4236]'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  {selectedDayInfo.restDay ? 'Rest Day Active (Click to remove)' : 'Mark as Rest Day'}
                </button>
              </div>

              <button
                onClick={() => {
                  setPresetDateForSession(selectedDayInfo.date);
                  setIsAddSessionOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Session for Day
              </button>
            </div>

            {/* Daily Metric Summaries */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1D2D23] border border-[#E4D7CC] dark:border-[#2C4236]">
                <span className="text-[10px] uppercase font-bold text-[#766456] dark:text-[#9CB29F] block">
                  Study Time
                </span>
                <span className="text-lg font-bold text-[#755744] dark:text-[#A7BDA9]">
                  {selectedDayInfo.totalMinutes} min
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1D2D23] border border-[#E4D7CC] dark:border-[#2C4236]">
                <span className="text-[10px] uppercase font-bold text-[#766456] dark:text-[#9CB29F] block">
                  Vocab Added
                </span>
                <span className="text-lg font-bold text-[#352820] dark:text-[#E8F0E8]">
                  {selectedDayInfo.vocabulary.length}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1D2D23] border border-[#E4D7CC] dark:border-[#2C4236]">
                <span className="text-[10px] uppercase font-bold text-[#766456] dark:text-[#9CB29F] block">
                  Grammar Completed
                </span>
                <span className="text-lg font-bold text-[#352820] dark:text-[#E8F0E8]">
                  {selectedDayInfo.grammar.filter(g => g.status === 'Completed').length}
                </span>
              </div>
            </div>

            {/* Study Sessions on Date */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Recorded Study Sessions ({selectedDayInfo.sessions.length})
              </h4>
              {selectedDayInfo.sessions.length === 0 ? (
                <p className="text-xs text-[#766456] dark:text-[#9CB29F] italic py-2">
                  No study recorded for this date.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayInfo.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1D2D23] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8]">
                            {s.activity}
                          </span>
                          <Badge variant="skill" value={s.skill}>
                            {s.skill}
                          </Badge>
                        </div>
                        {s.notes && (
                          <p className="text-[11px] text-[#766456] dark:text-[#9CB29F] mt-0.5">
                            {s.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-[#755744] dark:text-[#A7BDA9]">
                        {s.duration_minutes} min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vocabulary Added on Date */}
            {selectedDayInfo.vocabulary.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Vocabulary Added ({selectedDayInfo.vocabulary.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDayInfo.vocabulary.map((v) => (
                    <span
                      key={v.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFFDF9] dark:bg-[#1D2D23] border border-[#E4D7CC] dark:border-[#2C4236]"
                    >
                      <strong>{v.word}</strong> ({v.category})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Quick Add Session Modal for Date */}
      <AddSessionModal
        isOpen={isAddSessionOpen}
        onClose={() => {
          setIsAddSessionOpen(false);
          setPresetDateForSession(null);
        }}
      />
    </div>
  );
};
