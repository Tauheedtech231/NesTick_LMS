'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCalendar, HiBookOpen, 
  HiClock, HiPencil, HiUsers
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
  instructions: string
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
}

interface Course {
  id: string
  title: string
  code: string
}

export default function ViewQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [])

  const loadQuiz = () => {
    try {
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const foundQuiz = allQuizzes.find((q: Quiz) => q.id === params.id)
      
      if (foundQuiz) {
        setQuiz(foundQuiz)
        
        // Load course details
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        const foundCourse = allCourses.find((c: Course) => c.id === foundQuiz.courseId)
        setCourse(foundCourse || null)
      } else {
        toast.error('Quiz not found')
        router.push('/lms/Instructor_Portal/quizzes')
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      setDeleteLoading(true)
      
      try {
        const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
        const updatedQuizzes = allQuizzes.filter((q: Quiz) => q.id !== params.id)
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes))
        
        toast.success('Quiz deleted successfully')
        router.push('/lms/Instructor_Portal/quizzes')
      } catch (error) {
        console.error('Error deleting quiz:', error)
        toast.error('Failed to delete quiz')
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Draft</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-600">Quiz not found</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <Link
                href="/lms/Instructor_Portal/quizzes"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Quizzes</span>
              </Link>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Quiz'}
                </button>
                
                <Link
                  href={`/lms/Instructor_Portal/quizzes/${quiz.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <HiPencil className="w-5 h-5" />
                  Edit Quiz
                </Link>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600 mt-1">{quiz.description}</p>
              </div>
              {getStatusBadge(quiz.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quiz Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Instructions */}
              {quiz.instructions && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{quiz.instructions}</p>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  MCQ Questions ({quiz.questions.length})
                </h2>
                
                <div className="space-y-8">
                  {quiz.questions.map((question, qIndex) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Question {qIndex + 1}
                          <span className="ml-4 text-sm font-normal text-gray-500">
                            ({question.marks} mark{question.marks > 1 ? 's' : ''})
                          </span>
                        </h3>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{question.question}</p>
                      
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              oIndex === question.correctAnswer
                                ? 'border-green-600 bg-green-50'
                                : 'border-gray-300'
                            }`}>
                              {oIndex === question.correctAnswer && (
                                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                              )}
                            </div>
                            <span className={`flex-1 px-4 py-3 rounded-lg border ${
                              oIndex === question.correctAnswer
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-gray-300 bg-gray-50 text-gray-700'
                            }`}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Info Panel */}
            <div className="space-y-6">
              {/* Quiz Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quiz Information</h3>
                
                <div className="space-y-4">
                  {course && (
                    <div className="flex items-center gap-3">
                      <HiBookOpen className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <HiCalendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">{formatDate(quiz.dueDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <HiClock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{quiz.duration} minutes</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Total Marks</p>
                    <p className="text-2xl font-bold text-gray-900">{quiz.totalMarks}</p>
                  </div>
                </div>
              </div>

              {/* Created Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Created By</h3>
                <p className="text-gray-700">{quiz.createdBy}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Stats */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Submissions</h3>
                <div className="flex items-center gap-3">
                  <HiUsers className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{quiz.submissions?.length || 0}</p>
                    <p className="text-sm text-gray-500">Total submissions</p>
                  </div>
                </div>
                
                <Link
                  href={`/lms/Instructor_Portal/quizzes/${quiz.id}/submissions`}
                  className="mt-4 inline-block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  View Submissions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}