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
  const isHome = pathname === "/";

  return (
    <>
      {isHome && <Navbar />}
      {children}
      {isHome && <Footer />}
    </>
  );
}
