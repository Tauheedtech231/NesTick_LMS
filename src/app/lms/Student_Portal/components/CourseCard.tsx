// app/lms/Student_Portal/components/CourseCard.tsx
'use client';

import { BookOpen, Clock, User, Calendar, Users } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    // Either teacher or instructor
    teacher?: string;
    instructor?: string;
    // Either duration or progress info
    duration?: string;
    progress?: number;
    completion?: number;
    // Either category or level
    category?: 'Matric' | 'Intermediate';
    level?: string;
    grade?: string;
    // Other optional properties
    thumbnail?: string;
    totalModules?: number;
    completedModules?: number;
    color?: string;
    enrolledDate?: string;
    studentCount?: number;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  // Safely get values with defaults
  const instructor = course.instructor || course.teacher || 'Instructor';
  const progress = course.completion || course.progress || 0;
  const category = course.category || 
    (course.level === 'Matric' || course.level === 'Intermediate' ? course.level : 'Matric');
  const level = course.level || course.grade || '10th Grade';
  const duration = course.duration || `${course.totalModules || 8} weeks`;
  const completedModules = course.completedModules || Math.round((progress / 100) * (course.totalModules || 8));
  const totalModules = course.totalModules || 8;
  
  // Generate thumbnail gradient based on course color or ID
  const getThumbnailStyle = () => {
    if (course.thumbnail) {
      return { backgroundImage: `url(${course.thumbnail})` };
    }
    
    // Generate gradient based on course ID or color
    const gradients = {
      MATH101: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
      PHY101: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      CHEM101: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      ENG101: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      CS101: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    };
    
    const gradient = gradients[course.id as keyof typeof gradients] || 
      course.color || 
      'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)';
    
    return { background: gradient };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
      {/* Thumbnail */}
      <div 
        className="h-48 relative bg-cover bg-center"
        style={getThumbnailStyle()}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            category === 'Matric' 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {category}
          </span>
        </div>
        
        {/* Level Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {level}
          </span>
        </div>
        
        {/* Course Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-purple-100 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-purple-100 mt-1 opacity-90">
            {category} • {level}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {course.description}
        </p>
        
        {/* Course Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Instructor: {instructor}</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Duration: {duration}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Modules: {completedModules}/{totalModules}</span>
            </div>
            
            {course.enrolledDate && (
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-xs">{course.enrolledDate}</span>
              </div>
            )}
          </div>
          
          {course.studentCount && (
            <div className="flex items-center text-gray-500 text-sm">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{course.studentCount} students enrolled</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Progress</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-700">{progress}%</span>
              {progress === 100 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium rounded">
                  Completed
                </span>
              )}
            </div>
          </div>
          <ProgressBar progress={progress} />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Start</span>
            <span>{completedModules}/{totalModules} modules</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a 
            href={`/lms/Student_Portal/courses/${course.id}`}
            className="flex-1 text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-300 group-hover:shadow-lg"
          >
            Continue Learning
          </a>
          
          <button className="p-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}