// lms/Instructor_Portal/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Users,
 
  ClipboardCheck,
 
  AlertCircle,
 
  MessageSquare,
  
  Award,
  Edit,
 
  CheckCircle,
 
  RefreshCw,
  BookMarked,
  PlayCircle,
  UserPlus,
 
  BookCopy,
  GraduationCap,
  Target,
  Loader2
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
  id: string;
  name: string;
  email: string;
}

interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  mockQuizzes: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  image: string;
  status: 'draft' | 'published';
  studentCapacity: number;
  createdAt: string;
  updatedAt: string;
  stats: {
    enrolledStudents: number;
    totalSlides: number;
    totalQuizzes: number;
    totalAssignments: number;
  };
}

interface Activity {
  type: 'enrollment' | 'quiz_attempt' | 'certificate';
  description: string;
  time: string;
  user: string;
  course: string;
}

interface DashboardData {
  stats: DashboardStats;
  courses: Course[];
  recentActivity: Activity[];
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load instructor data
  useEffect(() => {
    if (isMounted) {
      loadInstructorData()
    }
  }, [isMounted])

  const loadInstructorData = async () => {
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

      setInstructor(currentUser)
      await fetchDashboardData(currentUser.id)
      
    } catch (error) {
      console.error('Error loading instructor data:', error)
      setError('Failed to load user data')
      setLoading(false)
    }
  }

  const fetchDashboardData = async (instructorId: string, showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(`/api/instructors/dashboard?instructorId=${instructorId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard data')
      }

      if (result.success) {
        setDashboardData(result.data)
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (instructor?.id) {
      fetchDashboardData(instructor.id, true)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'quiz_attempt': return <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'certificate': return <Award className="w-4 h-4 sm:w-5 sm:h-5" />
      default: return <BookCopy className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' }
      case 'quiz_attempt': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' }
      case 'certificate': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
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

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
              <p className="text-sm text-darkGrey">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            Access Denied
          </h2>
          <p className="text-darkGrey/70 mb-6">
            {error || 'Please log in as an instructor to access this page.'}
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

  const stats = dashboardData?.stats || {
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    mockQuizzes: 0
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
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
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
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

        {/* Total Students Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Total Students</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalStudents}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Target className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Enrolled</span>
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
                <span className="text-xs text-teal-600 font-medium">Published</span>
              </div>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <PlayCircle className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
        </div>

        {/* Mock Quizzes Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Mock Quizzes</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.mockQuizzes}
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

      {/* Courses Section */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-softGrey">
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Your Courses
            </h2>
            <p className="text-xs text-darkGrey/70 mt-1">Manage your courses and track progress</p>
          </div>
          
          {dashboardData?.courses && dashboardData.courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-lightGrey">
                  <tr>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Course Name</th>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Category</th>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Students</th>
                    <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-softGrey">
                  {dashboardData.courses.map((course) => (
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
                          <Users className="w-4 h-4 text-darkGrey/40" />
                          <span className="text-sm text-darkGrey font-medium">
                            {course.stats.enrolledStudents} / {course.studentCapacity}
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
                          
                        </div>
                      </td>
                    </tr>
                  ))}
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

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Recent Activity
            </h2>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: BRAND_COLORS.darkRoyalBlue }}
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity, index) => {
                const colors = getActivityColor(activity.type)
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                    style={{ borderColor: colors.border }}
                  >
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <div className={colors.text}>
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-darkGrey/70 mt-0.5">
                            {activity.description}
                          </p>
                          <p className="text-xs text-darkGrey/50 mt-1">
                            Course: {activity.course}
                          </p>
                        </div>
                        <span className="text-xs text-darkGrey/60 whitespace-nowrap">
                          {formatTimeAgo(activity.time)}
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