/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiUser, HiClock, HiArrowLeft, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi'

// Login type configurations
const loginTypes = {
  student: {
    title: 'Student Login',
    description: 'Access your learning dashboard',
    iconColor: 'from-purple-500 to-purple-700',
    hint: 'Use your student credentials to access course materials.'
  },
  instructor: {
    title: 'Instructor Login',
    description: 'Manage courses and students',
    iconColor: 'from-purple-600 to-purple-800',
    hint: 'Access your instructor dashboard to manage courses.'
  },
  admin: {
    title: 'Admin Login',
    description: 'System administration',
    iconColor: 'from-purple-700 to-purple-900',
    hint: 'Administrator access for system management.'
  }
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
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
            <HiCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-md"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home Skeleton */}
        <div className="flex justify-start">
          <div className="inline-flex items-center text-gray-600">
            <div className="w-5 h-5 bg-gray-300 rounded mr-2 animate-pulse"></div>
            <div className="h-5 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Login Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header Skeleton */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="h-7 w-48 bg-gray-300 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-300 rounded mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Form Section Skeleton */}
          <div className="p-8">
            {/* Login Type Selector Skeleton */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex-1 py-2 px-3 rounded-lg bg-gray-100 animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Form Inputs Skeleton */}
            <div className="space-y-4">
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-11 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-11 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="pt-6">
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// UPDATED LOGIC: STUDENT LOGIN VALIDATION FROM LOCALSTORAGE
const validateStudentLogin = (email: string, password: string) => {
  console.log('🔍 Validating student login for:', email);
  
  // 1. FIRST: Check studentCredentials from admin (main source)
  try {
    const studentCredentials = JSON.parse(localStorage.getItem('studentCredentials') || '[]');
    console.log('📋 Checking studentCredentials:', studentCredentials.length, 'credentials found');
    
    // Find matching student in credentials sent by admin
    const studentCredential = studentCredentials.find((cred: any) => {
      // Check if email matches student email or username
      const matchesEmail = cred.studentEmail?.toLowerCase() === email.toLowerCase();
      const matchesUsername = cred.username?.toLowerCase() === email.toLowerCase();
      
      return (matchesEmail || matchesUsername) && 
             cred.password === password && 
             cred.status !== 'rejected';
    });
    
    if (studentCredential) {
      console.log('✅ Student found in studentCredentials:', {
        name: studentCredential.studentName,
        email: studentCredential.studentEmail,
        username: studentCredential.username
      });
      
      // Create student session data
      const studentSession = {
        id: studentCredential.studentId || `student_${Date.now()}`,
        learnerId: studentCredential.learnerId || `LRN${Math.floor(Math.random() * 100000)}`,
        email: studentCredential.studentEmail,
        username: studentCredential.username,
        password: studentCredential.password,
        fullName: studentCredential.studentName,
        role: 'student',
        course: studentCredential.course,
        courseId: studentCredential.courseId || 'course_01',
        registrationDate: studentCredential.sentDate || new Date().toISOString(),
        status: 'active',
        loginTime: new Date().toISOString(),
        paymentVerified: true,
        source: 'admin_credentials'
      };
      
      // Save to studentAuth for future logins
      try {
        const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
        const existingStudent = studentAuth.find((s: any) => 
          s.username === studentCredential.username || 
          s.email === studentCredential.studentEmail
        );
        
        if (!existingStudent) {
          studentAuth.push(studentSession);
          localStorage.setItem('studentAuth', JSON.stringify(studentAuth));
        }
      } catch (error) {
        console.error('Error updating studentAuth:', error);
      }
      
      return {
        success: true,
        userData: studentSession,
        redirectTo: '/lms/Student_Portal'
      };
    }
  } catch (error) {
    console.error('❌ Error checking studentCredentials:', error);
  }
  
  // 2. SECOND: Check studentAuth (existing students)
  try {
    const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
    console.log('📋 Checking studentAuth:', studentAuth.length, 'students found');
    
    // Find student by email or username
    const student = studentAuth.find((s: any) => {
      const matchesEmail = s.email?.toLowerCase() === email.toLowerCase();
      const matchesUsername = s.username?.toLowerCase() === email.toLowerCase();
      
      return (matchesEmail || matchesUsername) && s.password === password;
    });
    
    if (student) {
      console.log('✅ Student found in studentAuth:', {
        name: student.fullName,
        email: student.email,
        username: student.username
      });
      
      return {
        success: true,
        userData: {
          ...student,
          loginTime: new Date().toISOString()
        },
        redirectTo: '/lms/Student_Portal'
      };
    }
  } catch (error) {
    console.error('❌ Error checking studentAuth:', error);
  }
  
  // 3. THIRD: Check demo student account (for testing)
  if (email === 'student@gmail.com' && password === '123456') {
    console.log('🎮 Using demo student account');
    
    // Check if demo student already exists
    try {
      const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
      const existingDemo = studentAuth.find((s: any) => s.email === 'student@gmail.com');
      
      if (existingDemo) {
        return {
          success: true,
          isDemoAccount: true,
          userData: {
            ...existingDemo,
            loginTime: new Date().toISOString()
          },
          redirectTo: '/lms/Student_Portal'
        };
      }
    } catch (error) {
      console.error('Error checking existing demo:', error);
    }
    
    // Create demo student data
    const demoStudent = {
      id: `student_demo_${Date.now()}`,
      learnerId: 'LRN123456',
      email: 'student@gmail.com',
      username: 'student',
      password: '123456',
      fullName: 'Demo Student',
      role: 'student',
      course: 'Web Development',
      courseId: 'course_demo',
      registrationDate: new Date().toISOString(),
      status: 'active',
      paymentVerified: true
    };
    
    // Add to studentAuth for future logins
    try {
      const existingAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
      const updatedAuth = [demoStudent, ...existingAuth];
      localStorage.setItem('studentAuth', JSON.stringify(updatedAuth));
    } catch (error) {
      console.error('Error saving demo student:', error);
    }
    
    return {
      success: true,
      isDemoAccount: true,
      userData: {
        ...demoStudent,
        loginTime: new Date().toISOString()
      },
      redirectTo: '/lms/Student_Portal'
    };
  }
  
  // 4. FOURTH: Check if student has pending payment (no credentials yet)
  try {
    const paymentSubmissions = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    const paymentSubmission = paymentSubmissions.find((p: any) => 
      p.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (paymentSubmission) {
      console.log('⚠️ Student found in payment submissions but no credentials yet');
      return {
        success: false,
        error: 'Your payment is being processed. Please wait for credentials email from admin.'
      };
    }
  } catch (error) {
    console.error('Error checking payment submissions:', error);
  }
  
  // If no match found
  console.log('❌ No valid student found with these credentials');
  return {
    success: false,
    error: 'Invalid credentials. Please use the username/email and password sent by admin.'
  };
};

// UPDATED: INSTRUCTOR LOGIN VALIDATION FROM LOCALSTORAGE
const validateInstructorLogin = (email: string, password: string) => {
  console.log('🔍 Validating instructor login for:', email);
  
  // 1. Check instructor_users from LocalStorage (NEW KEY)
  try {
    const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]');
    console.log('📋 Checking instructor_users:', instructorUsers.length, 'instructors found');
    
    // Find matching instructor
    const instructorUser = instructorUsers.find((user: any) => {
      const matchesEmail = user.email?.toLowerCase() === email.toLowerCase();
      const matchesPhone = user.phone === email; // Also allow phone login
      
      return (matchesEmail || matchesPhone) && 
             user.password === password && 
             user.role === 'instructor' &&
             user.status !== 'inactive';
    });
    
    if (instructorUser) {
      console.log('✅ Instructor found in instructor_users:', {
        name: instructorUser.name,
        email: instructorUser.email,
        role: instructorUser.role
      });
      
      // 2. Get instructor profile details from lms_instructors
      const lmsInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      const instructorProfile = lmsInstructors.find((inst: any) => 
        inst.email === instructorUser.email || inst.id === instructorUser.id
      );
      
      // Create instructor session data
      const instructorSession = {
        id: instructorUser.id,
        email: instructorUser.email,
        password: instructorUser.password,
        name: instructorUser.name,
        phone: instructorUser.phone,
        role: 'instructor',
        courseId: instructorUser.courseId,
        assignedCourseId: instructorUser.courseId,
        status: instructorUser.status,
        createdAt: instructorUser.createdAt,
        lastLogin: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        
        // Profile data from lms_instructors
        profileData: instructorProfile ? {
          specialization: instructorProfile.specialization,
          experience: instructorProfile.experience,
          qualification: instructorProfile.qualification,
          bio: instructorProfile.bio,
          rating: instructorProfile.rating,
          assignedCourse: instructorProfile.assignedCourse,
          totalStudents: instructorProfile.totalStudents
        } : null
      };
      
      // Update last login time
      try {
        const updatedUsers = instructorUsers.map((user: any) => 
          user.id === instructorUser.id 
            ? { ...user, lastLogin: new Date().toISOString() }
            : user
        );
        localStorage.setItem('instructor_users', JSON.stringify(updatedUsers));
      } catch (error) {
        console.error('Error updating last login:', error);
      }
      
      return {
        success: true,
        userData: instructorSession,
        redirectTo: '/lms/Instructor_Portal'
      };
    }
  } catch (error) {
    console.error('❌ Error checking instructor_users:', error);
  }
  
  // 3. Check fixed demo instructor account
  if (email === 'instructor@gmail.com' && password === '123456') {
    console.log('🎮 Using fixed demo instructor account');
    
    // Check if demo instructor already exists in instructor_users
    try {
      const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]');
      const existingDemo = instructorUsers.find((user: any) => user.email === 'instructor@gmail.com');
      
      if (existingDemo) {
        return {
          success: true,
          isDemoAccount: true,
          userData: {
            ...existingDemo,
            loginTime: new Date().toISOString()
          },
          redirectTo: '/lms/Instructor_Portal'
        };
      }
    } catch (error) {
      console.error('Error checking existing demo:', error);
    }
    
    // Create demo instructor data
    const demoInstructor = {
      id: `instructor_demo_${Date.now()}`,
      email: 'instructor@gmail.com',
      password: '123456',
      name: 'Demo Instructor',
      role: 'instructor',
      phone: '+92 300 1234567',
      courseId: 'pipe-fitter', // Default course
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Add to instructor_users for future logins
    try {
      const existingUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]');
      const updatedUsers = [demoInstructor, ...existingUsers];
      localStorage.setItem('instructor_users', JSON.stringify(updatedUsers));
      
      // Also add to lms_instructors for profile
      const lmsInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
      const demoProfile = {
        id: demoInstructor.id,
        name: demoInstructor.name,
        email: demoInstructor.email,
        phone: demoInstructor.phone,
        specialization: 'Technical Training',
        experience: '5 years',
        qualification: 'BSc in Engineering',
        bio: 'Experienced instructor with 5+ years of teaching experience.',
        status: 'active',
        rating: 4.8,
        assignedCourse: {
          id: 'pipe-fitter',
          title: 'Pipe Fitter',
          category: 'Technical Training',
          duration: '8 Weeks'
        },
        courseId: 'pipe-fitter',
        password: '123456',
        totalStudents: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedInstructors = [demoProfile, ...lmsInstructors];
      localStorage.setItem('lms_instructors', JSON.stringify(updatedInstructors));
    } catch (error) {
      console.error('Error saving demo instructor:', error);
    }
    
    return {
      success: true,
      isDemoAccount: true,
      userData: {
        ...demoInstructor,
        loginTime: new Date().toISOString(),
        profileData: {
          specialization: 'Technical Training',
          experience: '5 years',
          qualification: 'BSc in Engineering',
          rating: 4.8,
          assignedCourse: {
            id: 'pipe-fitter',
            title: 'Pipe Fitter',
            category: 'Technical Training',
            duration: '8 Weeks'
          }
        }
      },
      redirectTo: '/lms/Instructor_Portal'
    };
  }
  
  // If no match found
  console.log('❌ No valid instructor found with these credentials');
  return {
    success: false,
    error: 'Invalid credentials. Please use the email and password sent by admin.'
  };
};

// ADMIN LOGIN VALIDATION (SAME AS BEFORE)
const validateAdminLogin = (email: string, password: string) => {
  if (email === 'admin@gmail.com' && password === '123456') {
    return {
      success: true,
      isDemoAccount: true,
      userData: {
        email: 'admin@gmail.com',
        name: 'Admin User',
        role: 'admin',
        isDemoAccount: true,
        loginType: 'admin'
      },
      redirectTo: '/lms/Admin_Portal'
    };
  }
  
  return {
    success: false,
    error: 'Invalid admin credentials'
  };
};

// Main login component
function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const loginType = searchParams.get('type') || 'student'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [loginConfig, setLoginConfig] = useState(loginTypes.student)

  // Update login configuration based on type
  useEffect(() => {
    const config = loginTypes[loginType as keyof typeof loginTypes] || loginTypes.student
    setLoginConfig(config)
  }, [loginType])
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)
  
  setTimeout(() => {
    try {
      let validation;
      
      // Handle different login types
      if (loginType === 'instructor') {
        validation = validateInstructorLogin(formData.email, formData.password);
      } 
      else if (loginType === 'admin') {
        validation = validateAdminLogin(formData.email, formData.password);
      }
      else {
        // STUDENT LOGIN - UPDATED LOGIC
        validation = validateStudentLogin(formData.email, formData.password);
      }
      
      if (validation.success) {
        console.log(`${loginType} login successful:`, validation.userData);
        
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(validation.userData));
        
        // Show success message
        const userName = validation.userData.fullName || 
                        validation.userData.name || 
                        validation.userData.username || 
                        validation.userData.email.split('@')[0];
        
        setSuccessMessage(`Welcome back, ${userName}!`);
        setShowSuccess(true);
        
        // Redirect to appropriate portal - FIXED: Check if redirectTo exists
        setTimeout(() => {
          if (validation.redirectTo) {
            router.push(validation.redirectTo);
          } else {
            // Default redirect based on login type
            const defaultRedirects = {
              student: '/lms/Student_Portal',
              instructor: '/lms/Instructor_Portal',
              admin: '/lms/Admin_Portal'
            };
            router.push(defaultRedirects[loginType as keyof typeof defaultRedirects] || '/');
          }
        }, 2000);
      } else {
        console.log(`${loginType} login failed`);
        setError(validation.error || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  }, 1000);
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Auto-fill demo credentials
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData(prev => ({ ...prev, email: email }))
    
    // Auto-fill password for demo accounts
    const demoAccounts = [
      'student@gmail.com',
      'instructor@gmail.com', 
      'admin@gmail.com'
    ];
    
    if (demoAccounts.includes(email)) {
      setFormData(prev => ({ ...prev, password: '123456' }));
    }
  }

  // Setup demo accounts in LocalStorage
  useEffect(() => {
    // Setup demo student account if not exists
    try {
      const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
      const demoStudentExists = studentAuth.some((s: any) => s.email === 'student@gmail.com');
      
      if (!demoStudentExists) {
        const demoStudent = {
          id: `student_demo_${Date.now()}`,
          learnerId: 'LRN123456',
          email: 'student@gmail.com',
          username: 'student',
          password: '123456',
          fullName: 'Demo Student',
          role: 'student',
          course: 'Web Development',
          courseId: 'course_demo',
          registrationDate: new Date().toISOString(),
          status: 'active',
          paymentVerified: true
        };
        
        const updatedAuth = [demoStudent, ...studentAuth];
        localStorage.setItem('studentAuth', JSON.stringify(updatedAuth));
      }
    } catch (error) {
      console.error('Error setting up demo student:', error);
    }
    
    // Setup demo instructor account in new key
    try {
      const instructorUsers = JSON.parse(localStorage.getItem('instructor_users') || '[]');
      const demoInstructorExists = instructorUsers.some((u: any) => u.email === 'instructor@gmail.com');
      
      if (!demoInstructorExists) {
        const demoInstructor = {
          id: `instructor_demo_${Date.now()}`,
          email: 'instructor@gmail.com',
          password: '123456',
          name: 'Demo Instructor',
          role: 'instructor',
          phone: '+92 300 1234567',
          courseId: 'pipe-fitter',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: null
        };
        
        const updatedUsers = [demoInstructor, ...instructorUsers];
        localStorage.setItem('instructor_users', JSON.stringify(updatedUsers));
        
        // Also add to lms_instructors for profile data
        const lmsInstructors = JSON.parse(localStorage.getItem('lms_instructors') || '[]');
        const demoProfile = {
          id: demoInstructor.id,
          name: demoInstructor.name,
          email: demoInstructor.email,
          phone: demoInstructor.phone,
          specialization: 'Technical Training',
          experience: '5 years',
          qualification: 'BSc in Engineering',
          bio: 'Experienced instructor with 5+ years of teaching experience.',
          status: 'active',
          rating: 4.8,
          assignedCourse: {
            id: 'pipe-fitter',
            title: 'Pipe Fitter',
            category: 'Technical Training',
            duration: '8 Weeks'
          },
          courseId: 'pipe-fitter',
          password: '123456',
          totalStudents: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedInstructors = [demoProfile, ...lmsInstructors];
        localStorage.setItem('lms_instructors', JSON.stringify(updatedInstructors));
      }
    } catch (error) {
      console.error('Error setting up demo instructor:', error);
    }
  }, []);

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Home */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-300 group"
            >
              <HiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Header Section - Clean White */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${loginConfig.iconColor} rounded-full flex items-center justify-center shadow-md`}>
                  <HiUser className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{loginConfig.title}</h1>
                <p className="text-gray-600 text-sm">{loginConfig.description}</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Login Type Selector */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  {Object.entries(loginTypes).map(([key, config]) => (
                    <Link
                      key={key}
                      href={`/lms/auth/login?type=${key}`}
                      className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 ${
                        loginType === key
                          ? `bg-gradient-to-r ${config.iconColor} text-white shadow-md`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email/Identifier Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {loginType === 'student' ? 'Email or Username' : 
                     loginType === 'instructor' ? 'Email or Phone Number' : 
                     'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiUser className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type={loginType === 'student' ? 'text' : 'email'}
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder={
                        loginType === 'student' 
                          ? 'Enter email or username' 
                          : loginType === 'instructor'
                          ? 'Enter email or phone number'
                          : 'Enter your email'
                      }
                    />
                  </div>
                  {loginType === 'instructor' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use email sent by admin or phone number
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiClock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <HiEye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {loginType === 'instructor' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Use password sent by admin via email
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-md hover:shadow-lg ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      `Sign in to ${loginType.charAt(0).toUpperCase() + loginType.slice(1)} Portal`
                    )}
                  </button>
                </div>
              </form>

              {/* Login Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {loginConfig.hint}
                </p>
                {loginType === 'student' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Use the credentials sent to your email after payment verification.
                  </p>
                )}
                {loginType === 'instructor' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Use the credentials sent to your email by the admin.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="#" className="text-purple-600 hover:underline transition-colors">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-purple-600 hover:underline transition-colors">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  )
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}