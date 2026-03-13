'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Briefcase,
  Star,
  BookOpen,
  FileText,
  Key,
  UserPlus,
  User,
  Wrench,
  ShieldCheck,
  Flame as Fire,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

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

interface Course {
  id: string
  title: string
  category: string
  description: string
  duration: string
  students: string
  level: string
  price: string
  featured: boolean
  rating: number
  reviews: number
  image: string | null
}

interface InstructorFormData {
  name: string
  email: string
  phone: string
  specialization: string
  experience: string
  qualification: string
  bio: string
  status: 'active' | 'inactive'
  rating: number
}

export default function AddInstructor() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<InstructorFormData>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    bio: '',
    status: 'active',
    rating: 4.5
  })
  
  const [selectedCourseId, setSelectedCourseId] = useState('')
  
  // Password state - sirf display ke liye (backend se aayega)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        setFetchError(null)
        
        const response = await fetch('/api/courses?published=true')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch courses')
        }
        
        if (result.success && result.data) {
          setCourses(result.data)
        } else {
          setCourses([])
        }
      } catch (error: any) {
        console.error('Error fetching courses:', error)
        setFetchError(error.message || 'Failed to load courses')
        setCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses()
    // ❌ Password generate nahi ho raha frontend mein
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }
    
    if (!selectedCourseId) {
      alert('Please select a course for the instructor')
      return
    }

    if (!formData.qualification || !formData.specialization || !formData.experience) {
      alert('Please fill in all professional details')
      return
    }

    setLoading(true)
    setSuccessMessage(null)
    setWarningMessage(null)
    setGeneratedPassword('')

    try {
      // ✅ SINGLE API CALL - backend sab karega
      const addResponse = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          specialization: formData.specialization,
          experience: formData.experience,
          qualification: formData.qualification,
          bio: formData.bio || null,
          status: formData.status,
          rating: formData.rating,
          courseId: selectedCourseId
          // ❌ NO password sent - backend generate karega
          // ❌ NO email data - backend handle karega
        })
      })

      const addResult = await addResponse.json()

      if (!addResponse.ok) {
        throw new Error(addResult.error || 'Failed to add instructor')
      }

      // ✅ Password backend se aaya
      if (addResult.data?.password) {
        setGeneratedPassword(addResult.data.password)
      }

      // ✅ Check email status from backend
      if (addResult.data?.emailSent) {
        setSuccessMessage('✅ Instructor added successfully! Login credentials have been sent to their email.')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/lms/Admin_Portal/instructors')
        }, 2000)
      } else {
        // Email failed but instructor added
        setWarningMessage(`
          ⚠️ Instructor added to database but email could not be sent.
          
         
        `)
        setSuccessMessage('Instructor added to database!')
      }

    } catch (error: any) {
      console.error('Error adding instructor:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getCourseIcon = (courseTitle: string) => {
    if (courseTitle.toLowerCase().includes('pipe')) return <Wrench className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
    if (courseTitle.toLowerCase().includes('safety')) return <ShieldCheck className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
    if (courseTitle.toLowerCase().includes('weld')) return <Fire className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
    return <BookOpen className="w-4 h-4" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-lightGrey rounded-xl p-4 sm:p-6 border border-softGrey">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Admin_Portal/instructors"
                className="p-2 text-darkGrey hover:text-darkRoyalBlue hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  Add New Instructor
                </h1>
                <p className="text-sm sm:text-base text-darkGrey mt-1">
                  Add instructor to database - credentials will be emailed automatically
                </p>
              </div>
            </div>
          </div>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: BRAND_COLORS.deepRed }}></div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Warning Message (when email fails) */}
      {warningMessage && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800 whitespace-pre-line">{warningMessage}</p>
        </div>
      )}

      {/* Info Message - Security Notice */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          🔒 Password is auto-generated by server and sent directly to instructor's email. 
          For security, password is only shown here if email delivery fails.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                        placeholder="e.g., Dr. Sarah Johnson"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                        placeholder="e.g., sarah@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                        placeholder="e.g., +92 300 1234567"
                      />
                    </div>
                  </div>

                  {/* Password Field - Display Only */}
                  <div>
                    <label className="block text-sm font-medium text-darkGrey mb-2">
                      Generated Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-darkGrey/50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        readOnly
                        value={generatedPassword || "⏳ Will be generated after submission"}
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg bg-lightGrey font-mono text-sm text-gray-600"
                      />
                      {generatedPassword && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-darkRoyalBlue hover:underline"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-darkGrey/70 mt-1">
                      Password is auto-generated by server
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Professional Details
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                        placeholder="e.g., PhD in Computer Science"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                        placeholder="e.g., Web Development, Data Science"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                        placeholder="e.g., 8 years"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Biography
              </h2>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-darkGrey/50" />
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 text-sm"
                  placeholder="Write a brief biography about the instructor..."
                />
              </div>
            </div>
          </div>

          {/* Right Column - Course Assignment & Status */}
          <div className="space-y-6">
            {/* Course Assignment */}
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Assignment
              </h2>
              
              <div className="space-y-4">
                {loadingCourses ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-darkRoyalBlue"></div>
                    <p className="text-sm text-darkGrey mt-2">Loading courses...</p>
                  </div>
                ) : fetchError ? (
                  <div className="text-center py-4">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-red-600">{fetchError}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="mt-2 text-xs text-darkRoyalBlue hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-4">
                    <BookOpen className="w-12 h-12 mx-auto mb-2" style={{ color: BRAND_COLORS.softGrey }} />
                    <p className="text-sm text-darkGrey">No courses available</p>
                    <p className="text-xs text-darkGrey/70 mt-1">
                      Add courses first to assign instructors
                    </p>
                    <Link 
                      href="/lms/Admin_Portal/courses/add"
                      className="mt-3 inline-block px-4 py-2 bg-darkRoyalBlue text-white rounded-lg text-xs"
                    >
                      Add Course
                    </Link>
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
                          className="w-full pl-10 pr-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white appearance-none text-sm"
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
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}10` }}>
                            {getCourseIcon(selectedCourse.title)}
                          </div>
                          <h4 className="font-medium text-darkGrey text-sm sm:text-base">{selectedCourse.title}</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs sm:text-sm text-darkGrey/70">Category:</span>
                            <span className="text-xs sm:text-sm text-darkGrey">{selectedCourse.category}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs sm:text-sm text-darkGrey/70">Duration:</span>
                            <span className="text-xs sm:text-sm text-darkGrey">{selectedCourse.duration}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs sm:text-sm text-darkGrey/70">Students:</span>
                            <span className="text-xs sm:text-sm text-darkGrey">{selectedCourse.students}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs sm:text-sm text-darkGrey/70">Price:</span>
                            <span className="text-xs sm:text-sm font-medium" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                              {selectedCourse.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg border border-softGrey p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
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
                    className="w-full px-4 py-2.5 border border-softGrey rounded-lg focus:outline-none focus:border-darkRoyalBlue focus:ring-1 focus:ring-darkRoyalBlue/20 bg-white text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
                  <h4 className="font-medium text-darkGrey text-sm sm:text-base mb-2">🔐 Security Note</h4>
                  <ul className="text-xs text-darkGrey/70 space-y-1 list-disc pl-4">
                    <li>Password is generated securely on server</li>
                    <li>Email with credentials sent automatically</li>
                    <li>Password is hashed before storing</li>
                    <li>No plain password stored in database</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Course Count Info */}
            <div className="bg-lightGrey rounded-lg p-4 border border-softGrey">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
                <div>
                  <h4 className="font-medium text-darkGrey text-sm sm:text-base mb-1">
                    📋 Available Courses
                  </h4>
                  <p className="text-xs text-darkGrey/70">
                    {courses.length} course{courses.length !== 1 ? 's' : ''} available in database.
                    {courses.length === 0 && ' Add courses from Course Management.'}
                  </p>
                  {courses.length > 0 && (
                    <Link 
                      href="/lms/Admin_Portal/courses"
                      className="text-xs text-darkRoyalBlue hover:underline mt-2 inline-block"
                    >
                      Manage Courses →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 pt-6 border-t border-softGrey flex flex-col sm:flex-row justify-end gap-3">
          <Link
            href="/lms/Admin_Portal/instructors"
            className="px-6 py-3 border border-darkRoyalBlue text-darkRoyalBlue rounded-lg hover:bg-darkRoyalBlue/5 transition-colors font-medium text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.email || !formData.name || !selectedCourseId || courses.length === 0}
            className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            style={{ 
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white 
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Add Instructor & Send Email
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}