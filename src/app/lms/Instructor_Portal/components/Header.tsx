// app/lms/Instructor_Portal/components/Header.tsx
'use client';

import { Search, Bell, HelpCircle, Menu, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch current logged-in user from localStorage
    const fetchCurrentUser = () => {
      try {
        const userData = localStorage.getItem('currentUser');
        const instructorUsers = JSON.parse(localStorage.getItem('instructorUsers') || '[]');
        const allInstructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        
        console.log('Header - Current user from localStorage:', userData);
        console.log('Header - Instructor users:', instructorUsers);
        console.log('Header - All instructors:', allInstructors);

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
          console.log('No user found in localStorage, checking for fallback...');
          
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

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
          
          {/* Profile with Dropdown */}
          <div className="relative group">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {getUserDisplayName()}
                  {currentUser?.isDemoAccount && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Demo
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{getUserRole()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6B21A8] to-purple-500 flex items-center justify-center text-white font-semibold relative">
                {currentUser?.initials || 'I'}
                {currentUser?.isDemoAccount && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                )}
              </div>
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden group-hover:block">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                {currentUser?.isDemoAccount && (
                  <p className="text-xs text-yellow-600 mt-1">Demo Account</p>
                )}
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => router.push('/lms/Instructor_Portal/profile')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#6B21A8]"
                >
                  <User className="w-4 h-4 inline mr-2" />
                  View Profile
                </button>
                
                <button
                  onClick={() => router.push('/lms/Instructor_Portal/settings')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#6B21A8]"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      
      {/* Mobile Profile Info */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6B21A8] to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
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
            <p className="text-sm text-gray-500">{getUserRole()}</p>
          </div>
        </div>
      </div>
    </header>
  );
}