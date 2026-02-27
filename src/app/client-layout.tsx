"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Clean the pathname - remove trailing slash
  const cleanPath = pathname?.replace(/\/$/, "") || "";

  // Routes where navbar/footer should show
  const exactRoutes = ["", "/", "/about", "/contact", "/courses"];
  
  // Check if current route should show navbar
  const showNav = 
    exactRoutes.includes(cleanPath) || // exact matches
    cleanPath.startsWith("/courses/") || // courses sub-routes
    cleanPath === ""; // root path

  // CRITICAL FIX: Mobile scrolling issue
  useEffect(() => {
    // Register GSAP plugins
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Reset any scroll-blocking styles
    const resetScrollStyles = () => {
      // Remove any overflow hidden from all elements
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      document.body.style.height = "auto";
      document.body.style.minHeight = "100vh";
      document.body.style.position = "static";
      document.documentElement.style.overflow = "auto";
      document.documentElement.style.overflowY = "auto";
      document.documentElement.style.height = "auto";
      document.documentElement.style.position = "static";
      
      // Force reflow
      void document.body.offsetHeight;
    };

    // Initial reset with delay to ensure DOM is ready
    resetScrollStyles();
    
    // Double reset after a short delay for stubborn cases
    const timer1 = setTimeout(resetScrollStyles, 100);
    const timer2 = setTimeout(() => {
      resetScrollStyles();
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event("resize"));
    }, 300);

    // Handle orientation changes
    const handleOrientationChange = () => {
      resetScrollStyles();
      setTimeout(() => {
        ScrollTrigger.refresh();
        window.scrollTo(0, window.scrollY); // Force scroll position update
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    // Cleanup function
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
      
      // Kill all ScrollTriggers to prevent memory leaks
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []); // Empty dependency array - run once on mount

  // Re-run when pathname changes (page navigation)
  useEffect(() => {
    // Small delay to ensure new page is rendered
    const timer = setTimeout(() => {
      // Reset scroll styles
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      document.body.style.height = "auto";
      document.documentElement.style.overflow = "auto";
      
      // Refresh ScrollTrigger
      ScrollTrigger.refresh();
      
      // Force repaint
      window.dispatchEvent(new Event("resize"));
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {showNav && <Navbar />}
      <main className="min-h-screen w-full overflow-x-hidden">
        {children}
      </main>
      {showNav && <Footer />}
    </>
  );
}