'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Plus, Trash2, Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react'
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

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalPoints: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'closed';
  instructorId: string;
  instructorName: string;
  courseId: string;
  courseTitle: string;
  questions: Question[];
  attempts: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instructor, setInstructor] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    duration: 30,
    totalQuestions: 0,
    totalPoints: 0,
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'published' | 'closed'
  })

  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    if (quizId) {
      checkAuthAndLoadQuiz()
    }
  }, [quizId])

  const checkAuthAndLoadQuiz = async () => {
    try {
      setLoading(true)
      setError(null)

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

      // Load assigned course
      const courseId = currentUser.courseId || currentUser.assignedCourseId
      if (courseId) {
        try {
          const response = await fetch(`/api/instructors/course/${courseId}`)
          const result = await response.json()
          if (result.success) {
            setCourse(result.data.course)
          }
        } catch (error) {
          console.error('Error fetching course:', error)
        }
      }

      // Fetch quiz from API
      await fetchQuizFromAPI(quizId, currentUser.id)
      
    } catch (error: any) {
      console.error('Error loading quiz data:', error)
      setError(error.message || 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizFromAPI = async (id: string, instructorId: string) => {
    try {
      const response = await fetch(`/api/instructors/quizzes/${id}/full-update`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch quiz')
      }

      if (result.success) {
        const quizData = result.data

        // Check if user has permission
        if (quizData.instructorId !== instructorId) {
          alert('You do not have permission to edit this quiz')
          router.push('/lms/Instructor_Portal/quizzes')
          return
        }

        // Format dates for input fields
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString)
          return date.toISOString().slice(0, 16)
        }

        setQuiz({
          title: quizData.title,
          description: quizData.description || '',
          duration: quizData.duration,
          totalQuestions: quizData.totalQuestions,
          totalPoints: quizData.totalPoints,
          startDate: formatDateForInput(quizData.startDate),
          endDate: formatDateForInput(quizData.endDate),
          status: quizData.status
        })

        setQuestions(quizData.questions || [])
      }
    } catch (error: any) {
      console.error('Error fetching quiz:', error)
      // Fallback to localStorage
      loadFromLocalStorage(id, instructorId)
    }
  }

  const loadFromLocalStorage = (id: string, instructorId: string) => {
    try {
      const allQuizzes = JSON.parse(localStorage.getItem('instructor_quizzes') || '[]')
      const foundQuiz = allQuizzes.find((q: Quiz) => 
        q.id === id && q.instructorId === instructorId
      )

      if (!foundQuiz) {
        throw new Error('Quiz not found')
      }

      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16)
      }

      setQuiz({
        title: foundQuiz.title,
        description: foundQuiz.description || '',
        duration: foundQuiz.duration,
        totalQuestions: foundQuiz.totalQuestions,
        totalPoints: foundQuiz.totalPoints,
        startDate: formatDateForInput(foundQuiz.startDate),
        endDate: formatDateForInput(foundQuiz.endDate),
        status: foundQuiz.status
      })

      setQuestions(foundQuiz.questions || [])
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      setError('Quiz not found or you don\'t have permission to edit it')
    }
  }

  const handleUpdateQuiz = async () => {
    try {
      setSaving(true)
      setError(null)

      // Calculate totals
      const totalQuestions = questions.length
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

      const response = await fetch(`/api/instructors/quizzes/${quizId}/full-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          duration: quiz.duration,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          status: quiz.status,
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points
          }))
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update quiz')
      }

      if (result.success) {
        alert('✅ Quiz updated successfully!')
        router.push('/lms/Instructor_Portal/quizzes')
      }
    } catch (error: any) {
      console.error('Error updating quiz:', error)
      alert(`❌ ${error.message || 'Failed to update quiz'}`)
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('Quiz must have at least one question')
      return
    }
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    const newQuestions = [...questions]
    
    if (field === 'options' && Array.isArray(value)) {
      newQuestions[index].options = value
    } else if (field === 'question' && typeof value === 'string') {
      newQuestions[index].question = value
    } else if (field === 'correctAnswer' && typeof value === 'number') {
      newQuestions[index].correctAnswer = value
    } else if (field === 'points' && typeof value === 'number') {
      newQuestions[index].points = value
    }
    
    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!quiz.title.trim()) {
      alert('Please enter quiz title')
      return
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        alert(`Please enter question ${i + 1}`)
        return
      }
      
      const hasEmptyOptions = q.options.some(opt => !opt.trim())
      if (hasEmptyOptions) {
        alert(`Question ${i + 1} has empty options`)
        return
      }
    }
    
    if (!quiz.startDate || !quiz.endDate) {
      alert('Please select start and end dates')
      return
    }

    if (new Date(quiz.endDate) <= new Date(quiz.startDate)) {
      alert('End date must be after start date')
      return
    }

    await handleUpdateQuiz()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            <p className="text-sm text-darkGrey">Loading quiz data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Quiz</h3>
          <p className="text-darkGrey/70 mb-6">{error}</p>
          <Link
            href="/lms/Instructor_Portal/quizzes"
            className="px-4 py-2 bg-darkRoyalBlue text-white rounded-lg"
          >
            Back to Quizzes
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/lms/Instructor_Portal/quizzes"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 block sm:hidden" />
                <X className="w-5 h-5 hidden sm:block" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Edit Quiz
                </h1>
                <p className="text-sm sm:text-base text-darkGrey mt-1">
                  For: {course?.title || 'Course'}
                </p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-darkGrey/70 ml-9 sm:ml-0">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Quiz Details */}
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="e.g., Chapter 1 Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Description
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                placeholder="Brief description of the quiz..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Duration (minutes) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-darkGrey/50" />
                  <input
                    type="number"
                    required
                    min="1"
                    max="300"
                    value={quiz.duration}
                    onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value) || 30 })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Start Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-darkGrey/50" />
                  <input
                    type="datetime-local"
                    required
                    value={quiz.startDate}
                    onChange={(e) => setQuiz({ ...quiz, startDate: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  End Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-darkGrey/50" />
                  <input
                    type="datetime-local"
                    required
                    value={quiz.endDate}
                    onChange={(e) => setQuiz({ ...quiz, endDate: e.target.value })}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darkGrey mb-2">
                Status
              </label>
              <select
                value={quiz.status}
                onChange={(e) => setQuiz({ ...quiz, status: e.target.value as 'draft' | 'published' | 'closed' })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
              >
                <option value="draft">Draft (Hidden from students)</option>
                <option value="published">Published (Visible to students)</option>
                <option value="closed">Closed (No longer accessible)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold" style={{ color: BRAND_COLORS.darkNavy }}>
              Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="p-4 border border-softGrey rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-darkGrey">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1 text-brightRed hover:bg-brightRed/5 rounded"
                      aria-label="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Question *
                    </label>
                    <textarea
                      required
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      placeholder="Enter the question..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-2">
                        Points *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-2">
                        Correct Answer *
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                      >
                        {question.options.map((_, index) => (
                          <option key={index} value={index}>
                            Option {String.fromCharCode(65 + index)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <div className="w-6 h-6 flex items-center justify-center bg-lightGrey rounded text-sm font-medium">
                            {String.fromCharCode(65 + oIndex)}
                          </div>
                          <input
                            type="text"
                            required
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Quiz Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">{questions.length}</div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Total Questions</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">
                {questions.reduce((sum, q) => sum + q.points, 0)}
              </div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Total Points</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">{quiz.duration}</div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Minutes</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-lightGrey rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-darkNavy">
                {questions.filter(q => q.question.trim()).length}/{questions.length}
              </div>
              <div className="text-xs sm:text-sm text-darkGrey/70">Questions Ready</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Link
            href="/lms/Instructor_Portal/quizzes"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-center text-sm sm:text-base"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Update Quiz</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}