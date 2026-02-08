'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Save, X, Plus, Trash2 } from 'lucide-react'
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
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [instructor, setInstructor] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    duration: '',
    students: '',
    level: '',
    price: '',
    originalPrice: '',
    savings: '',
    rating: 0,
    featured: false,
    image: '',
    highlights: [''] as string[]
  })

  useEffect(() => {
    const loadData = () => {
      try {
        const currentUserStr = localStorage.getItem('currentUser')
        if (!currentUserStr) {
          router.push('/lms/auth/login?type=instructor')
          return
        }

        const currentUser = JSON.parse(currentUserStr)
        if (currentUser.role !== 'instructor') {
          router.push('/lms/auth/login?type=instructor')
          return
        }

        setInstructor(currentUser)

        // Load course
        const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
        const foundCourse = courses.find((c: any) => 
          c.id === courseId && (c.id === currentUser.courseId || c.id === currentUser.assignedCourseId)
        )
        
        if (!foundCourse) {
          alert('Course not found or you dont have permission to edit it')
          router.push('/lms/Instructor_Portal/courses')
          return
        }

        setCourse(foundCourse)
        setFormData({
          title: foundCourse.title,
          category: foundCourse.category,
          description: foundCourse.description,
          duration: foundCourse.duration,
          students: foundCourse.students,
          level: foundCourse.level,
          price: foundCourse.price,
          originalPrice: foundCourse.originalPrice || '',
          savings: foundCourse.savings || '',
          rating: foundCourse.rating,
          featured: foundCourse.featured || false,
          image: foundCourse.image || '',
          highlights: foundCourse.highlights && foundCourse.highlights.length > 0 
            ? foundCourse.highlights 
            : ['']
        })
        
      } catch (error) {
        console.error('Error loading course:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId, router])

  const handleAddHighlight = () => {
    setFormData({ ...formData, highlights: [...formData.highlights, ''] })
  }

  const handleRemoveHighlight = (index: number) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index)
    setFormData({ ...formData, highlights: newHighlights })
  }

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.highlights]
    newHighlights[index] = value
    setFormData({ ...formData, highlights: newHighlights })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter course title')
      return
    }
    
    if (!formData.category) {
      alert('Please select category')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Please enter course description')
      return
    }

    setSaving(true)

    try {
      // Update course in localStorage
      const courses = JSON.parse(localStorage.getItem('lms_courses') || '[]')
      const updatedCourses = courses.map((c: any) => {
        if (c.id === courseId) {
          return {
            ...c,
            ...formData,
            highlights: formData.highlights.filter(h => h.trim() !== ''),
            updatedAt: new Date().toISOString()
          }
        }
        return c
      })
      
      localStorage.setItem('lms_courses', JSON.stringify(updatedCourses))

      // Update instructor profile if needed
      const instructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]')
      const updatedInstructors = instructors.map((inst: any) => {
        if (inst.id === instructor.id) {
          return {
            ...inst,
            assignedCourse: {
              id: courseId,
              title: formData.title,
              duration: formData.duration,
              category: formData.category,
              price: formData.price
            }
          }
        }
        return inst
      })
      
      localStorage.setItem('lms_instructors', JSON.stringify(updatedInstructors))

      // Save activity
      const activity = {
        id: `activity_${Date.now()}`,
        type: 'course',
        title: formData.title,
        description: 'Course updated',
        courseId: courseId,
        instructorId: instructor.id,
        timestamp: new Date().toISOString(),
        action: 'updated',
        metadata: formData
      }

      const existingActivities = JSON.parse(localStorage.getItem('instructor_activities') || '[]')
      const updatedActivities = [...existingActivities, activity]
      localStorage.setItem('instructor_activities', JSON.stringify(updatedActivities))

      alert('Course updated successfully!')
      router.push('/lms/Instructor_Portal/courses')
      
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return null
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
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Edit Course
                </h1>
                <p className="text-darkGrey mt-1">
                  Update course information and details
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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
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
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {formData.highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                          placeholder={`Highlight ${index + 1}`}
                        />
                        {formData.highlights.length > 1 && (
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
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
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
                    value={formData.savings}
                    onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
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
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
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
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
            disabled={saving}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}