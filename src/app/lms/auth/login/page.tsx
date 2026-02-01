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

// INSTRUCTOR LOGIN VALIDATION FUNCTION
const validateInstructorLogin = (email: string, password: string) => {
  console.log('Validating instructor login for:', email);
  
  // 1. FIRST: Check if it's the fixed demo instructor account
  if (email === 'instructor@gmail.com' && password === '123456') {
    console.log('Using fixed demo instructor account');
    return {
      success: true,
      isDemoAccount: true,
      userData: {
        email: 'instructor@gmail.com',
        name: 'Demo Instructor',
        role: 'instructor',
        isDemoAccount: true,
        loginType: 'instructor'
      },
      redirectTo: '/lms/Instructor_Portal'
    };
  }
  
  // 2. SECOND: Check against instructorUsers in localStorage (real instructors added by admin)
  try {
    const instructorUsers = JSON.parse(localStorage.getItem('instructorUsers') || '[]');
    console.log('Checking instructorUsers in localStorage:', instructorUsers);
    
    // Find matching instructor user
    const instructorUser = instructorUsers.find((user: any) => 
      user.email === email && 
      user.password === password && 
      user.role === 'instructor'
    );
    
    if (instructorUser) {
      console.log('Found instructor in instructorUsers:', instructorUser);
      
      // Get additional instructor details from instructors list
      const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
      const instructorDetails = allInstructors.find((instructor: any) => 
        instructor.id === instructorUser.id
      );
      
      return {
        success: true,
        isDemoAccount: false,
        userData: {
          ...instructorUser,
          name: instructorDetails?.name || instructorUser.name || email.split('@')[0],
          role: 'instructor',
          loginType: 'instructor',
          instructorId: instructorUser.id,
          instructorDetails: instructorDetails
        },
        redirectTo: '/lms/Instructor_Portal'
      };
    }
  } catch (error) {
    console.error('Error checking instructorUsers:', error);
  }
  
  // 3. THIRD: Check against regular users list (legacy/backup)
  try {
    const regularUsers = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Checking regular users as fallback:', regularUsers);
    
    const regularUser = regularUsers.find((user: any) => 
      user.email === email && 
      user.password === password && 
      user.role === 'instructor'
    );
    
    if (regularUser) {
      console.log('Found instructor in regular users:', regularUser);
      return {
        success: true,
        isDemoAccount: false,
        userData: {
          email: regularUser.email,
          name: regularUser.name || email.split('@')[0],
          role: 'instructor',
          loginType: 'instructor'
        },
        redirectTo: '/lms/Instructor_Portal'
      };
    }
  } catch (error) {
    console.error('Error checking regular users:', error);
  }
  
  // If no match found
  console.log('No valid instructor found with these credentials');
  return {
    success: false,
    error: 'Invalid email or password for instructor account'
  };
};

// STUDENT LOGIN VALIDATION FUNCTION (UPDATED)
const validateStudentLogin = (identifier: string, password: string) => {
  console.log('Validating student login for:', identifier);
  
  // First, check against studentAuth in localStorage
  try {
    const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
    console.log('Checking studentAuth:', studentAuth);
    
    // Find student by email, username, or learnerId
    const student = studentAuth.find((s: any) => {
      // Check if identifier matches email, username, or learnerId
      const matchesEmail = s.email?.toLowerCase() === identifier.toLowerCase();
      const matchesUsername = s.username?.toLowerCase() === identifier.toLowerCase();
      const matchesLearnerId = s.learnerId === identifier;
      
      return (matchesEmail || matchesUsername || matchesLearnerId) && 
             s.password === password;
    });
    
    if (student) {
      console.log('Student found in studentAuth:', student);
      return {
        success: true,
        userData: {
          id: student.id,
          learnerId: student.learnerId,
          email: student.email,
          username: student.username,
          password: student.password,
          fullName: student.fullName,
          role: 'student',
          course: student.course,
          courseId: student.courseId,
          registrationDate: student.registrationDate,
          status: 'active',
          loginTime: new Date().toISOString()
        },
        redirectTo: '/lms/Student_Portal'
      };
    }
  } catch (error) {
    console.error('Error checking studentAuth:', error);
  }
  
  // Second, check if it's demo student account (for testing)
  if (
    (identifier === 'student@gmail.com' || 
     identifier === 'student' || 
     identifier === 'STU98765432') && 
    password === '123456'
  ) {
    console.log('Using demo student account');
    
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
      learnerId: 'STU98765432',
      email: 'student@gmail.com',
      username: 'student',
      password: '123456',
      fullName: 'Demo Student',
      role: 'student',
      course: 'Web Development',
      courseId: 'course_demo',
      registrationDate: new Date().toISOString(),
      status: 'active',
      lastLogin: null
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
  
  // Third, check against regular users as fallback
  try {
    const regularUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const regularUser = regularUsers.find((u: any) => 
      u.email === identifier && 
      u.password === password &&
      u.role === 'student'
    );
    
    if (regularUser) {
      console.log('Found student in regular users:', regularUser);
      return {
        success: true,
        userData: {
          email: regularUser.email,
          name: regularUser.name || regularUser.email.split('@')[0],
          role: 'student',
          loginType: 'student'
        },
        redirectTo: '/lms/Student_Portal'
      };
    }
  } catch (error) {
    console.error('Error checking regular users:', error);
  }
  
  // If no match found
  console.log('No valid student found with these credentials');
  return {
    success: false,
    error: 'Invalid credentials. Please check your login details and try again.'
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
        // Handle different login types
        if (loginType === 'instructor') {
          // INSTRUCTOR LOGIN: Use the specific validation function
          const validation = validateInstructorLogin(formData.email, formData.password);
          
          if (validation.success) {
            console.log('Instructor login successful:', validation.userData);
            
            // Save current user to local storage
            localStorage.setItem('currentUser', JSON.stringify(validation.userData));
            
            // Also save as lastInstructorLogin for easier access
            localStorage.setItem('lastInstructorLogin', JSON.stringify({
              email: formData.email,
              timestamp: new Date().toISOString(),
              isDemoAccount: validation.isDemoAccount
            }));
            
            // Show success popup
            const userName = validation.userData.name || formData.email.split('@')[0];
            setSuccessMessage(validation.isDemoAccount 
              ? `Welcome, ${userName}! (Demo Account)`
              : `Welcome back, ${userName}!`
            );
            setShowSuccess(true);
            
            // Redirect to instructor portal
            setTimeout(() => {
              router.push(validation.redirectTo || '/lms/Instructor_Portal');
            }, 2000);
          } else {
            console.log('Instructor login failed');
            setError(validation.error || 'Invalid instructor credentials');
          }
        } 
        else if (loginType === 'admin') {
          // ADMIN LOGIN: Check fixed demo account
          if (formData.email === 'nestickteck@gmail.com' && formData.password === '123456') {
            const adminUser = {
              email: formData.email,
              name: 'Admin User',
              role: 'admin',
              isDemoAccount: true,
              loginType: 'admin'
            };
            
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            
            setSuccessMessage('Welcome back, Admin!');
            setShowSuccess(true);
            
            setTimeout(() => {
              router.push('/lms/Admin_Portal');
            }, 2000);
          } else {
            // Check regular users for admin
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find((u: any) => 
              u.email === formData.email && 
              u.password === formData.password &&
              u.role === 'admin'
            );
            
            if (user) {
              localStorage.setItem('currentUser', JSON.stringify(user));
              setSuccessMessage(`Welcome back, ${user.name || user.email}!`);
              setShowSuccess(true);
              
              setTimeout(() => {
                router.push('/lms/Admin_Portal');
              }, 2000);
            } else {
              setError('Invalid admin credentials');
            }
          }
        }
        else {
          // STUDENT LOGIN: Use the updated validation function
          // Students can login with email, username, or learnerId
          const validation = validateStudentLogin(formData.email, formData.password);
          
          if (validation.success) {
            console.log('Student login successful:', validation.userData);
            
            // Save to appropriate storage based on data structure
            if (validation.userData.learnerId) {
              // New student auth structure
              localStorage.setItem('currentStudent', JSON.stringify(validation.userData));
            } else {
              // Legacy student structure
              localStorage.setItem('currentUser', JSON.stringify(validation.userData));
            }
            
            // Show success popup
            const userName = validation.userData.fullName || validation.userData.name || validation.userData.username || formData.email.split('@')[0];
            setSuccessMessage(`Welcome back, ${userName}!`);
            setShowSuccess(true);
            
            // Redirect to student dashboard
            setTimeout(() => {
              router.push(validation.redirectTo || '/lms/Student_Portal');
            }, 2000);
          } else {
            console.log('Student login failed');
            setError(validation.error || 'Invalid student credentials');
          }
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

  // Pre-fill credentials based on email/identifier
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const identifier = e.target.value
    setFormData(prev => ({ ...prev, email: identifier }))
    
    // Auto-fill password for special identifiers
    const specialIdentifiers = [
      'nestickteck@gmail.com', 
      'instructor@gmail.com',
      'student@gmail.com',
      'student',
      'STU98765432'
    ];
    
    if (specialIdentifiers.includes(identifier)) {
      setFormData(prev => ({ ...prev, password: '123456' }));
      
      // Also set login type automatically based on identifier
      if (identifier === 'nestickteck@gmail.com') {
        router.replace('/lms/auth/login?type=admin');
      } else if (identifier === 'instructor@gmail.com') {
        router.replace('/lms/auth/login?type=instructor');
      } else if (identifier === 'student@gmail.com' || identifier === 'student' || identifier === 'STU98765432') {
        router.replace('/lms/auth/login?type=student');
      }
    }
  }

  // Add demo users to localStorage for testing
  useEffect(() => {
    // Only add demo users if they don't exist
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const demoUsers = [
      {
        email: 'nestickteck@gmail.com',
        password: '123456',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        email: 'student@gmail.com',
        password: '123456',
        name: 'Student User',
        role: 'student',
        createdAt: new Date().toISOString()
      }
    ];
    
    let updated = false;
    demoUsers.forEach(demoUser => {
      const exists = users.some((u: any) => u.email === demoUser.email);
      if (!exists) {
        users.push(demoUser);
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Also check for demo student in studentAuth
    try {
      const studentAuth = JSON.parse(localStorage.getItem('studentAuth') || '[]');
      const demoStudentExists = studentAuth.some((s: any) => s.email === 'student@gmail.com');
      
      if (!demoStudentExists) {
        const demoStudent = {
          id: `student_demo_${Date.now()}`,
          learnerId: 'STU98765432',
          email: 'student@gmail.com',
          username: 'student',
          password: '123456',
          fullName: 'Demo Student',
          role: 'student',
          course: 'Web Development',
          courseId: 'course_demo',
          registrationDate: new Date().toISOString(),
          status: 'active',
          lastLogin: null
        };
        
        const updatedAuth = [demoStudent, ...studentAuth];
        localStorage.setItem('studentAuth', JSON.stringify(updatedAuth));
      }
    } catch (error) {
      console.error('Error setting up demo student:', error);
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
                {/* Identifier Input - Label changes based on login type */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {loginType === 'student' ? 'Email / Username / Learner ID' : 'Email Address'}
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
                          ? 'Enter email, username, or learner ID' 
                          : 'Enter your email'
                      }
                    />
                  </div>
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