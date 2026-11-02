import React from 'react';
import { CEFRLevel, Difficulty, VocabStatus, GrammarStatus, Priority } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'cefr' | 'difficulty' | 'status' | 'skill' | 'priority' | 'success' | 'outline';
  value?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  value,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-medium' : 'px-3 py-1 text-sm font-medium';

  let colorClasses = 'bg-[#EFE7DF] text-[#755744] dark:bg-[#2A3F33] dark:text-[#A7BDA9] border border-[#E4D7CC] dark:border-[#2C4236]';

  const val = (value || (typeof children === 'string' ? children : '')).toLowerCase();

  if (variant === 'cefr') {
    colorClasses = 'bg-[#755744]/10 text-[#755744] dark:bg-[#3F6650]/30 dark:text-[#A7BDA9] border border-[#C8AD96]/40 dark:border-[#3F6650]/60 font-semibold tracking-wide';
  } else if (variant === 'difficulty') {
    if (val === 'easy') {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 border';
    } else if (val === 'medium') {
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40 border';
    } else if (val === 'hard') {
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40 border';
    }
  } else if (variant === 'status') {
    if (val === 'mastered' || val === 'completed') {
      colorClasses = 'bg-emerald-100/70 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700/50 border';
    } else if (val === 'learning') {
      colorClasses = 'bg-[#C8AD96]/30 text-[#755744] border-[#C8AD96]/60 dark:bg-[#3F6650]/30 dark:text-[#A7BDA9] dark:border-[#3F6650]/50 border';
    } else {
      colorClasses = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/40 border';
    }
  } else if (variant === 'priority') {
    if (val === 'high') {
      colorClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50 border';
    } else if (val === 'medium') {
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50 border';
    } else {
      colorClasses = 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700 border';
    }
  } else if (variant === 'skill') {
    colorClasses = 'bg-[#FFF9F2] text-[#755744] dark:bg-[#203128] dark:text-[#E8F0E8] border border-[#E4D7CC] dark:border-[#2C4236] shadow-xs';
  } else if (variant === 'outline') {
    colorClasses = 'bg-transparent text-[#766456] dark:text-[#9CB29F] border border-[#E4D7CC] dark:border-[#2C4236]';
  }

  return (
    <span className={`inline-flex items-center rounded-full tracking-wide transition-colors ${sizeClasses} ${colorClasses} ${className}`}>
      {children}
    </span>
  );
};
