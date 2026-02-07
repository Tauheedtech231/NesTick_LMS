// components/ProgressBar.tsx
'use client';

type ProgressBarProps = {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  color?: string;
  animate?: boolean; // Add animate prop
  className?: string;
};

export default function ProgressBar({ 
  progress, 
  size = 'md', 
  showLabel = true,
  label,
  color = 'bg-gradient-to-r from-purple-600 to-purple-800',
  animate = true, // Default to true
  className = ''
}: ProgressBarProps) {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const animationClass = animate ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`font-medium text-gray-700 ${textSizeClass}`}>
            {label || 'Progress'}
          </span>
          <span className={`font-bold text-gray-900 ${textSizeClass}`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`${color} ${heightClass} rounded-full ${animationClass}`}
          style={{ 
            width: `${Math.min(progress, 100)}%`,
            transition: animate ? 'width 0.5s ease-out' : 'none'
          }}
        />
      </div>
    </div>
  );
}