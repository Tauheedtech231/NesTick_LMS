/* eslint-disable @typescript-eslint/no-explicit-any */
// lms/Instructor_Portal/courses/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronDown,
  SlidersHorizontal,
  FileVideo,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react'
import React from 'react'

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6C9',
  brightRed: '#D32F2F'
}

interface Course {
  id: string;
  title: string;
  description: string;
  studentCapacity: number;
  category: string;
  status: 'draft' | 'published';
  instructorId: string;
  instructorName: string;
  instructorImage?: string;
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  courseImage?: string;
  image?: string;
  duration?: string;
  level?: string;
  price?: string;
  stats?: {
    slides: number;
    files: number;
    quizzes: number;
    assignments: number;
  };
}

// ✅ FIX #1: Optimized image component - NO lazy loading for table images
const CourseImage = ({ src, title, index }: { src?: string; title: string; index: number }) => {
  const [hasError, setHasError] = useState(false)
  
  if (hasError || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-softGrey">
        <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
      </div>
    )
  }
  
  return (
    <img 
      src={src} 
      alt={title}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
      // ✅ CRITICAL FIX: Remove lazy loading - causes scroll up lag
      loading="eager"  // Changed from "lazy"
      // ✅ FIX: Cache images aggressively
      decoding="async"
      // ✅ FIX: Add unique cache key
      referrerPolicy="no-referrer"
      style={{ 
        contentVisibility: 'auto',
        contain: 'strict'
      }}
    />
  )
}

// ✅ FIX #2: Memoized row component with stable callbacks
const CourseRow = React.memo(({ 
  course, 
  onPreview, 
  onManageSlides, 
  onDelete,
  index 
}: { 
  course: Course; 
  onPreview: (id: string) => void;
  onManageSlides: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}) => {
  const getStatusBadge = useCallback((status: string) => {
    if (status === 'published') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Published
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <XCircle className="w-3 h-3" />
        Draft
      </span>
    )
  }, [])

  return (
    <tr className="hover:bg-lightGrey/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-softGrey">
            <CourseImage 
              src={course.courseImage || course.image} 
              title={course.title}
              index={index}
            />
          </div>
          <div>
            <p className="font-medium text-darkGrey text-sm">{course.title}</p>
            <p className="text-xs text-darkGrey/60 line-clamp-1">{course.description}</p>
            {course.duration && course.level && (
              <p className="text-xs text-purple-600 mt-1">{course.duration} • {course.level}</p>
            )}
            {course.price && (
              <p className="text-xs text-green-600 mt-1">{course.price}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        {getStatusBadge(course.status)}
      </td>
      <td className="py-3 px-4 text-sm text-darkGrey">
        {course.stats?.slides || 0}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(course.id)}
            className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors cursor-pointer"
            title="Preview Course"
          >
            <Eye className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
          </button>
          <button
            onClick={() => onManageSlides(course.id)}
            className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors cursor-pointer"
            title="Manage Slides & Content"
          >
            <FileVideo className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="p-1.5 hover:bg-lightGrey rounded-lg transition-colors cursor-pointer"
            title="Delete Course"
          >
            <Trash2 className="w-4 h-4" style={{ color: BRAND_COLORS.brightRed }} />
          </button>
        </div>
      </td>
    </tr>
  )
})

CourseRow.displayName = 'CourseRow'

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const filteredCourses = useMemo(() => {
    let filtered = [...courses]
    
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter)
    }
    
    return filtered
  }, [courses, searchTerm, statusFilter])

  const summaryStats = useMemo(() => ({
    total: filteredCourses.length,
    published: filteredCourses.filter(c => c.status === 'published').length,
    drafts: filteredCourses.filter(c => c.status === 'draft').length,
    totalAssignments: filteredCourses.reduce((sum, course) => sum + (course.stats?.assignments || 0), 0)
  }), [filteredCourses])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser')
      if (!currentUserStr) {
        router.push('/lms/auth/login?type=instructor')
        return
      }

      const currentUser = JSON.parse(currentUserStr)
      if (currentUser.role !== 'instructor') {
        router.push('/lms/auth/login?type=instructor')
        return
      }

      await fetchCoursesFromAPI()
      
    } catch (error) {
      console.error('Auth error:', error)
      setError('Authentication failed')
      setLoading(false)
    }
  }

  const fetchCoursesFromAPI = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/instructors/course')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch courses')
      }

      if (result.success) {
        const apiCourses = result.data.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          studentCapacity: course.student_capacity,
          category: course.category,
          status: course.status,
          instructorId: course.instructor_id,
          instructorName: course.instructor_name || 'Instructor',
          image: course.image,
          courseImage: course.image,
          duration: course.duration,
          level: course.level,
          price: course.price ? `PKR ${course.price.toLocaleString()}` : undefined,
          createdAt: course.created_at,
          updatedAt: course.updated_at,
          isPublished: false,
          stats: course.stats || { slides: 0, files: 0, quizzes: 0, assignments: 0 }
        }))

        setCourses(apiCourses)
      }
      
    } catch (error: any) {
      console.error('Error fetching courses:', error)
      setError(error.message || 'Failed to load courses')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = useCallback(() => {
    fetchCoursesFromAPI(true)
  }, [])

  const handleDeleteCourse = useCallback(async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? All slides, content, quizzes, and assignments will be permanently removed.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/instructors/course/${courseId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete course')
      }

      setCourses(prev => prev.filter(c => c.id !== courseId))
      alert('Course deleted successfully!')
      
    } catch (error: any) {
      console.error('Error deleting course:', error)
      alert(error.message || 'Failed to delete course')
    }
  }, [])

  const handleManageSlides = useCallback((courseId: string) => {
    router.push(`/lms/Instructor_Portal/courses/edit/${courseId}?tab=slides`)
  }, [router])

  const handlePreviewCourse = useCallback((courseId: string) => {
    router.push(`/lms/Instructor_Portal/courses/preview/${courseId}`)
  }, [router])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('all')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              <p className="text-sm text-darkGrey">Loading courses from database...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2 text-darkGrey">Error Loading Courses</h3>
          <p className="text-darkGrey/70 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg inline-flex items-center gap-2 hover:bg-darkRoyalBlue/90 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                My Courses
              </h1>
              <p className="text-darkGrey mt-1 text-sm">
                {courses.length} total courses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg border border-darkGrey/30 hover:bg-lightGrey transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <Link
                href="/lms/Instructor_Portal/courses/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                <Plus className="w-4 h-4" />
                Create New Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-darkGrey/40" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden px-3 py-2 border border-softGrey rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm">Filter</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="hidden sm:block px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 sm:hidden">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue text-sm bg-white cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Courses Found
          </h3>
          <p className="text-darkGrey/70 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first course'}
          </p>
          {(searchTerm || statusFilter !== 'all') ? (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/lms/Instructor_Portal/courses/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <Plus className="w-4 h-4" />
              Create First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                <tr>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Course</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Status</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Slides</th>
                  <th className="text-left text-xs font-medium py-3 px-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-softGrey">
                {filteredCourses.map((course, idx) => (
                  <CourseRow 
                    key={course.id}
                    course={course}
                    index={idx}
                    onPreview={handlePreviewCourse}
                    onManageSlides={handleManageSlides}
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredCourses.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Total Courses</p>
            <p className="text-lg font-semibold text-darkGrey">{summaryStats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Published</p>
            <p className="text-lg font-semibold text-green-600">{summaryStats.published}</p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Drafts</p>
            <p className="text-lg font-semibold text-amber-600">{summaryStats.drafts}</p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <p className="text-xs text-darkGrey/60">Total Assignments</p>
            <p className="text-lg font-semibold text-darkRoyalBlue">{summaryStats.totalAssignments}</p>
          </div>
        </div>
      )}
    </div>
  )
}