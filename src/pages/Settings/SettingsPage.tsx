import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { ExportService } from '../../services/exportService';
import { NotificationService } from '../../services/notificationService';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Download,
  FileText,
  LogOut,
  RefreshCw,
  Trash2,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export const SettingsPage: React.FC = () => {
  const { user, signOut, isDemo } = useAuth();
  const {
    profile,
    sessions,
    vocabulary,
    grammar,
    skills,
    goals,
    streak,
    settings,
    updateUserSettings,
    loadSampleData,
    clearData,
  } = useData();

  const { theme, toggleTheme } = useTheme();

  // PDF report date range state
  const [reportStartDate, setReportStartDate] = useState(profile?.learning_start_date || format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [reportEndDate, setReportEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Notification states
  const [notifStatus, setNotifStatus] = useState(NotificationService.getStatus());
  const [reminderStreak, setReminderStreak] = useState(settings?.reminder_streak ?? true);
  const [reminderGoal, setReminderGoal] = useState(settings?.reminder_daily_goal ?? true);
  const [statusMsg, setStatusMsg] = useState('');

  const handleToggleNotifications = async () => {
    if (!notifStatus.isSupported) {
      alert('Browser notifications are not supported in this browser.');
      return;
    }

    if (notifStatus.permission !== 'granted') {
      const permission = await NotificationService.requestPermission();
      setNotifStatus(NotificationService.getStatus());
      if (permission === 'granted') {
        if (settings) {
          await updateUserSettings({ ...settings, notifications_enabled: true });
        }
        setStatusMsg('Browser notifications granted.');
      }
    } else {
      const current = settings?.notifications_enabled ?? false;
      if (settings) {
        await updateUserSettings({ ...settings, notifications_enabled: !current });
      }
      setStatusMsg(`Notifications ${!current ? 'enabled' : 'disabled'}.`);
    }

    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSaveReminderPreferences = async () => {
    if (settings) {
      await updateUserSettings({
        ...settings,
        reminder_streak: reminderStreak,
        reminder_daily_goal: reminderGoal,
      });
      setStatusMsg('Reminder preferences updated.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleGeneratePDF = () => {
    if (!profile) return;
    setGeneratingPDF(true);

    // Filter sessions to report range
    const filteredSessions = sessions.filter(
      (s) => s.study_date >= reportStartDate && s.study_date <= reportEndDate
    );

    ExportService.generatePDFReport({
      profile,
      sessions: filteredSessions,
      vocabulary,
      grammar,
      skills,
      goals,
      streak,
      startDate: reportStartDate,
      endDate: reportEndDate,
    });

    setGeneratingPDF(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#352820] dark:text-[#E8F0E8]">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#766456] dark:text-[#9CB29F] mt-1">
          Manage application themes, notifications, data exports, and account connectivity.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* 1. APPEARANCE & THEME */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <h2 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
          Theme & Visual Aesthetic
        </h2>
        <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-4">
          Switch between the cozy Mocha light aesthetic and tranquil Forest green dark mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (theme !== 'light') toggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'light'
                ? 'bg-[#EFE7DF] border-[#755744] text-[#352820] shadow-xs ring-1 ring-[#755744]'
                : 'bg-[#FFFDF9] dark:bg-[#1D2D23] border-[#E4D7CC] dark:border-[#2C4236] text-[#766456] dark:text-[#9CB29F]'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#FFF9F2] flex items-center justify-center text-[#755744] shadow-xs">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold block">Mocha Light</span>
              <span className="text-xs opacity-80 mt-0.5 block">
                Warm cream, latte beige, espresso accents, taupe borders
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'dark'
                ? 'bg-[#2A3F33] border-[#3F6650] text-[#E8F0E8] shadow-xs ring-1 ring-[#3F6650]'
                : 'bg-[#FFFDF9] dark:bg-[#1D2D23] border-[#E4D7CC] dark:border-[#2C4236] text-[#766456] dark:text-[#9CB29F]'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#17251D] flex items-center justify-center text-[#A7BDA9] shadow-xs">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold block">Forest Green Dark</span>
              <span className="text-xs opacity-80 mt-0.5 block">
                Deep forest green, moss, sage accents, charcoal surfaces
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. DATA EXPORT & PDF REPORT GENERATION */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <h2 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
          Export & Comprehensive Reports
        </h2>
        <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-5">
          Generate production-quality PDF dossiers or download Excel-compatible CSV archives.
        </p>

        {/* PDF Generator Card */}
        <div className="p-5 rounded-2xl bg-[#F5EFE7]/80 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#755744] dark:bg-[#3F6650] text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#352820] dark:text-[#E8F0E8]">
                Downloadable PDF Progress Dossier
              </h3>
              <p className="text-xs text-[#766456] dark:text-[#9CB29F]">
                Includes user profile, study history, four skills breakdown, vocabulary, and goals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Report Period From
              </label>
              <input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] mb-1">
                Report Period To
              </label>
              <input
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGeneratePDF}
            disabled={generatingPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Download className="w-4 h-4" />
            {generatingPDF ? 'Generating PDF...' : 'Download PDF Progress Report'}
          </button>
        </div>

        {/* CSV Quick Exports */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#766456] dark:text-[#9CB29F] block mb-3">
            Direct CSV / Spreadsheet Archives
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => ExportService.exportSessionsCSV(sessions, profile?.language)}
              className="p-3 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-xs font-semibold text-left transition-colors"
            >
              Study Sessions ({sessions.length})
            </button>
            <button
              onClick={() => ExportService.exportVocabularyCSV(vocabulary, profile?.language)}
              className="p-3 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-xs font-semibold text-left transition-colors"
            >
              Vocabulary ({vocabulary.length})
            </button>
            <button
              onClick={() => ExportService.exportGrammarCSV(grammar, profile?.language)}
              className="p-3 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-xs font-semibold text-left transition-colors"
            >
              Grammar Topics ({grammar.length})
            </button>
            <button
              onClick={() => ExportService.exportGoalsCSV(goals, profile?.language)}
              className="p-3 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-xs font-semibold text-left transition-colors"
            >
              Goals ({goals.length})
            </button>
          </div>
        </div>
      </div>

      {/* 3. REMINDERS & NOTIFICATION PREFERENCES */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <h2 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
          Reminders & Notification Rules
        </h2>
        <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-4">
          Non-intrusive alerts to protect streaks and remind you of daily targets.
        </p>

        <div className="space-y-4">
          {/* Browser Permission Control */}
          <div className="p-4 rounded-2xl bg-[#F5EFE7]/80 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EFE7DF] dark:bg-[#2A3F33] flex items-center justify-center text-[#755744] dark:text-[#A7BDA9]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8] block">
                  Browser Push Notifications
                </span>
                <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                  Current status: {notifStatus.isSupported ? notifStatus.permission : 'Not supported in browser'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleNotifications}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                settings?.notifications_enabled
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-[#FFFDF9] dark:bg-[#203128] text-[#352820] dark:text-[#E8F0E8] border-[#E4D7CC] dark:border-[#2C4236]'
              }`}
            >
              {settings?.notifications_enabled ? 'Enabled' : 'Enable Notifications'}
            </button>
          </div>

          {/* Toggle preferences */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4D7CC]/70 dark:border-[#2C4236]/70 bg-[#FFFDF9] dark:bg-[#1D2D23] cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] block">
                  Daily Streak Protection Alert
                </span>
                <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                  Notifies you if today's study session has not yet been recorded.
                </span>
              </div>
              <input
                type="checkbox"
                checked={reminderStreak}
                onChange={(e) => setReminderStreak(e.target.checked)}
                className="w-4 h-4 accent-[#755744] dark:accent-[#3F6650]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-[#E4D7CC]/70 dark:border-[#2C4236]/70 bg-[#FFFDF9] dark:bg-[#1D2D23] cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] block">
                  Daily Target Remaining Alert
                </span>
                <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                  Notifies you of minutes left to reach your daily study goal.
                </span>
              </div>
              <input
                type="checkbox"
                checked={reminderGoal}
                onChange={(e) => setReminderGoal(e.target.checked)}
                className="w-4 h-4 accent-[#755744] dark:accent-[#3F6650]"
              />
            </label>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveReminderPreferences}
              className="px-4 py-2 rounded-xl bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] text-white text-xs font-semibold"
            >
              Save Reminder Rules
            </button>
          </div>
        </div>
      </div>

      {/* 4. BACKEND & DEMO DATA MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle">
        <h2 className="text-base font-bold font-editorial text-[#352820] dark:text-[#E8F0E8] mb-1">
          Backend Connectivity & Local Storage
        </h2>
        <p className="text-xs text-[#766456] dark:text-[#9CB29F] mb-4">
          Supabase PostgreSQL integration status and sample demonstration control.
        </p>

        <div className="p-4 rounded-2xl bg-[#F5EFE7]/80 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isSupabaseConfigured ? (
              <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
            <div>
              <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8] block">
                {isSupabaseConfigured ? 'Supabase Cloud Connected' : 'Local Storage Mode Active'}
              </span>
              <span className="text-[11px] text-[#766456] dark:text-[#9CB29F]">
                {isSupabaseConfigured
                  ? 'Authenticated sessions and Row Level Security active.'
                  : 'All CRUD operations are fully persisted locally in your browser.'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('Reload demonstration sample dataset?')) {
                loadSampleData();
                setStatusMsg('Loaded demonstration sample data.');
                setTimeout(() => setStatusMsg(''), 3000);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFFDF9] dark:bg-[#1D2D23] hover:bg-[#EFE7DF] dark:hover:bg-[#2A3F33] text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#755744] dark:text-[#A7BDA9]" />
            Reload Sample Data
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all local records and reset to clean blank state?')) {
                clearData();
                setStatusMsg('Cleared all data.');
                setTimeout(() => setStatusMsg(''), 3000);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 text-rose-700 dark:text-rose-300 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Local Data
          </button>
        </div>
      </div>

      {/* 5. ACCOUNT & LOGOUT */}
      <div className="p-6 rounded-3xl bg-[#FFF9F2] dark:bg-[#203128] border border-[#E4D7CC] dark:border-[#2C4236] shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#352820] dark:text-[#E8F0E8] block">
            Account Session
          </span>
          <span className="text-xs text-[#766456] dark:text-[#9CB29F]">
            Logged in as {user?.email || 'Elena Vance'} ({isDemo ? 'Demo Mode' : 'Cloud Session'})
          </span>
        </div>

        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};
