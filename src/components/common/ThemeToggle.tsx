import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group flex items-center gap-2 p-2 rounded-xl transition-all border border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2] hover:bg-[#EFE7DF] dark:bg-[#203128] dark:hover:bg-[#2A3F33] text-[#755744] dark:text-[#A7BDA9] ${className}`}
      title={`Switch to ${theme === 'light' ? 'Forest Green (Dark)' : 'Mocha (Light)'} aesthetic`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-[#755744] transition-transform transform group-hover:rotate-45" />
        ) : (
          <Moon className="w-5 h-5 text-[#A7BDA9] transition-transform transform group-hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium">
          {theme === 'light' ? 'Mocha Light' : 'Forest Dark'}
        </span>
      )}
    </button>
  );
};
