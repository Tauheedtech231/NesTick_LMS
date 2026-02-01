// app/lms/Student_Portal/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Clock, 
  BarChart3, 
  User,
  LogOut,
  Menu,
  X,
  CheckSquare,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

const navItems = [
  { href: '/lms/Student_Portal/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/lms/Student_Portal/courses', icon: BookOpen, label: 'My Courses' },
  { href: '/lms/Student_Portal/assignments', icon: CheckSquare, label: 'Assignments' },
  { href: '/lms/Student_Portal/quizzes', icon: HelpCircle, label: 'Quizzes' },
  { href: '/lms/Student_Portal/materials', icon: FileText, label: 'Study Materials' },
  { href: '/lms/Student_Portal/study-time', icon: Clock, label: 'Study Time' },
  { href: '/lms/Student_Portal/progress', icon: BarChart3, label: 'Progress' },
  { href: '/lms/Student_Portal/profile', icon: User, label: 'Profile' },
];

interface Student {
  email: string;
  fullName: string;
  learnerId: string;
  course?: string;
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const studentData = localStorage.getItem('currentStudent');
    if (studentData) {
      try {
        setStudent(JSON.parse(studentData));
      } catch (error) {
        console.error('Error parsing student data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentStudent');
    router.push('/student-login');
    setMobileOpen(false);
    setShowProfileDropdown(false);
  };

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowProfileDropdown(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile Header - Fixed at top */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-700 to-purple-900 text-white z-50 shadow-lg h-16 rounded-b-2xl">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-purple-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center border-2 border-white/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Student Portal</h1>
                {student && (
                  <p className="text-xs text-purple-200 truncate max-w-[140px]">
                    {student.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Dropdown Button */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-600 transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {student?.fullName || 'Student'}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {student?.email}
                        </p>
                        {student?.course && (
                          <p className="text-xs text-purple-600 font-medium mt-1">
                            {student.course}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/lms/Student_Portal/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <User className="w-5 h-5" />
                      <span>My Profile</span>
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 border-t border-gray-100"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer - Rounded */}
      <div className={`
        md:hidden fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-purple-800 to-purple-900 text-white z-50
        transform transition-transform duration-300 ease-in-out rounded-r-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Sidebar Header */}
        <div className="p-6 border-b border-purple-700 rounded-tr-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                {student && (
                  <p className="text-sm text-purple-300">
                    {student.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar - Rounded */}
      <div className="hidden md:flex flex-col h-screen bg-gradient-to-b from-purple-800 to-purple-900 text-white w-64 flex-shrink-0 fixed left-0 top-0 rounded-r-2xl">
        {/* Desktop Logo Section */}
        <div className="p-6 border-b border-purple-700 rounded-tr-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">Student Portal</h1>
              {student && (
                <p className="text-sm text-purple-300 truncate mt-1">
                  {student.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation - Scroll disabled */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Profile Section */}
        <div className="p-4 border-t border-purple-700">
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{student?.fullName || 'Student'}</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-purple-200 hover:text-white transition-colors mt-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Rounded */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-700 to-purple-900 text-white z-50 shadow-2xl border-t border-purple-600 rounded-t-2xl">
        <div className="flex justify-around items-center px-2 py-3">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  isActive ? 'text-white bg-white/20' : 'text-purple-200'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center p-2 text-purple-200"
            aria-label="More menu"
          >
            <ChevronDown className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>
    </>
  );
}