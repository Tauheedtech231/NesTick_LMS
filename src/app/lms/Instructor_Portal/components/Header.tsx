// app/lms/Instructor_Portal/components/Header.tsx
'use client';

import { Search, Bell, HelpCircle, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students, courses, or assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-[#6B21A8] hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-600 hover:text-[#6B21A8] hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">Dr. Sarah Khan</p>
              <p className="text-xs text-gray-500">Senior Instructor</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6B21A8] to-purple-500 flex items-center justify-center text-white font-semibold">
              SK
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}