// app/lms/Instructor_Portal/assignments/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  HiPlus, HiSearch, HiCalendar, 
  HiDocumentText,  HiClock,
  HiPencil, HiTrash, HiEye, 
 HiChartBar, HiUsers,
  HiChevronDown, HiDownload, HiStar
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
  grade?: string
}

interface Course {
  id: string
  title: string
  code: string
}

interface Student {
  id: string
  name: string
  email: string
  courseId: string
}
/* eslint-disable */

export default function AssignmentsListPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [gradingFilter, setGradingFilter] = useState('all')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  // Helper functions
  const getSubmissionsForAssignment = useMemo(() => (assignmentId: string): Submission[] => {
    return submissions.filter(sub => sub.assignmentId === assignmentId)
  }, [submissions])

  const getSubmissionStats = useMemo(() => (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return {
      totalStudents: 0,
      totalSubmissions: 0,
      graded: 0,
      submitted: 0,
      pending: 0,
      late: 0,
      submissionRate: 0
    }

    const assignmentStudents = students.filter(s => s.courseId === assignment.courseId)
    const totalStudents = assignmentStudents.length
    const assignmentSubmissions = getSubmissionsForAssignment(assignmentId)
    const graded = assignmentSubmissions.filter(s => s.status === 'graded').length
    const submitted = assignmentSubmissions.filter(s => 
      s.status === 'submitted' || s.status === 'late'
    ).length
    const pending = Math.max(0, totalStudents - (graded + submitted))
    const late = assignmentSubmissions.filter(s => s.status === 'late').length
    
    return {
      totalStudents,
      totalSubmissions: assignmentSubmissions.length,
      graded,
      submitted,
      pending,
      late,
      submissionRate: totalStudents > 0 ? Math.round((assignmentSubmissions.length / totalStudents) * 100) : 0
    }
  }, [assignments, students, getSubmissionsForAssignment])

  const loadData = () => {
    try {
      setLoading(true)
      
      // Get current instructor
      const userData = localStorage.getItem('currentUser')
      let currentUser = null
      if (userData) {
        currentUser = JSON.parse(userData)
      }

      // Get assigned courses
      const allCourses = JSON.parse(localStorage.getItem('courses') || '[]')
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
      
      let assignedCourses: Course[] = []
      let assignedCourseIds: string[] = []
      
      if (currentUser?.email === 'instructor@gmail.com') {
        assignedCourses = allCourses
        assignedCourseIds = allCourses.map((c: Course) => c.id)
      } else if (currentUser?.role === 'instructor') {
        const instructorDetails = allInstructors.find((instr: any) => 
          instr.email === currentUser.email || instr.id === currentUser.instructorId
        )
        
        if (instructorDetails?.assignedCourseIds) {
          assignedCourseIds = instructorDetails.assignedCourseIds
          assignedCourses = allCourses.filter((course: Course) => 
            assignedCourseIds.includes(course.id)
          )
        }
      }
      
      setCourses(assignedCourses)

      // Get assignments from localStorage (only assignments)
      const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]')
      
      // Filter assignments by assigned courses and type
      const instructorAssignments = allAssignments.filter((assignment: Assignment) => 
        assignedCourseIds.includes(assignment.courseId) && assignment.type === 'assignment'
      )
      
      setAssignments(instructorAssignments)

      // Get students for assigned courses
      const allStudents = JSON.parse(localStorage.getItem('students') || '[]')
      const courseStudents = allStudents.filter((student: Student) => 
        assignedCourseIds.includes(student.courseId)
      )
      setStudents(courseStudents)

      // Get all submissions
      const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      
      // Filter submissions for these assignments
      const assignmentIds = instructorAssignments.map((a: { id: any }) => a.id)
      const filteredSubmissions = allSubmissions.filter((sub: Submission) => 
        assignmentIds.includes(sub.assignmentId)
      )
      
      setSubmissions(filteredSubmissions)

    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load assignments data')
    } finally {
      setLoading(false)
    }
  }

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
      
      // Filter by grading status
      const assignmentSubmissions = getSubmissionsForAssignment(assignment.id)
      if (gradingFilter === 'ungraded') {
        const hasUngraded = assignmentSubmissions.some(sub => sub.status === 'submitted' || sub.status === 'late')
        if (!hasUngraded) return false
      } else if (gradingFilter === 'graded') {
        const allGraded = assignmentSubmissions.length > 0 && 
                         assignmentSubmissions.every(sub => sub.status === 'graded')
        if (!allGraded) return false
      } else if (gradingFilter === 'partial') {
        const someGraded = assignmentSubmissions.some(sub => sub.status === 'graded')
        const someUngraded = assignmentSubmissions.some(sub => sub.status === 'submitted' || sub.status === 'late')
        if (!(someGraded && someUngraded)) return false
      }
      
      return matchesSearch && matchesCourse && matchesStatus
    })
  }, [assignments, searchTerm, courseFilter, statusFilter, gradingFilter, getSubmissionsForAssignment])

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.title : 'Unknown Course'
  }

  const calculateAverageMarks = (assignmentId: string) => {
    const assignmentSubmissions = getSubmissionsForAssignment(assignmentId)
    const gradedSubmissions = assignmentSubmissions.filter(s => s.marks !== undefined)
    
    if (gradedSubmissions.length === 0) return 0
    
    const total = gradedSubmissions.reduce((sum, sub) => sum + (sub.marks || 0), 0)
    return Math.round(total / gradedSubmissions.length)
  }

  const getGradeDistribution = (assignmentId: string) => {
    const assignmentSubmissions = getSubmissionsForAssignment(assignmentId)
    const gradedSubmissions = assignmentSubmissions.filter(s => s.marks !== undefined)
    
    if (gradedSubmissions.length === 0) return null
    
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return null
    
    const excellent = gradedSubmissions.filter(s => (s.marks || 0) >= assignment.totalMarks * 0.9).length
    const good = gradedSubmissions.filter(s => 
      (s.marks || 0) >= assignment.totalMarks * 0.7 && 
      (s.marks || 0) < assignment.totalMarks * 0.9
    ).length
    const average = gradedSubmissions.filter(s => 
      (s.marks || 0) >= assignment.totalMarks * 0.5 && 
      (s.marks || 0) < assignment.totalMarks * 0.7
    ).length
    const poor = gradedSubmissions.filter(s => (s.marks || 0) < assignment.totalMarks * 0.5).length
    
    return { excellent, good, average, poor }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' }
    if (diffDays === 0) return { days: 0, status: 'today' }
    if (diffDays <= 3) return { days: diffDays, status: 'urgent' }
    return { days: diffDays, status: 'normal' }
  }

  const handleDeleteAssignment = (assignmentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All submissions will also be deleted.`)) return
    
    try {
      // Delete assignment
      const updatedAssignments = assignments.filter(a => a.id !== assignmentId)
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments))
      
      // Delete associated submissions
      const allSubmissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]')
      const updatedSubmissions = allSubmissions.filter((sub: Submission) => 
        sub.assignmentId !== assignmentId
      )
      localStorage.setItem('assignmentSubmissions', JSON.stringify(updatedSubmissions))
      
      setAssignments(updatedAssignments)
      setSubmissions(updatedSubmissions)
      toast.success('Assignment and all submissions deleted successfully')
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  const downloadSubmissions = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment) return
    
    const assignmentSubmissions = getSubmissionsForAssignment(assignmentId)
    if (assignmentSubmissions.length === 0) {
      toast.error('No submissions to download')
      return
    }

    // Create CSV content
    const headers = ['Student Name', 'Student ID', 'Submission Date', 'Status', 'Marks', 'Grade', 'Feedback']
    const csvData = assignmentSubmissions.map(sub => [
      sub.studentName,
      sub.studentId,
      formatDate(sub.submittedAt),
      sub.status,
      sub.marks || 'Not graded',
      sub.grade || 'N/A',
      sub.feedback || 'No feedback'
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${assignment.title}-submissions-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Downloaded ${assignmentSubmissions.length} submissions`)
  }

  const viewAllSubmissions = (assignmentId: string) => {
    router.push(`/lms/Instructor_Portal/assignments/${assignmentId}/submissions`)
  }

  const gradeSubmission = (assignmentId: string, submissionId: string) => {
    router.push(`/lms/Instructor_Portal/assignments/${assignmentId}/grade/${submissionId}`)
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

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
      <p className="text-gray-600">Manage and grade student assignments</p>
    </div>
    <Link
      href="/lms/Instructor_Portal/assignments/create"
      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
    >
      <HiPlus className="w-5 h-5" />
      Create Assignment
    </Link>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <p className="text-sm text-gray-600">Total Assignments</p>
      <p className="text-xl font-bold text-gray-900">{assignments.length}</p>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <p className="text-sm text-gray-600">Total Submissions</p>
      <p className="text-xl font-bold text-blue-600">{submissions.length}</p>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <p className="text-sm text-gray-600">Pending Grading</p>
      <p className="text-xl font-bold text-amber-600">
        {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length}
      </p>
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <p className="text-sm text-gray-600">Graded</p>
      <p className="text-xl font-bold text-green-600">
        {submissions.filter(s => s.status === 'graded').length}
      </p>
    </div>
  </div>
</div>


          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
    {/* Search */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Assignments
      </label>
      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
        />
      </div>
    </div>

    {/* Course Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Course
      </label>
      <div className="relative">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>

    {/* Grading Status Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Grading Status
      </label>
      <div className="relative">
        <select
          value={gradingFilter}
          onChange={(e) => setGradingFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
        >
          <option value="all">All Status</option>
          <option value="ungraded">Needs Grading</option>
          <option value="graded">All Graded</option>
          <option value="partial">Partially Graded</option>
        </select>
        <HiChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  </div>
</div>


          {/* Assignments List */}
          {loading ? (
            <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-700">Loading assignments...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Courses Assigned</h3>
              <p className="text-gray-600 mb-4">
                You haven't been assigned any courses yet.
              </p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <HiDocumentText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-600 mb-4">
                {assignments.length === 0 
                  ? "You haven't created any assignments yet."
                  : "No assignments match your filters."}
              </p>
              <Link
                href="/lms/Instructor_Portal/assignments/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                <HiPlus className="w-5 h-5" />
                Create First Assignment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Assignment</th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Course</th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Submissions</th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Avg Score</th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Due</th>
        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {filteredAssignments.map((assignment) => {
        const stats = getSubmissionStats(assignment.id)
        const daysRemaining = getDaysRemaining(assignment.dueDate)
        const avgMarks = calculateAverageMarks(assignment.id)
        const assignmentSubmissions = getSubmissionsForAssignment(assignment.id)

        return (
          <tr key={assignment.id} className="hover:bg-gray-50">
            {/* Assignment Title */}
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <HiDocumentText className="w-5 h-5 text-blue-600" />
                <div className="line-clamp-1 font-medium text-gray-900">{assignment.title}</div>
              </div>
            </td>

            {/* Course */}
            <td className="px-4 py-3 text-sm text-gray-700">{getCourseName(assignment.courseId)}</td>

            {/* Submissions */}
            <td className="px-4 py-3 text-sm">
              <div>{stats.totalSubmissions}/{stats.totalStudents}</div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${stats.submissionRate}%` }}
                ></div>
              </div>
            </td>

            {/* Avg Score */}
            <td className="px-4 py-3 text-sm font-medium text-blue-600">
              {avgMarks}/{assignment.totalMarks}
            </td>

            {/* Due Date */}
            <td className="px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <HiCalendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(assignment.dueDate)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium mt-1 inline-block ${
                daysRemaining.status === 'overdue' ? 'bg-red-100 text-red-800' :
                daysRemaining.status === 'urgent' ? 'bg-amber-100 text-amber-800' :
                daysRemaining.status === 'today' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {daysRemaining.status === 'overdue' ? 'Overdue' :
                 daysRemaining.status === 'urgent' ? 'Due soon' :
                 daysRemaining.status === 'today' ? 'Today' :
                 'Active'}
              </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 space-y-1">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/lms/Instructor_Portal/assignments/${assignment.id}`)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <HiEye className="w-4 h-4" /> Details
                </button>

                <button
                  onClick={() => router.push(`/lms/Instructor_Portal/assignments/edit/${assignment.id}`)}
                  className="px-2 py-1 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1"
                >
                  <HiPencil className="w-4 h-4" /> Edit
                </button>

                <button
                  onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  className="px-2 py-1 text-sm bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100 flex items-center gap-1"
                >
                  <HiTrash className="w-4 h-4" /> Delete
                </button>

                {stats.submitted > 0 && (
                  <button
                    onClick={() => {
                      const ungradedSubmission = assignmentSubmissions.find(
                        sub => sub.status === 'submitted' || sub.status === 'late'
                      )
                      if (ungradedSubmission) gradeSubmission(assignment.id, ungradedSubmission.id)
                      else viewAllSubmissions(assignment.id)
                    }}
                    className="px-2 py-1 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded flex items-center gap-1"
                  >
                    <HiStar className="w-4 h-4" />
                    Grade {stats.submitted} Pending
                  </button>
                )}
              </div>
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
</div>

          )}

          {/* Summary Section */}
        {assignments.length > 0 && !loading && (
  <div className="mt-6 bg-white border border-gray-300 rounded-lg p-4">
    <h3 className="font-bold text-gray-900 mb-4">Submission Overview</h3>
    <ul className="space-y-3">
      {/* Total Submissions */}
      <li className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <HiDocumentText className="w-6 h-6 text-blue-600" />
          <span className="text-sm text-gray-700">Total Submissions</span>
        </div>
        <span className="text-lg font-bold text-blue-700">{submissions.length}</span>
      </li>

      {/* Pending Grading */}
      <li className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <HiClock className="w-6 h-6 text-amber-600" />
          <span className="text-sm text-gray-700">Pending Grading</span>
        </div>
        <span className="text-lg font-bold text-amber-700">
          {submissions.filter(s => s.status === 'submitted' || s.status === 'late').length}
        </span>
      </li>

      {/* Average Score */}
      <li className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3">
          <HiChartBar className="w-6 h-6 text-green-600" />
          <span className="text-sm text-gray-700">Average Score</span>
        </div>
        <span className="text-lg font-bold text-green-700">
          {assignments.length > 0 
            ? Math.round(assignments.reduce((acc, a) => acc + calculateAverageMarks(a.id), 0) / assignments.length)
            : 0
          }%
        </span>
      </li>
    </ul>
  </div>
)}

        </div>
      </div>
    </>
  )
}