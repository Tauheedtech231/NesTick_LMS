// app/lms/Instructor_Portal/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  HiHome, HiBookOpen, 
 HiUser, HiClipboardList, 
  HiQuestionMarkCircle, HiLogout, HiChevronLeft,
  HiChevronRight, HiMenu, HiX, HiCollection,
  HiAcademicCap,  HiBell, HiSearch
} from 'react-icons/hi';

const navItems = [
  { href: '/lms/Instructor_Portal/dashboard', icon: HiHome, label: 'Dashboard' },
  { href: '/lms/Instructor_Portal/courses', icon: HiBookOpen, label: 'Courses' },
  { href: '/lms/Instructor_Portal/quizzes', icon: HiQuestionMarkCircle, label: 'Mock Quizzes' },
  { href: '/lms/Instructor_Portal/students', icon: HiClipboardList, label: 'Students' },
  { href: '/lms/Instructor_Portal/profile', icon: HiUser, label: 'Profile' },
];

/* eslint-disable */

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Brand Colors from theme
  const BRAND_COLORS = {
    darkNavy: '#0B1C3D',
    darkNavyAlt: '#0F172A',
    darkRoyalBlue: '#1E293B',
    deepBlue: '#1E40AF',
    purple: '#7C3AED',
    white: '#FFFFFF',
    lightGrey: '#F4F6F8',
    softGrey: '#E5E7EB',
    darkGrey: '#1F2933',
    brightRed: '#D32F2F'
  };

  useEffect(() => {
    // Get instructor data from localStorage
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'instructor') {
        setCurrentUser(user);
      }
    }

    // Check mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    closeMobileSidebar();
    router.push('/lms/auth/login?type=instructor');
  };

  // Get user initials
  const getUserInitials = () => {
    if (!currentUser) return 'I';
    
    if (currentUser.fullName) {
      return currentUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    } else if (currentUser.username) {
      return currentUser.username.substring(0, 2).toUpperCase();
    } else if (currentUser.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    
    return 'I';
  };

  const MobileHeader = () => (
    <div 
      className="flex items-center justify-between p-4 border-b"
      style={{
        backgroundColor: BRAND_COLORS.darkNavy,
        borderBottomColor: `${BRAND_COLORS.softGrey}20`
      }}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          style={{ backgroundColor: BRAND_COLORS.deepBlue }}
        >
          {mobileOpen ? (
            <HiX className="w-6 h-6 text-white" />
          ) : (
            <HiMenu className="w-6 h-6 text-white" />
          )}
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Instructor Portal</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
          <HiSearch className="w-5 h-5 text-white/80" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-full relative transition-all duration-200">
          <HiBell className="w-5 h-5 text-white/80" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div 
        className="p-4 md:p-6 border-b"
        style={{ borderBottomColor: `${BRAND_COLORS.softGrey}30` }}
      >
        <div className="flex items-center justify-between">
          {!collapsed && !isMobile && (
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: BRAND_COLORS.deepBlue }}
              >
                <HiAcademicCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Instructor</h1>
                <p className="text-xs text-white/60">Portal</p>
              </div>
            </div>
          )}
          {(collapsed || isMobile) && !isMobile && (
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto"
              style={{ backgroundColor: BRAND_COLORS.deepBlue }}
            >
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
          )}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
            >
              {collapsed ? (
                <HiChevronRight className="w-5 h-5 text-white/80" />
              ) : (
                <HiChevronLeft className="w-5 h-5 text-white/80" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Profile - Desktop Only */}
      {!isMobile && currentUser && !collapsed && (
        <div 
          className="px-4 py-3 border-b"
          style={{ borderBottomColor: `${BRAND_COLORS.softGrey}30` }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: BRAND_COLORS.deepBlue }}
            >
              <span className="text-white font-medium text-sm">
                {getUserInitials()}
              </span>
            </div>
            <div>
              <div className="font-medium text-white text-sm truncate">
                {currentUser.fullName || currentUser.email?.split('@')[0] || 'Instructor'}
              </div>
              <div className="text-xs text-white/60 truncate">
                {currentUser.specialization || 'Instructor'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 md:space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileSidebar}
              className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              style={{ 
                backgroundColor: isActive ? BRAND_COLORS.deepBlue + '40' : 'transparent',
                borderLeft: isActive ? `3px solid ${BRAND_COLORS.deepBlue}` : 'none'
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div 
        className="p-4 border-t"
        style={{ borderTopColor: `${BRAND_COLORS.softGrey}30` }}
      >
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'space-x-3'} w-full p-3 rounded-lg transition-all duration-200 hover:bg-white/10 text-white`}
        >
          <HiLogout className="w-5 h-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      {isMobile && <MobileHeader />}

      {/* Mobile Overlay */}
      {mobileOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar for Desktop and Mobile */}
      <div 
        className={`
          ${isMobile 
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative'
          } 
          flex flex-col h-screen transition-all duration-300 
          ${collapsed && !isMobile ? 'w-20' : 'w-64'}
        `}
        style={{ backgroundColor: BRAND_COLORS.darkNavy }}
      >
        <SidebarContent />
      </div>
    </>
  );
}