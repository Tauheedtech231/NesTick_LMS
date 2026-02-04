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
    { title: 'My Courses', href: '/dashboard/courses', icon: HiBookOpen },
    { title: 'Progress', href: '/dashboard/progress', icon: HiAcademicCap },
    { title: 'Profile', href: '/dashboard/profile', icon: HiUserCircle }
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
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
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
  const [mobileMenuHeight, setMobileMenuHeight] = useState(0);
  
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
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

  // GSAP animations for mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        // Calculate height for smooth animation
        const height = mobileMenuRef.current.scrollHeight;
        setMobileMenuHeight(height);
        
        // Animate mobile menu
        gsap.fromTo(
          mobileMenuRef.current,
          {
            opacity: 0,
            height: 0,
            y: -20
          },
          {
            opacity: 1,
            height: height,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          }
        );
      } else {
        if (mobileMenuRef.current) {
          gsap.to(mobileMenuRef.current, {
            opacity: 0,
            height: 0,
            y: -20,
            duration: 0.2,
            ease: "power2.in"
          });
        }
      }
    }
  }, [mobileMenuOpen]);

  // Animate dropdowns
  const animateDropdown = (element: HTMLElement, show: boolean) => {
    if (show) {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: -10,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "back.out(1.2)"
        }
      );
    } else {
      gsap.to(element, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.15,
        ease: "power2.in"
      });
    }
  };

  // Handle navigation
  const handleNavClick = useCallback((href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  }, [router]);

  // Login dropdown click handler
  const handleLoginClick = useCallback(() => {
    if (currentUser) {
      const newState = !userDropdownOpen;
      setUserDropdownOpen(newState);
      setLoginDropdownOpen(false);
      
      if (userDropdownRef.current && newState) {
        animateDropdown(userDropdownRef.current, true);
      }
    } else {
      const newState = !loginDropdownOpen;
      setLoginDropdownOpen(newState);
      setUserDropdownOpen(false);
      
      if (loginDropdownRef.current && newState) {
        animateDropdown(loginDropdownRef.current, true);
      }
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
      if (
        loginDropdownRef.current && 
        !loginDropdownRef.current.contains(event.target as Node) &&
        loginButtonRef.current && 
        !loginButtonRef.current.contains(event.target as Node)
      ) {
        setLoginDropdownOpen(false);
      }

      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(event.target as Node) &&
        userButtonRef.current && 
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle mobile sub-menu
  const toggleMobileSubMenu = useCallback((index: number) => {
    setMobileSubMenuOpen(mobileSubMenuOpen === index ? null : index);
  }, [mobileSubMenuOpen]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(!mobileMenuOpen);
  }, [mobileMenuOpen]);

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
    return currentUser.name.split(' ')[0];
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
        scrolled ? 'shadow-md backdrop-blur-sm' : ''
      }`}
      style={{
        backgroundColor: scrolled ? `${BRAND_COLORS.darkNavy}EE` : BRAND_COLORS.darkNavy
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Fixed Size */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center space-x-3">
              {/* Logo Image - Larger Size */}
              {/* <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/MANSOL HAB Logo.jpg"
                  alt="Mansol Hab Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-[#0B1C3D] to-[#1E3A8A] flex items-center justify-center">
                          <span class="text-white font-bold text-lg md:text-xl">MH</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div> */}

              {/* Text - Larger and Better Spaced */}
              <div className="flex flex-col">
                <div className="text-lg md:text-xl font-bold text-white tracking-tight transition-all duration-300 group-hover:tracking-wider">
                  MANSOL HAB
                </div>
                <div className="text-xs md:text-sm font-medium transition-all duration-300 group-hover:tracking-wider"
                     style={{ color: BRAND_COLORS.lightGrey }}>
                  School of Skills Development
                </div>
              </div>
            </div>
          </Link>

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

          {/* Right Side - Login/User Button */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="hidden lg:block relative">
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
                            {currentUser.name}
                          </div>
                          <div className="text-xs" style={{ color: BRAND_COLORS.lightGrey }}>
                            {currentUser.email}
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
              <div className="hidden lg:block relative">
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

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg transition-all duration-300 hover:bg-white/10 active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <HiX className="w-6 h-6 text-white transition-transform duration-300 rotate-0" />
              ) : (
                <HiMenu className="w-6 h-6 text-white transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="lg:hidden overflow-hidden"
        style={{
          height: mobileMenuOpen ? `${mobileMenuHeight}px` : '0px',
          transition: mobileMenuOpen ? 'height 0.3s ease-out' : 'height 0.2s ease-in'
        }}
      >
        <div 
          className="px-4 py-3 space-y-1 shadow-lg"
          style={{
            backgroundColor: BRAND_COLORS.darkNavy,
            borderTop: `1px solid ${BRAND_COLORS.softGrey}`
          }}
        >
          {navItems.map((item, idx) => (
            <div key={idx}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMobileSubMenu(idx)}
                    className="flex items-center justify-between w-full px-3 py-3 text-left rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
                  >
                    <span className="text-white font-medium transition-all duration-200 hover:tracking-wide">
                      {item.title}
                    </span>
                    <HiChevronDown className={`w-4 h-4 text-white/70 transform transition-transform duration-300 ${
                      mobileSubMenuOpen === idx ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Mobile Submenu */}
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      mobileSubMenuOpen === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 space-y-1 ml-2 border-l"
                      style={{ borderColor: BRAND_COLORS.softGrey }}>
                      {item.subItems.map((sub, sidx) => (
                        <Link
                          key={sidx}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-sm transition-all duration-300 hover:bg-white/5 hover:shadow-sm"
                          style={{ color: BRAND_COLORS.lightGrey }}
                        >
                          <div className="font-medium transition-all duration-300 hover:text-white hover:pl-2">
                            {sub.title}
                          </div>
                          <div className="text-xs mt-0.5 transition-all duration-300 hover:text-white/80 hover:pl-2" 
                               style={{ color: BRAND_COLORS.softGrey }}>
                            {sub.description}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 active:scale-[0.98]"
                >
                  <span className="text-white font-medium transition-all duration-200 hover:tracking-wide">
                    {item.title}
                  </span>
                </Link>
              )}
            </div>
          ))}

          {/* Mobile Login/User Section */}
          <div className="pt-4 border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
            {currentUser ? (
              <>
                {/* User Info */}
                <div className="px-3 py-3 mb-3 rounded-lg transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}20` }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: BRAND_COLORS.darkRoyalBlue }}>
                      {(() => {
                        const UserIcon = getUserIcon();
                        return <UserIcon className="w-4 h-4 text-white" />;
                      })()}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {currentUser.name}
                      </div>
                      <div className="text-xs" style={{ color: BRAND_COLORS.lightGrey }}>
                        {currentUser.role}
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
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-300 hover:bg-white/5 hover:shadow-sm hover:pl-4 active:scale-[0.98]"
                      style={{ color: BRAND_COLORS.lightGrey }}
                    >
                      <item.icon className="w-4 h-4 transition-transform duration-300 hover:scale-125" />
                      <span className="transition-all duration-300 hover:text-white hover:tracking-wide">
                        {item.title}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg active:scale-95"
                  style={{
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setMobileLoginDropdownOpen(!mobileLoginDropdownOpen)}
                  className="w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg active:scale-95 mb-2"
                  style={{
                    backgroundColor: BRAND_COLORS.deepRed,
                    color: BRAND_COLORS.white
                  }}
                >
                  Login
                </button>

                {/* Mobile Login Options */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    mobileLoginDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="space-y-1 rounded-lg p-2"
                    style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}15` }}>
                    {loginItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleLoginTypeSelect(item.href)}
                        className="w-full px-3 py-2 text-left rounded-md transition-all duration-300 hover:bg-white/5 hover:shadow-sm hover:pl-4 active:scale-[0.98]"
                      >
                        <div className="font-medium text-white text-sm transition-all duration-300 hover:tracking-wide">
                          {item.title}
                        </div>
                        <div className="text-xs mt-0.5 transition-all duration-300 hover:text-white/80" 
                             style={{ color: BRAND_COLORS.softGrey }}>
                          {item.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}