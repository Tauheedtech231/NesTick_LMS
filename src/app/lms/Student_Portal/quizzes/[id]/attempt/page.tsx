'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiClock, HiCheckCircle,
  HiExclamationCircle, HiFlag, HiQuestionMarkCircle,
  HiChevronLeft, HiChevronRight
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
  instructions: string
  questions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    marks: number
  }[]
}

interface Submission {
  id: string
  quizId: string
  studentId: string
  studentName: string
  studentEmail: string
  submittedAt: string,
  timeTaken: number ,
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

export default function QuizAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: number }>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    loadQuiz()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    // Save progress periodically
    const saveProgress = () => {
      if (quiz) {
        const progress = {
          quizId: quiz.id,
          answers,
          markedForReview,
          currentQuestion,
          startTime: startTimeRef.current
        }
        localStorage.setItem(`quiz_progress_${quiz.id}`, JSON.stringify(progress))
      }
    }

    const interval = setInterval(saveProgress, 30000) // Save every 30 seconds
    return () => clearInterval(interval)
  }, [answers, markedForReview, currentQuestion, quiz])

  const loadQuiz = () => {
    try {
      // Get current student
      const studentData = localStorage.getItem('currentStudent')
      const currentStudent = studentData ? JSON.parse(studentData) : null
      
      if (!currentStudent) {
        router.push('/student-login')
        return
      }

      // Load quiz
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const foundQuiz = allQuizzes.find((q: Quiz) => q.id === params.id)
      
      if (!foundQuiz) {
        toast.error('Quiz not found')
        router.push('/lms/Student_Portal/quizzes')
        return
      }

      // Check if already submitted
      const quizSubmissions = foundQuiz.submissions || []
      const existingSubmission = quizSubmissions.find(
        (s: Submission) => s.studentId === currentStudent.id
      )

      if (existingSubmission) {
        if (existingSubmission.status === 'submitted' || existingSubmission.status === 'graded') {
          router.push(`/lms/Student_Portal/quizzes/${foundQuiz.id}/results`)
          return
        }
      }

      setQuiz(foundQuiz)
      setTimeLeft(foundQuiz.duration * 60) // Convert minutes to seconds

      // Load saved progress
      const savedProgress = localStorage.getItem(`quiz_progress_${foundQuiz.id}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setAnswers(progress.answers || {})
        setMarkedForReview(progress.markedForReview || [])
        setCurrentQuestion(progress.currentQuestion || 0)
        startTimeRef.current = progress.startTime || Date.now()
        
        // Calculate remaining time
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const remainingTime = (foundQuiz.duration * 60) - timeSpent
        setTimeLeft(Math.max(0, remainingTime))
      } else {
        startTimeRef.current = Date.now()
        
        // Initialize answers
        const initialAnswers: { [key: string]: number } = {}
        foundQuiz.questions.forEach((q:any) => {
          initialAnswers[q.id] = -1 // -1 means not answered
        })
        setAnswers(initialAnswers)
      }

    } catch (error) {
      console.error('Error loading quiz:', error)
      toast.error('Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft, quiz])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (!quiz) return

    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (direction === 'next' && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const jumpToQuestion = (index: number) => {
    setCurrentQuestion(index)
  }

  const calculateProgress = () => {
    if (!quiz) return { answered: 0, total: 0, percentage: 0 }
    
    const answered = Object.values(answers).filter(answer => answer !== -1).length
    const total = quiz.questions.length
    const percentage = (answered / total) * 100
    
    return { answered, total, percentage }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    const unanswered = quiz.questions.filter(q => answers[q.id] === -1).length
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
        return
      }
    }

    if (!confirm('Are you sure you want to submit your quiz? This action cannot be undone.')) {
      return
    }

    await submitQuiz()
  }

  const handleAutoSubmit = async () => {
    if (!quiz) return
    
    toast('Time is up! Your quiz is being submitted automatically.', {
      icon: '⏰',
      duration: 4000
    })
    
    await submitQuiz()
  }

  const submitQuiz = async () => {
    if (!quiz) return
    
    setSubmitting(true)

    try {
      // Get current student
      const studentData = localStorage.getItem('currentStudent')
      const currentStudent = studentData ? JSON.parse(studentData) : null
      
      if (!currentStudent) {
        toast.error('Student not found')
        return
      }

      // Calculate time taken
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000) // in seconds
      const timeTakenMinutes = Math.ceil(timeTaken / 60)

      // Grade answers
      const gradedAnswers = quiz.questions.map(question => {
        const selectedOption = answers[question.id]
        const isCorrect = selectedOption === question.correctAnswer
        const marksObtained = isCorrect ? question.marks : 0
        
        return {
          questionId: question.id,
          selectedOption,
          isCorrect,
          marksObtained
        }
      })

      const totalMarksObtained = gradedAnswers.reduce((sum, answer) => sum + answer.marksObtained, 0)
      const percentage = (totalMarksObtained / quiz.totalMarks) * 100

      const submission: Submission = {
        id: `sub_${Date.now()}`,
        quizId: quiz.id,
        studentId: currentStudent.id,
        studentName: currentStudent.name || currentStudent.email.split('@')[0],
        studentEmail: currentStudent.email,
        submittedAt: new Date().toISOString(),
        answers: gradedAnswers,
        totalMarksObtained,
        totalMarks: quiz.totalMarks,
        percentage,
        status: 'submitted',
        timeTaken: timeTakenMinutes
      }

      // Save submission
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const quizIndex = allQuizzes.findIndex((q: Quiz) => q.id === quiz.id)
      
      if (quizIndex !== -1) {
        if (!allQuizzes[quizIndex].submissions) {
          allQuizzes[quizIndex].submissions = []
        }
        allQuizzes[quizIndex].submissions.push(submission)
        localStorage.setItem('quizzes', JSON.stringify(allQuizzes))
      }

      // Clear progress
      localStorage.removeItem(`quiz_progress_${quiz.id}`)

      toast.success('Quiz submitted successfully!')
      
      // Navigate to results
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

  const currentQ = quiz.questions[currentQuestion]
  const progress = calculateProgress()
  const isMarkedForReview = markedForReview.includes(currentQ.id)
  const selectedAnswer = answers[currentQ.id]

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <Link
                href="/lms/Student_Portal/quizzes"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Quizzes</span>
              </Link>
              
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
                <div className={`text-2xl font-bold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600 mt-1">Question {currentQuestion + 1} of {quiz.questions.length}</p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Marks</div>
                <div className="text-lg font-bold text-gray-900">{quiz.totalMarks}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Questions Navigator */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {quiz.questions.map((question, index) => {
                    const isAnswered = answers[question.id] !== -1
                    const isMarked = markedForReview.includes(question.id)
                    const isCurrent = index === currentQuestion
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => jumpToQuestion(index)}
                        className={`h-10 rounded-lg flex items-center justify-center relative ${
                          isCurrent
                            ? 'bg-purple-600 text-white'
                            : isAnswered
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={`Question ${index + 1}`}
                      >
                        {index + 1}
                        {isMarked && (
                          <HiFlag className="absolute -top-1 -right-1 w-4 h-4 text-red-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-gray-900 mb-3">Progress</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Questions Answered</span>
                    <span>{progress.answered}/{progress.total}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-300"></div>
                    <span className="text-gray-600">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiFlag className="w-3 h-3 text-red-500" />
                    <span className="text-gray-600">Marked</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">Instructions</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <HiQuestionMarkCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Answer all {quiz.questions.length} questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HiClock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Time limit: {quiz.duration} minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <HiFlag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Mark questions for review if unsure</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Question and Options */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                {/* Question Header */}
                <div className="p-6 border-b border-gray-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <HiQuestionMarkCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">
                            Question {currentQuestion + 1}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {currentQ.marks} mark{currentQ.marks > 1 ? 's' : ''}
                          </span>
                          {isMarkedForReview && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1">
                              <HiFlag className="w-3 h-3" />
                              Marked for Review
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{currentQ.question}</h2>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="p-6">
                  <div className="space-y-4">
                    {currentQ.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQ.id, index)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswer === index
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === index
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-gray-400'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{option}</p>
                          </div>
                          {selectedAnswer === index && (
                            <HiCheckCircle className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation and Actions */}
                <div className="p-6 border-t border-gray-300 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigateQuestion('prev')}
                        disabled={currentQuestion === 0}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          currentQuestion === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <HiChevronLeft className="w-5 h-5" />
                        Previous
                      </button>
                      
                      <button
                        onClick={() => navigateQuestion('next')}
                        disabled={currentQuestion === quiz.questions.length - 1}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          currentQuestion === quiz.questions.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Next
                        <HiChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleMarkForReview(currentQ.id)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          isMarkedForReview
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <HiFlag className="w-4 h-4" />
                        {isMarkedForReview ? 'Unmark' : 'Mark for Review'}
                      </button>
                      
                      {currentQuestion === quiz.questions.length - 1 ? (
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className={`px-6 py-2 rounded-lg font-medium ${
                            submitting
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                          }`}
                        >
                          {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (selectedAnswer !== -1) {
                              navigateQuestion('next')
                            } else {
                              toast('Please select an answer before proceeding', {
                                icon: '❓'
                              })
                            }
                          }}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg"
                        >
                          Save & Next
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Warning for low time */}
              {timeLeft < 300 && timeLeft > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <HiExclamationCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-800">Time is running out!</p>
                    <p className="text-sm text-red-700">
                      Only {formatTime(timeLeft)} remaining. Please review your answers and submit soon.
                    </p>
                  </div>
                </div>
              )}

              {/* Quiz Summary */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Questions Answered</div>
                  <div className="text-2xl font-bold text-green-600">{progress.answered}</div>
                </div>
                
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Marked for Review</div>
                  <div className="text-2xl font-bold text-amber-600">{markedForReview.length}</div>
                </div>
                
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Time Used</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTime((quiz.duration * 60) - timeLeft)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}