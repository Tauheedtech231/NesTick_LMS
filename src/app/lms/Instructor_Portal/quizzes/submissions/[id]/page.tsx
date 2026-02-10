'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  BarChart,
  FileText,
  Mail,
  Award,
  TrendingUp,
  AlertCircle,
  Users,
  Percent,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
  Filter
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
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6'
}

interface QuizSubmission {
  id: string
  quizId: string
  studentId: string
  studentName: string
  studentEmail: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  submittedAt: string
  status: 'graded' | 'pending'
  grade?: number
  instructorComments?: string
  isPassed: boolean
}

interface Quiz {
  id: string
  title: string
  description: string
  courseTitle: string
  instructorName: string
  totalQuestions: number
  passingScore: number
  timeLimit: number
  totalPoints: number
  attempts: number
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [instructor, setInstructor] = useState<any>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<QuizSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending' | 'passed' | 'failed'>('all')
  const [showFilters, setShowFilters] = useState(false)

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

        // Load quiz details
        const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
        const foundQuiz = allQuizzes.find((q: any) => 
          q.id === quizId && q.instructorId === currentUser.id
        )
        
        if (!foundQuiz) {
          router.push('/lms/Instructor_Portal/quizzes')
          return
        }

        // Load instructor details
        const allInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]')
        const instructorDetails = allInstructors.find((inst: any) => 
          inst.id === foundQuiz.instructorId
        ) || { name: foundQuiz.instructorName || 'Instructor' }

        setQuiz({
          id: foundQuiz.id,
          title: foundQuiz.title,
          description: foundQuiz.description || '',
          courseTitle: foundQuiz.courseTitle || 'Course',
          instructorName: instructorDetails.name,
          totalQuestions: foundQuiz.totalQuestions || foundQuiz.questions?.length || 0,
          passingScore: foundQuiz.passingScore || 70,
          timeLimit: foundQuiz.timeLimit || 30,
          totalPoints: foundQuiz.totalPoints || foundQuiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 100,
          attempts: foundQuiz.attempts || 0
        })

        // Load submissions for this quiz
        const allResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]')
        const quizResults = allResults.filter((r: any) => r.quizId === quizId)
        
        // Transform results into submissions format
        const quizSubmissions: QuizSubmission[] = quizResults.map((result: any) => ({
          id: result.id,
          quizId: result.quizId,
          studentId: result.studentId || result.studentEmail,
          studentName: result.studentName,
          studentEmail: result.studentEmail,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          timeSpent: result.timeSpent,
          submittedAt: result.submittedAt,
          status: result.grade !== undefined ? 'graded' : 'pending',
          grade: result.grade,
          instructorComments: result.instructorComments,
          isPassed: result.isPassed
        }))

        setSubmissions(quizSubmissions)
        setFilteredSubmissions(quizSubmissions)
      } catch (error) {
        console.error('Error loading quiz results:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [quizId, router])

  useEffect(() => {
    let filtered = submissions

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    switch (filter) {
      case 'graded':
        filtered = filtered.filter(s => s.status === 'graded')
        break
      case 'pending':
        filtered = filtered.filter(s => s.status === 'pending')
        break
      case 'passed':
        filtered = filtered.filter(s => s.isPassed)
        break
      case 'failed':
        filtered = filtered.filter(s => !s.isPassed)
        break
      default:
        break
    }

    setFilteredSubmissions(filtered)
  }, [searchTerm, filter, submissions])

  const calculateStats = () => {
    if (submissions.length === 0) {
      return {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 100,
        passRate: 0,
        totalAttempts: 0,
        medianScore: 0,
        averageTime: 0
      }
    }
    
    const scores = submissions.map(s => s.score)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)
    const passed = submissions.filter(s => s.isPassed).length
    const passRate = (passed / submissions.length) * 100
    
    // Calculate median
    const sortedScores = [...scores].sort((a, b) => a - b)
    const mid = Math.floor(sortedScores.length / 2)
    const medianScore = sortedScores.length % 2 !== 0 
      ? sortedScores[mid]
      : (sortedScores[mid - 1] + sortedScores[mid]) / 2
    
    // Calculate average time
    const averageTime = submissions.reduce((sum, s) => sum + s.timeSpent, 0) / submissions.length
    
    return {
      averageScore: parseFloat(averageScore.toFixed(1)),
      highestScore: parseFloat(highestScore.toFixed(1)),
      lowestScore: parseFloat(lowestScore.toFixed(1)),
      passRate: parseFloat(passRate.toFixed(1)),
      totalAttempts: submissions.length,
      medianScore: parseFloat(medianScore.toFixed(1)),
      averageTime: Math.round(averageTime / 60)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateMobile = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleExportResults = () => {
    if (submissions.length === 0) {
      alert('No data to export')
      return
    }
    
    // Create CSV content
    const headers = ['Student Name', 'Student Email', 'Score (%)', 'Correct Answers', 'Total Questions', 'Time Spent', 'Status', 'Pass/Fail', 'Submitted At']
    const csvContent = [
      headers.join(','),
      ...submissions.map(sub => [
        `"${sub.studentName}"`,
        `"${sub.studentEmail}"`,
        sub.score,
        sub.correctAnswers,
        sub.totalQuestions,
        formatTime(sub.timeSpent),
        sub.status,
        sub.isPassed ? 'Pass' : 'Fail',
        formatDate(sub.submittedAt)
      ].join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-results-${quiz?.title.replace(/\s+/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-bold mb-2">Quiz Not Found</h1>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
          <Link
            href="/lms/Instructor_Portal/quizzes"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/lms/Instructor_Portal/quizzes"
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {quiz.courseTitle} • {stats.totalAttempts} submissions
              </p>
            </div>
          </div>
          
          {submissions.length > 0 && (
            <button
              onClick={handleExportResults}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export Results
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quick Stats - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Attempts</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:block hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">High Score</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.highestScore}%</p>
              </div>
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:block hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Low Score</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.lowestScore}%</p>
              </div>
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pass Rate</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.passRate}%</p>
              </div>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Quiz Info - Collapsible */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-900">Quiz Details</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          {showFilters && (
            <div className="mb-4">
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('passed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'passed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Passed
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Failed
                </button>
                <button
                  onClick={() => setFilter('graded')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    filter === 'graded' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Graded
                </button>
              </div>
            </div>
          )}
          
          {/* Quiz Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded bg-gray-100">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Questions</p>
                <p className="font-medium">{quiz.totalQuestions}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded bg-gray-100">
                <Target className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Passing Score</p>
                <p className="font-medium">{quiz.passingScore}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded bg-gray-100">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Time Limit</p>
                <p className="font-medium">{quiz.timeLimit} min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded bg-gray-100">
                <Award className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Points</p>
                <p className="font-medium">{quiz.totalPoints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-gray-900">Student Submissions</h2>
            <span className="text-sm text-gray-600">{filteredSubmissions.length} results</span>
          </div>
          
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-medium mb-2 text-gray-700">
                {searchTerm ? 'No matching results' : 'No submissions yet'}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Student submissions will appear here'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table (hidden on mobile) */}
              <div className="hidden sm:block">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Student
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Score
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                            Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredSubmissions.map((submission) => (
                          <tr key={submission.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {submission.studentName}
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                  {submission.studentEmail}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getScoreBgColor(submission.score)}`}>
                                <span className={`font-bold ${getScoreColor(submission.score)}`}>
                                  {submission.score}%
                                </span>
                                {submission.isPassed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  submission.isPassed 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {submission.isPassed ? 'Passed' : 'Failed'}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  submission.status === 'graded' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status === 'graded' ? 'Graded' : 'Pending'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDateMobile(submission.submittedAt)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Cards (visible on mobile) */}
              <div className="sm:hidden space-y-3">
                {filteredSubmissions.map((submission) => (
                  <div 
                    key={submission.id} 
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    {/* Student Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <h3 className="font-medium text-gray-900 truncate">
                            {submission.studentName}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {submission.studentEmail}
                        </p>
                      </div>
                      
                      {/* Score Badge */}
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${getScoreBgColor(submission.score)}`}>
                        <span className={`font-bold text-sm ${getScoreColor(submission.score)}`}>
                          {submission.score}%
                        </span>
                        {submission.isPassed ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    {/* Status and Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            submission.isPassed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {submission.isPassed ? 'Passed' : 'Failed'}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            submission.status === 'graded' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status === 'graded' ? 'Graded' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {formatDateMobile(submission.submittedAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info (Collapsible) */}
                    <details className="mt-3">
                      <summary className="text-sm text-blue-600 cursor-pointer">
                        Show details
                      </summary>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Correct Answers</p>
                            <p className="font-medium">
                              {submission.correctAnswers}/{submission.totalQuestions}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Time Spent</p>
                            <p className="font-medium">{formatTime(submission.timeSpent)}</p>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        {submissions.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              Performance Summary
            </h3>
            
            <div className="space-y-3">
              {/* Score Distribution */}
              <div>
                <p className="text-sm text-gray-700 mb-2">Score Distribution</p>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-green-600"
                    style={{ 
                      width: `${(submissions.filter(s => s.score >= 80).length / submissions.length) * 100}%` 
                    }}
                    title="Excellent (80-100%)"
                  />
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ 
                      width: `${(submissions.filter(s => s.score >= 60 && s.score < 80).length / submissions.length) * 100}%` 
                    }}
                    title="Good (60-79%)"
                  />
                  <div 
                    className="h-full bg-red-600"
                    style={{ 
                      width: `${(submissions.filter(s => s.score < 60).length / submissions.length) * 100}%` 
                    }}
                    title="Needs Improvement (<60%)"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Excellent: {submissions.filter(s => s.score >= 80).length}</span>
                  <span>Good: {submissions.filter(s => s.score >= 60 && s.score < 80).length}</span>
                  <span>Needs Work: {submissions.filter(s => s.score < 60).length}</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Average Time</p>
                  <p className="font-medium">{stats.averageTime} minutes</p>
                </div>
                <div>
                  <p className="text-gray-500">Median Score</p>
                  <p className="font-medium">{stats.medianScore}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}