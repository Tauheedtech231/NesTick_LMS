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

  // Routes where navbar/footer should show exactly
  const exactRoutes = ["/", "/about", "/contact", "/courses"];

  // Show Navbar/Footer if pathname is in exactRoutes OR starts with /courses/
  const showNav =
    exactRoutes.includes(pathname) || pathname.startsWith("/courses/");

  return (
    <>
      {showNav && <Navbar />}
      {children}
      {showNav && <Footer />}
    </>
  );
}
