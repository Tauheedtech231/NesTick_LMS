// app/lms/Instructor_Portal/assignments/[id]/submissions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiSearch, HiUser, HiCalendar, 
  HiCheckCircle, HiClock, HiDownload, HiStar,
  HiChevronRight, HiEye, HiChat
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

interface Submission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  submittedAt: string
  fileUrl?: string
  fileName?: string
  remarks?: string
  marks?: number
  feedback?: string
  status: 'submitted' | 'graded' | 'late' | 'pending'
  grade?: string
}

interface Assignment {
  id: string
  title: string
  totalMarks: number
  dueDate: string
  courseId: string
}

export default function AssignmentSubmissionsPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [assignmentId])

  const loadData = () => {
    try {
      setLoading(true)
      
      // Get assignment
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const currentAssignment = allAssignments.find((a: any) => a.id === assignmentId)
      
      if (!currentAssignment) {
        toast.error('Assignment not found')
        router.back()
        return
      }
      
      setAssignment(currentAssignment)

      // Get submissions
      const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      const assignmentSubmissions = allSubmissions.filter((sub: Submission) => 
        sub.assignmentId === assignmentId
      )
      
      setSubmissions(assignmentSubmissions)
      setFilteredSubmissions(assignmentSubmissions)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...submissions]

    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }, [searchTerm, statusFilter, submissions])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'late':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'graded': return 'Graded'
      case 'submitted': return 'Submitted'
      case 'late': return 'Late'
      default: return 'Pending'
    }
  }

  const gradeSubmission = (submissionId: string) => {
    router.push(`/lms/Instructor_Portal/assignments/${assignmentId}/grade/${submissionId}`)
  }

  const downloadSubmission = (submission: Submission) => {
    if (!submission.fileUrl) {
      toast.error('No file to download')
      return
    }
    
    const link = document.createElement('a')
    link.href = submission.fileUrl
    link.download = submission.fileName || 'submission'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto my-12"></div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-gray-900">Assignment not found</h3>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <HiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title} - Submissions</h1>
                <p className="text-gray-600">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''} • Total Marks: {assignment.totalMarks}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'graded').length}
                </p>
              </div>
              
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-amber-600">
                  {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length}
                </p>
              </div>
              
              <div className="bg-white border border-gray-300 rounded-lg p-3">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-xl font-bold text-red-600">
                  {submissions.filter(s => s.status === 'late').length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Submissions
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student name or file..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="graded">Graded</option>
                  <option value="submitted">Submitted</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <HiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-600 mb-4">
                {submissions.length === 0 
                  ? "No students have submitted this assignment yet."
                  : "No submissions match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <HiUser className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.fileName || 'No file'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(submission.submittedAt)}</div>
                          {submission.status === 'late' && (
                            <div className="text-xs text-amber-600">Submitted after deadline</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(submission.status)}`}>
                            {getStatusText(submission.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.marks !== undefined ? (
                            <div>
                              <div className="text-sm font-bold text-gray-900">
                                {submission.marks}/{assignment.totalMarks}
                              </div>
                              {submission.grade && (
                                <div className="text-xs text-gray-500">Grade: {submission.grade}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Not graded</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {submission.fileUrl && (
                              <button
                                onClick={() => downloadSubmission(submission)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Download"
                              >
                                <HiDownload className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => gradeSubmission(submission.id)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                submission.status === 'graded'
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              }`}
                            >
                              {submission.status === 'graded' ? (
                                <>
                                  <HiCheckCircle className="inline w-4 h-4 mr-1" />
                                  Regrade
                                </>
                              ) : (
                                <>
                                  <HiStar className="inline w-4 h-4 mr-1" />
                                  Grade
                                </>
                              )}
                            </button>
                            
                            <HiChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}