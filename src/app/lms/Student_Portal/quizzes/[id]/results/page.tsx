'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCheckCircle, HiXCircle,
  HiStar, HiChartBar, HiBookOpen,
  HiCalendar, HiClock, HiUser,
  HiDownload, HiFlag, HiCheck
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

interface Quiz {
  id: string
  courseId: string
  title: string
  description: string
  totalMarks: number
  dueDate: string
  duration: number
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
  feedback?: string
  gradedAt?: string
  timeTaken?: number
}

interface Course {
  id: string
  title: string
  code: string
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllAnswers, setShowAllAnswers] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
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

      setQuiz(foundQuiz)

      // Load course
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const foundCourse = allCourses.find((c: Course) => c.id === foundQuiz.courseId)
      setCourse(foundCourse || null)

      // Load submission
      const quizSubmissions = foundQuiz.submissions || []
      const foundSubmission = quizSubmissions.find(
        (s: Submission) => s.studentId === currentStudent.id
      )

      if (!foundSubmission) {
        toast.error('Submission not found')
        router.push('/lms/Student_Portal/quizzes')
        return
      }

      setSubmission(foundSubmission)

    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
  }

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-gradient-to-r from-green-500 to-green-600', label: 'Excellent' }
    if (percentage >= 80) return { grade: 'A', color: 'bg-gradient-to-r from-blue-500 to-blue-600', label: 'Very Good' }
    if (percentage >= 70) return { grade: 'B', color: 'bg-gradient-to-r from-purple-500 to-purple-600', label: 'Good' }
    if (percentage >= 60) return { grade: 'C', color: 'bg-gradient-to-r from-amber-500 to-amber-600', label: 'Satisfactory' }
    if (percentage >= 50) return { grade: 'D', color: 'bg-gradient-to-r from-orange-500 to-orange-600', label: 'Pass' }
    return { grade: 'F', color: 'bg-gradient-to-r from-red-500 to-red-600', label: 'Fail' }
  }

  const getPerformanceStats = () => {
    if (!quiz || !submission) return null

    const correct = submission.answers.filter(a => a.isCorrect).length
    const incorrect = submission.answers.length - correct
    const accuracy = (correct / submission.answers.length) * 100

    return {
      correct,
      incorrect,
      accuracy: accuracy.toFixed(1),
      totalQuestions: quiz.questions.length
    }
  }

  const downloadResults = () => {
    if (!quiz || !submission) return

    const csvData = [
      ['Quiz Title', 'Student Name', 'Submission Date', 'Total Marks', 'Marks Obtained', 'Percentage', 'Grade', 'Correct Answers', 'Total Questions'],
      [
        quiz.title,
        submission.studentName,
        formatDate(submission.submittedAt),
        quiz.totalMarks.toString(),
        submission.totalMarksObtained.toString(),
        `${submission.percentage.toFixed(2)}%`,
        calculateGrade(submission.percentage).grade,
        getPerformanceStats()?.correct.toString() || '0',
        quiz.questions.length.toString()
      ]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title}_results.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Results downloaded')
  }

  const getQuestionAnalysis = () => {
    if (!quiz || !submission) return []

    return quiz.questions.map((question, index) => {
      const answer = submission.answers.find(a => a.questionId === question.id)
      const isCorrect = answer?.isCorrect || false
      const selectedOption = answer?.selectedOption ?? -1

      return {
        question,
        answer,
        isCorrect,
        selectedOption,
        questionNumber: index + 1
      }
    })
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

  if (!quiz || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-600">Results not found</p>
        </div>
      </div>
    )
  }

  const gradeInfo = calculateGrade(submission.percentage)
  const stats = getPerformanceStats()
  const questionAnalysis = getQuestionAnalysis()
  const passed = submission.percentage >= 50

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/lms/Student_Portal/quizzes"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Quizzes</span>
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title} - Results</h1>
                <p className="text-gray-600 mt-1">Your quiz performance summary</p>
              </div>
              
              <button
                onClick={downloadResults}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <HiDownload className="w-5 h-5" />
                Download Results
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Summary */}
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${gradeInfo.color} mb-4`}>
                    <span className="text-2xl font-bold text-white">{gradeInfo.grade}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Final Score</h3>
                  <p className="text-sm text-gray-600">{gradeInfo.label}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {submission.totalMarksObtained}/{quiz.totalMarks}
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {submission.percentage.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className={`px-4 py-3 rounded-lg text-center ${
                    passed 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      {passed ? (
                        <>
                          <HiCheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-700">Quiz Passed</span>
                        </>
                      ) : (
                        <>
                          <HiXCircle className="w-5 h-5 text-red-600" />
                          <span className="font-bold text-red-700">Quiz Failed</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {passed 
                        ? `You scored above the passing threshold (50%).` 
                        : `You need ${(quiz.totalMarks * 0.5).toFixed(0)} marks to pass.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Submission Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <HiUser className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Student</p>
                      <p className="font-medium text-gray-900">{submission.studentName}</p>
                    </div>
                  </div>
                  
                  {course && (
                    <div className="flex items-center gap-3">
                      <HiBookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Course</p>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <HiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Submitted On</p>
                      <p className="font-medium text-gray-900">{formatDate(submission.submittedAt)}</p>
                    </div>
                  </div>
                  
                  {submission.timeTaken && (
                    <div className="flex items-center gap-3">
                      <HiClock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Time Taken</p>
                        <p className="font-medium text-gray-900">{formatTime(submission.timeTaken)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      submission.status === 'graded' 
                        ? 'bg-green-100 text-green-800'
                        : submission.status === 'late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status === 'graded' ? 'Graded' :
                       submission.status === 'late' ? 'Late Submission' :
                       'Submitted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              {stats && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Performance Analysis</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                        <div className="text-sm text-gray-600">Correct</div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                        <div className="text-sm text-gray-600">Incorrect</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Accuracy</span>
                        <span>{stats.accuracy}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${stats.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Questions Attempted</span>
                        <span className="font-medium text-gray-900">
                          {stats.correct + stats.incorrect}/{stats.totalQuestions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Question Review */}
            <div className="lg:col-span-2 space-y-6">
              {/* Feedback Section */}
              {submission.feedback && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <HiStar className="w-6 h-6 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-900">Instructor Feedback</h3>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{submission.feedback}</p>
                  </div>
                  
                  {submission.gradedAt && (
                    <p className="text-sm text-gray-500 mt-3">
                      Graded on: {formatDate(submission.gradedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Question Review */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <HiChartBar className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Question Review</h3>
                  </div>
                  
                  <button
                    onClick={() => setShowAllAnswers(!showAllAnswers)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    {showAllAnswers ? 'Show Summary' : 'Show All Answers'}
                  </button>
                </div>
                
                {showAllAnswers ? (
                  <div className="space-y-8">
                    {questionAnalysis.map((item, index) => (
                      <div key={item.question.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">Question {item.questionNumber}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {item.question.marks} mark{item.question.marks > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-4">{item.question.question}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {item.question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                oIndex === item.question.correctAnswer
                                  ? 'border-green-600 bg-green-50'
                                  : oIndex === item.selectedOption && oIndex !== item.question.correctAnswer
                                  ? 'border-red-600 bg-red-50'
                                  : 'border-gray-300'
                              }`}>
                                {oIndex === item.question.correctAnswer && (
                                  <HiCheck className="w-3 h-3 text-green-600" />
                                )}
                                {oIndex === item.selectedOption && oIndex !== item.question.correctAnswer && (
                                  <span className="text-xs text-red-600">✗</span>
                                )}
                              </div>
                              
                              <span className={`flex-1 px-4 py-3 rounded-lg border ${
                                oIndex === item.question.correctAnswer
                                  ? 'border-green-300 bg-green-50 text-green-800'
                                  : oIndex === item.selectedOption && oIndex !== item.question.correctAnswer
                                  ? 'border-red-300 bg-red-50 text-red-800'
                                  : 'border-gray-300 bg-gray-50 text-gray-700'
                              }`}>
                                {option}
                              </span>
                              
                              {oIndex === item.selectedOption && (
                                <span className="text-sm font-medium text-gray-600">
                                  Your answer
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 text-sm">
                          <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>Correct Answer: Option {item.question.correctAnswer + 1}</span>
                            </div>
                            
                            {item.selectedOption !== -1 && (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Your Answer: Option {item.selectedOption + 1}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-gray-600">Marks Obtained</span>
                            <span className={`font-medium ${
                              item.isCorrect ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.answer?.marksObtained || 0}/{item.question.marks}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-5 gap-3 mb-6">
                      {questionAnalysis.map((item, index) => (
                        <div
                          key={item.question.id}
                          className={`h-12 rounded-lg flex items-center justify-center relative ${
                            item.isCorrect
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                          title={`Question ${index + 1}: ${item.isCorrect ? 'Correct' : 'Incorrect'}`}
                        >
                          {index + 1}
                          {!item.isCorrect && (
                            <HiFlag className="absolute -top-1 -right-1 w-4 h-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                          <span className="text-gray-600">Correct Answer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                          <span className="text-gray-600">Incorrect Answer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiFlag className="w-4 h-4 text-red-500" />
                          <span className="text-gray-600">Answered Incorrectly</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                        <p className="text-gray-700 text-sm">
                          You answered {stats?.correct} out of {stats?.totalQuestions} questions correctly. 
                          Review incorrect answers to improve your understanding of the topics.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  href="/lms/Student_Portal/quizzes"
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
                >
                  Back to Quizzes
                </Link>
                
                <button
                  onClick={() => {
                    // Option to retake quiz if allowed
                    if (confirm('Do you want to retake this quiz? This will create a new attempt.')) {
                      localStorage.removeItem(`quiz_progress_${quiz.id}`)
                      router.push(`/lms/Student_Portal/quizzes/${quiz.id}/attempt`)
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}