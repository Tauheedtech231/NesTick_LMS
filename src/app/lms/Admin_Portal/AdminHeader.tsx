'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HiHome, HiAcademicCap, HiUserCircle, HiLogout, 
  HiMenu, HiX, HiSearch, HiChevronDown, HiCog, 
  HiBell, HiViewGrid, HiCreditCard, HiChartBar
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

  // Strict Brand Colors
  const BRAND_COLORS = {
    darkNavy: '#0B1C3D',
    darkNavyAlt: '#0F172A',
    darkRoyalBlue: '#1E293B',
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
      {/* Main Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-lg' : ''
        }`}
        style={{
          background: scrolled 
            ? `linear-gradient(to right, ${BRAND_COLORS.darkNavy}, ${BRAND_COLORS.darkRoyalBlue})` 
            : `linear-gradient(to right, ${BRAND_COLORS.darkNavyAlt}, ${BRAND_COLORS.darkRoyalBlue})`,
          borderBottom: `1px solid ${BRAND_COLORS.softGrey}20`
        }}
      >
        <div className="h-full flex items-center justify-between px-4 md:px-6">
          {/* Left Side: Logo & Navigation Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Logo - Removed Admin Portal text */}
            <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                {/* Logo removed as requested */}
              </div>
            </Link>

            {/* Dashboard Link - Desktop */}
            <Link
              href="/lms/Admin_Portal/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                isActive('/lms/Admin_Portal/dashboard') 
                  ? 'border-b-3 border-deepRed' 
                  : ''
              }`}
              style={{ 
                borderBottomColor: isActive('/lms/Admin_Portal/dashboard') ? BRAND_COLORS.deepRed : 'transparent' 
              }}
            >
              <HiHome className={`w-4 h-4 ${isActive('/lms/Admin_Portal/dashboard') ? 'text-white' : 'text-white/80'}`} />
              <span className={`font-medium text-sm transition-all duration-200 ${
                isActive('/lms/Admin_Portal/dashboard') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}>
                Dashboard
              </span>
            </Link>

            {/* Instructors Link - Desktop */}
            <Link
              href="/lms/Admin_Portal/instructors"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                isActive('/lms/Admin_Portal/instructors') 
                  ? 'border-b-3 border-deepRed' 
                  : ''
              }`}
              style={{ 
                borderBottomColor: isActive('/lms/Admin_Portal/instructors') ? BRAND_COLORS.deepRed : 'transparent' 
              }}
            >
              <HiAcademicCap className={`w-4 h-4 ${isActive('/lms/Admin_Portal/instructors') ? 'text-white' : 'text-white/80'}`} />
              <span className={`font-medium text-sm transition-all duration-200 ${
                isActive('/lms/Admin_Portal/instructors') ? 'text-white' : 'text-white/80 hover:text-white'
              }`}>
                Instructors
              </span>
            </Link>
          </div>

          {/* Right Side: Search & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="search"
                placeholder="Search..."
                className="w-56 pl-10 pr-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none placeholder-white/50 transition-all duration-200"
              />
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                ref={userButtonRef}
                onClick={toggleUserDropdown}
                className="flex items-center space-x-2 p-1 rounded-lg transition-all duration-200 hover:bg-white/10"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: BRAND_COLORS.deepRed }}>
                    <span className="text-white font-medium text-sm">
                      {currentUser?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white/80 hover:text-white">{currentUser?.name || 'Admin User'}</p>
                    <p className="text-xs text-white/60">{currentUser?.email || 'admin@example.com'}</p>
                  </div>
                </div>
                <HiChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                  isUserDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  ref={userDropdownRef}
                  className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-xl animate-in slide-in-from-top-5 duration-300 z-50"
                  style={{
                    backgroundColor: BRAND_COLORS.white,
                    border: `1px solid ${BRAND_COLORS.softGrey}`
                  }}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}>
                        <span className="text-white font-medium text-sm">
                          {currentUser?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-darkGrey text-sm">
                          {currentUser?.name || 'Admin User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {currentUser?.email || 'admin@example.com'}
                        </div>
                        <div className="mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {currentUser?.role || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                

                  {/* Logout Button */}
                  <div className="p-3 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-red-50"
                      style={{
                        backgroundColor: BRAND_COLORS.white,
                        color: BRAND_COLORS.brightRed,
                        border: `1px solid ${BRAND_COLORS.brightRed}30`
                      }}
                    >
                      <HiLogout className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              data-mobile-menu-button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg transition-all duration-300 hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6 text-white" />
              ) : (
                <HiMenu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slider */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        >
          <div 
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-80 shadow-xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: BRAND_COLORS.darkNavy,
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
                    <span className="text-white font-medium text-sm">
                      {currentUser?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{currentUser?.name || 'Admin User'}</p>
                    <p className="text-xs text-white/60">{currentUser?.email || 'admin@example.com'}</p>
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
                  className="w-full pl-10 pr-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none placeholder-white/50"
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
                  } ${isActive('/lms/Admin_Portal/dashboard') ? 'border-b-3 border-deepRed' : ''}`}
                  style={{ 
                    borderBottomColor: isActive('/lms/Admin_Portal/dashboard') ? BRAND_COLORS.deepRed : 'transparent' 
                  }}
                >
                  <HiHome className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white">Dashboard</span>
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
                  } ${isActive('/lms/Admin_Portal/instructors') ? 'border-b-3 border-deepRed' : ''}`}
                  style={{ 
                    borderBottomColor: isActive('/lms/Admin_Portal/instructors') ? BRAND_COLORS.deepRed : 'transparent' 
                  }}
                >
                  <HiAcademicCap className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white">Instructors</span>
                </Link>
              </div>

            
            </div>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t" style={{ borderColor: `${BRAND_COLORS.softGrey}30` }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200"
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

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}

export default AdminNavbar