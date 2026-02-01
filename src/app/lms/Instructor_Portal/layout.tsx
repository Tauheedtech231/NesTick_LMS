// app/lms/Instructor_Portal/layout.tsx
'use client';

import { useEffect } from 'react';

import { Inter } from 'next/font/google'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { initializeDemoData } from './utils/demoData'


const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Instructor Portal - LMS',
//   description: 'Professional Instructor Dashboard for Learning Management System',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeDemoData()
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Mobile Sidebar (includes mobile header) */}
          <div className="md:hidden">
            <Sidebar />
          </div>
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Main Content with Desktop Header */}
          <div className="flex-1 flex flex-col">
            {/* Desktop Header */}
            <div className="hidden md:block">
              <Header />
            </div>
            
            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}