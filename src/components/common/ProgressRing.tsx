import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  colorClass?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className = '',
  colorClass,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[#E4D7CC]/60 dark:text-[#2C4236]"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${
            colorClass || 'text-[#755744] dark:text-[#A7BDA9]'
          }`}
          fill="transparent"
        />
      </svg>
      {/* Central content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
        <span className="text-xl font-bold tracking-tight text-[#352820] dark:text-[#E8F0E8]">
          {label ?? `${Math.round(clampedProgress)}%`}
        </span>
        {sublabel && (
          <span className="text-[11px] font-medium text-[#766456] dark:text-[#9CB29F] mt-0.5 max-w-[80px] truncate">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
