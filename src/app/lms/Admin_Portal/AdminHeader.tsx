'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  HiHome, HiBookOpen, HiUsers, HiCash, 
  HiDocumentText, HiChartBar, HiAcademicCap,
  HiFolder, HiClipboardList, HiQuestionMarkCircle,
  HiUserCircle, HiLogout, HiMenu, HiX, HiSearch,
  HiChevronDown, HiCog, HiBell, HiCalendar,
  HiViewGrid, HiCollection, HiCreditCard,
  HiDocumentReport, HiUserGroup, HiLibrary
} from 'react-icons/hi'

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

  // Brand Colors
  const BRAND_COLORS = {
    darkNavy: '#0B1C3D',
    darkRoyalBlue: '#1E3A8A',
    deepRed: '#B11217',
    white: '#FFFFFF',
    lightGrey: '#F4F6F8',
    softGrey: '#E5E7EB',
    darkGrey: '#1F2933',
    purple: '#8B5CF6',
    purpleDark: '#7C3AED',
    amber: '#F59E0B',
    emerald: '#10B981'
  }

  // Main Navigation Categories
  const navCategories = [
    {
      title: 'Learning',
      items: [
        { href: '/lms/Admin_Portal/courses', label: 'Courses', icon: HiBookOpen },
        { href: '/lms/Admin_Portal/modules', label: 'Modules', icon: HiCollection },
        { href: '/lms/Admin_Portal/teaching-materials', label: 'Materials', icon: HiLibrary },
        { href: '/lms/Admin_Portal/assignments', label: 'Assignments', icon: HiClipboardList },
        { href: '/lms/Admin_Portal/quizzes', label: 'Quizzes', icon: HiQuestionMarkCircle },
      ]
    },
    {
      title: 'Users',
      items: [
        { href: '/lms/Admin_Portal/students', label: 'Students', icon: HiUsers },
        { href: '/lms/Admin_Portal/instructors', label: 'Instructors', icon: HiAcademicCap },
        { href: '/lms/Admin_Portal/users', label: 'All Users', icon: HiUserGroup },
      ]
    },
    {
      title: 'Management',
      items: [
        { href: '/lms/Admin_Portal/payments', label: 'Payments', icon: HiCash },
        { href: '/lms/Admin_Portal/reports', label: 'Reports', icon: HiDocumentReport },
        { href: '/lms/Admin_Portal/calendar', label: 'Calendar', icon: HiCalendar },
        { href: '/lms/Admin_Portal/notifications', label: 'Notifications', icon: HiBell },
      ]
    }
  ]

  // All nav items for quick access
  const allNavItems = navCategories.flatMap(category => category.items)

  // User dropdown items
  const userDropdownItems = [
    {
      title: 'Account',
      items: [
        { href: '/lms/Admin_Portal/profile', label: 'My Profile', icon: HiUserCircle },
        { href: '/lms/Admin_Portal/settings', label: 'Settings', icon: HiCog },
        { href: '/lms/Admin_Portal/notifications', label: 'Notifications', icon: HiBell },
      ]
    },
    {
      title: 'Quick Actions',
      items: [
        { href: '/lms/Admin_Portal/dashboard', label: 'Dashboard', icon: HiViewGrid },
        { href: '/lms/Admin_Portal/reports', label: 'View Reports', icon: HiChartBar },
        { href: '/lms/Admin_Portal/payments', label: 'Payment History', icon: HiCreditCard },
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
          scrolled ? 'shadow-lg backdrop-blur-md' : ''
        }`}
        style={{
          background: scrolled 
            ? `linear-gradient(to right, ${BRAND_COLORS.purpleDark}, ${BRAND_COLORS.darkRoyalBlue})EE` 
            : `linear-gradient(to right, ${BRAND_COLORS.purple}, ${BRAND_COLORS.darkRoyalBlue})`,
          borderBottom: `1px solid ${BRAND_COLORS.softGrey}`
        }}
      >
        <div className="h-full flex items-center justify-between px-4 md:px-6">
          {/* Left Side: Logo & Navigation Dropdown */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/lms/Admin_Portal/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                <HiBookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden md:block text-white">Admin Portal</span>
            </Link>

            {/* Navigation Dropdown Button - Desktop */}
            <div className="hidden lg:block relative">
              <button
                ref={navButtonRef}
                onClick={toggleNavDropdown}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-sm active:scale-95"
              >
                <HiMenu className="w-5 h-5 text-white" />
                <span className="font-medium text-sm text-white transition-all duration-200 hover:tracking-wide">
                  Navigation
                </span>
                <HiChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                  isNavDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Navigation Dropdown Menu */}
              {isNavDropdownOpen && (
                <div
                  ref={navDropdownRef}
                  className="absolute top-full left-0 mt-2 w-80 rounded-lg shadow-xl animate-in slide-in-from-top-5 duration-300 z-50"
                  style={{
                    backgroundColor: BRAND_COLORS.darkNavy,
                    border: `1px solid ${BRAND_COLORS.softGrey}`
                  }}
                >
                  {/* Dashboard Link */}
                  <div className="p-2 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <Link
                      href="/lms/Admin_Portal/dashboard"
                      onClick={() => setIsNavDropdownOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-all duration-200 ${
                        isActive('/lms/Admin_Portal/dashboard') 
                          ? 'bg-white/10' 
                          : 'hover:bg-white/5'
                      } hover:shadow-sm active:scale-[0.98]`}
                    >
                      <HiHome className="w-5 h-5" style={{ color: BRAND_COLORS.amber }} />
                      <div className="text-left">
                        <div className="font-semibold text-white text-sm">Dashboard</div>
                        <div className="text-xs" style={{ color: BRAND_COLORS.lightGrey }}>
                          Overview and quick actions
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Navigation Categories */}
                  <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {navCategories.map((category, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider" 
                          style={{ color: BRAND_COLORS.softGrey }}>
                          {category.title}
                        </div>
                        <div className="space-y-1">
                          {category.items.map((item, itemIdx) => (
                            <Link
                              key={itemIdx}
                              href={item.href}
                              onClick={() => setIsNavDropdownOpen(false)}
                              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                                isActive(item.href) 
                                  ? 'bg-white/10' 
                                  : 'hover:bg-white/5'
                              } hover:shadow-sm hover:pl-4 active:scale-[0.98]`}
                            >
                              <item.icon className="w-4 h-4 transition-transform duration-300 hover:scale-125" 
                                style={{ color: isActive(item.href) ? BRAND_COLORS.amber : BRAND_COLORS.lightGrey }} />
                              <span className={`text-sm transition-all duration-200 hover:tracking-wide ${
                                isActive(item.href) ? 'text-white font-medium' : 'text-white/90'
                              }`}>
                                {item.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard Link - Desktop */}
            <Link
              href="/lms/Admin_Portal/dashboard"
              className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-sm active:scale-95"
            >
              <HiHome className="w-4 h-4 text-white" />
              <span className="font-medium text-sm text-white transition-all duration-200 hover:tracking-wide">
                Dashboard
              </span>
            </Link>
          </div>

          {/* Right Side: Search & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="search"
                placeholder="Search admin panel..."
                className="w-56 pl-10 pr-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 focus:outline-none placeholder-white/50 transition-all duration-200"
                style={{
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>

            {/* Notifications */}
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-sm active:scale-95">
              <HiBell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                ref={userButtonRef}
                onClick={toggleUserDropdown}
                className="flex items-center space-x-2 p-1 rounded-lg transition-all duration-200 hover:bg-white/10 hover:shadow-sm active:scale-95"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                    <HiUserCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{currentUser?.name || 'Admin User'}</p>
                    <p className="text-xs text-white/70">{currentUser?.email || 'admin@example.com'}</p>
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
                    backgroundColor: BRAND_COLORS.darkNavy,
                    border: `1px solid ${BRAND_COLORS.softGrey}`
                  }}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                        <HiUserCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {currentUser?.name || 'Admin User'}
                        </div>
                        <div className="text-xs text-white/70">
                          {currentUser?.email || 'admin@example.com'}
                        </div>
                        <div className="mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full capitalize transition-all duration-300 hover:scale-105"
                            style={{ 
                              backgroundColor: `${BRAND_COLORS.amber}20`,
                              color: BRAND_COLORS.amber
                            }}>
                            {currentUser?.role || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Dropdown Items */}
                  <div className="p-2 max-h-[40vh] overflow-y-auto">
                    {userDropdownItems.map((section, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider" 
                          style={{ color: BRAND_COLORS.softGrey }}>
                          {section.title}
                        </div>
                        <div className="space-y-1">
                          {section.items.map((item, itemIdx) => (
                            <Link
                              key={itemIdx}
                              href={item.href}
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 hover:bg-white/5 hover:shadow-sm hover:pl-4 active:scale-[0.98]"
                              style={{ color: BRAND_COLORS.lightGrey }}
                            >
                              <item.icon className="w-4 h-4 transition-transform duration-300 hover:scale-125" />
                              <span className="transition-all duration-200 hover:text-white hover:tracking-wide">
                                {item.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <div className="p-3 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
                      style={{
                        backgroundColor: BRAND_COLORS.deepRed,
                        color: BRAND_COLORS.white
                      }}
                    >
                      <HiLogout className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                      <span className="text-sm font-medium transition-all duration-200 hover:tracking-wide">
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
              className="lg:hidden p-2 rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <HiX className="w-6 h-6 text-white transition-transform duration-300" />
              ) : (
                <HiMenu className="w-6 h-6 text-white transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slider */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMobileMenu}
        >
          <div 
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-80 shadow-xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `linear-gradient(to bottom, ${BRAND_COLORS.darkNavy}, ${BRAND_COLORS.darkRoyalBlue})`,
              borderLeft: `1px solid ${BRAND_COLORS.softGrey}`
            }}
          >
            {/* Mobile Menu Header */}
            <div className="p-4 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <HiBookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-bold">Admin Portal</span>
                </div>
                <button 
                  onClick={toggleMobileMenu}
                  className="text-white hover:text-amber-300 p-2 rounded-lg hover:bg-white/10"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* User Info in Mobile Menu */}
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                    <HiUserCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{currentUser?.name || 'Admin User'}</p>
                    <p className="text-xs text-white/70">{currentUser?.email || 'admin@example.com'}</p>
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
                  className="w-full pl-10 pr-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 focus:outline-none placeholder-white/50"
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
                  <HiHome className="w-5 h-5" style={{ color: BRAND_COLORS.amber }} />
                  <span className="font-medium text-white">Dashboard</span>
                </Link>
              </div>

              {/* Navigation Categories */}
              <div className="space-y-4">
                {navCategories.map((category, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => toggleMobileSubMenu(idx)}
                      className="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg transition-all duration-200 hover:bg-white/5"
                    >
                      <span className="font-medium text-white">{category.title}</span>
                      <HiChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                        mobileSubMenuOpen === idx ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Category Submenu */}
                    {mobileSubMenuOpen === idx && (
                      <div className="pl-4 space-y-1 ml-2 border-l mt-2 mb-4 animate-in slide-in-from-left duration-300"
                        style={{ borderColor: BRAND_COLORS.softGrey }}>
                        {category.items.map((item, itemIdx) => (
                          <Link
                            key={itemIdx}
                            href={item.href}
                            onClick={toggleMobileMenu}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                              isActive(item.href) 
                                ? 'bg-white/10' 
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <item.icon className="w-4 h-4" style={{ 
                              color: isActive(item.href) ? BRAND_COLORS.amber : BRAND_COLORS.lightGrey 
                            }} />
                            <span className={`text-sm ${
                              isActive(item.href) ? 'text-white font-medium' : 'text-white/90'
                            }`}>
                              {item.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="mt-6 pt-4 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
                <div className="font-medium text-white mb-2">Quick Links</div>
                <div className="grid grid-cols-2 gap-2">
                  {userDropdownItems[1].items.slice(0, 4).map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 hover:bg-white/5 hover:shadow-sm active:scale-95"
                    >
                      <item.icon className="w-5 h-5 mb-1" style={{ color: BRAND_COLORS.amber }} />
                      <span className="text-xs text-center text-white">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
                style={{
                  backgroundColor: BRAND_COLORS.deepRed,
                  color: BRAND_COLORS.white
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