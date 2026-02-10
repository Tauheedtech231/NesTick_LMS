'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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
  Send,
  Paperclip,
  ChevronRight,
  ChevronLeft,
  Save,
  X
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
    content?: string;
  }>;
  textResponse?: string;
  status: 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export default function GradeSubmissionPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const assignmentId = params.id as string
  const studentId = searchParams.get('student')
  
  const [loading, setLoading] = useState(true)
  const [instructor, setInstructor] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'submission' | 'grade'>('submission')

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

        // Load assignment
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

        // Load all submissions for this assignment
        const allSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
        const assignmentSubmissions = allSubmissions.filter((s: any) => 
          s.assignmentId === assignmentId
        )
        
        setSubmissions(assignmentSubmissions)
        
        // Find specific submission if studentId is provided
        let targetSubmission: Submission | null = null
        if (studentId) {
          targetSubmission = assignmentSubmissions.find((s: any) => s.id === studentId)
        }
        
        // If no specific submission or not found, use the first ungraded submission
        if (!targetSubmission) {
          targetSubmission = assignmentSubmissions.find((s: any) => s.status === 'submitted')
        }
        
        if (targetSubmission) {
          setSubmission(targetSubmission)
          setGrade(targetSubmission.score?.toString() || '')
          setFeedback(targetSubmission.feedback || '')
        } else if (assignmentSubmissions.length > 0) {
          // If no ungraded submissions, show the first one
          setSubmission(assignmentSubmissions[0])
          setGrade(assignmentSubmissions[0].score?.toString() || '')
          setFeedback(assignmentSubmissions[0].feedback || '')
        }
        
      } catch (error) {
        console.error('Error loading submission:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [assignmentId, studentId, router])

  const navigateToSubmission = (direction: 'next' | 'prev') => {
    if (!submission || submissions.length === 0) return
    
    const currentIndex = submissions.findIndex(s => s.id === submission.id)
    let newIndex = currentIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % submissions.length
    } else {
      newIndex = (currentIndex - 1 + submissions.length) % submissions.length
    }
    
    const newSubmission = submissions[newIndex]
    setSubmission(newSubmission)
    setGrade(newSubmission.score?.toString() || '')
    setFeedback(newSubmission.feedback || '')
    setCurrentFileIndex(0)
    setActiveTab('submission')
    
    // Update URL with new student ID
    router.push(`/lms/Instructor_Portal/assignments/grade/${assignmentId}?student=${newSubmission.id}`)
  }

  const handleSubmitGrade = () => {
    if (!submission || !assignment) return
    
    const score = parseFloat(grade)
    if (isNaN(score) || score < 0 || score > assignment.totalPoints) {
      alert(`Please enter a valid grade between 0 and ${assignment.totalPoints}`)
      return
    }

    // Update submission in state
    const updatedSubmission = {
      ...submission,
      score: score,
      feedback: feedback,
      status: 'graded' as const,
      gradedAt: new Date().toISOString()
    }
    
    setSubmission(updatedSubmission)
    
    // Update all submissions in state
    const updatedSubmissions = submissions.map(sub => 
      sub.id === submission.id ? updatedSubmission : sub
    )
    setSubmissions(updatedSubmissions)
    
    // Update localStorage - student_submissions
    const allSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
    const updatedAllSubmissions = allSubmissions.map((sub: any) => {
      if (sub.id === submission.id) {
        return updatedSubmission
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
    
    // Auto-navigate to next ungraded submission
    const nextUngraded = updatedSubmissions.find(s => s.status === 'submitted')
    if (nextUngraded) {
      router.push(`/lms/Instructor_Portal/assignments/grade/${assignmentId}?student=${nextUngraded.id}`)
    } else {
      router.push(`/lms/Instructor_Portal/assignments/submissions/${assignmentId}`)
    }
  }

  const handleSaveDraft = () => {
    if (!submission || !assignment) return
    
    // Save current grade and feedback without changing status
    const updatedSubmission = {
      ...submission,
      score: parseFloat(grade) || undefined,
      feedback: feedback
    }
    
    setSubmission(updatedSubmission)
    
    // Update localStorage
    const allSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
    const updatedAllSubmissions = allSubmissions.map((sub: any) => {
      if (sub.id === submission.id) {
        return updatedSubmission
      }
      return sub
    })
    
    localStorage.setItem('student_submissions', JSON.stringify(updatedAllSubmissions))
    
    alert('Draft saved successfully!')
  }

  const downloadFile = (file: any) => {
    // Create a text blob for demo purposes
    const content = file.content || `This is a sample file: ${file.name}\n\nStudent: ${submission?.studentName}\nAssignment: ${assignment?.title}\nSubmitted: ${submission?.submittedAt}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
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
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!assignment || !submission) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">No Submissions Found</h1>
          <p className="text-gray-600 mb-6">
            {assignment ? 'No submissions found for this assignment.' : 'Assignment not found.'}
          </p>
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

  const currentFile = submission.files?.[currentFileIndex]
  const gradedCount = submissions.filter(s => s.status === 'graded').length
  const pendingCount = submissions.filter(s => s.status === 'submitted').length
  const currentIndex = submissions.findIndex(s => s.id === submission.id) + 1

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-lightGrey border-b border-softGrey p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/lms/Instructor_Portal/assignments/submissions/${assignmentId}`}
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  {assignment.title}
                </h1>
                <p className="text-darkGrey text-sm">
                  Grading Submissions • {gradedCount} graded, {pendingCount} pending
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-darkGrey/70">Total Points</div>
                <div className="font-bold text-lg" style={{ color: BRAND_COLORS.deepRed }}>
                  {assignment.totalPoints}
                </div>
              </div>
            </div>
          </div>

          {/* Student Info Bar */}
          <div className="bg-white rounded-lg border border-softGrey p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-darkGrey" />
                  <span className="font-medium">{submission.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-darkGrey" />
                  <span className="text-sm text-darkGrey/70">{submission.studentEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-darkGrey" />
                  <span className="text-sm text-darkGrey/70">
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-darkGrey/70">
                  {currentIndex} of {submissions.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateToSubmission('prev')}
                    className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateToSubmission('next')}
                    className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Tabs */}
        <div className="flex mb-6 border-b border-softGrey">
          <button
            onClick={() => setActiveTab('submission')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'submission'
                ? 'border-darkRoyalBlue text-darkRoyalBlue'
                : 'border-transparent text-darkGrey hover:text-darkRoyalBlue'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Student Submission
            </span>
          </button>
          <button
            onClick={() => setActiveTab('grade')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'grade'
                ? 'border-darkRoyalBlue text-darkRoyalBlue'
                : 'border-transparent text-darkGrey hover:text-darkRoyalBlue'
            }`}
          >
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Grade & Feedback
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Submission Content */}
          <div className="lg:col-span-2">
            {activeTab === 'submission' ? (
              <div className="space-y-6">
                {/* Text Response */}
                {submission.textResponse && (
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h2 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Text Response
                    </h2>
                    <div className="bg-lightGrey p-5 rounded-lg border border-softGrey whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {submission.textResponse}
                    </div>
                  </div>
                )}

                {/* File Attachments */}
                {submission.files && submission.files.length > 0 && (
                  <div className="bg-white rounded-lg border border-softGrey p-6">
                    <h2 className="text-lg font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                      Attached Files ({submission.files.length})
                    </h2>
                    
                    {/* File List */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {submission.files.map((file, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentFileIndex(index)}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                              currentFileIndex === index
                                ? 'bg-darkRoyalBlue text-white'
                                : 'bg-lightGrey text-darkGrey hover:bg-softGrey'
                            }`}
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* File Preview */}
                      {currentFile && (
                        <div className="bg-lightGrey rounded-lg border border-softGrey p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium text-darkGrey">{currentFile.name}</h3>
                              <p className="text-sm text-darkGrey/70">
                                {formatFileSize(currentFile.size)} • {currentFile.type}
                              </p>
                            </div>
                            <button
                              onClick={() => downloadFile(currentFile)}
                              className="flex items-center gap-2 px-3 py-2 bg-darkRoyalBlue text-white rounded-lg hover:bg-darkRoyalBlue/90"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                          
                          {/* File Content Preview */}
                          <div className="bg-white p-4 rounded border border-softGrey max-h-96 overflow-y-auto">
                            <pre className="text-sm text-darkGrey whitespace-pre-wrap">
                              {currentFile.content || `File: ${currentFile.name}\n\nThis is a preview of the submitted file. Click download to get the complete file.`}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!submission.textResponse && (!submission.files || submission.files.length === 0) && (
                  <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Submission Content</h3>
                    <p className="text-darkGrey/70">Student submitted an empty assignment.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Grade Tab */
              <div className="bg-white rounded-lg border border-softGrey p-6">
                <h2 className="text-lg font-bold mb-6" style={{ color: BRAND_COLORS.darkNavy }}>
                  Grade & Feedback
                </h2>

                {/* Current Grade Status */}
                {submission.status === 'graded' && submission.score !== undefined && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">Already Graded</div>
                          <div className="text-sm text-green-700">
                            Current score: {submission.score}/{assignment.totalPoints}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getGradeColor(submission.score)}`}>
                        {getGradeLetter(submission.score)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grade Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Score (out of {assignment.totalPoints})
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max={assignment.totalPoints}
                      step="0.5"
                      className="flex-1 p-3 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      placeholder={`Enter score 0-${assignment.totalPoints}`}
                    />
                    <div className="text-center">
                      <div className="text-sm font-medium text-darkGrey">Percentage</div>
                      <div className="text-xl font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                        {grade && !isNaN(parseFloat(grade)) 
                          ? `${((parseFloat(grade) / assignment.totalPoints) * 100).toFixed(1)}%` 
                          : '0%'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-darkGrey">Grade</div>
                      <div className={`text-xl font-bold ${getGradeColor(parseFloat(grade) || undefined)}`}>
                        {getGradeLetter(parseFloat(grade) || undefined)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Feedback for Student
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={8}
                    className="w-full p-3 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="Provide constructive feedback..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 px-4 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                  <button
                    onClick={handleSubmitGrade}
                    className="flex-1 px-4 py-3 bg-darkRoyalBlue text-white rounded-lg hover:bg-darkRoyalBlue/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Assignment Info */}
              <div className="bg-white rounded-lg border border-softGrey p-5">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Assignment Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-darkGrey/70 mb-1">Title</div>
                    <div className="font-medium">{assignment.title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-darkGrey/70 mb-1">Course</div>
                    <div className="font-medium">{assignment.courseTitle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-darkGrey/70 mb-1">Due Date</div>
                    <div className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-darkGrey/70 mb-1">Total Points</div>
                    <div className="font-bold text-lg" style={{ color: BRAND_COLORS.deepRed }}>
                      {assignment.totalPoints}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Stats */}
              <div className="bg-white rounded-lg border border-softGrey p-5">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Grading Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-darkGrey/70">Graded</span>
                      <span className="font-medium">{gradedCount}/{submissions.length}</span>
                    </div>
                    <div className="w-full bg-softGrey rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(gradedCount / submissions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xl font-bold text-green-600">{gradedCount}</div>
                      <div className="text-xs text-green-700">Graded</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
                      <div className="text-xs text-amber-700">Pending</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-softGrey p-5">
                <h3 className="font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab(activeTab === 'submission' ? 'grade' : 'submission')}
                    className="w-full px-4 py-2.5 bg-darkRoyalBlue text-white rounded-lg hover:bg-darkRoyalBlue/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {activeTab === 'submission' ? (
                      <>
                        <Star className="w-4 h-4" />
                        Go to Grading
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Submission
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => navigateToSubmission('next')}
                    className="w-full px-4 py-2.5 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Next Student
                  </button>
                  
                  <Link
                    href={`/lms/Instructor_Portal/assignments/submissions/${assignmentId}`}
                    className="block w-full px-4 py-2.5 border border-softGrey text-darkGrey rounded-lg hover:bg-lightGrey transition-colors text-center"
                  >
                    Back to All Submissions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}