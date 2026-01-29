'use client'

import { useState, useEffect } from 'react'
import { 
  HiSearch, HiFilter, HiDocumentDownload,
  HiAcademicCap, HiClock, HiCheckCircle,
  HiXCircle, HiTrendingUp
} from 'react-icons/hi'

interface Student {
  id: string
  name: string
  email: string
  phone: string
  enrollmentDate: string
  course: string
  status: 'active' | 'graduated' | 'dropped'
  payments: {
    total: number
    paid: number
    pending: number
  }
  performance: {
    averageScore: number
    completedModules: number
    totalModules: number
  }
  engagement: number
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load sample data
    const sampleStudents: Student[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234 567 8900',
        enrollmentDate: '2024-01-15',
        course: 'Web Development Bootcamp',
        status: 'active',
        payments: { total: 2999, paid: 2999, pending: 0 },
        performance: { averageScore: 85, completedModules: 8, totalModules: 12 },
        engagement: 92
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 234 567 8901',
        enrollmentDate: '2024-02-20',
        course: 'Data Science Fundamentals',
        status: 'active',
        payments: { total: 3499, paid: 2000, pending: 1499 },
        performance: { averageScore: 78, completedModules: 6, totalModules: 10 },
        engagement: 85
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+1 234 567 8902',
        enrollmentDate: '2023-11-10',
        course: 'Digital Marketing Mastery',
        status: 'graduated',
        payments: { total: 2499, paid: 2499, pending: 0 },
        performance: { averageScore: 91, completedModules: 10, totalModules: 10 },
        engagement: 95
      },
      {
        id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '+1 234 567 8903',
        enrollmentDate: '2024-03-05',
        course: 'Mobile App Development',
        status: 'active',
        payments: { total: 3999, paid: 1500, pending: 2499 },
        performance: { averageScore: 72, completedModules: 3, totalModules: 14 },
        engagement: 65
      }
    ]

    setStudents(sampleStudents)
    setLoading(false)
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      case 'dropped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Students Management</h1>
        <p className="text-gray-600 mt-2">Manage student records, track performance and engagement</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, email, or course..."
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

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-xl shadow-md">
            <HiAcademicCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Student Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-6 space-y-4">
                {/* Course */}
                <div className="flex items-center space-x-3">
                  <HiAcademicCap className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium text-gray-900 truncate">{student.course}</p>
                  </div>
                </div>

                {/* Enrollment Date */}
                <div className="flex items-center space-x-3">
                  <HiClock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Enrollment Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Performance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Performance</p>
                    <p className="font-medium text-gray-900">{student.performance.averageScore}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        student.performance.averageScore >= 80 ? 'bg-green-500' :
                        student.performance.averageScore >= 60 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${student.performance.averageScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Module Completion */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Modules Completed</p>
                    <p className="font-medium text-gray-900">
                      {student.performance.completedModules}/{student.performance.totalModules}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                      style={{ 
                        width: `${(student.performance.completedModules / student.performance.totalModules) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="flex items-center space-x-3">
                  <HiTrendingUp className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Engagement Rate</p>
                    <p className="font-medium text-gray-900">{student.engagement}%</p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className="font-medium text-gray-900">
                        ${student.payments.paid.toLocaleString()} of ${student.payments.total.toLocaleString()}
                      </p>
                    </div>
                    {student.payments.pending === 0 ? (
                      <HiCheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <HiXCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {student.payments.pending > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      ${student.payments.pending.toLocaleString()} pending
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
  <div className="flex space-x-3">
    <button
      onClick={() => window.location.href = `/lms/Admin_Portal/students/view/${student.id}`}
      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
    >
      View Details
    </button>
    <button
      onClick={() => window.location.href = `/lms/Admin_Portal/students/edit/${student.id}`}
      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all text-sm"
    >
      Edit
    </button>
  </div>
</div>

            </div>
          ))
        )}
      </div>

    
    </div>
  )
}