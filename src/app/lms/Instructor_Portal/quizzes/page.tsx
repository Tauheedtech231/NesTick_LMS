'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  ClipboardCheck,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Search,
  BarChart,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  XCircle,
  PlayCircle,
  PauseCircle
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

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  duration: number;
  totalQuestions: number;
  totalPoints: number;
  attempts: number;
  averageScore: number;
  status: 'draft' | 'published' | 'closed';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuizzesPage() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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

        // Load quizzes for this instructor's course
        const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
        const myQuizzes = allQuizzes.filter((q: Quiz) => 
          q.instructorId === currentUser.id && q.courseId === currentUser.courseId
        )

        // Load student quiz results to calculate attempt counts and average scores
        const allResults = JSON.parse(localStorage.getItem('student_quiz_results') || '[]')

        // Enhance quizzes with actual attempt data
        const enhancedQuizzes = myQuizzes.map((quiz: any) => {
          // Count attempts for this quiz
          const quizResults = allResults.filter((result: any) => result.quizId === quiz.id)
          const attemptCount = quizResults.length
          
          // Calculate average score from actual attempts
          const averageScore = attemptCount > 0 
            ? Math.round(quizResults.reduce((sum: number, result: any) => sum + result.score, 0) / attemptCount)
            : 0

          return {
            ...quiz,
            attempts: attemptCount,
            averageScore: averageScore
          }
        })
        
        setQuizzes(enhancedQuizzes)
      } catch (error) {
        console.error('Error loading quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDeleteQuiz = (id: string) => {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      const updatedQuizzes = quizzes.filter(q => q.id !== id)
      setQuizzes(updatedQuizzes)
      
      // Update localStorage
      const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
      const filtered = allQuizzes.filter((q: Quiz) => q.id !== id)
      localStorage.setItem('instructor_quizzes', JSON.stringify(filtered))
      
      alert('Quiz deleted successfully!')
      setOpenMenuId(null)
    }
  }

  const handlePublishQuiz = (id: string) => {
    const updatedQuizzes = quizzes.map(q => 
      q.id === id ? { ...q, status: 'published' as const } : q
    )
    setQuizzes(updatedQuizzes)
    
    // Update localStorage
    const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
    const updatedAllQuizzes = allQuizzes.map((q: Quiz) => 
      q.id === id ? { ...q, status: 'published' } : q
    )
    localStorage.setItem('instructor_quizzes', JSON.stringify(updatedAllQuizzes))
    
    alert('Quiz published successfully! Students can now take it.')
    setOpenMenuId(null)
  }

  const handleCloseQuiz = (id: string) => {
    const updatedQuizzes = quizzes.map(q => 
      q.id === id ? { ...q, status: 'closed' as const } : q
    )
    setQuizzes(updatedQuizzes)
    
    // Update localStorage
    const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
    const updatedAllQuizzes = allQuizzes.map((q: Quiz) => 
      q.id === id ? { ...q, status: 'closed' } : q
    )
    localStorage.setItem('instructor_quizzes', JSON.stringify(updatedAllQuizzes))
    
    alert('Quiz closed successfully! Students can no longer take it.')
    setOpenMenuId(null)
  }

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id)
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || quiz.status === filter
    return matchesSearch && matchesFilter
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredQuizzes.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage)

  const getStatusBadge = (status: Quiz['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Draft</span>
      case 'published':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Published</span>
      case 'closed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Closed</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Quizzes
              </h1>
              <p className="text-darkGrey text-sm sm:text-base mt-1">
                Create and manage quizzes for your students
              </p>
            </div>
            <Link
              href="/lms/Instructor_Portal/quizzes/create"
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Quiz</span>
            </Link>
          </div>
          <div className="h-1 w-12 rounded-full mt-4" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Total</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">{quizzes.length}</h3>
            </div>
            <ClipboardCheck className="w-5 h-5 sm:w-8 sm:h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Published</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">
                {quizzes.filter(q => q.status === 'published').length}
              </h3>
            </div>
            <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Attempts</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">
                {quizzes.reduce((sum, q) => sum + q.attempts, 0)}
              </h3>
            </div>
            <Users className="w-5 h-5 sm:w-8 sm:h-8" style={{ color: BRAND_COLORS.teal }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Avg. Score</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">
                {quizzes.length > 0 
                  ? (quizzes.reduce((sum, q) => sum + q.averageScore, 0) / quizzes.length).toFixed(1)
                  : '0'
                }%
              </h3>
            </div>
            <BarChart className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-darkGrey/50" />
            <input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'all' 
                  ? 'bg-darkRoyalBlue text-white' 
                  : 'bg-lightGrey text-darkGrey hover:bg-softGrey'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'published' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-lightGrey text-darkGrey hover:bg-softGrey'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'draft' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-lightGrey text-darkGrey hover:bg-softGrey'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'closed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-lightGrey text-darkGrey hover:bg-softGrey'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Quizzes Table - Responsive Design */}
      <div className="bg-white rounded-lg border border-softGrey overflow-hidden mb-6">
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-2 p-4 text-white text-sm font-medium" style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
          <div className="col-span-3">Quiz Title</div>
          <div className="col-span-2">Details</div>
          <div className="col-span-2">Schedule</div>
          <div className="col-span-2">Performance</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="md:hidden space-y-3 p-3">
          {currentItems.map(quiz => (
            <div key={quiz.id} className="bg-white border border-softGrey rounded-lg p-3 relative">
              {/* Header with Title and Status */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-8">
                  <h3 className="font-medium text-sm text-darkGrey">{quiz.title}</h3>
                  <p className="text-xs text-darkGrey/70 mt-0.5 line-clamp-2">{quiz.description}</p>
                </div>
                {getStatusBadge(quiz.status)}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-darkGrey/60">Duration:</span>
                  <span className="ml-1 text-darkGrey font-medium">{quiz.duration}m</span>
                </div>
                <div>
                  <span className="text-darkGrey/60">Questions:</span>
                  <span className="ml-1 text-darkGrey font-medium">{quiz.totalQuestions}</span>
                </div>
                <div>
                  <span className="text-darkGrey/60">Points:</span>
                  <span className="ml-1 text-darkGrey font-medium">{quiz.totalPoints}</span>
                </div>
                <div>
                  <span className="text-darkGrey/60">Attempts:</span>
                  <span className="ml-1 text-darkGrey font-medium">{quiz.attempts}</span>
                </div>
              </div>

              {/* Schedule and Score */}
              <div className="flex items-center justify-between text-xs border-t border-softGrey pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-darkGrey/40" />
                  <span className="text-darkGrey/70">{new Date(quiz.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-medium text-darkGrey">{quiz.averageScore}% avg</span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => toggleMenu(quiz.id)}
                  className="p-1.5 text-darkGrey hover:bg-lightGrey rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === quiz.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-softGrey z-10 py-1 text-xs">
                    <Link
                      href={`/lms/Instructor_Portal/quizzes/submissions/${quiz.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-darkGrey hover:bg-lightGrey transition-colors"
                      onClick={() => setOpenMenuId(null)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Results
                    </Link>
                    <Link
                      href={`/lms/Instructor_Portal/quizzes/edit/${quiz.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-darkGrey hover:bg-lightGrey transition-colors"
                      onClick={() => setOpenMenuId(null)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    
                    {quiz.status === 'draft' && (
                      <button
                        onClick={() => handlePublishQuiz(quiz.id)}
                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-lightGrey transition-colors w-full text-left"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Publish
                      </button>
                    )}
                    
                    {quiz.status === 'published' && (
                      <button
                        onClick={() => handleCloseQuiz(quiz.id)}
                        className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-lightGrey transition-colors w-full text-left"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        Close
                      </button>
                    )}
                    
                    {quiz.status === 'closed' && (
                      <button
                        onClick={() => handlePublishQuiz(quiz.id)}
                        className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-lightGrey transition-colors w-full text-left"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Reopen
                      </button>
                    )}
                    
                    <div className="border-t border-softGrey my-1"></div>
                    
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="flex items-center gap-2 px-3 py-2 text-brightRed hover:bg-lightGrey transition-colors w-full text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Body */}
        <div className="hidden md:block">
          <div className="divide-y divide-softGrey">
            {currentItems.map(quiz => (
              <div key={quiz.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-lightGrey/50 transition-colors relative">
                {/* Quiz Title */}
                <div className="col-span-3">
                  <div>
                    <div className="font-medium text-darkGrey text-sm truncate">{quiz.title}</div>
                    <div className="text-xs text-darkGrey/70 truncate">{quiz.description}</div>
                  </div>
                </div>

                {/* Details */}
                <div className="col-span-2">
                  <div className="text-sm">
                    <div>{quiz.duration} min</div>
                    <div className="text-xs text-darkGrey/70">{quiz.totalQuestions} Q • {quiz.totalPoints} pts</div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="col-span-2">
                  <div className="text-sm">
                    <div>{new Date(quiz.startDate).toLocaleDateString()}</div>
                    <div className="text-xs text-darkGrey/70">to {new Date(quiz.endDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Performance */}
                <div className="col-span-2">
                  <div className="text-sm">
                    <div>{quiz.attempts} attempts</div>
                    <div className="text-xs text-darkGrey/70">{quiz.averageScore}% avg</div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  {getStatusBadge(quiz.status)}
                </div>

                {/* Actions */}
                <div className="col-span-2 text-right relative" ref={menuRef}>
                  <button
                    onClick={() => toggleMenu(quiz.id)}
                    className="p-2 text-darkGrey hover:bg-lightGrey rounded-lg transition-colors"
                    title="Actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === quiz.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-softGrey z-10 py-1.5 text-sm">
                      <Link
                        href={`/lms/Instructor_Portal/quizzes/submissions/${quiz.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-darkGrey hover:bg-lightGrey transition-colors"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Eye className="w-4 h-4" />
                        View Results
                      </Link>
                      <Link
                        href={`/lms/Instructor_Portal/quizzes/edit/${quiz.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 text-darkGrey hover:bg-lightGrey transition-colors"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Quiz
                      </Link>
                      
                      {quiz.status === 'draft' && (
                        <button
                          onClick={() => handlePublishQuiz(quiz.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-green-600 hover:bg-lightGrey transition-colors w-full text-left"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Publish Quiz
                        </button>
                      )}
                      
                      {quiz.status === 'published' && (
                        <button
                          onClick={() => handleCloseQuiz(quiz.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-orange-600 hover:bg-lightGrey transition-colors w-full text-left"
                        >
                          <PauseCircle className="w-4 h-4" />
                          Close Quiz
                        </button>
                      )}
                      
                      {quiz.status === 'closed' && (
                        <button
                          onClick={() => handlePublishQuiz(quiz.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-green-600 hover:bg-lightGrey transition-colors w-full text-left"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Reopen Quiz
                        </button>
                      )}
                      
                      <div className="border-t border-softGrey my-1.5"></div>
                      
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="flex items-center gap-2 px-4 py-2.5 text-brightRed hover:bg-lightGrey transition-colors w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Quiz
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {filteredQuizzes.length > 0 && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-t border-softGrey bg-lightGrey/50 text-xs sm:text-sm">
            <div className="text-darkGrey/70">
              {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredQuizzes.length)} of {filteredQuizzes.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-lg border border-softGrey hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white rounded-lg border border-softGrey text-xs sm:text-sm">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-lg border border-softGrey hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <ClipboardCheck className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Quizzes Found
          </h3>
          <p className="text-sm sm:text-base text-darkGrey/70 mb-6">
            {searchTerm ? 'Try a different search term' : 'Create your first quiz for students'}
          </p>
          <Link
            href="/lms/Instructor_Portal/quizzes/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Create First Quiz
          </Link>
        </div>
      )}
    </div>
  )
}