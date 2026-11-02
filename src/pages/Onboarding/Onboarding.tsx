import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CEFRLevel, UserProfile } from '../../types';
import { format } from 'date-fns';
import { Sparkles, ArrowRight, Globe, Award, Target, Calendar, Clock, BookOpen, Layers } from 'lucide-react';

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const COMMON_LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Italian',
  'Mandarin Chinese',
  'Portuguese',
  'Russian',
  'Korean',
  'Arabic',
  'Dutch',
  'Swedish',
  'Other'
];

export const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const { saveProfile, profile } = useData();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.user_metadata?.full_name || profile?.name || '');
  const [language, setLanguage] = useState(profile?.language || 'Spanish');
  const [customLanguage, setCustomLanguage] = useState('');
  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>(profile?.current_level || 'A2');
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(profile?.target_level || 'B2');
  const [startDate, setStartDate] = useState(profile?.learning_start_date || format(new Date(), 'yyyy-MM-dd'));
  const [dailyMins, setDailyMins] = useState(profile?.daily_study_goal_minutes || 45);
  const [dailyVocab, setDailyVocab] = useState(profile?.daily_vocab_goal || 8);
  const [dailyGrammar, setDailyGrammar] = useState(profile?.daily_grammar_goal || 1);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const finalLanguage = language === 'Other' ? (customLanguage.trim() || 'Language') : language;

    const newProfile: UserProfile = {
      id: user?.id || 'demo-user',
      name: name.trim() || 'Learner',
      language: finalLanguage,
      current_level: currentLevel,
      target_level: targetLevel,
      learning_start_date: startDate,
      daily_study_goal_minutes: Number(dailyMins) || 30,
      daily_vocab_goal: Number(dailyVocab) || 5,
      daily_grammar_goal: Number(dailyGrammar) || 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      updated_at: new Date().toISOString(),
    };

    await saveProfile(newProfile);
    setSaving(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 bg-[#F5EFE7] dark:bg-[#17251D] flex items-center justify-center transition-colors">
      <div className="w-full max-w-2xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] rounded-3xl p-6 sm:p-10 shadow-elevated">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#755744] dark:bg-[#3F6650] mx-auto flex items-center justify-center text-white mb-3 shadow-subtle">
            <Sparkles className="w-6 h-6 text-[#C8AD96] dark:text-[#A7BDA9]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
            Set Up Your Language Tracker
          </h1>
          <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1.5 max-w-md mx-auto">
            Configure your single focus language, starting baseline, and personal daily targets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Learner Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1.5">
              Learner Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          </div>

          {/* Focus Language */}
          <div className="p-4 rounded-2xl bg-[#F5EFE7]/60 dark:bg-[#17251D]/60 border border-[#E4D7CC]/80 dark:border-[#2C4236]/80">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#755744] dark:text-[#A7BDA9]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#352820] dark:text-[#E8F0E8]">
                Target Language
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    language === lang
                      ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650] shadow-xs'
                      : 'bg-[#FFFDF9] dark:bg-[#203128] text-[#352820] dark:text-[#E8F0E8] border-[#E4D7CC] dark:border-[#2C4236] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {language === 'Other' && (
              <div className="mt-3">
                <input
                  type="text"
                  required
                  placeholder="Specify your target language (e.g. Finnish, Greek)"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* CEFR Level Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current CEFR Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Current CEFR Level *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {CEFR_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCurrentLevel(lvl)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      currentLevel === lvl
                        ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650]'
                        : 'bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] border-[#E4D7CC] dark:border-[#2C4236]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Target CEFR Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Target CEFR Level *
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {CEFR_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      targetLevel === lvl
                        ? 'bg-[#755744] text-white border-[#755744] dark:bg-[#3F6650] dark:border-[#3F6650]'
                        : 'bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] border-[#E4D7CC] dark:border-[#2C4236]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Start Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Learning Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-[#352820] dark:text-[#E8F0E8] text-sm focus:outline-none focus:ring-2 focus:ring-[#755744] dark:focus:ring-[#A7BDA9]"
            />
          </div>

          {/* Daily Goals Triad */}
          <div className="p-4 rounded-2xl bg-[#F5EFE7]/60 dark:bg-[#17251D]/60 border border-[#E4D7CC]/80 dark:border-[#2C4236]/80">
            <span className="text-xs font-bold uppercase tracking-wider text-[#352820] dark:text-[#E8F0E8] block mb-3">
              Daily Target Baseline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#766456] dark:text-[#9CB29F] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Study Time (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={dailyMins}
                  onChange={(e) => setDailyMins(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#766456] dark:text-[#9CB29F] mb-1 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Vocabulary Words
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={dailyVocab}
                  onChange={(e) => setDailyVocab(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#766456] dark:text-[#9CB29F] mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Grammar Topics
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={dailyGrammar}
                  onChange={(e) => setDailyGrammar(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-base font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? 'Initializing Tracker...' : 'Enter Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
