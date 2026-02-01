/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen,
  GraduationCap, FileText, DollarSign, Lock, CheckCircle,
  AlertCircle, Upload, Eye, EyeOff, ArrowLeft, CreditCard,
  Smartphone, Loader2, Shield, Globe, Building
} from 'lucide-react'

// Define step types
type RegistrationStep = 'personal' | 'academic' | 'payment'

// Define payment method types
type PaymentMethod = 'online' | 'offline' | 'cash'

export default function RegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('offline')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofName, setPaymentProofName] = useState('')
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan',
    dateOfBirth: '',
    gender: '',
    cnic: '',
    
    // Academic Information
    highestDegree: '',
    institution: '',
    graduationYear: '',
    marksGPA: '',
    fieldOfStudy: '',
    workExperience: '',
    currentJobTitle: '',
    
    // Documents (Optional)
    documents: [] as File[],
    documentNames: [] as string[],
    
    // Course Info (auto-filled)
    courseId: courseId || '',
    courseName: '',
    courseDuration: '',
    courseFee: '',
    creditHours: '',
    category: '',
    level: '',
    
    // Payment
    paymentStatus: 'pending' as 'pending' | 'approved' | 'rejected',
    paymentMethod: 'offline' as PaymentMethod,
    paymentProof: '',
    transactionId: '',
    
    // System Generated (will be generated on submission)
    learnerId: '',
    username: '',
    password: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Load course data from localStorage
  useEffect(() => {
    if (courseId) {
      try {
        // Try to get from localStorage courses
        const courses = JSON.parse(localStorage.getItem('courses') || '[]')
        const course = courses.find((c: any) => c.id === courseId)
        
        if (course) {
          setFormData(prev => ({
            ...prev,
            courseName: course.title || '',
            courseDuration: course.duration || '',
            courseFee: course.currentPrice || course.fee || '',
            creditHours: course.creditHours || '',
            category: course.category || '',
            level: course.level || '',
          }))
        }
        
        // Try to get from localStorage inquiries
        const inquiries = JSON.parse(localStorage.getItem('courseInquiries') || '[]')
        const inquiry = inquiries.find((inv: any) => inv.courseId === courseId)
        
        if (inquiry) {
          setFormData(prev => ({
            ...prev,
            firstName: inquiry.name?.split(' ')[0] || '',
            lastName: inquiry.name?.split(' ').slice(1).join(' ') || '',
            email: inquiry.email || '',
            phone: inquiry.phone || '',
          }))
        }
        
      } catch (error) {
        console.error('Error loading course data:', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
      setErrorMessage('No course selected. Please select a course first.')
    }
  }, [courseId])

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const generateLearnerId = () => {
    return `STU${Date.now().toString().slice(-8)}`
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked ? 'approved' : 'pending'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types and sizes (optional)
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`Invalid file type for ${file.name}. Only PDF, JPG, PNG, DOC, DOCX are allowed.`)
        return false
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return false
      }
      
      return true
    })
    
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles],
      documentNames: [...prev.documentNames, ...validFiles.map(f => f.name)]
    }))
  }

  const handlePaymentProofUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    const maxSize = 5 * 1024 * 1024
    
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Only PDF, JPG, PNG are allowed.')
      return
    }
    
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 5MB.')
      return
    }
    
    setPaymentProof(file)
    setPaymentProofName(file.name)
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
      documentNames: prev.documentNames.filter((_, i) => i !== index)
    }))
  }

  const validateStep = (step: RegistrationStep): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (step === 'personal') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number'
      }
      
      if (!formData.cnic.trim()) {
        newErrors.cnic = 'CNIC is required'
      } else {
        const cleanCNIC = formData.cnic.replace(/\D/g, '')
        if (cleanCNIC.length !== 13) {
          newErrors.cnic = 'CNIC must be 13 digits'
        }
      }
      
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      if (!formData.gender) newErrors.gender = 'Gender is required'
    }
    
    if (step === 'academic') {
      if (!formData.highestDegree) newErrors.highestDegree = 'Highest degree is required'
      if (!formData.institution.trim()) newErrors.institution = 'Institution name is required'
      if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required'
      
      // Documents are optional, so no validation needed
    }
    
    if (step === 'payment') {
      if (paymentMethod === 'offline' && !paymentProof) {
        newErrors.paymentProof = 'Payment proof screenshot is required'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 'personal') setCurrentStep('academic')
      else if (currentStep === 'academic') setCurrentStep('payment')
    }
  }

  const prevStep = () => {
    if (currentStep === 'academic') setCurrentStep('personal')
    else if (currentStep === 'payment') setCurrentStep('academic')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    
    if (!validateStep('payment')) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Generate system fields
      const learnerId = generateLearnerId()
      const username = formData.email?.split('@')[0] || `student_${Date.now().toString().slice(-6)}`
      const password = generatePassword()
      const transactionId = `TXN${Date.now().toString().slice(-10)}`
      
      // Store only file metadata, not the actual file data
      const documentsMetadata = formData.documents.map((file, index) => ({
        name: formData.documentNames[index],
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        id: `doc_${Date.now()}_${index}`
      }))
      
      // For payment proof, also store only metadata
      const paymentProofMetadata = paymentProof ? {
        name: paymentProofName,
        type: paymentProof.type,
        size: paymentProof.size,
        uploadedAt: new Date().toISOString(),
        id: `payment_${Date.now()}`
      } : null
      
      // Create student object WITHOUT large base64 data
      const studentData = {
        id: `student_${Date.now()}`,
        learnerId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        cnic: formData.cnic,
        highestDegree: formData.highestDegree,
        institution: formData.institution,
        graduationYear: formData.graduationYear,
        marksGPA: formData.marksGPA,
        fieldOfStudy: formData.fieldOfStudy,
        workExperience: formData.workExperience,
        currentJobTitle: formData.currentJobTitle,
        courseId: formData.courseId,
        courseName: formData.courseName,
        courseDuration: formData.courseDuration,
        courseFee: formData.courseFee,
        creditHours: formData.creditHours,
        category: formData.category,
        level: formData.level,
        paymentStatus: paymentMethod === 'offline' ? 'pending' : 'pending',
        paymentMethod,
        paymentProof: paymentProofMetadata,
        transactionId,
        username,
        password,
        registrationDate: new Date().toISOString(),
        status: 'registered',
        progress: {
          overall: 0,
          completedModules: 0,
          totalModules: 10,
          lastAccess: new Date().toISOString()
        },
        documents: documentsMetadata,
        hasFiles: formData.documents.length > 0 || paymentProof !== null
      }
      
      // 🔴 Store Student in localStorage
      try {
        const existingStudents = JSON.parse(localStorage.getItem('students') || '[]')
        const updatedStudents = [studentData, ...existingStudents]
        localStorage.setItem('students', JSON.stringify(updatedStudents))
      } catch (storageError) {
        console.warn('LocalStorage quota exceeded, using fallback storage')
        // Fallback: Store in sessionStorage
        sessionStorage.setItem('recent_student', JSON.stringify(studentData))
      }
      
      // 🔴 Store Student Credentials in studentAuth localStorage
      try {
        const studentAuthData = {
          id: studentData.id,
          learnerId,
          email: formData.email,
          username: username,
          password: password,
          fullName: `${formData.firstName} ${formData.lastName}`,
          role: 'student',
          course: formData.courseName,
          courseId: formData.courseId,
          registrationDate: new Date().toISOString(),
          status: 'active',
          lastLogin: null
        }
        
        const existingAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]')
        const updatedAuth = [studentAuthData, ...existingAuth]
        localStorage.setItem('studentAuth', JSON.stringify(updatedAuth))
      } catch (authError) {
        console.warn('Could not save auth data:', authError)
      }
      
      // Update inquiry status if exists
      try {
        const inquiries = JSON.parse(localStorage.getItem('courseInquiries') || '[]')
        const updatedInquiries = inquiries.map((inquiry: any) => {
          if (inquiry.email === formData.email && inquiry.courseId === formData.courseId) {
            return {
              ...inquiry,
              status: 'registered',
              registrationDate: new Date().toISOString(),
              studentId: studentData.id
            }
          }
          return inquiry
        })
        
        localStorage.setItem('courseInquiries', JSON.stringify(updatedInquiries))
      } catch (inquiryError) {
        console.warn('Could not update inquiry status:', inquiryError)
      }
      
      // Send credentials via API (optional)
      try {
        const response = await fetch('/api/sendCredentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            learnerId,
            username,
            password,
            courseName: formData.courseName,
            courseDuration: formData.courseDuration,
            courseFee: formData.courseFee,
            transactionId
          })
        })
        
        if (response.ok) {
          setSuccessMessage('Registration successful! Your credentials have been sent to your email.')
        } else {
          throw new Error('Failed to send credentials email')
        }
        
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        setSuccessMessage(`✅ **Registration Successful!**
        
🎓 **Your Credentials:**
• Learner ID: ${learnerId}
• Username: ${username}
• Password: ${password}

📧 **Login Details:**
You can login at: /student-login
Email/Username: ${formData.email || username}
Password: ${password}

💡 **Important:** Save these credentials for future login.`)
      }
      
      // Redirect after successful registration
      setTimeout(() => {
        router.push('/lms/auth/login')
      }, 10000) // Give time for user to copy credentials
      
    } catch (error) {
      console.error('Registration error:', error)
      setErrorMessage('Failed to complete registration. Please try again or contact support.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading registration form...</p>
        </div>
      </div>
    )
  }

  if (errorMessage && !courseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Course Selected</h2>
          <p className="text-gray-600 mb-6">
            Please select a course from the courses page before registering.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Course Registration</h1>
          <p className="text-gray-600 mt-2">
            Complete your registration for {formData.courseName}
          </p>
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{successMessage}</p>
                <p className="text-sm text-green-700 mt-1">
                  You will be redirected to login page shortly...
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-2 ${currentStep === 'personal' ? 'text-purple-600' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'personal' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Personal Info</span>
            </div>
            
            <div className="h-1 flex-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all duration-300 ${currentStep === 'academic' || currentStep === 'payment' ? 'bg-purple-600 w-full' : 'bg-gray-200 w-0'}`} />
            </div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'academic' ? 'text-purple-600' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'academic' || currentStep === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Academic Info</span>
            </div>
            
            <div className="h-1 flex-1 mx-4 bg-gray-200">
              <div className={`h-full transition-all duration-300 ${currentStep === 'payment' ? 'bg-purple-600 w-full' : 'bg-gray-200 w-0'}`} />
            </div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-purple-600' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Information Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                Course Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Course Name</label>
                  <p className="font-medium text-gray-900">{formData.courseName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Duration</label>
                    <p className="font-medium text-gray-900">{formData.courseDuration}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Credit Hours</label>
                    <p className="font-medium text-gray-900">{formData.creditHours}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">Course Fee</label>
                  <p className="text-xl font-bold text-purple-700">{formData.courseFee}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {formData.category}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {formData.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Registration Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Fee</span>
                  <span className="font-medium text-gray-900">{formData.courseFee}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Fee</span>
                  <span className="font-medium text-gray-900">Rs 500</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-purple-700">{formData.courseFee}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Personal Information */}
              {currentStep === 'personal' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="03XX-XXXXXXX"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC *
                      </label>
                      <input
                        type="text"
                        name="cnic"
                        value={formData.cnic}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.cnic ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="XXXXX-XXXXXXX-X"
                      />
                      {errors.cnic && (
                        <p className="mt-1 text-sm text-red-600">{errors.cnic}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.gender ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 'academic' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Academic Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Highest Degree *
                      </label>
                      <select
                        name="highestDegree"
                        value={formData.highestDegree}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.highestDegree ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Degree</option>
                        <option value="matric">Matric</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="bachelors">Bachelor&apos;s Degree</option>
                        <option value="masters">Master&apos;s Degree</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.highestDegree && (
                        <p className="mt-1 text-sm text-red-600">{errors.highestDegree}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution *
                      </label>
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.institution ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter institution name"
                      />
                      {errors.institution && (
                        <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year *
                      </label>
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        min="1900"
                        max="2024"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.graduationYear ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 2020"
                      />
                      {errors.graduationYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marks / GPA (Optional)
                      </label>
                      <input
                        type="text"
                        name="marksGPA"
                        value={formData.marksGPA}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., 3.5/4.0 or 85%"
                      />
                    </div>
                    
                    {/* Document Upload Section - Optional */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Upload Documents (Optional)
                      </label>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">
                          You can upload documents like CNIC, Photo, Certificates, etc. 
                          Max 5MB per file. Supported formats: PDF, JPG, PNG, DOC, DOCX
                        </p>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                        <input
                          type="file"
                          id="documents"
                          multiple
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                        />
                        <label htmlFor="documents" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-gray-600">
                              Click to upload documents (Optional)
                            </p>
                            <p className="text-sm text-gray-500">
                              You can upload files later if needed
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {/* Uploaded Files List */}
                      {formData.documentNames.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Uploaded Files ({formData.documentNames.length})
                          </h3>
                          <ul className="space-y-2">
                            {formData.documentNames.map((fileName, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-900">{fileName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeDocument(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 'payment' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <DollarSign size={20} />
                    Payment Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Select Payment Method *
                      </label>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('offline')}
                          className={`p-4 border rounded-lg text-center transition-all ${
                            paymentMethod === 'offline'
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Smartphone className={`w-6 h-6 ${paymentMethod === 'offline' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className="font-medium">JazzCash/UBL</span>
                            <span className="text-sm text-gray-500">Bank Transfer</span>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('online')}
                          className={`p-4 border rounded-lg text-center transition-all ${
                            paymentMethod === 'online'
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className="font-medium">Online Payment</span>
                            <span className="text-sm text-gray-500">Credit/Debit Card</span>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cash')}
                          className={`p-4 border rounded-lg text-center transition-all ${
                            paymentMethod === 'cash'
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <DollarSign className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-purple-600' : 'text-gray-500'}`} />
                            <span className="font-medium">Cash Payment</span>
                            <span className="text-sm text-gray-500">Office Visit</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Offline Payment Instructions */}
                    {paymentMethod === 'offline' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                          <Smartphone size={20} />
                          Bank Transfer Instructions
                        </h3>
                        
                        <div className="space-y-3 text-sm text-blue-800">
                          <div className="flex items-center justify-between">
                            <span>Bank Name:</span>
                            <span className="font-medium">UBL</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Account Title:</span>
                            <span className="font-medium">MANSOL HAB TRAININGS</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Account Number:</span>
                            <span className="font-medium">1234-5678901-2</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>JazzCash Number:</span>
                            <span className="font-medium">+92 319 3236529</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Amount:</span>
                            <span className="font-bold text-lg">{formData.courseFee}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            <strong>Important:</strong> After payment, upload the screenshot/transaction slip below.
                          </p>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Payment Proof (Screenshot/Slip) *
                          </label>
                          
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                            <input
                              type="file"
                              id="paymentProof"
                              onChange={handlePaymentProofUpload}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                            />
                            <label htmlFor="paymentProof" className="cursor-pointer">
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <p className="text-gray-600">
                                  Click to upload payment proof
                                </p>
                                <p className="text-sm text-gray-500">
                                  PDF, JPG, PNG only
                                </p>
                              </div>
                            </label>
                          </div>
                          
                          {errors.paymentProof && (
                            <p className="mt-2 text-sm text-red-600">{errors.paymentProof}</p>
                          )}
                          
                          {paymentProofName && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText size={16} className="text-green-600" />
                                  <span className="text-sm text-gray-900">{paymentProofName}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentProof(null)
                                    setPaymentProofName('')
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Online Payment - Coming Soon */}
                    {paymentMethod === 'online' && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-center py-8">
                          <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-purple-900 mb-2">
                            Online Payment Gateway
                          </h3>
                          <p className="text-purple-700 mb-4">
                            This feature is currently under development and will be available soon.
                          </p>
                          <p className="text-sm text-purple-600">
                            Please select another payment method or check back later.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Cash Payment Instructions */}
                    {paymentMethod === 'cash' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                          <Building size={20} />
                          Office Visit Instructions
                        </h3>
                        
                        <div className="space-y-3 text-sm text-green-800">
                          <p>Visit our office to complete your registration:</p>
                          
                          <div className="p-3 bg-white rounded border border-green-100">
                            <div className="flex items-start gap-3">
                              <MapPin size={16} className="text-green-600 mt-0.5" />
                              <div>
                                <p className="font-medium">MANSOL HAB Trainings Office</p>
                                <p className="text-gray-600">Office # 123, Business Center, Karachi, Pakistan</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-green-600" />
                            <span>Office Hours: Mon-Fri, 9:00 AM - 5:00 PM</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-green-600" />
                            <span>Email: info@mansolhab.com</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Your registration will be confirmed once payment is received at the office.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  {currentStep !== 'personal' ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Previous Step
                    </button>
                  ) : (
                    <div></div>
                  )}
                  
                  {currentStep !== 'payment' ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || (paymentMethod === 'online')}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing Registration...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Complete Registration
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {currentStep === 'payment' && paymentMethod === 'online' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-sm text-amber-800 text-center">
                      Online payment is not available yet. Please select another payment method.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    By completing registration, you agree to our{' '}
                    <Link href="/terms" className="text-purple-600 hover:underline">
                      Terms & Conditions
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}