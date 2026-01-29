'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiArrowLeft, HiUpload } from 'react-icons/hi'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

export default function AddCourse() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    credits: 0,
    fee: 0,
    awardingBody: '',
    entryRequirements: '',
    status: 'active' as 'active' | 'inactive',
    image: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' || name === 'fee' ? parseFloat(value) || 0 : value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Generate unique ID
    const courseId = uuidv4()
    
    // Create course object
    const newCourse = {
      id: courseId,
      ...formData,
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]')
    localStorage.setItem('courses', JSON.stringify([...existingCourses, newCourse]))

    // Show success message
    setTimeout(() => {
      setLoading(false)
      alert('Course added successfully!')
      router.push('/lms/Admin_Portal/courses')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/lms/Admin_Portal/courses"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-2"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Course</h1>
          <p className="text-gray-600 mt-2">Create a new course for your institution</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image
            </label>
            <div className="flex items-center space-x-4">
              {formData.image ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden border">
                  <img
                    src={formData.image}
                    alt="Course preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg border-2 border-dashed border-purple-300 flex flex-col items-center justify-center">
                  <HiUpload className="w-8 h-8 text-purple-400 mb-2" />
                  <span className="text-sm text-purple-600">Upload image</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <HiUpload className="w-5 h-5 mr-2" />
                  {formData.image ? 'Change Image' : 'Upload Image'}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 800x600px, JPG or PNG
                </p>
              </div>
            </div>
          </div>

          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Web Development Bootcamp"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe the course content, objectives, and learning outcomes"
            />
          </div>

          {/* Duration and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                required
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 6 months, 12 weeks"
              />
            </div>
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                Total Credits *
              </label>
              <input
                type="number"
                id="credits"
                name="credits"
                required
                min="0"
                step="0.5"
                value={formData.credits}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 120"
              />
            </div>
          </div>

          {/* Fee and Awarding Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
                Course Fee ($) *
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                required
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 2999.99"
              />
            </div>
            <div>
              <label htmlFor="awardingBody" className="block text-sm font-medium text-gray-700 mb-1">
                Awarding Body *
              </label>
              <input
                type="text"
                id="awardingBody"
                name="awardingBody"
                required
                value={formData.awardingBody}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., University of Technology"
              />
            </div>
          </div>

          {/* Entry Requirements */}
          <div>
            <label htmlFor="entryRequirements" className="block text-sm font-medium text-gray-700 mb-1">
              Entry Requirements
            </label>
            <textarea
              id="entryRequirements"
              name="entryRequirements"
              rows={3}
              value={formData.entryRequirements}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., High school diploma, basic programming knowledge"
            />
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
                href="/lms/Admin_Portal/courses"
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
                    Adding Course...
                  </span>
                ) : (
                  'Add Course'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}