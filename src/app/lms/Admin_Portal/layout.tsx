'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  HiHome, HiBookOpen, HiUsers, HiCash, 
  HiDocumentText, HiChartBar, HiAcademicCap,
  HiFolder, HiClipboardList, HiQuestionMarkCircle,
  HiLogout, HiMenu, HiX, HiUserCircle, HiSearch
} from 'react-icons/hi'
import DataInitializer from './components/DataInitializer'

// Loading component for admin layout
function AdminLayoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-gradient-to-b from-purple-900 to-purple-800">
          <div className="p-4">
            <div className="h-10 bg-purple-700 rounded mb-6 animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-10 bg-purple-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 p-8">
          <div className="h-10 bg-white rounded-lg shadow mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-lg shadow animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-lg shadow animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Admin Sidebar Component
function AdminSidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
  const router = useRouter()

  const navItems = [
    { href: '/lms/Admin_Portal/dashboard', icon: HiHome, label: 'Dashboard' },
    { href: '/lms/Admin_Portal/courses', icon: HiBookOpen, label: 'Courses' },
    { href: '/lms/Admin_Portal/modules', icon: HiFolder, label: 'Modules' },
    { href: '/lms/Admin_Portal/teaching-materials', icon: HiDocumentText, label: 'Teaching Materials' },
    { href: '/lms/Admin_Portal/students', icon: HiUsers, label: 'Students' },
    { href: '/lms/Admin_Portal/instructors', icon: HiAcademicCap, label: 'Instructors' },
    { href: '/lms/Admin_Portal/assignments', icon: HiClipboardList, label: 'Assignments' },
    { href: '/lms/Admin_Portal/quizzes', icon: HiQuestionMarkCircle, label: 'Quizzes' },
    { href: '/lms/Admin_Portal/payments', icon: HiCash, label: 'Payments' },
    { href: '/lms/Admin_Portal/reports', icon: HiChartBar, label: 'Reports' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 w-64 bg-gradient-to-b from-purple-900 to-purple-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-0 lg:block
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-purple-700">
          <div className="flex items-center justify-between">
            <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <HiBookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Admin Portal</span>
            </Link>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:text-amber-300"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-purple-700">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-purple-800 text-white rounded-lg border border-purple-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder-purple-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-white hover:bg-purple-700 hover:text-amber-300 transition-colors group"
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                >
                  <item.icon className="w-5 h-5 group-hover:text-amber-300" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

// Admin Header Component
function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setIsDropdownOpen(false)
    router.push('/lms/auth/login?type=admin')
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 z-50 bg-gradient-to-r from-purple-800 to-purple-900 text-white border-b border-purple-700">
      <div className="h-full flex items-center justify-between px-4">
        {/* Mobile Menu Button - Hidden on desktop (lg:hidden) */}
        <div className="flex items-center space-x-3 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-amber-300"
          >
            <HiMenu className="w-6 h-6" />
          </button>
          <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <HiBookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Admin Portal</span>
          </Link>
        </div>

        {/* Empty space on desktop to center the user dropdown */}
        <div className="hidden lg:block"></div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <HiUserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{currentUser?.name || 'Admin User'}</p>
                <p className="text-xs text-purple-300">{currentUser?.email || 'admin@example.com'}</p>
              </div>
            </div>
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
              {/* User Info */}
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full mt-1">
                  {currentUser?.role || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiLogout className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Admin Layout Component
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    
    if (!user || user.role !== 'admin') {
      router.push('/lms/auth/login?type=admin')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <AdminLayoutLoading />
  }

  return (
    <>
      <DataInitializer />
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Main Content Area */}
          <main className="flex-1 pt-16 overflow-auto">
            <div className="h-full p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

// Main Admin Layout
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLayoutLoading />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  )
}