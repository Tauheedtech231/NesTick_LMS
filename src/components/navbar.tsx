'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { 
  HiOutlineSun, 
  HiOutlineMoon, 
  HiMenu, 
  HiX,
  HiChevronDown,
  HiChevronRight,
  HiHome,
  HiCode,
  HiDeviceMobile,
  HiSearch,
  HiPhone,
  HiLogin
} from "react-icons/hi";

// Dark Mode Toggle
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative w-12 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 dark:from-gray-600 dark:to-gray-800 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 transform flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <HiOutlineMoon className="w-2 h-2 text-purple-600" />
        ) : (
          <HiOutlineSun className="w-2 h-2 text-yellow-500" />
        )}
      </div>
    </button>
  );
}

// Login Button Component - Only for Desktop now
const LoginButton = () => {
  return (
    <Link
      href="/login"
      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm"
    >
      <HiLogin className="w-4 h-4" />
      <span>Login</span>
    </Link>
  );
};

// Navbar Items
const navItems = [
  {
    title: 'Home',
    href: '/',
    icon: <HiHome className="w-4 h-4" />,
  },
  {
    title: 'Services',
    subItems: [
      { 
        title: 'Web Development', 
        href: '/services/web', 
        icon: <HiCode className="w-4 h-4" />,
        description: 'Modern web applications'
      },
      { 
        title: 'App Development', 
        href: '/services/app', 
        icon: <HiDeviceMobile className="w-4 h-4" />,
        description: 'Mobile applications'
      },
      { 
        title: 'SEO', 
        href: '/services/seo', 
        icon: <HiSearch className="w-4 h-4" />,
        description: 'Search engine optimization'
      },
    ]
  },
 
  {
    title: 'Contact',
    href: '/contact',
    icon: <HiPhone className="w-4 h-4" />,
  }
];

export default function Navbar() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileHoverIndex, setMobileHoverIndex] = useState<number | null>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // initialize timeline ref with null to satisfy TypeScript's useRef signature
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Hover Animation for desktop
  const handleHover = (index: number) => {
    setActiveIndex(index);
    if (hoverRef.current) {
      gsap.to(hoverRef.current, {
        width: "100%",
        left: `${index * 100}px`,
        duration: 0.3,
        ease: "power3.out"
      });
    }
  };

  const handleLeave = () => {
    setActiveIndex(null);
    if (hoverRef.current) {
      gsap.to(hoverRef.current, {
        width: 0,
        duration: 0.3,
        ease: "power3.out"
      });
    }
  };

  // Mobile hover effect
  const handleMobileHover = (index: number) => {
    setMobileHoverIndex(index);
  };

  const handleMobileLeave = () => {
    setMobileHoverIndex(null);
  };

  // Smooth mobile menu animation with GSAP
  useEffect(() => {
  // create timeline and store it in the ref
  menuTimeline.current = gsap.timeline({ paused: true }) as gsap.core.Timeline;
    
    if (mobileMenuRef.current) {
      menuTimeline.current
        .to(mobileMenuRef.current, {
          height: "auto",
          duration: 0.4,
          ease: "power3.out"
        })
        .fromTo(mobileMenuRef.current.querySelectorAll('.mobile-menu-item'), 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.3, ease: "power3.out" },
          "-=0.2"
        );
    }
  }, []);

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) {
      // Close menu
      menuTimeline.current?.reverse().then(() => {
        setMobileMenuOpen(false);
        setMobileHoverIndex(null);
      });
    } else {
      // Open menu
      setMobileMenuOpen(true);
      setTimeout(() => {
        menuTimeline.current?.play();
      }, 10);
    }
  };

  const closeMobileMenu = () => {
    menuTimeline.current?.reverse().then(() => {
      setMobileMenuOpen(false);
      setMobileHoverIndex(null);
    });
  };

  return (
    <nav className={`w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg py-2' : 'shadow-md py-3'
    }`}>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                LMS
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Studio
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
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
              className="flex items-center space-x-2 px-5 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium group"
            >
              {item.icon}
              <span className="text-sm">{item.title}</span>
              <HiChevronDown className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-200" />
            </button>
            
            {/* Sub-menu */}
            <div className="absolute top-full left-0 mt-1 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-20">
              <div className="p-2 space-y-1">
                {item.subItems.map((sub, sidx) => (
                  <Link
                    key={sidx}
                    href={sub.href}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                      {sub.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">
                        {sub.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {sub.description}
                      </div>
                    </div>
                    <HiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Link
            href={item.href!}
            onMouseEnter={() => handleHover(idx)}
            onMouseLeave={handleLeave}
            className="flex items-center space-x-2 px-5 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 font-medium text-sm"
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        )}
      </li>
    ))}

    {/* GSAP Hover Bottom Line */}
    <div
      ref={hoverRef}
      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
      style={{ width: 0 }}
    />
  </ul>
</div>

{/* Desktop Right Section (Login & Dark Mode) */}
<div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
  <DarkModeToggle />
  <div className="hidden lg:block">
    <LoginButton />
  </div>
</div>


          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-4">
            <DarkModeToggle />
            {/* Login is available inside the mobile menu below. Removed inline LoginButton here to avoid duplicate buttons on small screens. */}
            {/* Menu button sits in the corner; spacing increased for better touch targets. */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <HiX className="w-5 h-5" />
              ) : (
                <HiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          // absolute panel anchored to the right corner on mobile
          className="lg:hidden absolute right-4 mt-2 h-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-40"
          style={{ minWidth: 220 }}
        >
          <div className="py-2">
            {navItems.map((item, idx) => (
              <div key={idx} className="mobile-menu-item opacity-0">
                {item.subItems ? (
                  <div className="px-3">
                    <button
                      onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                      onMouseEnter={() => handleMobileHover(idx)}
                      onMouseLeave={handleMobileLeave}
                      className={`flex items-center justify-between w-full py-3 text-gray-700 dark:text-gray-200 font-medium text-base transition-all duration-200 border-b-2 ${
                        mobileHoverIndex === idx 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1 rounded-lg transition-colors duration-200 ${
                          mobileHoverIndex === idx ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {item.icon}
                        </div>
                        <span>{item.title}</span>
                      </div>
                      <HiChevronDown
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                          activeIndex === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {activeIndex === idx && (
                      <div className="pl-4 space-y-1 border-l-2 border-blue-200 dark:border-blue-800 ml-2 mt-1">
                        {item.subItems.map((sub, sidx) => (
                          <Link
                            key={sidx}
                            href={sub.href}
                            onMouseEnter={() => handleMobileHover(100 + sidx)} // Use offset to avoid conflicts
                            onMouseLeave={handleMobileLeave}
                            className={`flex items-center space-x-3 py-2.5 text-gray-600 dark:text-gray-300 transition-all duration-200 border-b-2 text-sm ${
                              mobileHoverIndex === 100 + sidx 
                                ? 'border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-transparent'
                            }`}
                            onClick={closeMobileMenu}
                          >
                            <div className={`p-1 rounded-lg transition-colors duration-200 ${
                              mobileHoverIndex === 100 + sidx ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              {sub.icon}
                            </div>
                            <span>{sub.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    onMouseEnter={() => handleMobileHover(idx)}
                    onMouseLeave={handleMobileLeave}
                    className={`flex items-center space-x-3 px-3 py-3 text-gray-700 dark:text-gray-200 font-medium transition-all duration-200 border-b-2 text-base ${
                      mobileHoverIndex === idx 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-transparent'
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <div className={`p-1 rounded-lg transition-colors duration-200 ${
                      mobileHoverIndex === idx ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Login Button - Now inside mobile menu */}
            <div className="mobile-menu-item opacity-0 mt-2 p-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/login"
                onMouseEnter={() => handleMobileHover(-1)} // Special index for login button
                onMouseLeave={handleMobileLeave}
                className={`flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold transition-all duration-200 border-b-2 text-base ${
                  mobileHoverIndex === -1 
                    ? 'border-blue-300 from-blue-600 to-blue-700 scale-105' 
                    : 'border-transparent'
                }`}
                onClick={closeMobileMenu}
              >
                <HiLogin className="w-5 h-5" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}