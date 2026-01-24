"use client";

import { useState, useEffect } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoMail, IoCall, IoLocation, IoTime } from "react-icons/io5";

export default function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    programs: false,
    contact: false
  });

  const quickLinks = [
    { name: "Home", href: "#" },
    { name: "Courses", href: "#" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Programs", href: "#" },
  ];

  const programs = [
    { name: "BOSH", href: "#" },
    { name: "Fire Safety", href: "#" },
    { name: "OSHA", href: "#" },
    { name: "Hole Watcher", href: "#" },
    { name: "PTW System", href: "#" },
  ];

  const socialIcons = [
    { 
      icon: <FaFacebookF size={16} />, 
      href: "#", 
      label: "Facebook" 
    },
    { 
      icon: <FaInstagram size={16} />, 
      href: "#", 
      label: "Instagram" 
    },
    { 
      icon: <FaLinkedinIn size={16} />, 
      href: "#", 
      label: "LinkedIn" 
    },
  ];

  const contactInfo = [
    {
      icon: <IoCall className="text-lg" />,
      label: "General",
      text: "03224700200",
      href: "tel:03224700200"
    },
    {
      icon: <IoMail className="text-lg" />,
      label: "Email",
      text: "info@mansolhab.com",
      href: "mailto:info@mansolhab.com"
    },
    {
      icon: <IoTime className="text-lg" />,
      label: "Hours",
      text: "Mon-Sat • 9AM-5PM",
      href: "#"
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer id="contact" className="bg-[#1F2937] text-white relative overflow-hidden pt-8 pb-6 px-4 md:px-6 lg:px-8">
      {/* Animated Background Circles - Reduced */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#6B21A8] rounded-full mix-blend-soft-light filter blur-xl opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#DA2F6B] rounded-full mix-blend-soft-light filter blur-xl opacity-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content - Compact on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand Section - Always visible */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6B21A8] to-[#DA2F6B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">MANSOL HAB</h3>
                <p className="text-xs text-gray-400">Since 2005</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Excellence in safety education. Shaping future leaders.
            </p>
            
            {/* Social Links - Compact */}
            <div className="flex gap-2 mb-4">
              {socialIcons.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="bg-gray-800 hover:bg-[#F59E0B] text-white p-2 rounded transition-all duration-300 flex items-center justify-center"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Always visible */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-[#F59E0B] transition-all duration-300 flex items-center gap-2 text-sm hover:translate-x-1"
                  >
                    <span className="w-1 h-1 bg-[#F59E0B] rounded-full"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs - Collapsible on mobile */}
          <div className="md:col-span-1">
            {/* Mobile Accordion */}
            <div className="md:hidden">
              <button
                onClick={() => toggleSection('programs')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-lg font-bold text-white">Programs</h3>
                {expandedSections.programs ? (
                  <FaChevronUp className="text-[#F59E0B]" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              
              {expandedSections.programs && (
                <ul className="space-y-2 mb-4">
                  {programs.map((program, idx) => (
                    <li key={idx}>
                      <a 
                        href={program.href}
                        className="text-gray-400 hover:text-[#F59E0B] transition-all duration-300 flex items-center gap-2 text-sm"
                      >
                        <span className="w-1 h-1 bg-[#F59E0B] rounded-full"></span>
                        {program.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <h3 className="text-lg font-bold mb-4 text-white">Programs</h3>
              <ul className="space-y-2">
                {programs.map((program, idx) => (
                  <li key={idx}>
                    <a 
                      href={program.href}
                      className="text-gray-400 hover:text-[#F59E0B] transition-all duration-300 flex items-center gap-2 text-sm hover:translate-x-1"
                    >
                      <span className="w-1 h-1 bg-[#F59E0B] rounded-full"></span>
                      {program.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Information - Collapsible on mobile */}
          <div className="md:col-span-1 lg:col-span-1">
            {/* Mobile Accordion */}
            <div className="md:hidden">
              <button
                onClick={() => toggleSection('contact')}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="text-lg font-bold text-white">Contact</h3>
                {expandedSections.contact ? (
                  <FaChevronUp className="text-[#F59E0B]" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              
              {expandedSections.contact && (
                <div className="space-y-3 mb-4">
                  {contactInfo.map((contact, idx) => (
                    <a
                      key={idx}
                      href={contact.href}
                      className="flex items-start gap-3 text-gray-300 hover:text-[#F59E0B] transition-all duration-300"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B21A8] hover:text-[#F59E0B] transition-colors duration-300 flex-shrink-0">
                        {contact.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-400">{contact.label}</div>
                        <div className="text-sm leading-tight">{contact.text}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <h3 className="text-lg font-bold mb-4 text-white">Contact Info</h3>
              <div className="space-y-3">
                {contactInfo.map((contact, idx) => (
                  <a
                    key={idx}
                    href={contact.href}
                    className="flex items-start gap-3 text-gray-300 hover:text-[#F59E0B] transition-all duration-300 group"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#6B21A8] group-hover:text-[#F59E0B] transition-colors duration-300 flex-shrink-0">
                      {contact.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400">{contact.label}</div>
                      <div className="text-sm leading-tight">{contact.text}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Compact */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="text-gray-500 text-xs text-center md:text-left">
              © {new Date().getFullYear()} MANSOL HAB Trainings
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <a
                href="#"
                className="hover:text-[#F59E0B] transition-colors duration-300"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-[#F59E0B] transition-colors duration-300"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-[#F59E0B] transition-colors duration-300"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>

        {/* Mobile: Contact Numbers Bar */}
        <div className="md:hidden mt-6 pt-4 border-t border-gray-800">
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Need Help?</div>
              <a 
                href="tel:03224700200" 
                className="text-lg font-semibold text-[#F59E0B] hover:text-white transition-colors"
              >
                03224700200
              </a>
            </div>
            <div className="text-center text-xs text-gray-500">
              Available Monday to Saturday, 9 AM to 5 PM
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section Height Reduction (Global styles) */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Reduce hero section height */
          .hero-section,
          section:first-of-type {
            min-height: 70vh !important;
            max-height: 80vh !important;
          }
          
          /* Reduce hero content spacing */
          .hero-content h1 {
            font-size: 2rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          .hero-content p {
            font-size: 0.9rem !important;
            margin-bottom: 1rem !important;
          }
          
          /* Better mobile footer spacing */
          footer {
            padding-top: 1.5rem !important;
            padding-bottom: 1rem !important;
          }
          
          /* Compact content everywhere */
          section {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          
          h2 {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
          
          /* Reduce paragraph line heights */
          p {
            line-height: 1.5 !important;
            margin-bottom: 0.75rem !important;
          }
          
          /* Reduce button sizes */
          button, .btn {
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
          }
        }
      `}</style>
    </footer>
  );
}