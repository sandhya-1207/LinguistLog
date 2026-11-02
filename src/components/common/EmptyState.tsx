import React from 'react';
import { LucideIcon, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = PlusCircle,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#E4D7CC] dark:border-[#2C4236] bg-[#FFF9F2]/50 dark:bg-[#203128]/50 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#EFE7DF] dark:bg-[#2A3F33] flex items-center justify-center text-[#755744] dark:text-[#A7BDA9] mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-[#352820] dark:text-[#E8F0E8] mb-1">
        {title}
      </h4>
      <p className="text-sm text-[#766456] dark:text-[#9CB29F] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#755744] hover:bg-[#5E4332] dark:bg-[#3F6650] dark:hover:bg-[#325240] text-white rounded-xl text-sm font-medium shadow-sm transition-all active:scale-[0.98]"
        >
          <Icon className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
