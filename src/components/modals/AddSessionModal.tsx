import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SkillType, StudySession } from '../../types';
import { format } from 'date-fns';
import { Clock, BookOpen, AlertCircle } from 'lucide-react';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSession?: StudySession | null;
}

const COMMON_ACTIVITIES: Record<SkillType, string[]> = {
  Reading: ['Book Chapter', 'News Article', 'Graded Reader', 'Online Forum / Reddit', 'Short Story'],
  Listening: ['Native Podcast', 'Audiobook', 'TV Show / Movie', 'Music & Lyrics', 'News Broadcast'],
  Speaking: ['Language Exchange Call', 'Tutor Session', 'Self-Talk & Monologue', 'Shadowing Audio', 'Pronunciation Drills'],
  Writing: ['Daily Journal Entry', 'Grammar Essay', 'Short Story Paragraph', 'Social Media Post', 'Dictation Exercise'],
  Vocabulary: ['Spaced Repetition Review', 'Vocabulary Notebook Notes', 'Word Association Map', 'Collocation Practice'],
  Grammar: ['Grammar Textbook Chapter', 'Conjugation Drills', 'Syntax Exercise', 'Sentence Decomposition'],
};

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  initialSession,
}) => {
  const { user } = useAuth();
  const { addSession, updateSession } = useData();

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationHours, setDurationHours] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [skill, setSkill] = useState<SkillType>('Reading');
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSession) {
      setDate(initialSession.study_date);
      setStartTime(initialSession.start_time || '');
      setEndTime(initialSession.end_time || '');
      const hours = Math.floor(initialSession.duration_minutes / 60);
      const mins = initialSession.duration_minutes % 60;
      setDurationHours(String(hours));
      setDurationMinutes(String(mins));
      setSkill(initialSession.skill);
      setNotes(initialSession.notes || '');

      const presets = COMMON_ACTIVITIES[initialSession.skill] || [];
      if (presets.includes(initialSession.activity)) {
        setActivity(initialSession.activity);
        setIsCustomActivity(false);
      } else {
        setIsCustomActivity(true);
        setCustomActivity(initialSession.activity);
      }
    } else {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('');
      setEndTime('');
      setDurationHours('0');
      setDurationMinutes('30');
      setSkill('Reading');
      setActivity(COMMON_ACTIVITIES['Reading'][0]);
      setIsCustomActivity(false);
      setCustomActivity('');
      setNotes('');
      setError('');
    }
  }, [initialSession, isOpen]);

  // Recalculate duration automatically when startTime or endTime change
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
        let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (diffMinutes < 0) {
          // Crosses midnight
          diffMinutes += 24 * 60;
        }
        if (diffMinutes > 0) {
          setDurationHours(String(Math.floor(diffMinutes / 60)));
          setDurationMinutes(String(diffMinutes % 60));
        }
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalActivity = isCustomActivity ? customActivity.trim() : activity;
    if (!finalActivity) {
      setError('Please choose or enter an activity description.');
      return;
    }

    const totalMinutes = (Number(durationHours) || 0) * 60 + (Number(durationMinutes) || 0);
    if (totalMinutes <= 0) {
      setError('Session duration must be greater than 0 minutes.');
      return;
    }

    setSaving(true);
    try {
      if (initialSession) {
        await updateSession({
          ...initialSession,
          study_date: date,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          duration_minutes: totalMinutes,
          activity: finalActivity,
          skill,
          notes: notes.trim() || undefined,
        });
      } else {
        await addSession({
          user_id: user?.id || 'demo-user',
          study_date: date,
          start_time: startTime || undefined,
          end_time: endTime || undefined,
          duration_minutes: totalMinutes,
          activity: finalActivity,
          skill,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save study session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSession ? 'Edit Study Session' : 'Record Study Session'}
      subtitle="Manually track your focused language activity and update progress."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Study Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          </div>

          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
              Skill Focus *
            </label>
            <select
              value={skill}
              onChange={(e) => {
                const newSkill = e.target.value as SkillType;
                setSkill(newSkill);
                if (!isCustomActivity) {
                  setActivity(COMMON_ACTIVITIES[newSkill][0]);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            >
              <option value="Reading">Reading</option>
              <option value="Listening">Listening</option>
              <option value="Speaking">Speaking</option>
              <option value="Writing">Writing</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Grammar">Grammar</option>
            </select>
          </div>
        </div>

        {/* Start & End Times (Optional for auto-calculation) */}
        <div className="p-3.5 rounded-xl bg-[#F5EFE7]/60 dark:bg-[#17251D]/60 border border-[#E4D7CC]/80 dark:border-[#2C4236]/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#755744] dark:text-[#A7BDA9]" />
              Time & Duration Calculation
            </span>
            <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
              Auto calculates or enter duration directly
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#766456] dark:text-[#9CB29F] mb-0.5">
                Start Time (Optional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#766456] dark:text-[#9CB29F] mb-0.5">
                End Time (Optional)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Duration in Hours and Minutes */}
          <div className="pt-2 border-t border-[#E4D7CC]/50 dark:border-[#2C4236]/50">
            <label className="block text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] mb-1">
              Recorded Duration *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm"
                />
                <span className="text-xs text-[#766456] dark:text-[#9CB29F]">hrs</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm"
                />
                <span className="text-xs text-[#766456] dark:text-[#9CB29F]">mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Selection or Custom */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F]">
              Activity *
            </label>
            <button
              type="button"
              onClick={() => setIsCustomActivity(!isCustomActivity)}
              className="text-xs text-[#755744] dark:text-[#A7BDA9] font-medium hover:underline"
            >
              {isCustomActivity ? 'Choose from presets' : 'Enter custom activity'}
            </button>
          </div>

          {isCustomActivity ? (
            <input
              type="text"
              placeholder="e.g. Watched documentary on nature with Spanish audio"
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          ) : (
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            >
              {(COMMON_ACTIVITIES[skill] || []).map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
            Personal Reflection & Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key takeaways, difficult sentences, or reflections..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
          />
        </div>

        {/* Submit button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Saving...' : initialSession ? 'Update Session' : 'Save Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
