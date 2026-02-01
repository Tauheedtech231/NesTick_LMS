// app/lms/Instructor_Portal/assignments/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  HiArrowLeft, HiCalendar, HiDocumentText, 
  HiUserGroup, HiClock, HiChartBar,
  HiPencil, HiChevronDown
} from 'react-icons/hi'
import { toast, Toaster } from 'react-hot-toast'

interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  type: 'assignment' | 'quiz'
  totalMarks: number
  dueDate: string
  createdAt: string
  createdBy: string
  instructions?: string
  submissions?: Submission[]
  status: 'active' | 'draft' | 'graded'
}

interface Submission {
  id: string
  studentId: string
  studentName: string
  submittedAt: string
  fileUrl?: string
  marks?: number
  feedback?: string
  status: 'submitted' | 'graded' | 'late'
}

interface Course {
  id: string
  title: string
  code: string
}

export default function ViewAssignmentPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>('overview')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadAssignment()
  }, [])

  const loadAssignment = () => {
    try {
      setLoading(true)
      
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      const foundAssignment = allAssignments.find((a: Assignment) => a.id === assignmentId)
      
      if (!foundAssignment) {
        toast.error('Assignment not found')
        router.push('/lms/Instructor_Portal/assignments')
        return
      }
      
      setAssignment(foundAssignment)
      
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const courseDetails = allCourses.find((c: Course) => c.id === foundAssignment.courseId)
      setCourse(courseDetails || null)
      
    } catch (error) {
      console.error('Error loading assignment:', error)
      toast.error('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

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

  const getSubmissionStats = () => {
    if (!assignment?.submissions) return null
    
    const submissions = assignment.submissions
    const total = submissions.length
    const graded = submissions.filter(s => s.status === 'graded').length
    const pending = submissions.filter(s => s.status === 'submitted').length
    const late = submissions.filter(s => s.status === 'late').length
    
    return { total, graded, pending, late }
  }

  const calculateAverageMarks = () => {
    if (!assignment?.submissions || assignment.submissions.length === 0) return 0
    
    const gradedSubmissions = assignment.submissions.filter(s => s.marks !== undefined)
    if (gradedSubmissions.length === 0) return 0
    
    const total = gradedSubmissions.reduce((sum, sub) => sum + (sub.marks || 0), 0)
    return Math.round(total / gradedSubmissions.length)
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Not Found</h2>
            <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist.</p>
            <Link
              href="/lms/Instructor_Portal/assignments"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Back to Assignments
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = getSubmissionStats()
  const averageMarks = calculateAverageMarks()

  return (
    <>
      <Toaster position="top-center" />
      
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/lms/Instructor_Portal/assignments"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Assignments</span>
            </Link>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                <p className="text-gray-600">
                  {course?.title || 'Unknown Course'}
                  {course?.code && ` • ${course.code}`}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href={`/lms/Instructor_Portal/assignments/edit/${assignment.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
                >
                  <HiPencil className="w-4 h-4" />
                  Edit
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Assignment Details */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Assignment Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                    <p className="text-gray-700">{assignment.description || 'No description provided'}</p>
                  </div>
                  
                  {assignment.instructions && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Instructions</h3>
                      <p className="text-gray-700 whitespace-pre-line">{assignment.instructions}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-300">
                    <div>
                      <p className="text-sm text-gray-600">Total Marks</p>
                      <p className="font-medium text-gray-900">{assignment.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-gray-900 capitalize">{assignment.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions */}
              <div className="bg-white border border-gray-300 rounded-lg">
                {/* Tabs */}
                <div className="border-b border-gray-300">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'overview'
                          ? 'border-blue-600 text-blue-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'submissions'
                          ? 'border-blue-600 text-blue-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Submissions ({assignment.submissions?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' ? (
                    <div className="space-y-6">
                      {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-sm text-gray-600">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
                            <p className="text-sm text-gray-600">Graded</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.late}</p>
                            <p className="text-sm text-gray-600">Late</p>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Performance</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Average Score</span>
                            <span className="font-medium text-gray-900">
                              {averageMarks}/{assignment.totalMarks}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {assignment.submissions && assignment.submissions.length > 0 ? (
                        <div className="space-y-4">
                          {assignment.submissions.map((submission, index) => (
                            <div key={submission.id} className="p-4 border border-gray-300 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="font-medium text-gray-700">
                                      {submission.studentName.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{submission.studentName}</h4>
                                    <p className="text-sm text-gray-600">
                                      Submitted: {formatDate(submission.submittedAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {submission.status === 'graded' && (
                                    <div className="text-right">
                                      <p className="font-bold text-green-600">
                                        {submission.marks}/{assignment.totalMarks}
                                      </p>
                                      <p className="text-xs text-green-700">Graded</p>
                                    </div>
                                  )}
                                  {submission.status === 'late' && (
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-red-600">Late</p>
                                      <p className="text-xs text-red-700">Needs grading</p>
                                    </div>
                                  )}
                                  {submission.status === 'submitted' && (
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-amber-600">Pending</p>
                                      <p className="text-xs text-amber-700">Awaiting evaluation</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <HiDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                          <p className="text-gray-600">Students haven't submitted any work for this assignment.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Due Date Card */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Due Date</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <HiCalendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
                      <p className="text-sm text-gray-600">Due date</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Info Card */}
              {course && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Course Information</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Course</p>
                      <p className="font-medium text-gray-900">{course.title}</p>
                    </div>
                    
                    {course.code && (
                      <div>
                        <p className="text-sm text-gray-600">Course Code</p>
                        <p className="font-medium text-gray-900">{course.code}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Created Info Card */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Created Information</h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="font-medium text-gray-900">{assignment.createdBy}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="font-medium text-gray-900">{formatDate(assignment.createdAt)}</p>
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