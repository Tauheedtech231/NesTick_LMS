// app/lms/Student_Portal/components/StatsCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // ✅ flexible now
  change?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'purple',
  change,
}: StatsCardProps) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',

    // 🔥 future-proof (optional)
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const appliedColor =
    colorClasses[color] ?? colorClasses.purple;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>

          {change && (
            <p
              className={`text-sm mt-1 ${
                change.startsWith('+')
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
            >
              {change} from last week
            </p>
          )}
        </div>

        <div className={`p-3 rounded-lg ${appliedColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
