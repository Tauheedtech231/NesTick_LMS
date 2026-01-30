// app/lms/Instructor_Portal/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { initializeDemoData } from './utils/demoData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Instructor Portal - LMS',
  description: 'Professional Instructor Dashboard for Learning Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize demo data on client side
  if (typeof window !== 'undefined') {
    initializeDemoData()
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}