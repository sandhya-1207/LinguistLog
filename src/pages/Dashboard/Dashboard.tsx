import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { ProgressRing } from '../../components/common/ProgressRing';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Quote as QuoteIcon,
  CheckSquare,
  Square,
  Layers,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';

export const Dashboard: React.FC = () => {
  const {
    profile,
    sessions,
    vocabulary,
    grammar,
    skills,
    goals,
    planned,
    streak,
    todayStats,
    totalStats,
    insights,
    quote,
    toggleActivityCompletion,
  } = useData();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Palette constants matching theme
  const primaryColor = isDark ? '#3F6650' : '#755744';
  const accentColor = isDark ? '#A7BDA9' : '#C8AD96';
  const textColor = isDark ? '#E8F0E8' : '#352820';
  const gridColor = isDark ? '#2C4236' : '#E4D7CC';

  // Weekly study time data (Last 7 days)
  const weeklyBarData = useMemo(() => {
    const days: { day: string; date: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayName = format(d, 'EEE');
      const dayMinutes = sessions
        .filter((s) => s.study_date === dateStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);

      days.push({
        day: dayName,
        date: dateStr,
        minutes: dayMinutes,
      });
    }
    return days;
  }, [sessions]);

  // Learning progress over time (Cumulative hours over past 14 days)
  const progressLineData = useMemo(() => {
    const points: { date: string; hours: number }[] = [];
    let cumulative = 0;
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayMins = sessions
        .filter((s) => s.study_date === dateStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);
      cumulative += dayMins / 60;
      points.push({
        date: format(d, 'MMM d'),
        hours: Number(cumulative.toFixed(1)),
      });
    }
    return points;
  }, [sessions]);

  // Vocabulary distribution by status
  const vocabStatusData = useMemo(() => {
    const mastered = vocabulary.filter((v) => v.status === 'Mastered').length;
    const learning = vocabulary.filter((v) => v.status === 'Learning').length;
    const notStarted = vocabulary.filter((v) => v.status === 'Not started').length;

    return [
      { name: 'Mastered', value: mastered, color: isDark ? '#3F6650' : '#755744' },
      { name: 'Learning', value: learning, color: isDark ? '#A7BDA9' : '#C8AD96' },
      { name: 'Not Started', value: notStarted, color: isDark ? '#2C4236' : '#E4D7CC' },
    ].filter((item) => item.value > 0);
  }, [vocabulary, isDark]);

  // Grammar distribution by status
  const grammarStatusData = useMemo(() => {
    const completed = grammar.filter((g) => g.status === 'Completed').length;
    const learning = grammar.filter((g) => g.status === 'Learning').length;
    const notStarted = grammar.filter((g) => g.status === 'Not started').length;

    return [
      { name: 'Completed', value: completed, color: isDark ? '#3F6650' : '#755744' },
      { name: 'Learning', value: learning, color: isDark ? '#A7BDA9' : '#C8AD96' },
      { name: 'Not Started', value: notStarted, color: isDark ? '#2C4236' : '#E4D7CC' },
    ].filter((item) => item.value > 0);
  }, [grammar, isDark]);

  // Skill radar comparison
  const skillRadarData = useMemo(() => {
    const core = ['Reading', 'Listening', 'Speaking', 'Writing'];
    return core.map((name) => {
      const found = skills.find((s) => s.skill === name);
      return {
        skill: name,
        progress: found ? found.progress_percentage : 0,
      };
    });
  }, [skills]);

  // Today's planned checklist
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayPlanned = planned.filter((p) => p.planned_date === todayStr);

  // Recent 4 study sessions
  const recentSessions = sessions.slice(0, 4);

  // Weekly & monthly progress summaries
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekSessions = sessions.filter((s) => {
    const d = parseISO(s.study_date);
    return isWithinInterval(d, { start: thisWeekStart, end: thisWeekEnd });
  });
  const weeklyStudyHours = (
    thisWeekSessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60
  ).toFixed(1);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. WELCOME SECTION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F]">
                Active Immersion
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#755744] dark:bg-[#A7BDA9]" />
              <span className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9]">
                Since {profile?.learning_start_date || 'Day 1'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] leading-tight">
              Welcome back, {profile?.name || 'Learner'}
            </h1>
            <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1.5 max-w-xl">
              Tracking your disciplined progress in <strong className="text-[#352820] dark:text-[#E8F0E8]">{profile?.language || 'Language'}</strong> from{' '}
              <span className="font-semibold">{profile?.current_level || 'A1'}</span> to target{' '}
              <span className="font-semibold">{profile?.target_level || 'C1'}</span>.
            </p>
          </div>

          {/* Quick Streak Badge & CEFR Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 px-4 rounded-2xl bg-[#F5EFE7] dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-0.5">
                Current Level
              </span>
              <span className="text-xl font-bold text-[#755744] dark:text-[#A7BDA9]">
                {profile?.current_level || 'B1'}
              </span>
            </div>

            <div className="p-3.5 px-4 rounded-2xl bg-[#F5EFE7] dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-0.5">
                Daily Streak
              </span>
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-amber-700 dark:text-amber-400">
                <Flame className="w-5 h-5 fill-current" />
                <span>{streak.currentStreak}d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S OVERVIEW + PROGRESS RING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Study Ring Card */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
              Today's Study Goal
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFE7DF] text-[#755744] dark:bg-[#2A3F33] dark:text-[#A7BDA9]">
              {todayStats.studyMinutes} / {todayStats.targetMinutes} min
            </span>
          </div>

          <div className="flex items-center justify-center my-4">
            <ProgressRing
              progress={todayStats.completionPercentage}
              size={150}
              strokeWidth={12}
              label={`${todayStats.studyMinutes}m`}
              sublabel={`of ${todayStats.targetMinutes}m target`}
            />
          </div>

          <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between text-xs text-[#766456] dark:text-[#9CB29F]">
            <span>Daily Goal Status:</span>
            <span className="font-semibold text-[#352820] dark:text-[#E8F0E8]">
              {todayStats.completionPercentage >= 100
                ? 'Target Met!'
                : `${todayStats.targetMinutes - todayStats.studyMinutes} min remaining`}
            </span>
          </div>
        </div>

        {/* Today's Activity & Metrics */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-4">
              Today's Milestone Counts
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F5EFE7]/80 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EFE7DF] dark:bg-[#2A3F33] flex items-center justify-center text-[#755744] dark:text-[#A7BDA9]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] block">
                      Vocabulary Added Today
                    </span>
                    <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                      Target: {profile?.daily_vocab_goal || 5} words/day
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#755744] dark:text-[#A7BDA9]">
                  {todayStats.vocabCount}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F5EFE7]/80 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EFE7DF] dark:bg-[#2A3F33] flex items-center justify-center text-[#755744] dark:text-[#A7BDA9]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] block">
                      Grammar Topics Finished
                    </span>
                    <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                      Target: {profile?.daily_grammar_goal || 1} topic/day
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#755744] dark:text-[#A7BDA9]">
                  {todayStats.grammarCount}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between text-xs text-[#766456] dark:text-[#9CB29F]">
            <span>Today's Total Tasks:</span>
            <span className="font-semibold text-[#352820] dark:text-[#E8F0E8]">
              {todayStats.plannedCompleted} / {todayStats.plannedTotal} completed
            </span>
          </div>
        </div>

        {/* Today's Planner Checklist Quick Box */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Today's Checklist
              </h3>
              <Link
                to="/planner"
                className="text-xs text-[#755744] dark:text-[#A7BDA9] font-semibold hover:underline inline-flex items-center gap-1"
              >
                Open Planner <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todayPlanned.length === 0 ? (
              <p className="text-xs text-[#766456] dark:text-[#9CB29F] py-4 italic">
                No activities scheduled for today. Plan one in the Study Planner!
              </p>
            ) : (
              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {todayPlanned.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleActivityCompletion(item.id)}
                    className="w-full text-left p-2.5 rounded-xl border border-[#E4D7CC]/80 dark:border-[#2C4236]/80 bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF]/50 flex items-start gap-2.5 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-[#766456] dark:text-[#9CB29F] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-medium block truncate ${
                          item.completed
                            ? 'line-through text-[#766456] dark:text-[#9CB29F]'
                            : 'text-[#352820] dark:text-[#E8F0E8]'
                        }`}
                      >
                        {item.activity}
                      </span>
                      <span className="text-[10px] text-[#766456] dark:text-[#9CB29F]">
                        {item.skill} · {item.planned_duration} min
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between text-xs text-[#766456] dark:text-[#9CB29F]">
            <span>Quick Toggle:</span>
            <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">Click task to mark done</span>
          </div>
        </div>
      </div>

      {/* 3. STATISTICS CARDS (6 required metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Learning Hours */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Total Hours
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalStats.totalHours}
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            {totalStats.totalMinutes} total minutes
          </span>
        </div>

        {/* Total Study Sessions */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Study Sessions
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalStats.totalSessions}
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Manual recordings
          </span>
        </div>

        {/* Total Vocabulary Words */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Vocabulary
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalStats.totalVocab}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-1">
            {totalStats.masteredVocab} mastered
          </span>
        </div>

        {/* Grammar Topics Completed */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Grammar Done
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalStats.completedGrammar}
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            of {totalStats.totalGrammar} topics
          </span>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Current Streak
          </span>
          <div className="flex items-center gap-1.5 text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            <Flame className="w-5 h-5 text-amber-600 fill-current" />
            <span>{streak.currentStreak}d</span>
          </div>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Best: {streak.longestStreak} days
          </span>
        </div>

        {/* Goal Completion Rate */}
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Goal Success
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalStats.overallGoalCompletionRate}%
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Active targets
          </span>
        </div>
      </div>

      {/* 4. VISUALIZATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study-Time Bar Chart */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Weekly Study Time
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Minutes studied over the past 7 days
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EFE7DF] text-[#755744] dark:bg-[#2A3F33] dark:text-[#A7BDA9]">
              {weeklyStudyHours} hrs this week
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke={isDark ? '#9CB29F' : '#766456'} fontSize={12} tickLine={false} />
                <YAxis stroke={isDark ? '#9CB29F' : '#766456'} fontSize={12} tickLine={false} unit="m" />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#203128' : '#FFF9F2',
                    borderColor: isDark ? '#2C4236' : '#E4D7CC',
                    borderRadius: '0.75rem',
                    color: isDark ? '#E8F0E8' : '#352820',
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${val} minutes`, 'Study Time']}
                />
                <Bar dataKey="minutes" fill={primaryColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cumulative Learning Progress Line Chart */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Learning Progress
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Cumulative hours invested (past 14 days)
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke={isDark ? '#9CB29F' : '#766456'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#9CB29F' : '#766456'} fontSize={12} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#203128' : '#FFF9F2',
                    borderColor: isDark ? '#2C4236' : '#E4D7CC',
                    borderRadius: '0.75rem',
                    color: isDark ? '#E8F0E8' : '#352820',
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${val} hrs`, 'Cumulative Hours']}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: primaryColor }}
                  activeDot={{ r: 6, fill: primaryColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. SKILL PROGRESS RADAR & BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
              Four Skills Balance
            </h3>
            <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-4">
              Comparing Reading, Listening, Speaking & Writing
            </p>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadarData}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="skill" stroke={isDark ? '#9CB29F' : '#766456'} fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={gridColor} fontSize={10} />
                  <Radar
                    name="Proficiency"
                    dataKey="progress"
                    stroke={primaryColor}
                    fill={accentColor}
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 text-center">
            <Link
              to="/profile"
              className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9] hover:underline"
            >
              Adjust Self-Assessments in Profile &rarr;
            </Link>
          </div>
        </div>

        {/* Vocabulary & Grammar Distributions */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Knowledge Base Mastery
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Manual status distribution across vocabulary and grammar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Vocab Status */}
            <div className="p-4 rounded-2xl bg-[#F5EFE7]/60 dark:bg-[#17251D]/60 border border-[#E4D7CC] dark:border-[#2C4236]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8]">
                  Vocabulary ({vocabulary.length})
                </span>
                <Link to="/vocabulary" className="text-xs text-[#755744] dark:text-[#A7BDA9] hover:underline">
                  View List
                </Link>
              </div>
              <div className="h-32 flex items-center justify-center">
                {vocabulary.length === 0 ? (
                  <span className="text-xs text-[#766456] dark:text-[#9CB29F]">No words recorded</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vocabStatusData}
                        dataKey="value"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={4}
                      >
                        {vocabStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#766456] dark:text-[#9CB29F] mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#755744] dark:bg-[#3F6650]" /> Mastered ({totalStats.masteredVocab})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C8AD96] dark:bg-[#A7BDA9]" /> Learning ({totalStats.learningVocab})
                </span>
              </div>
            </div>

            {/* Grammar Status */}
            <div className="p-4 rounded-2xl bg-[#F5EFE7]/60 dark:bg-[#17251D]/60 border border-[#E4D7CC] dark:border-[#2C4236]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8]">
                  Grammar Topics ({grammar.length})
                </span>
                <Link to="/grammar" className="text-xs text-[#755744] dark:text-[#A7BDA9] hover:underline">
                  View List
                </Link>
              </div>
              <div className="h-32 flex items-center justify-center">
                {grammar.length === 0 ? (
                  <span className="text-xs text-[#766456] dark:text-[#9CB29F]">No topics recorded</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={grammarStatusData}
                        dataKey="value"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={4}
                      >
                        {grammarStatusData.map((entry, index) => (
                          <Cell key={`cell-gram-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#766456] dark:text-[#9CB29F] mt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#755744] dark:bg-[#3F6650]" /> Completed ({totalStats.completedGrammar})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C8AD96] dark:bg-[#A7BDA9]" /> In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. RECENT SESSIONS & LEARNING INSIGHTS & DAILY MOTIVATIONAL QUOTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Study Sessions */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Recent Study Sessions
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Latest manual recordings from your study log
              </p>
            </div>
            <Link
              to="/study-log"
              className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9] hover:underline flex items-center gap-1"
            >
              All Sessions &rarr;
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <EmptyState
              title="No study sessions yet"
              description="Record your first manual language practice session to activate analytics."
            />
          ) : (
            <div className="divide-y divide-[#E4D7CC]/60 dark:divide-[#2C4236]/60">
              {recentSessions.map((session) => (
                <div key={session.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="skill" value={session.skill}>
                      {session.skill}
                    </Badge>
                    <div>
                      <h4 className="text-sm font-semibold text-[#352820] dark:text-[#E8F0E8]">
                        {session.activity}
                      </h4>
                      {session.notes && (
                        <p className="text-xs text-[#766456] dark:text-[#9CB29F] line-clamp-1 max-w-md mt-0.5">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#755744] dark:text-[#A7BDA9] block">
                      {session.duration_minutes} min
                    </span>
                    <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                      {session.study_date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personalized Real Insights & Quote */}
        <div className="space-y-6">
          {/* Daily Quote Box */}
          <div className="p-6 rounded-3xl bg-[#F5EFE7] dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs relative">
            <QuoteIcon className="w-8 h-8 text-[#C8AD96]/40 dark:text-[#3F6650]/40 absolute top-4 right-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-2">
              Daily Reflection
            </span>
            <p className="text-sm italic font-editorial text-[#352820] dark:text-[#E8F0E8] leading-relaxed mb-3">
              "{quote.quote}"
            </p>
            <div className="text-right">
              <span className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9] block">
                — {quote.author}
              </span>
              {quote.languageContext && (
                <span className="text-[10px] text-[#766456] dark:text-[#9CB29F]">
                  {quote.languageContext}
                </span>
              )}
            </div>
          </div>

          {/* Real Insights Box */}
          <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
              <h3 className="text-sm font-bold text-[#352820] dark:text-[#E8F0E8]">
                Personalized Learning Insights
              </h3>
            </div>

            {insights.length === 0 ? (
              <p className="text-xs text-[#766456] dark:text-[#9CB29F] py-2">
                Continue logging activities to generate real progress trends.
              </p>
            ) : (
              <div className="space-y-2.5">
                {insights.slice(0, 3).map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 rounded-xl bg-[#F5EFE7]/60 dark:bg-[#17251D]/60 border border-[#E4D7CC]/80 dark:border-[#2C4236]/80 text-xs"
                  >
                    <span className="font-semibold text-[#352820] dark:text-[#E8F0E8] block mb-0.5">
                      {insight.title}
                    </span>
                    <p className="text-[#766456] dark:text-[#9CB29F]">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
