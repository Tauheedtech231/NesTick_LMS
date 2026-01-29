'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  HiPlus, HiPencil, HiTrash, HiSearch,
  HiFilter, HiDocumentDownload, HiX, 
  HiOutlineCalendar, HiOutlineCollection
} from 'react-icons/hi'
/* eslint-disable */

interface Assignment {
  id: string
  title: string
  courseId: string
  courseName: string
  moduleId: string
  moduleName: string
  description: string
  dueDate: string
  totalPoints: number
  submissionType: 'file' | 'text' | 'both'
  status: 'draft' | 'published' | 'closed'
  totalStudents: number
  submitted: number
  createdAt: string
}

export default function AssignmentsList() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('course')
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Load sample assignments data
    const sampleAssignments: Assignment[] = [
      {
        id: '1',
        title: 'HTML Portfolio Project',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        moduleId: 'module-1',
        moduleName: 'HTML & CSS Fundamentals',
        description: 'Create a personal portfolio website using HTML and CSS',
        dueDate: '2024-04-15',
        totalPoints: 100,
        submissionType: 'file',
        status: 'published',
        totalStudents: 45,
        submitted: 42,
        createdAt: '2024-03-01'
      },
      {
        id: '2',
        title: 'Python Data Analysis',
        courseId: 'course-2',
        courseName: 'Data Science Fundamentals',
        moduleId: 'module-2',
        moduleName: 'Python Programming',
        description: 'Analyze a dataset using pandas and create visualizations',
        dueDate: '2024-04-20',
        totalPoints: 100,
        submissionType: 'both',
        status: 'published',
        totalStudents: 32,
        submitted: 28,
        createdAt: '2024-03-10'
      },
      {
        id: '3',
        title: 'JavaScript Quiz Project',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        moduleId: 'module-2',
        moduleName: 'JavaScript Programming',
        description: 'Build an interactive quiz application using JavaScript',
        dueDate: '2024-05-01',
        totalPoints: 100,
        submissionType: 'file',
        status: 'draft',
        totalStudents: 45,
        submitted: 0,
        createdAt: '2024-03-20'
      },
      {
        id: '4',
        title: 'React Component Library',
        courseId: 'course-1',
        courseName: 'Web Development Bootcamp',
        moduleId: 'module-3',
        moduleName: 'React Development',
        description: 'Create a reusable component library with React',
        dueDate: '2024-04-30',
        totalPoints: 100,
        submissionType: 'both',
        status: 'published',
        totalStudents: 45,
        submitted: 15,
        createdAt: '2024-03-15'
      },
      {
        id: '5',
        title: 'Database Design Project',
        courseId: 'course-3',
        courseName: 'Database Management',
        moduleId: 'module-4',
        moduleName: 'SQL & NoSQL',
        description: 'Design and implement a database schema for e-commerce',
        dueDate: '2024-04-25',
        totalPoints: 100,
        submissionType: 'file',
        status: 'published',
        totalStudents: 28,
        submitted: 25,
        createdAt: '2024-03-05'
      },
      {
        id: '6',
        title: 'Mobile App Wireframes',
        courseId: 'course-4',
        courseName: 'UI/UX Design',
        moduleId: 'module-5',
        moduleName: 'Prototyping',
        description: 'Create wireframes for a mobile banking application',
        dueDate: '2024-05-10',
        totalPoints: 100,
        submissionType: 'both',
        status: 'draft',
        totalStudents: 35,
        submitted: 0,
        createdAt: '2024-03-25'
      }
    ]

    setAssignments(sampleAssignments)

    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
    
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      const updatedAssignments = assignments.filter(assignment => assignment.id !== id)
      setAssignments(updatedAssignments)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'border-green-200 bg-green-50 text-green-700'
      case 'draft': return 'border-gray-200 bg-gray-50 text-gray-700'
      case 'closed': return 'border-red-200 bg-red-50 text-red-700'
      default: return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const getSubmissionTypeBadge = (type: string) => {
    switch (type) {
      case 'file': return 'File Upload'
      case 'text': return 'Text Entry'
      case 'both': return 'File & Text'
      default: return 'File'
    }
  }

  const getSubmissionTypeColor = (type: string) => {
    switch (type) {
      case 'file': return 'bg-blue-100 text-blue-700'
      case 'text': return 'bg-purple-100 text-purple-700'
      case 'both': return 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCourse = !selectedCourse || assignment.courseId === selectedCourse
    const matchesStatus = statusFilter === 'ALL' || assignment.status === statusFilter
    
    return matchesSearch && matchesCourse && matchesStatus
  })

  const isUpcoming = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600 mt-2">Manage course assignments and submissions</p>
            </div>
            <Link
              href="/lms/Admin_Portal/assignments/add"
              className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              New Assignment
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black min-w-[180px]"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black min-w-[140px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
                <button 
                  onClick={() => {
                    setSelectedCourse('')
                    setStatusFilter('ALL')
                    setSearchTerm('')
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <div className="text-gray-700">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </div>
        </div>

        {/* Assignments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineCollection className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'No assignments match your search criteria' : 'Create your first assignment to get started'}
            </p>
            <Link
              href="/lms/Admin_Portal/assignments/add"
              className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Create Assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const upcoming = isUpcoming(assignment.dueDate)
              const overdue = isOverdue(assignment.dueDate)
              const submissionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100)

              return (
                <div 
                  key={assignment.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {assignment.courseName}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(assignment.status)}`}>
                        {assignment.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-6 line-clamp-3">
                      {assignment.description}
                    </p>

                    {/* Submission Type Badge */}
                    <div className="mb-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getSubmissionTypeColor(assignment.submissionType)}`}>
                        {getSubmissionTypeBadge(assignment.submissionType)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    {/* Submission Stats */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Submissions</span>
                        <span className="text-sm font-medium text-gray-900">
                          {assignment.submitted} / {assignment.totalStudents}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            submissionRate >= 80 ? 'bg-green-500' :
                            submissionRate >= 50 ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${submissionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${
                      overdue ? 'bg-red-50 border border-red-100' :
                      upcoming ? 'bg-amber-50 border border-amber-100' :
                      'bg-gray-50 border border-gray-100'
                    }`}>
                      <div className="flex items-center">
                        <HiOutlineCalendar className={`w-4 h-4 mr-2 ${
                          overdue ? 'text-red-600' :
                          upcoming ? 'text-amber-600' :
                          'text-gray-600'
                        }`} />
                        <span className={`text-sm ${
                          overdue ? 'text-red-700' :
                          upcoming ? 'text-amber-700' :
                          'text-gray-700'
                        }`}>
                          {overdue ? 'Overdue' : upcoming ? 'Due soon' : 'Due date'}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        overdue ? 'text-red-700' :
                        upcoming ? 'text-amber-700' :
                        'text-gray-900'
                      }`}>
                        {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Points */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm text-gray-600">Total points</span>
                      <span className="font-medium text-gray-900">{assignment.totalPoints}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <Link
                          href={`/lms/Admin_Portal/assignments/edit/${assignment.id}`}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/lms/Admin_Portal/assignments/submissions/${assignment.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Submissions"
                        >
                          <HiOutlineCollection className="w-4 h-4" />
                        </Link>
                      </div>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* View Options */}
        {!loading && filteredAssignments.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
              <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
                Grid View
              </button>
              <button 
                onClick={() => {/* Switch to table view */}}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md"
              >
                Table View
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Need help with assignments? <a href="#" className="text-black hover:underline">View documentation</a>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                <HiDocumentDownload className="w-4 h-4 inline mr-2" />
                Export List
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm">
                <HiFilter className="w-4 h-4 inline mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}