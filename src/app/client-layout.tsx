"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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

  return (
    <>
      {showNav && <Navbar />}
      {children}
      {showNav && <Footer />}
    </>
  );
}