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
    totalStudents: 0,
    courseRating: 0
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
        console.log('Assigned course found:', assigned)
        
        if (assigned) {
          setAssignedCourse(assigned)
          
          // Load assignments from localStorage
          const assignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
          const instructorAssignments = assignments.filter((a: any) => {
            const matchesInstructor = a.instructorId === currentUser.id || 
                                     a.instructorEmail === currentUser.email ||
                                     a.instructorName === currentUser.name ||
                                     a.instructorName === currentUser.fullName
            const matchesCourse = a.courseId === courseId || 
                                a.courseTitle === assigned.title
            return matchesInstructor && matchesCourse
          })
          
          // Load quizzes from localStorage
          const quizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
          const instructorQuizzes = quizzes.filter((q: any) => {
            const matchesInstructor = q.instructorId === currentUser.id || 
                                     q.instructorName === currentUser.name ||
                                     q.instructorName === currentUser.fullName
            const matchesCourse = q.courseId === courseId || 
                                q.courseTitle === assigned.title
            return matchesInstructor && matchesCourse
          })
          
          // Load materials from localStorage - SIMPLIFIED APPROACH
          const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
          
          // First, let's check if there are any materials at all
          console.log('Total materials in localStorage:', materials.length)
          
          // Try multiple ways to filter materials
          const instructorMaterials = materials.filter((m: any) => {
            if (!m) return false
            
            // Try matching by instructor ID
            if (m.instructorId && m.instructorId === currentUser.id) return true
            
            // Try matching by email
            if (m.instructorEmail && m.instructorEmail === currentUser.email) return true
            
            // Try matching by name
            if (m.instructorName && (m.instructorName === currentUser.name || 
                                    m.instructorName === currentUser.fullName)) return true
            
            // Try matching by course
            if (m.courseId && m.courseId === courseId) return true
            
            // If material doesn't have instructor info but has course info, include it
            if (!m.instructorId && !m.instructorEmail && !m.instructorName && m.courseId === courseId) return true
            
            return false
          })
          
          console.log('Filtered materials for dashboard:', instructorMaterials.length)
          
          // Load students count from course
          const studentCount = assigned.students ? 
            parseInt(assigned.students.replace(/\D/g, '')) || 0 : 0

          setStats({
            totalAssignments: instructorAssignments.length,
            totalQuizzes: instructorQuizzes.length,
            totalMaterials: instructorMaterials.length,
            totalStudents: studentCount,
            courseRating: assigned.rating || 0
          })
          
          console.log('Dashboard stats set:', {
            assignments: instructorAssignments.length,
            quizzes: instructorQuizzes.length,
            materials: instructorMaterials.length,
            students: studentCount
          })
        }

        // Load recent activities
        loadRecentActivities(currentUser.id, assigned?.id || '')
        
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
      
      if (!courseId) return
      
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

      // Load materials - SIMPLIFIED FILTERING
      const materials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
      
      // Get materials for this course and instructor
      const myMaterials = materials.filter((m: any) => {
        if (!m) return false
        
        // Match by instructor
        const matchesInstructor = m.instructorId === instructorId ||
                                 m.instructorEmail === instructor?.email ||
                                 m.instructorName === instructor?.name
        
        // Match by course
        const matchesCourse = m.courseId === courseId
        
        return matchesInstructor && matchesCourse
      })
      
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
      case 'assignment': return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'quiz': return <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'material': return <FileVideo className="w-4 h-4 sm:w-5 sm:h-5" />
      case 'grade': return <Award className="w-4 h-4 sm:w-5 sm:h-5" />
      default: return <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'assignment': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }
      case 'quiz': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' }
      case 'material': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' }
      case 'grade': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
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

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Add a function to reset demo data if needed
  const resetDemoMaterials = () => {
    if (!instructor || !assignedCourse) return
    
    const demoMaterials = [
      {
        id: `demo_material_${Date.now()}`,
        title: 'Introduction to Web Development',
        description: 'Basic concepts of HTML, CSS and JavaScript',
        courseId: assignedCourse.id,
        courseTitle: assignedCourse.title,
        instructorId: instructor.id,
        instructorName: instructor.name || instructor.fullName || 'Instructor',
        instructorEmail: instructor.email,
        type: 'slides',
        files: [],
        tags: ['web', 'beginner'],
        status: 'published',
        downloads: 0,
        storage: 'cloudinary',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    const existingMaterials = JSON.parse(localStorage.getItem('instructor_materials') || '[]')
    const combinedMaterials = [...existingMaterials, ...demoMaterials]
    localStorage.setItem('instructor_materials', JSON.stringify(combinedMaterials))
    
    // Reload the page to see changes
    window.location.reload()
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

  if (!instructor || !assignedCourse) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Course Assigned
          </h2>
          <p className="text-darkGrey/70 mb-6">
            You are not assigned to any course yet. Please contact the administrator.
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
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-xl border border-softGrey p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                  style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                    Instructor Dashboard
                  </h1>
                  <p className="text-sm text-darkGrey/70">
                    Manage your course and track student progress
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                    <Users className="w-3 h-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                  </div>
                  <div>
                    <p className="text-xs text-darkGrey/70">Instructor</p>
                    <p className="font-medium text-darkGrey text-sm">{instructor.name}</p>
                  </div>
                </div>
                
                <div className="h-6 w-px bg-softGrey"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
                    <BookOpen className="w-3 h-3" style={{ color: BRAND_COLORS.teal }} />
                  </div>
                  <div>
                    <p className="text-xs text-darkGrey/70">Course</p>
                    <p className="font-medium text-darkGrey text-sm">{assignedCourse.title}</p>
                  </div>
                </div>
                
                <div className="h-6 w-px bg-softGrey hidden sm:block"></div>
                
                <div className="flex items-center gap-2 hidden sm:flex">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                    <Star className="w-3 h-3" style={{ color: BRAND_COLORS.deepRed }} />
                  </div>
                  <div>
                    <p className="text-xs text-darkGrey/70">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-darkGrey text-sm">
                        {stats.courseRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-darkGrey/70">Today's Date</p>
                <p className="font-medium text-darkGrey">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.darkRoyalBlue}, ${BRAND_COLORS.deepRed})`
                }}>
                {instructor.name.charAt(0)}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-1 w-full bg-lightGrey rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ 
                width: '60%', 
                backgroundColor: BRAND_COLORS.deepRed 
              }}></div>
            </div>
            <div className="flex justify-between text-xs text-darkGrey/70 mt-1">
              <span>Course Progress</span>
              <span>60% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Assignments Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Assignments</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalAssignments}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+2 this week</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/assignments"
              className="text-xs font-medium flex items-center justify-between group"
              style={{ color: BRAND_COLORS.darkRoyalBlue }}
            >
              <span>View Assignments</span>
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Quizzes Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Quizzes</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalQuizzes}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-600 font-medium">Active: 1</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <ClipboardCheck className="w-5 h-5" style={{ color: '#10B981' }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/quizzes"
              className="text-xs font-medium flex items-center justify-between group"
              style={{ color: BRAND_COLORS.darkRoyalBlue }}
            >
              <span>Manage Quizzes</span>
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Materials Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Materials</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalMaterials}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <FileVideo className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Total files</span>
              </div>
              {/* Debug button - remove in production */}
              <button 
                onClick={() => console.log('Materials in localStorage:', JSON.parse(localStorage.getItem('instructor_materials') || '[]'))}
                className="text-xs text-gray-500 mt-1"
              >
                Debug: {stats.totalMaterials} shown
              </button>
            </div>
            <div className="p-2 rounded-lg bg-purple-50">
              <FileVideo className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/materials"
              className="text-xs font-medium flex items-center justify-between group"
              style={{ color: BRAND_COLORS.darkRoyalBlue }}
            >
              <span>View Materials</span>
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Students Card */}
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-darkGrey/70 mb-1">Students</p>
              <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkNavy }}>
                {stats.totalStudents}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3 text-teal-500" />
                <span className="text-xs text-teal-600 font-medium">85% Active</span>
              </div>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.teal}10` }}>
              <Users className="w-5 h-5" style={{ color: BRAND_COLORS.teal }} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-softGrey">
            <Link 
              href="/lms/Instructor_Portal/students"
              className="text-xs font-medium flex items-center justify-between group"
              style={{ color: BRAND_COLORS.darkRoyalBlue }}
            >
              <span>View Students</span>
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Quick Actions
              </h2>
              <span className="text-xs text-darkGrey/70">Shortcuts</span>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/lms/Instructor_Portal/assignments/create"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.lightGrey,
                  color: BRAND_COLORS.darkGrey 
                }}
              >
                <div className="p-2 rounded-lg bg-blue-50">
                  <FileUp className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Create Assignment</h4>
                  <p className="text-xs text-darkGrey/70">New task for students</p>
                </div>
                <ChevronRight className="w-4 h-4 text-darkGrey/40" />
              </Link>

              <Link
                href="/lms/Instructor_Portal/quizzes/create"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.lightGrey,
                  color: BRAND_COLORS.darkGrey 
                }}
              >
                <div className="p-2 rounded-lg bg-green-50">
                  <ClipboardCheck className="w-4 h-4" style={{ color: '#10B981' }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Create Quiz</h4>
                  <p className="text-xs text-darkGrey/70">Test student knowledge</p>
                </div>
                <ChevronRight className="w-4 h-4 text-darkGrey/40" />
              </Link>

              <Link
                href="/lms/Instructor_Portal/materials/upload"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.lightGrey,
                  color: BRAND_COLORS.darkGrey 
                }}
              >
                <div className="p-2 rounded-lg bg-purple-50">
                  <Upload className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Upload Material</h4>
                  <p className="text-xs text-darkGrey/70">Slides, videos, documents</p>
                </div>
                <ChevronRight className="w-4 h-4 text-darkGrey/40" />
              </Link>

              <Link
                href={`/lms/Instructor_Portal/courses/edit/${assignedCourse.id}`}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.lightGrey,
                  color: BRAND_COLORS.darkGrey 
                }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                  <Edit className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Edit Course</h4>
                  <p className="text-xs text-darkGrey/70">Update course details</p>
                </div>
                <ChevronRight className="w-4 h-4 text-darkGrey/40" />
              </Link>

              <Link
                href="/lms/Instructor_Portal/analytics"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.lightGrey,
                  color: BRAND_COLORS.darkGrey 
                }}
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.deepRed}10` }}>
                  <BarChart className="w-4 h-4" style={{ color: BRAND_COLORS.deepRed }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">View Analytics</h4>
                  <p className="text-xs text-darkGrey/70">Course performance data</p>
                </div>
                <ChevronRight className="w-4 h-4 text-darkGrey/40" />
              </Link>
            </div>

            {/* Course Info Section */}
            <div className="mt-6 pt-5 border-t border-softGrey">
              <h3 className="text-sm font-semibold mb-3" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-darkGrey/70">Duration:</span>
                  <span className="font-medium text-darkGrey">{assignedCourse.duration}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-darkGrey/70">Category:</span>
                  <span className="font-medium text-darkGrey">{assignedCourse.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-darkGrey/70">Price:</span>
                  <span className="font-medium text-darkGrey">{assignedCourse.price}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-darkGrey/70">Modules:</span>
                  <span className="font-medium text-darkGrey">{assignedCourse.modules?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Recent Activity
              </h2>
              <button 
                onClick={() => instructor && assignedCourse && loadRecentActivities(instructor.id, assignedCourse.id)}
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
                            <h4 className="font-medium text-darkGrey text-sm truncate">
                              {activity.title}
                            </h4>
                            <p className="text-xs text-darkGrey/70 mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          <span className="text-xs text-darkGrey/60 whitespace-nowrap">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ 
                              backgroundColor: colors.bg.replace('bg-', '').split('-')[0] + '20',
                              color: colors.text.replace('text-', '').split('-')[0] + '700'
                            }}>
                            {activity.type}
                          </span>
                          <span className="text-xs text-darkGrey/60">
                            • {activity.action}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
                <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
                  No Recent Activity
                </h3>
                <p className="text-darkGrey/70 mb-4 text-sm">
                  Start by creating content for your students.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Link
                    href="/lms/Instructor_Portal/assignments/create"
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    style={{ 
                      backgroundColor: BRAND_COLORS.darkRoyalBlue,
                      color: BRAND_COLORS.white 
                    }}
                  >
                    Create Assignment
                  </Link>
                  <button
                    onClick={resetDemoMaterials}
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
                    style={{ 
                      borderColor: BRAND_COLORS.teal,
                      color: BRAND_COLORS.teal 
                    }}
                  >
                    Add Demo Material
                  </button>
                </div>
              </div>
            )}

            {/* Activity Stats */}
            {recentActivities.length > 0 && (
              <div className="mt-6 pt-5 border-t border-softGrey">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                    <p className="text-xs text-darkGrey/70 mb-1">Today</p>
                    <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                      {recentActivities.filter(a => 
                        new Date(a.timestamp).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                    <p className="text-xs text-darkGrey/70 mb-1">This Week</p>
                    <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                      {recentActivities.filter(a => 
                        new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                    <p className="text-xs text-darkGrey/70 mb-1">Assignments</p>
                    <p className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                      {recentActivities.filter(a => a.type === 'assignment').length}
                    </p>
                  </div>
                
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

     
    </div>
  )
}

// Add RefreshCw icon component
const RefreshCw = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
)