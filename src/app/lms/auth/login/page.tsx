/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HiUser, HiClock, HiArrowLeft, HiEye, HiEyeOff } from 'react-icons/hi'

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
    
    // Get users from local storage
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    
    // Find user with matching email and password
    const user = users.find((u: any) => 
      u.email === formData.email && 
      u.password === formData.password &&
      u.role === loginType
    )
    
    setTimeout(() => {
      if (user) {
        // Save current user to local storage
        localStorage.setItem('currentUser', JSON.stringify(user))
        
        // Show success message
        alert(`Welcome back, ${user.name || user.email}!`)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        setError('Invalid email, password, or account type')
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
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
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                    placeholder="Enter your email"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
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
                    `Sign in as ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}`
                  )}
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  href="/lms/auth/sign_up"
                  className="font-medium text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Sign up now
                </Link>
              </p>
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