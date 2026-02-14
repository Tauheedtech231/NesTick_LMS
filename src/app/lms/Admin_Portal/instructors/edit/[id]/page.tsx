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
  AlertCircle,
  ChevronDown
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
  const [showCourseDetails, setShowCourseDetails] = useState(false)

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
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading instructor data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {error}
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            The instructor you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/lms/Admin_Portal/instructors"
            className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Instructors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col xs:flex-row xs:items-center gap-3">
            <Link
              href="/lms/Admin_Portal/instructors"
              className="self-start p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                Edit Instructor
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {formData.name}
              </p>
            </div>
            <div className="xs:hidden h-px bg-gray-200 my-2"></div>
          </div>
          <div className="mt-3 sm:mt-4 h-1 w-12 rounded-full bg-red-600"></div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="max-w-7xl mx-auto">
        {/* Mobile-Optimized Form Layout */}
        <div className="space-y-4 sm:space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              {/* Name - Full width on mobile */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50"
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed (login identifier)</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Password with Generate Button */}
              <div>
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-1.5">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={generateNewPassword}
                    className="self-start xs:self-auto inline-flex items-center gap-1.5 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                    Generate New
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="Leave empty to keep current"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              Professional Details
            </h2>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              {/* Qualification */}
              <div className="xs:col-span-2 sm:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="qualification"
                    required
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="e.g., PhD, Masters"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specialization"
                    required
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="e.g., Web Development"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Experience <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="experience"
                    required
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    placeholder="e.g., 5+ years"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Rating
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="number"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bio - Full Width */}
            <div className="mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Biography
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="Write a brief biography..."
                />
              </div>
            </div>
          </div>

          {/* Course Assignment Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              Course Assignment
            </h2>
            
            {loadingCourses ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-600">Loading courses...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">No courses available</p>
                <Link
                  href="/lms/Admin_Portal/courses/add"
                  className="inline-block mt-3 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Add a course first
                </Link>
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 z-10" />
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white appearance-none"
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Course Details - Collapsible on Mobile */}
                {selectedCourse && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowCourseDetails(!showCourseDetails)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm"
                    >
                      <span className="font-medium text-gray-700">Course Details</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showCourseDetails ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCourseDetails && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                          <span className="text-xs text-gray-500">Title:</span>
                          <span className="text-xs font-medium text-gray-900">{selectedCourse.title}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                          <span className="text-xs text-gray-500">Category:</span>
                          <span className="text-xs text-gray-700">{selectedCourse.category}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                          <span className="text-xs text-gray-500">Duration:</span>
                          <span className="text-xs text-gray-700">{selectedCourse.duration}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-xs text-gray-500">Students:</span>
                          <span className="text-xs text-gray-700">{selectedCourse.students || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Status & Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Quick Info - Mobile Friendly */}
              <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 border border-yellow-100">
                <h4 className="text-xs sm:text-sm font-medium text-yellow-800 mb-2">Quick Info</h4>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs text-yellow-700">
                    <span className="block w-1 h-1 rounded-full bg-yellow-500 mt-1.5"></span>
                    <span>Email cannot be changed (login identifier)</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-yellow-700">
                    <span className="block w-1 h-1 rounded-full bg-yellow-500 mt-1.5"></span>
                    <span>New password requires manual communication</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-yellow-700">
                    <span className="block w-1 h-1 rounded-full bg-yellow-500 mt-1.5"></span>
                    <span>Course changes affect instructor access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions - Mobile Optimized */}
          <div className="flex flex-col-reverse xs:flex-row gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/lms/Admin_Portal/instructors"
              className="flex-1 px-4 py-3 sm:py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !formData.email || !formData.name || !selectedCourseId}
              className="flex-1 px-4 py-3 sm:py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}