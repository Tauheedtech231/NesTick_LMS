// components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  HiClipboardCheck,
  HiTrendingUp,
  HiCheckCircle,
} from 'react-icons/hi';
import { SiMaterialdesignicons } from 'react-icons/si';
import { FolderIcon } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activePage, setActivePage] = useState(
    pathname.split('/').pop() || 'dashboard'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Set active page based on pathname
  useEffect(() => {
    const path = pathname.split('/').pop() || 'dashboard';
    setActivePage(path);
  }, [pathname]);

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
      icon: HiClipboardCheck,
      path: '/lms/Student_Portal/mock-quizzes',
    },
    {
      id: 'progress',
      label: 'Progress Tracking',
      icon: HiTrendingUp,
      path: '/lms/Student_Portal/progress',
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: HiCheckCircle,
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

  const handleLogoClick = () => {
    router.push('/'); // Navigate to home page
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-[#0B1C3D] text-white rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
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
        {/* Brand with newlogo.jpg - Desktop */}
        <div className="hidden lg:flex items-center justify-center gap-3 p-6 border-b border-white/10">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Go to home"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              {!logoError ? (
                <Image
                  src="/newlogo.jpg"
                  alt="Mansol Hub School Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                  onError={() => setLogoError(true)}
                />
              ) : (
                // Fallback if image fails to load
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MH</span>
                </div>
              )}
            </div>
            <h1 className="text-lg font-semibold tracking-wide cursor-pointer">
              Student Portal
            </h1>
          </button>
        </div>

        {/* Mobile logo - when menu is open */}
        <div className="lg:hidden flex items-center justify-center p-4 border-b border-white/10">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="Go to home"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              {!logoError ? (
                <Image
                  src="/newlogo.jpg"
                  alt="Mansol Hub School Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">MH</span>
                </div>
              )}
            </div>
            <span className="text-sm font-medium cursor-pointer">Mansol Hub</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activePage === item.id || pathname === item.path;

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleNavigation(item.id)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all cursor-pointer
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}