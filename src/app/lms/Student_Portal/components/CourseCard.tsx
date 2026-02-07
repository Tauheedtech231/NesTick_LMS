// components/CourseCard.tsx
'use client';

import { HiPlay, HiBookOpen, HiClock, HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';

type Module = {
  id: string;
  title: string;
  isCompleted: boolean;
};

type CourseCardProps = {
  id: string;
  title: string;
  instructor: string;
  description: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  modules: Module[];
  totalModules: number;
  completedModules: number;
  studyHours: number;
  category: string;
  lastAccessed?: string;
  compact?: boolean;
};

export default function CourseCard({
  id,
  title,
  instructor,
  description,
  progress,
  status,
  modules,
  totalModules,
  completedModules,
  studyHours,
  category,
  lastAccessed,
  compact = false,
}: CourseCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <HiCheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />;
      case 'in_progress': return <HiPlay className="w-3 h-3 lg:w-4 lg:h-4" />;
      default: return <HiBookOpen className="w-3 h-3 lg:w-4 lg:h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
      compact ? 'p-4' : 'p-4 lg:p-6'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="mb-3 lg:mb-4">
          <div className="flex flex-wrap items-center gap-1 lg:gap-2 mb-2">
            <span className={`inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1 hidden sm:inline">
                {status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="ml-1 sm:hidden">
                {status === 'completed' ? 'DONE' : status === 'in_progress' ? 'IN PROG' : 'NOT START'}
              </span>
            </span>
            <span className="text-xs px-2 lg:px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              {category}
            </span>
          </div>
          
          <h3 className={`font-bold text-gray-900 mb-1 truncate ${compact ? 'text-base' : 'text-lg'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-2 truncate">By: {instructor}</p>
          <p className={`text-gray-500 line-clamp-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-3 lg:mb-4">
          <div className="flex justify-between items-center mb-1 lg:mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-purple-800 h-1.5 lg:h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div className="flex items-center space-x-1 lg:space-x-2">
            <HiBookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Modules</p>
              <p className="text-sm font-semibold truncate">{completedModules}/{totalModules}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 lg:space-x-2">
            <HiClock className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Study Hours</p>
              <p className="text-sm font-semibold truncate">{studyHours}h</p>
            </div>
          </div>
        </div>

        {/* Module Progress (Only for larger cards) */}
        {!compact && modules.length > 0 && (
          <div className="mb-3 lg:mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Recent Modules</p>
            <div className="space-y-1.5">
              {modules.slice(0, 2).map((module) => (
                <div key={module.id} className="flex items-center justify-between">
                  <span className="text-xs lg:text-sm text-gray-600 truncate pr-2">
                    {module.title}
                  </span>
                  <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full flex-shrink-0 ${
                    module.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
              ))}
              {modules.length > 2 && (
                <p className="text-xs text-gray-500 text-center pt-1">
                  +{modules.length - 2} more modules
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <Link
            href={`/my-courses/${id}`}
            className={`w-full flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${
              compact 
                ? 'py-2 px-3 text-sm bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900'
                : 'py-2.5 px-4 text-sm lg:text-base bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900'
            }`}
          >
            {status === 'completed' ? 'Review Course' : 'Continue Learning'}
            <HiArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}