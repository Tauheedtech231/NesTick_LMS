'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  HiEye, 
  HiBookOpen, 
  HiUserGroup, 
  HiTrendingUp,
  HiPhone,
  HiOutlineCog,
  HiHome,
  HiInformationCircle
} from 'react-icons/hi';
import { MdDashboard, MdPages } from 'react-icons/md';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  teal: '#14B8A6'
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'pages'>('home');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Tab 1: Home Section Actions
  const homeActions = [
    { title: 'Hero Section', href: '/Management_Portal/herosection', icon: <HiEye size={20} />, color: BRAND_COLORS.deepRed },
    { title: 'About Section', href: '/Management_Portal/about', icon: <HiInformationCircle size={20} />, color: BRAND_COLORS.darkRoyalBlue },
    { title: 'Team', href: '/Management_Portal/trainers', icon: <HiUserGroup size={20} />, color: BRAND_COLORS.teal },
    { title: 'Contact Section', href: '/Management_Portal/contact', icon: <HiPhone size={20} />, color: '#F59E0B' },
    { title: 'Footer Section', href: '/Management_Portal/footer', icon: <HiOutlineCog size={20} />, color: '#8B5CF6' }
  ];

  // Tab 2: Pages Section Actions
  const pagesActions = [
    { title: 'About Page', href: '/Management_Portal/about-page', icon: <HiBookOpen size={20} />, color: BRAND_COLORS.darkNavy },
    { title: 'Journey', href: '/Management_Portal/journey', icon: <HiTrendingUp size={20} />, color: BRAND_COLORS.teal }
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">👋</span>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{getGreeting()}, Admin!</h1>
            </div>
            <p className="text-white/80 text-sm">Welcome to your Management Portal</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-white text-sm font-medium">
              {new Date().toLocaleDateString('en-PK', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-6 py-3 font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 ${
            activeTab === 'home' ? 'border-b-2' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'home' ? { color: BRAND_COLORS.deepRed, borderBottomColor: BRAND_COLORS.deepRed } : {}}
        >
          <HiHome size={18} />
          <span>Home Sections</span>
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-6 py-3 font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 ${
            activeTab === 'pages' ? 'border-b-2' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'pages' ? { color: BRAND_COLORS.deepRed, borderBottomColor: BRAND_COLORS.deepRed } : {}}
        >
          <MdPages size={18} />
          <span>Pages</span>
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {homeActions.map((action, index) => (
              <Link href={action.href} key={action.title}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl p-4 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg text-center"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <span style={{ color: action.color }}>{action.icon}</span>
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    {action.title}
                  </h3>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="pages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-md"
          >
            {pagesActions.map((action, index) => (
              <Link href={action.href} key={action.title}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl p-4 shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg text-center"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <span style={{ color: action.color }}>{action.icon}</span>
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: BRAND_COLORS.darkNavy }}>
                    {action.title}
                  </h3>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}