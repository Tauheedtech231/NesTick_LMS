// app/lms/Student_Portal/components/ProgressBar.tsx
interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ progress, height = 8, showLabel = false }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="space-y-1">
      <div className="relative w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
        <div 
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
            clampedProgress === 100 ? 'bg-emerald-500' : 'bg-purple-500'
          }`}
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