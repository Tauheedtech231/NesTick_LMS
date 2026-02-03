"use client";

import { useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoMail, IoCall, IoTime } from "react-icons/io5";

export default function Footer() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    programs: false,
    contact: false
  });

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "#courses" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
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
      href: "https://web.facebook.com/profile.php?id=61567152315949", 
      label: "Facebook" 
    },
    { 
      icon: <FaInstagram size={16} />, 
      href: "https://www.instagram.com/mansol.hab.training.services/", 
      label: "Instagram" 
    },
    { 
      icon: <FaLinkedinIn size={16} />, 
      href: "https://www.linkedin.com/in/mansol-hab-traning-services-b7b4b1296/", 
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
    <footer id="contact" className="bg-[#1F3A93] text-white relative overflow-hidden pt-6 pb-4 px-4 md:px-6 lg:px-8">
      {/* Animated Background Circles - Updated to blue theme */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#4A90E2] rounded-full mix-blend-soft-light filter blur-xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#FFA500] rounded-full mix-blend-soft-light filter blur-xl opacity-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content - Compact on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Brand Section - Always visible */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              {/* Logo - Updated to blue gradient */}
              <div className="w-8 h-8 bg-gradient-to-br from-[#1F3A93] to-[#4A90E2] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">MANSOL HAB</h3>
                <p className="text-xs text-gray-300">Since 2005</p>
              </div>
            </div>
            
            <p className="text-gray-200 text-xs mb-3 leading-relaxed">
              Excellence in safety education. Shaping future leaders.
            </p>
            
            {/* Social Links - Compact with updated colors */}
            <div className="flex gap-1 mb-3">
              {socialIcons.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="bg-[#4A90E2] hover:bg-[#FFA500] text-white p-1.5 rounded transition-all duration-300 flex items-center justify-center"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Always visible */}
          <div className="md:col-span-1">
            <h3 className="text-base font-bold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-1.5">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-[#FFA500] transition-all duration-300 flex items-center gap-1.5 text-xs hover:translate-x-1"
                  >
                    {/* Bullet point - Updated to orange */}
                    <span className="w-1 h-1 bg-[#FFA500] rounded-full"></span>
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
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-bold text-white">Programs</h3>
                {expandedSections.programs ? (
                  <FaChevronUp className="text-[#FFA500]" size={14} />
                ) : (
                  <FaChevronDown className="text-gray-300" size={14} />
                )}
              </button>
              
              {expandedSections.programs && (
                <ul className="space-y-1.5 mb-3">
                  {programs.map((program, idx) => (
                    <li key={idx}>
                      <a 
                        href={program.href}
                        className="text-gray-300 hover:text-[#FFA500] transition-all duration-300 flex items-center gap-1.5 text-xs"
                      >
                        <span className="w-1 h-1 bg-[#FFA500] rounded-full"></span>
                        {program.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <h3 className="text-base font-bold mb-3 text-white">Programs</h3>
              <ul className="space-y-1.5">
                {programs.map((program, idx) => (
                  <li key={idx}>
                    <a 
                      href={program.href}
                      className="text-gray-300 hover:text-[#FFA500] transition-all duration-300 flex items-center gap-1.5 text-xs hover:translate-x-1"
                    >
                      <span className="w-1 h-1 bg-[#FFA500] rounded-full"></span>
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
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className="text-base font-bold text-white">Contact</h3>
                {expandedSections.contact ? (
                  <FaChevronUp className="text-[#FFA500]" size={14} />
                ) : (
                  <FaChevronDown className="text-gray-300" size={14} />
                )}
              </button>
              
              {expandedSections.contact && (
                <div className="space-y-2 mb-3">
                  {contactInfo.map((contact, idx) => (
                    <a
                      key={idx}
                      href={contact.href}
                      className="flex items-start gap-2 text-gray-200 hover:text-[#FFA500] transition-all duration-300"
                    >
                      {/* Icon container - Updated to light blue */}
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[#4A90E2] hover:text-[#FFA500] transition-colors duration-300 flex-shrink-0">
                        {contact.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-300">{contact.label}</div>
                        <div className="text-xs leading-tight">{contact.text}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
              <h3 className="text-base font-bold mb-3 text-white">Contact Info</h3>
              <div className="space-y-2">
                {contactInfo.map((contact, idx) => (
                  <a
                    key={idx}
                    href={contact.href}
                    className="flex items-start gap-2 text-gray-200 hover:text-[#FFA500] transition-all duration-300 group"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[#4A90E2] group-hover:text-[#FFA500] transition-colors duration-300 flex-shrink-0">
                      {contact.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-300">{contact.label}</div>
                      <div className="text-xs leading-tight">{contact.text}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Compact with updated colors */}
        <div className="mt-4 pt-4 border-t border-[#4A90E2]/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="text-gray-300 text-xs text-center md:text-left">
              © {new Date().getFullYear()} MANSOL HAB Trainings
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-300">
              <a
                href="#"
                className="hover:text-[#FFA500] transition-colors duration-300"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-[#FFA500] transition-colors duration-300"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-[#FFA500] transition-colors duration-300"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>

        {/* Mobile: Contact Numbers Bar - Updated colors */}
        <div className="md:hidden mt-4 pt-3 border-t border-[#4A90E2]/30">
          <div className="flex flex-col items-center gap-2">
            <div className="text-center">
              <div className="text-xs text-gray-300 mb-1">Need Help?</div>
              <a 
                href="tel:03224700200" 
                className="text-sm font-semibold text-[#FFA500] hover:text-white transition-colors"
              >
                03224700200
              </a>
            </div>
            <div className="text-center text-xs text-gray-300">
              Available Monday to Saturday, 9 AM to 5 PM
            </div>
          </div>
        </div>
      </div>

      {/* Optimized for mobile with minimal height */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Reduce footer height specifically */
          footer#contact {
            min-height: auto !important;
            max-height: fit-content !important;
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          
          /* Reduce spacing between elements */
          footer .gap-4 {
            gap: 0.75rem !important;
          }
          
          footer .space-y-2 {
            gap: 0.5rem !important;
          }
          
          /* Make text smaller on mobile */
          footer h3 {
            font-size: 0.875rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          footer a, footer p {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </footer>
  );
}