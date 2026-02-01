// app/lms/Student_Portal/assignments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  HiSearch, HiCalendar, HiClock, 
  HiDocumentText, HiCheckCircle, 
  HiUpload, HiExclamationCircle,
  HiChevronRight, HiChevronDown,
  HiAcademicCap, HiUserCircle
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
  status: 'active' | 'draft' | 'graded'
  instructions?: string
  attachments?: { name: string; url: string }[]
}

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
}
/* eslint-disable */

interface Course {
  id: string
  title: string
  code: string
  instructorId?: string
}

interface Instructor {
  id: string
  name: string
  email: string
}

export default function StudentAssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)

  useEffect(() => {
    // Check if student is logged in
    const studentData = localStorage.getItem('currentStudent')
    
    if (!studentData) {
      router.push('/student-login')
      return
    }

    loadAssignments()
  }, [router])

  const loadAssignments = () => {
    try {
      setLoading(true)
      
      // Get current student
      const studentData = localStorage.getItem('currentStudent')
      const currentStudent = studentData ? JSON.parse(studentData) : null
      setStudent(currentStudent)

      if (!currentStudent) return

      // Get student details from students list
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]')
      const studentDetails = allStudents.find((s: any) => s.id === currentStudent.id)
      
      if (!studentDetails) return

      // Get student's enrolled courses
      let enrolledCourseIds: string[] = []
      
      if (studentDetails.courseId) {
        enrolledCourseIds = [studentDetails.courseId]
      } else if (studentDetails.enrolledCourses && Array.isArray(studentDetails.enrolledCourses)) {
        enrolledCourseIds = studentDetails.enrolledCourses
      } else if (studentDetails.courseName) {
        // Try to find course by name
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
        const course = allCourses.find((c: any) => 
          c.title?.toLowerCase() === studentDetails.courseName?.toLowerCase()
        )
        if (course) enrolledCourseIds = [course.id]
      }

      // Get all assignments
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      
      // Filter assignments for student's courses and type=assignment
      const studentAssignments = allAssignments.filter((assignment: Assignment) => 
        enrolledCourseIds.includes(assignment.courseId) && assignment.type === 'assignment'
      )
      
      setAssignments(studentAssignments)

      // Get courses for these assignments
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const studentCourses = allCourses.filter((course: Course) => 
        enrolledCourseIds.includes(course.id)
      )
      setCourses(studentCourses)

      // Get instructors
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
      setInstructors(allInstructors)

      // Get submissions for this student
      const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      const studentSubmissions = allSubmissions.filter((sub: Submission) => 
        sub.studentId === currentStudent.id
      )
      setSubmissions(studentSubmissions)

    } catch (error) {
      console.error('Error loading assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter
    
    // Check status based on submissions
    const submission = submissions.find(s => s.assignmentId === assignment.id)
    let assignmentStatus = 'pending'
    if (submission) {
      assignmentStatus = submission.status
    } else {
      const dueDate = new Date(assignment.dueDate)
      const today = new Date()
      assignmentStatus = dueDate < today ? 'overdue' : 'pending'
    }
    
    const matchesStatus = statusFilter === 'all' || assignmentStatus === statusFilter
    
    return matchesSearch && matchesCourse && matchesStatus
  })

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const getInstructorName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (!course?.instructorId) return 'Not Assigned'
    
    const instructor = instructors.find(i => i.id === course.instructorId)
    return instructor ? instructor.name : 'Not Assigned'
  }

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(s => s.assignmentId === assignmentId)
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = getSubmissionForAssignment(assignment.id)
    
    if (submission) {
      if (submission.status === 'graded') {
        return {
          type: 'graded',
          label: 'Graded',
          color: 'bg-green-100 text-green-800',
          icon: <HiCheckCircle className="w-4 h-4 text-green-600" />
        }
      } else if (submission.status === 'late') {
        return {
          type: 'late',
          label: 'Submitted Late',
          color: 'bg-amber-100 text-amber-800',
          icon: <HiExclamationCircle className="w-4 h-4 text-amber-600" />
        }
      } else {
        return {
          type: 'submitted',
          label: 'Submitted',
          color: 'bg-blue-100 text-blue-800',
          icon: <HiCheckCircle className="w-4 h-4 text-blue-600" />
        }
      }
    }

    // Check if due date has passed
    const dueDate = new Date(assignment.dueDate)
    const today = new Date()
    
    if (dueDate < today) {
      return {
        type: 'overdue',
        label: 'Overdue',
        color: 'bg-red-100 text-red-800',
        icon: <HiExclamationCircle className="w-4 h-4 text-red-600" />
      }
    }

    // Check if due date is within 24 hours
    const hoursRemaining = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60)
    if (hoursRemaining <= 24) {
      return {
        type: 'urgent',
        label: 'Due Soon',
        color: 'bg-orange-100 text-orange-800',
        icon: <HiClock className="w-4 h-4 text-orange-600" />
      }
    }

    return {
      type: 'pending',
      label: 'Pending',
      color: 'bg-gray-100 text-gray-800',
      icon: <HiCalendar className="w-4 h-4 text-gray-600" />
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)} days overdue` }
    if (diffDays === 0) return { days: 0, text: 'Due today' }
    if (diffDays === 1) return { days: 1, text: 'Due tomorrow' }
    return { days: diffDays, text: `Due in ${diffDays} days` }
  }

  const handleFileUpload = async (assignmentId: string, file: File) => {
    try {
      setUploading(true)
      
      // In a real app, you would upload to a server
      // For demo, we'll simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create new submission
      const newSubmission: Submission = {
        id: `sub_${Date.now()}`,
        assignmentId,
        studentId: student?.id || '',
        studentName: student?.name || 'Student',
        submittedAt: new Date().toISOString(),
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // In real app, this would be server URL
        remarks: '',
        status: 'submitted'
      }

      // Check if late submission
      const assignment = assignments.find(a => a.id === assignmentId)
      if (assignment) {
        const dueDate = new Date(assignment.dueDate)
        const submittedDate = new Date(newSubmission.submittedAt)
        if (submittedDate > dueDate) {
          newSubmission.status = 'late'
        }
      }

      // Save submission to localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      const updatedSubmissions = [...existingSubmissions, newSubmission]
      localStorage.setItem('assignmentSubmissions', JSON.stringify(updatedSubmissions))
      
      setSubmissions(updatedSubmissions)
      setSelectedAssignment(null)
      toast.success('Assignment submitted successfully!')
      loadAssignments() // Reload to update status
      
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to submit assignment')
    } finally {
      setUploading(false)
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

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                <p className="text-gray-600">View and submit your assignments</p>
              </div>
              
              <div className="flex items-center gap-4">
                {student && (
                  <div className="flex items-center gap-2 text-sm">
                    <HiUserCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{student.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 bg-white rounded-xl p-4">
  {/* Total */}
  <div className="flex-1 flex flex-col items-center md:items-start">
    <p className="text-sm text-gray-500">Total Assignments</p>
    <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
  </div>

  {/* Pending */}
  <div className="flex-1 flex flex-col items-center md:items-start">
    <p className="text-sm text-gray-500">Pending</p>
    <p className="text-2xl font-semibold text-amber-700">
      {assignments.filter(a => getAssignmentStatus(a).type === 'pending').length}
    </p>
  </div>

  {/* Submitted */}
  <div className="flex-1 flex flex-col items-center md:items-start">
    <p className="text-sm text-gray-500">Submitted</p>
    <p className="text-2xl font-semibold text-blue-700">{submissions.length}</p>
  </div>

  {/* Graded */}
  <div className="flex-1 flex flex-col items-center md:items-start">
    <p className="text-sm text-gray-500">Graded</p>
    <p className="text-2xl font-semibold text-green-700">
      {submissions.filter(s => s.status === 'graded').length}
    </p>
  </div>
</div>

          </div>

          {/* Filters */}
       <div className="bg-white rounded-xl p-4 mb-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Assignments</h2>

  <div className="flex flex-col md:flex-row gap-4">
    {/* Search */}
    <div className="flex-1 flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
        type="text"
        placeholder="Title or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
      />
    </div>

    {/* Course Filter */}
    <div className="flex-1 flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Course</label>
      <select
        value={courseFilter}
        onChange={(e) => setCourseFilter(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none"
      >
        <option value="all">All Courses</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>
    </div>

    {/* Status Filter */}
    <div className="flex-1 flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm appearance-none"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="submitted">Submitted</option>
        <option value="graded">Graded</option>
        <option value="overdue">Overdue</option>
      </select>
    </div>
  </div>
</div>


          {/* Assignments List */}
          {loading ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-700">Loading assignments...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-600 mb-4">
                You don't have any assignments assigned yet.
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Assignments Match</h3>
              <p className="text-gray-600 mb-4">
                No assignments match your current filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCourseFilter('all')
                  setStatusFilter('all')
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const status = getAssignmentStatus(assignment)
                const submission = getSubmissionForAssignment(assignment.id)
                const daysRemaining = getDaysRemaining(assignment.dueDate)
                const isExpanded = selectedAssignment === assignment.id
                
                return (
                  <div key={assignment.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    {/* Assignment Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedAssignment(isExpanded ? null : assignment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <HiDocumentText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <HiAcademicCap className="w-4 h-4" />
                                {getCourseName(assignment.courseId)}
                              </span>
                              
                              <span className="flex items-center gap-1">
                                <HiCalendar className="w-4 h-4" />
                                Due: {formatDate(assignment.dueDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission?.marks !== undefined && (
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Score</p>
                              <p className="text-lg font-bold text-green-600">
                                {submission.marks}/{assignment.totalMarks}
                              </p>
                            </div>
                          )}
                          <HiChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-300 p-4">
                        {/* Assignment Details */}
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-900 mb-2">Assignment Details</h4>
                          <p className="text-gray-700 mb-4">{assignment.description}</p>
                          
                          {assignment.instructions && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-1">Instructions:</h5>
                              <p className="text-gray-700 text-sm">{assignment.instructions}</p>
                            </div>
                          )}

                          {assignment.attachments && assignment.attachments.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Attachments:</h5>
                              <div className="space-y-1">
                                {assignment.attachments.map((attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    <HiDocumentText className="w-4 h-4" />
                                    {attachment.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Total Marks</p>
                              <p className="font-medium text-gray-900">{assignment.totalMarks}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Created</p>
                              <p className="font-medium text-gray-900">{formatDate(assignment.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Submission Section */}
                        <div className="border-t pt-4">
                          {submission ? (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Your Submission</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <p className="text-gray-600 text-sm">Submitted At</p>
                                    <p className="font-medium text-gray-900">
                                      {formatDate(submission.submittedAt)} at {formatTime(submission.submittedAt)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-sm">Status</p>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                      {status.label}
                                    </span>
                                  </div>
                                </div>
                                
                                {submission.fileName && (
                                  <div className="mb-3">
                                    <p className="text-gray-600 text-sm mb-1">Submitted File</p>
                                    <a
                                      href={submission.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                    >
                                      <HiDocumentText className="w-4 h-4" />
                                      {submission.fileName}
                                    </a>
                                  </div>
                                )}
                                
                                {submission.remarks && (
                                  <div className="mb-3">
                                    <p className="text-gray-600 text-sm mb-1">Your Remarks</p>
                                    <p className="text-gray-900">{submission.remarks}</p>
                                  </div>
                                )}
                                
                                {submission.feedback && (
                                  <div className="border-t pt-3">
                                    <p className="text-gray-600 text-sm mb-1">Instructor Feedback</p>
                                    <p className="text-gray-900">{submission.feedback}</p>
                                  </div>
                                )}
                                
                                {submission.marks !== undefined && (
                                  <div className="border-t pt-3">
                                    <p className="text-gray-600 text-sm mb-1">Score</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      {submission.marks}/{assignment.totalMarks}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Submit Assignment</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="mb-4">
                                  <p className="text-gray-700 mb-2">
                                    {daysRemaining.days < 0 ? (
                                      <span className="text-red-600 font-medium">This assignment is overdue!</span>
                                    ) : (
                                      <span>{daysRemaining.text}</span>
                                    )}
                                  </p>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload your submission
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="file"
                                      id={`file-${assignment.id}`}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          handleFileUpload(assignment.id, file)
                                        }
                                      }}
                                      disabled={uploading}
                                    />
                                    <label
                                      htmlFor={`file-${assignment.id}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                                        <HiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-700">
                                          {uploading ? 'Uploading...' : 'Click to select file'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                          PDF, DOC, DOCX, ZIP (Max 10MB)
                                        </p>
                                      </div>
                                    </label>
                                    <button
                                      onClick={() => {
                                        const fileInput = document.getElementById(`file-${assignment.id}`) as HTMLInputElement
                                        if (fileInput) fileInput.click()
                                      }}
                                      disabled={uploading}
                                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                                    >
                                      {uploading ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                          Uploading...
                                        </>
                                      ) : (
                                        <>
                                          <HiUpload className="w-5 h-5" />
                                          Submit
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}