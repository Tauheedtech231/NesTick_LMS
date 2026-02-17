// lms/Instructor_Portal/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Users,
  FileText,
  FileUp,
  ClipboardCheck,
  Clock,
  AlertCircle,
  ChevronRight,
  Upload,
  MessageSquare,
  BarChart,
  Award,
  Edit,
  Star,
  TrendingUp,
  CheckCircle,
  FileVideo,
  RefreshCw,
  Grid,
  BookMarked,
  PlayCircle,
  UserPlus,
  FileEdit,
  BookCopy,
  GraduationCap,
  Target
} from 'lucide-react'
/* eslint-disable */

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

interface Instructor {
  fullName: string
  id: string;
  name: string;
  email: string;
  courseId?: string;
  assignedCourseId?: string;
  profileData?: {
    specialization: string;
    experience: string;
    qualification: string;
    rating: number;
    totalStudents: number;
  };
}

interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration?: string;
  studentCapacity?: number;  // Maximum students allowed
  students?: string | number; // Legacy field
  price?: string;
  rating?: number;
  modules?: any[];
  enrolledStudents?: number;
  instructor?: string;
  instructorId?: string;
  image?: string;
  courseImage?: string;
  status?: 'draft' | 'published';
  isPublished?: boolean;
  maxStudents?: number; // For consistency
}

interface Activity {
  id: string;
  type: 'enrollment' | 'course_update' | 'quiz_created' | 'slide_added';
  title: string;
  description: string;
  courseName: string;
  timestamp: string;
  icon?: any;
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeCourses: 0,
    totalQuizzes: 0
  })

  // Load instructor data
  useEffect(() => {
    const loadInstructorData = () => {
      try {
        // Get current instructor from localStorage
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

        setInstructor(currentUser)

        // Load all courses from localStorage (key 'courses')
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        
        // Find courses assigned to this instructor by instructorId
        const instructorCourses = allCourses.filter((course: Course) => {
          return course.instructorId === currentUser.id
        })

        console.log('Assigned courses found:', instructorCourses.length)
        setAssignedCourses(instructorCourses)

        // Calculate stats
        let totalMaxStudents = 0
        let activePublished = 0

        instructorCourses.forEach((course: Course) => {
          // Get maximum student capacity
          let maxStudents = 0
          
          // Check different possible fields for maximum capacity
          if (typeof course.studentCapacity === 'number') {
            maxStudents = course.studentCapacity
          } else if (typeof course.maxStudents === 'number') {
            maxStudents = course.maxStudents
          } else if (typeof course.students === 'string') {
            // Parse strings like "Max 20 per batch" or "20"
            const parsed = parseInt(course.students.replace(/\D/g, '')) || 0
            maxStudents = parsed
          } else if (typeof course.students === 'number') {
            maxStudents = course.students
          }
          
          totalMaxStudents += maxStudents

          // Count as active if published
          if (course.status === 'published' || course.isPublished) {
            activePublished++
          }
        })

        // Count total quizzes from localStorage (key 'quizzes')
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
        const instructorQuizzes = quizzes.filter((q: any) => 
          q.instructorId === currentUser.id || 
          q.courseId && instructorCourses.some((c: { id: any }) => c.id === q.courseId)
        )

        setStats({
          totalCourses: instructorCourses.length,
          totalStudents: totalMaxStudents,
          activeCourses: activePublished,
          totalQuizzes: instructorQuizzes.length
        })

        // Load recent activities
        loadRecentActivities()
        
      } catch (error) {
        console.error('Error loading instructor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInstructorData()
  }, [router])

  const loadRecentActivities = () => {
    try {
      // Hardcoded recent activities as requested
      const activities: Activity[] = [
        {
          id: '1',
          type: 'enrollment',
          title: 'New Student Enrolled',
          description: 'Sarah Johnson enrolled in Web Development Fundamentals',
          courseName: 'Web Development Fundamentals',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: '2',
          type: 'quiz_created',
          title: 'Quiz Created',
          description: 'JavaScript Basics Quiz with 15 questions',
          courseName: 'Advanced JavaScript',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
          id: '3',
          type: 'slide_added',
          title: 'Slide Added',
          description: 'React Hooks - Complete Guide presentation uploaded',
          courseName: 'React Masterclass',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: '4',
          type: 'enrollment',
          title: 'New Student Enrolled',
          description: 'Michael Chen enrolled in UI/UX Design Principles',
          courseName: 'UI/UX Design Principles',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          id: '5',
          type: 'course_update',
          title: 'Course Updated',
          description: 'Added new module on Advanced State Management',
          courseName: 'React Masterclass',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        }
      ]
      
      setRecentActivities(activities)
      
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'enrollment': return <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'course_update': return <FileEdit className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'quiz_created': return <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'slide_added': return <FileVideo className="w-4 h-4 sm:w-5 sm:h-5" />
      default: return <BookCopy className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'enrollment': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' }
      case 'course_update': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }
      case 'quiz_created': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' }
      case 'slide_added': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' }
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  const getMaxStudentCount = (course: Course): number => {
    // Check different possible fields for maximum capacity
    if (typeof course.studentCapacity === 'number') {
      return course.studentCapacity
    }
    if (typeof course.maxStudents === 'number') {
      return course.maxStudents
    }
    if (typeof course.students === 'string') {
      const parsed = parseInt(course.students.replace(/\D/g, '')) || 0
      return parsed
    }
    if (typeof course.students === 'number') {
      return course.students
    }
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded-lg mb-8"></div>
            <div className="h-96 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            Access Denied
          </h2>
          <p className="text-darkGrey/70 mb-6">
            Please log in as an instructor to access this page.
          </p>
          <Link 
            href="/lms/auth/login?type=instructor"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header with Royal Blue Background */}
      <div className="mb-6 sm:mb-8">
        <div className="rounded-xl p-4 sm:p-6" style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Instructor Dashboard
                  </h1>
                  <p className="text-sm text-white/80">
                    Welcome back, {instructor.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-white/70">Today's Date</p>
                <p className="font-medium text-white">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-white/20">
                {instructor.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Total Courses Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Total Courses</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalCourses}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <BookMarked className="w-3 h-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                <span className="text-xs" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  {stats.activeCourses} active
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <BookOpen className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
        </div>

        {/* Total Maximum Students Card - UPDATED */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Maximum Students</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalStudents}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Target className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Total capacity</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Courses Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Active Courses</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.activeCourses}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-teal-500" />
                <span className="text-xs text-teal-600 font-medium">Currently teaching</span>
              </div>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <PlayCircle className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>

        {/* Total Mock Quizzes Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Mock Quizzes</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalQuizzes}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <ClipboardCheck className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Created</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-purple-50">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Courses Section */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-softGrey">
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Your Courses
            </h2>
            <p className="text-xs text-darkGrey/70 mt-1">Manage your courses and track progress</p>
          </div>
          
          {assignedCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-lightGrey">
                  <tr>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Course Name</th>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Category</th>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Max Students</th>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-softGrey">
                  {assignedCourses.map((course) => {
                    const maxStudents = getMaxStudentCount(course)
                    
                    return (
                      <tr key={course.id} className="hover:bg-lightGrey/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-darkGrey text-sm">{course.title}</p>
                            <p className="text-xs text-darkGrey/60 mt-0.5 line-clamp-1">{course.description || ''}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-darkGrey">{course.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-darkGrey/40" />
                            <span className="text-sm text-darkGrey font-medium">
                              {maxStudents > 0 ? maxStudents : 'Unlimited'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/lms/Instructor_Portal/courses/edit/${course.id}`}
                              className="p-1.5 rounded-lg hover:bg-lightGrey transition-colors"
                              title="Edit Course"
                            >
                              <Edit className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                            </Link>
                            <Link
                              href={`/lms/Instructor_Portal/students?course=${course.id}`}
                              className="p-1.5 rounded-lg hover:bg-lightGrey transition-colors"
                              title="View Students"
                            >
                              <Users className="w-4 h-4" style={{ color: BRAND_COLORS.teal }} />
                            </Link>
                            <Link
                              href={`/lms/Instructor_Portal/materials?course=${course.id}`}
                              className="p-1.5 rounded-lg hover:bg-lightGrey transition-colors"
                              title="Manage Slides"
                            >
                              <FileVideo className="w-4 h-4" style={{ color: BRAND_COLORS.deepRed }} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
              <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                No Courses Created
              </h3>
              <p className="text-darkGrey/70 mb-4 text-sm">
                You haven't created any courses yet. Start by creating your first course.
              </p>
              <Link
                href="/lms/Instructor_Portal/courses/add"
                className="inline-block px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.darkRoyalBlue,
                  color: BRAND_COLORS.white 
                }}
              >
                Create Course
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section - Hardcoded Data */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Recent Activity
            </h2>
            <button 
              onClick={loadRecentActivities}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: BRAND_COLORS.darkRoyalBlue }}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const colors = getActivityColor(activity.type)
                return (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                    style={{ borderColor: colors.border.replace('border-', '').split('-')[1] + '20' }}
                  >
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <div className={colors.text}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-darkGrey text-sm">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-darkGrey/70 mt-0.5">
                            {activity.description}
                          </p>
                          <p className="text-xs text-darkGrey/50 mt-1">
                            Course: {activity.courseName}
                          </p>
                        </div>
                        <span className="text-xs text-darkGrey/60 whitespace-nowrap">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
              <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                No Recent Activity
              </h3>
              <p className="text-darkGrey/70 text-sm">
                Activities will appear here as students enroll and you create content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}