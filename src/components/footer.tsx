"use client";

import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoMailOutline, IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { useState } from "react";

export default function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const quickLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const trainingPrograms = [
    { name: "Pipe Fitter", href: "#" },
    { name: "Safety Inspector", href: "#" },
    { name: "Welding", href: "#" },
  ];

  const contactInfo = [
    {
      icon: <IoCallOutline />,
      title: "Phone",
      details: [
        { text: "+92 300 1234567", href: "tel:+923001234567" },
      ]
    },
    {
      icon: <IoMailOutline />,
      title: "Email",
      details: [
        { text: "info@mansolhab.edu.pk", href: "mailto:info@mansolhab.edu.pk" },
      ]
    }
  ];

  const socialLinks = [
    {
      icon: <FaFacebookF />,
      href: "https://web.facebook.com/profile.php?id=61567152315949",
      label: "Facebook"
    },
    {
      icon: <FaInstagram />,
      href: "https://www.instagram.com/mansol.hab.training.services/",
      label: "Instagram"
    },
    {
      icon: <FaLinkedinIn />,
      href: "https://www.linkedin.com/in/mansol-hab-traning-services-b7b4b1296/",
      label: "LinkedIn"
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <footer className="bg-[#0B1C3D] text-white pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile View - Compact */}
        <div className="lg:hidden">
          
          {/* Brand Section - Always Visible */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">MANSOL HAB</h2>
            <p className="text-[#E5E7EB] text-xs mb-3">
              School of Skills Development
            </p>
            
            {/* Social Links - Small */}
            <div className="flex space-x-3 mb-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-full bg-[#1F2933] flex items-center justify-center 
                           text-[#E5E7EB] hover:bg-[#B11217] hover:text-white 
                           transition-colors duration-300 text-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Accordion */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('quicklinks')}
              className="w-full flex justify-between items-center py-2 border-b border-[#1F2933]"
            >
              <span className="text-sm font-medium">Quick Links</span>
              <span className="text-[#E5E7EB]">
                {expandedSection === 'quicklinks' ? '−' : '+'}
              </span>
            </button>
            {expandedSection === 'quicklinks' && (
              <ul className="space-y-2 pt-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#E5E7EB] hover:text-[#B11217] text-sm block py-1"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Courses - Accordion */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('courses')}
              className="w-full flex justify-between items-center py-2 border-b border-[#1F2933]"
            >
              <span className="text-sm font-medium">Courses</span>
              <span className="text-[#E5E7EB]">
                {expandedSection === 'courses' ? '−' : '+'}
              </span>
            </button>
            {expandedSection === 'courses' && (
              <ul className="space-y-2 pt-2">
                {trainingPrograms.map((program, index) => (
                  <li key={index}>
                    <a
                      href={program.href}
                      className="text-[#E5E7EB] hover:text-[#B11217] text-sm block py-1"
                    >
                      {program.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact Info - Compact */}
          <div className="mb-4">
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="text-[#E5E7EB] mr-2 mt-0.5 text-sm">
                    {info.icon}
                  </div>
                  <div>
                    {info.details.map((detail, idx) => (
                      detail.href.startsWith('tel:') || detail.href.startsWith('mailto:') ? (
                        <a
                          key={idx}
                          href={detail.href}
                          className="text-[#E5E7EB] hover:text-[#B11217] text-xs block"
                        >
                          {detail.text}
                        </a>
                      ) : (
                        <p key={idx} className="text-[#E5E7EB] text-xs">
                          {detail.text}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Desktop View - Full */}
        <div className="hidden lg:grid grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">MANSOL HAB</h2>
              <p className="text-[#E5E7EB] text-sm">
                School of Skills Development
              </p>
            </div>
            
            <p className="text-[#E5E7EB] text-sm mb-6">
              Excellence in technical and safety training.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-[#1F2933] flex items-center justify-center 
                           text-[#E5E7EB] hover:bg-[#B11217] hover:text-white 
                           transition-colors duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#E5E7EB] hover:text-[#B11217] 
                             transition-colors duration-300 inline-block text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Training Programs */}
          <div>
            <h3 className="text-lg font-bold mb-6">Courses</h3>
            <ul className="space-y-3">
              {trainingPrograms.map((program, index) => (
                <li key={index}>
                  <a
                    href={program.href}
                    className="text-[#E5E7EB] hover:text-[#B11217] 
                             transition-colors duration-300 inline-block text-sm"
                  >
                    {program.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start">
                  <div className="text-[#E5E7EB] mr-3 mt-1">
                    {info.icon}
                  </div>
                  <div>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        detail.href.startsWith('tel:') || detail.href.startsWith('mailto:') ? (
                          <a
                            key={idx}
                            href={detail.href}
                            className="text-[#E5E7EB] hover:text-[#B11217] 
                                     transition-colors duration-300 text-sm block"
                          >
                            {detail.text}
                          </a>
                        ) : (
                          <p key={idx} className="text-[#E5E7EB] text-sm">
                            {detail.text}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright - Small for mobile */}
        <div className="border-t border-[#1F2933] pt-4 mt-4">
          <div className="flex flex-col items-center">
            <div className="text-[#E5E7EB] text-xs text-center mb-2">
              © {new Date().getFullYear()} MANSOL HAB. All rights reserved.
            </div>
            
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-[#E5E7EB] hover:text-[#B11217] text-xs"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-[#E5E7EB] hover:text-[#B11217] text-xs"
              >
                Terms
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}