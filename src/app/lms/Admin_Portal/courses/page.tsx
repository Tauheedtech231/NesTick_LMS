/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  HiPlus, HiPencil, HiTrash, 
  HiSearch, HiFilter, HiDocumentDownload,
  HiStar,
  HiBookOpen,
  HiExclamationCircle,
  HiClock,
  HiUsers,
  HiAcademicCap,
  HiCurrencyDollar
} from 'react-icons/hi'

interface Course {
  id: string
  title: string
  description: string
  duration: string
  credits: number
  fee: number
  awardingBody: string
  entryRequirements: string
  status: 'active' | 'inactive'
  createdAt: string
  image?: string
  totalStudents?: number
  rating?: number
  category?: string
  instructor?: string
}

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = () => {
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    console.log('Loaded courses from localStorage:', storedCourses)
    // Ensure all courses have required properties
    const validatedCourses = storedCourses.map((course: any) => ({
      ...course,
      title: course.title || 'Untitled Course',
      description: course.description || 'No description available',
      awardingBody: course.awardingBody || 'Not specified',
      entryRequirements: course.entryRequirements || 'No requirements specified',
      duration: course.duration || 'N/A',
      credits: course.credits || 0,
      fee: course.fee || 0,
      status: course.status || 'inactive',
      createdAt: course.createdAt || new Date().toISOString(),
      instructor: course.instructor || 'Not assigned',
    }))
    setCourses(validatedCourses)
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const updatedCourses = courses.filter(course => course.id !== id)
      localStorage.setItem('courses', JSON.stringify(updatedCourses))
      setCourses(updatedCourses)
      
      // Also delete related modules
      const modules = JSON.parse(localStorage.getItem('modules') || '[]')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedModules = modules.filter((module: any) => module.courseId !== id)
      localStorage.setItem('modules', JSON.stringify(updatedModules))
      
      alert('Course deleted successfully!')
    }
  }

  // Fixed filtering with null safety
  const filteredCourses = courses.filter(course => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || (
      (course.title?.toLowerCase() || '').includes(searchLower) ||
      (course.description?.toLowerCase() || '').includes(searchLower) ||
      (course.awardingBody?.toLowerCase() || '').includes(searchLower) ||
      (course.instructor?.toLowerCase() || '').includes(searchLower)
    )
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700'
      : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header */}
     <div className="mb-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    
    {/* Heading */}
    <div className="text-center sm:text-left">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
        Course Management
      </h1>
      <p className="text-gray-500 text-sm mt-1">
        Organize and manage your courses
      </p>
    </div>

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      
      <button
        onClick={loadCourses}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md 
        text-gray-700 text-sm font-medium
        hover:bg-gray-100 transition flex items-center justify-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>

      <Link
        href="/lms/Admin_Portal/courses/add"
        className="w-full sm:w-auto px-4 py-2 rounded-md 
        bg-purple-600 text-white text-sm font-medium
        hover:bg-purple-700 transition
        flex items-center justify-center gap-2"
      >
        <HiPlus className="w-4 h-4" />
        Add Course
      </Link>

    </div>
  </div>
</div>


      {/* Search and Filter Section */}
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-6">

  {/* Top Controls */}
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

    {/* Search */}
    <div className="relative flex-1">
      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-md
        focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>

    {/* Filters */}
    <div className="grid grid-cols-2 sm:flex gap-2">

      {/* Status */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 pr-9 py-2.5 text-sm border border-gray-300 rounded-md bg-white
          appearance-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {/* Filter Button */}
      <button className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
        <HiFilter className="w-4 h-4 text-gray-600" />
        <span className="hidden sm:inline">Filters</span>
      </button>

      {/* Export Button */}
      <button className="flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-300 rounded-md text-sm hover:bg-gray-100">
        <HiDocumentDownload className="w-4 h-4 text-gray-600" />
        <span className="hidden sm:inline">Export</span>
      </button>

    </div>
  </div>

  {/* Footer */}
  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <p className="text-xs text-gray-600">
      Showing <span className="font-medium text-gray-900">{filteredCourses.length}</span> of{" "}
      <span className="font-medium text-gray-900">{courses.length}</span> courses
    </p>

    {searchTerm && (
      <button
        onClick={() => setSearchTerm("")}
        className="text-xs text-purple-600 hover:underline"
      >
        Clear search
      </button>
    )}
  </div>

</div>


      {/* Courses Grid/List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-t-purple-600 border-r-purple-600 border-b-purple-300 border-l-purple-300"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching your course data</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiExclamationCircle className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'No courses match your search criteria. Try different keywords or filters.'
              : 'Get started by adding your first course to the system.'
            }
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <Link
              href="/lms/Admin_Portal/courses/add"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
            >
              <HiPlus className="w-5 h-5" />
              <span className="font-medium">Add New Course</span>
            </Link>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredCourses.map((course) => (
    <div
      key={course.id}
      className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition overflow-hidden"
    >

      {/* Header / Image */}
      <div className="h-44 bg-gradient-to-r from-blue-500 to-blue-600 relative">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <HiBookOpen className="w-14 h-14 text-gray-400" />
          </div>
        )}

        {/* Status */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 text-xs rounded-full font-medium ${getStatusColor(course.status)}`}
        >
          {course.status === "active" ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <HiAcademicCap className="w-4 h-4 text-gray-400" />
          {course.instructor}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-600">
            By <span className="font-medium text-gray-800">{course.awardingBody}</span>
          </span>

          {course.rating && (
            <div className="flex items-center gap-1 text-amber-600">
              <HiStar className="w-4 h-4" />
              <span className="font-medium text-gray-900">{course.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Stats — NO SHADOW */}
       <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-5 text-sm">

  <div>
    <span className="block text-gray-500">Duration</span>
    <span className="font-medium text-gray-900">
      {course.duration}
    </span>
  </div>

  <div>
    <span className="block text-gray-500">Credits</span>
    <span className="font-medium text-gray-900">
      {course.credits}
    </span>
  </div>

  <div>
    <span className="block text-gray-500">Enrolled</span>
    <span className="font-medium text-gray-900">
      {course.totalStudents || 0}
    </span>
  </div>

  <div>
    <span className="block text-gray-500">Course Fee</span>
    <span className="font-semibold text-gray-900">
      ${(course.fee || 0).toLocaleString()}
    </span>
  </div>

</div>


        {/* Requirements */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Requirements
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {course.entryRequirements || "No specific requirements"}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Added{" "}
            {new Date(course.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>

          <div className="flex gap-2">
            <Link
              href={`/lms/Admin_Portal/courses/edit/${course.id}`}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Edit
            </Link>

            <button
              onClick={() => handleDelete(course.id)}
              className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  ))}
</div>

      )}

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-10">
        <Link
          href="/lms/Admin_Portal/courses/add"
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <HiPlus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </Link>
      </div>

    </div>
  )
}