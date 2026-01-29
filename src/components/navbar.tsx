'use client'

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  HiBookOpen
} from "react-icons/hi";

// Updated Navbar Items - LMS Structure
const navItems = [
  {
    title: 'Home',
    href: '/'
  },
  {
    title: 'Courses',
    subItems: [
      { 
        title: 'All Courses', 
        href: '#courses',
        description: 'Browse all available courses'
      },
      { 
        title: 'Short Courses', 
        href: '#courses',
        description: 'Quick skill development'
      },
      { 
        title: 'Professional Certifications', 
        href: '#courses',
        description: 'Industry-recognized credentials'
      }
    ]
  },
  {
    title: 'About Us',
    href: '/lms/about'
  },
  {
    title: 'Contact',
    href: '/lms/contact'
  }
];

// Login Dropdown Items with login types
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

// Dashboard items based on user role
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
  const [mobileHoverIndex, setMobileHoverIndex] = useState<number | null>(null);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<number | null>(null);
  const [mobileLoginDropdownOpen, setMobileLoginDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const hoverRef = useRef<HTMLDivElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();

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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section function
  const scrollToSection = useCallback((sectionId: string) => {
    if (sectionId.startsWith('#')) {
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        if (mobileMenuOpen) {
          closeMobileMenu();
        }
      }
    } else {
      router.push(sectionId);
    }
  }, [mobileMenuOpen, router]);

  // Handle navigation for desktop
  const handleDesktopNavClick = useCallback((href: string) => {
    scrollToSection(href);
  }, [scrollToSection]);

  // Handle navigation for mobile
  const handleMobileNavClick = useCallback((href: string) => {
    scrollToSection(href);
  }, [scrollToSection]);

  // GSAP Hover Animation
  const handleHover = useCallback((index: number) => {
    setActiveIndex(index);
    if (hoverRef.current) {
      const itemsCount = navItems.length;
      const totalWidth = 100;
      const itemWidth = totalWidth / itemsCount;
      const leftPosition = index * itemWidth;
      
      gsap.to(hoverRef.current, {
        width: `${itemWidth}%`,
        left: `${leftPosition}%`,
        duration: 0.3,
        ease: "power3.out"
      });
    }
  }, []);

  const handleLeave = useCallback(() => {
    setActiveIndex(null);
    if (hoverRef.current) {
      gsap.to(hoverRef.current, {
        width: 0,
        duration: 0.3,
        ease: "power3.out"
      });
    }
  }, []);

  // Login dropdown click handler
  const handleLoginClick = useCallback(() => {
    if (currentUser) {
      setUserDropdownOpen(!userDropdownOpen);
      setLoginDropdownOpen(false);
    } else {
      setLoginDropdownOpen(!loginDropdownOpen);
      setUserDropdownOpen(false);
    }
  }, [currentUser, userDropdownOpen, loginDropdownOpen]);

  // Mobile login click handler
  const handleMobileLoginClick = useCallback(() => {
    if (currentUser) {
      setMobileLoginDropdownOpen(false);
    } else {
      setMobileLoginDropdownOpen(!mobileLoginDropdownOpen);
    }
  }, [currentUser, mobileLoginDropdownOpen]);

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

  // Mobile hover effect
  const handleMobileHover = useCallback((index: number) => {
    setMobileHoverIndex(index);
  }, []);

  const handleMobileLeave = useCallback(() => {
    setMobileHoverIndex(null);
  }, []);

  // Toggle mobile sub-menu
  const toggleMobileSubMenu = useCallback((index: number) => {
    setMobileSubMenuOpen(mobileSubMenuOpen === index ? null : index);
  }, [mobileSubMenuOpen]);

  // Initialize GSAP timeline
  useEffect(() => {
    if (menuTimeline.current) {
      menuTimeline.current.kill();
    }

    menuTimeline.current = gsap.timeline({ 
      paused: true,
      defaults: { duration: 0.4, ease: "power3.out" }
    });
    
    return () => {
      if (menuTimeline.current) {
        menuTimeline.current.kill();
      }
    };
  }, []);

  // Animate mobile sub-menu
  const animateMobileSubMenu = useCallback((index: number, open: boolean) => {
    const subMenu = document.getElementById(`mobile-submenu-${index}`);
    if (subMenu) {
      if (open) {
        const contentHeight = subMenu.scrollHeight;
        gsap.to(subMenu, {
          height: contentHeight,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.fromTo(subMenu.querySelectorAll('a'), 
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, stagger: 0.05, duration: 0.2 }
        );
      } else {
        gsap.to(subMenu, {
          height: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    if (mobileMenuOpen) {
      if (mobileMenuRef.current) {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setMobileMenuOpen(false);
            setMobileHoverIndex(null);
            setMobileSubMenuOpen(null);
            setLoginDropdownOpen(false);
            setUserDropdownOpen(false);
            setMobileLoginDropdownOpen(false);
          }
        });
      }
    } else {
      setMobileMenuOpen(true);
      setTimeout(() => {
        if (mobileMenuRef.current) {
          mobileMenuRef.current.style.height = 'auto';
          const contentHeight = mobileMenuRef.current.scrollHeight;
          
          gsap.fromTo(mobileMenuRef.current, 
            { height: 0, opacity: 0 },
            { 
              height: contentHeight, 
              opacity: 1,
              duration: 0.4,
              ease: "power3.out"
            }
          );
          
          gsap.fromTo(mobileMenuRef.current.querySelectorAll('.mobile-menu-item'), 
            { opacity: 0, y: -10 },
            { 
              opacity: 1, 
              y: 0, 
              stagger: 0.05, 
              duration: 0.3, 
              ease: "power2.out" 
            }
          );
        }
      }, 10);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    if (mobileMenuRef.current) {
      gsap.to(mobileMenuRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setMobileMenuOpen(false);
          setMobileHoverIndex(null);
          setMobileSubMenuOpen(null);
          setLoginDropdownOpen(false);
          setUserDropdownOpen(false);
          setMobileLoginDropdownOpen(false);
        }
      });
    }
  }, []);

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

  // Effect for mobile sub-menu animation
  useEffect(() => {
    if (mobileSubMenuOpen !== null) {
      animateMobileSubMenu(mobileSubMenuOpen, true);
    } else {
      navItems.forEach((_, index) => {
        animateMobileSubMenu(index, false);
      });
    }
  }, [mobileSubMenuOpen, animateMobileSubMenu]);

  return (
    <nav className={`w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg py-2' : 'shadow-md py-3'
    }`}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6B21A8] to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#6B21A8] to-purple-600 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-[#6B21A8] to-purple-600 bg-clip-text text-transparent">
                MANSOL
              </span>
              <span className="text-xs text-gray-500 font-medium">
                HAB Trainings
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
            <ul className="flex space-x-1 relative">
              {navItems.map((item, idx) => (
                <li key={idx} className="relative group">
                  {item.subItems ? (
                    <>
                      <button
                        onMouseEnter={() => handleHover(idx)}
                        onMouseLeave={handleLeave}
                        onClick={() => handleDesktopNavClick('#courses')}
                        className="flex items-center space-x-2 px-5 py-3 rounded-lg text-gray-800 hover:text-[#6B21A8] transition-all duration-200 font-medium group cursor-pointer"
                      >
                        <span className="text-sm">{item.title}</span>
                        <HiChevronDown className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                      
                      {/* Sub-menu */}
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-20"
                           onMouseEnter={() => handleHover(idx)}
                           onMouseLeave={handleLeave}>
                        <div className="p-2 space-y-1">
                          {item.subItems.map((sub, sidx) => (
                            <button
                              key={sidx}
                              onClick={() => handleDesktopNavClick(sub.href)}
                              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[#6B21A8]/5 transition-all duration-200 group w-full text-left cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-800 group-hover:text-[#6B21A8] text-sm">
                                  {sub.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {sub.description}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDesktopNavClick(item.href!)}
                      onMouseEnter={() => handleHover(idx)}
                      onMouseLeave={handleLeave}
                      className="flex items-center space-x-2 px-5 py-3 rounded-lg text-gray-800 hover:text-[#6B21A8] transition-all duration-200 font-medium text-sm cursor-pointer"
                    >
                      <span>{item.title}</span>
                    </button>
                  )}
                </li>
              ))}

              {/* GSAP Hover Bottom Line */}
              <div
                ref={hoverRef}
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] rounded-full shadow-lg"
                style={{ width: 0 }}
              />
            </ul>
          </div>

          {/* Right Side - Login/User Button */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {currentUser ? (
              // User is logged in - Show User Dropdown
              <div className="relative">
                <button
                  ref={userButtonRef}
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] text-white font-medium hover:from-[#5B1890] hover:to-[#C81E5A] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    {(() => {
                      const UserIcon = getUserIcon();
                      return <UserIcon className="w-5 h-5" />;
                    })()}
                  </div>
                  <span className="text-sm">{getUserDisplayName()}</span>
                  <HiChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div
                    ref={userDropdownRef}
                    className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 z-20"
                  >
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-200/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] flex items-center justify-center">
                          {(() => {
                            const UserIcon = getUserIcon();
                            return <UserIcon className="w-6 h-6 text-white" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {currentUser.email}
                          </div>
                          <div className="mt-1">
                            <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                              currentUser.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800'
                                : currentUser.role === 'instructor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {currentUser.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dashboard Links */}
                    <div className="p-2 space-y-1">
                      {dashboardItems[currentUser.role]?.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#6B21A8]/5 transition-all duration-200 group"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <item.icon className="w-5 h-5 text-gray-500 group-hover:text-[#6B21A8]" />
                          <div className="font-medium text-gray-800 group-hover:text-[#6B21A8] text-sm">
                            {item.title}
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Logout Button */}
                    <div className="p-3 border-t border-gray-200/50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center space-x-2 w-full p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <HiLogout className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - Show Login Dropdown
              <div className="relative">
                <button
                  ref={loginButtonRef}
                  onClick={handleLoginClick}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] text-white font-medium hover:from-[#5B1890] hover:to-[#C81E5A] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="text-md">Login</span>
                  <HiChevronDown className={`w-4 h-4 transform transition-transform duration-300 ${
                    loginDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Login Dropdown */}
                {loginDropdownOpen && (
                  <div
                    ref={loginDropdownRef}
                    className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 z-20"
                  >
                    <div className="p-2 space-y-1">
                      {loginItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLoginTypeSelect(item.href)}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[#6B21A8]/5 transition-all duration-200 group w-full text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 group-hover:text-[#6B21A8] text-sm">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#DA2F6B] focus:ring-opacity-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <HiX className="w-5 h-5 transform transition-transform duration-300" />
              ) : (
                <HiMenu className="w-5 h-5 transform transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className="lg:hidden absolute right-4 mt-2 overflow-hidden bg-white rounded-xl shadow-2xl border border-gray-200 z-40"
          style={{ 
            width: 'calc(100% - 2rem)',
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          {/* Cross Icon */}
          <div className="flex justify-end p-4 border-b border-gray-200">
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#DA2F6B] focus:ring-opacity-50"
              aria-label="Close menu"
            >
              <HiX className="w-5 h-5 transform transition-transform duration-300" />
            </button>
          </div>

          <div className="py-2">
            {/* Show User Info if logged in */}
            {currentUser && (
              <div className="mobile-menu-item px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] flex items-center justify-center">
                    {(() => {
                      const UserIcon = getUserIcon();
                      return <UserIcon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate text-sm">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        currentUser.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : currentUser.role === 'instructor'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            {navItems.map((item, idx) => (
              <div key={idx} className="mobile-menu-item">
                {item.subItems ? (
                  <div className="px-3">
                    <button
                      onClick={() => {
                        toggleMobileSubMenu(idx);
                        handleMobileHover(idx);
                      }}
                      onMouseEnter={() => handleMobileHover(idx)}
                      onMouseLeave={handleMobileLeave}
                      className={`flex items-center justify-between w-full py-3 text-gray-800 font-medium text-base transition-all duration-200 border-b-2 ${
                        mobileHoverIndex === idx || mobileSubMenuOpen === idx
                          ? 'border-[#DA2F6B] bg-[#DA2F6B]/5 text-[#DA2F6B]' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span>{item.title}</span>
                      </div>
                      <HiChevronDown
                        className={`w-4 h-4 transform transition-transform duration-300 ${
                          mobileSubMenuOpen === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {/* Mobile Sub-menu */}
                    <div
                      id={`mobile-submenu-${idx}`}
                      className="overflow-hidden"
                      style={{ 
                        height: mobileSubMenuOpen === idx ? 'auto' : 0,
                        opacity: mobileSubMenuOpen === idx ? 1 : 0,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="pl-4 space-y-1 border-l-2 border-[#DA2F6B]/20 ml-2 mt-1 pb-1">
                        {item.subItems.map((sub, sidx) => (
                          <button
                            key={sidx}
                            onClick={() => handleMobileNavClick(sub.href)}
                            onMouseEnter={() => handleMobileHover(100 + sidx)}
                            onMouseLeave={handleMobileLeave}
                            className={`flex items-center justify-between py-2.5 text-gray-600 transition-all duration-200 text-sm group w-full text-left ${
                              mobileHoverIndex === 100 + sidx 
                                ? 'text-[#DA2F6B]' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-1 h-1 rounded-full bg-gray-300 group-hover:bg-[#DA2F6B] transition-colors duration-200 ${
                                mobileHoverIndex === 100 + sidx ? 'bg-[#DA2F6B]' : ''
                              }`} />
                              <span>{sub.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMobileNavClick(item.href!)}
                    onMouseEnter={() => handleMobileHover(idx)}
                    onMouseLeave={handleMobileLeave}
                    className={`flex items-center space-x-3 px-3 py-3 text-gray-800 font-medium transition-all duration-200 border-b-2 text-base w-full text-left ${
                      mobileHoverIndex === idx 
                        ? 'border-[#DA2F6B] bg-[#DA2F6B]/5 text-[#DA2F6B]' 
                        : 'border-transparent'
                    }`}
                  >
                    <span>{item.title}</span>
                  </button>
                )}
              </div>
            ))}
            
            {/* Mobile Login/User Section */}
            <div className="mobile-menu-item mt-4 px-3 relative">
              {currentUser ? (
                <>
                  {/* Dashboard Links */}
                  <div className="mb-4 space-y-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
                      Dashboard
                    </div>
                    {dashboardItems[currentUser.role]?.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={closeMobileMenu}
                        onMouseEnter={() => handleMobileHover(-10 - idx)}
                        onMouseLeave={handleMobileLeave}
                        className={`flex items-center space-x-3 py-2.5 text-gray-600 transition-all duration-200 rounded-lg text-sm ${
                          mobileHoverIndex === -10 - idx ? 'bg-[#DA2F6B]/5 text-[#DA2F6B]' : ''
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    onMouseEnter={() => handleMobileHover(-100)}
                    onMouseLeave={handleMobileLeave}
                    className={`flex items-center justify-center space-x-2 w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-95 ${
                      mobileHoverIndex === -100 ? 'scale-[1.02]' : ''
                    }`}
                  >
                    <HiLogout className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="relative w-full">
                  {/* Main Login Button */}
                  <button
                    onClick={() => setMobileLoginDropdownOpen(prev => !prev)}
                    className="flex items-center justify-center space-x-2 w-full py-3 rounded-lg bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] text-white font-medium transition-all duration-300 shadow-lg transform hover:scale-[1.02] active:scale-95"
                  >
                    <span>Login</span>
                    <HiChevronDown
                      className={`w-4 h-4 transform transition-transform duration-300 ${
                        mobileLoginDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute top-full left-0 w-full mt-1 overflow-hidden transition-all duration-300 ease-in-out z-50 ${
                      mobileLoginDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-1 border border-[#6B21A8]/20 rounded-lg p-2 bg-gray-50 shadow-lg">
                      {loginItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLoginTypeSelect(item.href)}
                          className="flex items-center justify-between w-full py-2.5 px-3 text-gray-600 transition-all duration-200 rounded-lg text-sm hover:bg-[#DA2F6B]/5 hover:text-[#DA2F6B] w-full text-left"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{item.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </nav>
  );
}