'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { HiArrowLeft, HiAcademicCap, HiCalendar, HiCash, HiChartBar, HiUser, HiMail, HiPhone, HiDocumentText, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi'
import Link from 'next/link'
/* eslint-disable */

interface Student {
  id: string
  studentId: string
  name: string
  email: string
  phone: string
  enrollmentDate: string
  courseId: string
  courseName: string
  status: 'active' | 'graduated' | 'dropped'
  attendance: number
  assignments: Array<{
    id: string
    title: string
    score: number
    submitted: boolean
    dueDate?: string
  }>
  payments: Array<{
    id: string
    amount: number
    date: string
    status: 'PAID' | 'PENDING' | 'FAILED'
    description: string
  }>
  performance: {
    averageScore: number
    completedModules: number
    totalModules: number
    lastActive: string
  }
  engagement: number
  notes: string
}

export default function ViewStudent() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [course, setCourse] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [studentId])

  const loadData = () => {
    // Load student data
    const students = JSON.parse(localStorage.getItem('students') || '[]')
    const foundStudent = students.find((s: Student) => s.id === studentId)
    
    if (!foundStudent) {
      alert('Student not found!')
      router.push('/lms/Admin_Portal/students')
      return
    }

    setStudent(foundStudent)

    // Load course data
    const courses = JSON.parse(localStorage.getItem('courses') || '[]')
    const foundCourse = courses.find((c: any) => c.id === foundStudent.courseId)
    setCourse(foundCourse)
    
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      case 'dropped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-amber-100 text-amber-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/lms/Admin_Portal/students"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Students
            </Link>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/lms/Admin_Portal/students"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
            >
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Students
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Student Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  const totalPaid = student.payments?.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0) || 0
  const totalPending = student.payments?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0) || 0
  const totalFailed = student.payments?.filter(p => p.status === 'FAILED').reduce((sum, p) => sum + p.amount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/lms/Admin_Portal/students"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Students
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600 mt-2">View detailed information and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/lms/Admin_Portal/students/edit/${studentId}`}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <HiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-purple-200">{student.studentId}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(student.status)}`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <HiMail className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <HiPhone className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{student.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <HiAcademicCap className="w-5 h-5 text-purple-600" />
                          <span className="font-bold text-gray-900">{student.courseName || course?.title || 'N/A'}</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <HiCalendar className="w-4 h-4 mr-2" />
                            Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                          </div>
                          {course && (
                            <div className="text-sm text-gray-600">
                              Duration: {course.duration} • Credits: {course.credits}
                            </div>
                          )}
                        </div>
                      </div>
                      {course && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">${course.fee?.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Course Fee</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{student.attendance}%</div>
                      <div className="text-sm text-gray-600">Attendance</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{student.engagement}%</div>
                      <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(student.performance.averageScore)}`}>
                        {student.performance.averageScore}%
                      </div>
                      <div className="text-sm text-gray-600">Avg. Score</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">
                        {student.performance.completedModules}/{student.performance.totalModules}
                      </div>
                      <div className="text-sm text-gray-600">Modules</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {student.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-gray-900">{student.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Stats & Activity */}
            <div className="space-y-6">
              {/* Module Progress */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Module Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-medium text-gray-900">
                      {Math.round((student.performance.completedModules / student.performance.totalModules) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${(student.performance.completedModules / student.performance.totalModules) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {student.performance.completedModules} of {student.performance.totalModules} modules completed
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <HiClock className="w-4 h-4 mr-2" />
                    Last active: {new Date(student.performance.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <HiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Paid</span>
                    </div>
                    <span className="font-medium text-green-600">${totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <HiClock className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="font-medium text-amber-600">${totalPending.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <HiXCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-gray-600">Failed</span>
                    </div>
                    <span className="font-medium text-red-600">${totalFailed.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <Link
                      href="/lms/Admin_Portal/payments"
                      className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      View all payments →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    href={`/lms/Admin_Portal/students/edit/${studentId}`}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    Edit Profile
                  </Link>
                  <button className="block w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all text-sm">
                    Send Message
                  </button>
                  <button className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Assignments
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments & Payments Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button className="px-6 py-3 border-b-2 border-purple-500 text-purple-600 font-medium">
              Assignments
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium">
              Quiz Results
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium">
              Payment History
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium">
              Activity Log
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Assignments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {student.assignments && student.assignments.length > 0 ? (
                  student.assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <HiDocumentText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{assignment.title}</div>
                            {assignment.dueDate && (
                              <div className="text-sm text-gray-500">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.submitted 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {assignment.submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-bold ${getScoreColor(assignment.score)}`}>
                          {assignment.score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.submitted ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-purple-600 hover:text-purple-900">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No assignments found for this student
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}