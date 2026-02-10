// app/lms/Instructor_Portal/components/Header.tsx
'use client';

import { Bell, HelpCircle, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
/* eslint-disable */
export default function Header() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch current logged-in user from localStorage
    const fetchCurrentUser = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        const instructorUsers = JSON.parse(localStorage.getItem('instructorUsers') || '[]');
        const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');

        if (userData) {
          const user = JSON.parse(userData);
          
          // If it's a demo instructor account
          if (user.email === 'instructor@gmail.com') {
            setCurrentUser({
              name: 'Demo Instructor',
              email: 'instructor@gmail.com',
              role: 'instructor',
              isDemoAccount: true,
              initials: 'DI'
            });
          }
          // If it's a real instructor from instructorUsers
          else if (user.role === 'instructor') {
            // Try to find more details from instructorUsers
            const instructorUser = instructorUsers.find((instr: any) => 
              instr.email === user.email || instr.id === user.instructorId
            );
            
            // Try to find from all instructors list
            const instructorDetails = allInstructors.find((instr: any) => 
              instr.id === user.instructorId || 
              instr.email === user.email ||
              (instructorUser && instr.id === instructorUser.id)
            );
            
            // Determine name and initials
            let name = user.name || 'Instructor';
            let initials = 'I';
            
            if (instructorDetails?.name) {
              name = instructorDetails.name;
              initials = instructorDetails.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            } else if (instructorUser?.name) {
              name = instructorUser.name;
              initials = instructorUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            } else if (user.name) {
              name = user.name;
              initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            } else {
              // Get initials from email
              initials = user.email.substring(0, 2).toUpperCase();
            }
            
            setCurrentUser({
              name,
              email: user.email,
              role: 'instructor',
              isDemoAccount: false,
              instructorId: user.instructorId,
              instructorDetails,
              initials
            });
          }
        } else {
          // Check for last instructor login as fallback
          const lastInstructorLogin = localStorage.getItem('lastInstructorLogin');
          if (lastInstructorLogin) {
            const lastLogin = JSON.parse(lastInstructorLogin);
            
            // If last login was instructor@gmail.com (demo)
            if (lastLogin.email === 'instructor@gmail.com') {
              setCurrentUser({
                name: 'Demo Instructor',
                email: 'instructor@gmail.com',
                role: 'instructor',
                isDemoAccount: true,
                initials: 'DI'
              });
            } else {
              // Try to find real instructor
              const instructorUser = instructorUsers.find((instr: any) => 
                instr.email === lastLogin.email
              );
              
              if (instructorUser) {
                const instructorDetails = allInstructors.find((instr: any) => 
                  instr.id === instructorUser.id
                );
                
                const name = instructorDetails?.name || instructorUser.name || lastLogin.email.split('@')[0];
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                
                setCurrentUser({
                  name,
                  email: lastLogin.email,
                  role: 'instructor',
                  isDemoAccount: false,
                  instructorId: instructorUser.id,
                  instructorDetails,
                  initials
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set default demo instructor
        setCurrentUser({
          name: 'Demo Instructor',
          email: 'instructor@gmail.com',
          role: 'instructor',
          isDemoAccount: true,
          initials: 'DI'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    // Listen for storage changes (in case user logs out/in from another tab)
    const handleStorageChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastInstructorLogin');
    setMobileMenuOpen(false);
    router.push('/lms/auth/login?type=instructor');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!currentUser) return 'Loading...';
    
    if (currentUser.isDemoAccount) {
      return currentUser.name;
    }
    
    // For real instructors, add a professional prefix if not already present
    const name = currentUser.name || 'Instructor';
    const hasTitle = name.includes('Dr.') || name.includes('Prof.') || name.includes('Mr.') || name.includes('Ms.');
    
    if (!hasTitle && currentUser.instructorDetails?.qualification?.toLowerCase().includes('phd')) {
      return `Dr. ${name}`;
    }
    
    return name;
  };

  // Get user role/title
  const getUserRole = () => {
    if (!currentUser) return 'Loading...';
    
    if (currentUser.isDemoAccount) {
      return 'Demo Instructor';
    }
    
    if (currentUser.instructorDetails) {
      return currentUser.instructorDetails.specialization || 
             currentUser.instructorDetails.experience || 
             'Instructor';
    }
    
    return 'Instructor';
  };

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Desktop Header */}
      <div className="hidden sm:block">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Welcome Message */}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Welcome, {getUserDisplayName()}
              </h1>
              <p className="text-sm text-gray-600">
               {getUserRole()}
              </p>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-4">
           
              
            
              
             
              
              {/* Profile with Dropdown */}
              <div className="relative group">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                      {currentUser?.isDemoAccount && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Demo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold relative">
                    {currentUser?.initials || 'I'}
                    {currentUser?.isDemoAccount && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden group-hover:block">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                    {currentUser?.isDemoAccount && (
                      <p className="text-xs text-yellow-600 mt-1">Demo Account</p>
                    )}
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/lms/Instructor_Portal/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600"
                    >
                      <User className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-purple-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Title */}
            <div className="text-center">
              <h1 className="text-base font-semibold text-gray-900">Instructor Portal</h1>
              <p className="text-xs text-gray-600">{getUserRole()}</p>
            </div>

            {/* Mobile Profile */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push('/lms/Instructor_Portal/notifications')}
                className="p-1.5 text-gray-600 hover:text-purple-600 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {currentUser?.initials || 'I'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.initials || 'I'}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {getUserDisplayName()}
                  {currentUser?.isDemoAccount && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Demo
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">{currentUser?.email}</p>
              </div>
            </div>

            {/* Menu Links */}
            <div className="space-y-1">
              <Link
                href="/lms/Instructor_Portal/profile"
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                View Profile
              </Link>

              <Link
                href="/lms/Instructor_Portal/help"
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4 mr-3" />
                Help & Support
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            {/* Course Info (if available) */}
            {currentUser?.instructorDetails?.assignedCourse && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-1">Assigned Course</p>
                <p className="text-sm text-gray-900">{currentUser.instructorDetails.assignedCourse.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {currentUser.instructorDetails.assignedCourse.duration} • {currentUser.instructorDetails.totalStudents || 0} students
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}