'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiArrowLeft, HiPlus, HiMinus } from 'react-icons/hi'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'
/* eslint-disable */

export default function AddInstructor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    bio: '',
    status: 'active' as 'active' | 'inactive',
    rating: 4.5,
    students: 0
  })
  const [assignedCourses, setAssignedCourses] = useState<string[]>([])
  const [courses, setCourses] = useState<any[]>([])

  // Load available courses
  useState(() => {
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    setCourses(storedCourses)
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'students' ? parseFloat(value) || 0 : value
    }))
  }

  const toggleCourseAssignment = (courseId: string) => {
    setAssignedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Generate unique ID
    const instructorId = uuidv4()
    
    // Create instructor object
    const newInstructor = {
      id: instructorId,
      ...formData,
      courses: assignedCourses,
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    const existingInstructors = JSON.parse(localStorage.getItem('instructors') || '[]')
    localStorage.setItem('instructors', JSON.stringify([...existingInstructors, newInstructor]))

    // Show success message
    setTimeout(() => {
      setLoading(false)
      alert('Instructor added successfully!')
      router.push('/lms/Admin_Portal/instructors')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/lms/Admin_Portal/instructors"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Instructors
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Instructor</h1>
          <p className="text-gray-600 mt-2">Add a new instructor profile to the system</p>
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
                  placeholder="e.g., Dr. Sarah Johnson"
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
                  placeholder="e.g., sarah@example.com"
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

              <div>
                <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                  Qualification *
                </label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  required
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., PhD in Computer Science"
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Web Development, Data Science"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  Experience *
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 8 years"
                />
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 4.5"
                />
              </div>

              <div>
                <label htmlFor="students" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Students
                </label>
                <input
                  type="number"
                  id="students"
                  name="students"
                  min="0"
                  value={formData.students}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Biography
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Write a brief biography about the instructor..."
            />
          </div>

          {/* Course Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => toggleCourseAssignment(course.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    assignedCourses.includes(course.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{course.awardingBody}</p>
                    </div>
                    {assignedCourses.includes(course.id) ? (
                      <HiMinus className="w-5 h-5 text-purple-600" />
                    ) : (
                      <HiPlus className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No courses available. Please add courses first.
                </div>
              )}
            </div>
            {assignedCourses.length > 0 && (
              <p className="text-sm text-purple-600 mt-2">
                {assignedCourses.length} course(s) selected
              </p>
            )}
          </div>

          {/* Status */}
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
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <Link
                href="/lms/Admin_Portal/instructors"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Instructor...
                  </span>
                ) : (
                  'Add Instructor'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}