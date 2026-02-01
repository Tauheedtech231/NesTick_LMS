'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  HiSearch, HiFilter, HiDocumentDownload, HiAcademicCap, 
  HiClock, HiCheckCircle, HiXCircle, HiTrendingUp, 
  HiTrash, HiPencil, HiEye, HiPlus
} from 'react-icons/hi'
import { 
  User, Mail, Phone, Calendar, GraduationCap, 
  DollarSign, TrendingUp as TrendingUpIcon, AlertCircle
} from 'lucide-react'
/* eslint-disable */

interface Student {
  id: string
  learnerId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  cnic: string
  address: string
  city: string
  country: string
  dateOfBirth: string
  gender: string
  highestDegree: string
  institution: string
  graduationYear: string
  marksGPA: string
  courseId: string
  courseName: string
  courseDuration: string
  courseFee: string
  creditHours: string
  paymentStatus: 'pending' | 'approved' | 'rejected'
  paymentMethod: 'online' | 'offline' | 'cash'
  username: string
  registrationDate: string
  status: 'registered' | 'enrolled' | 'graduated' | 'dropped'
  progress: {
    overall: number
    completedModules: number
    totalModules: number
    lastAccess: string
  }
  engagement?: number
  documents?: any[]
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<string[]>([])

  // Load students from localStorage
  const loadStudents = useCallback(() => {
    try {
      setLoading(true)
      const storedStudents = JSON.parse(localStorage.getItem('students') || '[]')
      console.log('Loaded students from localStorage:', storedStudents)
      
      // Transform data if needed
      const formattedStudents = storedStudents.map((student: any) => ({
        ...student,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        engagement: student.engagement || Math.floor(Math.random() * 30) + 70, // Default engagement
      }))
      
      setStudents(formattedStudents)
      setFilteredStudents(formattedStudents)
      
      // Extract unique courses
      const uniqueCourses = Array.from(new Set(
        formattedStudents.map((s: Student) => s.courseName).filter(Boolean)
      ))
     setCourses(uniqueCourses as string[]);

      
    } catch (err) {
      console.error('Error loading students:', err)
      setError('Failed to load students data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  // Filter students
  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(student =>
        (student.firstName?.toLowerCase() || '').includes(term) ||
        (student.lastName?.toLowerCase() || '').includes(term) ||
        (student.email?.toLowerCase() || '').includes(term) ||
        (student.phone?.toLowerCase() || '').includes(term) ||
        (student.courseName?.toLowerCase() || '').includes(term) ||
        (student.learnerId?.toLowerCase() || '').includes(term)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(student => student.courseName === courseFilter)
    }

    setFilteredStudents(filtered)
  }, [searchTerm, statusFilter, courseFilter, students])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'enrolled': 
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'registered': 
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'graduated': 
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'dropped': 
        return 'bg-red-100 text-red-800 border border-red-200'
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'approved': 
        return 'bg-green-100 text-green-800'
      case 'pending': 
        return 'bg-amber-100 text-amber-800'
      case 'rejected': 
        return 'bg-red-100 text-red-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    try {
      const dob = new Date(dateOfBirth)
      const diff = Date.now() - dob.getTime()
      const ageDate = new Date(diff)
      return Math.abs(ageDate.getUTCFullYear() - 1970)
    } catch {
      return 'N/A'
    }
  }

  const calculateProgress = (student: Student) => {
    if (student.progress && student.progress.totalModules > 0) {
      return Math.round((student.progress.completedModules / student.progress.totalModules) * 100)
    }
    return 0
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      const updatedStudents = students.filter(student => student.id !== id)
      localStorage.setItem('students', JSON.stringify(updatedStudents))
      loadStudents() // Reload students
      alert('Student deleted successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Students Management</h1>
            <p className="text-gray-600 mt-2">
              Total Students: <span className="font-semibold">{students.length}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadStudents}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, course, or learner ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="enrolled">Enrolled</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Course Filter */}
          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="all">All Courses</option>
              {courses.map((course, index) => (
                <option key={index} value={course}>{course}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredStudents.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{students.length}</span> students
          </p>
          
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm">
              <HiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">More Filters</span>
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm">
              <HiDocumentDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Students Grid/Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-t-purple-600 border-r-purple-600 border-b-purple-300 border-l-purple-300"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
          <p className="text-sm text-gray-500 mt-1">Fetching student data from system</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'No students match your search criteria. Try different keywords or filters.'
              : 'No students registered yet. Students will appear here after registration.'
            }
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCourseFilter('all')
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
              
              {/* Header with Avatar and Status */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                      {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${getPaymentStatusColor(student.paymentStatus)}`}>
                      {student.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-6 space-y-4">
                {/* Learner ID & Course */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Learner ID:</span>
                      <span className="font-mono font-bold text-purple-700">{student.learnerId}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {formatDate(student.registrationDate)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <HiAcademicCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium truncate">{student.courseName}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{student.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{student.highestDegree || 'N/A'}</span>
                  </div>
                </div>

                {/* CNIC & Age */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block">CNIC:</span>
                    <span className="font-medium text-gray-900">{student.cnic || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Age:</span>
                    <span className="font-medium text-gray-900">{calculateAge(student.dateOfBirth)}</span>
                  </div>
                </div>

                {/* Progress & Engagement */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Course Progress</span>
                      <span className="font-medium text-gray-900">{calculateProgress(student)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          calculateProgress(student) >= 80 ? 'bg-green-500' :
                          calculateProgress(student) >= 50 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${calculateProgress(student)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Engagement:</span>
                    </div>
                    <span className={`font-medium ${
                      (student.engagement || 0) >= 80 ? 'text-green-600' :
                      (student.engagement || 0) >= 60 ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {student.engagement || 0}%
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Course Fee:</span>
                    </div>
                    <span className="font-bold text-gray-900">{student.courseFee || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/lms/Admin_Portal/students/view/${student.id}`}
                    className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <HiEye className="w-4 h-4" />
                    View
                  </Link>
                  
                  <Link
                    href={`/lms/Admin_Portal/students/edit/${student.id}`}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <HiPencil className="w-4 h-4" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                    className="flex-1 px-3 py-2.5 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Responsive Notice */}
      <div className="mt-8 text-center md:hidden">
        <p className="text-sm text-gray-500">
          Swipe left/right to view more information on mobile devices
        </p>
      </div>

      {/* Empty State for Mobile */}
      {!loading && filteredStudents.length === 0 && (
        <div className="md:hidden mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-600">Try searching with different keywords or clear filters</p>
          </div>
        </div>
      )}
    </div>
  )
}