import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "MANSOL HAB LMS | Skills Development Portal",
  description:
    "Learning Management System for course management, student tracking, payments, performance, and reports for institute administrators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F5F5F5] text-[#1F2937]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
