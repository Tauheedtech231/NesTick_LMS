// components/AdminNavbar.tsx - FIXED VERSION
'use client'

import Link from 'next/link'
import { HiMenu, HiBookOpen, HiUserCircle } from 'react-icons/hi'
import { useState, useEffect } from 'react'
/* eslint-disable */

interface AdminNavbarProps {
  toggleSidebar: () => void
}

export default function AdminNavbar({ toggleSidebar }: AdminNavbarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    setCurrentUser(user)
  }, [])

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-800 to-purple-900 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
            <span className="font-bold">LMS Admin</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <p className="text-xs text-purple-300">{currentUser?.email}</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
            <HiUserCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}