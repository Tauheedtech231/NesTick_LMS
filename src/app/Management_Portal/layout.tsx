'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import { motion } from 'framer-motion';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8'
};

export default function ManagementPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('isAuthenticated');
    setIsAuthenticated(auth === 'true');
    
    // Agar login page nahi hai aur auth nahi hai toh login pe
    if (auth !== 'true' && pathname !== '/Management_Portal/login') {
      router.push('/Management_Portal/login');
    }
  }, [pathname, router]);

  // Loading state
  if (isAuthenticated === null && pathname !== '/Management_Portal/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Login page - no sidebar
  if (pathname === '/Management_Portal/login') {
    return <>{children}</>;
  }

  // Protected pages - with sidebar (no props needed)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-6 overflow-auto"
          style={{ backgroundColor: BRAND_COLORS.lightGrey }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}