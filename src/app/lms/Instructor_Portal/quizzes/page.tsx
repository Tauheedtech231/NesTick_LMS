'use client'

import { useState, useEffect } from 'react'
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
  duration: number; // in minutes
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
        
        setQuizzes(myQuizzes)
      } catch (error) {
        console.error('Error loading quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleDeleteQuiz = (id: string) => {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      const updatedQuizzes = quizzes.filter(q => q.id !== id)
      setQuizzes(updatedQuizzes)
      
      // Update localStorage
      const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
      const filtered = allQuizzes.filter((q: Quiz) => q.id !== id)
      localStorage.setItem('instructor_quizzes', JSON.stringify(filtered))
      
      alert('Quiz deleted successfully!')
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
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || quiz.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: Quiz['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Quizzes
              </h1>
              <p className="text-darkGrey mt-1">
                Create and manage quizzes for your students
              </p>
            </div>
            <Link
              href="/lms/Instructor_Portal/quizzes/create"
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white 
              }}
            >
              <PlusCircle className="w-5 h-5" />
              Create Quiz
            </Link>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
            <input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'all' ? 'bg-darkRoyalBlue text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'draft' ? 'bg-gray-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'closed' ? 'bg-red-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total</p>
              <h3 className="text-2xl font-bold text-darkNavy">{quizzes.length}</h3>
            </div>
            <ClipboardCheck className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Published</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {quizzes.filter(q => q.status === 'published').length}
              </h3>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Attempts</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {quizzes.reduce((sum, q) => sum + q.attempts, 0)}
              </h3>
            </div>
            <Users className="w-8 h-8 text-teal" style={{ color: BRAND_COLORS.teal }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Avg. Score</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {quizzes.length > 0 
                  ? (quizzes.reduce((sum, q) => sum + q.averageScore, 0) / quizzes.length).toFixed(1)
                  : '0'
                }%
              </h3>
            </div>
            <BarChart className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(quiz.status)}`}>
                  {quiz.status.toUpperCase()}
                </span>
                <h3 className="font-semibold text-darkGrey mt-2 text-lg">{quiz.title}</h3>
                <p className="text-sm text-darkGrey/70 mt-1 line-clamp-2">{quiz.description}</p>
              </div>
              <div className="flex gap-1">
                <Link
                  href={`/lms/Instructor_Portal/quizzes/submissions/${quiz.id}`}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                  title="View Results"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/lms/Instructor_Portal/quizzes/edit/${quiz.id}`}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-softGrey">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-lightGrey rounded">
                  <div className="text-sm font-medium text-darkGrey">{quiz.totalQuestions}</div>
                  <div className="text-xs text-darkGrey/70">Questions</div>
                </div>
                <div className="text-center p-2 bg-lightGrey rounded">
                  <div className="text-sm font-medium text-darkGrey">{quiz.duration} min</div>
                  <div className="text-xs text-darkGrey/70">Duration</div>
                </div>
                <div className="text-center p-2 bg-lightGrey rounded">
                  <div className="text-sm font-medium text-darkGrey">{quiz.totalPoints}</div>
                  <div className="text-xs text-darkGrey/70">Points</div>
                </div>
                <div className="text-center p-2 bg-lightGrey rounded">
                  <div className="text-sm font-medium text-darkGrey">{quiz.attempts}</div>
                  <div className="text-xs text-darkGrey/70">Attempts</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-darkGrey/70 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                </span>
                <span className="font-medium">{quiz.averageScore}% avg</span>
              </div>

              <div className="pt-2 border-t border-softGrey flex gap-2">
                {quiz.status === 'draft' && (
                  <button
                    onClick={() => handlePublishQuiz(quiz.id)}
                    className="flex-1 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                )}
                {quiz.status === 'published' && (
                  <button
                    onClick={() => handleCloseQuiz(quiz.id)}
                    className="flex-1 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Close
                  </button>
                )}
                <Link
                  href={`/lms/Instructor_Portal/quizzes/submissions/${quiz.id}`}
                  className="flex-1 py-1.5 text-sm text-center border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
                >
                  View Results
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Quizzes Found
          </h3>
          <p className="text-darkGrey/70 mb-6">
            {searchTerm ? 'Try a different search term' : 'Create your first quiz for students'}
          </p>
          <Link
            href="/lms/Instructor_Portal/quizzes/create"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <PlusCircle className="w-5 h-5" />
            Create First Quiz
          </Link>
        </div>
      )}
    </div>
  )
}