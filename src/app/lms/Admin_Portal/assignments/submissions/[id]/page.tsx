'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { HiArrowLeft, HiDownload, HiCheckCircle, HiClock, HiEye, HiUser, HiAcademicCap, HiDocumentText, HiCalendar } from 'react-icons/hi'
import Link from 'next/link'

interface Submission {
  id: string
  studentId: string
  studentName: string
  submittedAt: string
  score: number | null
  grade: string | null
  status: 'submitted' | 'graded' | 'late' | 'missing'
  fileUrl?: string
  textSubmission?: string
  feedback?: string
  gradedBy?: string
  gradedAt?: string
}

interface Assignment {
  id: string
  title: string
  courseId: string
  courseName: string
  moduleId: string
  moduleName: string
  dueDate: string
  totalPoints: number
  submissionType: 'file' | 'text' | 'both'
  status: 'draft' | 'published' | 'closed'
  totalStudents: number
  submitted: number
  averageScore: number | null
  submissions: Submission[]
}

export default function SubmissionsPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
  const [gradeForm, setGradeForm] = useState({
    score: 0,
    grade: '',
    feedback: ''
  })

  useEffect(() => {
    loadData()
  }, [assignmentId])

  const loadData = () => {
    // Load assignment data (in real app, this would be from localStorage or API)
    const sampleAssignment: Assignment = {
      id: assignmentId,
      title: 'HTML Portfolio Project',
      courseId: 'course-1',
      courseName: 'Web Development Bootcamp',
      moduleId: 'module-1',
      moduleName: 'HTML & CSS Fundamentals',
      dueDate: '2024-04-15',
      totalPoints: 100,
      submissionType: 'file',
      status: 'published',
      totalStudents: 45,
      submitted: 42,
      averageScore: 82,
      submissions: [
        {
          id: 'sub-1',
          studentId: 'STU2024001',
          studentName: 'John Doe',
          submittedAt: '2024-04-14T10:30:00',
          score: 95,
          grade: 'A',
          status: 'graded',
          fileUrl: '#',
          feedback: 'Excellent work! The portfolio design is clean and responsive. Good use of semantic HTML.',
          gradedBy: 'Dr. Sarah Johnson',
          gradedAt: '2024-04-15T09:15:00'
        },
        {
          id: 'sub-2',
          studentId: 'STU2024002',
          studentName: 'Jane Smith',
          submittedAt: '2024-04-15T23:45:00',
          score: 88,
          grade: 'B+',
          status: 'graded',
          fileUrl: '#',
          feedback: 'Good work, but could improve mobile responsiveness.',
          gradedBy: 'Dr. Sarah Johnson',
          gradedAt: '2024-04-16T11:30:00'
        },
        {
          id: 'sub-3',
          studentId: 'STU2024003',
          studentName: 'Bob Johnson',
          submittedAt: '2024-04-16T08:20:00',
          score: null,
          grade: null,
          status: 'late',
          fileUrl: '#'
        },
        {
          id: 'sub-4',
          studentId: 'STU2024004',
          studentName: 'Alice Brown',
          submittedAt: '2024-04-14T14:15:00',
          score: 92,
          grade: 'A-',
          status: 'graded',
          fileUrl: '#',
          feedback: 'Great attention to detail!',
          gradedBy: 'Dr. Sarah Johnson',
          gradedAt: '2024-04-15T10:45:00'
        },
        {
          id: 'sub-5',
          studentId: 'STU2024005',
          studentName: 'Charlie Wilson',
          status: 'missing',
          submittedAt: '',
          score: null,
          grade: null
        },
        {
          id: 'sub-6',
          studentId: 'STU2024006',
          studentName: 'David Lee',
          submittedAt: '2024-04-14T16:30:00',
          score: 78,
          grade: 'C+',
          status: 'graded',
          fileUrl: '#',
          feedback: 'Good effort but needs improvement in CSS organization.',
          gradedBy: 'Dr. Sarah Johnson',
          gradedAt: '2024-04-15T14:20:00'
        },
        {
          id: 'sub-7',
          studentId: 'STU2024007',
          studentName: 'Emma Wilson',
          submittedAt: '2024-04-15T14:45:00',
          score: null,
          grade: null,
          status: 'submitted',
          fileUrl: '#'
        }
      ]
    }

    setAssignment(sampleAssignment)
    setLoading(false)
  }

  const startGrading = (submission: Submission) => {
    setGradingSubmission(submission)
    setGradeForm({
      score: submission.score || 0,
      grade: submission.grade || '',
      feedback: submission.feedback || ''
    })
  }

  const submitGrade = () => {
    if (!assignment || !gradingSubmission) return

    // Update submission with proper type casting
    const updatedSubmissions = assignment.submissions.map(sub => 
      sub.id === gradingSubmission.id 
        ? {
            ...sub,
            score: gradeForm.score,
            grade: gradeForm.grade,
            feedback: gradeForm.feedback,
            status: 'graded',
            gradedBy: 'Admin User',
            gradedAt: new Date().toISOString()
          }
        : sub
    )

    // Calculate average score
    const gradedSubmissions = updatedSubmissions.filter(s => s.score !== null)
    const averageScore = gradedSubmissions.length > 0 
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length)
      : null

    // Update assignment
    const updatedAssignment: Assignment = {
      ...assignment,
      submissions: updatedSubmissions as Submission[],
      averageScore
    }

    setAssignment(updatedAssignment)
    setGradingSubmission(null)
    
    alert('Grade submitted successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-50 text-green-700 border border-green-200'
      case 'submitted': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'late': return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'missing': return 'bg-red-50 text-red-700 border border-red-200'
      default: return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <HiCheckCircle className="w-4 h-4 text-green-500" />
      case 'submitted': return <HiClock className="w-4 h-4 text-blue-500" />
      case 'late': return <HiClock className="w-4 h-4 text-amber-500" />
      case 'missing': return <HiClock className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-500'
    if (grade.includes('A')) return 'text-green-600'
    if (grade.includes('B')) return 'text-blue-600'
    if (grade.includes('C')) return 'text-amber-600'
    if (grade.includes('D')) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/lms/Admin_Portal/assignments"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-4 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Assignments
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assignment Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  const gradedCount = assignment.submissions.filter(s => s.status === 'graded').length
  const pendingCount = assignment.submissions.filter(s => s.status === 'submitted').length
  const lateCount = assignment.submissions.filter(s => s.status === 'late').length
  const missingCount = assignment.submissions.filter(s => s.status === 'missing').length

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/lms/Admin_Portal/assignments"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-3 transition-colors group"
          >
            <HiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Assignments</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
              <HiDocumentText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Submissions Management</h1>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <HiAcademicCap className="w-4 h-4" />
              <span className="text-sm">{assignment.courseName}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <HiCalendar className="w-4 h-4" />
              <span className="text-sm">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <HiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link
            href={`/lms/Admin_Portal/assignments/edit/${assignmentId}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            Edit Assignment
          </Link>
        </div>
      </div>

      {/* Assignment Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="text-2xl font-bold text-gray-900">{assignment.totalPoints}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <HiAcademicCap className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">Maximum score</div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                <span className="text-purple-600">{assignment.submitted}</span>
                <span className="text-gray-400">/{assignment.totalStudents}</span>
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <HiDocumentText className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(assignment.submitted / assignment.totalStudents) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((assignment.submitted / assignment.totalStudents) * 100)}% submission rate
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Average Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(assignment.averageScore)}`}>
                {assignment.averageScore !== null ? `${assignment.averageScore}%` : 'N/A'}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <HiCheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">Based on graded submissions</div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className={`text-lg font-bold ${
                assignment.status === 'published' ? 'text-green-600' : 
                assignment.status === 'draft' ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <HiClock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {new Date(assignment.dueDate) < new Date() ? 'Assignment closed' : 'Open for submission'}
          </div>
        </div>
      </div>

      {/* Submission Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Graded</p>
              <p className="text-2xl font-bold text-green-800">{gradedCount}</p>
            </div>
            <div className="p-2 bg-white/50 rounded-lg">
              <HiCheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            Ready for review
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-blue-800">{pendingCount}</p>
            </div>
            <div className="p-2 bg-white/50 rounded-lg">
              <HiClock className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Awaiting grading
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 mb-1">Late Submissions</p>
              <p className="text-2xl font-bold text-amber-800">{lateCount}</p>
            </div>
            <div className="p-2 bg-white/50 rounded-lg">
              <HiClock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-amber-600">
            Submitted after deadline
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 mb-1">Missing</p>
              <p className="text-2xl font-bold text-red-800">{missingCount}</p>
            </div>
            <div className="p-2 bg-white/50 rounded-lg">
              <HiUser className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-red-600">
            Not submitted yet
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Student Submissions</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{assignment.submissions.length} students</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignment.submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                        <span className="text-white text-sm font-bold">
                          {submission.studentName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{submission.studentName}</div>
                        <div className="text-sm text-gray-500">{submission.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.submittedAt ? (
                      <div>
                        <div className="text-gray-900 font-medium">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Not submitted</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(submission.status)}
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-bold text-lg ${getScoreColor(submission.score)}`}>
                      {submission.score !== null ? (
                        <>
                          {submission.score}
                          <span className="text-gray-400 text-sm font-normal">/{assignment.totalPoints}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold text-lg ${getGradeColor(submission.grade)}`}>
                      {submission.grade || '--'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {submission.status !== 'missing' && submission.fileUrl && (
                        <button
                          onClick={() => window.open(submission.fileUrl, '_blank')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 text-sm"
                        >
                          <HiEye className="w-3 h-3" />
                          View
                        </button>
                      )}
                      <button
                        onClick={() => startGrading(submission)}
                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
                          submission.status === 'graded'
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        {submission.status === 'graded' ? 'Re-grade' : 'Grade'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HiDocumentText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Grade Submission
                    </h2>
                    <p className="text-sm text-gray-600">{gradingSubmission.studentName} • {gradingSubmission.studentId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Submission Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Submission Date</p>
                    <p className="font-medium text-gray-900">
                      {gradingSubmission.submittedAt 
                        ? new Date(gradingSubmission.submittedAt).toLocaleString()
                        : 'Not submitted'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Status</p>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(gradingSubmission.status)}`}>
                      {gradingSubmission.status.charAt(0).toUpperCase() + gradingSubmission.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Score Input */}
                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                    Score <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      id="score"
                      min="0"
                      max={assignment.totalPoints}
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm(prev => ({ 
                        ...prev, 
                        score: parseInt(e.target.value) 
                      }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        max={assignment.totalPoints}
                        value={gradeForm.score}
                        onChange={(e) => setGradeForm(prev => ({ 
                          ...prev, 
                          score: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0</span>
                    <span className="font-medium">
                      Percentage: {Math.round((gradeForm.score / assignment.totalPoints) * 100)}%
                    </span>
                    <span>{assignment.totalPoints}</span>
                  </div>
                </div>

                {/* Grade Input */}
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Letter
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setGradeForm(prev => ({ ...prev, grade }))}
                        className={`p-3 rounded-lg border transition-all ${
                          gradeForm.grade === grade
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`font-bold ${getGradeColor(grade)}`}>{grade}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Provide constructive feedback to help the student improve..."
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {gradeForm.feedback.length}/500 characters
                  </div>
                </div>

                {/* View Submission */}
                {gradingSubmission.fileUrl && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-medium text-gray-900 mb-3">Submitted Work</h3>
                    <button
                      onClick={() => window.open(gradingSubmission.fileUrl, '_blank')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <HiEye className="w-4 h-4" />
                      View Submission File
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setGradingSubmission(null)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitGrade}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      Submit Grade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add some custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}