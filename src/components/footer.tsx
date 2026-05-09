"use client";

import { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
} from "react-icons/fa";
import Image from "next/image";

// Types
interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_name: string;
  bg_color: string;
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

interface Program {
  id: string;
  title: string;
  url: string;
}

interface ContactInfo {
  id: string;
  contact_type: string;
  label: string;
  value: string;
  url: string | null;
}

interface FooterData {
  id: string;
  logo_url: string;
  about_text: string;
  copyright_text: string;
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
  programs: Program[];
  contactInfo: ContactInfo[];
}

// Shimmer Component
const Shimmer = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
  );
};

// Get icon component by name
const getIcon = (iconName: string, bgColor: string) => {
  const iconProps = { size: 18, className: "text-white" };
  
  switch (iconName) {
    case 'FaFacebookF':
      return <FaFacebookF {...iconProps} />;
    case 'FaInstagram':
      return <FaInstagram {...iconProps} />;
    case 'FaLinkedinIn':
      return <FaLinkedinIn {...iconProps} />;
    case 'FaTiktok':
      return <FaTiktok {...iconProps} />;
    default:
      return <FaFacebookF {...iconProps} />;
  }
};

// Get social link background style
const getSocialBgStyle = (bgColor: string) => {
  if (bgColor === 'gradient') {
    return 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]';
  }
  return `bg-[${bgColor}]`;
};

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/management/footer');
        const data = await response.json();
        if (data.success && data.data) {
          setFooterData(data.data);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Helper to render contact info value with line breaks
  const renderContactValue = (value: string) => {
    return value.split('\n').map((line, i) => (
      <p key={i} className="text-gray-300 text-sm">{line}</p>
    ));
  };

  // Loading state with Shimmer
  if (isLoading) {
    return (
      <footer className="bg-gradient-to-r from-[#0f1220] via-[#15192f] to-[#0f1220] text-white relative min-h-[400px]">
        <Shimmer />
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo & About Shimmer */}
            <div>
              <div className="w-48 h-12 bg-gray-700 rounded mb-6 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="flex space-x-4 mt-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 bg-gray-700 rounded-md animate-pulse" />
                ))}
              </div>
            </div>

            {/* Quick Links Shimmer */}
            <div>
              <div className="h-8 w-32 bg-gray-700 rounded mb-6 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-5 w-24 bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </div>

            {/* Programs Shimmer */}
            <div>
              <div className="h-8 w-32 bg-gray-700 rounded mb-6 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-5 w-48 bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </div>

            {/* Contact Info Shimmer */}
            <div>
              <div className="h-8 w-32 bg-gray-700 rounded mb-6 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-5 w-36 bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (!footerData) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-r from-[#0f1220] via-[#15192f] to-[#0f1220] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo & About */}
          <div>
            <div className="relative w-48 h-12 mb-6">
              <img
                src={footerData.logo_url}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {footerData.about_text}
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4">
              {footerData.socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-md
                             ${getSocialBgStyle(social.bg_color)}
                             text-white transition hover:text-[#B11217]`}
                >
                  {getIcon(social.icon_name, social.bg_color)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-gray-300">
              {footerData.quickLinks.map((link) => (
                <li
                  key={link.id}
                  className="cursor-pointer transition hover:text-[#B11217]"
                  onClick={() => window.location.href = link.url}
                >
                  • {link.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Programs</h3>
            <ul className="space-y-3 text-gray-300">
              {footerData.programs.map((program) => (
                <li
                  key={program.id}
                  className="cursor-pointer transition hover:text-[#B11217]"
                  onClick={() => window.location.href = program.url}
                >
                  • {program.title}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Info</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              {footerData.contactInfo.map((info) => (
                <li key={info.id}>
                  {info.url ? (
                    <a
                      href={info.url}
                      target={info.contact_type === 'hours' ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className="transition hover:text-[#B11217]"
                    >
                      <strong className="text-white">{info.label}:</strong>{' '}
                      {info.contact_type === 'hours' ? (
                        renderContactValue(info.value)
                      ) : (
                        info.value
                      )}
                    </a>
                  ) : (
                    <>
                      <strong className="text-white">{info.label}:</strong>{' '}
                      {info.contact_type === 'hours' ? (
                        renderContactValue(info.value)
                      ) : (
                        info.value
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} {footerData.copyright_text}
      </div>
    </footer>
  );
}