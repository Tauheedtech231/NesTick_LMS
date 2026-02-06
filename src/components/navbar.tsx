"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { gsap } from "gsap";
import { 
  HiMenu, 
  HiX,
  HiChevronDown,
  HiChevronRight,
  HiLogin,
  HiLogout,
  HiUserCircle,
  HiCog,
  HiAcademicCap,
  HiBookOpen,
  HiHome,
  HiInformationCircle,
  HiPhone
} from "react-icons/hi";

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933'
};

// Navbar Items
const navItems = [
  {
    title: 'Home',
    href: '/',
    icon: HiHome
  },
  {
    title: 'Courses',
    href: '/courses',
    icon: HiBookOpen,
    subItems: [
      { 
        title: 'Pipe Fitter', 
        href: '/courses/pipe-fitter',
        description: 'Industrial pipe fitting training'
      },
      { 
        title: 'Safety Inspector', 
        href: '/courses/safety-inspector',
        description: 'OSHA safety certification'
      },
      { 
        title: 'Professional Welding', 
        href: '/courses/welding',
        description: 'MIG, TIG and Arc welding'
      }
    ]
  },
  {
    title: 'About',
    href: '/about',
    icon: HiInformationCircle
  },
  {
    title: 'Contact',
    href: '/contact',
    icon: HiPhone
  }
];

// Login Dropdown Items
const loginItems = [
  { 
    title: 'Student Login', 
    type: 'student',
    href: '/lms/auth/login?type=student',
    description: 'Access your learning dashboard'
  },
  { 
    title: 'Instructor Login', 
    type: 'instructor',
    href: '/lms/auth/login?type=instructor',
    description: 'Manage courses and students'
  },
  { 
    title: 'Admin Login', 
    type: 'admin',
    href: '/lms/auth/login?type=admin',
    description: 'System administration panel'
  }
];

// Dashboard items
const dashboardItems = {
  student: [
    { title: 'Dashboard', href: '/lms/Student_Portal', icon: HiBookOpen },
  ],
  instructor: [
    { title: 'My Classes', href: '/dashboard/classes', icon: HiBookOpen },
    { title: 'Students', href: '/dashboard/students', icon: HiAcademicCap },
    { title: 'Profile', href: '/dashboard/profile', icon: HiUserCircle }
  ],
  admin: [
    { title: 'Dashboard', href: '/lms/Admin_Portal', icon: HiBookOpen },
    { title: 'Users', href: '/dashboard/users', icon: HiUserCircle },
    { title: 'Settings', href: '/dashboard/settings', icon: HiCog }
  ]
};

// User interface
interface User {
  id?: string;
  name?: string;
  email?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt?: string;
  fullName?: string;
  username?: string;
}

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<number | null>(null);
  const [mobileLoginDropdownOpen, setMobileLoginDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const userData = JSON.parse(userStr);
        let user: User;
        
        if (userData.role === 'student') {
          user = {
            id: userData.id || userData.studentId,
            name: userData.fullName || userData.name || userData.username || 'Student',
            email: userData.email || userData.studentEmail,
            role: 'student',
            fullName: userData.fullName || userData.name || userData.username,
            username: userData.username,
            createdAt: userData.registrationDate || userData.createdAt
          };
        } else if (userData.role === 'instructor') {
          user = {
            id: userData.id,
            name: userData.name || userData.email?.split('@')[0] || 'Instructor',
            email: userData.email,
            role: 'instructor',
            createdAt: userData.createdAt
          };
        } else if (userData.role === 'admin') {
          user = {
            id: userData.id,
            name: userData.name || 'Admin',
            email: userData.email,
            role: 'admin',
            createdAt: userData.createdAt
          };
        } else {
          user = {
            name: userData.name || userData.fullName || userData.username || 'User',
            email: userData.email,
            role: userData.role || 'student',
            fullName: userData.fullName,
            username: userData.username
          };
        }
        
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    }
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Login dropdown click handler
  const handleLoginClick = useCallback(() => {
    if (currentUser) {
      const newState = !userDropdownOpen;
      setUserDropdownOpen(newState);
      setLoginDropdownOpen(false);
    } else {
      const newState = !loginDropdownOpen;
      setLoginDropdownOpen(newState);
      setUserDropdownOpen(false);
    }
  }, [currentUser, userDropdownOpen, loginDropdownOpen]);

  // Handle login type selection
  const handleLoginTypeSelect = useCallback((href: string) => {
    setLoginDropdownOpen(false);
    setMobileLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(href);
  }, [router]);

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setUserDropdownOpen(false);
    setLoginDropdownOpen(false);
    setMobileLoginDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  }, [router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (
        loginDropdownRef.current && 
        !loginDropdownRef.current.contains(target) &&
        loginButtonRef.current && 
        !loginButtonRef.current.contains(target)
      ) {
        setLoginDropdownOpen(false);
      }

      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(target) &&
        userButtonRef.current && 
        !userButtonRef.current.contains(target)
      ) {
        setUserDropdownOpen(false);
      }

      if (
        mobileMenuRef.current && 
        mobileMenuOpen && 
        !mobileMenuRef.current.contains(target) &&
        !target.closest('button[aria-label="Toggle menu"]')
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Toggle mobile sub-menu
  const toggleMobileSubMenu = useCallback((index: number) => {
    setMobileSubMenuOpen(mobileSubMenuOpen === index ? null : index);
  }, [mobileSubMenuOpen]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    
    if (mobileMenuOpen) {
      setMobileSubMenuOpen(null);
      setMobileLoginDropdownOpen(false);
    }
  }, [mobileMenuOpen]);

  // Toggle mobile login dropdown
  const toggleMobileLoginDropdown = useCallback(() => {
    setMobileLoginDropdownOpen(!mobileLoginDropdownOpen);
  }, [mobileLoginDropdownOpen]);

  // Get user role icon
  const getUserIcon = useCallback(() => {
    if (!currentUser) return HiUserCircle;
    
    switch (currentUser.role) {
      case 'student': return HiAcademicCap;
      case 'instructor': return HiBookOpen;
      case 'admin': return HiCog;
      default: return HiUserCircle;
    }
  }, [currentUser]);

  // Get user display name
  const getUserDisplayName = useCallback(() => {
    if (!currentUser) return '';
    
    const name = currentUser.name || 
                 currentUser.fullName || 
                 currentUser.username || 
                 currentUser.email?.split('@')[0] || 
                 'User';
    
    if (typeof name === 'string' && name.trim() !== '') {
      const firstName = name.split(' ')[0];
      return firstName;
    }
    
    return 'User';
  }, [currentUser]);

  // Get user email
  const getUserEmail = useCallback(() => {
    if (!currentUser) return '';
    return currentUser.email || currentUser.username || 'No email provided';
  }, [currentUser]);

  // Check if link is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  // Navigation item hover effect
  const handleNavHover = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleNavLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <nav 
      ref={navRef}
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg backdrop-blur-md' : ''
      }`}
      style={{
        backgroundColor: scrolled ? `${BRAND_COLORS.darkNavy}EE` : BRAND_COLORS.darkNavy
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo - Hidden on mobile, shown on desktop */}
          <Link href="/" className="hidden lg:flex items-center">
            <div className="flex items-center">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-[60px] md:w-[60px] flex items-center justify-center">
                <img
                  src="/newlogo.jpg"
                  alt="Mansol Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </Link>

          {/* Mobile Navigation Header */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* Mobile Menu Button - Left Side */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <HiX className="w-6 h-6 text-white transition-transform duration-300" />
              ) : (
                <HiMenu className="w-6 h-6 text-white transition-transform duration-300" />
              )}
            </button>

            {/* Mobile Logo - Center */}
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center">
                <img
                  src="/newlogo.jpg"
                  alt="Mansol Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>

            {/* Placeholder for alignment */}
            <div className="w-10"></div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, idx) => (
              <div key={idx} className="relative">
                {item.subItems ? (
                  <div className="group">
                    <button
                      onMouseEnter={() => handleNavHover(idx)}
                      onMouseLeave={handleNavLeave}
                      className={`flex items-center space-x-1 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive(item.href) 
                          ? 'bg-white/10 shadow-inner' 
                          : 'hover:bg-white/5 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-white font-medium text-sm transition-all duration-200 group-hover:tracking-wide">
                        {item.title}
                      </span>
                      <HiChevronDown className="w-4 h-4 text-white/70 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    
                    {/* Submenu */}
                    <div 
                      className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform-gpu origin-top"
                      style={{
                        backgroundColor: BRAND_COLORS.darkNavy,
                        border: `1px solid ${BRAND_COLORS.softGrey}`
                      }}
                    >
                      <div className="p-2 space-y-1">
                        {item.subItems.map((sub, sidx) => (
                          <Link
                            key={sidx}
                            href={sub.href}
                            className="block px-3 py-2 rounded-md text-sm transition-all duration-150 hover:bg-white/5 hover:pl-4 hover:shadow-sm"
                            style={{ color: BRAND_COLORS.lightGrey }}
                          >
                            <div className="font-medium mb-0.5 transition-all duration-150 hover:text-white">
                              {sub.title}
                            </div>
                            <div className="text-xs transition-all duration-150 hover:text-white/80" 
                                 style={{ color: BRAND_COLORS.softGrey }}>
                              {sub.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onMouseEnter={() => handleNavHover(idx)}
                    onMouseLeave={handleNavLeave}
                    className={`px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive(item.href) 
                        ? 'bg-white/10 shadow-inner' 
                        : 'hover:bg-white/5 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-white font-medium text-sm transition-all duration-200 hover:tracking-wide">
                      {item.title}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side - Desktop Login/User Button */}
          <div className="hidden lg:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button
                  ref={userButtonRef}
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/5 hover:shadow-sm active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                    {(() => {
                      const UserIcon = getUserIcon();
                      return <UserIcon className="w-4 h-4 text-white transition-transform duration-300 hover:rotate-12" />;
                    })()}
                  </div>
                  <span className="text-white font-medium text-sm transition-all duration-200 hover:tracking-wide">
                    {getUserDisplayName()}
                  </span>
                  <HiChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div
                    ref={userDropdownRef}
                    className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl transform-gpu origin-top-right"
                    style={{
                      backgroundColor: BRAND_COLORS.darkNavy,
                      border: `1px solid ${BRAND_COLORS.softGrey}`
                    }}
                  >
                    {/* User Info */}
                    <div className="p-4 border-b" style={{ borderColor: BRAND_COLORS.softGrey }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                          style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                          {(() => {
                            const UserIcon = getUserIcon();
                            return <UserIcon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-xs" style={{ color: BRAND_COLORS.lightGrey }}>
                            {getUserEmail()}
                          </div>
                          <div className="mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize transition-all duration-300 hover:scale-105"
                              style={{ 
                                backgroundColor: `${BRAND_COLORS.darkRoyalBlue}40`,
                                color: BRAND_COLORS.lightGrey
                              }}>
                              {currentUser.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Links */}
                    <div className="p-2">
                      {dashboardItems[currentUser.role]?.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-150 hover:bg-white/5 hover:shadow-sm hover:pl-4"
                          style={{ color: BRAND_COLORS.lightGrey }}
                        >
                          <item.icon className="w-4 h-4 transition-transform duration-300 hover:scale-125" />
                          <span className="transition-all duration-150 hover:text-white hover:tracking-wide">
                            {item.title}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <div className="p-3 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center space-x-2 w-full px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
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
            ) : (
              <div className="relative">
                <button
                  ref={loginButtonRef}
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
                  style={{
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white
                  }}
                >
                  <HiLogin className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
                  <span className="text-sm transition-all duration-200 hover:tracking-wide">
                    Login
                  </span>
                </button>
                
                {/* Login Dropdown */}
                {loginDropdownOpen && (
                  <div
                    ref={loginDropdownRef}
                    className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl transform-gpu origin-top-right"
                    style={{
                      backgroundColor: BRAND_COLORS.darkNavy,
                      border: `1px solid ${BRAND_COLORS.softGrey}`
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {loginItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLoginTypeSelect(item.href)}
                          className="flex flex-col w-full px-3 py-2 rounded-md text-left transition-all duration-150 hover:bg-white/5 hover:shadow-sm hover:pl-4 active:scale-[0.98]"
                        >
                          <span className="font-medium text-white text-sm transition-all duration-150 hover:tracking-wide">
                            {item.title}
                          </span>
                          <span className="text-xs mt-0.5 transition-all duration-150 hover:text-white/80" 
                                style={{ color: BRAND_COLORS.softGrey }}>
                            {item.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - SLIDE FROM LEFT ONLY */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-in Menu from Left */}
          <div
            ref={mobileMenuRef}
            className="lg:hidden fixed top-0 bottom-0 left-0 w-full max-w-xs shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-300"
            style={{
              backgroundColor: BRAND_COLORS.darkNavy,
              borderRight: `1px solid ${BRAND_COLORS.softGrey}`,
            }}
          >
            {/* Menu Header */}
            <div className="sticky top-0 z-10 p-4 flex items-center justify-between border-b"
                 style={{ 
                   backgroundColor: BRAND_COLORS.darkNavy,
                   borderColor: BRAND_COLORS.softGrey 
                 }}>
           
              
              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-95"
                aria-label="Close menu"
              >
                <HiX className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="px-4 py-6 space-y-1">
              {navItems.map((item, idx) => (
                <div key={idx} className="border-b border-white/10 pb-1 last:border-0">
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleMobileSubMenu(idx)}
                        className="flex items-center justify-between w-full px-3 py-3 text-left rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5 text-white/70" />
                          <span className="text-white font-medium text-base transition-all duration-200">
                            {item.title}
                          </span>
                        </div>
                        <HiChevronDown className={`w-5 h-5 text-white/70 transform transition-transform duration-300 ${
                          mobileSubMenuOpen === idx ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Mobile Submenu */}
                      {mobileSubMenuOpen === idx && (
                        <div className="pl-10 pr-3 space-y-2 mt-1 mb-2 animate-in slide-in-from-top-5 duration-200">
                          {item.subItems.map((sub, sidx) => (
                            <Link
                              key={sidx}
                              href={sub.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/5 hover:shadow-sm border-l-2 border-white/20"
                              style={{ color: BRAND_COLORS.lightGrey }}
                            >
                              <div className="font-medium text-sm transition-all duration-300 hover:text-white">
                                {sub.title}
                              </div>
                              <div className="text-xs mt-0.5 transition-all duration-300 hover:text-white/80" 
                                   style={{ color: BRAND_COLORS.softGrey }}>
                                {sub.description}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-[0.98] block"
                    >
                      <item.icon className="w-5 h-5 text-white/70" />
                      <span className="text-white font-medium text-base transition-all duration-200">
                        {item.title}
                      </span>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Login/User Section */}
              <div className="pt-4 mt-3 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
                {currentUser ? (
                  <>
                    {/* User Info */}
                    <div className="px-3 py-3 mb-3 rounded-lg transition-all duration-300 hover:shadow-md"
                      style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20` }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                          {(() => {
                            const UserIcon = getUserIcon();
                            return <UserIcon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: BRAND_COLORS.lightGrey }}>
                            {getUserEmail()}
                          </div>
                          <div className="mt-1.5">
                            <span className="text-xs px-2 py-1 rounded-full capitalize transition-all duration-300"
                              style={{ 
                                backgroundColor: `${BRAND_COLORS.darkRoyalBlue}40`,
                                color: BRAND_COLORS.lightGrey
                              }}>
                              {currentUser.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Links */}
                    <div className="space-y-1 mb-3">
                      {dashboardItems[currentUser.role]?.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 hover:bg-white/5 hover:shadow-sm active:scale-[0.98]"
                          style={{ color: BRAND_COLORS.lightGrey }}
                        >
                          <item.icon className="w-4 h-4 transition-transform duration-300" />
                          <span className="transition-all duration-300 hover:text-white">
                            {item.title}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center space-x-2"
                      style={{
                        backgroundColor: BRAND_COLORS.deepRed,
                        color: BRAND_COLORS.white
                      }}
                    >
                      <HiLogout className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={toggleMobileLoginDropdown}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg active:scale-95 mb-2"
                      style={{
                        backgroundColor: BRAND_COLORS.deepRed,
                        color: BRAND_COLORS.white
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <HiLogin className="w-4 h-4" />
                        <span>Login</span>
                      </div>
                      <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        mobileLoginDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Mobile Login Options */}
                    {mobileLoginDropdownOpen && (
                      <div 
                        className="space-y-2 rounded-lg p-2 mb-3 animate-in slide-in-from-top-5 duration-300"
                        style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}15` }}
                      >
                        {loginItems.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleLoginTypeSelect(item.href)}
                            className="w-full px-3 py-2 text-left rounded-lg transition-all duration-300 hover:bg-white/5 hover:shadow-sm active:scale-[0.98]"
                          >
                            <div className="font-medium text-white text-sm transition-all duration-300">
                              {item.title}
                            </div>
                            <div className="text-xs mt-0.5 transition-all duration-300 hover:text-white/80" 
                                 style={{ color: BRAND_COLORS.softGrey }}>
                              {item.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}