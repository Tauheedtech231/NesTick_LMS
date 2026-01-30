// app/lms/Instructor_Portal/components/CourseCard.tsx
'use client';

import { Users, BookOpen, Clock, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    studentCount: number;
    completionRate: number;
    modulesCount: number;
    thumbnail: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-r from-purple-500 to-purple-300 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            course.category === 'Matric' 
              ? 'bg-[#F59E0B] text-white' 
              : 'bg-[#6B21A8] text-white'
          }`}>
            {course.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Edit Course
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Manage Modules
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                View Analytics
              </button>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{course.title}</h3>
          <p className="text-sm opacity-90">{course.level}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">{course.studentCount}</div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">{course.modulesCount}</div>
            <div className="text-xs text-gray-500">Modules</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">{course.completionRate}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-semibold text-[#6B21A8]">{course.completionRate}%</span>
          </div>
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full rounded-full ${
                course.completionRate >= 80 ? 'bg-[#10B981]' : 
                course.completionRate >= 50 ? 'bg-[#F59E0B]' : 
                'bg-[#6B21A8]'
              }`}
              style={{ width: `${course.completionRate}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <a 
            href={`/lms/Instructor_Portal/courses/${course.id}`}
            className="flex-1 text-center bg-[#6B21A8] hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-300"
          >
            Manage
          </a>
          <button className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}