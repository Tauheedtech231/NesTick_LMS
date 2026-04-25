'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from './AdminHeader'

// Loading component for admin layout
function AdminLayoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-56 h-screen bg-white border-r" style={{ borderColor: '#E5E7EB' }}></div>

        {/* Content Skeleton */}
        <div className="flex-1 p-4 md:p-6">
          <div className="h-10 bg-white rounded-lg shadow mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-lg shadow animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-lg shadow animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

// Admin Layout Component
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true')
    }
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    
    if (!user || user.role !== 'admin') {
      router.push('/lms/auth/login?type=admin')
    } else {
      setIsLoading(false)
    }
  }, [router])

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (isLoading) {
    return <AdminLayoutLoading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      {/* Main Content - Dynamic margin based on sidebar state */}
      <main className={`min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-14' : 'md:ml-56'
      }`}>
        <div className="p-3 md:p-4">
          {children}
        </div>
      </main>
    </div>
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