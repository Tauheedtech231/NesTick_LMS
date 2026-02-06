// app/lms/Student_Portal/layout.tsx
'use client'


import { initializeDemoData } from './utils/demoData'
import { useEffect } from 'react'

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initializeDemoData()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50">
    

      <main className="flex-1 md:ml-64">
        <div className="mobile-content md:mobile-content-none">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Global styles should ideally be in globals.css */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-content {
            padding-top: 80px !important;
            padding-bottom: 80px !important;
            min-height: 100vh;
          }
        }

        @media (min-width: 769px) {
          .mobile-content-none {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
