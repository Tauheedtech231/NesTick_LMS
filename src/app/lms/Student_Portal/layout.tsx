// app/lms/Student_Portal/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import Sidebar from './components/Sidebar'
import { initializeDemoData } from './utils/demoData' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LMS Student Portal',
  description: 'Matric/Intermediate Learning Management System',
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
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}