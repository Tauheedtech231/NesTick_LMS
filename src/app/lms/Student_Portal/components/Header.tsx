'use client';

import { useState, useEffect } from 'react';
import { HiLogout, HiUser, HiAcademicCap } from 'react-icons/hi';

type User = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'student';
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const userData = JSON.parse(currentUserStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/lms/auth/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B1C3D] border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Mobile sidebar placeholder (sidebar toggle handled elsewhere) */}
        <div className="lg:hidden">
          {/* Sidebar icon can be placed here */}
        </div>

        {/* Center: Always "Student Portal" */}
        <h1 className="text-base sm:text-lg font-semibold text-white text-center flex-1">
          Mansol Hub
        </h1>

        {/* Right: User Info */}
        {user && (
          <div className="flex flex-col text-right lg:flex-row lg:items-center lg:gap-3">
            {/* Mobile: Only name + email */}
            <div className="lg:hidden text-right">
              <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
              <p className="text-xs text-gray-300 truncate">{user.email}</p>
            </div>

            {/* Desktop: Full profile + logout */}
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                <HiUser className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{user.fullName}</p>
                <p className="text-xs text-gray-300">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <HiLogout className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
