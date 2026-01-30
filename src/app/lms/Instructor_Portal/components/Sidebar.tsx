// app/lms/Instructor_Portal/components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  
} from 'lucide-react';

const navItems = [
  { href: '/lms/Instructor_Portal/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/lms/Instructor_Portal/courses', icon: BookOpen, label: 'Courses' },
  { href: '/lms/Instructor_Portal/students', icon: Users, label: 'Students' },
  { href: '/lms/Instructor_Portal/materials', icon: FileText, label: 'Materials' },
  { href: '/lms/Instructor_Portal/progress', icon: BarChart3, label: 'Progress' },
  { href: '/lms/Instructor_Portal/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-screen bg-[#6B21A8] transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Instructor</h1>
                <p className="text-xs text-purple-200">Portal</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#F59E0B] text-[#1F2937] shadow-md'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-purple-700 space-y-2">
       
       
        
        <button className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} w-full p-3 text-white hover:bg-purple-700 rounded-lg transition-colors`}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}