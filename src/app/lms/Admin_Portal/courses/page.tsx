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
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = () => {
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
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
      category: course.category || 'General',
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
      (course.category?.toLowerCase() || '').includes(searchLower) ||
      (course.instructor?.toLowerCase() || '').includes(searchLower)
    )
    
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700'
      : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700'
  }

  const getCategoryColor = (category: string) => {
    const colors: {[key: string]: string} = {
      'Technology': 'from-blue-500 to-blue-600',
      'Business': 'from-purple-500 to-purple-600',
      'Science': 'from-green-500 to-green-600',
      'Arts': 'from-amber-500 to-amber-600',
      'Health': 'from-pink-500 to-pink-600',
      'Engineering': 'from-indigo-500 to-indigo-600',
      'General': 'from-gray-500 to-gray-600',
    }
    return colors[category] || 'from-purple-500 to-purple-600'
  }

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">
              Course Management
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Organize and manage all your educational courses
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadCourses}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium text-gray-700">Refresh</span>
            </button>
            <Link
              href="/lms/Admin_Portal/courses/add"
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group"
            >
              <HiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Add New Course</span>
            </Link>
          </div>
        </div>

       
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title, instructor, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-400 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px] appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white min-w-[140px] appearance-none"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <HiFilter className="w-5 h-5 text-gray-600" />
              <span className="font-medium hidden sm:inline">Filters</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <HiDocumentDownload className="w-5 h-5 text-gray-600" />
              <span className="font-medium hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{courses.length}</span> courses
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group hover:-translate-y-1"
            >
              {/* Course Image/Header */}
              <div className={`h-48 bg-gradient-to-r ${getCategoryColor(course.category || 'General')} relative overflow-hidden`}>
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600">
                    <HiBookOpen className="w-20 h-20 text-white/80" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(course.status)} backdrop-blur-sm`}>
                    {course.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 bg-black/60 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                    {course.category}
                  </span>
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <HiAcademicCap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{course.instructor}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      By <span className="font-medium text-gray-700">{course.awardingBody}</span>
                    </div>
                    {course.rating && (
                      <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                        <HiStar className="w-4 h-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {course.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <HiClock className="w-4 h-4" />
                        <span>Duration</span>
                      </div>
                      <div className="font-medium text-gray-900">{course.duration}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Credits</div>
                      <div className="font-medium text-gray-900">{course.credits}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <HiUsers className="w-4 h-4" />
                        <span>Enrolled</span>
                      </div>
                      <div className="font-medium text-gray-900">{course.totalStudents || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Course Fee</div>
                      <div className="text-lg font-bold text-gray-900">
                        ${(course.fee || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entry Requirements Preview */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Requirements</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                    {course.entryRequirements || 'No specific requirements'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Added {new Date(course.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/lms/Admin_Portal/courses/edit/${course.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-100 transition-all shadow-sm hover:shadow text-sm font-medium border border-gray-300"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 transition-all shadow-sm hover:shadow text-sm font-medium border border-red-200"
                    >
                      <HiTrash className="w-4 h-4" />
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

      {/* Pagination/Footer */}
      {filteredCourses.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {Math.min(filteredCourses.length, 6)} of {filteredCourses.length} courses
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <span className="px-3 py-2 text-gray-700">Page 1 of 1</span>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}