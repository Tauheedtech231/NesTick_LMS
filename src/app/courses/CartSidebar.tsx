/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import { HiX, HiTrash, HiShoppingBag, HiTag, HiBookOpen } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
  is_bundle_item?: boolean;
  bundle_name?: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  removingFromCart: string | null;
  onRemoveFromCart: (cartId: string, courseId: string) => void;
  formatCurrency: (amount: number) => string;
  bundleAddedMessage: { bundleId: string; discountedPrice: number } | null;
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
  cartTotal, 
  removingFromCart, 
  onRemoveFromCart, 
  formatCurrency,
  bundleAddedMessage 
}: CartSidebarProps) {
  const router = useRouter();

  if (!isOpen) return null;

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
              <h2 className="text-xl font-bold text-white">Your Bag</h2>
              <p className="text-sm text-white/80">{cartItems.length} {cartItems.length === 1 ? 'Course' : 'Courses'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Start exploring courses to add to your learning journey</p>
              <button onClick={onClose} className="px-6 py-2 bg-[#B11217] text-white rounded-lg">
                Browse Courses
              </button>
            </div>
          ) : (
            <>
              {/* Bundle Discount Notice */}
              {bundleAddedMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <HiTag className="w-4 h-4" />
                    Bundle Discount Applied!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    You're getting this bundle at {formatCurrency(bundleAddedMessage.discountedPrice)} only!
                  </p>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const isBundleItem = item.is_bundle_item;
                  return (
                    <div key={item.id} className={`bg-gray-50 rounded-xl p-4 border ${isBundleItem ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                          <HiBookOpen className="w-5 h-5 text-[#1E3A8A]" />
                        </div>
                        <div className="flex-1">
                          {isBundleItem && item.bundle_name && (
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mb-1">
                              🎁 {item.bundle_name} Bundle
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.course_title}</h3>
                          <div className="flex items-center justify-between mt-2">
                            {isBundleItem ? (
                              <span className="text-xs text-green-600 font-medium">Included in bundle - No extra charge</span>
                            ) : (
                              <span className="font-bold text-[#B11217] text-sm">{formatCurrency(item.course_price)}</span>
                            )}
                            <button 
                              onClick={() => onRemoveFromCart(item.id, item.course_id)} 
                              disabled={removingFromCart === item.id} 
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
                  );
                })}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-6 bg-blue-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-xl font-bold text-[#B11217]">{formatCurrency(cartTotal)}</span>
                </div>
                               <div className="mb-4">
  <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-1">
    <span className="text-red-500">•</span>
   If You add courses from bundle then you only pay the bundle price which is much lower than the sum of individual course prices. So, you get more value for your money!.And Prices are  Mention on Bundles
    <span className="text-red-500">•</span>
  </p>
</div>

              </div>

              {/* Buttons */}
              <button 
                onClick={() => { onClose(); router.push('/cartEnrollment'); }} 
                className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Proceed to Enrollment
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}