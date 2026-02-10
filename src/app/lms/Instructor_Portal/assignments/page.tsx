'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  FileText,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Search,
  AlertCircle,
  Download,
  Clock
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  dueDate: string;
  totalPoints: number;
  submissions: number;
  graded: number;
  attachments: string[];
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface StudentSubmission {
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

export default function AssignmentsPage() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<any>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [allSubmissions, setAllSubmissions] = useState<StudentSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all')

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

        // Load all assignments
        const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
        const myAssignments = allAssignments.filter((a: Assignment) => 
          a.instructorId === currentUser.id
        )
        
        // Load all student submissions
        const studentSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
        setAllSubmissions(studentSubmissions)
        
        // Update assignments with actual submission counts
        const updatedAssignments = myAssignments.map((assignment: Assignment) => {
          const assignmentSubmissions = studentSubmissions.filter(
            (sub: StudentSubmission) => sub.assignmentId === assignment.id
          )
          
          const gradedSubmissions = assignmentSubmissions.filter(
            (sub: StudentSubmission) => sub.status === 'graded'
          )
          
          return {
            ...assignment,
            submissions: assignmentSubmissions.length,
            graded: gradedSubmissions.length
          }
        })
        
        setAssignments(updatedAssignments)
      } catch (error) {
        console.error('Error loading assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment? This will also delete all student submissions for this assignment. This action cannot be undone.')) {
      // Delete assignment
      const updatedAssignments = assignments.filter(a => a.id !== id)
      setAssignments(updatedAssignments)
      
      // Update localStorage - remove assignment
      const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
      const filteredAssignments = allAssignments.filter((a: Assignment) => a.id !== id)
      localStorage.setItem('instructor_assignments', JSON.stringify(filteredAssignments))
      
      // Also remove all submissions for this assignment
      const allSubmissions = JSON.parse(localStorage.getItem('student_submissions') || '[]')
      const filteredSubmissions = allSubmissions.filter((sub: StudentSubmission) => sub.assignmentId !== id)
      localStorage.setItem('student_submissions', JSON.stringify(filteredSubmissions))
      
      alert('Assignment and all related submissions deleted successfully!')
    }
  }

  const handlePublishAssignment = (id: string) => {
    const updatedAssignments = assignments.map(a => 
      a.id === id ? { ...a, status: 'published' as const } : a
    )
    setAssignments(updatedAssignments)
    
    // Update localStorage
    const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
    const updatedAllAssignments = allAssignments.map((a: Assignment) => 
      a.id === id ? { ...a, status: 'published' } : a
    )
    localStorage.setItem('instructor_assignments', JSON.stringify(updatedAllAssignments))
    
    alert('Assignment published successfully! Students can now see it.')
  }

  const handleCloseAssignment = (id: string) => {
    const updatedAssignments = assignments.map(a => 
      a.id === id ? { ...a, status: 'closed' as const } : a
    )
    setAssignments(updatedAssignments)
    
    // Update localStorage
    const allAssignments = JSON.parse(localStorage.getItem('instructor_assignments') || '[]')
    const updatedAllAssignments = allAssignments.map((a: Assignment) => 
      a.id === id ? { ...a, status: 'closed' } : a
    )
    localStorage.setItem('instructor_assignments', JSON.stringify(updatedAllAssignments))
    
    alert('Assignment closed successfully! Students can no longer submit.')
  }

  // Function to download all submissions for an assignment
  const handleDownloadSubmissions = (assignmentId: string) => {
    const submissions = allSubmissions.filter(sub => sub.assignmentId === assignmentId)
    
    if (submissions.length === 0) {
      alert('No submissions found for this assignment.')
      return
    }
    
    // Create a summary document
    const assignment = assignments.find(a => a.id === assignmentId)
    let content = `Assignment: ${assignment?.title}\n`
    content += `Course: ${assignment?.courseTitle}\n`
    content += `Due Date: ${assignment?.dueDate}\n`
    content += `Total Points: ${assignment?.totalPoints}\n`
    content += `Total Submissions: ${submissions.length}\n`
    content += '========================================\n\n'
    
    submissions.forEach((sub, index) => {
      content += `Submission ${index + 1}:\n`
      content += `Student: ${sub.studentName} (${sub.studentEmail})\n`
      content += `Submitted: ${new Date(sub.submittedAt).toLocaleString()}\n`
      content += `Status: ${sub.status}\n`
      content += `Score: ${sub.score || 'Not graded'}/${assignment?.totalPoints}\n`
      
      if (sub.textResponse) {
        content += `Text Response:\n${sub.textResponse}\n`
      }
      
      if (sub.files && sub.files.length > 0) {
        content += `Files (${sub.files.length}):\n`
        sub.files.forEach(file => {
          content += `  - ${file.name} (${file.type}, ${formatFileSize(file.size)})\n`
        })
      }
      
      if (sub.feedback) {
        content += `Feedback: ${sub.feedback}\n`
      }
      
      content += '\n----------------------------------------\n\n'
    })
    
    // Create and download blob
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assignment?.title.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || assignment.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Function to get pending submissions count
  const getPendingGradingCount = (assignmentId: string) => {
    const assignmentSubmissions = allSubmissions.filter(
      sub => sub.assignmentId === assignmentId
    )
    const pending = assignmentSubmissions.filter(
      sub => sub.status === 'submitted'
    )
    return pending.length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Assignments
              </h1>
              <p className="text-darkGrey mt-1">
                Create and manage assignments for your students
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/lms/Instructor_Portal/assignments/create"
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white 
                }}
              >
                <PlusCircle className="w-5 h-5" />
                Create Assignment
              </Link>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
            <input
              type="text"
              placeholder="Search assignments by title or description..."
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
              onClick={() => setFilter('published')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'draft' ? 'bg-gray-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2.5 rounded-lg font-medium ${filter === 'closed' ? 'bg-red-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Assignments</p>
              <h3 className="text-2xl font-bold text-darkNavy">{assignments.length}</h3>
            </div>
            <FileText className="w-8 h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Published</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {assignments.filter(a => a.status === 'published').length}
              </h3>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Total Submissions</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {allSubmissions.length}
              </h3>
            </div>
            <Users className="w-8 h-8 text-teal" style={{ color: BRAND_COLORS.teal }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-darkGrey/70">Pending Grading</p>
              <h3 className="text-2xl font-bold text-darkNavy">
                {allSubmissions.filter(sub => sub.status === 'submitted').length}
              </h3>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Submissions Overview */}
      <div className="bg-white rounded-lg border border-softGrey p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-darkGrey">Recent Submissions</h2>
          {allSubmissions.length > 0 && (
            <button
              onClick={() => {
                // Download all submissions as a file
                let content = 'All Submissions Report\n'
                content += '======================\n\n'
                
                allSubmissions.forEach((sub, index) => {
                  const assignment = assignments.find(a => a.id === sub.assignmentId)
                  content += `Submission ${index + 1}:\n`
                  content += `Assignment: ${assignment?.title || 'Unknown'}\n`
                  content += `Student: ${sub.studentName} (${sub.studentEmail})\n`
                  content += `Submitted: ${new Date(sub.submittedAt).toLocaleString()}\n`
                  content += `Status: ${sub.status}\n`
                  content += `Score: ${sub.score || 'Not graded'}\n`
                  content += '\n---\n\n'
                })
                
                const blob = new Blob([content], { type: 'text/plain' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `all_submissions_${new Date().toISOString().split('T')[0]}.txt`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-darkRoyalBlue text-white rounded-lg hover:bg-darkRoyalBlue/90"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          )}
        </div>
        
        {allSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-softGrey">
                  <th className="text-left py-3 px-2 text-sm font-medium text-darkGrey/70">Student</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-darkGrey/70">Assignment</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-darkGrey/70">Submitted</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-darkGrey/70">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-darkGrey/70">Score</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-darkGrey/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSubmissions.slice(0, 5).map((submission) => {
                  const assignment = assignments.find(a => a.id === submission.assignmentId)
                  return (
                    <tr key={submission.id} className="border-b border-softGrey/50 hover:bg-lightGrey/30">
                      <td className="py-3 px-2">
                        <div className="font-medium text-darkGrey">{submission.studentName}</div>
                        <div className="text-xs text-darkGrey/70">{submission.studentEmail}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-darkGrey">{assignment?.title || 'Unknown Assignment'}</div>
                      </td>
                      <td className="py-3 px-2 text-sm text-darkGrey/70">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          submission.status === 'graded' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {submission.score ? (
                          <span className="font-semibold" style={{ color: BRAND_COLORS.deepRed }}>
                            {submission.score}/{assignment?.totalPoints || '??'}
                          </span>
                        ) : (
                          <span className="text-darkGrey/70">Not graded</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/lms/Instructor_Portal/assignments/submissions/${submission.assignmentId}?student=${submission.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-darkRoyalBlue text-white rounded-lg hover:bg-darkRoyalBlue/90"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {allSubmissions.length > 5 && (
              <div className="text-center pt-4">
                <Link
                  href="/lms/Instructor_Portal/submissions"
                  className="text-darkRoyalBlue hover:underline font-medium"
                >
                  View all {allSubmissions.length} submissions →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-3 text-softGrey" />
            <p className="text-darkGrey/70">No student submissions yet.</p>
          </div>
        )}
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssignments.map(assignment => {
          const assignmentSubmissions = allSubmissions.filter(sub => sub.assignmentId === assignment.id)
          const pendingGrading = getPendingGradingCount(assignment.id)
          
          return (
            <div key={assignment.id} className="bg-white rounded-lg border border-softGrey p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assignment.status)}`}>
                    {assignment.status.toUpperCase()}
                  </span>
                  <h3 className="font-semibold text-darkGrey mt-2 text-lg">{assignment.title}</h3>
                  <p className="text-sm text-darkGrey/70 mt-1 line-clamp-2">{assignment.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDownloadSubmissions(assignment.id)}
                    className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                    title="Download Submissions"
                    disabled={assignmentSubmissions.length === 0}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/lms/Instructor_Portal/assignments/submissions/${assignment.id}`}
                    className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                    title="View Submissions"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/lms/Instructor_Portal/assignments/edit/${assignment.id}`}
                    className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-lightGrey rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-softGrey">
                <div className="flex items-center justify-between text-sm text-darkGrey/70 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{assignment.totalPoints} points</span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1 text-sm">
                    <Users className="w-3 h-3" />
                    {assignmentSubmissions.length} submissions
                  </span>
                  <span className="text-sm">
                    {assignment.graded} graded
                  </span>
                </div>

                {/* Submission Progress Bar */}
                {assignmentSubmissions.length > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-darkGrey/70 mb-1">
                      <span>Submission Progress</span>
                      <span>{Math.round((assignment.graded / assignmentSubmissions.length) * 100)}% graded</span>
                    </div>
                    <div className="w-full bg-softGrey rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ 
                          width: `${(assignment.graded / assignmentSubmissions.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-softGrey flex gap-2">
                  {assignment.status === 'draft' && (
                    <button
                      onClick={() => handlePublishAssignment(assignment.id)}
                      className="flex-1 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  {assignment.status === 'published' && (
                    <button
                      onClick={() => handleCloseAssignment(assignment.id)}
                      className="flex-1 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Close
                    </button>
                  )}
                  <Link
                    href={`/lms/Instructor_Portal/assignments/submissions/${assignment.id}`}
                    className={`flex-1 py-1.5 text-sm text-center border rounded-lg transition-colors ${
                      pendingGrading > 0
                        ? 'border-amber-500 text-amber-600 hover:bg-amber-50'
                        : 'border-darkRoyalBlue text-darkRoyalBlue hover:bg-darkRoyalBlue/5'
                    }`}
                  >
                    {pendingGrading > 0 ? `Grade (${pendingGrading})` : 'View Submissions'}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-softGrey">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Assignments Found
          </h3>
          <p className="text-darkGrey/70 mb-6">
            {searchTerm ? 'Try a different search term' : 'Create your first assignment for students'}
          </p>
          <Link
            href="/lms/Instructor_Portal/assignments/create"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <PlusCircle className="w-5 h-5" />
            Create First Assignment
          </Link>
        </div>
      )}
    </div>
  )
}