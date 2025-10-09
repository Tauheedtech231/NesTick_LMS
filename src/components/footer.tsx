"use client";

import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoMail, IoCall, IoLocation } from "react-icons/io5";

export default function Footer() {
  const links = [
    { name: "Home", href: "#" },
    { name: "Courses", href: "#" },
    { name: "Tutors", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const socialIcons = [
    { icon: <FaFacebookF />, href: "#", color: "hover:bg-blue-600" },
    { icon: <FaTwitter />, href: "#", color: "hover:bg-blue-400" },
    { icon: <FaInstagram />, href: "#", color: "hover:bg-pink-600" },
    { icon: <FaLinkedinIn />, href: "#", color: "hover:bg-blue-700" },
  ];

  const contactInfo = [
    {
      icon: <IoCall className="text-lg" />,
      text: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: <IoMail className="text-lg" />,
      text: "info@mansol.com",
      href: "mailto:info@mansol.com"
    },
    {
      icon: <IoLocation className="text-lg" />,
      text: "123 Education Street, Learning City, 12345",
      href: "#"
    }
  ];

  return (
    <footer className="bg-gray-900 text-gray-100 relative overflow-hidden py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MANSOL
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Learn from industry experts and advance your career with our professional courses. Explore, engage, and excel in your learning journey.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialIcons.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-gray-800 ${social.color} text-white p-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {links.map((link, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {link.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold mb-6 text-white">Contact Info</h3>
            <div className="space-y-4">
              {contactInfo.map((contact, idx) => (
                <motion.a
                  key={idx}
                  href={contact.href}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 text-gray-400 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300 flex-shrink-0">
                    {contact.icon}
                  </div>
                  <span className="text-sm leading-relaxed pt-1">{contact.text}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Newsletter Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold mb-6 text-white">Newsletter</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Subscribe to get updates on new courses and learning resources.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} MANSOL LMS. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, color: "#ffffff" }}
                className="hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, color: "#ffffff" }}
                className="hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, color: "#ffffff" }}
                className="hover:text-white transition-colors duration-300"
              >
                Cookie Policy
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Mobile Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 py-3 px-6 z-50">
          <div className="flex justify-between items-center">
            {['Home', 'Courses', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-white text-xs flex flex-col items-center gap-1 transition-colors duration-300"
              >
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs">•</span>
                </div>
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          footer {
            padding-bottom: 80px; /* Extra space for mobile bottom bar */
          }
        }
      `}</style>
    </footer>
  );
}