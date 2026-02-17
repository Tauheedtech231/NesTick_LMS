'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Download,
  Mail,
  Phone,
  User,
  BarChart,
  PieChart,
  Activity,
  Plus,
  GraduationCap,
  Trophy
} from 'lucide-react'

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

// Hardcoded courses data - typed as Course[]
const hardcodedCourses: Course[] = [
  {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    category: 'Technical Training',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
    duration: '8 Weeks',
    studentCapacity: 20,
    level: 'Beginner to Advanced',
    price: 'PKR 25,000',
    originalPrice: 'PKR 30,000',
    status: 'published', // ✅ now correctly typed as 'published'
    instructorId: 'system',
    instructorName: 'System Instructor',
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
   
    rating: 4.8,
    isHardcoded: true
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    category: 'Safety Training',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    duration: '6 Weeks',
    studentCapacity: 15,
    level: 'Intermediate',
    price: 'PKR 30,000',
    originalPrice: 'PKR 35,000',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    
    rating: 4.9,
    isHardcoded: true
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    category: 'Technical Training',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    duration: '10 Weeks',
    studentCapacity: 12,
    level: 'Beginner to Professional',
    price: 'PKR 35,000',
    originalPrice: 'PKR 40,000',
    status: 'published',
    instructorId: 'system',
    instructorName: 'System Instructor',
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    
    rating: 4.7,
    isHardcoded: true
  }
];

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  studentCapacity: number;
  level: string;
  price: string;
  originalPrice?: string;
  status: 'draft' | 'published';
  instructorId: string;
  instructorName: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  rating?: number;
  isHardcoded?: boolean;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  attendance: number;
  slidesCompleted: number;
  totalSlides: number;
  quizScore: number;
  maxQuizScore: number;
  quizAttempts: number;
  quizPassed: number;
  totalQuizzes: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  status: 'active' | 'inactive';
  avatar: string | null;
  lastActive: string;
  hasCertificate: boolean;
  certificateId?: string;
  certificateDate?: string;
  performance: { week: string; score: number }[];
}

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}
/* eslint-disable */

export default function StudentsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'progress' | 'quiz' | 'certificate'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'certified'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)

  useEffect(() => {
    loadInstructorAndCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadStudentsForCourse()
    }
  }, [selectedCourse, enrollments])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, sortBy, sortOrder, filterStatus])

  const loadInstructorAndCourses = () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser')
      let currentInstructor = null
      
      if (currentUserStr) {
        currentInstructor = JSON.parse(currentUserStr)
        setInstructor(currentInstructor)
      }

      const localStorageCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      
      let instructorLocalCourses: Course[] = []
      if (currentInstructor) {
        instructorLocalCourses = localStorageCourses.filter((c: Course) => 
          c.instructorId === currentInstructor.id || c.instructorName === currentInstructor.name
        )
      }

      // Combine hardcoded courses with instructor's localStorage courses
      const allCourses: Course[] = [...hardcodedCourses, ...instructorLocalCourses]
      setCourses(allCourses)
      
      if (allCourses.length > 0) {
        setSelectedCourse(allCourses[0].id)
      }

      // Load enrollments from the correct key
      loadEnrollments()
      
    } catch (error) {
      console.error('Error loading courses:', error)
      setCourses(hardcodedCourses)
      if (hardcodedCourses.length > 0) {
        setSelectedCourse(hardcodedCourses[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadEnrollments = () => {
    const stored = localStorage.getItem('enrollments')
    if (stored) {
      setEnrollments(JSON.parse(stored))
    } else {
      // No real enrollments, create sample data for demonstration
      createSampleEnrollments()
    }
  }

  const createSampleEnrollments = () => {
    if (courses.length === 0) return

    const sampleEnrollments: Enrollment[] = []
    courses.forEach(course => {
      const sampleStudents = [
        {
          id: `sample_stu_${course.id}_1`,
          name: 'Ahmed Khan',
          email: 'ahmed.khan@example.com',
          phone: '+92 300 1234567',
        },
        {
          id: `sample_stu_${course.id}_2`,
          name: 'Fatima Ali',
          email: 'fatima.ali@example.com',
          phone: '+92 321 9876543',
        },
        {
          id: `sample_stu_${course.id}_3`,
          name: 'Bilal Ahmed',
          email: 'bilal.ahmed@example.com',
          phone: '+92 333 5557777',
        }
      ]
      sampleStudents.forEach(s => {
        sampleEnrollments.push({
          id: `enroll_${course.id}_${s.id}`,
          courseId: course.id,
          courseTitle: course.title,
          studentId: s.id,
          studentName: s.name,
          studentEmail: s.email,
          studentPhone: s.phone,
          enrollmentDate: '2024-01-15',
          status: 'active',
          lastActive: new Date().toISOString()
        })
      })
    })
    localStorage.setItem('enrollments', JSON.stringify(sampleEnrollments))
    setEnrollments(sampleEnrollments)
  }

  // Function to check if a student has certificate for a course
  const checkCertificateStatus = (studentId: string, courseId: string): { has: boolean; certId?: string; date?: string } => {
    try {
      const certificates = JSON.parse(localStorage.getItem('studentCertificates') || '[]')
      const studentCert = certificates.find((c: any) => 
        c.studentId === studentId && c.courseId === courseId
      )
      return {
        has: !!studentCert,
        certId: studentCert?.certificateId,
        date: studentCert?.issueDate
      }
    } catch (error) {
      return { has: false }
    }
  }

  // Function to load real quiz data for a student
  const loadStudentQuizData = (studentId: string, courseId: string) => {
    try {
      const quizAttemptsKey = `quizAttempts_${studentId}`
      const savedAttempts = localStorage.getItem(quizAttemptsKey)
      if (!savedAttempts) return { quizScore: 0, quizAttempts: 0, quizPassed: 0, totalQuizzes: 0 }
      
      const attempts = JSON.parse(savedAttempts)
      const courseQuizzes = Object.values(attempts).filter((a: any) => a.courseId === courseId)
      
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const courseQuizzesList = allQuizzes.filter((q: any) => q.courseId === courseId)
      const totalQuizzes = courseQuizzesList.length
      
      const avgScore = courseQuizzes.length > 0 
        ? Math.round(courseQuizzes.reduce((sum: number, a: any) => sum + a.score, 0) / courseQuizzes.length)
        : 0
      
      const passedQuizzes = courseQuizzes.filter((a: any) => a.passed).length
      
      return {
        quizScore: avgScore,
        quizAttempts: courseQuizzes.length,
        quizPassed: passedQuizzes,
        totalQuizzes
      }
    } catch (error) {
      return { quizScore: 0, quizAttempts: 0, quizPassed: 0, totalQuizzes: 0 }
    }
  }

  // Function to load real assignment data for a student
  const loadStudentAssignmentData = (studentId: string, studentEmail: string, courseId: string) => {
    try {
      const submissionsKey = 'assignmentSubmissions'
      const savedSubmissions = localStorage.getItem(submissionsKey)
      if (!savedSubmissions) return { assignmentsSubmitted: 0, totalAssignments: 0 }
      
      const submissions = JSON.parse(savedSubmissions)
      const courseSubmissions = submissions.filter((s: any) => 
        s.courseId === courseId && 
        (s.studentId === studentId || s.studentEmail === studentEmail)
      )
      
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const courseAssignments = allAssignments.filter((a: any) => a.courseId === courseId)
      
      return {
        assignmentsSubmitted: courseSubmissions.length,
        totalAssignments: courseAssignments.length
      }
    } catch (error) {
      return { assignmentsSubmitted: 0, totalAssignments: 0 }
    }
  }

  // Function to load real slide progress
  const loadSlideProgress = (studentId: string, courseId: string) => {
    try {
      const completedKey = `completedSlides_${studentId}_${courseId}`
      const savedCompleted = localStorage.getItem(completedKey)
      const completedSlides = savedCompleted ? JSON.parse(savedCompleted) : []
      
      const allSlides = JSON.parse(localStorage.getItem('slides') || '[]')
      const courseSlides = allSlides.filter((s: any) => s.courseId === courseId)
      const totalSlides = courseSlides.length
      
      return {
        completedSlides: completedSlides.length,
        totalSlides
      }
    } catch (error) {
      return { completedSlides: 0, totalSlides: 0 }
    }
  }

  // Build student objects from enrollments and real progress data
  const loadStudentsForCourse = () => {
    const courseEnrollments = enrollments.filter(e => e.courseId === selectedCourse)
    if (courseEnrollments.length === 0) {
      setStudents([])
      return
    }

    const studentList: Student[] = courseEnrollments.map(enrollment => {
      const studentId = enrollment.studentId

      const slideData = loadSlideProgress(studentId, selectedCourse)
      const quizData = loadStudentQuizData(studentId, selectedCourse)
      const assignmentData = loadStudentAssignmentData(studentId, enrollment.studentEmail, selectedCourse)
      const certStatus = checkCertificateStatus(studentId, selectedCourse)

      // For demo, generate some performance data (could be from actual weekly scores if stored)
      const performance = [
        { week: 'Week 1', score: Math.floor(Math.random() * 30 + 60) },
        { week: 'Week 2', score: Math.floor(Math.random() * 30 + 60) },
        { week: 'Week 3', score: Math.floor(Math.random() * 30 + 60) },
        { week: 'Week 4', score: Math.floor(Math.random() * 30 + 60) }
      ]

      return {
        id: studentId,
        name: enrollment.studentName,
        email: enrollment.studentEmail,
        phone: enrollment.studentPhone || 'N/A',
        enrollmentDate: enrollment.enrollmentDate,
        attendance: 0, // Not tracked yet
        slidesCompleted: slideData.completedSlides,
        totalSlides: slideData.totalSlides,
        quizScore: quizData.quizScore,
        maxQuizScore: 100,
        quizAttempts: quizData.quizAttempts,
        quizPassed: quizData.quizPassed,
        totalQuizzes: quizData.totalQuizzes,
        assignmentsSubmitted: assignmentData.assignmentsSubmitted,
        totalAssignments: assignmentData.totalAssignments,
        status: enrollment.status,
        avatar: null,
        lastActive: enrollment.lastActive || enrollment.enrollmentDate,
        hasCertificate: certStatus.has,
        certificateId: certStatus.certId,
        certificateDate: certStatus.date,
        performance
      }
    })

    setStudents(studentList)
  }

  const filterAndSortStudents = () => {
    let filtered = [...students]

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'certified') {
        filtered = filtered.filter(s => s.hasCertificate === true)
      } else {
        filtered = filtered.filter(s => s.status === filterStatus)
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'attendance':
          comparison = a.attendance - b.attendance
          break
        case 'progress':
          const aProgress = a.totalSlides ? (a.slidesCompleted / a.totalSlides) * 100 : 0
          const bProgress = b.totalSlides ? (b.slidesCompleted / b.totalSlides) * 100 : 0
          comparison = aProgress - bProgress
          break
        case 'quiz':
          const aQuizPercent = a.totalQuizzes ? (a.quizPassed / a.totalQuizzes) * 100 : 0
          const bQuizPercent = b.totalQuizzes ? (b.quizPassed / b.totalQuizzes) * 100 : 0
          comparison = aQuizPercent - bQuizPercent
          break
        case 'certificate':
          comparison = (a.hasCertificate ? 1 : 0) - (b.hasCertificate ? 1 : 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredStudents(filtered)
  }

  const handleAttendanceUpdate = (studentId: string, newAttendance: number) => {
    // Attendance not persisted; just update local state for UI
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, attendance: newAttendance } : s
    ))
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse)

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
            <p className="mt-4 text-darkGrey">Loading students data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Courses Found
          </h3>
          <p className="text-darkGrey/70 mb-4">
            You need to create a course first to view enrolled students.
          </p>
          <Link
            href="/lms/Instructor_Portal/courses/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <Plus className="w-4 h-4" />
            Create Your First Course
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Student Enrollment & Progress
              </h1>
              <p className="text-sm sm:text-base text-darkGrey mt-1">
                Monitor student progress, attendance, quiz performance, and certificates
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.teal,
                color: BRAND_COLORS.white 
              }}
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Course Selection and Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Course Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                style={{ color: BRAND_COLORS.darkNavy }}
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} - {course.category} 
                    {course.isHardcoded ? ' (Demo)' : course.status === 'draft' ? ' (Draft)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-darkGrey/40" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                />
              </div>
            </div>

            {/* Filter Toggle - Mobile */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-softGrey rounded-lg"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Sort Options - Desktop */}
            <div className="hidden sm:block">
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue bg-white text-sm"
                >
                  <option value="name">Name</option>
                  <option value="attendance">Attendance</option>
                  <option value="progress">Progress</option>
                  <option value="quiz">Quiz Pass Rate</option>
                  <option value="certificate">Certificate</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 border border-softGrey rounded-lg hover:bg-lightGrey"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 space-y-3 sm:hidden">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg bg-white"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="certified">Certified Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-softGrey rounded-lg bg-white"
                >
                  <option value="name">Name</option>
                  <option value="attendance">Attendance</option>
                  <option value="progress">Progress</option>
                  <option value="quiz">Quiz Pass Rate</option>
                  <option value="certificate">Certificate</option>
                </select>
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-4 py-2.5 border border-softGrey rounded-lg flex items-center justify-center gap-2"
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Course Summary Cards */}
      {selectedCourseData && filteredStudents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
            <p className="text-xs text-darkGrey/60 mb-1">Total Students</p>
            <p className="text-lg sm:text-xl font-semibold text-darkGrey">{filteredStudents.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
            <p className="text-xs text-darkGrey/60 mb-1">Active</p>
            <p className="text-lg sm:text-xl font-semibold text-green-600">
              {filteredStudents.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
            <p className="text-xs text-darkGrey/60 mb-1">Avg Progress</p>
            <p className="text-lg sm:text-xl font-semibold" style={{ color: BRAND_COLORS.teal }}>
              {filteredStudents.length > 0 
                ? Math.round(filteredStudents.reduce((acc, s) => acc + (s.slidesCompleted / s.totalSlides) * 100, 0) / filteredStudents.length) 
                : 0}%
            </p>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
            <p className="text-xs text-darkGrey/60 mb-1">Certified</p>
            <p className="text-lg sm:text-xl font-semibold text-purple-600">
              {filteredStudents.filter(s => s.hasCertificate).length}
            </p>
          </div>
        </div>
      )}

      {/* Students List - Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg border border-softGrey overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lightGrey">
              <tr>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Student</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Enrollment</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Attendance</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Slide Progress</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Quiz Pass Rate</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Assignments</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Certificate</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-darkGrey/70 py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softGrey">
              {filteredStudents.map((student) => {
                const progress = student.totalSlides ? (student.slidesCompleted / student.totalSlides) * 100 : 0
                const quizPassRate = student.totalQuizzes ? (student.quizPassed / student.totalQuizzes) * 100 : 0
                
                return (
                  <tr key={student.id} className="hover:bg-lightGrey/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-medium text-darkGrey text-sm">{student.name}</p>
                          <p className="text-xs text-darkGrey/60">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-darkGrey/40" />
                        <span className="text-sm text-darkGrey">{formatDate(student.enrollmentDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getProgressColor(student.attendance)}`}>
                          {student.attendance}%
                        </span>
                        <div className="w-16 h-1.5 bg-lightGrey rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressBarColor(student.attendance)}`}
                            style={{ width: `${student.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${getProgressColor(progress)}`}>
                            {Math.round(progress)}%
                          </span>
                          <span className="text-xs text-darkGrey/60">
                            {student.slidesCompleted}/{student.totalSlides}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-lightGrey rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressBarColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${getProgressColor(quizPassRate)}`}>
                            {Math.round(quizPassRate)}%
                          </span>
                          <span className="text-xs text-darkGrey/60">
                            {student.quizPassed}/{student.totalQuizzes}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-lightGrey rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressBarColor(quizPassRate)}`}
                            style={{ width: `${quizPassRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-sm font-medium">
                          {student.assignmentsSubmitted}/{student.totalAssignments}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {student.hasCertificate ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Trophy className="w-3 h-3 mr-1" />
                          Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Certified
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {student.status === 'active' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentModal(true)
                        }}
                        className="p-2 text-darkRoyalBlue hover:bg-darkRoyalBlue/5 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students List - Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredStudents.map((student) => {
          const progress = student.totalSlides ? (student.slidesCompleted / student.totalSlides) * 100 : 0
          const quizPassRate = student.totalQuizzes ? (student.quizPassed / student.totalQuizzes) * 100 : 0
          
          return (
            <div key={student.id} className="bg-white rounded-lg border border-softGrey p-4">
              {/* Header with Name and Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <h3 className="font-medium text-darkGrey">{student.name}</h3>
                    <p className="text-xs text-darkGrey/60">{student.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {student.status}
                  </span>
                  {student.hasCertificate && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <Trophy className="w-3 h-3 inline mr-1" />
                      Certified
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-xs text-darkGrey/60">Enrollment</p>
                  <p className="text-darkGrey">{formatDate(student.enrollmentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-darkGrey/60">Phone</p>
                  <p className="text-darkGrey">{student.phone}</p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 mb-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkGrey/60">Attendance</span>
                    <span className={`font-medium ${getProgressColor(student.attendance)}`}>
                      {student.attendance}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressBarColor(student.attendance)}`}
                      style={{ width: `${student.attendance}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkGrey/60">Slide Progress</span>
                    <span className={`font-medium ${getProgressColor(progress)}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressBarColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkGrey/60">Quiz Pass Rate</span>
                    <span className={`font-medium ${getProgressColor(quizPassRate)}`}>
                      {Math.round(quizPassRate)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-lightGrey rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressBarColor(quizPassRate)}`}
                      style={{ width: `${quizPassRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-darkGrey/60">Assignments</span>
                    <span className="font-medium">
                      {student.assignmentsSubmitted}/{student.totalAssignments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedStudent(student)
                    setShowStudentModal(true)
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: BRAND_COLORS.darkRoyalBlue,
                    color: BRAND_COLORS.white 
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-softGrey flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-darkGrey">Student Details</h2>
                <p className="text-sm text-darkGrey/60">View complete student information and performance</p>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-2 hover:bg-lightGrey rounded-lg"
              >
                <XCircle className="w-5 h-5 text-darkGrey/60" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-darkGrey">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-darkGrey/40" />
                    <span className="text-sm text-darkGrey/70">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-darkGrey/40" />
                    <span className="text-sm text-darkGrey/70">{selectedStudent.phone}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Info */}
              {selectedStudent.hasCertificate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-purple-800">Certificate Earned</h4>
                      <p className="text-sm text-purple-600">Certificate ID: {selectedStudent.certificateId}</p>
                      <p className="text-xs text-purple-500 mt-1">
                        Issued on: {formatDate(selectedStudent.certificateDate || '')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-lightGrey rounded-lg p-3">
                  <p className="text-xs text-darkGrey/60 mb-1">Student ID</p>
                  <p className="font-medium text-darkGrey text-sm">{selectedStudent.id}</p>
                </div>
                <div className="bg-lightGrey rounded-lg p-3">
                  <p className="text-xs text-darkGrey/60 mb-1">Enrolled</p>
                  <p className="font-medium text-darkGrey text-sm">{formatDate(selectedStudent.enrollmentDate)}</p>
                </div>
                <div className="bg-lightGrey rounded-lg p-3">
                  <p className="text-xs text-darkGrey/60 mb-1">Last Active</p>
                  <p className="font-medium text-darkGrey text-sm">{formatDate(selectedStudent.lastActive)}</p>
                </div>
                <div className="bg-lightGrey rounded-lg p-3">
                  <p className="text-xs text-darkGrey/60 mb-1">Quiz Attempts</p>
                  <p className="font-medium text-darkGrey text-sm">{selectedStudent.quizAttempts}</p>
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <h4 className="font-medium text-darkGrey mb-3">Weekly Performance</h4>
                <div className="space-y-2">
                  {selectedStudent.performance.map((week) => (
                    <div key={week.week}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-darkGrey/70">{week.week}</span>
                        <span className="font-medium text-darkGrey">{week.score}%</span>
                      </div>
                      <div className="h-2 bg-lightGrey rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-darkRoyalBlue"
                          style={{ width: `${week.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Edit */}
              <div>
                <h4 className="font-medium text-darkGrey mb-3">Update Attendance</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedStudent.attendance}
                    onChange={(e) => {
                      const newAttendance = parseInt(e.target.value)
                      handleAttendanceUpdate(selectedStudent.id, newAttendance)
                      setSelectedStudent({ ...selectedStudent, attendance: newAttendance })
                    }}
                    className="flex-1"
                    style={{ accentColor: BRAND_COLORS.teal }}
                  />
                  <span className="text-lg font-semibold" style={{ color: BRAND_COLORS.teal }}>
                    {selectedStudent.attendance}%
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-softGrey flex justify-end">
              <button
                onClick={() => setShowStudentModal(false)}
                className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredStudents.length === 0 && selectedCourse && (
        <div className="bg-white rounded-lg border border-softGrey p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-3" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-base font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Students Found
          </h3>
          <p className="text-darkGrey/70 text-sm">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No students enrolled in this course yet'}
          </p>
        </div>
      )}
    </div>
  )
}