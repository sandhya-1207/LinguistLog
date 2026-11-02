import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { ProgressRing } from '../../components/common/ProgressRing';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BarChart3,
  TrendingUp,
  Clock,
  BookOpen,
  Layers,
  Award,
  Calendar,
  Filter,
  CheckCircle2,
  Flame,
  PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  parseISO,
  isWithinInterval,
  eachDayOfInterval,
  differenceInDays
} from 'date-fns';

type DateFilterType = '7d' | '30d' | '90d' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export const AnalyticsPage: React.FC = () => {
  const {
    sessions,
    vocabulary,
    grammar,
    skills,
    goals,
    profile,
    streak,
    todayStats,
  } = useData();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Aesthetic colors
  const primaryColor = isDark ? '#3F6650' : '#755744';
  const accentColor = isDark ? '#A7BDA9' : '#C8AD96';
  const textColor = isDark ? '#E8F0E8' : '#352820';
  const gridColor = isDark ? '#2C4236' : '#E4D7CC';
  const mutedColor = isDark ? '#9CB29F' : '#766456';

  const [dateFilter, setDateFilter] = useState<DateFilterType>('30d');
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Calculate start & end dates based on active filter
  const { startDate, endDate, daysCount } = useMemo(() => {
    const now = new Date();
    let start = subDays(now, 29);
    let end = now;

    if (dateFilter === '7d') {
      start = subDays(now, 6);
    } else if (dateFilter === '30d') {
      start = subDays(now, 29);
    } else if (dateFilter === '90d') {
      start = subDays(now, 89);
    } else if (dateFilter === 'this_month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (dateFilter === 'last_month') {
      const prev = subMonths(now, 1);
      start = startOfMonth(prev);
      end = endOfMonth(prev);
    } else if (dateFilter === 'this_year') {
      start = startOfYear(now);
      end = endOfYear(now);
    } else if (dateFilter === 'custom') {
      start = parseISO(customStart);
      end = parseISO(customEnd);
    }

    const diff = Math.max(1, differenceInDays(end, start) + 1);
    return { startDate: start, endDate: end, daysCount: diff };
  }, [dateFilter, customStart, customEnd]);

  // Filtered study sessions in selected interval
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const d = parseISO(s.study_date);
      return isWithinInterval(d, { start: startDate, end: endDate });
    });
  }, [sessions, startDate, endDate]);

  // Filtered vocabulary in interval
  const filteredVocab = useMemo(() => {
    return vocabulary.filter((v) => {
      const d = parseISO(v.date_added);
      return isWithinInterval(d, { start: startDate, end: endDate });
    });
  }, [vocabulary, startDate, endDate]);

  // Filtered grammar in interval
  const filteredGrammar = useMemo(() => {
    return grammar.filter((g) => {
      const d = parseISO(g.date_added);
      return isWithinInterval(d, { start: startDate, end: endDate });
    });
  }, [grammar, startDate, endDate]);

  // Metric Aggregations
  const totalMinutesInPeriod = filteredSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalHoursInPeriod = Number((totalMinutesInPeriod / 60).toFixed(1));
  const uniqueStudyDaysInPeriod = new Set(filteredSessions.map((s) => s.study_date)).size;

  const avgDailyMinutes = daysCount > 0 ? Math.round(totalMinutesInPeriod / daysCount) : 0;
  const avgWeeklyHours = Number(((totalMinutesInPeriod / daysCount) * 7 / 60).toFixed(1));

  // 1. Line Chart: Learning progress over time (Cumulative hours)
  const lineChartData = useMemo(() => {
    // Break into daily or sample points
    const points: { date: string; hours: number }[] = [];
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

    // If interval > 60 days, group by weeks or step
    const step = daysInterval.length > 60 ? Math.ceil(daysInterval.length / 30) : 1;

    let cumulativeMinutes = 0;
    daysInterval.forEach((day, index) => {
      const dStr = format(day, 'yyyy-MM-dd');
      const dayMins = filteredSessions
        .filter((s) => s.study_date === dStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);
      cumulativeMinutes += dayMins;

      if (index % step === 0 || index === daysInterval.length - 1) {
        points.push({
          date: format(day, daysInterval.length > 60 ? 'MMM d' : 'MM/dd'),
          hours: Number((cumulativeMinutes / 60).toFixed(1)),
        });
      }
    });

    return points;
  }, [filteredSessions, startDate, endDate]);

  // 2. Bar Chart: Daily study hours
  const barChartData = useMemo(() => {
    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate }).slice(-14);
    return daysInterval.map((day) => {
      const dStr = format(day, 'yyyy-MM-dd');
      const mins = filteredSessions
        .filter((s) => s.study_date === dStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);
      return {
        date: format(day, 'EEE d'),
        hours: Number((mins / 60).toFixed(1)),
        minutes: mins,
      };
    });
  }, [filteredSessions, startDate, endDate]);

  // 3. Donut Chart: Distribution of Study Activities / Skills
  const activityPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSessions.forEach((s) => {
      counts[s.skill] = (counts[s.skill] || 0) + s.duration_minutes;
    });

    const palette = isDark
      ? ['#3F6650', '#A7BDA9', '#54876B', '#7AA88B', '#2A3F33', '#1D2D23']
      : ['#755744', '#C8AD96', '#9A775E', '#D9C5B4', '#5E4332', '#453023'];

    return Object.entries(counts).map(([skill, mins], i) => ({
      name: skill,
      value: mins,
      hours: (mins / 60).toFixed(1),
      color: palette[i % palette.length],
    }));
  }, [filteredSessions, isDark]);

  // 4. Calendar Heatmap Matrix (Last 12 weeks / 84 days)
  const heatmapData = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 83); // 12 weeks
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dStr = format(day, 'yyyy-MM-dd');
      const mins = sessions
        .filter((s) => s.study_date === dStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);

      // Level 0 (0), Level 1 (1-29m), Level 2 (30-59m), Level 3 (60m+)
      let level = 0;
      if (mins > 0 && mins < 30) level = 1;
      else if (mins >= 30 && mins < 60) level = 2;
      else if (mins >= 60) level = 3;

      return {
        date: dStr,
        dayName: format(day, 'EEE'),
        minutes: mins,
        level,
      };
    });
  }, [sessions]);

  // 5. Radar Chart: 4 Core Skills
  const radarData = useMemo(() => {
    const core = ['Reading', 'Listening', 'Speaking', 'Writing'];
    return core.map((name) => {
      const found = skills.find((s) => s.skill === name);
      return {
        skill: name,
        progress: found ? found.progress_percentage : 0,
      };
    });
  }, [skills]);

  // Target vs Actual comparisons
  const targetStudyHours = profile ? Number(((profile.daily_study_goal_minutes * daysCount) / 60).toFixed(1)) : 10;
  const targetVocab = profile ? profile.daily_vocab_goal * daysCount : 30;
  const targetGrammar = profile ? profile.daily_grammar_goal * Math.max(1, Math.floor(daysCount / 7)) : 4;

  const hoursCompletionPct = Math.min(100, Math.round((totalHoursInPeriod / targetStudyHours) * 100));
  const vocabCompletionPct = Math.min(100, Math.round((filteredVocab.length / targetVocab) * 100));
  const grammarCompletionPct = Math.min(100, Math.round((filteredGrammar.length / targetGrammar) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Date Filter Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Analytics & Progress Metrics
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Visualizing manual recordings against personal targets with mathematical integrity.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap bg-[#FFF9F2] dark:bg-[#203128] p-1.5 rounded-2xl border border-[#E4D7CC] dark:border-[#2C4236]">
          {(['7d', '30d', '90d', 'this_month', 'last_month', 'this_year', 'custom'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setDateFilter(filterKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilter === filterKey
                  ? 'bg-[#755744] text-white dark:bg-[#3F6650] shadow-xs'
                  : 'text-[#766456] dark:text-[#9CB29F] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]'
              }`}
            >
              {filterKey === '7d' && '7 Days'}
              {filterKey === '30d' && '30 Days'}
              {filterKey === '90d' && '90 Days'}
              {filterKey === 'this_month' && 'This Month'}
              {filterKey === 'last_month' && 'Last Month'}
              {filterKey === 'this_year' && 'This Year'}
              {filterKey === 'custom' && 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F]">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F]">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Analytics High-Level Metrics (10 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-1">
            Total Study Hours
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {totalHoursInPeriod}h
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            In selected period
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-1">
            Avg Daily Study
          </span>
          <span className="text-2xl font-bold font-editorial text-[#755744] dark:text-[#A7BDA9]">
            {avgDailyMinutes}m
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Target: {profile?.daily_study_goal_minutes || 30}m/day
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-1">
            Weekly Pace
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {avgWeeklyHours}h
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Hours per 7 days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-1">
            Study Days Logged
          </span>
          <span className="text-2xl font-bold font-editorial text-emerald-700 dark:text-emerald-400">
            {uniqueStudyDaysInPeriod}
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Out of {daysCount} days
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-1">
            Streak Record
          </span>
          <div className="flex items-center gap-1 text-2xl font-bold font-editorial text-amber-700 dark:text-amber-400">
            <Flame className="w-5 h-5 fill-current" />
            <span>{streak.currentStreak}d</span>
          </div>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            All-time high: {streak.longestStreak}d
          </span>
        </div>
      </div>

      {/* Target vs Actual Comparison Banners */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
          Actual Progress vs. Target Goals
        </h3>
        <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-6">
          Comparing recorded outcomes against expected targets for the selected timeframe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Hours Comparison */}
          <div className="p-4 rounded-2xl bg-[#F5EFE7]/70 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8]">
                Immersion Hours
              </span>
              <span className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9]">
                {hoursCompletionPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EFE7DF] dark:bg-[#2A3F33] overflow-hidden mb-2">
              <div
                className="h-full bg-[#755744] dark:bg-[#A7BDA9] rounded-full transition-all"
                style={{ width: `${hoursCompletionPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#766456] dark:text-[#9CB29F]">
              <span>Actual: {totalHoursInPeriod} hrs</span>
              <span>Target: {targetStudyHours} hrs</span>
            </div>
          </div>

          {/* Vocabulary Comparison */}
          <div className="p-4 rounded-2xl bg-[#F5EFE7]/70 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8]">
                Vocabulary Recorded
              </span>
              <span className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9]">
                {vocabCompletionPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EFE7DF] dark:bg-[#2A3F33] overflow-hidden mb-2">
              <div
                className="h-full bg-[#755744] dark:bg-[#A7BDA9] rounded-full transition-all"
                style={{ width: `${vocabCompletionPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#766456] dark:text-[#9CB29F]">
              <span>Actual: {filteredVocab.length} words</span>
              <span>Target: {targetVocab} words</span>
            </div>
          </div>

          {/* Grammar Comparison */}
          <div className="p-4 rounded-2xl bg-[#F5EFE7]/70 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8]">
                Grammar Topics Mastered
              </span>
              <span className="text-xs font-semibold text-[#755744] dark:text-[#A7BDA9]">
                {grammarCompletionPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EFE7DF] dark:bg-[#2A3F33] overflow-hidden mb-2">
              <div
                className="h-full bg-[#755744] dark:bg-[#A7BDA9] rounded-full transition-all"
                style={{ width: `${grammarCompletionPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#766456] dark:text-[#9CB29F]">
              <span>Actual: {filteredGrammar.length} topics</span>
              <span>Target: {targetGrammar} topics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Line Chart: Cumulative hours */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Cumulative Study Progression
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Total hours accumulated across the filtered period
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
          </div>

          <div className="h-64 w-full">
            {lineChartData.length === 0 ? (
              <EmptyState title="No data in range" description="Select a broader range to view progression." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke={mutedColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={mutedColor} fontSize={11} tickLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#203128' : '#FFF9F2',
                      borderColor: isDark ? '#2C4236' : '#E4D7CC',
                      borderRadius: '0.75rem',
                      color: textColor,
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val} hrs`, 'Total Hours']}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke={primaryColor}
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: primaryColor }}
                    activeDot={{ r: 5, fill: accentColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Bar Chart: Daily Study Hours */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Daily Immersion Hours
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Study time per day (most recent 14 days)
              </p>
            </div>
            <Clock className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke={mutedColor} fontSize={11} tickLine={false} />
                <YAxis stroke={mutedColor} fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    backgroundColor: isDark ? '#203128' : '#FFF9F2',
                    borderColor: isDark ? '#2C4236' : '#E4D7CC',
                    borderRadius: '0.75rem',
                    color: textColor,
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${val} hrs`, 'Study Hours']}
                />
                <Bar dataKey="hours" fill={accentColor} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Donut Chart: Study Activities / Skill Distribution */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Activity & Skill Breakdown
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Distribution of time invested per skill area
              </p>
            </div>
            <PieIcon className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {activityPieData.length === 0 ? (
              <EmptyState title="No recorded activities" description="Log study sessions to populate distribution." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityPieData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {activityPieData.map((entry, index) => (
                      <Cell key={`cell-act-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#203128' : '#FFF9F2',
                      borderColor: isDark ? '#2C4236' : '#E4D7CC',
                      borderRadius: '0.75rem',
                      color: textColor,
                      fontSize: '12px',
                    }}
                    formatter={(val: number) => [`${val} mins (${(val / 60).toFixed(1)} hrs)`, 'Duration']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4. Radar Chart: 4 Core Skills */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Core Competencies Balance
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Reading, Listening, Speaking, and Writing self-assessments
              </p>
            </div>
            <Award className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="skill" stroke={mutedColor} fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={gridColor} fontSize={10} />
                <Radar
                  name="Proficiency %"
                  dataKey="progress"
                  stroke={primaryColor}
                  fill={accentColor}
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Calendar Heatmap: Learning Consistency Matrix */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
              Learning Consistency Matrix (Past 12 Weeks)
            </h3>
            <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
              Visualizing habitual practice and non-interrupted study days
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#766456] dark:text-[#9CB29F]">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-[#E4D7CC]/60 dark:bg-[#2C4236]" />
            <span className="w-3 h-3 rounded-xs bg-[#C8AD96]/60 dark:bg-[#3F6650]/60" />
            <span className="w-3 h-3 rounded-xs bg-[#755744]/70 dark:bg-[#3F6650]" />
            <span className="w-3 h-3 rounded-xs bg-[#755744] dark:bg-[#A7BDA9]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
            {heatmapData.map((cell) => {
              let bg = 'bg-[#E4D7CC]/40 dark:bg-[#2C4236]/40';
              if (cell.level === 1) bg = 'bg-[#C8AD96]/60 dark:bg-[#3F6650]/60';
              if (cell.level === 2) bg = 'bg-[#755744]/80 dark:bg-[#3F6650]';
              if (cell.level === 3) bg = 'bg-[#755744] dark:bg-[#A7BDA9]';

              return (
                <div
                  key={cell.date}
                  className={`w-3.5 h-3.5 rounded-xs ${bg} transition-colors cursor-pointer hover:ring-2 hover:ring-[#755744] dark:hover:ring-[#A7BDA9]`}
                  title={`${cell.date}: ${cell.minutes} minutes recorded`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
