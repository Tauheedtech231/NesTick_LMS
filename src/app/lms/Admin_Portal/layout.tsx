'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from './AdminHeader'
import DataInitializer from './components/DataInitializer'

// Loading component for admin layout
function AdminLayoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Skeleton */}
      <div className="h-16 bg-gradient-to-r from-purple-800 to-purple-900"></div>
      
      {/* Content Skeleton */}
      <div className="p-8">
        <div className="h-10 bg-white rounded-lg shadow mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-lg shadow animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-white rounded-lg shadow animate-pulse"></div>
      </div>
    </div>
  )
}

// Admin Layout Component
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <AdminNavbar />
        
        {/* Main Content */}
        <main className="min-h-screen">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
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