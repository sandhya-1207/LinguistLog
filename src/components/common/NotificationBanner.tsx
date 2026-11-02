import React, { useState, useEffect } from 'react';
import { Flame, Target, X, Database } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const NotificationBanner: React.FC = () => {
  const { streak, todayStats, settings } = useData();
  const { isDemo } = useAuth();
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const streakAlert = (!streak.isStudiedToday && streak.currentStreak > 0 && settings?.reminder_streak)
    ? `You have a ${streak.currentStreak}-day streak active. Record your study session today to keep it going!`
    : null;

  const goalAlert = (todayStats.studyMinutes < todayStats.targetMinutes && settings?.reminder_daily_goal && !streak.isStudiedToday)
    ? `Daily Target: ${todayStats.studyMinutes} / ${todayStats.targetMinutes} minutes logged today.`
    : null;

  if (streakAlert && !dismissed['streak']) {
    return (
      <div className="mb-6 p-3.5 px-4 rounded-xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#C8AD96]/60 dark:border-[#3F6650] flex items-center justify-between text-sm shadow-subtle animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="font-semibold text-[#352820] dark:text-[#E8F0E8]">Streak Alert: </span>
            <span className="text-[#766456] dark:text-[#9CB29F]">{streakAlert}</span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(prev => ({ ...prev, streak: true }))}
          className="text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
};
