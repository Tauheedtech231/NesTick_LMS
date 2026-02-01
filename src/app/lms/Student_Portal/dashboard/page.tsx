// app/lms/Student_Portal/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, CheckCircle, Clock, Target, TrendingUp,
  User,  GraduationCap , Hash, FileText,
  Video, Award, 
} from 'lucide-react'

/* eslint-disable */

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  color: string;
  category: string;
  level: string;
  duration: string;
  courseFee: string;
  creditHours: string;
  enrollmentDate: string;
}

interface Student {
  id: string;
  learnerId: string;
  email: string;
  username: string;
  fullName: string;
  course: string;
  courseId: string;
  courseName: string;
  courseDuration: string;
  courseFee: string;
  creditHours: string;
  category: string;
  level: string;
  registrationDate: string;
  status: string;
}

interface DashboardStats {
  totalCourses: number;
  completedModules: number;
  pendingTasks: number;
  totalStudyHours: number;
  overallProgress: number;
}

export default function DashboardPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedModules: 0,
    pendingTasks: 0,
    totalStudyHours: 0,
    overallProgress: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('currentStudent')
    
    if (!studentData) {
      router.push('/lms/auth/login')
      return
    }

    try {
      const parsedStudent: Student = JSON.parse(studentData)
      setStudent(parsedStudent)

      const allStudents = JSON.parse(localStorage.getItem('students') || '[]')
      const currentStudent = allStudents.find((s: any) => s.id === parsedStudent.id)

      if (currentStudent) {
        const enrolledCourse: Course = {
          id: currentStudent.courseId || 'course_001',
          title: currentStudent.courseName || currentStudent.course || 'Web Development',
          description: `${currentStudent.category || 'Programming'} Course - ${currentStudent.level || 'Beginner'}`,
          instructor: 'Dr. Sarah Johnson',
          progress: currentStudent.progress?.overall || 0,
          totalModules: currentStudent.progress?.totalModules || 10,
          completedModules: currentStudent.progress?.completedModules || 0,
          color: '#6B21A8',
          category: currentStudent.category || 'Programming',
          level: currentStudent.level || 'Beginner',
          duration: currentStudent.courseDuration || '3 months',
          courseFee: currentStudent.courseFee || 'Rs 15,000',
          creditHours: currentStudent.creditHours || '3',
          enrollmentDate: currentStudent.registrationDate || new Date().toISOString()
        }

        setCourses([enrolledCourse])

        const totalCourses = 1
        const completedModules = enrolledCourse.completedModules
        const totalModules = enrolledCourse.totalModules
        const pendingTasks = totalModules - completedModules
        const overallProgress = enrolledCourse.progress
        const totalStudyHours = Math.round(completedModules * 1.5)

        setStats({
          totalCourses,
          completedModules,
          pendingTasks,
          totalStudyHours,
          overallProgress
        })
      }
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentStudent')
    router.push('/student-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section - Simplified */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
  <h1 className="text-2xl font-semibold text-gray-900">
    Welcome back, {student.fullName.split(' ')[0]}
  </h1>

  <p className="text-sm text-gray-600 mt-1">
    Ready to continue learning?
  </p>

  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      Active
    </span>

    <span>
      {student.courseName || student.course}
    </span>

    <span>
      ID: {student.learnerId}
    </span>
  </div>
</div>


      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedModules}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">out of {courses[0]?.totalModules || 0} modules</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingTasks}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">tasks remaining</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Study Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudyHours}h</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">total time spent</p>
        </div>
      </div>

    

      
     

      {/* Quick Actions */}
     <div className="bg-white rounded-xl border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    Quick Actions
  </h2>

  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
    <li>
      <Link
        href="/lms/Student_Portal/materials"
        className="block px-4 py-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-gray-50 transition"
      >
        Materials
      </Link>
    </li>

    <li>
      <Link
        href="/lms/Student_Portal/assignments"
        className="block px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-gray-50 transition"
      >
        Assignments
      </Link>
    </li>

    <li>
      <Link
        href="/lms/Student_Portal/quizzes"
        className="block px-4 py-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-gray-50 transition"
      >
        Quizzes
      </Link>
    </li>

    <li>
      <Link
        href="/lms/Student_Portal/progress"
        className="block px-4 py-3 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-gray-50 transition"
      >
        Progress
      </Link>
    </li>
  </ul>
</div>


      {/* Recent Activity */}
 

<div className="bg-white rounded-xl border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
    
  </div>

  <div className="space-y-3">
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
      <CheckCircle className="w-5 h-5 text-purple-600" />
      <div className="flex-1">
        <p className="text-gray-900 font-medium">Completed Module 3</p>
        <p className="text-sm text-gray-500">Introduction to React</p>
      </div>
      <span className="text-sm text-gray-500">2 hours ago</span>
    </div>

    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
      <CheckCircle className="w-5 h-5 text-purple-600" />
      <div className="flex-1">
        <p className="text-gray-900 font-medium">Assignment submitted</p>
        <p className="text-sm text-gray-500">Web Development Basics</p>
      </div>
      <span className="text-sm text-gray-500">Yesterday</span>
    </div>

    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
      <CheckCircle className="w-5 h-5 text-purple-600" />
      <div className="flex-1">
        <p className="text-gray-900 font-medium">Watched video lecture</p>
        <p className="text-sm text-gray-500">JavaScript Fundamentals</p>
      </div>
      <span className="text-sm text-gray-500">2 days ago</span>
    </div>
  </div>
</div>


      {/* Course Details Card */}
   {courses.length > 0 && (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
    {/* Course Name */}
    <h2 className="text-lg font-semibold text-gray-900 mb-2">{courses[0].title}</h2>
    
    {/* Section Title */}
    <div className="text-sm text-gray-500 mb-4">Course Information</div>

    {/* Info Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-transparent p-2 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 mb-1">Start Date</div>
        <div className="font-semibold text-gray-900">
          {new Date(courses[0].enrollmentDate).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      </div>

      <div className="bg-transparent p-2 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 mb-1">Duration</div>
        <div className="font-semibold text-gray-900">{courses[0].duration}</div>
      </div>

      <div className="bg-transparent p-2 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 mb-1">Credit Hours</div>
        <div className="font-semibold text-gray-900">{courses[0].creditHours}</div>
      </div>

      <div className="bg-transparent p-2 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 mb-1">Status</div>
        <div className="font-semibold text-green-600">In Progress</div>
      </div>
    </div>
  </div>
)}

    </div>
  )
}