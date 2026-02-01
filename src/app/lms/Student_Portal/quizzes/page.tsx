'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { 
  HiSearch, HiCalendar, HiClock, 
  HiBookOpen, HiCheckCircle, 
  HiPencilAlt, HiExclamationCircle,
  HiChevronRight, HiAcademicCap,
  HiChartBar, HiUserCircle, HiQuestionMarkCircle,
  HiChevronDown
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
  status: 'active' | 'draft'
  questions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    marks: number
  }[]
  submissions: any[]
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


export default function StudentQuizzesPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null)

  // Get current student function
  const getCurrentStudent = () => {
    const studentData = localStorage.getItem('currentStudent')
    if (!studentData) return null
    return JSON.parse(studentData)
  }

  // Get submission for a quiz
const getSubmissionForQuiz = (quizId: string) => {
  const quiz = quizzes.find(q => q.id === quizId)
  if (!quiz || !Array.isArray(quiz.submissions)) return null

  const currentStudent = getCurrentStudent()
  if (!currentStudent) return null

  const submission = quiz.submissions.find(
    (s: Submission) =>
      s.studentId === currentStudent.id ||
      s.studentEmail === currentStudent.email ||
      (currentStudent.id && s.studentId === currentStudent.id.toString())
  )

  return submission ?? null   // 🔥 MOST IMPORTANT LINE
}


  // Get quiz status
  const getQuizStatus = (quiz: Quiz, submission: Submission | null) => {
    const dueDate = new Date(quiz.dueDate)
    const today = new Date()
    const isOverdue = dueDate < today
    
    if (submission) {
      if (submission.status === 'graded') {
        return {
          type: 'graded',
          label: 'Graded',
          color: 'bg-green-100 text-green-800',
          borderColor: 'border-green-300',
          icon: <HiCheckCircle className="w-5 h-5 text-green-600" />,
          action: 'View Results',
          description: 'Results available'
        }
      } else if (submission.status === 'late') {
        return {
          type: 'late',
          label: 'Late Submission',
          color: 'bg-amber-100 text-amber-800',
          borderColor: 'border-amber-300',
          icon: <HiExclamationCircle className="w-5 h-5 text-amber-600" />,
          action: 'View Submission',
          description: 'Submitted after deadline'
        }
      } else if (submission.status === 'submitted') {
        return {
          type: 'submitted',
          label: 'Submitted',
          color: 'bg-blue-100 text-blue-800',
          borderColor: 'border-blue-300',
          icon: <HiCheckCircle className="w-5 h-5 text-blue-600" />,
          action: 'View Submission',
          description: 'Awaiting grading'
        }
      }
    }

    if (isOverdue) {
      return {
        type: 'overdue',
        label: 'Overdue',
        color: 'bg-red-100 text-red-800',
        borderColor: 'border-red-300',
        icon: <HiExclamationCircle className="w-5 h-5 text-red-600" />,
        action: 'Quiz Closed',
        description: 'Due date has passed'
      }
    }

    // Check if available for attempt
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      type: 'available',
      label: 'Available',
      color: 'bg-purple-100 text-purple-800',
      borderColor: 'border-purple-300',
      icon: <HiPencilAlt className="w-5 h-5 text-purple-600" />,
      action: 'Start Quiz',
      description: daysUntilDue <= 3 ? 'Due soon' : 'Ready to start'
    }
  }

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('currentStudent')
    
    if (!studentData) {
      router.push('/student-login')
      return
    }

    loadQuizzes()
  }, [router])

  const loadQuizzes = () => {
    try {
      setLoading(true)
      
      // Get current student
      const studentData = localStorage.getItem('currentStudent')
      const currentStudent = studentData ? JSON.parse(studentData) : null
      setStudent(currentStudent)

      if (!currentStudent) return

      // Get student details from students list
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]')
      const studentDetails = allStudents.find((s: any) => 
        s.id === currentStudent.id || 
        s.email === currentStudent.email ||
        (currentStudent.id && s.id === currentStudent.id.toString())
      )
      
      // If no student found in students list, use current student data
      if (!studentDetails) {
        console.warn('Student not found in students list, using current student data')
      }

      // Get student's enrolled courses
      let enrolledCourseIds: string[] = []
      
      if (studentDetails?.courseId) {
        enrolledCourseIds = [studentDetails.courseId]
      } else if (studentDetails?.enrolledCourses && Array.isArray(studentDetails.enrolledCourses)) {
        enrolledCourseIds = studentDetails.enrolledCourses
      } else if (currentStudent.courseId) {
        // Try from current student data
        enrolledCourseIds = [currentStudent.courseId]
      } else {
        // If no course found, show all active quizzes (for testing)
        console.warn('No course found for student, showing all active quizzes')
      }

      // Get all quizzes
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      
      // Filter quizzes for student's courses (or all if no course found)
      let studentQuizzes: Quiz[] = []
      if (enrolledCourseIds.length > 0) {
        studentQuizzes = allQuizzes.filter((quiz: Quiz) => 
          enrolledCourseIds.includes(quiz.courseId) && quiz.status === 'active'
        )
      } else {
        // Show all active quizzes if no course assigned (for testing)
        studentQuizzes = allQuizzes.filter((quiz: Quiz) => quiz.status === 'active')
      }
      
      setQuizzes(studentQuizzes)

      // Get courses for these quizzes
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const studentCourses = allCourses.filter((course: Course) => 
        enrolledCourseIds.includes(course.id)
      )
      setCourses(studentCourses)

    } catch (error) {
      console.error('Error loading quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCourse = courseFilter === 'all' || quiz.courseId === courseFilter
      
      // Check status based on submissions and due date
      const submission = getSubmissionForQuiz(quiz.id)
      const quizStatus = getQuizStatus(quiz, submission)
      
      const matchesStatus = statusFilter === 'all' || quizStatus.type === statusFilter
      
      return matchesSearch && matchesCourse && matchesStatus
    })
  }, [quizzes, searchTerm, courseFilter, statusFilter])

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? `${course.title}` : 'Course not found'
  }

  const getDaysRemaining = (dueDate: string) => {
    try {
      const due = new Date(dueDate)
      const today = new Date()
      const diffTime = due.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)} days ago`, overdue: true }
      if (diffDays === 0) return { days: 0, text: 'Today', urgent: true }
      if (diffDays === 1) return { days: 1, text: 'Tomorrow', urgent: true }
      if (diffDays <= 3) return { days: diffDays, text: `In ${diffDays} days`, urgent: true }
      return { days: diffDays, text: `In ${diffDays} days`, normal: true }
    } catch {
      return { days: 0, text: 'Invalid date', overdue: true }
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
      return 'Invalid date'
    }
  }

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'No time limit'
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const handleQuizAction = (quiz: Quiz) => {
    const submission = getSubmissionForQuiz(quiz.id)
    const status = getQuizStatus(quiz, submission)
    
    if (status.type === 'graded' || status.type === 'submitted' || status.type === 'late') {
      // View results
      router.push(`/lms/Student_Portal/quizzes/${quiz.id}/results`)
    } else if (status.type === 'available') {
      // Start new quiz
      if (confirm(`Start "${quiz.title}"? You'll have ${formatDuration(quiz.duration)} to complete it.`)) {
        router.push(`/lms/Student_Portal/quizzes/${quiz.id}/attempt`)
      }
    } else if (status.type === 'overdue') {
      toast.error('This quiz is no longer accepting submissions')
    }
  }

  const calculateScore = (submission: Submission) => {
    const percentage = submission.percentage || 0
    return {
      obtained: submission.totalMarksObtained || 0,
      total: submission.totalMarks || 1,
      percentage: percentage.toFixed(1),
      grade: getGrade(percentage)
    }
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50'
    if (percentage >= 80) return 'text-blue-600 bg-blue-50'
    if (percentage >= 70) return 'text-purple-600 bg-purple-50'
    if (percentage >= 60) return 'text-amber-600 bg-amber-50'
    if (percentage >= 50) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  // Calculate statistics
  const getStatistics = useMemo(() => {
    const submittedQuizzes = quizzes.filter(q => getSubmissionForQuiz(q.id) !== null)
    console.log('Submitted Quizzes:', submittedQuizzes)
    const gradedQuizzes = submittedQuizzes.filter(q => {
  const sub = getSubmissionForQuiz(q.id)
  return (
    sub &&
    (
      sub.status === 'graded' ||
      typeof sub.totalMarksObtained === 'number'
    )
  )
})

    
    // Calculate average score only for graded quizzes
    let averageScore = 0
    if (gradedQuizzes.length > 0) {
      const totalPercentage = gradedQuizzes.reduce((sum, q) => {
        const sub = getSubmissionForQuiz(q.id)
        return sum + (sub?.percentage || 0)
      }, 0)
      averageScore = totalPercentage / gradedQuizzes.length
    }
    
    // Count upcoming quizzes (not submitted and not overdue)
    const upcomingQuizzes = quizzes.filter(q => {
      const sub = getSubmissionForQuiz(q.id)
      const due = new Date(q.dueDate)
      const today = new Date()
      return !sub && due > today
    })

    return {
      totalQuizzes: quizzes.length,
      availableQuizzes: quizzes.filter(q => {
        const sub = getSubmissionForQuiz(q.id)
        const status = getQuizStatus(q, sub)
        return status.type === 'available'
      }).length,
      submittedQuizzes: submittedQuizzes.length,
      gradedQuizzes: gradedQuizzes.length,
      averageScore,
      upcomingQuizzes: upcomingQuizzes.length
    }
  }, [quizzes])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your quizzes...</p>
            </div>
          </div>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
                <p className="text-gray-600">Test your knowledge with MCQ-based quizzes</p>
              </div>
              
              <div className="flex items-center gap-4">
                {student && (
                  <div className="flex items-center gap-2 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2">
                    <HiUserCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{student.name || student.email?.split('@')[0] || 'Student'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
           <div className="bg-white rounded-xl p-5 mb-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Statistics</h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="flex flex-col items-start">
      <span className="text-sm text-gray-600">Total Quizzes</span>
      <span className="text-2xl font-bold text-gray-900">{getStatistics.totalQuizzes}</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-sm text-gray-600">Available</span>
      <span className="text-2xl font-bold text-purple-600">{getStatistics.availableQuizzes}</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-sm text-gray-600">Submitted</span>
      <span className="text-2xl font-bold text-blue-600">{getStatistics.submittedQuizzes}</span>
    </div>

    <div className="flex flex-col items-start">
      <span className="text-sm text-gray-600">Graded</span>
      <span className="text-2xl font-bold text-green-600">{getStatistics.gradedQuizzes}</span>
    </div>
  </div>
</div>

          </div>

          {/* Filters */}
         <div className="bg-white rounded-xl p-5 mb-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Quizzes</h3>

  <div className="flex flex-col md:flex-row gap-4">
    {/* Search */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Quizzes
      </label>
      <input
        type="text"
        placeholder="Enter quiz title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
      />
    </div>

    {/* Course Filter */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Course
      </label>
      <select
        value={courseFilter}
        onChange={(e) => setCourseFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
      >
        <option value="all">All Courses</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
    </div>

    {/* Status Filter */}
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Status
      </label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
      >
        <option value="all">All Status</option>
        <option value="available">Available</option>
        <option value="submitted">Submitted</option>
        <option value="graded">Graded</option>
        <option value="late">Late</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>
  </div>
</div>


          {/* Quizzes List */}
          {quizzes.length === 0 ? (
            <div className="bg-white border  rounded-lg p-12 text-center">
              <HiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Quizzes Available</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You don't have any quizzes assigned yet. Check back later or contact your instructor.
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <HiSearch className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Quizzes Match</h3>
              <p className="text-gray-600 mb-6">No quizzes match your current filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCourseFilter('all')
                  setStatusFilter('all')
                }}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
           <div className="space-y-4">
  {filteredQuizzes.map((quiz) => {
    const submission = getSubmissionForQuiz(quiz.id)
    const status = getQuizStatus(quiz, submission)
    const daysRemaining = getDaysRemaining(quiz.dueDate)
    const isExpanded = expandedQuiz === quiz.id
    const score = submission ? calculateScore(submission) : null
    const courseName = getCourseName(quiz.courseId)
    
    return (
      <div key={quiz.id} className=" bg-white border border-gray-300 rounded-lg overflow-hidden  transition-shadow">
        {/* Quiz Header */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-purple-100 rounded-xl">
                <HiBookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{quiz.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  {score && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(parseFloat(score.percentage) || 0)}`}>
                      {score.grade} ({score.percentage}%)
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-2">
                    <HiAcademicCap className="w-4 h-4" />
                    {courseName}
                  </span>
                  <span className="flex items-center gap-2">
                    <HiQuestionMarkCircle className="w-4 h-4" />
                    {quiz.questions?.length || 0} questions
                  </span>
                  <span className="flex items-center gap-2">
                    <HiCalendar className="w-4 h-4" />
                    Due: {formatDate(quiz.dueDate)}
                  </span>
                  <span className="flex items-center gap-2">
                    <HiClock className="w-4 h-4" />
                    {formatDuration(quiz.duration || 0)}
                  </span>
                </div>
                
                <p className="text-gray-700 line-clamp-2">
                  {quiz.description || 'No description provided.'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{quiz.totalMarks || 0} marks</div>
                <div className={`text-sm ${daysRemaining.overdue ? 'text-red-600' : daysRemaining.urgent ? 'text-amber-600' : 'text-gray-600'}`}>
                  {daysRemaining.text}
                </div>
              </div>
              
              {/* Purple Action Button */}
              <button
                onClick={() => handleQuizAction(quiz)}
                disabled={status.type === 'overdue'}
                className={`px-6 py-2.5 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors`}
              >
                {status.type === 'graded' ? 'View Detailed Results' :
                 status.type === 'submitted' || status.type === 'late' ? 'View Submission' :
                 status.type === 'overdue' ? 'Quiz Closed' :
                 'Start Quiz Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <div className="border-t border-gray-300">
          <button
            onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
            className="w-full px-6 py-3 flex items-center justify-between text-gray-600 hover:bg-gray-50"
          >
            <span className="text-sm font-medium">{isExpanded ? 'Hide details' : 'View details'}</span>
            <HiChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-300 p-6">
            {/* Left & Right columns same as before */}
            {/* Submission info and instructions remain unchanged */}
            {/* All buttons inside expanded section are also purple */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleQuizAction(quiz)}
                className="flex-1 py-3 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                {status.type === 'graded' ? 'View Detailed Results' :
                 status.type === 'submitted' || status.type === 'late' ? 'View Submission' :
                 status.type === 'overdue' ? 'Quiz Closed' :
                 'Start Quiz Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  })}
</div>

          )}

          {/* Statistics Summary */}
         {quizzes.length > 0 && (
  <div className="mt-8">
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 text-lg mb-6">Your Quiz Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Average Score */}
        <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-purple-700">
              {getStatistics.gradedQuizzes > 0 
                ? `${getStatistics.averageScore.toFixed(1)}%`
                : 'N/A'}
            </p>
          </div>
          <HiChartBar className="w-8 h-8 text-purple-600 opacity-80" />
        </div>

        {/* Quizzes Completed */}
        <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Quizzes Completed</p>
            <p className="text-2xl font-bold text-green-700">
              {getStatistics.submittedQuizzes}/{getStatistics.totalQuizzes}
            </p>
          </div>
          <HiCheckCircle className="w-8 h-8 text-green-600 opacity-80" />
        </div>

        {/* Upcoming Quizzes */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">Upcoming Quizzes</p>
            <p className="text-2xl font-bold text-blue-700">
              {getStatistics.upcomingQuizzes}
            </p>
          </div>
          <HiCalendar className="w-8 h-8 text-blue-600 opacity-80" />
        </div>

      </div>
    </div>
  </div>
)}

        </div>
      </div>
    </>
  )
}