'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HiHome, HiAcademicCap, HiLogout, 
  HiMenu, HiX, HiSearch, 
  HiCreditCard, HiChartBar
} from 'react-icons/hi'
/* eslint-disable */

interface AdminNavbarProps {
  toggleSidebar?: () => void;
  isOpen?: boolean;
}

const AdminNavbar = ({ toggleSidebar, isOpen }: AdminNavbarProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<number | null>(null)
  
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const navDropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const navButtonRef = useRef<HTMLButtonElement>(null)

  // Consistent brand colors
  const BRAND_COLORS = {
    darkNavy: '#0B1C3D',
    darkRoyalBlue: '#1E3A8A',      // main background
    deepRed: '#B11217',
    white: '#FFFFFF',
    lightGrey: '#F4F6F8',
    softGrey: '#E5E7EB',
    darkGrey: '#1F2933',
    brightRed: '#D32F2F'
  }

  // Main Navigation - Only Instructor and Dashboard
  const navCategories = [
    {
      title: 'Management',
      items: [
        { href: '/lms/Admin_Portal/instructors', label: 'Instructors', icon: HiAcademicCap },
      ]
    }
  ]

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    setCurrentUser(user)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user dropdown
      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(event.target as Node) &&
        userButtonRef.current && 
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }

      // Close nav dropdown
      if (
        navDropdownRef.current && 
        !navDropdownRef.current.contains(event.target as Node) &&
        navButtonRef.current && 
        !navButtonRef.current.contains(event.target as Node)
      ) {
        setIsNavDropdownOpen(false);
      }

      // Close mobile menu
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-mobile-menu-button]')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setIsUserDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push('/lms/auth/login?type=admin')
  }

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen)
    setIsNavDropdownOpen(false)
  }

  const toggleNavDropdown = () => {
    setIsNavDropdownOpen(!isNavDropdownOpen)
    setIsUserDropdownOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (isMobileMenuOpen) {
      setMobileSubMenuOpen(null)
    }
  }

  // Toggle mobile sub-menu
  const toggleMobileSubMenu = (index: number) => {
    setMobileSubMenuOpen(mobileSubMenuOpen === index ? null : index)
  }

  // Check if link is active
  const isActive = (href: string) => {
    if (href === '/lms/Admin_Portal/dashboard') {
      return pathname === '/lms/Admin_Portal/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar (fixed, visible on md and up) */}
      <aside 
        className="fixed left-0 top-0 bottom-0 w-72 z-50 hidden md:flex flex-col border-r" 
        style={{ borderColor: '#1E407F', backgroundColor: BRAND_COLORS.darkRoyalBlue }}
      >
        <div className="h-20 flex items-center px-4 border-b" style={{ borderColor: '#1E407F' }}>
          <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
              <span className="text-white font-bold text-base">A</span>
            </div>
            <div>
              <div className="text-base font-semibold text-white">Admin Portal</div>
              <div className="text-sm text-white/80">Dashboard</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/lms/Admin_Portal/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${isActive('/lms/Admin_Portal/dashboard') ? 'bg-white/10 font-medium' : ''}`}>
                <HiHome className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/lms/Admin_Portal/instructors" className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${isActive('/lms/Admin_Portal/instructors') ? 'bg-white/10 font-medium' : ''}`}>
                <HiAcademicCap className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Instructors</span>
              </Link>
            </li>
            <li>
              <Link href="/lms/Admin_Portal/payments" className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${isActive('/lms/Admin_Portal/payments') ? 'bg-white/10 font-medium' : ''}`}>
                <HiCreditCard className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Payments</span>
              </Link>
            </li>
         
          </ul>
        </nav>

        <div className="p-4 border-t" style={{ borderColor: '#1E407F' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
              <span className="text-white font-medium text-base">{currentUser?.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <div className="text-base font-medium text-white">{currentUser?.name || 'Admin User'}</div>
              <div className="text-sm text-white/80">{currentUser?.email || 'admin@example.com'}</div>
            </div>
          </div>

          <div className="mt-3">
            <button onClick={handleLogout} className="w-full text-base py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header (fixed, visible only on mobile) */}
      <header 
        className="fixed top-0 left-0 right-0 h-16 z-40 flex md:hidden items-center justify-between px-4 shadow-md"
        style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}
      >
        <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.deepRed }}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-semibold text-base">Admin Portal</span>
        </Link>

        <button
          data-mobile-menu-button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Slider (off-canvas) */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={toggleMobileMenu}
        >
          <div 
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-80 shadow-xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: BRAND_COLORS.darkRoyalBlue, // consistent background
              borderLeft: `1px solid ${BRAND_COLORS.softGrey}20`
            }}
          >
            {/* Mobile Menu Header */}
            <div className="p-4 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={toggleMobileMenu}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* User Info in Mobile Menu */}
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}>
                    <span className="text-white font-medium text-base">
                      {currentUser?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-base font-medium text-white">{currentUser?.name || 'Admin User'}</p>
                    <p className="text-sm text-white/60">{currentUser?.email || 'admin@example.com'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none placeholder-white/50 text-base"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 240px)' }}>
              {/* Dashboard Link */}
              <div className="mb-4">
                <Link
                  href="/lms/Admin_Portal/dashboard"
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/lms/Admin_Portal/dashboard') 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <HiHome className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white text-base">Dashboard</span>
                </Link>
              </div>

              {/* Instructors Link */}
              <div className="mb-4">
                <Link
                  href="/lms/Admin_Portal/instructors"
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/lms/Admin_Portal/instructors') 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <HiAcademicCap className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white text-base">Instructors</span>
                </Link>
              </div>

              {/* Payments Link */}
              <div className="mb-4">
                <Link
                  href="/lms/Admin_Portal/payments"
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/lms/Admin_Portal/payments') 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <HiCreditCard className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white text-base">Payments</span>
                </Link>
              </div>

              {/* Reports Link */}
              <div className="mb-4">
                <Link
                  href="/lms/Admin_Portal/reports"
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/lms/Admin_Portal/reports') 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <HiChartBar className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white text-base">Reports</span>
                </Link>
              </div>
            </div>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t" style={{ borderColor: `${BRAND_COLORS.softGrey}30` }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 text-base"
                style={{
                  backgroundColor: BRAND_COLORS.white,
                  color: BRAND_COLORS.brightRed,
                  border: `1px solid ${BRAND_COLORS.brightRed}30`
                }}
              >
                <HiLogout className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header (mobile) and sidebar (desktop) */}
      <div className="h-16 md:h-0"></div>
    </>
  )
}

export default AdminNavbar