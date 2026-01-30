// app/lms/Student_Portal/components/CourseCard.tsx
'use client'

import { BookOpen, Clock, Users, TrendingUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    duration: string
    instructor: string
    progress: number
    totalModules: number
    completedModules: number
    lastAccessed: string
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  const progressPercentage = Math.round((course.completedModules / course.totalModules) * 100)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
        </div>
        <div className="ml-4 text-right">
          <div className="text-2xl font-bold text-purple-700">{progressPercentage}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} />
          {course.instructor}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          {course.completedModules}/{course.totalModules} modules
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Last Accessed & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
        </div>
        
        <Link
          href={`/lms/Student_Portal/courses/${course.id}`}
          className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Continue
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  )
}