'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  BookOpen,
  Clock,
  Users,
  DollarSign,
  Star,
  ArrowLeft
} from 'lucide-react'

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  teal: '#1FB6C9',
  brightRed: '#D32F2F'
}

export default function AddCoursePage() {
  const router = useRouter()
  
  const [course, setCourse] = useState({
    title: '',
    category: '',
    description: '',
    duration: '',
    students: '',
    level: 'Beginner',
    price: '',
    originalPrice: '',
    savings: '',
    rating: 4.5,
    reviews: 0,
    featured: false,
    image: '',
    highlights: ['']  // Start with one empty highlight
  })

  const handleAddHighlight = () => {
    setCourse({ ...course, highlights: [...course.highlights, ''] })
  }

  const handleRemoveHighlight = (index: number) => {
    const newHighlights = course.highlights.filter((_, i) => i !== index)
    setCourse({ ...course, highlights: newHighlights })
  }

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...course.highlights]
    newHighlights[index] = value
    setCourse({ ...course, highlights: newHighlights })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate unique ID
    const courseId = course.title.toLowerCase().replace(/\s+/g, '-')
    
    const newCourse = {
      id: courseId,
      ...course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: []  // Start with empty modules
    }

    // Save to localStorage
    const existingCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const updatedCourses = [...existingCourses, newCourse]
    localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))

    alert('Course added successfully!')
    router.push('/lms/Instructor_Portal/courses')
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-lightGrey rounded-xl p-6 border border-softGrey">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Instructor_Portal/courses"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Add New Course
                </h1>
                <p className="text-darkGrey mt-1">
                  Create a new course with all details and settings
                </p>
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., Professional Welding Course"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={course.category}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Technical Training">Technical Training</option>
                      <option value="Safety Training">Safety Training</option>
                      <option value="Soft Skills">Soft Skills</option>
                      <option value="Certification">Certification</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Level *
                    </label>
                    <select
                      required
                      value={course.level}
                      onChange={(e) => setCourse({ ...course, level: e.target.value })}
                      className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="Describe the course in detail..."
                  />
                </div>

                {/* Highlights */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-darkGrey">
                      Course Highlights
                    </label>
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="flex items-center gap-1 text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80"
                    >
                      <Plus className="w-4 h-4" />
                      Add Highlight
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {course.highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                          placeholder={`Highlight ${index + 1}`}
                        />
                        {course.highlights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(index)}
                            className="p-2 text-brightRed hover:bg-brightRed/5 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Settings */}
          <div className="space-y-6">
            {/* Duration & Students */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={course.duration}
                    onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., 8 Weeks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Student Capacity *
                  </label>
                  <input
                    type="text"
                    required
                    value={course.students}
                    onChange={(e) => setCourse({ ...course, students: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., Max 20 per batch"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Pricing
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Current Price *
                  </label>
                  <input
                    type="text"
                    required
                    value={course.price}
                    onChange={(e) => setCourse({ ...course, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., PKR 25,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Original Price
                  </label>
                  <input
                    type="text"
                    value={course.originalPrice}
                    onChange={(e) => setCourse({ ...course, originalPrice: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., PKR 30,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Savings Text
                  </label>
                  <input
                    type="text"
                    value={course.savings}
                    onChange={(e) => setCourse({ ...course, savings: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="e.g., Save PKR 5,000"
                  />
                </div>
              </div>
            </div>

            {/* Ratings & Featured */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-darkGrey">Featured Course</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={course.featured}
                      onChange={(e) => setCourse({ ...course, featured: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deepRed"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Initial Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={course.rating}
                    onChange={(e) => setCourse({ ...course, rating: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={course.image}
                    onChange={(e) => setCourse({ ...course, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-softGrey flex justify-end gap-4">
          <Link
            href="/lms/Instructor_Portal/courses"
            className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <Save className="w-5 h-5" />
            Save Course
          </button>
        </div>
      </form>
    </div>
  )
}