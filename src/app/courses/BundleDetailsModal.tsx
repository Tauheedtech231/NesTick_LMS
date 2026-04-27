/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiX, HiGift, HiTag, HiAcademicCap, HiBadgeCheck, HiClock, HiShoppingBag } from 'react-icons/hi';
import type { Bundle } from './types';

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

  // Safe format currency function
  const safeFormatCurrency = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return 'PKR 0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return formatCurrency(isNaN(numPrice) ? 0 : numPrice);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4 z-[2000]"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <HiGift className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">{bundle.title}</h2>
                <p className="text-sm text-blue-200">Discounted Course Bundle</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              selectedTab === 'overview' 
                ? 'border-[#B11217] text-[#B11217]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('courses')}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              selectedTab === 'courses' 
                ? 'border-[#B11217] text-[#B11217]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Courses ({bundle.total_courses})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(85vh-130px)]">
          {selectedTab === 'overview' ? (
            <div className="space-y-5">
              {/* Description */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-2">About This Bundle</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {bundle.description || 'Get this comprehensive course bundle at an exclusive discounted price.'}
                </p>
              </div>

              {/* Pricing - Removed -11% style */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-md font-semibold text-gray-900 mb-3">Pricing Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Regular Price (Individual Courses)</span>
                    <span className="text-gray-400 line-through">{safeFormatCurrency(bundle.original_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bundle Discount</span>
                    <span className="text-green-600">Save {safeFormatCurrency(totalSavings)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">You Pay (Bundle Price)</span>
                      <span className="text-xl font-bold text-[#B11217]">{safeFormatCurrency(bundle.discounted_price)}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      ✨ All {bundle.total_courses} courses included at discounted price
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits - Removed percentage display */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-2">Benefits</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HiTag className="w-4 h-4 text-green-500" /> Discounted Price
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HiAcademicCap className="w-4 h-4 text-blue-500" /> {bundle.total_courses} Courses
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HiBadgeCheck className="w-4 h-4 text-purple-500" /> Certificate
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <HiClock className="w-4 h-4 text-orange-500" /> Lifetime Access
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-3">{bundle.total_courses} courses included:</p>
              {bundle.courses?.map((course, idx) => (
                <div key={course.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-400 w-6">{idx + 1}.</span>
                    <span className="text-sm text-gray-800">{course.title}</span>
                  </div>
                  {/* Show course price */}
                  <span className="text-sm text-gray-500">{safeFormatCurrency(course.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onAddToCart(bundle)}
              className="flex-1 px-4 py-2 bg-[#B11217] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <HiShoppingBag className="w-4 h-4" />
              Add to Bag - {safeFormatCurrency(bundle.discounted_price)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}