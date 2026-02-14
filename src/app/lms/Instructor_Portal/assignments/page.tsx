'use client'

import { useState, useEffect, useRef } from 'react'
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
  Download,
  Clock,
  MoreVertical,
  X,
  PlayCircle,
  PauseCircle,
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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

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
      setOpenDropdownId(null)
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
    setOpenDropdownId(null)
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
    setOpenDropdownId(null)
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
    setOpenDropdownId(null)
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

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
      case 'published':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published</span>
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Closed</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
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
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg mb-8"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Assignments
              </h1>
              <p className="text-sm sm:text-base text-darkGrey mt-1">
                Create and manage assignments for your students
              </p>
            </div>
            <div className="flex gap-3 self-start sm:self-auto">
              <Link
                href="/lms/Instructor_Portal/assignments/create"
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
            <input
              type="text"
              placeholder="Search assignments by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base ${filter === 'all' ? 'bg-darkRoyalBlue text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base ${filter === 'draft' ? 'bg-gray-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm sm:text-base ${filter === 'closed' ? 'bg-red-600 text-white' : 'bg-lightGrey text-darkGrey hover:bg-softGrey'}`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary - Removed total submissions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Total Assignments</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">{assignments.length}</h3>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-darkRoyalBlue" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Published</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">
                {assignments.filter(a => a.status === 'published').length}
              </h3>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-softGrey p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-darkGrey/70">Pending Grading</p>
              <h3 className="text-lg sm:text-2xl font-bold text-darkNavy">
                {allSubmissions.filter(sub => sub.status === 'submitted').length}
              </h3>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      {filteredAssignments.length > 0 ? (
        <div className="bg-white rounded-lg border border-softGrey overflow-x-auto">
          <table className="min-w-full divide-y divide-softGrey">
            {/* Table Header - Royal Blue */}
            <thead>
              <tr style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">Assignment</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">Due Date</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">Points</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">Submissions</th>
                <th className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white">Graded</th>
                <th className="px-4 py-3 text-center text-xs sm:text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-softGrey">
              {filteredAssignments.map((assignment) => {
                const pendingGrading = getPendingGradingCount(assignment.id);
                return (
                  <tr key={assignment.id} className="hover:bg-lightGrey/50 transition-colors relative">
                    <td className="px-4 py-3">
                      <div className="font-medium text-darkGrey text-sm sm:text-base truncate max-w-[200px]" title={assignment.title}>
                        {assignment.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(assignment.status)}
                    </td>
                    <td className="px-4 py-3 text-sm sm:text-base text-darkGrey whitespace-nowrap">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm sm:text-base text-darkGrey">
                      {assignment.totalPoints}
                    </td>
                    <td className="px-4 py-3 text-sm sm:text-base text-darkGrey">
                      {assignment.submissions}
                      {pendingGrading > 0 && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {pendingGrading} pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm sm:text-base text-darkGrey">
                      {assignment.graded}
                    </td>
                    <td className="px-4 py-3 text-center relative">
                      {/* 3-Dot Menu Button */}
                      <button
                        onClick={(e) => toggleDropdown(assignment.id, e)}
                        className="p-2 text-darkGrey hover:bg-lightGrey rounded-lg transition-colors relative z-10"
                        title="Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu - Now properly visible */}
                      {openDropdownId === assignment.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-softGrey z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                          style={{ minWidth: '250px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Download Submissions */}
                          <button
                            onClick={() => handleDownloadSubmissions(assignment.id)}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                              assignment.submissions === 0 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-lightGrey'
                            }`}
                            disabled={assignment.submissions === 0}
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-medium text-darkGrey text-sm">Download Submissions</div>
                              <div className="text-xs text-darkGrey/60">{assignment.submissions} submissions</div>
                            </div>
                          </button>

                          {/* View Submissions */}
                          <Link
                            href={`/lms/Instructor_Portal/assignments/submissions/${assignment.id}`}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-lightGrey transition-colors"
                            onClick={() => setOpenDropdownId(null)}
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                            <div>
                              <div className="font-medium text-darkGrey text-sm">View Submissions</div>
                              <div className="text-xs text-darkGrey/60">Grade & provide feedback</div>
                            </div>
                          </Link>

                          {/* Edit Assignment */}
                          <Link
                            href={`/lms/Instructor_Portal/assignments/edit/${assignment.id}`}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-lightGrey transition-colors"
                            onClick={() => setOpenDropdownId(null)}
                          >
                            <Edit className="w-4 h-4 text-amber-600" />
                            <div>
                              <div className="font-medium text-darkGrey text-sm">Edit Assignment</div>
                              <div className="text-xs text-darkGrey/60">Update details & instructions</div>
                            </div>
                          </Link>

                          {/* Status-based actions */}
                          {assignment.status === 'draft' && (
                            <button
                              onClick={() => handlePublishAssignment(assignment.id)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-lightGrey transition-colors"
                            >
                              <PlayCircle className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-green-600 text-sm">Publish Assignment</div>
                                <div className="text-xs text-darkGrey/60">Make visible to students</div>
                              </div>
                            </button>
                          )}
                          
                          {assignment.status === 'published' && (
                            <button
                              onClick={() => handleCloseAssignment(assignment.id)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-lightGrey transition-colors"
                            >
                              <PauseCircle className="w-4 h-4 text-orange-600" />
                              <div>
                                <div className="font-medium text-orange-600 text-sm">Close Assignment</div>
                                <div className="text-xs text-darkGrey/60">Stop accepting submissions</div>
                              </div>
                            </button>
                          )}
                          
                          {assignment.status === 'closed' && (
                            <button
                              onClick={() => handlePublishAssignment(assignment.id)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-lightGrey transition-colors"
                            >
                              <PlayCircle className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-green-600 text-sm">Reopen Assignment</div>
                                <div className="text-xs text-darkGrey/60">Accept submissions again</div>
                              </div>
                            </button>
                          )}

                          {/* Divider */}
                          <div className="my-2 border-t border-softGrey"></div>

                          {/* Delete Assignment */}
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors group"
                          >
                            <Trash2 className="w-4 h-4 text-brightRed" />
                            <div>
                              <div className="font-medium text-brightRed text-sm">Delete Assignment</div>
                              <div className="text-xs text-darkGrey/60">Permanently remove</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-softGrey">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.softGrey }} />
          <h3 className="text-base sm:text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            No Assignments Found
          </h3>
          <p className="text-darkGrey/70 mb-6 text-sm sm:text-base">
            {searchTerm ? 'Try a different search term' : 'Create your first assignment for students'}
          </p>
          <Link
            href="/lms/Instructor_Portal/assignments/create"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
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