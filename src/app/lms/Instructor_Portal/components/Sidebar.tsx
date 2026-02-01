// app/lms/Instructor_Portal/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Users, FileText, BarChart3, User,
  ClipboardCheck, FileQuestion, LogOut, ChevronLeft,
  ChevronRight, Menu, X, Bell, Search
} from 'lucide-react';

const navItems = [
  { href: '/lms/Instructor_Portal/dashboard', icon: Home, label: 'Dashboard' },

  { href: '/lms/Instructor_Portal/students', icon: Users, label: 'Students' },
  { href: '/lms/Instructor_Portal/materials', icon: FileText, label: 'Materials' },
  { href: '/lms/Instructor_Portal/assignments', icon: ClipboardCheck, label: 'Assignments' },
  { href: '/lms/Instructor_Portal/quizzes', icon: FileQuestion, label: 'Quizzes' },
  { href: '/lms/Instructor_Portal/progress', icon: BarChart3, label: 'Progress' },
  { href: '/lms/Instructor_Portal/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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
      // Toggle body scroll
      document.body.classList.toggle('no-scroll', !mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileOpen(false);
      document.body.classList.remove('no-scroll');
    }
  };

  const MobileHeader = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-[#6B21A8] text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Instructor Portal</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );

  const SidebarContent = () => (
    <>
      {/* Logo - Desktop only */}
      <div className="p-4 md:p-6 border-b border-purple-700 hidden md:block">
        <div className="flex items-center justify-between">
          {!collapsed && !isMobile && (
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
          {(collapsed || isMobile) && !isMobile && (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          )}
          {!isMobile && (
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
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 md:space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileSidebar}
              className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#F59E0B] text-[#1F2937] shadow-md'
                  : 'text-white hover:bg-purple-700'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-purple-700">
        <button
          onClick={() => {
            console.log('Logout clicked');
            closeMobileSidebar();
          }}
          className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'space-x-3'} w-full p-3 rounded-lg text-white hover:bg-purple-700 transition-colors`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
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
      <div className={`
        ${isMobile 
          ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative'
        } 
        flex flex-col h-screen bg-[#6B21A8] transition-all duration-300 
        ${collapsed && !isMobile ? 'w-20' : 'w-64'}
      `}>
        <SidebarContent />
      </div>
    </>
  );
}