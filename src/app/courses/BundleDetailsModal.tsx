/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiGift, HiTag, HiAcademicCap, HiBadgeCheck, HiClock, HiShoppingBag } from 'react-icons/hi';
import { MdKeyboardArrowDown } from 'react-icons/md';
import type { Bundle, Course } from './types';

interface BundleDetailsModalProps {
  bundle: Bundle | null;
  isOpen: boolean;
  selectedTab: 'overview' | 'courses';
  onTabChange: (tab: 'overview' | 'courses') => void;
  onClose: () => void;
  onAddToCart: (bundle: Bundle) => void | Promise<void>;
  formatCurrency: (amount: number) => string;
}

export default function BundleDetailsModal({ 
  bundle, 
  isOpen, 
  selectedTab, 
  onTabChange, 
  onClose, 
  onAddToCart, 
  formatCurrency 
}: BundleDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !bundle) return null;

  const totalSavings = bundle.original_price - bundle.discounted_price;
  const savingsPercent = bundle.discount_percentage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4 z-[2000]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <HiGift className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{bundle.title}</h2>
                <p className="text-sm text-blue-200 mt-1">Discounted Course Bundle</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => onTabChange('overview')}
              className={`px-4 py-2 text-sm font-medium transition-all relative ${
                selectedTab === 'overview' ? 'text-[#B11217]' : 'text-gray-500'
              }`}
            >
              Overview
              {selectedTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B11217]" />}
            </button>
            <button
              onClick={() => onTabChange('courses')}
              className={`px-4 py-2 text-sm font-medium transition-all relative ${
                selectedTab === 'courses' ? 'text-[#B11217]' : 'text-gray-500'
              }`}
            >
              Courses ({bundle.total_courses})
              {selectedTab === 'courses' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B11217]" />}
            </button>
          </div>

          {selectedTab === 'overview' ? (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Bundle</h3>
                <p className="text-gray-600 leading-relaxed">
                  {bundle.description || 'Get this comprehensive course bundle at an exclusive discounted price.'}
                </p>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Price</span>
                    <span className="text-lg text-gray-400 line-through">{formatCurrency(bundle.original_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle Discount</span>
                    <span className="text-green-600 font-semibold">-{savingsPercent}% (Save {formatCurrency(totalSavings)})</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">You Pay</span>
                      <span className="text-2xl font-bold text-[#B11217]">{formatCurrency(bundle.discounted_price)}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      ✨ You only pay the discounted bundle price! All {bundle.total_courses} courses included.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bundle Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: HiTag, text: `${savingsPercent}% discount on total price`, color: '#10B981' },
                    { icon: HiAcademicCap, text: `${bundle.total_courses} professional courses`, color: '#1E3A8A' },
                    { icon: HiBadgeCheck, text: 'Industry recognized certificates', color: '#8B5CF6' },
                    { icon: HiClock, text: 'Lifetime access to all courses', color: '#F59E0B' },
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <benefit.icon className="w-5 h-5" style={{ color: benefit.color }} />
                      <span className="text-sm text-gray-700">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">This bundle includes {bundle.total_courses} courses:</p>
              {bundle.courses?.map((course, idx) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-[#1E3A8A]">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-xs text-gray-500">Professional Course</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400 line-through">{formatCurrency(course.numericPrice || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100">
              Continue Browsing
            </button>
            <button onClick={() => onAddToCart(bundle)} className="flex-1 px-6 py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-xl font-medium hover:shadow-lg flex items-center justify-center gap-2">
              <HiShoppingBag className="w-5 h-5" />
              Add Bundle to Bag - {formatCurrency(bundle.discounted_price)}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            🎯 You'll be charged only the discounted bundle price. All {bundle.total_courses} courses added to bag.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}