'use client'

import { useState, useEffect } from 'react'
import { 
  HiSearch, HiFilter, HiDocumentDownload,
  HiCheckCircle, HiXCircle, HiX
} from 'react-icons/hi'

interface QuizResult {
  id: string
  quizId: string
  quizTitle: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  score: number
  totalQuestions: number
  passingScore: number
  status: 'passed' | 'failed' | 'pending'
  timeTaken: string // in minutes
  completedAt: string
  answers: {
    correct: number
    incorrect: number
    skipped: number
  }
}

export default function QuizzesResults() {
  const [results, setResults] = useState<QuizResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load sample data
    const sampleResults: QuizResult[] = [
      {
        id: '1',
        quizId: 'quiz-1',
        quizTitle: 'JavaScript Fundamentals Quiz',
        studentId: 'STU2024001',
        studentName: 'John Doe',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        score: 85,
        totalQuestions: 20,
        passingScore: 60,
        status: 'passed',
        timeTaken: '25',
        completedAt: '2024-03-15T10:30:00',
        answers: { correct: 17, incorrect: 3, skipped: 0 }
      },
      {
        id: '2',
        quizId: 'quiz-1',
        quizTitle: 'JavaScript Fundamentals Quiz',
        studentId: 'STU2024002',
        studentName: 'Jane Smith',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        score: 72,
        totalQuestions: 20,
        passingScore: 60,
        status: 'passed',
        timeTaken: '32',
        completedAt: '2024-03-15T11:15:00',
        answers: { correct: 14, incorrect: 6, skipped: 0 }
      },
      {
        id: '3',
        quizId: 'quiz-2',
        quizTitle: 'Statistics Basics Quiz',
        studentId: 'STU2024002',
        studentName: 'Jane Smith',
        courseId: 'course-2',
        courseName: 'Data Science Fundamentals',
        score: 55,
        totalQuestions: 25,
        passingScore: 65,
        status: 'failed',
        timeTaken: '40',
        completedAt: '2024-03-10T14:20:00',
        answers: { correct: 14, incorrect: 8, skipped: 3 }
      },
      {
        id: '4',
        quizId: 'quiz-3',
        quizTitle: 'HTML & CSS Quiz',
        studentId: 'STU2024003',
        studentName: 'Bob Johnson',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        score: 92,
        totalQuestions: 15,
        passingScore: 70,
        status: 'passed',
        timeTaken: '18',
        completedAt: '2024-03-12T09:45:00',
        answers: { correct: 14, incorrect: 1, skipped: 0 }
      },
      {
        id: '5',
        quizId: 'quiz-4',
        quizTitle: 'Python Programming Quiz',
        studentId: 'STU2024004',
        studentName: 'Alice Brown',
        courseId: 'course-2',
        courseName: 'Data Science Fundamentals',
        score: 48,
        totalQuestions: 30,
        passingScore: 60,
        status: 'failed',
        timeTaken: '45',
        completedAt: '2024-03-08T16:10:00',
        answers: { correct: 14, incorrect: 12, skipped: 4 }
      },
      {
        id: '6',
        quizId: 'quiz-5',
        quizTitle: 'React Concepts Quiz',
        studentId: 'STU2024001',
        studentName: 'John Doe',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        score: 78,
        totalQuestions: 30,
        passingScore: 70,
        status: 'passed',
        timeTaken: '35',
        completedAt: '2024-03-20T13:25:00',
        answers: { correct: 23, incorrect: 7, skipped: 0 }
      },
      {
        id: '7',
        quizId: 'quiz-6',
        quizTitle: 'Database Design Quiz',
        studentId: 'STU2024005',
        studentName: 'Charlie Wilson',
        courseId: 'course-3',
        courseName: 'Database Management',
        score: 81,
        totalQuestions: 25,
        passingScore: 65,
        status: 'passed',
        timeTaken: '28',
        completedAt: '2024-03-18T15:40:00',
        answers: { correct: 20, incorrect: 5, skipped: 0 }
      },
      {
        id: '8',
        quizId: 'quiz-7',
        quizTitle: 'UI/UX Principles Quiz',
        studentId: 'STU2024006',
        studentName: 'David Lee',
        courseId: 'course-4',
        courseName: 'UI/UX Design',
        score: 67,
        totalQuestions: 20,
        passingScore: 70,
        status: 'pending',
        timeTaken: '22',
        completedAt: '2024-03-22T11:10:00',
        answers: { correct: 13, incorrect: 7, skipped: 0 }
      }
    ]

    setResults(sampleResults)
    setLoading(false)
  }, [])

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || result.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'border-green-200 bg-green-50 text-green-700'
      case 'failed': return 'border-red-200 bg-red-50 text-red-700'
      case 'pending': return 'border-amber-200 bg-amber-50 text-amber-700'
      default: return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= passingScore) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBarColor = (score: number, passingScore: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= passingScore) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quiz Results</h1>
            <p className="text-gray-600 mt-2">View and manage student quiz submissions</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student, quiz, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black min-w-[140px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
                <button 
                  onClick={() => {
                    setStatusFilter('ALL')
                    setSearchTerm('')
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <div className="text-gray-700">
              Showing {filteredResults.length} of {results.length} results
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <HiDocumentDownload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No quiz results match your search criteria' : 'No quiz results available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result) => {
              const scoreColor = getScoreColor(result.score, result.passingScore)
              const scoreBarColor = getScoreBarColor(result.score, result.passingScore)

              return (
                <div 
                  key={result.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                          {result.quizTitle}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {result.courseName}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">
                          {result.studentName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{result.studentName}</div>
                        <div className="text-sm text-gray-500">{result.studentId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Score Display */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className={`text-2xl font-bold ${scoreColor}`}>
                            {result.score}%
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            Passing: {result.passingScore}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.totalQuestions} questions
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${scoreBarColor} transition-all duration-500`}
                          style={{ width: `${result.score}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Answers Breakdown */}
                    <div className="mb-6">
                      <div className="text-sm text-gray-600 mb-2">Answers</div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-green-600 font-bold">{result.answers.correct}</div>
                          <div className="text-xs text-gray-500">Correct</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-bold">{result.answers.incorrect}</div>
                          <div className="text-xs text-gray-500">Incorrect</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 font-bold">{result.answers.skipped}</div>
                          <div className="text-xs text-gray-500">Skipped</div>
                        </div>
                      </div>
                    </div>

                    {/* Completion Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Time taken</span>
                        <span className="font-medium text-gray-900">{result.timeTaken} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatDate(result.completedAt)}</div>
                          <div className="text-sm text-gray-500">{formatTime(result.completedAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  {/* <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium">
                        View Details
                      </button>
                      <button className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium">
                        Download Report
                      </button>
                    </div>
                  </div> */}
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Need help with results? <a href="#" className="text-black hover:underline">Contact support</a>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                <HiDocumentDownload className="w-4 h-4 inline mr-2" />
                Export All
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                <HiFilter className="w-4 h-4 inline mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}