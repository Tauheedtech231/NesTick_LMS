'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  Clock,
  DollarSign,
  Star,
  Edit,
 
  BarChart,
  FileText,
  
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

export default function CoursesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [assignedCourse, setAssignedCourse] = useState<any>(null)
  const [stats, setStats] = useState({
    totalModules: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    totalStudents: 0
  })

  useEffect(() => {
    const loadData = () => {
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

        // Load all courses
        const allCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
        
        // Find instructor's assigned course
        const courseId = currentUser.courseId || currentUser.assignedCourseId
        const assigned = allCourses.find((c: any) => c.id === courseId)
        
        setAssignedCourse(assigned)
        setCourses([assigned].filter(Boolean)) // Only show assigned course

        if (assigned) {
          // Calculate stats
          const modules = assigned.modules || []
          const assignments = modules.filter((m: any) => m.type === 'assignment')
          const quizzes = modules.filter((m: any) => m.type === 'quiz')
          
          setStats({
            totalModules: modules.length,
            totalAssignments: assignments.length,
            totalQuizzes: quizzes.length,
            totalStudents: parseInt(assigned.students) || 0
          })
        }
        
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!assignedCourse) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Course Assigned</h2>
          <p className="text-gray-500 mb-6">
            You are not assigned to any course yet. Please contact the administrator.
          </p>
          <Link
            href="/lms/auth/login?type=instructor"
            className="text-darkRoyalBlue hover:text-darkRoyalBlue/80 font-medium"
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-softGrey">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                My Course
              </h1>
              <p className="text-darkGrey mt-1">
                Manage your assigned course and content
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-darkGrey/70">Instructor</p>
                <p className="font-medium text-darkGrey">{instructor.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-darkRoyalBlue to-deepRed flex items-center justify-center text-white font-semibold">
                {instructor.name.charAt(0)}
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Modules</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalModules}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Learning units</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Students</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalStudents}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Enrolled</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Assignments</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalAssignments}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Created</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70 mb-1">Quizzes</p>
              <h3 className="text-2xl font-bold text-darkNavy">{stats.totalQuizzes}</h3>
              <p className="text-xs text-darkGrey/70 mt-1">Created</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <BarChart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Information
              </h2>
              <Link
                href={`/lms/Instructor_Portal/courses/edit/${assignedCourse.id}`}
                className="flex items-center gap-2 px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Course
              </Link>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-darkRoyalBlue mb-2">{assignedCourse.title}</h3>
                <p className="text-darkGrey">{assignedCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Duration</span>
                  </div>
                  <div className="text-darkNavy font-semibold">{assignedCourse.duration}</div>
                </div>

                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Students</span>
                  </div>
                  <div className="text-darkNavy font-semibold">{assignedCourse.students}</div>
                </div>

                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Rating</span>
                  </div>
                  <div className="text-darkNavy font-semibold">{assignedCourse.rating}/5.0</div>
                </div>

                <div className="bg-lightGrey rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-darkGrey/70" />
                    <span className="text-sm font-medium text-darkGrey">Price</span>
                  </div>
                  <div className="text-darkNavy font-semibold">{assignedCourse.price}</div>
                </div>
              </div>

              {/* Course Highlights */}
              <div>
                <h4 className="font-medium text-darkGrey mb-3">Course Highlights</h4>
                <ul className="space-y-2">
                  {assignedCourse.highlights?.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-deepRed mt-2"></div>
                      <span className="text-darkGrey/80">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <Link
                href="/lms/Instructor_Portal/assignments/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-darkGrey">Create Assignment</h4>
                  <p className="text-sm text-darkGrey/70">New assignment for students</p>
                </div>
              </Link>

              <Link
                href="/lms/Instructor_Portal/quizzes/create"
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all"
              >
                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                  <BarChart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-darkGrey">Create Quiz</h4>
                  <p className="text-sm text-darkGrey/70">Interactive quiz for assessment</p>
                </div>
              </Link>

              <Link
                href={`/lms/Instructor_Portal/courses/edit/${assignedCourse.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-softGrey hover:border-darkRoyalBlue hover:bg-lightGrey transition-all"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10`, color: BRAND_COLORS.darkRoyalBlue }}>
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-darkGrey">Edit Course</h4>
                  <p className="text-sm text-darkGrey/70">Update course details</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Course Status */}
          <div className="bg-white rounded-lg border border-softGrey p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
              Course Status
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Course Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Enrollment</span>
                <span className="font-medium text-darkNavy">{assignedCourse.students}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Featured</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  assignedCourse.featured 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {assignedCourse.featured ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Category</span>
                <span className="font-medium text-darkNavy">{assignedCourse.category}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-darkGrey">Level</span>
                <span className="font-medium text-darkNavy">{assignedCourse.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}