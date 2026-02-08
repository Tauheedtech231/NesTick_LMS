'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Users,
  FileText,
  PlusCircle,
  Video,
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
 
  Star
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
  courseId: string;
  profileData?: {
    specialization: string;
    experience: string;
    qualification: string;
    rating: number;
    assignedCourse: {
      id: string;
      title: string;
      category: string;
      duration: string;
    };
    totalStudents: number;
  };
}

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  students: string;
  price: string;
  rating: number;
  modules?: any[];
}

interface Activity {
  id: string;
  type: 'assignment' | 'quiz' | 'material' | 'announcement' | 'grade';
  title: string;
  description: string;
  courseId: string;
  timestamp: string;
  action: string;
  metadata?: any;
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [assignedCourse, setAssignedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalQuizzes: 0,
    totalMaterials: 0,
    pendingSubmissions: 0,
    averageGrade: 0
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

        // Load assigned course
        const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
        const courseId = currentUser.courseId || currentUser.assignedCourseId
        const assigned = courses.find((c: Course) => c.id === courseId)
        
        if (assigned) {
          setAssignedCourse(assigned)
          
          // Load modules for stats
          const modules = assigned.modules || []
          const assignments = modules.filter((m: any) => m.type === 'assignment')
          const quizzes = modules.filter((m: any) => m.type === 'quiz')
          const materials = modules.filter((m: any) => m.type === 'video' || m.type === 'reading')
          
          // Load submissions and grades
          const submissions = JSON.parse(localStorage.getItem('assignment_submissions') || '[]')
          const pending = submissions.filter((s: any) => 
            s.courseId === courseId && s.status === 'submitted'
          )
          
          const grades = JSON.parse(localStorage.getItem('assignment_grades') || '[]')
          const courseGrades = grades.filter((g: any) => g.courseId === courseId)
          const avgGrade = courseGrades.length > 0 
            ? courseGrades.reduce((sum: number, g: any) => sum + (g.grade || 0), 0) / courseGrades.length
            : 0

          setStats({
            totalAssignments: assignments.length,
            totalQuizzes: quizzes.length,
            totalMaterials: materials.length,
            pendingSubmissions: pending.length,
            averageGrade: parseFloat(avgGrade.toFixed(1))
          })
        }

        // Load recent activities
        loadRecentActivities(currentUser.id, courseId)
        
      } catch (error) {
        console.error('Error loading instructor data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInstructorData()
  }, [router])

  const loadRecentActivities = (instructorId: string, courseId: string) => {
    try {
      const activities: Activity[] = []
      
      // Load assignments created by this instructor
      const assignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
      const myAssignments = assignments.filter((a: any) => 
        a.instructorId === instructorId && a.courseId === courseId
      )
      
      myAssignments.slice(-3).forEach((assignment: any) => {
        activities.push({
          id: `assignment-${assignment.id}`,
          type: 'assignment',
          title: assignment.title,
          description: assignment.description,
          courseId,
          timestamp: assignment.createdAt,
          action: 'created',
          metadata: assignment
        })
      })

      // Load quizzes
      const quizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
      const myQuizzes = quizzes.filter((q: any) => 
        q.instructorId === instructorId && q.courseId === courseId
      )
      
      myQuizzes.slice(-2).forEach((quiz: any) => {
        activities.push({
          id: `quiz-${quiz.id}`,
          type: 'quiz',
          title: quiz.title,
          description: quiz.description,
          courseId,
          timestamp: quiz.createdAt,
          action: 'created',
          metadata: quiz
        })
      })

      // Load materials
      const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
      const myMaterials = materials.filter((m: any) => 
        m.instructorId === instructorId && m.courseId === courseId
      )
      
      myMaterials.slice(-2).forEach((material: any) => {
        activities.push({
          id: `material-${material.id}`,
          type: 'material',
          title: material.title,
          description: material.type || 'Material',
          courseId,
          timestamp: material.createdAt,
          action: 'uploaded',
          metadata: material
        })
      })

      // Load graded submissions
      const grades = JSON.parse(localStorage.getItem('assignment_grades') || '[]')
      const myGrades = grades.filter((g: any) => 
        g.instructorId === instructorId && g.courseId === courseId
      )
      
      myGrades.slice(-2).forEach((grade: any) => {
        activities.push({
          id: `grade-${grade.id}`,
          type: 'grade',
          title: `Graded ${grade.assignmentTitle}`,
          description: `Grade: ${grade.grade}/100`,
          courseId,
          timestamp: grade.gradedAt,
          action: 'graded',
          metadata: grade
        })
      })

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivities(activities.slice(0, 8))
      
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'assignment': return <FileText className="w-5 h-5" />
      case 'quiz': return <ClipboardCheck className="w-5 h-5" />
      case 'material': return <Video className="w-5 h-5" />
      case 'grade': return <Award className="w-5 h-5" />
      default: return <MessageSquare className="w-5 h-5" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'assignment': return 'text-blue-600 bg-blue-50'
      case 'quiz': return 'text-green-600 bg-green-50'
      case 'material': return 'text-purple-600 bg-purple-50'
      case 'grade': return 'text-amber-600 bg-amber-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

  if (!instructor || !assignedCourse) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Course Assigned</h2>
          <p className="text-gray-500 mb-4">You are not assigned to any course yet.</p>
          <Link 
            href="/lms/auth/login?type=instructor"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-softGrey">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Instructor Dashboard
              </h1>
              <p className="text-darkGrey mt-1">
                Welcome back, {instructor.name}!
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="inline-flex items-center gap-1 text-sm text-darkGrey/70">
                  <BookOpen className="w-4 h-4" />
                  {assignedCourse.title}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-darkGrey/70">
                  <Users className="w-4 h-4" />
                  {assignedCourse.students}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-darkGrey/70">
                  <Clock className="w-4 h-4" />
                  {assignedCourse.duration}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-darkGrey/70">Instructor Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-darkGrey">
                    {instructor.profileData?.rating || 4.5}/5.0
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-darkRoyalBlue to-deepRed flex items-center justify-center text-white font-semibold">
                {instructor.name.charAt(0)}
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Assignments */}
        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Assignments</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalAssignments}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Created</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/assignments"
              className="text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Total Quizzes */}
        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Quizzes</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalQuizzes}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Created</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <ClipboardCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/quizzes"
              className="text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Total Materials */}
        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Materials</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalMaterials}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Uploaded</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Video className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/materials"
              className="text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Pending</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.pendingSubmissions}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Submissions to grade</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/assignments?tab=submissions"
              className="text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium flex items-center gap-1"
            >
              Grade now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Average Grade */}
        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Avg. Grade</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.averageGrade}%</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Class average</p>
            </div>
            <div className="p-3 rounded-lg bg-teal-50" style={{ color: BRAND_COLORS.teal }}>
              <BarChart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/assignments?tab=grades"
              className="text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium flex items-center gap-1"
            >
              View grades <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <Link
                href="/lms/Instructor_Portal/assignments/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all group"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  <FileUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-darkGrey">Create Assignment</h4>
                  <p className="text-sm text-darkGrey/70">New assignment for students</p>
                </div>
                <ChevronRight className="w-5 h-5 text-darkGrey/40 group-hover:text-darkRoyalBlue" />
              </Link>

              <Link
                href="/lms/Instructor_Portal/quizzes/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all group"
              >
                <div className="p-2 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-darkGrey">Create Quiz</h4>
                  <p className="text-sm text-darkGrey/70">Interactive quiz for assessment</p>
                </div>
                <ChevronRight className="w-5 h-5 text-darkGrey/40 group-hover:text-darkRoyalBlue" />
              </Link>

              <Link
                href="/lms/Instructor_Portal/materials/upload"
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all group"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-darkGrey">Upload Material</h4>
                  <p className="text-sm text-darkGrey/70">Course slides, videos, etc.</p>
                </div>
                <ChevronRight className="w-5 h-5 text-darkGrey/40 group-hover:text-darkRoyalBlue" />
              </Link>

              <Link
                href={`/lms/Instructor_Portal/courses/edit/${assignedCourse.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all group"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10`, color: BRAND_COLORS.darkRoyalBlue }}>
                  <Edit className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-darkGrey">Edit Course</h4>
                  <p className="text-sm text-darkGrey/70">Update course details</p>
                </div>
                <ChevronRight className="w-5 h-5 text-darkGrey/40 group-hover:text-darkRoyalBlue" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Recent Activity
              </h2>
              <button 
                onClick={() => loadRecentActivities(instructor.id, assignedCourse.id)}
                className="text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium"
              >
                Refresh
              </button>
            </div>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-softGrey hover:bg-lightGrey transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-darkGrey">{activity.title}</h4>
                          <p className="text-sm text-darkGrey/70 mt-1">{activity.description}</p>
                        </div>
                        <span className="text-xs text-darkGrey/60 whitespace-nowrap">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full capitalize bg-lightGrey text-darkGrey">
                          {activity.type}
                        </span>
                        <span className="text-xs text-darkGrey/60">
                          {activity.action}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                  No Recent Activity
                </h3>
                <p className="text-darkGrey/70 mb-4">
                  Start by creating assignments, quizzes, or uploading materials.
                </p>
                <Link
                  href="/lms/Instructor_Portal/assignments/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white 
                  }}
                >
                  <PlusCircle className="w-4 h-4" />
                  Create First Activity
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}