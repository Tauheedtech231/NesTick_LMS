// app/lms/Admin_Portal/components/AdminNavbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  HiHome, 
  HiAcademicCap, 
  HiLogout, 
  HiMenu, 
  HiX, 
  HiSearch, 
  HiCreditCard, 
  HiUserCircle,
  HiTemplate      // ✅ For Form Fields
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

  // ✅ NAVIGATION ITEMS - Added Form Fields
  const navItems = [
    { href: '/lms/Admin_Portal/dashboard', label: 'Dashboard', icon: HiHome },
    { href: '/lms/Admin_Portal/instructors', label: 'Instructors', icon: HiAcademicCap },
    { href: '/lms/Admin_Portal/payments', label: 'Payments', icon: HiCreditCard },
    // ✅ NEW: Form Fields Tab
    { href: '/lms/Admin_Portal/form-fields', label: 'Form Fields', icon: HiTemplate },
    { href: '/lms/Admin_Portal/profile', label: 'Profile', icon: HiUserCircle },
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

  // Navigate to profile
  const goToProfile = () => {
    router.push('/lms/Admin_Portal/profile')
    setIsUserDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Sidebar (fixed, visible on md and up) */}
      <aside 
        className="fixed left-0 top-0 bottom-0 w-72 z-50 hidden md:flex flex-col border-r" 
        style={{ borderColor: '#1E407F', backgroundColor: BRAND_COLORS.darkRoyalBlue }}
      >
        {/* Logo Section with Real Logo */}
        <div className="h-20 flex items-center px-4 border-b" style={{ borderColor: '#1E407F' }}>
          <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-3">
            <div className="relative w-12 h-12">
              <Image
                src="/newlogo.jpg"
                alt="Mansol Hab"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-base font-semibold text-white">Mansol Hab</div>
              <div className="text-sm text-white/80">Admin Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {/* Dashboard */}
            <li>
              <Link 
                href="/lms/Admin_Portal/dashboard" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
                  isActive('/lms/Admin_Portal/dashboard') ? 'bg-white/10 font-medium' : ''
                }`}
              >
                <HiHome className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Dashboard</span>
              </Link>
            </li>

            {/* Instructors */}
            <li>
              <Link 
                href="/lms/Admin_Portal/instructors" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
                  isActive('/lms/Admin_Portal/instructors') ? 'bg-white/10 font-medium' : ''
                }`}
              >
                <HiAcademicCap className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Instructors</span>
              </Link>
            </li>

            {/* Payments */}
            <li>
              <Link 
                href="/lms/Admin_Portal/payments" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
                  isActive('/lms/Admin_Portal/payments') ? 'bg-white/10 font-medium' : ''
                }`}
              >
                <HiCreditCard className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Payments</span>
              </Link>
            </li>

            {/* ✅ NEW: Form Fields */}
            <li>
              <Link 
                href="/lms/Admin_Portal/form-fields" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
                  isActive('/lms/Admin_Portal/form-fields') ? 'bg-white/10 font-medium' : ''
                }`}
              >
                <HiTemplate className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Form Fields</span>
              </Link>
            </li>

            {/* Profile */}
            <li>
              <Link 
                href="/lms/Admin_Portal/profile" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 ${
                  isActive('/lms/Admin_Portal/profile') ? 'bg-white/10 font-medium' : ''
                }`}
              >
                <HiUserCircle className="w-5 h-5 text-white/90" />
                <span className="text-base text-white">Profile</span>
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

          <div className="mt-3 flex gap-2">
            <Link
              href="/lms/Admin_Portal/profile"
              className="flex-1 text-center text-base py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Profile
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex-1 text-base py-2 rounded-lg bg-white hover:bg-white/90 transition-colors"
              style={{ color: BRAND_COLORS.deepRed }}
            >
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
          <div className="relative w-8 h-8">
            <Image
              src="/newlogo.jpg"
              alt="Mansol Hab"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-white font-semibold text-base">Mansol Hab</span>
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
              backgroundColor: BRAND_COLORS.darkRoyalBlue,
              borderLeft: `1px solid ${BRAND_COLORS.softGrey}20`
            }}
          >
            {/* Mobile Menu Header with Logo */}
            <div className="p-4 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="relative w-10 h-10">
                    <Image
                      src="/newlogo.jpg"
                      alt="Mansol Hab"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="text-white font-bold text-lg">Mansol Hab</span>
                </div>
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

              {/* ✅ NEW: Form Fields Link in Mobile */}
              <div className="mb-4">
                <Link
                  href="/lms/Admin_Portal/form-fields"
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/lms/Admin_Portal/form-fields') 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <HiTemplate className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white text-base">Form Fields</span>
                </Link>
              </div>

              {/* Profile Link */}
              <div className="mb-4">
                <Link
                  href="/lms/Admin_Portal/profile"
                  onClick={toggleMobileMenu}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/lms/Admin_Portal/profile') 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <HiUserCircle className="w-5 h-5 text-white/80" />
                  <span className="font-medium text-white text-base">Profile</span>
                </Link>
              </div>
            </div>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t" style={{ borderColor: `${BRAND_COLORS.softGrey}30` }}>
              <div className="flex gap-2">
                <Link
                  href="/lms/Admin_Portal/profile"
                  onClick={toggleMobileMenu}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 text-base border border-white/30 text-white hover:bg-white/10"
                >
                  <HiUserCircle className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 text-base"
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
        </div>
      )}

      {/* Spacer for fixed header (mobile) and sidebar (desktop) */}
      <div className="h-16 md:h-0"></div>
    </>
  )
}

export default AdminNavbar