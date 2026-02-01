'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  HiPlus, HiSearch, HiCalendar, 
  HiBookOpen, HiClock,
  HiPencil, HiTrash, HiEye, 
   HiChartBar, HiUsers,
  HiChevronDown, HiStar, HiDownload,
  HiQuestionMarkCircle
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'
/* eslint-disable */

interface Quiz {
  id: string
  courseId: string
  title: string
  description: string
  totalMarks: number
  dueDate: string
  duration: number
  createdAt: string
  createdBy: string
  status: 'active' | 'draft'
  questions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    marks: number
  }[]
  submissions: any[]
  instructions?: string
}

interface Course {
  id: string
  title: string
  code: string
}

interface Submission {
  id: string
  quizId: string
  studentId: string
  studentName: string
  studentEmail: string
  submittedAt: string
  answers: {
    questionId: string
    selectedOption: number
    isCorrect: boolean
    marksObtained: number
  }[]
  totalMarksObtained: number
  totalMarks: number
  percentage: number
  status: 'submitted' | 'graded' | 'late'
}

export default function QuizzesListPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  const loadData = () => {
    try {
      // Get current instructor
      const userData = localStorage.getItem('currentUser')
      let currentUser = null
      if (userData) {
        currentUser = JSON.parse(userData)
      }

      // Get assigned courses
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
      
      let assignedCourses: Course[] = []
      let assignedCourseIds: string[] = []
      
      if (currentUser?.email === 'instructor@gmail.com') {
        assignedCourses = allCourses
        assignedCourseIds = allCourses.map((c: Course) => c.id)
      } else if (currentUser?.role === 'instructor') {
        const instructorDetails = allInstructors.find((instr: any) => 
          instr.email === currentUser.email || instr.id === currentUser.instructorId
        )
        
        if (instructorDetails?.assignedCourseIds) {
          assignedCourseIds = instructorDetails.assignedCourseIds
          assignedCourses = allCourses.filter((course: Course) => 
            assignedCourseIds.includes(course.id)
          )
        }
      }
      
      setCourses(assignedCourses)

      // Get quizzes from localStorage
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      
      // Filter quizzes by assigned courses
      const instructorQuizzes = allQuizzes.filter((quiz: Quiz) => 
        assignedCourseIds.includes(quiz.courseId)
      )
      
      setQuizzes(instructorQuizzes)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCourse = courseFilter === 'all' || quiz.courseId === courseFilter
      const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter
      
      return matchesSearch && matchesCourse && matchesStatus
    })
  }, [quizzes, searchTerm, courseFilter, statusFilter])

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? `${course.title} (${course.code})` : 'Unknown Course'
  }

  const getSubmissionStats = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId)
    if (!quiz) return {
      totalSubmissions: 0,
      graded: 0,
      pending: 0,
      late: 0,
      averageScore: 0
    }

    const submissions = quiz.submissions || []
    const graded = submissions.filter(s => s.status === 'graded').length
    const pending = submissions.filter(s => s.status === 'submitted').length
    const late = submissions.filter(s => s.status === 'late').length
    
    const averageScore = submissions.length > 0 
      ? submissions.reduce((acc, sub) => acc + sub.percentage, 0) / submissions.length
      : 0
    
    return {
      totalSubmissions: submissions.length,
      graded,
      pending,
      late,
      averageScore
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' }
    if (diffDays === 0) return { days: 0, status: 'today' }
    if (diffDays <= 3) return { days: diffDays, status: 'urgent' }
    return { days: diffDays, status: 'normal' }
  }

  const handleDeleteQuiz = (quizId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return
    
    try {
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const updatedQuizzes = allQuizzes.filter((q: Quiz) => q.id !== quizId)
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes))
      
      setQuizzes(updatedQuizzes)
      toast.success('Quiz deleted successfully')
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  const downloadQuizData = (quiz: Quiz) => {
    try {
      const quizData = {
        title: quiz.title,
        course: getCourseName(quiz.courseId),
        totalMarks: quiz.totalMarks,
        duration: quiz.duration,
        dueDate: quiz.dueDate,
        questions: quiz.questions.length,
        submissions: quiz.submissions?.length || 0,
        createdAt: quiz.createdAt
      }

      const csvContent = [
        ['Quiz Title', 'Course', 'Total Marks', 'Duration (min)', 'Due Date', 'Questions', 'Submissions', 'Created Date'],
        [
          quizData.title,
          quizData.course,
          quizData.totalMarks.toString(),
          quizData.duration.toString(),
          formatDate(quizData.dueDate),
          quizData.questions.toString(),
          quizData.submissions.toString(),
          formatDate(quizData.createdAt)
        ]
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${quiz.title.replace(/\s+/g, '_')}_data.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Quiz data downloaded')
    } catch (error) {
      console.error('Error downloading quiz data:', error)
      toast.error('Failed to download data')
    }
  }

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { grade: 'A', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 70) return { grade: 'B', color: 'bg-yellow-100 text-yellow-800' }
    if (percentage >= 60) return { grade: 'C', color: 'bg-orange-100 text-orange-800' }
    if (percentage >= 50) return { grade: 'D', color: 'bg-red-100 text-red-800' }
    return { grade: 'F', color: 'bg-gray-100 text-gray-800' }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Draft</span>
      default:
        return null
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
         <div className="mb-6">
  {/* Header */}
  <div className="  flex items-center justify-between mb-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
      <p className="text-gray-600">Manage MCQ-based quizzes with auto-grading</p>
    </div>
    <Link
      href="/lms/Instructor_Portal/quizzes/create"
      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2"
    >
      <HiPlus className="w-5 h-5" />
      Create Quiz
    </Link>
  </div>

  {/* Stats Row */}
  <div className="  flex flex-wrap gap-4 text-center">
    <div className="flex-1 min-w-[120px] py-3 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600">Total Quizzes</p>
      <p className="text-xl font-bold text-gray-900">{quizzes.length}</p>
    </div>

    <div className="flex-1 min-w-[120px] py-3  rounded-md">
      <p className="text-sm text-gray-600">Total Questions</p>
      <p className="text-xl font-bold text-purple-600">
        {quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0)}
      </p>
    </div>

    <div className="flex-1 min-w-[120px] py-3 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600">Total Submissions</p>
      <p className="text-xl font-bold text-amber-600">
        {quizzes.reduce((acc, quiz) => acc + (quiz.submissions?.length || 0), 0)}
      </p>
    </div>

    <div className="flex-1 min-w-[120px] py-3 bg-gray-50 rounded-md">
      <p className="text-sm text-gray-600">Average Score</p>
      <p className="text-xl font-bold text-green-600">
        {quizzes.length > 0
          ? `${(quizzes.reduce((acc, quiz) => acc + getSubmissionStats(quiz.id).averageScore, 0) / quizzes.length).toFixed(1)}%`
          : '0%'}
      </p>
    </div>
  </div>
</div>


          {/* Filters */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
  <div className="flex flex-col md:flex-row md:items-end md:gap-4">
    {/* Search */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Quizzes
      </label>
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
    </div>

    {/* Course Filter */}
    <div className="w-full md:w-48">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Course
      </label>
      <div className="relative">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>

    {/* Status Filter */}
    <div className="w-full md:w-48">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Status
      </label>
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  </div>
</div>


          {/* Quizzes List */}
          {loading ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mb-4"></div>
              <p className="text-gray-700">Loading quizzes...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Courses Assigned</h3>
              <p className="text-gray-600 mb-4">
                You haven't been assigned any courses yet.
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiQuestionMarkCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Quizzes Found</h3>
              <p className="text-gray-600 mb-4">
                {quizzes.length === 0 
                  ? "You haven't created any quizzes yet."
                  : "No quizzes match your filters."}
              </p>
              <Link
                href="/lms/Instructor_Portal/quizzes/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
              >
                <HiPlus className="w-5 h-5" />
                Create First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const stats = getSubmissionStats(quiz.id)
                const daysRemaining = getDaysRemaining(quiz.dueDate)
                const avgGrade = calculateGrade(stats.averageScore)
                
                return (
                  <div key={quiz.id} className="bg-white border border-gray-300 rounded-lg hover:shadow-lg transition-shadow overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <HiBookOpen className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1" title={quiz.title}>
                              {quiz.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{getCourseName(quiz.courseId)}</p>
                          </div>
                        </div>
                        {getStatusBadge(quiz.status)}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <HiQuestionMarkCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{quiz.questions.length} questions</span>
                        </div>
                        <span className="font-medium text-gray-900">{quiz.totalMarks} marks</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="p-4 border-b border-gray-300">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Submissions</p>
                          <p className="text-lg font-bold text-gray-900">
                            {stats.totalSubmissions}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Avg Score</p>
                          <p className="text-lg font-bold text-purple-600">
                            {stats.averageScore.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Graded</p>
                          <p className="text-lg font-bold text-green-600">
                            {stats.graded}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Pending</p>
                          <p className="text-lg font-bold text-amber-600">
                            {stats.pending}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {stats.totalSubmissions > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Submission Rate</span>
                            <span>100%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Due Date & Duration */}
                    <div className="p-4 border-b border-gray-300">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HiCalendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">Due: {formatDate(quiz.dueDate)}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            daysRemaining.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            daysRemaining.status === 'urgent' ? 'bg-amber-100 text-amber-800' :
                            daysRemaining.status === 'today' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysRemaining.status === 'overdue' ? `Overdue ${daysRemaining.days}d` :
                             daysRemaining.status === 'urgent' ? `Due in ${daysRemaining.days}d` :
                             daysRemaining.status === 'today' ? 'Due today' :
                             `In ${daysRemaining.days}d`}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <HiClock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">Duration: {quiz.duration} minutes</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${avgGrade.color}`}>
                            Avg: {avgGrade.grade}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4">
                      <div className="flex flex-col gap-3">
                        {/* View Submissions Button */}
                        {stats.totalSubmissions > 0 && (
                          <button
                            onClick={() => router.push(`/lms/Instructor_Portal/quizzes/${quiz.id}/submissions`)}
                            className="w-full px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg font-medium flex items-center justify-center gap-2"
                          >
                            <HiUsers className="w-4 h-4" />
                            View Submissions ({stats.totalSubmissions})
                          </button>
                        )}
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => router.push(`/lms/Instructor_Portal/quizzes/${quiz.id}`)}
                            className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <HiEye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => router.push(`/lms/Instructor_Portal/quizzes/${quiz.id}/edit`)}
                            className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 rounded text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <HiPencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => downloadQuizData(quiz)}
                            className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <HiDownload className="w-4 h-4" />
                            Export
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/lms/Instructor_Portal/quizzes/${quiz.id}/submissions`)}
                            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <HiStar className="w-4 h-4" />
                            Grade Quiz
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded text-sm font-medium"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

       
        </div>
      </div>
    </>
  )
}