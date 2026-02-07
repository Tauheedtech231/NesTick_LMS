// app/layout.tsx
'use client';

import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { initializeStudentData } from './utils/initializeData.ts'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize demo data if not exists
    initializeStudentData();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Student Portal - LMS</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-inter bg-gray-50 min-h-screen">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
            <Sidebar />
          </div>
          
          {/* Mobile Sidebar (handled inside Sidebar component) */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-64 w-full">
            <Header />
            <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>

        {/* Global Styles */}
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          /* Remove any default margins/padding */
          * {
            box-sizing: border-box;
          }
        `}</style>
      </body>
    </html>
  );
}