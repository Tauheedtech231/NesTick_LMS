/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import { HiX, HiTrash, HiShoppingBag, HiTag, HiBookOpen, HiGift } from 'react-icons/hi';
import { CartItem } from '@/lib/types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  removingFromCart: string | null;
  onRemoveFromCart: (cartId: string, courseId: string) => void;
  formatCurrency: (amount: number) => string;
  bundleAddedMessage: { bundleId: string; discountedPrice: number } | null;
  onProceedToEnrollment: () => void;
}

const slideInRightVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 }
};

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cartItems, 
  removingFromCart, 
  onRemoveFromCart, 
  formatCurrency,
  bundleAddedMessage,
  onProceedToEnrollment
}: CartSidebarProps) {

  if (!isOpen) return null;

  // Separate bundle items and individual course items
  const bundleItems = cartItems.filter(item => item.is_bundle_item === true);
  const individualCourses = cartItems.filter(item => !item.is_bundle_item);

  // Calculate totals
  const bundleTotal = bundleItems.reduce((sum, item) => sum + (item.bundle_discounted_price || 0), 0);
  const coursesTotal = individualCourses.reduce((sum, item) => sum + (item.course_price || 0), 0);
  const grandTotal = bundleTotal + coursesTotal;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
      />
      
      {/* Sidebar */}
      <motion.div
        variants={slideInRightVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto z-[1000]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Your Learning Bag</h2>
              <p className="text-sm text-white/80">
                {individualCourses.length + (bundleItems.length > 0 ? 1 : 0)} Item(s)
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <HiX className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <HiShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bag is empty</h3>
              <p className="text-gray-500 mb-6">Start exploring courses to add to your learning journey</p>
              <button onClick={onClose} className="px-6 py-2 bg-[#B11217] text-white rounded-lg cursor-pointer">
                Browse Courses
              </button>
            </div>
          ) : (
            <>
              {/* Bundle Discount Notice */}
              {bundleAddedMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"
                >
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <HiTag className="w-4 h-4" />
                    Bundle Discount Applied!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You're getting this bundle at {formatCurrency(bundleAddedMessage.discountedPrice)} only!
                  </p>
                </motion.div>
              )}

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {/* Bundle Items - Show as SINGLE line */}
                {bundleItems.length > 0 && bundleItems.map((bundle) => {
                  const originalPrice = bundle.bundle_original_price || 0;
                  const discountedPrice = bundle.bundle_discounted_price || bundle.course_price || 0;
                  const hasOriginal = originalPrice > 0 && originalPrice > discountedPrice;
                  
                  return (
                    <div key={bundle.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <HiGift className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                              🎁 BUNDLE
                            </span>
                          </div>
                          {/* ✅ Fixed: Sirf bundle name show ho, double nahi */}
                          <h3 className="font-bold text-gray-900 text-base">
                            {bundle.bundle_name || bundle.course_title}
                          </h3>
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="font-bold text-green-700 text-lg">
                                {formatCurrency(discountedPrice)}
                              </span>
                              {hasOriginal && (
                                <span className="text-xs text-gray-400 line-through ml-2">
                                  {formatCurrency(originalPrice)}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => onRemoveFromCart(bundle.id, bundle.course_id)} 
                              disabled={removingFromCart === bundle.id} 
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              {removingFromCart === bundle.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiTrash className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-green-600 mt-2">
                            ✨ Includes {bundleItems.length === 1 ? 'all courses in this bundle' : `${bundleItems.length} courses`} at bundle price
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Individual Courses */}
                {individualCourses.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <HiBookOpen className="w-5 h-5 text-[#1E3A8A]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.course_title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-[#B11217] text-sm">
                            {formatCurrency(item.course_price)}
                          </span>
                          <button 
                            onClick={() => onRemoveFromCart(item.id, item.course_id)} 
                            disabled={removingFromCart === item.id} 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {removingFromCart === item.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiTrash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount - Simple and Clean */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-[#B11217]">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 text-center">
                    Prices are in Pakistani Rupees (PKR)
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 mt-6">
                <button 
                  onClick={() => { onClose(); onProceedToEnrollment(); }} 
                  className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  Proceed to Enrollment →
                </button>
                <button 
                  onClick={onClose} 
                  className="w-full py-3 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl font-medium hover:bg-[#1E3A8A] hover:text-white transition-all cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}