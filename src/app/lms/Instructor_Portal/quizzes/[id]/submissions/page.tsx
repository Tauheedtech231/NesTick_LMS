'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiUser, HiCheck, HiX,
  HiClock, HiCalendar, HiDownload
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

interface Submission {
  id: string
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
  status: 'submitted' | 'graded'
}

interface Quiz {
  id: string
  title: string
  totalMarks: number
  questions: {
    id: string
    question: string
    correctAnswer: number
    marks: number
  }[]
  submissions: Submission[]
}

export default function QuizSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    loadQuiz()
  }, [])

  const loadQuiz = () => {
    try {
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      const foundQuiz = allQuizzes.find((q: Quiz) => q.id === params.id)
      
      if (foundQuiz) {
        setQuiz(foundQuiz)
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

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const exportToCSV = () => {
    if (!quiz) return
    
    setExportLoading(true)
    try {
      const csvRows = []
      
      // Header row
      csvRows.push(['Student Name', 'Student Email', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade', 'Submission Date'])
      
      // Data rows
      quiz.submissions.forEach(sub => {
        const grade = calculateGrade(sub.percentage)
        csvRows.push([
          sub.studentName,
          sub.studentEmail,
          sub.totalMarksObtained.toString(),
          sub.totalMarks.toString(),
          `${sub.percentage.toFixed(2)}%`,
          grade,
          formatDate(sub.submittedAt)
        ])
      })
      
      // Create CSV content
      const csvContent = csvRows.map(row => row.join(',')).join('\n')
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quiz.title.replace(/\s+/g, '_')}_submissions.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('CSV exported successfully')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV')
    } finally {
      setExportLoading(false)
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
                href={`/lms/Instructor_Portal/quizzes/${quiz.id}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <HiArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Quiz</span>
              </Link>
              
              <button
                onClick={exportToCSV}
                disabled={exportLoading || quiz.submissions?.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  exportLoading || quiz.submissions?.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <HiDownload className="w-5 h-5" />
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title} - Submissions</h1>
            <p className="text-gray-600 mt-1">
              {quiz.submissions?.length || 0} submissions received
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{quiz.submissions?.length || 0}</p>
            </div>
            
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.submissions?.length > 0
                  ? (quiz.submissions.reduce((acc, sub) => acc + sub.percentage, 0) / quiz.submissions.length).toFixed(1)
                  : '0'}%
              </p>
            </div>
            
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-500">Highest Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.submissions?.length > 0
                  ? Math.max(...quiz.submissions.map(s => s.percentage)).toFixed(1)
                  : '0'}%
              </p>
            </div>
            
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <p className="text-sm text-gray-500">Lowest Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {quiz.submissions?.length > 0
                  ? Math.min(...quiz.submissions.map(s => s.percentage)).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            {quiz.submissions?.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No submissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quiz.submissions?.map((submission, index) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <HiUser className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.studentEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.totalMarksObtained} / {submission.totalMarks}
                            </div>
                            <div className="text-sm text-gray-500">
                              {submission.percentage.toFixed(2)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                            calculateGrade(submission.percentage) === 'A+' 
                              ? 'bg-green-100 text-green-800'
                              : calculateGrade(submission.percentage) === 'A'
                              ? 'bg-blue-100 text-blue-800'
                              : calculateGrade(submission.percentage) === 'B'
                              ? 'bg-yellow-100 text-yellow-800'
                              : calculateGrade(submission.percentage) === 'C'
                              ? 'bg-orange-100 text-orange-800'
                              : calculateGrade(submission.percentage) === 'D'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {calculateGrade(submission.percentage)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <HiCalendar className="w-4 h-4" />
                            {formatDate(submission.submittedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            submission.status === 'graded'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/lms/Instructor_Portal/quizzes/${quiz.id}/submissions/${submission.id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Question-wise Analysis */}
          {quiz.submissions?.length > 0 && (
            <div className="mt-6 bg-white border border-gray-300 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Question-wise Analysis
              </h2>
              
              <div className="space-y-6">
                {quiz.questions.map((question, qIndex) => {
                  const correctSubmissions = quiz.submissions.filter(sub => 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    sub.answers.find((ans: any) => 
                      ans.questionId === question.id && ans.isCorrect
                    )
                  ).length
                  
                  const accuracy = (correctSubmissions / quiz.submissions.length) * 100
                  
                  return (
                    <div key={question.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          Q{qIndex + 1}: {question.question}
                        </h3>
                        <span className="text-sm text-gray-500">{question.marks} marks</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: `${accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {accuracy.toFixed(1)}% correct ({correctSubmissions}/{quiz.submissions.length})
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Correct Answer: Option {question.correctAnswer + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}