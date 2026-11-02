import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck2,
  BookOpenCheck,
  Languages,
  BookText,
  Target,
  BarChart3,
  CalendarDays,
  User,
  Settings,
  Flame,
  Award,
  Sparkles,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile, streak } = useData();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Study Planner', path: '/planner', icon: CalendarCheck2 },
    { name: 'Study Log', path: '/study-log', icon: BookOpenCheck },
    { name: 'Vocabulary Tracker', path: '/vocabulary', icon: Languages },
    { name: 'Grammar Tracker', path: '/grammar', icon: BookText },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Profile & Skills', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#352820]/40 dark:bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#FFF9F2] dark:bg-[#203128] border-r border-[#E4D7CC] dark:border-[#2C4236] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#E4D7CC]/60 dark:border-[#2C4236]/60">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-[#755744] dark:bg-[#3F6650] flex items-center justify-center text-white shadow-subtle">
              <Sparkles className="w-5 h-5 text-[#C8AD96] dark:text-[#A7BDA9]" />
            </div>
            <div>
              <span className="text-lg font-bold font-editorial tracking-tight text-[#352820] dark:text-[#E8F0E8] block leading-none">
                LinguistLog
              </span>
              <span className="text-[11px] font-medium text-[#766456] dark:text-[#9CB29F] tracking-wide uppercase mt-1 block">
                Progress Tracker
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#766456] hover:text-[#352820] dark:text-[#9CB29F] dark:hover:text-[#E8F0E8] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Language Pill */}
        {profile && (
          <div className="px-5 py-3 mx-4 my-3 rounded-xl bg-[#F5EFE7] dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236]/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#766456] dark:text-[#9CB29F] block">
                Tracking Language
              </span>
              <span className="text-sm font-bold text-[#352820] dark:text-[#E8F0E8]">
                {profile.language || 'Language'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-[#755744]/10 text-[#755744] dark:bg-[#3F6650]/40 dark:text-[#A7BDA9] border border-[#C8AD96]/40">
              <Award className="w-3.5 h-3.5" />
              <span>{profile.current_level}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-[#755744] text-white dark:bg-[#3F6650] shadow-sm font-semibold'
                      : 'text-[#352820]/80 dark:text-[#E8F0E8]/80 hover:bg-[#EFE7DF]/70 dark:hover:bg-[#2A3F33]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'text-white'
                          : 'text-[#755744] dark:text-[#A7BDA9]'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer: Streak Widget */}
        <div className="p-4 border-t border-[#E4D7CC]/60 dark:border-[#2C4236]/60">
          <div className="p-3 rounded-xl bg-[#F5EFE7]/80 dark:bg-[#17251D] border border-[#E4D7CC] dark:border-[#2C4236] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#352820] dark:text-[#E8F0E8] block">
                  {streak.currentStreak} Day Streak
                </span>
                <span className="text-[10px] text-[#766456] dark:text-[#9CB29F]">
                  Best: {streak.longestStreak} days
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              streak.isStudiedToday 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {streak.isStudiedToday ? 'Active' : 'Pending'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
