// app/lms/Instructor_Portal/components/StatsCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'success' | 'warning';
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, icon: Icon, color, change, trend }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-[#6B21A8] text-white',
    secondary: 'bg-[#F59E0B] text-white',
    success: 'bg-[#10B981] text-white',
    warning: 'bg-[#EF4444] text-white',
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${trend ? trendColors[trend] : 'text-gray-600'}`}>
              {trend === 'up' && '↗ '}
              {trend === 'down' && '↘ '}
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}