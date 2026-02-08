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
  AlertCircle
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
  fileUrl: string;
  fileName: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
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
  const [filter, setFilter] = useState<'all' | 'ungraded' | 'graded' | 'late'>('ungraded')

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
        const assignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
        const foundAssignment = assignments.find((a: any) => 
          a.id === assignmentId && a.instructorId === currentUser.id
        )
        
        if (!foundAssignment) {
          alert('Assignment not found')
          router.push('/lms/Instructor_Portal/assignments')
          return
        }

        setAssignment(foundAssignment)

        // Load submissions for this assignment
        const allSubmissions = JSON.parse(localStorage.getItem('assignment_submissions') || '[]')
        const assignmentSubmissions = allSubmissions.filter((s: Submission) => 
          s.assignmentId === assignmentId
        )
        
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
    if (filter === 'all') return true
    if (filter === 'ungraded') return submission.status === 'submitted'
    if (filter === 'graded') return submission.status === 'graded'
    if (filter === 'late') return submission.status === 'late'
    return true
  })

  const handleGradeSubmission = (submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId)
    if (!submission) return
    
    const grade = prompt(`Enter grade for ${submission.studentName} (0-${assignment.totalPoints}):`, '')
    if (grade === null) return
    
    const gradeNum = parseFloat(grade)
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > assignment.totalPoints) {
      alert(`Please enter a valid grade between 0 and ${assignment.totalPoints}`)
      return
    }
    
    const feedback = prompt('Enter feedback (optional):', '')
    
    // Update submission
    const updatedSubmissions = submissions.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          grade: gradeNum,
          feedback: feedback || '',
          status: 'graded' as const,
          gradedAt: new Date().toISOString()
        }
      }
      return s
    })
    
    setSubmissions(updatedSubmissions)
    
    // Update localStorage
    localStorage.setItem('assignment_submissions', JSON.stringify(updatedSubmissions))
    
    // Update assignment graded count
    const assignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
    const updatedAssignments = assignments.map((a: any) => {
      if (a.id === assignmentId) {
        return {
          ...a,
          graded: (a.graded || 0) + 1
        }
      }
      return a
    })
    
    localStorage.setItem('instructor_assignments', JSON.stringify(updatedAssignments))
    
    alert('Grade submitted successfully!')
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // For demo purposes, we'll open in new tab
    // In real app, you'd handle proper file download
    window.open(fileUrl, '_blank')
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

  if (!assignment) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
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
                  Student Submissions ({submissions.length} total)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-darkGrey/70">Due Date</div>
              <div className="font-medium text-darkGrey">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total</p>
              <h3 className="text-2xl font-bold text-darkNavy">{submissions.length}</h3>
            </div>
            <FileText className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Ungraded</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {submissions.filter(s => s.status === 'submitted').length}
              </h3>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Graded</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {submissions.filter(s => s.status === 'graded').length}
              </h3>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Late</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {submissions.filter(s => s.status === 'late').length}
              </h3>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-darkRoyalBlue text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('ungraded')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'ungraded' ? 'bg-amber-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
          >
            Ungraded
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'graded' ? 'bg-green-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
          >
            Graded
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'late' ? 'bg-red-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
          >
            Late
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg border border-softGrey overflow-hidden">
        {filteredSubmissions.length > 0 ? (
          <div className="divide-y divide-softGrey">
            {filteredSubmissions.map(submission => (
              <div key={submission.id} className="p-4 hover:bg-lightGrey transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {submission.status === 'graded' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : submission.status === 'late' ? (
                        <Clock className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-darkGrey">{submission.studentName}</h3>
                        <span className="text-sm text-darkGrey/70">{submission.studentEmail}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-darkGrey/70 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {submission.fileName}
                        </span>
                      </div>
                      
                      {submission.status === 'graded' && submission.grade !== undefined && (
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
                            Grade: {submission.grade}/{assignment.totalPoints}
                          </div>
                          {submission.feedback && (
                            <div className="text-sm text-darkGrey/70">
                              Feedback: {submission.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDownload(submission.fileUrl, submission.fileName)}
                      className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                      title="Download Submission"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {submission.status !== 'graded' && (
                      <button
                        onClick={() => handleGradeSubmission(submission.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Grade Submission"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
              No Submissions Found
            </h3>
            <p className="text-darkGrey/70 mb-6">
              {filter === 'ungraded' ? 'All submissions have been graded!' : 'No submissions match the selected filter.'}
            </p>
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
            >
              View All Submissions
            </button>
          </div>
        )}
      </div>
    </div>
  )
}