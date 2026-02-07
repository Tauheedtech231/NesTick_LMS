// components/KPICard.tsx
import { IconType } from 'react-icons';

type KPICardProps = {
  title: string;
  value: string | number;
  icon: IconType; // Accepts any react icon
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
};

export default function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  changeType,
  size = 'md' 
}: KPICardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const paddingClass = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  }[size];

  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm'
  }[size];

  const valueSizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size];

  const iconSizeClass = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];

  const iconPaddingClass = {
    sm: 'p-2',
    md: 'p-2 lg:p-3',
    lg: 'p-3'
  }[size];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${paddingClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`${textSizeClass} text-gray-500 mb-1 truncate`}>{title}</p>
          <p className={`${valueSizeClass} font-bold text-gray-900 truncate`}>{value}</p>
          {change && (
            <p className={`${textSizeClass} font-medium mt-1 ${getChangeColor()} truncate`}>
              {change}
            </p>
          )}
        </div>
        <div className={`${iconPaddingClass} rounded-full ${color} flex-shrink-0 ml-3`}>
          <Icon className={`${iconSizeClass} text-white`} />
        </div>
      </div>
    </div>
  );
}