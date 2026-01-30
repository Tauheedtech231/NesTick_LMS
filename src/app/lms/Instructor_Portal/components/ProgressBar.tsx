// app/lms/Instructor_Portal/components/ProgressBar.tsx
interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'accent';
}

export default function ProgressBar({ 
  progress, 
  height = 8, 
  showLabel = false, 
  color = 'primary' 
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const colorClasses = {
    primary: 'bg-[#6B21A8]',
    success: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    accent: 'bg-[#C4B5FD]',
  };

  return (
    <div className="space-y-1">
      <div className="relative w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
        <div 
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span className="font-medium">{clampedProgress}%</span>
        </div>
      )}
    </div>
  );
}