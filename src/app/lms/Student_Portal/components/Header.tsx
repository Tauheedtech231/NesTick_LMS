'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [search, setSearch] = useState('')

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses, materials, assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side - Icons */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-6 h-6 text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="font-medium text-text-primary">Ali Ahmed</p>
              <p className="text-sm text-text-secondary">Student ID: STU001</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="font-bold text-white">AA</span>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <Menu className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  )
}