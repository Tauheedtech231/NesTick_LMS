'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,

  Plus,
  Trash2,
 
  ArrowLeft,
  AlertCircle
} from 'lucide-react'
/* eslint-disable */

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

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load course data
  useEffect(() => {
    const loadCourse = () => {
      try {
        const savedCourses = localStorage.getItem('lms_courses')
        if (savedCourses) {
          const courses = JSON.parse(savedCourses)
          const foundCourse = courses.find((c: any) => c.id === courseId)
          
          if (foundCourse) {
            setCourse(foundCourse)
          } else {
            setError('Course not found')
          }
        } else {
          setError('No courses found')
        }
      } catch (err) {
        setError('Error loading course')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const handleAddHighlight = () => {
    setCourse({ ...course, highlights: [...course.highlights, ''] })
  }

  const handleRemoveHighlight = (index: number) => {
    const newHighlights = course.highlights.filter((_: any, i: number) => i !== index)
    setCourse({ ...course, highlights: newHighlights })
  }

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...course.highlights]
    newHighlights[index] = value
    setCourse({ ...course, highlights: newHighlights })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update course
    const updatedCourse = {
      ...course,
      updatedAt: new Date().toISOString()
    }

    // Update localStorage
    const existingCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
    const updatedCourses = existingCourses.map((c: any) => 
      c.id === courseId ? updatedCourse : c
    )
    
    localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))

    alert('Course updated successfully!')
    router.push('/lms/Instructor_Portal/courses')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
          <p className="mt-4 text-darkGrey">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.brightRed }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            {error || 'Course not found'}
          </h3>
          <Link
            href="/lms/Instructor_Portal/courses"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium mt-4"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Courses
          </Link>
        </div>
      </div>
    )
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
                  Edit Course: {course.title}
                </h1>
                <p className="text-darkGrey mt-1">
                  Last updated: {new Date(course.updatedAt).toLocaleDateString()}
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
                    {course.highlights.map((highlight: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
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
                    Rating
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
                    Reviews
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={course.reviews}
                    onChange={(e) => setCourse({ ...course, reviews: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={course.image || ''}
                    onChange={(e) => setCourse({ ...course, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
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
            Update Course
          </button>
        </div>
      </form>
    </div>
  )
}