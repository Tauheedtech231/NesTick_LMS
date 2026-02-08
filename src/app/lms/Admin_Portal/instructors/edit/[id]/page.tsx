'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Briefcase,
  Star,
  BookOpen,
  RefreshCw,
  FileText,
  Save,
  User,
  Key,
  AlertCircle
} from 'lucide-react'
/* eslint-disable */

// Brand Colors
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

export default function EditInstructorPage() {
  const params = useParams()
  const router = useRouter()
  const instructorId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    bio: '',
    status: 'active' as 'active' | 'inactive',
    rating: 4.5
  })
  
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  // Load instructor and courses
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load instructor
        const savedInstructors = localStorage.getItem('lms_instructors')
        if (savedInstructors) {
          const instructors = JSON.parse(savedInstructors)
          const foundInstructor = instructors.find((i: any) => i.id === instructorId)
          
          if (foundInstructor) {
            setFormData({
              name: foundInstructor.name,
              email: foundInstructor.email,
              phone: foundInstructor.phone || '',
              specialization: foundInstructor.specialization,
              experience: foundInstructor.experience,
              qualification: foundInstructor.qualification,
              bio: foundInstructor.bio || '',
              status: foundInstructor.status,
              rating: foundInstructor.rating
            })
            
            if (foundInstructor.courseId) {
              setSelectedCourseId(foundInstructor.courseId)
            }
            
            // Load current password from instructor_users
            const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]')
            const user = instructorUsers.find((u: any) => u.email === foundInstructor.email)
            if (user) {
              setCurrentPassword(user.password)
            }
          } else {
            setError('Instructor not found')
          }
        } else {
          setError('No instructors found')
        }

        // Load courses
        const storedCourses = localStorage.getItem('lms_courses')
        if (storedCourses) {
          setCourses(JSON.parse(storedCourses))
        }
      } catch (err) {
        setError('Error loading data')
        console.error(err)
      } finally {
        setLoading(false)
        setLoadingCourses(false)
      }
    }

    if (instructorId) {
      loadData()
    }
  }, [instructorId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) || 0 : value
    }))
  }

  const generateNewPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCurrentPassword(password)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }
    
    setSaving(true)

    try {
      // Get selected course details
      const selectedCourse = courses.find(c => c.id === selectedCourseId)
      
      // Update instructor in lms_instructors
      const savedInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]')
      const updatedInstructors = savedInstructors.map((instructor: any) => {
        if (instructor.id === instructorId) {
          return {
            ...instructor,
            ...formData,
            assignedCourse: selectedCourse ? {
              id: selectedCourse.id,
              title: selectedCourse.title,
              category: selectedCourse.category,
              duration: selectedCourse.duration
            } : null,
            courseId: selectedCourseId,
            updatedAt: new Date().toISOString()
          }
        }
        return instructor
      })
      
      localStorage.setItem('lms_instructors', JSON.stringify(updatedInstructors))

      // Update password in instructor_users if changed
      if (currentPassword) {
        const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]')
        const updatedUsers = instructorUsers.map((user: any) => {
          if (user.email === formData.email) {
            return {
              ...user,
              password: currentPassword,
              name: formData.name,
              phone: formData.phone,
              status: formData.status,
              courseId: selectedCourseId
            }
          }
          return user
        })
        
        localStorage.setItem('instructor_users', JSON.stringify(updatedUsers))
      }

      alert(`
✅ Instructor Updated Successfully!

Instructor Details:
• Name: ${formData.name}
• Email: ${formData.email}
• Course: ${selectedCourse?.title || 'Not assigned'}
• Status: ${formData.status}

${currentPassword !== '' ? `New Password: ${currentPassword}\nPlease inform the instructor of their new password.` : 'Password remains unchanged.'}
      `)

      // Redirect to instructors list
      router.push('/lms/Admin_Portal/instructors')

    } catch (error: any) {
      console.error('Error updating instructor:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-darkRoyalBlue"></div>
          <p className="mt-4 text-darkGrey">Loading instructor data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: BRAND_COLORS.brightRed }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: BRAND_COLORS.darkGrey }}>
            {error}
          </h3>
          <Link
            href="/lms/Admin_Portal/instructors"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium mt-4"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Instructors
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
                href="/lms/Admin_Portal/instructors"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Edit Instructor: {formData.name}
                </h1>
                <p className="text-darkGrey mt-1">
                  Update instructor details and course assignment
                </p>
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-darkGrey">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={generateNewPassword}
                        className="flex items-center gap-1 text-sm text-darkRoyalBlue hover:text-darkRoyalBlue/80"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Generate New
                      </button>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="text"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg font-mono"
                        placeholder="Leave empty to keep current password"
                      />
                    </div>
                    <p className="text-xs text-darkGrey/70 mt-1">
                      Generate new password or leave as is
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Professional Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Qualification *
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="text"
                        name="qualification"
                        required
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Specialization *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="text"
                        name="specialization"
                        required
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Experience *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="text"
                        name="experience"
                        required
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Rating (1-5)
                    </label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type="number"
                        name="rating"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Biography
              </h2>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-darkGrey/50" />
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Course Assignment & Status */}
          <div className="space-y-6">
            {/* Course Assignment */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Assignment
              </h2>
              
              <div className="space-y-4">
                {loadingCourses ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-darkRoyalBlue"></div>
                    <p className="text-sm text-darkGrey mt-2">Loading courses...</p>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                    <p className="text-sm text-darkGrey">No courses available</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-darkGrey mb-2">
                        Select Course *
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                        <select
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white appearance-none"
                        >
                          <option value="">Select a course</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.title} ({course.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {selectedCourse && (
                      <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
                        <h4 className="font-medium text-darkGrey mb-2">Selected Course Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-darkGrey/70">Title:</span>
                            <span className="text-sm font-medium text-darkGrey">{selectedCourse.title}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-darkGrey/70">Category:</span>
                            <span className="text-sm text-darkGrey">{selectedCourse.category}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-darkGrey/70">Duration:</span>
                            <span className="text-sm text-darkGrey">{selectedCourse.duration}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-darkGrey/70">Students:</span>
                            <span className="text-sm text-darkGrey">{selectedCourse.students}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg border border-softGrey p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Status & Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-darkGrey mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
                  <h4 className="font-medium text-darkGrey mb-2">Update Summary</h4>
                  <ol className="text-sm text-darkGrey/70 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-lightGrey border border-softGrey flex items-center justify-center text-xs">
                        1
                      </div>
                      <span>Update instructor details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-lightGrey border border-softGrey flex items-center justify-center text-xs">
                        2
                      </div>
                      <span>Update course assignment</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-lightGrey border border-softGrey flex items-center justify-center text-xs">
                        3
                      </div>
                      <span>Save changes to system</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
              <h4 className="font-medium text-darkGrey mb-2">Quick Info</h4>
              <div className="space-y-2 text-sm text-darkGrey/70">
                <p>• Email cannot be changed (login identifier)</p>
                <p>• New password requires manual communication</p>
                <p>• Course changes affect instructor access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-softGrey flex justify-end gap-4">
          <Link
            href="/lms/Admin_Portal/instructors"
            className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.email || !formData.name || !selectedCourseId}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Instructor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}