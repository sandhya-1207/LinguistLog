import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PlannedActivity, Priority, SkillType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  CalendarCheck2,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  CheckCircle2,
  Square,
  AlertCircle,
  Filter,
  CheckSquare
} from 'lucide-react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

export const StudyPlanner: React.FC = () => {
  const { user } = useAuth();
  const {
    planned,
    sessions,
    addPlannedActivity,
    updatePlannedActivity,
    deletePlannedActivity,
    toggleActivityCompletion,
  } = useData();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannedActivity | null>(null);

  // Form fields
  const [activity, setActivity] = useState('');
  const [skill, setSkill] = useState<SkillType>('Reading');
  const [plannedDate, setPlannedDate] = useState(selectedDate);
  const [plannedDuration, setPlannedDuration] = useState(30);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const openAddModal = (dateStr?: string) => {
    setEditingItem(null);
    setActivity('');
    setSkill('Reading');
    setPlannedDate(dateStr || selectedDate);
    setPlannedDuration(30);
    setPriority('Medium');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PlannedActivity) => {
    setEditingItem(item);
    setActivity(item.activity);
    setSkill(item.skill);
    setPlannedDate(item.planned_date);
    setPlannedDuration(item.planned_duration);
    setPriority(item.priority);
    setNotes(item.notes || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      setError('Please provide an activity name.');
      return;
    }

    if (editingItem) {
      await updatePlannedActivity({
        ...editingItem,
        activity: activity.trim(),
        skill,
        planned_date: plannedDate,
        planned_duration: Number(plannedDuration) || 30,
        priority,
        notes: notes.trim() || undefined,
      });
    } else {
      await addPlannedActivity({
        user_id: user?.id || 'demo-user',
        activity: activity.trim(),
        skill,
        planned_date: plannedDate,
        planned_duration: Number(plannedDuration) || 30,
        priority,
        notes: notes.trim() || undefined,
        completed: false,
      });
    }

    setIsModalOpen(false);
  };

  // Filter planned activities for selected date
  const filteredPlanned = useMemo(() => {
    return planned.filter((item) => {
      const matchDate = item.planned_date === selectedDate;
      const matchPriority = filterPriority === 'all' || item.priority.toLowerCase() === filterPriority.toLowerCase();
      const matchSkill = filterSkill === 'all' || item.skill === filterSkill;
      return matchDate && matchPriority && matchSkill;
    });
  }, [planned, selectedDate, filterPriority, filterSkill]);

  // Actual completed study sessions on the selected date for Planned vs Completed comparison
  const completedSessionsForDate = useMemo(() => {
    return sessions.filter((s) => s.study_date === selectedDate);
  }, [sessions, selectedDate]);

  const plannedTotalMinutes = filteredPlanned.reduce((sum, item) => sum + item.planned_duration, 0);
  const completedSessionMinutes = completedSessionsForDate.reduce((sum, s) => sum + s.duration_minutes, 0);

  // Quick 7-day strip
  const dateStrip = useMemo(() => {
    const list: { dateStr: string; label: string; dayNum: string; isToday: boolean }[] = [];
    const base = new Date();
    for (let i = -2; i <= 4; i++) {
      const d = addDays(base, i);
      const str = format(d, 'yyyy-MM-dd');
      list.push({
        dateStr: str,
        label: format(d, 'EEE'),
        dayNum: format(d, 'd'),
        isToday: isSameDay(d, base),
      });
    }
    return list;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Study Planner
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
            Organize and schedule your daily learning activities and check off milestones.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Plan Activity
        </button>
      </div>

      {/* Date Strip Navigator */}
      <div className="p-4 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {dateStrip.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-2xl border transition-all ${
                selectedDate === item.dateStr
                  ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650] shadow-sm font-bold'
                  : 'bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] border-[#E4D7CC] dark:border-[#2C4236] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {item.label}
              </span>
              <span className="text-base font-bold">
                {item.dayNum}
              </span>
              {item.isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* Custom date picker */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#766456] dark:text-[#9CB29F]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs font-semibold focus:outline-none"
          />
        </div>
      </div>

      {/* Planned vs Completed Comparison Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Planned Activities
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
              {filteredPlanned.filter((p) => p.completed).length} / {filteredPlanned.length}
            </span>
            <span className="text-xs text-[#766456] dark:text-[#9CB29F]">items checked</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Target Planned Time
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-editorial text-[#755744] dark:text-[#A7BDA9]">
              {plannedTotalMinutes}
            </span>
            <span className="text-xs text-[#766456] dark:text-[#9CB29F]">minutes planned</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs">
          <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
            Actual Recorded Study
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-editorial text-emerald-700 dark:text-emerald-400">
              {completedSessionMinutes}
            </span>
            <span className="text-xs text-[#766456] dark:text-[#9CB29F]">
              min in {completedSessionsForDate.length} session{completedSessionsForDate.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist and Action List */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60 gap-3">
          <h3 className="text-lg font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#755744] dark:text-[#A7BDA9]" />
            Daily Checklist for {selectedDate}
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
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
        </div>

        {filteredPlanned.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={`No activities planned for ${selectedDate}`}
              description="Plan your practice session, chapter readings, or conversation exchanges."
              actionText="Add Planned Activity"
              onAction={() => openAddModal()}
            />
          </div>
        ) : (
          <div className="divide-y divide-[#E4D7CC]/60 dark:divide-[#2C4236]/60 mt-2">
            {filteredPlanned.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleActivityCompletion(item.id)}
                    className="mt-0.5 text-[#755744] dark:text-[#A7BDA9] hover:scale-110 transition-transform"
                    title={item.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Square className="w-5 h-5 text-[#766456] dark:text-[#9CB29F]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          item.completed
                            ? 'line-through text-[#766456] dark:text-[#9CB29F]'
                            : 'text-[#352820] dark:text-[#E8F0E8]'
                        }`}
                      >
                        {item.activity}
                      </span>
                      <Badge variant="skill" value={item.skill}>
                        {item.skill}
                      </Badge>
                      <Badge variant="priority" value={item.priority}>
                        {item.priority}
                      </Badge>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[#766456] dark:text-[#9CB29F] mt-1">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="text-xs font-semibold text-[#766456] dark:text-[#9CB29F] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.planned_duration} min
                  </span>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-lg hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]"
                    title="Edit activity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePlannedActivity(item.id)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Planned Activity' : 'Schedule Study Activity'}
        subtitle="Set clear intentions and targets for your study session."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Activity Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 15 pages of novel and note unknown idioms"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Skill Area
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as SkillType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="Speaking">Speaking</option>
                <option value="Writing">Writing</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Grammar">Grammar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Planned Date *
              </label>
              <input
                type="date"
                required
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Planned Duration (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={plannedDuration}
                onChange={(e) => setPlannedDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Notes / Resource Links (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on paragraph structure, Chapter 4 vocabulary list"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
            />
          </div>

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
              {editingItem ? 'Update Activity' : 'Save Planned Activity'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
