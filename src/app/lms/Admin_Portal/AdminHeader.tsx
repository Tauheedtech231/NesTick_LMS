'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HiHome, 
  HiAcademicCap, 
  HiLogout, 
  HiMenu, 
  HiX, 
  HiSearch, 
  HiCreditCard, 
  HiUserCircle,
  HiTemplate,
  HiGift,
  HiCog
} from 'react-icons/hi';

/* eslint-disable */

interface AdminNavbarProps {
  toggleSidebar?: () => void;
  isOpen?: boolean;
}

// ✅ NAVIGATION ITEMS
const navItems = [
  { href: '/lms/Admin_Portal/dashboard', label: 'Dashboard', icon: HiHome },
  { href: '/lms/Admin_Portal/instructors', label: 'Instructors', icon: HiAcademicCap },
  { href: '/lms/Admin_Portal/bundles', label: 'Bundles', icon: HiGift },
  { href: '/lms/Admin_Portal/form-fields', label: 'Form Fields', icon: HiTemplate },
  { href: '/lms/Admin_Portal/profile', label: 'Profile', icon: HiUserCircle },
  { href: '/Management_Portal', label: 'Management Portal', icon: HiCog, external: false },
];
const AdminNavbar = ({ toggleSidebar, isOpen }: AdminNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<number | null>(null);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const navButtonRef = useRef<HTMLButtonElement>(null);

  const BRAND_COLORS = {
    darkNavy: '#0B1C3D',
    darkRoyalBlue: '#1E3A8A',
    deepRed: '#B11217',
    darkRed: '#B11217',
    white: '#FFFFFF',
    lightGrey: '#F4F6F8',
    softGrey: '#E5E7EB',
    darkGrey: '#1F2933',
    brightRed: '#D32F2F'
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
      if (
        userDropdownRef.current && 
        !userDropdownRef.current.contains(event.target as Node) &&
        userButtonRef.current && 
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }

      if (
        navDropdownRef.current && 
        !navDropdownRef.current.contains(event.target as Node) &&
        navButtonRef.current && 
        !navButtonRef.current.contains(event.target as Node)
      ) {
        setIsNavDropdownOpen(false);
      }

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
    localStorage.removeItem('currentUser');
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/lms/auth/login?type=admin');
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsNavDropdownOpen(false);
  };

  const toggleNavDropdown = () => {
    setIsNavDropdownOpen(!isNavDropdownOpen);
    setIsUserDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setMobileSubMenuOpen(null);
    }
  };

  const toggleMobileSubMenu = (index: number) => {
    setMobileSubMenuOpen(mobileSubMenuOpen === index ? null : index);
  };

  const isActive = (href: string) => {
    if (href === '/lms/Admin_Portal/dashboard') {
      return pathname === '/lms/Admin_Portal/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const goToProfile = () => {
    router.push('/lms/Admin_Portal/profile');
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <>
      {/* Desktop Sidebar - Fixed Width (No Collapse) */}
      <aside 
        className="fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col border-r w-64"
        style={{ borderColor: '#660000', backgroundColor: BRAND_COLORS.darkRoyalBlue }}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center border-b" style={{ borderColor: '#660000' }}>
          <button 
            onClick={handleLogoClick}
            className="flex items-center justify-center w-full hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="relative w-16 h-16">
              <Image
                src="/newlogo.jpg"
                alt="Mansol Hab"
                fill
                className="object-contain"
                priority
              />
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-3 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer px-3 py-2.5 ${
                    isActive(item.href) ? 'bg-white/15 font-medium' : ''
                  }`}
                >
                  <item.icon className="text-white/90 w-5 h-5" />
                  <span className="text-sm text-white">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t" style={{ borderColor: '#660000' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#660000' }}>
              <span className="text-white font-medium text-sm">{currentUser?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{currentUser?.name || 'Admin User'}</div>
              <div className="text-xs text-white/70 truncate">{currentUser?.email || 'admin@example.com'}</div>
            </div>
          </div>

          <div className="mt-2 flex gap-2">
            <Link
              href="/lms/Admin_Portal/profile"
              className="flex-1 text-center text-sm py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Profile
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex-1 text-sm py-1.5 rounded-lg bg-white hover:bg-white/90 transition-colors cursor-pointer"
              style={{ color: BRAND_COLORS.darkRed }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header 
        className="fixed top-0 left-0 right-0 h-16 z-40 flex md:hidden items-center justify-between px-4 shadow-md"
        style={{ backgroundColor: BRAND_COLORS.darkRed }}
      >
        <button 
          onClick={handleLogoClick}
          className="flex items-center space-x-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <div className="relative w-10 h-10">
            <Image
              src="/newlogo.jpg"
              alt="Mansol Hab"
              fill
              className="object-contain"
              priority
            />
          </div>
        </button>

        <button
          data-mobile-menu-button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Slider */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50 cursor-pointer"
          onClick={toggleMobileMenu}
        >
          <div 
            ref={mobileMenuRef}
            className="absolute top-0 right-0 h-full w-80 shadow-xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: BRAND_COLORS.darkRed,
              borderLeft: `1px solid ${BRAND_COLORS.softGrey}20`
            }}
          >
            {/* Mobile Menu Header */}
            <div className="p-4 border-b" style={{ borderColor: '#660000' }}>
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={handleLogoClick}
                  className="flex items-center space-x-2 hover:opacity-90 hover:cursor-pointer transition-opacity cursor-pointer"
                >
                  <div className="relative w-12 h-12">
                    <Image
                      src="/newlogo.jpg"
                      alt="Mansol Hab"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </button>
                <button 
                  onClick={toggleMobileMenu}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* User Info in Mobile Menu */}
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#660000' }}>
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
            <div className="p-4 border-b" style={{ borderColor: '#660000' }}>
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
              {navItems.map((item) => (
                <div key={item.href} className="mb-2">
                  <Link
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive(item.href) 
                        ? 'bg-white/15' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-white/80" />
                    <span className="font-medium text-white text-sm">{item.label}</span>
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t" style={{ borderColor: '#660000' }}>
              <div className="flex gap-2">
                <Link
                  href="/lms/Admin_Portal/profile"
                  onClick={toggleMobileMenu}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm border border-white/30 text-white hover:bg-white/10 cursor-pointer"
                >
                  <HiUserCircle className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm cursor-pointer"
                  style={{
                    backgroundColor: BRAND_COLORS.white,
                    color: BRAND_COLORS.darkRed,
                    border: `1px solid ${BRAND_COLORS.darkRed}30`
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
      <div className="hidden md:block ml-64"></div>
      <div className="h-16 md:hidden"></div>
    </>
  );
};

export default AdminNavbar;