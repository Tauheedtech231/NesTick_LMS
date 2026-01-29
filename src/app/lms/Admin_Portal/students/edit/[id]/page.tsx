'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { HiArrowLeft, HiAcademicCap, HiCalendar, HiCash, HiChartBar, HiUser, HiMail, HiPhone } from 'react-icons/hi'
import Link from 'next/link'

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
  }>
  payments: Array<{
    id: string
    amount: number
    date: string
    status: 'PAID' | 'PENDING' | 'FAILED'
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

export default function EditStudent() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    enrollmentDate: '',
    courseId: '',
    status: 'active' as 'active' | 'graduated' | 'dropped',
    attendance: 0,
    engagement: 0,
    notes: '',
    performance: {
      averageScore: 0,
      completedModules: 0,
      totalModules: 12,
      lastActive: ''
    }
  })

  useEffect(() => {
    loadData()
  }, [studentId])

  const loadData = () => {
    // Load student data
    const students = JSON.parse(localStorage.getItem('students') || '[]')
    const student = students.find((s: Student) => s.id === studentId)
    
    if (!student) {
      alert('Student not found!')
      router.push('/lms/Admin_Portal/students')
      return
    }

    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone,
      enrollmentDate: student.enrollmentDate,
      courseId: student.courseId,
      status: student.status,
      attendance: student.attendance,
      engagement: student.engagement,
      notes: student.notes || '',
      performance: student.performance || {
        averageScore: 0,
        completedModules: 0,
        totalModules: 12,
        lastActive: new Date().toISOString().split('T')[0]
      }
    })

    // Load available courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
    
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('performance.')) {
      const perfField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          [perfField]: perfField === 'averageScore' || perfField === 'completedModules' || perfField === 'totalModules' 
            ? parseInt(value) || 0 
            : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'attendance' || name === 'engagement' ? parseInt(value) || 0 : value
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Update student object
    const updatedStudent = {
      id: studentId,
      ...formData,
      updatedAt: new Date().toISOString()
    }

    // Update localStorage
    const students = JSON.parse(localStorage.getItem('students') || '[]')
    const updatedStudents = students.map((student: Student) =>
      student.id === studentId ? updatedStudent : student
    )
    
    localStorage.setItem('students', JSON.stringify(updatedStudents))

    // Show success message
    setTimeout(() => {
      setSaving(false)
      alert('Student updated successfully!')
      router.push('/lms/Admin_Portal/students')
    }, 1000)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/lms/Admin_Portal/students"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Students
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-gray-600 mt-2">Update student information and performance metrics</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., STU2024001"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., +1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Enrollment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Date *
                </label>
                <input
                  type="date"
                  id="enrollmentDate"
                  name="enrollmentDate"
                  required
                  value={formData.enrollmentDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  required
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="attendance" className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance (%)
                </label>
                <input
                  type="number"
                  id="attendance"
                  name="attendance"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="engagement" className="block text-sm font-medium text-gray-700 mb-1">
                  Engagement (%)
                </label>
                <input
                  type="number"
                  id="engagement"
                  name="engagement"
                  min="0"
                  max="100"
                  value={formData.engagement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="performance.averageScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Average Score (%)
                </label>
                <input
                  type="number"
                  id="performance.averageScore"
                  name="performance.averageScore"
                  min="0"
                  max="100"
                  value={formData.performance.averageScore}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="performance.completedModules" className="block text-sm font-medium text-gray-700 mb-1">
                  Completed Modules
                </label>
                <input
                  type="number"
                  id="performance.completedModules"
                  name="performance.completedModules"
                  min="0"
                  value={formData.performance.completedModules}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="performance.totalModules" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Modules
                </label>
                <input
                  type="number"
                  id="performance.totalModules"
                  name="performance.totalModules"
                  min="1"
                  value={formData.performance.totalModules}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="performance.lastActive" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Active
                </label>
                <input
                  type="date"
                  id="performance.lastActive"
                  name="performance.lastActive"
                  value={formData.performance.lastActive}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes & Comments
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Add any notes or comments about this student..."
            />
          </div>

          {/* Quick Stats Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Performance Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formData.attendance}%</div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formData.engagement}%</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formData.performance.averageScore}%</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {formData.performance.completedModules}/{formData.performance.totalModules}
                </div>
                <div className="text-sm text-gray-600">Modules</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Link
                href="/lms/Admin_Portal/students"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </span>
                ) : (
                  'Update Student'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}