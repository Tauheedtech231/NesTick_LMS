// app/lms/Student_Portal/components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Clock, 
  BarChart3, 
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  HelpCircle
} from 'lucide-react';

const navItems = [
  { href: '/lms/Student_Portal/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/lms/Student_Portal/courses', icon: BookOpen, label: 'My Courses' },
  { href: '/lms/Student_Portal/assignments', icon: CheckSquare, label: 'Assignments' },
  { href: '/lms/Student_Portal/quizzes', icon: HelpCircle, label: 'Quizzes' },
  { href: '/lms/Student_Portal/study-time', icon: Clock, label: 'Study Time' },
  { href: '/lms/Student_Portal/progress', icon: BarChart3, label: 'Progress Reports' },
  { href: '/lms/Student_Portal/profile', icon: User, label: 'Profile & Settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Student Portal</h1>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
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
              className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} w-full p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors`}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}