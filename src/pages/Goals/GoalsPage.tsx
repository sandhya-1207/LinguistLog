import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Goal, GoalFrequency, MeasurementType, SkillType } from '../../types';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { ProgressRing } from '../../components/common/ProgressRing';
import { EmptyState } from '../../components/common/EmptyState';
import { ExportService } from '../../services/exportService';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    sessions,
    vocabulary,
    grammar,
    profile,
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [targetValue, setTargetValue] = useState(30);
  const [measurementType, setMeasurementType] = useState<MeasurementType>('minutes');
  const [skill, setSkill] = useState<SkillType | 'All'>('All');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  // Calculate actual progress for each goal automatically from real saved records
  const enrichedGoals = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return goals.map((goal) => {
      let actualValue = 0;

      // Filter sessions matching frequency and skill
      let relevantSessions = sessions;
      if (goal.skill && goal.skill !== 'All') {
        relevantSessions = relevantSessions.filter((s) => s.skill === goal.skill);
      }

      if (goal.goal_type === 'daily') {
        relevantSessions = relevantSessions.filter((s) => s.study_date === todayStr);
      } else if (goal.goal_type === 'weekly') {
        relevantSessions = relevantSessions.filter((s) => {
          const d = parseISO(s.study_date);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        });
      } else if (goal.goal_type === 'monthly') {
        relevantSessions = relevantSessions.filter((s) => {
          const d = parseISO(s.study_date);
          return isWithinInterval(d, { start: monthStart, end: monthEnd });
        });
      } else if (goal.goal_type === 'custom') {
        if (goal.start_date && goal.end_date) {
          relevantSessions = relevantSessions.filter((s) => {
            return s.study_date >= goal.start_date && s.study_date <= goal.end_date!;
          });
        }
      }

      // Compute actual by measurement type
      if (goal.measurement_type === 'minutes') {
        actualValue = relevantSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      } else if (goal.measurement_type === 'hours') {
        const mins = relevantSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
        actualValue = Number((mins / 60).toFixed(1));
      } else if (goal.measurement_type === 'words') {
        if (goal.goal_type === 'daily') {
          actualValue = vocabulary.filter((v) => v.date_added === todayStr).length;
        } else {
          actualValue = vocabulary.filter((v) => v.status === 'Mastered').length;
        }
      } else if (goal.measurement_type === 'topics') {
        if (goal.goal_type === 'daily') {
          actualValue = grammar.filter((g) => g.date_added === todayStr && g.status === 'Completed').length;
        } else {
          actualValue = grammar.filter((g) => g.status === 'Completed').length;
        }
      } else if (goal.measurement_type === 'sessions') {
        actualValue = relevantSessions.length;
      }

      const percentage = Math.min(100, Math.round((actualValue / goal.target_value) * 100));
      const remaining = Math.max(0, goal.target_value - actualValue);
      const isCompleted = actualValue >= goal.target_value;

      return {
        ...goal,
        actualValue,
        percentage,
        remaining,
        isCompleted,
      };
    });
  }, [goals, sessions, vocabulary, grammar]);

  // Tab filter
  const filteredGoals = useMemo(() => {
    if (activeTab === 'all') return enrichedGoals;
    return enrichedGoals.filter((g) => g.goal_type === activeTab);
  }, [enrichedGoals, activeTab]);

  // Overall goal success statistics
  const goalStats = useMemo(() => {
    const total = enrichedGoals.length;
    const completed = enrichedGoals.filter((g) => g.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 100;

    const dailyGoals = enrichedGoals.filter((g) => g.goal_type === 'daily');
    const dailyRate = dailyGoals.length > 0 
      ? Math.round((dailyGoals.filter((g) => g.isCompleted).length / dailyGoals.length) * 100)
      : 100;

    const weeklyGoals = enrichedGoals.filter((g) => g.goal_type === 'weekly');
    const weeklyRate = weeklyGoals.length > 0
      ? Math.round((weeklyGoals.filter((g) => g.isCompleted).length / weeklyGoals.length) * 100)
      : 100;

    const monthlyGoals = enrichedGoals.filter((g) => g.goal_type === 'monthly');
    const monthlyRate = monthlyGoals.length > 0
      ? Math.round((monthlyGoals.filter((g) => g.isCompleted).length / monthlyGoals.length) * 100)
      : 100;

    return { total, completed, rate, dailyRate, weeklyRate, monthlyRate };
  }, [enrichedGoals]);

  const openAddModal = () => {
    setEditingGoal(null);
    setName('');
    setDescription('');
    setGoalType('daily');
    setTargetValue(45);
    setMeasurementType('minutes');
    setSkill('All');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setDescription(goal.description || '');
    setGoalType(goal.goal_type);
    setTargetValue(goal.target_value);
    setMeasurementType(goal.measurement_type);
    setSkill(goal.skill || 'All');
    setStartDate(goal.start_date);
    setEndDate(goal.end_date || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a goal name.');
      return;
    }

    if (Number(targetValue) <= 0) {
      setError('Target value must be greater than zero.');
      return;
    }

    if (editingGoal) {
      await updateGoal({
        ...editingGoal,
        name: name.trim(),
        description: description.trim() || undefined,
        goal_type: goalType,
        target_value: Number(targetValue),
        measurement_type: measurementType,
        frequency: goalType,
        skill,
        start_date: startDate,
        end_date: endDate || undefined,
      });
    } else {
      await addGoal({
        user_id: user?.id || 'demo-user',
        name: name.trim(),
        description: description.trim() || undefined,
        goal_type: goalType,
        target_value: Number(targetValue),
        measurement_type: measurementType,
        frequency: goalType,
        skill,
        start_date: startDate,
        end_date: endDate || undefined,
        is_active: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Goals & Milestones
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Establish disciplined daily, weekly, and monthly targets with automatic progress calculation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => ExportService.exportGoalsCSV(goals, profile?.language || 'Language')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2] hover:bg-[#EFE7DF] dark:bg-[#203128] dark:hover:bg-[#2A3F33] text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] shadow-xs"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create Goal
          </button>
        </div>
      </div>

      {/* Goal Success Rates Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Overall Completion Rate
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {goalStats.rate}%
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            {goalStats.completed} of {goalStats.total} goals met
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Daily Goal Rate
          </span>
          <span className="text-2xl font-bold font-editorial text-[#755744] dark:text-[#A7BDA9]">
            {goalStats.dailyRate}%
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Today's goals
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Weekly Success Rate
          </span>
          <span className="text-2xl font-bold font-editorial text-emerald-700 dark:text-emerald-400">
            {goalStats.weeklyRate}%
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Current calendar week
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Monthly Success Rate
          </span>
          <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            {goalStats.monthlyRate}%
          </span>
          <span className="text-[10px] text-[#766456] dark:text-[#9CB29F] block mt-1">
            Current calendar month
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4D7CC] dark:border-[#2C4236] pb-2 overflow-x-auto">
        {(['all', 'daily', 'weekly', 'monthly', 'custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-[#755744] text-white dark:bg-[#3F6650] shadow-xs'
                : 'text-[#766456] dark:text-[#9CB29F] hover:bg-[#EFE7DF] dark:hover:bg-[#203128]'
            }`}
          >
            {tab === 'all' ? 'All Goals' : `${tab} Goals`}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found in this view"
          description="Create a daily study-time goal, weekly immersion quota, or vocabulary milestone."
          actionText="Create Goal"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-5 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-1">
                      {goal.goal_type} goal · {goal.skill || 'All Skills'}
                    </span>
                    <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                      {goal.name}
                    </h3>
                  </div>
                  <Badge variant={goal.isCompleted ? 'status' : 'default'} value={goal.isCompleted ? 'mastered' : 'learning'}>
                    {goal.isCompleted ? 'Target Achieved' : 'In Progress'}
                  </Badge>
                </div>

                {goal.description && (
                  <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-4">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar & Numeric Comparison */}
                <div className="space-y-2 my-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#352820] dark:text-[#E8F0E8]">
                      Actual: {goal.actualValue} {goal.measurement_type}
                    </span>
                    <span className="text-[#766456] dark:text-[#9CB29F]">
                      Target: {goal.target_value} {goal.measurement_type} ({goal.percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#EFE7DF] dark:bg-[#17251D] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.isCompleted
                          ? 'bg-emerald-600 dark:bg-emerald-400'
                          : 'bg-[#755744] dark:bg-[#A7BDA9]'
                      }`}
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between text-[11px] text-[#766456] dark:text-[#9CB29F]">
                <span>
                  {goal.isCompleted
                    ? 'Goal successfully reached!'
                    : `${goal.remaining} ${goal.measurement_type} remaining`}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(goal)}
                    className="p-1.5 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-md hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete goal "${goal.name}"?`)) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Learning Goal' : 'Define Target Goal'}
        subtitle="Configure explicit targets to track your immersion momentum."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Daily Spanish Immersion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Maintain active reading and podcast practice every single day"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Cadence / Type *
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="daily">Daily Goal</option>
                <option value="weekly">Weekly Goal</option>
                <option value="monthly">Monthly Goal</option>
                <option value="custom">Custom Goal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Skill Focus
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="All">All Skills</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Speaking">Speaking</option>
                <option value="Writing">Writing</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Grammar">Grammar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Target Value *
              </label>
              <input
                type="number"
                min="1"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Measurement Unit *
              </label>
              <select
                value={measurementType}
                onChange={(e) => setMeasurementType(e.target.value as MeasurementType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="words">Words (Vocabulary)</option>
                <option value="topics">Topics (Grammar)</option>
                <option value="sessions">Study Sessions</option>
              </select>
            </div>
          </div>

          {goalType === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
