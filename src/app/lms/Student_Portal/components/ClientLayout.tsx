// app/components/ClientLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // No data initialization here
  }, []);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40 bg-white border-r border-gray-200"></div>
        <div className="flex-1 flex flex-col lg:ml-64 w-full">
          <div className="h-16 bg-white border-b border-gray-200"></div>
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50"></main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}