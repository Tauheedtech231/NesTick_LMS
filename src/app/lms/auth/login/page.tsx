/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiUser, HiClock, HiArrowLeft, HiEye, HiEyeOff, HiCheckCircle, HiMail } from 'react-icons/hi'
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

// Login type configurations
const loginTypes = {
  student: {
    title: 'Student Login',
    description: 'Access your learning dashboard',
    hint: 'Use credentials sent to your email after payment verification.',
    primaryColor: BRAND_COLORS.darkRoyalBlue,
    secondaryColor: BRAND_COLORS.darkNavy
  },
  instructor: {
    title: 'Instructor Login',
    description: 'Manage courses and students',
    hint: 'Use credentials provided by admin.',
    primaryColor: BRAND_COLORS.deepRed,
    secondaryColor: BRAND_COLORS.brightRed
  },
  admin: {
    title: 'Admin Login',
    description: 'System administration',
    hint: 'Administrator access only.',
    primaryColor: BRAND_COLORS.darkGrey,
    secondaryColor: BRAND_COLORS.darkNavy
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
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-500">
            <HiCheckCircle className="w-8 h-8 text-white" />
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

// Loading fallback
function LoginLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-start">
          <div className="inline-flex items-center text-gray-600">
            <div className="w-5 h-5 rounded mr-2 bg-gray-200 animate-pulse"></div>
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-8 border-b border-gray-200">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full animate-pulse mb-4"></div>
            <div className="h-7 w-48 mx-auto bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 mx-auto bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// STUDENT LOGIN VIA API - No localStorage validation
const validateStudentLogin = async (email: string, password: string) => {
  try {
    console.log('🔍 Validating student login:', email);
    
    // Call student login API
    const response = await fetch('/api/students/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    console.log('📊 Student API Response:', result);

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      return {
        success: false,
        error: result.error || 'Login failed'
      };
    }

    if (result.success && result.data) {
      // Only save to localStorage AFTER successful authentication
      const userData = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name || result.data.fullName || result.data.studentName,
        role: 'student',
        courseId: result.data.courseId,
        courseTitle: result.data.courseTitle,
        enrollmentId: result.data.enrollmentId,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };

      return {
        success: true,
        userData,
        redirectTo: '/lms/Student_Portal'
      };
    }

    return {
      success: false,
      error: 'Invalid credentials'
    };

  } catch (error: any) {
    console.error('❌ Student login error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
};

// INSTRUCTOR LOGIN VIA API
const validateInstructorLogin = async (email: string, password: string) => {
  try {
    console.log('🔍 Sending instructor login request for:', email);
    
    const response = await fetch('/api/instructors/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    console.log('📊 Instructor API Response:', result);

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password',
          needsResend: true
        };
      }
      return {
        success: false,
        error: result.error || 'Login failed',
        needsResend: true
      };
    }

    if (result.success && result.data) {
      // Save to localStorage AFTER successful authentication
      const userData = {
        id: result.data.id,
        email: result.data.email,
        name: result.data.name,
        role: 'instructor',
        courseId: result.data.courseId,
        specialization: result.data.specialization,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };

      return {
        success: true,
        userData,
        redirectTo: '/lms/Instructor_Portal'
      };
    }

    return {
      success: false,
      error: 'Invalid credentials',
      needsResend: true
    };

  } catch (error: any) {
    console.error('❌ Instructor login error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
      needsResend: false
    };
  }
};

// ADMIN LOGIN (can also be moved to API if needed)
const validateAdminLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Invalid admin credentials'
      };
    }

    if (result.success && result.data) {
      return {
        success: true,
        userData: {
          id: result.data.id,
          email: result.data.email,
          name: result.data.name || 'Admin User',
          role: 'admin',
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        },
        redirectTo: '/lms/Admin_Portal'
      };
    }

    return {
      success: false,
      error: 'Invalid admin credentials'
    };

  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.'
    };
  }
};

// Main Login Component
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loginType = searchParams.get('type') || 'student';
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [needsResend, setNeedsResend] = useState(false);

  // Get colors based on login type
  const getColors = () => {
    switch(loginType) {
      case 'student':
        return { primary: BRAND_COLORS.darkRoyalBlue, secondary: BRAND_COLORS.darkNavy };
      case 'instructor':
        return { primary: BRAND_COLORS.deepRed, secondary: BRAND_COLORS.brightRed };
      case 'admin':
        return { primary: BRAND_COLORS.darkGrey, secondary: BRAND_COLORS.darkNavy };
      default:
        return { primary: BRAND_COLORS.darkRoyalBlue, secondary: BRAND_COLORS.darkNavy };
    }
  };

  const colors = getColors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsResend(false);
    setIsLoading(true);
    
    // Validation
    if (!formData.email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }
    
    try {
      let validation;
      
      if (loginType === 'student') {
        validation = await validateStudentLogin(formData.email, formData.password);
      } 
      else if (loginType === 'instructor') {
        validation = await validateInstructorLogin(formData.email, formData.password);
        
        if (!validation.success && validation.needsResend) {
          setNeedsResend(true);
          setError(validation.error || 'Invalid credentials');
          setIsLoading(false);
          return;
        }
      }
      else if (loginType === 'admin') {
        validation = await validateAdminLogin(formData.email, formData.password);
      }
      else {
        validation = { success: false, error: 'Invalid login type' };
      }
      
      if (validation.success) {
        // ✅ Save to localStorage ONLY AFTER successful authentication
        localStorage.setItem('currentUser', JSON.stringify(validation.userData));
        
        const userName = validation.userData?.name || validation.userData?.email.split('@')[0];
        setSuccessMessage(`Welcome back, ${userName}!`);
        setShowSuccess(true);
        
        // Redirect after success
        setTimeout(() => {
          router.push(validation.redirectTo || '/');
        }, 1500);
      } else {
        setError(validation.error || 'Invalid credentials');
      }
    } catch (error: any) {
      setError('An error occurred during login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    sessionStorage.setItem('resetEmail', formData.email);
    router.push(`/lms/auth/forgot-password?type=instructor&email=${encodeURIComponent(formData.email)}`);
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Home */}
          <div className="flex justify-start">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-red-600">
              <HiArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}
                >
                  <HiUser className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {loginTypes[loginType as keyof typeof loginTypes]?.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {loginTypes[loginType as keyof typeof loginTypes]?.description}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {/* Error Message with Forgot Password Link */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-center text-red-600 font-medium">{error}</p>
                  {needsResend && loginType === 'instructor' && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={handleForgotPassword}
                        className="text-sm text-red-600 hover:text-red-800 underline font-medium"
                      >
                        Forgot password? Click here to reset
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        New credentials will be sent to your email
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Login Type Selector */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  {['student', 'instructor', 'admin'].map((type) => {
                    const typeColors = type === 'student' ? 
                      { primary: BRAND_COLORS.darkRoyalBlue } :
                      type === 'instructor' ?
                      { primary: BRAND_COLORS.deepRed } :
                      { primary: BRAND_COLORS.darkGrey };
                    
                    return (
                      <Link
                        key={type}
                        href={`/lms/auth/login?type=${type}`}
                        className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all ${
                          loginType === type
                            ? 'text-white'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={loginType === type ? { 
                          background: `linear-gradient(135deg, ${typeColors.primary} 0%, ${typeColors.primary} 100%)`
                        } : {}}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {loginType === 'student' ? 'Email or Username' : 'Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <HiMail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={loginType === 'student' ? 'text' : 'email'}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <HiClock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <HiEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all ${
                      isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      `Sign In`
                    )}
                  </button>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {loginTypes[loginType as keyof typeof loginTypes]?.hint}
                </p>
                {loginType === 'instructor' && !error && (
                  <p className="text-xs mt-2 text-gray-500">
                    Need help? Contact administrator
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
 

  <p className="text-xs text-gray-500 mt-2">
    Don’t have an account?{' '}
    <Link href="/lms/auth/sign_up" className="text-red-600 font-semibold hover:underline">
      Sign Up
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
  );
}

// Main export with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}