'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Palette, 
  Info, 
  Phone, 
  Smartphone,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  MapPin,
  FileText
} from 'lucide-react';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
};

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: { name: string; href: string; icon?: React.ReactNode }[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>('home');

  const menuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      href: '/Management_Portal' 
    },
    { 
      name: 'Home', 
      icon: <Home size={20} />,
      subItems: [
        { name: 'Hero Section', href: '/Management_Portal/herosection', icon: <Palette size={16} /> },
        { name: 'About Section', href: '/Management_Portal/about', icon: <Info size={16} /> },
        { name: 'Team', href: '/Management_Portal/trainers', icon: <Users size={16} /> },
        { name: 'Contact Section', href: '/Management_Portal/contact', icon: <Phone size={16} /> },
        { name: 'Footer Section', href: '/Management_Portal/footer', icon: <Smartphone size={16} /> },
      ]
    },
    { 
      name: 'About Page', 
      icon: <Info size={20} />,
      subItems: [
        { name: 'About Content', href: '/Management_Portal/about-page', icon: <FileText size={16} /> },
        { name: 'Journey', href: '/Management_Portal/journey', icon: <MapPin size={16} /> },
      ]
    },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    router.push('/Management_Portal/login');
  };

  const toggleDropdown = (name: string) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  const isSubItemActive = (subItems?: { href: string }[]) => {
    if (!subItems) return false;
    return subItems.some(item => pathname === item.href);
  };

  return (
    <aside
      className="w-64 flex flex-col shadow-lg relative overflow-hidden"
      style={{ backgroundColor: BRAND_COLORS.darkNavy }}
    >
      {/* Logo */}
      <div className="p-4 border-b flex-shrink-0" style={{ borderColor: BRAND_COLORS.darkRoyalBlue }}>
        <h1 className="font-bold text-white text-xl">
          Mansol LMS
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const isDropdownOpen = openDropdown === item.name;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isParentActive = hasSubItems && isSubItemActive(item.subItems);

          if (hasSubItems) {
            return (
              <div key={item.name} className="mb-1">
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                    isParentActive ? 'bg-white/20' : 'hover:bg-white/10'
                  } cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white">{item.icon}</span>
                    <span className="text-white text-sm">{item.name}</span>
                  </div>
                  <span className="text-white">
                    {isDropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && item.subItems && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-8 mt-1"
                    >
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 my-1 ${
                              isSubActive ? 'bg-white/20' : 'hover:bg-white/10'
                            }`}
                          >
                            <span className="text-white/70">{subItem.icon}</span>
                            <span className="text-white text-sm">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href || '#'}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-white">{item.icon}</span>
              <span className="text-white text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div className="p-4 border-t flex-shrink-0" style={{ borderColor: BRAND_COLORS.darkRoyalBlue }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
        >
          <LogOut size={20} className="text-white" />
          <span className="text-white text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}