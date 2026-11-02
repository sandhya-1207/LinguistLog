import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { CEFRLevel, CoreSkill, SkillProgress } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  User,
  Award,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const ALL_CEFR: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const SKILL_ICONS: Record<CoreSkill, any> = {
  Reading: BookOpen,
  Listening: Headphones,
  Speaking: Mic,
  Writing: PenTool,
};

export const ProfilePage: React.FC = () => {
  const {
    profile,
    skills,
    saveProfile,
    updateSkillProgress,
  } = useData();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Modal for editing specific skill
  const [editingSkill, setEditingSkill] = useState<SkillProgress | null>(null);
  const [skillCurrentLevel, setSkillCurrentLevel] = useState<CEFRLevel>('B1');
  const [skillTargetLevel, setSkillTargetLevel] = useState<CEFRLevel>('C1');
  const [skillPercentage, setSkillPercentage] = useState(50);
  const [skillNotes, setSkillNotes] = useState('');

  // Overall CEFR Level Edit
  const [isEditingOverallCEFR, setIsEditingOverallCEFR] = useState(false);
  const [overallCurrent, setOverallCurrent] = useState<CEFRLevel>(profile?.current_level || 'B1');
  const [overallTarget, setOverallTarget] = useState<CEFRLevel>(profile?.target_level || 'C1');

  // Profile fields state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(profile?.name || '');
  const [profileLang, setProfileLang] = useState(profile?.language || 'Spanish');
  const [dailyMins, setDailyMins] = useState(profile?.daily_study_goal_minutes || 30);
  const [dailyVocab, setDailyVocab] = useState(profile?.daily_vocab_goal || 5);
  const [dailyGrammar, setDailyGrammar] = useState(profile?.daily_grammar_goal || 1);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Radar chart data for 4 skills
  const radarData = ['Reading', 'Listening', 'Speaking', 'Writing'].map((sName) => {
    const item = skills.find((s) => s.skill === sName);
    return {
      skill: sName,
      progress: item ? item.progress_percentage : 25,
    };
  });

  const openSkillEdit = (s: SkillProgress) => {
    setEditingSkill(s);
    setSkillCurrentLevel(s.current_level);
    setSkillTargetLevel(s.target_level);
    setSkillPercentage(s.progress_percentage);
    setSkillNotes(s.notes || '');
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    await updateSkillProgress({
      ...editingSkill,
      current_level: skillCurrentLevel,
      target_level: skillTargetLevel,
      progress_percentage: Number(skillPercentage),
      notes: skillNotes.trim() || undefined,
    });

    setEditingSkill(null);
  };

  const handleSaveOverallCEFR = async () => {
    if (!profile) return;
    await saveProfile({
      ...profile,
      current_level: overallCurrent,
      target_level: overallTarget,
    });
    setIsEditingOverallCEFR(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await saveProfile({
      ...profile,
      name: profileName.trim() || profile.name,
      language: profileLang.trim() || profile.language,
      daily_study_goal_minutes: Number(dailyMins) || 30,
      daily_vocab_goal: Number(dailyVocab) || 5,
      daily_grammar_goal: Number(dailyGrammar) || 1,
    });
    setSaving(false);
    setIsEditingProfile(false);
    setSuccessMsg('Profile settings updated successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // CEFR progression calculation
  const currentLevelIndex = ALL_CEFR.indexOf(profile?.current_level || 'A1');
  const targetLevelIndex = ALL_CEFR.indexOf(profile?.target_level || 'C1');

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
          Learner Profile & CEFR Competencies
        </h1>
        <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
          Self-assessed language benchmarks across the four CEFR skill dimensions.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. CEFR LEVEL PROGRESSION JOURNEY */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block mb-1">
              CEFR Framework Alignment
            </span>
            <h2 className="text-xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
              Target Language: {profile?.language || 'Language'}
            </h2>
            <p className="text-xs text-[#766456] dark:text-[#9CB29F] mt-1">
              Self-evaluated European Framework progress. (No automated claims made)
            </p>
          </div>

          <button
            onClick={() => {
              setOverallCurrent(profile?.current_level || 'B1');
              setOverallTarget(profile?.target_level || 'C1');
              setIsEditingOverallCEFR(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-xs font-semibold self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Update CEFR Levels
          </button>
        </div>

        {/* Visual Level Track */}
        <div className="pt-6">
          <div className="grid grid-cols-6 gap-2 sm:gap-4">
            {ALL_CEFR.map((level, idx) => {
              const isPast = idx < currentLevelIndex;
              const isCurrent = idx === currentLevelIndex;
              const isTarget = idx === targetLevelIndex;

              return (
                <div
                  key={level}
                  className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650] shadow-sm'
                      : isTarget
                      ? 'bg-[#C8AD96]/30 text-[#755744] border-[#C8AD96] dark:bg-[#3F6650]/30 dark:text-[#A7BDA9] dark:border-[#3F6650]'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                      : 'bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#766456] dark:text-[#9CB29F] border-[#E4D7CC] dark:border-[#2C4236] opacity-70'
                  }`}
                >
                  <span className="text-lg sm:text-2xl font-bold font-editorial block">
                    {level}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1 block">
                    {isCurrent ? 'Current' : isTarget ? 'Target' : isPast ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. FOUR SKILLS BREAKDOWN & RADAR COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
              Skills Radar Comparison
            </h3>
            <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-4">
              Balance between receptive and productive skills
            </p>
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDark ? '#2C4236' : '#E4D7CC'} />
                  <PolarAngleAxis dataKey="skill" stroke={isDark ? '#9CB29F' : '#766456'} fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#2C4236' : '#E4D7CC'} fontSize={10} />
                  <Radar
                    name="Progress"
                    dataKey="progress"
                    stroke={isDark ? '#3F6650' : '#755744'}
                    fill={isDark ? '#A7BDA9' : '#C8AD96'}
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 text-center text-xs text-[#766456] dark:text-[#9CB29F]">
            Click any skill card on the right to manually update progress percentage and notes.
          </div>
        </div>

        {/* 4 Skill Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['Reading', 'Listening', 'Speaking', 'Writing'] as CoreSkill[]).map((skillName) => {
            const Icon = SKILL_ICONS[skillName];
            const data = skills.find((s) => s.skill === skillName) || {
              id: `skill-${skillName}`,
              user_id: profile?.id || 'demo-user',
              skill: skillName,
              current_level: profile?.current_level || 'B1',
              target_level: profile?.target_level || 'C1',
              progress_percentage: 50,
              notes: 'Regular self-assessment and notes.',
            };

            return (
              <div
                key={skillName}
                onClick={() => openSkillEdit(data)}
                className="p-5 rounded-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#EFE7DF] dark:bg-[#2A3F33] text-[#755744] dark:text-[#A7BDA9] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#352820] dark:text-[#E8F0E8]">
                          {skillName}
                        </h4>
                        <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                          {data.current_level} &rarr; {data.target_level}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#755744] dark:text-[#A7BDA9]">
                      {data.progress_percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#EFE7DF] dark:bg-[#17251D] overflow-hidden mb-3">
                    <div
                      className="h-full bg-[#755744] dark:bg-[#A7BDA9] rounded-full transition-all"
                      style={{ width: `${data.progress_percentage}%` }}
                    />
                  </div>

                  {data.notes && (
                    <p className="text-xs text-[#766456] dark:text-[#9CB29F] line-clamp-2 italic">
                      "{data.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between text-[11px] text-[#755744] dark:text-[#A7BDA9] font-medium group-hover:underline">
                  <span>Manual Self-Assessment</span>
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LEARNER PROFILE DETAILS FORM */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#755744] dark:bg-[#3F6650] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
                Profile & Daily Targets
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Update your display name, language focus, and daily commitments.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs font-semibold"
          >
            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Learner Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Focus Language
                </label>
                <input
                  type="text"
                  required
                  value={profileLang}
                  onChange={(e) => setProfileLang(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Daily Study Minutes
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={dailyMins}
                  onChange={(e) => setDailyMins(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Daily Vocab Words
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={dailyVocab}
                  onChange={(e) => setDailyVocab(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Daily Grammar Topics
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dailyGrammar}
                  onChange={(e) => setDailyGrammar(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#766456] dark:text-[#9CB29F] block">Name:</span>
              <strong className="text-sm text-[#352820] dark:text-[#E8F0E8]">{profile?.name || 'Elena'}</strong>
            </div>
            <div>
              <span className="text-[#766456] dark:text-[#9CB29F] block">Language:</span>
              <strong className="text-sm text-[#352820] dark:text-[#E8F0E8]">{profile?.language || 'Spanish'}</strong>
            </div>
            <div>
              <span className="text-[#766456] dark:text-[#9CB29F] block">Study Goal:</span>
              <strong className="text-sm text-[#352820] dark:text-[#E8F0E8]">{profile?.daily_study_goal_minutes || 30} mins/day</strong>
            </div>
            <div>
              <span className="text-[#766456] dark:text-[#9CB29F] block">Vocab Goal:</span>
              <strong className="text-sm text-[#352820] dark:text-[#E8F0E8]">{profile?.daily_vocab_goal || 5} words/day</strong>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Edit Skill Assessment */}
      {editingSkill && (
        <Modal
          isOpen={Boolean(editingSkill)}
          onClose={() => setEditingSkill(null)}
          title={`Update ${editingSkill.skill} Assessment`}
          subtitle="Record your self-assessed proficiency percentage and observation notes."
        >
          <form onSubmit={handleSaveSkill} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Current CEFR
                </label>
                <select
                  value={skillCurrentLevel}
                  onChange={(e) => setSkillCurrentLevel(e.target.value as CEFRLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                >
                  {ALL_CEFR.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                  Target CEFR
                </label>
                <select
                  value={skillTargetLevel}
                  onChange={(e) => setSkillTargetLevel(e.target.value as CEFRLevel)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                >
                  {ALL_CEFR.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F]">
                  Self-Assessed Progress ({skillPercentage}%)
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skillPercentage}
                onChange={(e) => setSkillPercentage(Number(e.target.value))}
                className="w-full accent-[#755744] dark:accent-[#A7BDA9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Self-Assessment Notes
              </label>
              <textarea
                rows={3}
                value={skillNotes}
                onChange={(e) => setSkillNotes(e.target.value)}
                placeholder="Comfort with native speakers, podcast speed, text genres..."
                className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="px-4 py-2 text-xs font-semibold text-[#766456] dark:text-[#9CB29F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] text-white rounded-xl text-xs font-semibold"
              >
                Save Skill Assessment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Overall CEFR */}
      <Modal
        isOpen={isEditingOverallCEFR}
        onClose={() => setIsEditingOverallCEFR(false)}
        title="Update Overall CEFR Levels"
        subtitle="Manually update your current and target language proficiency."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1.5">
              Current CEFR Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CEFR.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setOverallCurrent(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    overallCurrent === lvl
                      ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650]'
                      : 'bg-[#FFFDF9] dark:bg-[#1D2D23] border-[#E4D7CC] dark:border-[#2C4236]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1.5">
              Target CEFR Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CEFR.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setOverallTarget(lvl)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    overallTarget === lvl
                      ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650]'
                      : 'bg-[#FFFDF9] dark:bg-[#1D2D23] border-[#E4D7CC] dark:border-[#2C4236]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditingOverallCEFR(false)}
              className="px-4 py-2 text-xs font-semibold text-[#766456] dark:text-[#9CB29F]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOverallCEFR}
              className="px-5 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] text-white rounded-xl text-xs font-semibold"
            >
              Update Levels
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
