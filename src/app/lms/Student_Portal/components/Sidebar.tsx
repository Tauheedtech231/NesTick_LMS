// components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiHome,
  HiBookOpen,
  HiDocumentText,
  HiChartBar,
  HiAcademicCap,
  HiUser,
  HiChevronRight,
  HiMenu,
  HiX,
} from 'react-icons/hi';

export default function Sidebar() {
  const pathname = usePathname();
  const [activePage, setActivePage] = useState(
    pathname.split('/').pop() || 'dashboard'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HiHome,
      path: '/lms/Student_Portal/dashboard',
    },
    {
      id: 'my-courses',
      label: 'My Courses',
      icon: HiBookOpen,
      path: '/lms/Student_Portal/my-courses',
    },
    {
      id: 'mock-quizzes',
      label: 'Mock Quizzes',
      icon: HiDocumentText,
      path: '/lms/Student_Portal/mock-quizzes',
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: HiChartBar,
      path: '/lms/Student_Portal/progress',
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: HiAcademicCap,
      path: '/lms/Student_Portal/certificates',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: HiUser,
      path: '/lms/Student_Portal/profile',
    },
  ];

  const handleNavigation = (id: string) => {
    setActivePage(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[#0B1C3D] text-white rounded-lg shadow-md"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <HiX className="w-5 h-5" />
        ) : (
          <HiMenu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0B1C3D] text-white flex flex-col shadow-lg z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand (desktop only) */}
        <div className="hidden lg:flex items-center justify-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
            <HiAcademicCap className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide">
            Student Portal
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id;

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleNavigation(item.id)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border-l-4 border-purple-500'
                      : 'text-gray-300 hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>

                <HiChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'rotate-90' : ''
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Footer (desktop only) */}
        <div className="hidden lg:block p-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            © 2026 Mansol Hub School
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
