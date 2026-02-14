/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiUser, HiClock, HiArrowLeft, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi'

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

// Login type configurations with brand colors
const loginTypes = {
  student: {
    title: 'Student Login',
    description: 'Access your learning dashboard',
    hint: 'Use your student credentials to access course materials.',
    primaryColor: BRAND_COLORS.darkRoyalBlue,
    secondaryColor: BRAND_COLORS.darkNavy
  },
  instructor: {
    title: 'Instructor Login',
    description: 'Manage courses and students',
    hint: 'Access your instructor dashboard to manage courses.',
    primaryColor: BRAND_COLORS.deepRed,
    secondaryColor: BRAND_COLORS.brightRed
  },
  admin: {
    title: 'Admin Login',
    description: 'System administration',
    hint: 'Administrator access for system management.',
    primaryColor: BRAND_COLORS.darkGrey,
    secondaryColor: BRAND_COLORS.darkNavy
  }
}

// Success Popup Component with brand colors
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
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.brightRed} 100%)` }}
          >
            <HiCheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>Success!</h3>
          <p className="mb-6" style={{ color: BRAND_COLORS.darkGrey }}>{message}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${BRAND_COLORS.deepRed} 0%, ${BRAND_COLORS.brightRed} 100%)`
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component with brand colors
function LoginLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home Skeleton */}
        <div className="flex justify-start">
          <div className="inline-flex items-center text-gray-600">
            <div className="w-5 h-5 rounded mr-2 animate-pulse" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
            <div className="h-5 w-24 rounded animate-pulse" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
          </div>
        </div>

        {/* Login Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: BRAND_COLORS.softGrey }}>
          {/* Header Skeleton */}
          <div className="p-8 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
                <div className="w-8 h-8 rounded" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="h-7 w-48 rounded mx-auto mb-2 animate-pulse" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
              <div className="h-4 w-64 rounded mx-auto animate-pulse" style={{ backgroundColor: BRAND_COLORS.lightGrey }}></div>
            </div>
          </div>

          {/* Form Section Skeleton */}
          <div className="p-8">
            {/* Login Type Selector Skeleton */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex-1 py-2 px-3 rounded-lg animate-pulse" style={{ backgroundColor: BRAND_COLORS.lightGrey }}></div>
                ))}
              </div>
            </div>

            {/* Form Inputs Skeleton */}
            <div className="space-y-4">
              <div>
                <div className="h-4 w-32 rounded mb-1 animate-pulse" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
                <div className="h-11 w-full rounded-lg animate-pulse" style={{ backgroundColor: BRAND_COLORS.lightGrey }}></div>
              </div>
              
              <div>
                <div className="h-4 w-24 rounded mb-1 animate-pulse" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
                <div className="h-11 w-full rounded-lg animate-pulse" style={{ backgroundColor: BRAND_COLORS.lightGrey }}></div>
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="pt-6">
              <div className="h-12 w-full rounded-lg animate-pulse" style={{ backgroundColor: BRAND_COLORS.softGrey }}></div>
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

  // Get current login colors
  const getCurrentColors = () => {
    switch(loginType) {
      case 'student':
        return {
          primary: BRAND_COLORS.darkRoyalBlue,
          secondary: BRAND_COLORS.darkNavy,
          light: 'rgba(30, 58, 138, 0.1)' // Light royal blue
        };
      case 'instructor':
        return {
          primary: BRAND_COLORS.deepRed,
          secondary: BRAND_COLORS.brightRed,
          light: 'rgba(177, 18, 23, 0.1)' // Light deep red
        };
      case 'admin':
        return {
          primary: BRAND_COLORS.darkGrey,
          secondary: BRAND_COLORS.darkNavy,
          light: 'rgba(31, 41, 51, 0.1)' // Light dark grey
        };
      default:
        return {
          primary: BRAND_COLORS.darkRoyalBlue,
          secondary: BRAND_COLORS.darkNavy,
          light: 'rgba(30, 58, 138, 0.1)'
        };
    }
  };

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

  const colors = getCurrentColors();

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Home */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center transition-colors duration-300 group"
              style={{ color: BRAND_COLORS.darkGrey }}
            >
              <HiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border" style={{ borderColor: BRAND_COLORS.softGrey }}>
            {/* Header Section */}
            <div className="p-8 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                  }}
                >
                  <HiUser className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                  {loginType === 'student' ? 'Student Login' : 
                   loginType === 'instructor' ? 'Instructor Login' : 
                   'Admin Login'}
                </h1>
                <p className="text-sm" style={{ color: BRAND_COLORS.darkGrey }}>
                  {loginType === 'student' ? 'Access your learning dashboard' :
                   loginType === 'instructor' ? 'Manage courses and students' :
                   'System administration'}
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }}>
                  <p className="text-sm text-center" style={{ color: BRAND_COLORS.brightRed }}>{error}</p>
                </div>
              )}

              {/* Login Type Selector */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  {['student', 'instructor', 'admin'].map((type) => {
                    const typeColors = type === 'student' ? 
                      { primary: BRAND_COLORS.darkRoyalBlue, secondary: BRAND_COLORS.darkNavy } :
                      type === 'instructor' ?
                      { primary: BRAND_COLORS.deepRed, secondary: BRAND_COLORS.brightRed } :
                      { primary: BRAND_COLORS.darkGrey, secondary: BRAND_COLORS.darkNavy };
                    
                    return (
                      <Link
                        key={type}
                        href={`/lms/auth/login?type=${type}`}
                        className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 ${
                          loginType === type
                            ? 'text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        style={loginType === type ? { 
                          background: `linear-gradient(135deg, ${typeColors.primary} 0%, ${typeColors.secondary} 100%)`
                        } : { backgroundColor: BRAND_COLORS.lightGrey }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email/Identifier Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.darkGrey }}>
                    {loginType === 'student' ? 'Email or Username' : 
                     loginType === 'instructor' ? 'Email or Phone Number' : 
                     'Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiUser className="h-4 w-4" style={{ color: BRAND_COLORS.softGrey }} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type={loginType === 'student' ? 'text' : 'email'}
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{ 
                        borderColor: BRAND_COLORS.softGrey,
                      }}
                      placeholder={
                        loginType === 'student' 
                          ? 'Enter email or username' 
                          : loginType === 'instructor'
                          ? 'Enter email or phone number'
                          : 'Enter your email'
                      }
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 2px ${colors.light}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BRAND_COLORS.softGrey;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  {loginType === 'instructor' && (
                    <p className="text-xs mt-1" style={{ color: BRAND_COLORS.darkGrey }}>
                      Use email sent by admin or phone number
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: BRAND_COLORS.darkGrey }}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <HiClock className="h-4 w-4" style={{ color: BRAND_COLORS.softGrey }} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{ 
                        borderColor: BRAND_COLORS.softGrey,
                      }}
                      placeholder="Enter your password"
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.primary;
                        e.target.style.boxShadow = `0 0 0 2px ${colors.light}`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = BRAND_COLORS.softGrey;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-4 w-4 transition-colors" style={{ color: BRAND_COLORS.softGrey }} />
                      ) : (
                        <HiEye className="h-4 w-4 transition-colors" style={{ color: BRAND_COLORS.softGrey }} />
                      )}
                    </button>
                  </div>
                  {loginType === 'instructor' && (
                    <p className="text-xs mt-1" style={{ color: BRAND_COLORS.darkGrey }}>
                      Use password sent by admin via email
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 border border-transparent rounded-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    }}
                    onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.light}`}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
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
                <p className="text-sm" style={{ color: BRAND_COLORS.darkGrey }}>
                  {loginConfig.hint}
                </p>
                {loginType === 'student' && (
                  <p className="text-xs mt-2" style={{ color: BRAND_COLORS.darkGrey }}>
                    Use the credentials sent to your email after payment verification.
                  </p>
                )}
                {loginType === 'instructor' && (
                  <p className="text-xs mt-2" style={{ color: BRAND_COLORS.darkGrey }}>
                    Use the credentials sent to your email by the admin.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-xs" style={{ color: BRAND_COLORS.darkGrey }}>
              By signing in, you agree to our{' '}
              <Link href="#" className="transition-colors" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
                Terms
              </Link>{' '}
              and{' '}
              <Link href="#" className="transition-colors" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
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