// app/lms/Student_Portal/quizzes/[id]/attempt/QuizAttemptContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Clock, CheckCircle, HelpCircle,
  Save, UserCircle, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

interface Quiz {
  id: string
  courseId: string
  title: string
  description: string
  type: 'assignment' | 'quiz'
  totalMarks: number
  dueDate: string
  duration: number
  createdAt: string
  status: 'active' | 'draft' | 'graded'
  questions: Question[]
  instructions?: string
}

interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options?: string[]
  correctAnswer?: string
  marks: number
  explanation?: string
}

interface Answer {
  questionId: string
  answer: string
}/* eslint-disable */


export default function QuizAttemptContent() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  useEffect(() => {
    if (!quiz || timeLeft <= 0 || submitting) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quiz, timeLeft, submitting])

  const loadQuiz = () => {
    try {
      setLoading(true)
      
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const currentQuiz = allAssignments.find((q: any) => q.id === quizId && q.type === 'quiz')
      
      if (!currentQuiz) {
        toast.error('Quiz not found')
        router.push('/lms/Student_Portal/quizzes')
        return
      }

      const dueDate = new Date(currentQuiz.dueDate)
      const now = new Date()
      if (dueDate < now) {
        toast.error('This quiz is past its due date')
        router.push('/lms/Student_Portal/quizzes')
        return
      }

      const allSubmissions = JSON.parse(localStorage.getItem('quizSubmissions') || '[]')
      const studentData = localStorage.getItem('currentStudent')
      const student = studentData ? JSON.parse(studentData) : null
      
      const existingSubmission = allSubmissions.find((sub: any) => 
        sub.quizId === quizId && sub.studentId === student?.id
      )

      let initialTimeLeft = currentQuiz.duration * 60
      let initialAnswers: Answer[] = []

      if (existingSubmission) {
        if (existingSubmission.status === 'submitted' || existingSubmission.status === 'graded') {
          toast.error('You have already submitted this quiz')
          router.push(`/lms/Student_Portal/quizzes/${quizId}/results`)
          return
        } else if (existingSubmission.status === 'attempted') {
          initialAnswers = existingSubmission.answers || []
          const timeSpent = existingSubmission.timeTaken || 0
          initialTimeLeft = Math.max(0, currentQuiz.duration * 60 - timeSpent * 60)
        }
      } else {
        // Ensure questions exist before mapping
        if (currentQuiz.questions && Array.isArray(currentQuiz.questions)) {
          initialAnswers = currentQuiz.questions.map((q: Question) => ({
            questionId: q.id || `q_${Math.random()}`,
            answer: ''
          }))
        } else {
          // If no questions, create empty array
          setQuestions([])
        }
      }

      setQuiz(currentQuiz)
      
      // Ensure questions array is properly set
      if (currentQuiz.questions && Array.isArray(currentQuiz.questions)) {
        setQuestions(currentQuiz.questions.map((q: any) => ({
          id: q.id || `q_${Date.now()}_${Math.random()}`,
          text: q.text || 'Question',
          type: q.type || 'multiple-choice',
          options: q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          marks: q.marks || 1,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })))
      } else {
        // Create sample questions if none exist
        setQuestions([
          {
            id: 'q1',
            text: 'Sample question 1',
            type: 'multiple-choice',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            marks: 1,
            correctAnswer: 'Option A'
          },
          {
            id: 'q2',
            text: 'Sample question 2',
            type: 'true-false',
            marks: 1,
            correctAnswer: 'True'
          }
        ])
      }
      
      setAnswers(initialAnswers)
      setTimeLeft(initialTimeLeft)

    } catch (error) {
      console.error('Error loading quiz:', error)
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { questionId, answer }
        return updated
      } else {
        return [...prev, { questionId, answer }]
      }
    })
  }

  const handleAutoSubmit = async () => {
    if (!quiz) return
    
    toast('Time is up! Auto-submitting your quiz...', { icon: '⏰' })
    await submitQuiz()
  }

  const submitQuiz = async () => {
    if (!quiz) return
    
    try {
      setSubmitting(true)
      
      const studentData = localStorage.getItem('currentStudent')
      const student = studentData ? JSON.parse(studentData) : null
      if (!student) {
        toast.error('Please login again')
        router.push('/student-login')
        return
      }

      const totalTime = quiz.duration * 60
      const timeTaken = totalTime - timeLeft

      const submission = {
        id: `quiz_sub_${Date.now()}`,
        quizId: quiz.id,
        studentId: student.id,
        studentName: student.fullName || 'Student',
        submittedAt: new Date().toISOString(),
        answers: answers.filter(a => a.answer.trim() !== ''),
        timeTaken: Math.round(timeTaken / 60),
        status: 'submitted'
      }

      const allSubmissions = JSON.parse(localStorage.getItem('quizSubmissions') || '[]')
      const filteredSubmissions = allSubmissions.filter((sub: any) => 
        !(sub.quizId === quiz.id && sub.studentId === student.id)
      )
      const updatedSubmissions = [...filteredSubmissions, submission]
      localStorage.setItem('quizSubmissions', JSON.stringify(updatedSubmissions))

      toast.success('Quiz submitted successfully!')
      setTimeout(() => {
        router.push(`/lms/Student_Portal/quizzes/${quiz.id}/results`)
      }, 1500)

    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitClick = () => {
    setShowConfirm(true)
  }

  const confirmSubmit = () => {
    setShowConfirm(false)
    submitQuiz()
  }

  const saveProgress = () => {
    if (!quiz) return
    
    const studentData = localStorage.getItem('currentStudent')
    const student = studentData ? JSON.parse(studentData) : null
    
    if (!student) return

    const progress = {
      id: `quiz_progress_${Date.now()}`,
      quizId: quiz.id,
      studentId: student.id,
      studentName: student.fullName || 'Student',
      submittedAt: new Date().toISOString(),
      answers: answers,
      timeTaken: Math.round(((quiz.duration * 60) - timeLeft) / 60),
      status: 'attempted'
    }

    const allSubmissions = JSON.parse(localStorage.getItem('quizSubmissions') || '[]')
    const filteredSubmissions = allSubmissions.filter((sub: any) => 
      !(sub.quizId === quiz.id && sub.studentId === student.id && sub.status === 'attempted')
    )
    const updatedSubmissions = [...filteredSubmissions, progress]
    localStorage.setItem('quizSubmissions', JSON.stringify(updatedSubmissions))
    
    toast.success('Progress saved!')
  }

  const calculateProgress = () => {
    if (!questions.length) return 0
    const answered = answers.filter(a => a.answer.trim() !== '').length
    return Math.round((answered / questions.length) * 100)
  }

  const navigateQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 mobile-content">
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto my-12"></div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 mobile-content">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-gray-900">Quiz not found</h3>
            <Link
              href="/lms/Student_Portal/quizzes"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if questions exist and currentQuestion is valid
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 mobile-content">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-gray-900">No questions available</h3>
            <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
            <Link
              href="/lms/Student_Portal/quizzes"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Ensure currentQuestion is within bounds
  const safeCurrentQuestion = Math.min(currentQuestion, questions.length - 1)
  const currentQ = questions[safeCurrentQuestion]
  const progress = calculateProgress()

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 p-4 mobile-content">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/lms/Student_Portal/quizzes"
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                  <p className="text-gray-600">Attempt Quiz</p>
                </div>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                </div>
                <button
                  onClick={saveProgress}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Progress
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="ml-2 font-bold text-gray-900">{progress}%</span>
                  <span className="ml-4 text-sm text-gray-600">
                    Question {safeCurrentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {answers.filter(a => a.answer.trim() !== '').length} answered
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Questions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const answer = answers.find(a => a.questionId === question.id)
                    const isAnswered = answer?.answer.trim() !== ''
                    const isCurrent = index === safeCurrentQuestion
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => navigateQuestion(index)}
                        className={`h-10 w-10 rounded-lg flex items-center justify-center font-medium ${
                          isCurrent 
                            ? 'bg-purple-600 text-white border-2 border-purple-700'
                            : isAnswered
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-gray-600">Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Quiz Info</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Marks:</span>
                      <span className="font-medium">{quiz.totalMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Remaining:</span>
                      <span className="font-medium">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Quiz Area */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Question {safeCurrentQuestion + 1}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{currentQ.text}</h2>
                  </div>
                  <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Question Type */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {currentQ.type === 'multiple-choice' ? 'Multiple Choice' :
                     currentQ.type === 'true-false' ? 'True/False' : 'Short Answer'}
                  </span>
                </div>

                {/* Answer Options */}
                <div className="space-y-4">
                  {currentQ.type === 'multiple-choice' && currentQ.options && (
                    <div className="space-y-3">
                      {currentQ.options.map((option, index) => {
                        const currentAnswer = answers.find(a => a.questionId === currentQ.id)
                        const isSelected = currentAnswer?.answer === option
                        
                        return (
                          <label
                            key={index}
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${currentQ.id}`}
                                checked={isSelected}
                                onChange={() => handleAnswerChange(currentQ.id, option)}
                                className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                              />
                              <div className="ml-3">
                                <span className="text-gray-900 font-medium">{option}</span>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {currentQ.type === 'true-false' && (
                    <div className="grid grid-cols-2 gap-4">
                      {['True', 'False'].map((option) => {
                        const currentAnswer = answers.find(a => a.questionId === currentQ.id)
                        const isSelected = currentAnswer?.answer === option
                        
                        return (
                          <label
                            key={option}
                            className={`block p-6 border-2 rounded-lg cursor-pointer transition-all text-center ${
                              isSelected
                                ? option === 'True'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <input
                                type="radio"
                                name={`question-${currentQ.id}`}
                                checked={isSelected}
                                onChange={() => handleAnswerChange(currentQ.id, option)}
                                className="h-5 w-5 text-purple-600 mb-2"
                              />
                              <span className="text-lg font-bold text-gray-900">{option}</span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {currentQ.type === 'short-answer' && (
                    <div>
                      <textarea
                        value={answers.find(a => a.questionId === currentQ.id)?.answer || ''}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Type your answer here..."
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Write your answer in detail. Points will be awarded based on completeness and accuracy.
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigateQuestion(safeCurrentQuestion - 1)}
                    disabled={safeCurrentQuestion === 0}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                      safeCurrentQuestion === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {safeCurrentQuestion < questions.length - 1 ? (
                      <button
                        onClick={() => navigateQuestion(safeCurrentQuestion + 1)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                      >
                        Next Question
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitClick}
                        disabled={submitting}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Submit Quiz
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quiz Instructions */}
              {quiz.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Quiz Instructions</h3>
                  </div>
                  <p className="text-blue-800">{quiz.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Quiz?</h3>
              <p className="text-gray-600">
                Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Questions answered:</span>
                <span className="font-medium">{answers.filter(a => a.answer.trim() !== '').length}/{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time remaining:</span>
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Continue Quiz
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}