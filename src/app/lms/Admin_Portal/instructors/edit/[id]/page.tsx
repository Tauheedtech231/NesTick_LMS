'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
 
  Briefcase,
  Star,
  BookOpen,
 
  Save,
  User,
  AlertCircle,
 
  RefreshCw,
  Calendar,
  Clock,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react'


/* eslint-disable */
interface Instructor {
  id: string
  name: string
  email: string
  phone: string | null
  specialization: string
  experience: string
  qualification: string
  bio: string | null
  status: 'active' | 'inactive'
  rating: string | number
  course_id: string | null
  total_students: number
  created_at: string
  updated_at: string
  course_title?: string
  course_duration?: string
  course_category?: string
  last_login?: string | null
  credential_status?: string
  password?: string
}

interface Course {
  id: string
  title: string
  category: string
  duration: string
  level: string
  price: string
}

// Success Popup Component
function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-500">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Success!</h3>
          <p className="mb-6 text-gray-600">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white rounded-lg bg-red-600 hover:bg-red-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// Resend Credentials Modal
function ResendCredentialsModal({ 
  isOpen, 
  onClose, 
  instructor,
  onResend 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  instructor: Instructor | null;
  onResend: (sendToEmail: string, resetPassword: boolean) => Promise<void>;
}) {
  const [sendToEmail, setSendToEmail] = useState(instructor?.email || '');
  const [resetPassword, setResetPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !instructor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    
    try {
      await onResend(sendToEmail, resetPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send credentials');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Resend Credentials</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Instructor:</strong> {instructor.name} ({instructor.email})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send Credentials To
            </label>
            <input
              type="email"
              value={sendToEmail}
              onChange={(e) => setSendToEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
              placeholder="Enter email address"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Credentials will be sent to this email address
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="resetPassword"
              checked={resetPassword}
              onChange={(e) => setResetPassword(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="resetPassword" className="text-sm text-gray-700">
              Reset password and send new credentials
            </label>
          </div>

          {resetPassword && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700">
                ⚠️ A new random password will be generated and sent to the instructor.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Credentials
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditInstructorPage() {
  const params = useParams()
  const router = useRouter()
  const instructorId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  
  // Resend credentials state
  const [showResendModal, setShowResendModal] = useState(false)
  const [resending, setResending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
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

  // Fetch instructor data
  const fetchInstructor = async () => {
    if (!instructorId) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/instructors/${instructorId}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }
      
      if (result.success && result.data) {
        const data = result.data
        setInstructor(data)
        
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          experience: data.experience || '',
          qualification: data.qualification || '',
          bio: data.bio || '',
          status: data.status || 'active',
          rating: typeof data.rating === 'string' ? parseFloat(data.rating) : (data.rating || 4.5)
        })
        
        if (data.course_id) {
          setSelectedCourseId(data.course_id)
        }
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (error: any) {
      console.error('Error fetching instructor:', error)
      setError(error.message || 'Failed to load instructor')
    } finally {
      setLoading(false)
      setInitialFetchDone(true)
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    if (!instructorId) return

    try {
      setLoadingCourses(true)
      
      const response = await fetch('/api/courses?published=true')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch courses')
      }
      
      if (result.success && result.data) {
        setCourses(result.data)
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    if (instructorId) {
      fetchInstructor()
      fetchCourses()
    } else {
      const timer = setTimeout(() => {
        if (!instructorId) {
          setLoading(false)
          setError('No instructor ID provided')
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [instructorId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) || 0 : value
    }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }
    
    setSaving(true)

    try {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          courseId: selectedCourseId || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update instructor')
      }

      setSuccessMessage('✅ Instructor updated successfully!')
      setShowSuccess(true)
      
      setTimeout(() => {
        router.push('/lms/Admin_Portal/instructors')
      }, 1500)

    } catch (error: any) {
      console.error('Error updating instructor:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Handle resend credentials
 // In your EditInstructorPage component, update the handleResendCredentials function:

const handleResendCredentials = async (sendToEmail: string, resetPassword: boolean) => {
  if (!instructor) return;
  
  setResending(true);
  
  try {
    const response = await fetch('/api/instructors/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instructorId: instructor.id,
        email: sendToEmail,
        resetPassword,
        name: instructor.name,
        course: instructor.course_title
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send credentials');
    }

    // Show success message with appropriate text
    const message = resetPassword 
      ? '✅ Password reset successful! New credentials sent.'
      : '✅ Credentials resent successfully!';
    
    setSuccessMessage(message);
    setShowSuccess(true);
    
    // Refresh instructor data
    fetchInstructor();
    
  } catch (error: any) {
    console.error('Error sending credentials:', error);
    alert(`❌ Error: ${error.message}`);
    throw error;
  } finally {
    setResending(false);
  }
};

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || !initialFetchDone) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600">
              {!instructorId ? 'Initializing...' : 'Loading instructor data...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !instructor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Instructor</h3>
          <p className="text-gray-600 mb-4">{error || 'Instructor not found'}</p>
          <Link
            href="/lms/Admin_Portal/instructors"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Instructors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/lms/Admin_Portal/instructors"
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Instructor</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {instructor.name} • ID: {instructor.id.substring(0, 8)}...
                </p>
              </div>
            </div>
            
            {/* Resend Credentials Button */}
            <button
              onClick={() => setShowResendModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Resend Credentials</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="max-w-4xl mx-auto space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 pr-10"
                  readOnly
                />
                <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="+92 323 7594869"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="rating"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(formData.rating) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-red-600" />
            Professional Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                required
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="BS, MS, PhD etc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization *
              </label>
              <input
                type="text"
                name="specialization"
                required
                value={formData.specialization}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="e.g., Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience *
              </label>
              <input
                type="text"
                name="experience"
                required
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                placeholder="e.g., 5 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Students
              </label>
              <input
                type="number"
                value={instructor.total_students || 0}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              placeholder="Write a brief biography..."
            />
          </div>
        </div>

        {/* Course Assignment */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-600" />
            Course Assignment
          </h2>
          
          {loadingCourses ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-red-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading courses...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">No course assigned</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.category})
                  </option>
                ))}
              </select>

              {selectedCourse && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Title:</span>
                      <p className="font-medium">{selectedCourse.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{selectedCourse.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <p className="font-medium">{selectedCourse.duration}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Level:</span>
                      <p className="font-medium">{selectedCourse.level}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status & Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Account Info</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(instructor.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last Updated: {formatDate(instructor.updated_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    instructor.credential_status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    Credentials: {instructor.credential_status || 'active'}
                  </span>
                </div>
                {instructor.last_login && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="w-4 h-4" />
                    <span>Last Login: {formatDate(instructor.last_login)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/lms/Admin_Portal/instructors"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Instructor
              </>
            )}
          </button>
        </div>
      </form>

      {/* Resend Credentials Modal */}
      <ResendCredentialsModal
        isOpen={showResendModal}
        onClose={() => setShowResendModal(false)}
        instructor={instructor}
        onResend={handleResendCredentials}
      />

      {/* Success Popup */}
      {showSuccess && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}