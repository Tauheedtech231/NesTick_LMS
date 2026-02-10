'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Star,
  AlertCircle,
  Eye,
  Edit,
  MessageSquare,
  User,
  Mail,
  Search,
  Filter,
  ChevronRight,
  BarChart,
  Award,
  FileDown
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

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  textResponse?: string;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export default function SubmissionsPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showQuickGrade, setShowQuickGrade] = useState(false)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')

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

        // Load assignment from instructor_assignments
        const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
        const foundAssignment = allAssignments.find((a: any) => 
          a.id === assignmentId && a.instructorId === currentUser.id
        )
        
        if (!foundAssignment) {
          alert('Assignment not found or you do not have permission to view it')
          router.push('/lms/Instructor_Portal/assignments')
          return
        }

        setAssignment(foundAssignment)

        // Load submissions for this assignment from student_submissions
        const allSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
        const assignmentSubmissions = allSubmissions.filter((s: any) => 
          s.assignmentId === assignmentId
        )
        
        // Sort by status (ungraded first), then by submission date (newest first)
        assignmentSubmissions.sort((a: any, b: any) => {
          if (a.status === 'submitted' && b.status === 'graded') return -1
          if (a.status === 'graded' && b.status === 'submitted') return 1
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        })
        
        setSubmissions(assignmentSubmissions)
        
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [assignmentId, router])

  const filteredSubmissions = submissions.filter(submission => {
    // Filter by status
    const matchesFilter = filter === 'all' || submission.status === filter
    
    // Filter by search term
    const matchesSearch = 
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const openQuickGrade = (submission: Submission) => {
    setSelectedSubmission(submission)
    setGrade(submission.score?.toString() || '')
    setFeedback(submission.feedback || '')
    setShowQuickGrade(true)
  }

  const submitQuickGrade = () => {
    if (!selectedSubmission || !assignment) return
    
    const score = parseFloat(grade)
    if (isNaN(score) || score < 0 || score > assignment.totalPoints) {
      alert(`Please enter a valid grade between 0 and ${assignment.totalPoints}`)
      return
    }

    // Update submission in state
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === selectedSubmission.id) {
        return {
          ...sub,
          score: score,
          feedback: feedback,
          status: 'graded' as const,
          gradedAt: new Date().toISOString()
        }
      }
      return sub
    })
    
    setSubmissions(updatedSubmissions)
    
    // Update localStorage - student_submissions
    const allSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
    const updatedAllSubmissions = allSubmissions.map((sub: any) => {
      if (sub.id === selectedSubmission.id) {
        return {
          ...sub,
          score: score,
          feedback: feedback,
          status: 'graded',
          gradedAt: new Date().toISOString()
        }
      }
      return sub
    })
    
    localStorage.setItem('student_submissions', JSON.stringify(updatedAllSubmissions))
    
    // Update localStorage - instructor_assignments (update graded count)
    const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
    const updatedAssignments = allAssignments.map((ass: any) => {
      if (ass.id === assignmentId) {
        const gradedCount = updatedSubmissions.filter(s => s.status === 'graded').length
        return {
          ...ass,
          graded: gradedCount
        }
      }
      return ass
    })
    
    localStorage.setItem('instructor_assignments', JSON.stringify(updatedAssignments))
    
    alert('Grade submitted successfully!')
    setShowQuickGrade(false)
    setSelectedSubmission(null)
  }

  const downloadSubmission = (submission: Submission) => {
    // Create a text file with submission details
    let content = `Submission Details\n`
    content += `=================\n\n`
    content += `Assignment: ${assignment?.title}\n`
    content += `Course: ${assignment?.courseTitle}\n`
    content += `Student: ${submission.studentName} (${submission.studentEmail})\n`
    content += `Submitted: ${new Date(submission.submittedAt).toLocaleString()}\n`
    content += `Status: ${submission.status}\n`
    content += `Score: ${submission.score || 'Not graded'}/${assignment?.totalPoints}\n\n`
    
    if (submission.textResponse) {
      content += `Text Response:\n${submission.textResponse}\n\n`
    }
    
    if (submission.files && submission.files.length > 0) {
      content += `Files Submitted:\n`
      submission.files.forEach((file, index) => {
        content += `${index + 1}. ${file.name} (${formatFileSize(file.size)})\n`
      })
      content += '\n'
    }
    
    if (submission.feedback) {
      content += `Feedback:\n${submission.feedback}\n`
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assignment?.title.replace(/\s+/g, '_')}_${submission.studentName.replace(/\s+/g, '_')}_submission.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadAllSubmissions = () => {
    if (submissions.length === 0) {
      alert('No submissions to download')
      return
    }

    let content = `All Submissions Report\n`
    content += `=====================\n\n`
    content += `Assignment: ${assignment?.title}\n`
    content += `Course: ${assignment?.courseTitle}\n`
    content += `Due Date: ${new Date(assignment?.dueDate).toLocaleDateString()}\n`
    content += `Total Points: ${assignment?.totalPoints}\n`
    content += `Total Submissions: ${submissions.length}\n`
    content += `Graded: ${submissions.filter(s => s.status === 'graded').length}\n`
    content += `Pending: ${submissions.filter(s => s.status === 'submitted').length}\n\n`
    content += '========================================\n\n'
    
    submissions.forEach((submission, index) => {
      content += `Submission ${index + 1}:\n`
      content += `Student: ${submission.studentName} (${submission.studentEmail})\n`
      content += `Submitted: ${new Date(submission.submittedAt).toLocaleString()}\n`
      content += `Status: ${submission.status}\n`
      content += `Score: ${submission.score || 'Not graded'}/${assignment?.totalPoints}\n`
      
      if (submission.textResponse) {
        content += `Text Response Preview: ${submission.textResponse.substring(0, 200)}...\n`
      }
      
      if (submission.files && submission.files.length > 0) {
        content += `Files: ${submission.files.length} file(s)\n`
      }
      
      if (submission.feedback) {
        content += `Feedback: ${submission.feedback}\n`
      }
      
      content += '\n---\n\n'
    })
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assignment?.title.replace(/\s+/g, '_')}_all_submissions_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800 border border-green-200'
      case 'submitted': return 'bg-blue-100 text-blue-800 border border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle className="w-4 h-4" />
      case 'submitted': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getGradePercentage = (score: number | undefined) => {
    if (!score || !assignment) return null
    return ((score / assignment.totalPoints) * 100).toFixed(1)
  }

  const getGradeLetter = (score: number | undefined) => {
    if (!score || !assignment) return 'N/A'
    const percentage = (score / assignment.totalPoints) * 100
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  const getGradeColor = (score: number | undefined) => {
    if (!score || !assignment) return 'text-gray-600'
    const percentage = (score / assignment.totalPoints) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            href="/lms/Instructor_Portal/assignments"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </Link>
        </div>
      </div>
    )
  }

  const gradedCount = submissions.filter(s => s.status === 'graded').length
  const pendingCount = submissions.filter(s => s.status === 'submitted').length
  const averageScore = submissions.filter(s => s.status === 'graded' && s.score)
    .reduce((sum, s) => sum + (s.score || 0), 0) / gradedCount || 0

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Mobile Header */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/lms/Instructor_Portal/assignments"
              className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-darkRoyalBlue truncate">
              {assignment.title.substring(0, 30)}{assignment.title.length > 30 ? '...' : ''}
            </h1>
          </div>
          <button
            onClick={downloadAllSubmissions}
            className="p-2 text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
            title="Download All"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-darkGrey/70 mb-2">
          {assignment.courseTitle}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Instructor_Portal/assignments"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  {assignment.title}
                </h1>
                <p className="text-darkGrey mt-1">
                  {assignment.courseTitle} • Student Submissions ({submissions.length} total)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-darkGrey/70">Due Date</div>
                <div className="font-medium text-darkGrey">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="text-sm text-darkGrey/70 mt-1">
                  {assignment.totalPoints} points
                </div>
              </div>
              <button
                onClick={downloadAllSubmissions}
                className="flex items-center gap-2 px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Download All</span>
              </button>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="lg:hidden mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-darkGrey/70">Total</p>
                <h3 className="text-lg font-bold text-darkNavy">{submissions.length}</h3>
              </div>
              <FileText className="w-6 h-6 text-darkRoyalBlue" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-softGrey p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-darkGrey/70">Pending</p>
                <h3 className="text-lg font-bold text-darkNavy">{pendingCount}</h3>
              </div>
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Submissions</p>
              <h3 className="text-2xl font-bold text-darkNavy">{submissions.length}</h3>
            </div>
            <FileText className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Awaiting Grading</p>
              <h3 className="text-2xl font-bold text-darkNavy">{pendingCount}</h3>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Graded</p>
              <h3 className="text-2xl font-bold text-darkNavy">{gradedCount}</h3>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Average Score</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {averageScore.toFixed(1)}
              </h3>
              <p className="text-xs text-darkGrey/70">out of {assignment.totalPoints}</p>
            </div>
            <BarChart className="w-8 h-8 text-teal" style={{ color: BRAND_COLORS.teal }} />
          </div>
        </div>
      </div>

      {/* Search and Filters - Mobile */}
      <div className="lg:hidden mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
          />
        </div>
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-2 flex-nowrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${filter === 'all' ? 'bg-darkRoyalBlue text-white' : 'bg-lightGrey text-darkGrey'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${filter === 'submitted' ? 'bg-amber-500 text-white' : 'bg-lightGrey text-darkGrey'}`}
            >
              To Grade ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('graded')}
              className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${filter === 'graded' ? 'bg-green-600 text-white' : 'bg-lightGrey text-darkGrey'}`}
            >
              Graded
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters - Desktop */}
      <div className="hidden lg:flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
          <input
            type="text"
            placeholder="Search by student name or email..."
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
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'submitted' ? 'bg-amber-500 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
          >
            To Grade ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'graded' ? 'bg-green-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
          >
            Graded
          </button>
        </div>
      </div>

      {/* Submissions List - Mobile View */}
      <div className="lg:hidden">
        {filteredSubmissions.length > 0 ? (
          <div className="space-y-3">
            {filteredSubmissions.map(submission => (
              <div key={submission.id} className="bg-white rounded-lg border border-softGrey p-4">
                <div className="space-y-3">
                  {/* Student Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                          {getStatusIcon(submission.status)}
                          {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                        </span>
                        {submission.status === 'graded' && submission.score && (
                          <span className={`text-xs px-2 py-1 rounded-full ${getGradeColor(submission.score)} font-medium`}>
                            {submission.score}/{assignment.totalPoints}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-darkGrey text-sm">{submission.studentName}</h3>
                      <p className="text-xs text-darkGrey/70 truncate">{submission.studentEmail}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => downloadSubmission(submission)}
                        className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/lms/Instructor_Portal/assignments/grade/${assignmentId}?student=${submission.id}`}
                        className={`p-2 rounded-lg ${submission.status === 'graded' ? 'text-blue-600 hover:bg-blue-50' : 'text-green-600 hover:bg-green-50'}`}
                        title="Grade"
                      >
                        {submission.status === 'graded' ? <Eye className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      </Link>
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="text-xs text-darkGrey/70 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                    {submission.textResponse && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Text response included</span>
                      </div>
                    )}
                    {submission.files && submission.files.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{submission.files.length} file(s)</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-2 border-t border-softGrey">
                    <Link
                      href={`/lms/Instructor_Portal/assignments/grade/${assignmentId}?student=${submission.id}`}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                        submission.status === 'graded'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {submission.status === 'graded' ? 'View Details' : 'Grade Now'}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Submissions Found</h3>
            <p className="text-darkGrey/70 mb-6">
              {searchTerm ? 'No submissions match your search' : 'No submissions found for this assignment'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Submissions List - Desktop View */}
      <div className="hidden lg:block bg-white rounded-lg border border-softGrey overflow-hidden">
        {filteredSubmissions.length > 0 ? (
          <div className="divide-y divide-softGrey">
            {filteredSubmissions.map(submission => (
              <div key={submission.id} className="p-4 hover:bg-lightGrey transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(submission.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-darkGrey">{submission.studentName}</h3>
                        <span className="text-sm text-darkGrey/70">{submission.studentEmail}</span>
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(submission.status)}`}>
                          {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                        </span>
                        {submission.status === 'graded' && submission.score && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(submission.score)} border ${getGradeColor(submission.score).replace('text', 'border')}`}>
                            {getGradeLetter(submission.score)} ({getGradePercentage(submission.score)}%)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-darkGrey/70 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                        {submission.textResponse && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Text response included
                          </span>
                        )}
                        {submission.files && submission.files.length > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {submission.files.length} file(s)
                          </span>
                        )}
                      </div>
                      
                      {submission.status === 'graded' && submission.score !== undefined && (
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                            Score: {submission.score}/{assignment.totalPoints}
                          </div>
                          {submission.gradedAt && (
                            <div className="text-xs text-darkGrey/70">
                              Graded on: {new Date(submission.gradedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {submission.feedback && submission.status === 'graded' && (
                        <div className="mt-2 text-sm text-darkGrey/70">
                          <div className="font-medium text-darkGrey mb-1">Feedback:</div>
                          <div className="bg-lightGrey p-3 rounded border border-softGrey line-clamp-2">
                            {submission.feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadSubmission(submission)}
                      className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg transition-colors"
                      title="Download Submission"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openQuickGrade(submission)}
                      className={`p-2 rounded-lg transition-colors ${submission.status === 'graded' ? 'text-blue-600 hover:bg-blue-50' : 'text-green-600 hover:bg-green-50'}`}
                      title="Quick Grade"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <Link
                      href={`/lms/Instructor_Portal/assignments/grade/${assignmentId}?student=${submission.id}`}
                      className={`p-2 rounded-lg transition-colors ${submission.status === 'graded' ? 'text-darkRoyalBlue hover:bg-darkRoyalBlue/10' : 'bg-darkRoyalBlue text-white hover:bg-darkRoyalBlue/90'}`}
                      title="Detailed Grading"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Submissions Found</h3>
            <p className="text-darkGrey/70 mb-6">
              {searchTerm ? 'No submissions match your search criteria' : 'No submissions found for this assignment'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Grade Modal */}
      {showQuickGrade && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-softGrey">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-darkNavy">Quick Grade</h2>
                <button
                  onClick={() => setShowQuickGrade(false)}
                  className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-darkGrey/70 mt-1">
                {selectedSubmission.studentName}
              </p>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-darkGrey mb-2">
                  Score (out of {assignment.totalPoints})
                </label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max={assignment.totalPoints}
                  step="0.5"
                  className="w-full p-3 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                  placeholder={`0-${assignment.totalPoints}`}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-darkGrey mb-2">Quick Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue"
                  placeholder="Enter feedback..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuickGrade(false)}
                  className="flex-1 px-4 py-2.5 border border-softGrey text-darkGrey rounded-lg hover:bg-lightGrey"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuickGrade}
                  className="flex-1 px-4 py-2.5 bg-darkRoyalBlue text-white rounded-lg hover:bg-darkRoyalBlue/90 font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Action Button */}
      {filteredSubmissions.length > 0 && (
        <div className="lg:hidden fixed bottom-6 right-6 z-10">
          <Link
            href={`/lms/Instructor_Portal/assignments/grade/${assignmentId}`}
            className="bg-darkRoyalBlue text-white p-4 rounded-full shadow-lg hover:bg-darkRoyalBlue/90 transition-colors"
          >
            <Star className="w-6 h-6" />
          </Link>
        </div>
      )}
    </div>
  )
}