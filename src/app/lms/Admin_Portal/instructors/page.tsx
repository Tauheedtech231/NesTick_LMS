/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
/* eslint-enable */

import { 
  HiPlus, HiSearch,
  HiFilter, HiDocumentDownload, HiAcademicCap,
  HiStar, HiUsers, HiMail,
  HiPhone
} from 'react-icons/hi'


interface Instructor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  experience: string
  qualification: string
  status: 'active' | 'inactive'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignedCourses?: any[]
  assignedCourseIds?: string[]
  courses?: string[] // For backward compatibility
  rating: number
  students: number
  bio: string
  createdAt?: string
}


export default function InstructorsList() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const storedInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    
    setInstructors(storedInstructors)
    setCourses(storedCourses)
    setLoading(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this instructor?')) {
      const updatedInstructors = instructors.filter(instructor => instructor.id !== id)
      localStorage.setItem('instructors', JSON.stringify(updatedInstructors))
      
      // Also remove from instructorUsers
      const existingInstructorUsers = JSON.parse(localStorage.getItem('instructorUsers') || '[]')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedUsers = existingInstructorUsers.filter((user: any) => user.id !== id)
      localStorage.setItem('instructorUsers', JSON.stringify(updatedUsers))
      
      setInstructors(updatedInstructors)
    }
  }

  // Get course names - handle both old and new formats
  const getCourseNames = (instructor: Instructor) => {
    let courseIds: string[] = []
    
    // Check for assignedCourseIds (new format)
    if (instructor.assignedCourseIds && instructor.assignedCourseIds.length > 0) {
      courseIds = instructor.assignedCourseIds
    }
    // Check for courses (old format)
    else if (instructor.courses && instructor.courses.length > 0) {
      courseIds = instructor.courses
    }
    
    // Get course names
    return courseIds
      .map(id => courses.find(c => c.id === id)?.title || 'Unknown Course')
      .join(', ')
  }

  // Get course IDs for an instructor
  const getCourseIds = (instructor: Instructor): string[] => {
    if (instructor.assignedCourseIds && instructor.assignedCourseIds.length > 0) {
      return instructor.assignedCourseIds
    }
    if (instructor.courses && instructor.courses.length > 0) {
      return instructor.courses
    }
    return []
  }

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Instructors Management</h1>
          <p className="text-gray-600 mt-2">Manage instructor profiles and course assignments ({instructors.length} instructors)</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <Link
            href="/lms/Admin_Portal/instructors/add"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            Add Instructor
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search instructors by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <HiFilter className="w-5 h-5 mr-2 text-gray-600" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <HiDocumentDownload className="w-5 h-5 mr-2 text-gray-600" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading instructors...</p>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-md">
            <HiAcademicCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredInstructors.map((instructor) => {
            const courseIds = getCourseIds(instructor)
            
            return (
              <div key={instructor.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Instructor Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {instructor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{instructor.name}</h3>
                        <p className="text-sm text-gray-600">{instructor.qualification}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      instructor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {instructor.status}
                    </span>
                  </div>
                </div>

                {/* Instructor Details */}
                <div className="p-6 space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <HiMail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 text-sm">{instructor.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <HiPhone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 text-sm">{instructor.phone}</span>
                    </div>
                  </div>

                  {/* Specialization and Experience */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium text-gray-900">{instructor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-900">{instructor.experience}</p>
                    </div>
                  </div>

                  {/* Rating and Students */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <div className="flex items-center">
                        <HiStar className="w-4 h-4 text-amber-500 mr-1" />
                        <span className="font-medium text-gray-900">{instructor.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <div className="flex items-center">
                        <HiUsers className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="font-medium text-gray-900">{instructor.students}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Courses */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Assigned Courses</p>
                    <div className="flex flex-wrap gap-2">
                      {courseIds.length > 0 ? (
                        <>
                          {courseIds.slice(0, 2).map((courseId, index) => {
                            const course = courses.find(c => c.id === courseId)
                            return course ? (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                {course.title}
                              </span>
                            ) : null
                          })}
                          {courseIds.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{courseIds.length - 2} more
                            </span>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No courses assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-900 text-sm line-clamp-3">
                      {instructor.bio}
                    </p>
                  </div>
                  
                  {/* Created Date */}
                  {instructor.createdAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Joined</p>
                      <p className="text-gray-900 text-sm">
                        {new Date(instructor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Link
                      href={`/lms/Admin_Portal/instructors/edit/${instructor.id}`}
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(instructor.id)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      Delete
                    </button>
                    <Link
                      href={`/lms/Admin_Portal/instructors/view/${instructor.id}`}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all text-sm text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      {!loading && instructors.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">Instructors Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
              <p className="text-sm opacity-90">Total Instructors</p>
              <p className="text-2xl font-bold">{instructors.length}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
              <p className="text-sm opacity-90">Active Instructors</p>
              <p className="text-2xl font-bold">
                {instructors.filter(i => i.status === 'active').length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
              <p className="text-sm opacity-90">Avg. Rating</p>
              <p className="text-2xl font-bold">
                {instructors.length > 0 
                  ? (instructors.reduce((sum, i) => sum + i.rating, 0) / instructors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg">
              <p className="text-sm opacity-90">Total Students</p>
              <p className="text-2xl font-bold">
                {instructors.reduce((sum, i) => sum + i.students, 0)}
              </p>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Instructors with Courses</p>
                <p className="text-lg font-bold text-gray-900">
                  {instructors.filter(instructor => {
                    const courseIds = getCourseIds(instructor)
                    return courseIds.length > 0
                  }).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Average Students per Instructor</p>
                <p className="text-lg font-bold text-gray-900">
                  {instructors.length > 0 
                    ? Math.round(instructors.reduce((sum, i) => sum + i.students, 0) / instructors.length)
                    : 0
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Latest Addition</p>
                <p className="text-lg font-bold text-gray-900">
                  {instructors.length > 0 
                    ? new Date(Math.max(...instructors
                        .map(i => i.createdAt ? new Date(i.createdAt).getTime() : 0)
                      )).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}