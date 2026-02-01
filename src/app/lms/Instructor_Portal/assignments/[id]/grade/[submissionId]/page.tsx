// app/lms/Instructor_Portal/assignments/[id]/grade/[submissionId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  HiArrowLeft, HiSave, HiDownload, 
  HiStar, HiDocumentText, HiUser,
  HiCalendar, HiClock
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
  description?: string
  totalMarks: number
  dueDate: string
  instructions?: string
}

export default function GradeSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  const submissionId = params.submissionId as string
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [marks, setMarks] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [grade, setGrade] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [assignmentId, submissionId])

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

      // Get submission
      const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      const currentSubmission = allSubmissions.find((s: Submission) => 
        s.id === submissionId && s.assignmentId === assignmentId
      )
      
      if (!currentSubmission) {
        toast.error('Submission not found')
        router.back()
        return
      }
      
      setSubmission(currentSubmission)
      setMarks(currentSubmission.marks || 0)
      setFeedback(currentSubmission.feedback || '')
      setGrade(currentSubmission.grade || '')

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const calculateGrade = (marks: number, totalMarks: number) => {
    const percentage = (marks / totalMarks) * 100
    
    if (percentage >= 90) return 'A+'
    if (percentage >= 85) return 'A'
    if (percentage >= 80) return 'A-'
    if (percentage >= 75) return 'B+'
    if (percentage >= 70) return 'B'
    if (percentage >= 65) return 'B-'
    if (percentage >= 60) return 'C+'
    if (percentage >= 55) return 'C'
    if (percentage >= 50) return 'C-'
    if (percentage >= 45) return 'D'
    return 'F'
  }

  const handleMarksChange = (value: number) => {
    if (!assignment) return
    
    const newMarks = Math.max(0, Math.min(value, assignment.totalMarks))
    setMarks(newMarks)
    
    // Auto-calculate grade
    const newGrade = calculateGrade(newMarks, assignment.totalMarks)
    setGrade(newGrade)
  }

  const saveGrade = () => {
    if (!assignment || !submission) return
    
    if (marks < 0 || marks > assignment.totalMarks) {
      toast.error(`Marks must be between 0 and ${assignment.totalMarks}`)
      return
    }
    
    try {
      setSaving(true)
      
      // Update submission
      const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      const updatedSubmissions = allSubmissions.map((s: Submission) => {
        if (s.id === submissionId) {
          return {
            ...s,
            marks: marks,
            feedback: feedback.trim(),
            grade: grade,
            status: 'graded' as const
          }
        }
        return s
      })
      
      localStorage.setItem('assignmentSubmissions', JSON.stringify(updatedSubmissions))
      
      toast.success('Grades saved successfully')
      setTimeout(() => {
        router.push(`/lms/Instructor_Portal/assignments/${assignmentId}/submissions`)
      }, 1500)
      
    } catch (error) {
      console.error('Error saving grade:', error)
      toast.error('Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  const downloadFile = () => {
    if (!submission?.fileUrl) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto my-12"></div>
        </div>
      </div>
    )
  }

  if (!assignment || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-gray-900">Not found</h3>
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
        <div className="max-w-4xl mx-auto">
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
                <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
                <p className="text-gray-600">{assignment.title}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Submission Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Info */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiUser className="w-5 h-5 text-blue-600" />
                  Student Information
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-medium text-gray-900">{submission.studentName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Submission Date</p>
                    <p className="font-medium text-gray-900">{formatDate(submission.submittedAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      submission.status === 'late' ? 'bg-amber-100 text-amber-800' :
                      submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status === 'late' ? 'Late Submission' :
                       submission.status === 'graded' ? 'Previously Graded' : 'Submitted'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Assignment Due Date</p>
                    <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
                  </div>
                </div>
                
                {submission.remarks && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Student Remarks</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">{submission.remarks}</p>
                  </div>
                )}
              </div>

              {/* File Preview */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <HiDocumentText className="w-5 h-5 text-blue-600" />
                    Submitted File
                  </h2>
                  
                  {submission.fileUrl && (
                    <button
                      onClick={downloadFile}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <HiDownload className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
                
                {submission.fileName ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <HiDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-900">{submission.fileName}</p>
                    {submission.fileUrl && (
                      <p className="text-sm text-gray-500 mt-2">
                        Click download button to view the file
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No file was submitted</p>
                  </div>
                )}
              </div>

              {/* Assignment Instructions */}
              {assignment.instructions && (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Assignment Instructions</h2>
                  <p className="text-gray-700">{assignment.instructions}</p>
                </div>
              )}
            </div>

            {/* Right Column - Grading Form */}
            <div className="space-y-6">
              {/* Grading Card */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <HiStar className="w-5 h-5 text-purple-600" />
                  Grading
                </h2>
                
                <div className="space-y-6">
                  {/* Marks Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks (out of {assignment.totalMarks})
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={assignment.totalMarks}
                        value={marks}
                        onChange={(e) => handleMarksChange(parseFloat(e.target.value))}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="text-lg font-bold text-gray-900">
                        / {assignment.totalMarks}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <input
                        type="range"
                        min="0"
                        max={assignment.totalMarks}
                        step="0.5"
                        value={marks}
                        onChange={(e) => handleMarksChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>{Math.floor(assignment.totalMarks / 2)}</span>
                        <span>{assignment.totalMarks}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      Percentage: {assignment.totalMarks > 0 ? ((marks / assignment.totalMarks) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  {/* Grade Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-700 mb-1">{grade}</div>
                      <p className="text-sm text-gray-600">Auto-calculated based on marks</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback for Student
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Provide constructive feedback to help the student improve..."
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={saveGrade}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiSave className="w-5 h-5" />
                        Save Grade
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grading Rubric (Optional) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 text-sm mb-2">Grading Guidelines</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• 90-100%: A+ (Excellent)</li>
                  <li>• 85-89%: A (Very Good)</li>
                  <li>• 80-84%: A- (Good)</li>
                  <li>• 75-79%: B+ (Above Average)</li>
                  <li>• 70-74%: B (Average)</li>
                  <li>• 65-69%: B- (Satisfactory)</li>
                  <li>• 60-64%: C+ (Below Average)</li>
                  <li>• Below 60%: Needs Improvement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}