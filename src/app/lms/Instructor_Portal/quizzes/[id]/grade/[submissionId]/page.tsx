'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiUser, HiCalendar, 
  HiCheck, HiX, HiStar, HiSave, HiDownload,
  HiCheckCircle, HiExclamationCircle,
  HiClock, HiBookOpen, HiAcademicCap,
  HiDocumentText, HiArrowUp, HiArrowDown
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'
/* eslint-disable */

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
  gradedBy?: string
}

interface Quiz {
  id: string
  title: string
  totalMarks: number
  questions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    marks: number
  }[]
  submissions?: Submission[]
}

export default function GradeSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [manualGrades, setManualGrades] = useState<{[key: string]: number}>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    try {
      // Load quiz
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const foundQuiz = allQuizzes.find((q: Quiz) => q.id === params.quizId)
      
      if (!foundQuiz) {
        toast.error('Quiz not found')
        router.push('/lms/Instructor_Portal/quizzes')
        return
      }
      setQuiz(foundQuiz)

      // Load submission
      const allSubmissions = foundQuiz.submissions || []
      const foundSubmission = allSubmissions.find((s: Submission) => s.id === params.submissionId)
      
      if (!foundSubmission) {
        toast.error('Submission not found')
        router.push(`/lms/Instructor_Portal/quizzes/${params.quizId}`)
        return
      }
      setSubmission(foundSubmission)
      setFeedback(foundSubmission.feedback || '')

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load submission')
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

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800 border border-green-200' }
    if (percentage >= 80) return { grade: 'A', color: 'bg-blue-100 text-blue-800 border border-blue-200' }
    if (percentage >= 70) return { grade: 'B', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' }
    if (percentage >= 60) return { grade: 'C', color: 'bg-orange-100 text-orange-800 border border-orange-200' }
    if (percentage >= 50) return { grade: 'D', color: 'bg-red-100 text-red-800 border border-red-200' }
    return { grade: 'F', color: 'bg-gray-100 text-gray-800 border border-gray-200' }
  }

  const handleManualGradeChange = (questionId: string, marks: number) => {
    const question = quiz?.questions.find(q => q.id === questionId)
    if (!question) return
    
    const maxMarks = question.marks
    const newMarks = Math.min(Math.max(0, marks), maxMarks)
    
    setManualGrades(prev => ({
      ...prev,
      [questionId]: newMarks
    }))
  }

  const calculateAutoGrade = () => {
    if (!quiz || !submission) return { total: 0, percentage: 0 }
    
    let totalMarks = 0
    quiz.questions.forEach(question => {
      const answer = submission.answers.find(a => a.questionId === question.id)
      if (answer) {
        totalMarks += answer.marksObtained
      }
    })
    
    const percentage = (totalMarks / quiz.totalMarks) * 100
    return { total: totalMarks, percentage: percentage }
  }

  const calculateFinalGrade = () => {
    if (!quiz || !submission) return { total: 0, percentage: 0 }
    
    const autoGrade = calculateAutoGrade()
    let totalMarks = autoGrade.total
    
    // Apply manual adjustments
    Object.keys(manualGrades).forEach(questionId => {
      const manualMark = manualGrades[questionId]
      totalMarks = manualMark
    })
    
    const percentage = (totalMarks / quiz.totalMarks) * 100
    return { total: totalMarks, percentage: percentage }
  }

  const handleSaveGrade = async () => {
    if (!quiz || !submission) return
    
    setSaving(true)
    
    try {
      const finalGrade = calculateFinalGrade()
      const gradeInfo = calculateGrade(finalGrade.percentage)
      
      // Fix: Ensure status is typed correctly
      const updatedSubmission: Submission = {
        ...submission,
        totalMarksObtained: finalGrade.total,
        percentage: finalGrade.percentage,
        status: 'graded' as const, // Explicitly cast to the union type
        feedback: feedback.trim(),
        gradedAt: new Date().toISOString(),
        gradedBy: 'Instructor'
      }

      // Update in localStorage
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const quizIndex = allQuizzes.findIndex((q: Quiz) => q.id === params.quizId)
      
      if (quizIndex !== -1) {
        const submissionIndex = allQuizzes[quizIndex].submissions?.findIndex(
          (s: Submission) => s.id === params.submissionId
        ) || -1
        
        if (submissionIndex !== -1) {
          allQuizzes[quizIndex].submissions[submissionIndex] = updatedSubmission
          localStorage.setItem('quizzes', JSON.stringify(allQuizzes))
          
          setSubmission(updatedSubmission)
          
          toast.success('Grade saved successfully!')
          
          // Navigate back after a delay
          setTimeout(() => {
            router.push(`/lms/Instructor_Portal/quizzes/${params.quizId}/submissions`)
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Error saving grade:', error)
      toast.error('Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  const downloadSubmission = () => {
    if (!quiz || !submission) return
    
    const csvData = [
      ['Student Name', 'Student Email', 'Quiz Title', 'Submission Date', 'Total Marks', 'Marks Obtained', 'Percentage', 'Grade', 'Feedback'],
      [
        submission.studentName,
        submission.studentEmail,
        quiz.title,
        formatDate(submission.submittedAt),
        quiz.totalMarks.toString(),
        submission.totalMarksObtained.toString(),
        `${submission.percentage.toFixed(2)}%`,
        calculateGrade(submission.percentage).grade,
        submission.feedback || ''
      ]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title}_${submission.studentName}_submission.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Submission downloaded')
  }

  const markAsLate = () => {
    if (!submission) return
    
    // Fix: Ensure status is typed correctly
    const updatedSubmission: Submission = {
      ...submission,
      status: 'late' as const // Explicitly cast to the union type
    }
    
    // Update in localStorage
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    const quizIndex = allQuizzes.findIndex((q: Quiz) => q.id === params.quizId)
    
    if (quizIndex !== -1) {
      const submissionIndex = allQuizzes[quizIndex].submissions?.findIndex(
        (s: Submission) => s.id === params.submissionId
      ) || -1
      
      if (submissionIndex !== -1) {
        allQuizzes[quizIndex].submissions[submissionIndex] = updatedSubmission
        localStorage.setItem('quizzes', JSON.stringify(allQuizzes))
        setSubmission(updatedSubmission)
        toast.success('Marked as late submission')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submission details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <HiExclamationCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Submission Not Found</h3>
            <p className="text-gray-600 mb-6">The requested submission could not be found.</p>
            <Link
              href={`/lms/Instructor_Portal/quizzes/${params.quizId}/submissions`}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all"
            >
              Back to Submissions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const finalGrade = calculateFinalGrade()
  const gradeInfo = calculateGrade(finalGrade.percentage)
  const autoGrade = calculateAutoGrade()

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
                <p className="text-gray-600">Review and grade student's quiz attempt</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href={`/lms/Instructor_Portal/quizzes/${quiz.id}/submissions`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <HiArrowLeft className="w-5 h-5" />
                  Back to Submissions
                </Link>
                
                <button
                  onClick={downloadSubmission}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <HiDownload className="w-5 h-5" />
                  Download
                </button>
                
                {submission.status === 'submitted' && (
                  <button
                    onClick={markAsLate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-medium transition-all"
                  >
                    <HiExclamationCircle className="w-5 h-5" />
                    Mark as Late
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Questions</p>
                    <p className="text-xl font-bold text-gray-900">{quiz.questions.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HiBookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="text-xl font-bold text-gray-900">{quiz.totalMarks}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <HiDocumentText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Score</p>
                    <p className="text-xl font-bold text-gray-900">{submission.totalMarksObtained}/{quiz.totalMarks}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <HiCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Final Grade</p>
                    <div className="text-xl font-bold text-gray-900">{finalGrade.total}/{quiz.totalMarks}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Student Info and Answers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Student Information</h2>
                  <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    submission.status === 'graded' 
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : submission.status === 'late'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {submission.status === 'graded' ? 'Graded' :
                     submission.status === 'late' ? 'Late Submission' :
                     'Submitted'}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <HiUser className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student Name</p>
                      <p className="font-bold text-gray-900 text-lg">{submission.studentName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <HiAcademicCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Student Email</p>
                      <p className="font-medium text-gray-900">{submission.studentEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <HiCalendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted At</p>
                      <p className="font-medium text-gray-900">{formatDate(submission.submittedAt)}</p>
                    </div>
                  </div>
                  
                  {submission.gradedAt && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <HiClock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Graded At</p>
                        <p className="font-medium text-gray-900">{formatDate(submission.gradedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Answers and Grading */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    Student Answers & Grading ({quiz.questions.length} questions)
                  </h2>
                  <div className="text-sm text-gray-600">
                    Auto-scored: {autoGrade.total}/{quiz.totalMarks}
                  </div>
                </div>
                
                <div className="space-y-8">
                  {quiz.questions.map((question, qIndex) => {
                    const answer = submission.answers.find(a => a.questionId === question.id)
                    const isCorrect = answer?.isCorrect || false
                    const selectedOption = answer?.selectedOption ?? -1
                    const manualMark = manualGrades[question.id]
                    const displayMark = manualMark !== undefined ? manualMark : (answer?.marksObtained || 0)
                    
                    return (
                      <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-gray-900">{qIndex + 1}</span>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Question {qIndex + 1}</h3>
                            </div>
                            <p className="text-gray-700">{question.question}</p>
                          </div>
                          <div className="lg:w-48">
                            <div className="text-sm text-gray-600 mb-2">Marks Allocation</div>
                            <div className="flex items-center justify-between">
                              <input
                                type="number"
                                min="0"
                                max={question.marks}
                                value={displayMark}
                                onChange={(e) => handleManualGradeChange(question.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg text-center font-medium"
                              />
                              <span className="text-gray-500">/ {question.marks}</span>
                              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                displayMark === question.marks 
                                  ? 'bg-green-100 text-green-800' 
                                  : displayMark > 0
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {displayMark === question.marks ? 'Full' : displayMark > 0 ? 'Partial' : 'Zero'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Options */}
                        <div className="space-y-3 mb-6">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center ${
                                oIndex === question.correctAnswer
                                  ? 'border-green-600 bg-green-50'
                                  : oIndex === selectedOption && oIndex !== question.correctAnswer
                                  ? 'border-red-600 bg-red-50'
                                  : 'border-gray-300 bg-gray-50'
                              }`}>
                                {oIndex === question.correctAnswer && (
                                  <HiCheck className="w-4 h-4 text-green-600" />
                                )}
                                {oIndex === selectedOption && oIndex !== question.correctAnswer && (
                                  <HiX className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                              
                              <span className={`flex-1 px-5 py-3 rounded-xl border ${
                                oIndex === question.correctAnswer
                                  ? 'border-green-300 bg-green-50 text-green-800'
                                  : oIndex === selectedOption && oIndex !== question.correctAnswer
                                  ? 'border-red-300 bg-red-50 text-red-800'
                                  : 'border-gray-300 bg-gray-50 text-gray-700'
                              }`}>
                                {option}
                              </span>
                              
                              {oIndex === selectedOption && (
                                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                  isCorrect
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {isCorrect ? 'Correct Answer ✓' : 'Incorrect Answer ✗'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Answer Summary */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm text-gray-700">Correct: Option {question.correctAnswer + 1}</span>
                            </div>
                            
                            {selectedOption !== -1 && (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-700">Student: Option {selectedOption + 1}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-lg font-medium ${
                              isCorrect
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {displayMark}/{question.marks} marks
                            </div>
                            {manualMark !== undefined && (
                              <div className="flex items-center gap-1 text-sm text-purple-600">
                                {manualMark > (answer?.marksObtained || 0) ? <HiArrowUp /> : <HiArrowDown />}
                                <span>Manual Adjustment</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Grading Panel */}
            <div className="space-y-6">
              {/* Grading Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Grading Summary</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">Auto-Graded Score</p>
                      <span className="text-sm text-gray-500">
                        {Math.round((autoGrade.total / quiz.totalMarks) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {autoGrade.total}/{quiz.totalMarks}
                      </div>
                      <div className="h-3 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-500"
                          style={{ width: `${(autoGrade.total / quiz.totalMarks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-600">Final Score (with adjustments)</p>
                      <span className="text-sm text-purple-600 font-medium">
                        {finalGrade.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {finalGrade.total}/{quiz.totalMarks}
                      </div>
                      <div className="h-3 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${finalGrade.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Grade & Performance</p>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl">
                      <div className="text-4xl font-bold text-purple-700 mb-2">{gradeInfo.grade}</div>
                      <div className="text-lg font-medium text-gray-900">{finalGrade.percentage.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {finalGrade.percentage >= 90 ? 'Excellent Performance 🎉' :
                         finalGrade.percentage >= 80 ? 'Very Good 👍' :
                         finalGrade.percentage >= 70 ? 'Good Job ✅' :
                         finalGrade.percentage >= 60 ? 'Satisfactory' :
                         finalGrade.percentage >= 50 ? 'Needs Improvement' :
                         'Requires Re-examination'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Instructor Feedback</h3>
                
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Comments for Student
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    placeholder="Provide constructive feedback to help the student improve..."
                  />
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <HiExclamationCircle className="w-4 h-4" />
                    <span>This feedback will be visible to the student</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Finalize Grade</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <HiCheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto-grading Completed</p>
                      <p className="text-xs text-gray-600">{quiz.questions.length} questions checked</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <HiStar className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Manual Adjustments</p>
                      <p className="text-xs text-gray-600">
                        {Object.keys(manualGrades).length} question{Object.keys(manualGrades).length !== 1 ? 's' : ''} manually graded
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveGrade}
                      disabled={saving}
                      className={`w-full px-6 py-3.5 rounded-lg font-medium flex items-center justify-center gap-3 ${
                        saving
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all'
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving Grade...
                        </>
                      ) : (
                        <>
                          <HiSave className="w-5 h-5" />
                          Save Final Grade
                        </>
                      )}
                    </button>
                    
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      This will mark the submission as graded and notify the student.
                    </p>
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