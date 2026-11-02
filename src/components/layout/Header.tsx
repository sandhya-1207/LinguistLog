import React from 'react';
import { Menu, Plus, Sparkles, Cloud, Database } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenLogModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenLogModal }) => {
  const { user, isDemo } = useAuth();
  const { profile } = useData();

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#F5EFE7]/90 dark:bg-[#17251D]/90 backdrop-blur-md border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60 flex items-center justify-between px-4 sm:px-8">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] hover:bg-[#EFE7DF] dark:hover:bg-[#203128] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F]">
            Personal Progress Tracker
          </span>
          <h2 className="text-base font-bold text-[#352820] dark:text-[#E8F0E8]">
            {profile?.language ? `${profile.language} Journey` : 'Language Dashboard'}
          </h2>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend status indicator */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2] dark:bg-[#203128] text-[#766456] dark:text-[#9CB29F]"
          title={isSupabaseConfigured ? 'Connected to live Supabase backend with Row Level Security' : 'Local Storage Mode: Fully functional offline. Connect Supabase credentials in .env to sync with cloud.'}
        >
          {isSupabaseConfigured ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Supabase RLS</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Local Workspace</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Primary Action: Manual Log Study Session */}
        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Log Session</span>
          <span className="sm:hidden">Log</span>
        </button>
      </div>
    </header>
  );
};
