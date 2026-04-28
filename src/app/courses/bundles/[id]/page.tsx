"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiCheckCircle,
  HiArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineFire as HiOutlineWrench,
  HiClock,
  HiUserGroup,
  HiAcademicCap,
  HiLocationMarker,
  HiShoppingCart,
  HiCheck,
  HiTrash,
  HiX,
  HiMail,
  HiExclamation,
  HiShoppingBag,
  HiStar,
  HiChevronDown,
  HiGift,
  HiTag,
  HiEye,
  HiBookOpen
} from "react-icons/hi";
import { IoMdArrowDropright } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { GraduationCap, Loader2 } from "lucide-react";
import Link from "next/link";
/* eslint-disable */

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#1FB6CB'
};

// Z-index constants
const Z_INDEX = {
  BASE: 1,
  NAVBAR: 100,
  DROPDOWN: 110,
  BACKDROP: 150,
  MOBILE_MENU: 200,
  CART_BUTTON: 999,
  CART_SIDEBAR: 1000,
  CART_BACKDROP: 999,
  TOAST: 1001,
  MODAL: 2000
};

// Interfaces
interface BundleCourse {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  image?: string;
  duration?: string;
  level?: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  total_courses: number;
  status: string;
  image: string | null;
  created_at: string;
  courses: BundleCourse[];
}

interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
  is_bundle_item?: boolean;
  bundle_name?: string;
  bundle_discounted_price?: number;
}

// Email Popup Component
interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  bundleTitle: string;
  savedEmail?: string;
}

const EmailPopup = ({ isOpen, onClose, onConfirm, bundleTitle, savedEmail }: EmailPopupProps) => {
  const [email, setEmail] = useState(savedEmail || '');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (savedEmail) {
        setEmail(savedEmail);
        setIsValid(true);
      }
    } else {
      document.body.style.overflow = 'unset';
      setEmail(savedEmail || '');
      setError('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, savedEmail]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setError('Please enter a valid email address');
      setIsValid(false);
    } else if (!value) {
      setError('');
      setIsValid(false);
    } else {
      setError('');
      setIsValid(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      onConfirm(email);
    } else {
      setError('Please enter a valid email address');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.MODAL }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
          >
            <HiMail className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">
            {savedEmail ? 'Confirm Your Email' : 'Enter Your Email'}
          </h3>
          <p className="text-sm text-blue-100">
            To add <span className="font-semibold">"{bundleTitle}"</span> to bag
          </p>
          {savedEmail && (
            <p className="text-xs text-blue-200 mt-2">
              Using saved email: {savedEmail}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none
                  ${error 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : isValid 
                      ? 'border-green-300 bg-green-50 focus:border-green-500'
                      : 'border-gray-200 focus:border-[#B11217]'
                  }`}
                autoFocus={!savedEmail}
                readOnly={!!savedEmail}
              />
              {isValid && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <HiCheck className="w-5 h-5 text-green-500" />
                </motion.div>
              )}
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 mt-2 flex items-center"
              >
                <HiExclamation className="w-4 h-4 mr-1" />
                {error}
              </motion.p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all duration-300
                ${isValid 
                  ? 'bg-gradient-to-r from-[#B11217] to-[#8f0e12] hover:shadow-lg hover:scale-105' 
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
            >
              {savedEmail ? 'Confirm & Add to Bag' : 'Confirm'}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            We'll save this email for future use. No spam, ever.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Animation variants
const slideInRightVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 }
};

export default function BundleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Email popup state
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Cart states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);
  
  // Curriculum dropdown state - for bundle courses
  const [openCourseIndex, setOpenCourseIndex] = useState<number | null>(null);

  const bundleId = params.id as string;

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Check if bundle is already in cart
  useEffect(() => {
    if (userEmail && bundle) {
      checkCartStatus();
      loadCartItems();
    }
  }, [userEmail, bundle]);

  const checkCartStatus = async () => {
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        const inCart = result.data.items.some((item: any) => item.bundle_id === bundleId && item.is_bundle_item === true);
        setInCart(inCart);
      }
    } catch (error) {
      console.error('Error checking cart:', error);
    }
  };

  const loadCartItems = async () => {
    if (!userEmail) return;
    
    setCartLoading(true);
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        setCartItems(result.data.items || []);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchBundleDetails();
  }, [bundleId]);

  const fetchBundleDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bundles/${bundleId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const bundleData = result.data;
        setBundle({
          id: bundleData.id,
          title: bundleData.title,
          description: bundleData.description || '',
          original_price: bundleData.original_price || 0,
          discounted_price: bundleData.discounted_price || 0,
          discount_percentage: bundleData.discount_percentage || 0,
          total_courses: bundleData.courses?.length || 0,
          status: bundleData.status,
          image: bundleData.image || null,
          created_at: bundleData.created_at,
          courses: bundleData.courses || []
        });
      } else {
        setBundle(null);
      }
    } catch (error) {
      console.error('Error fetching bundle:', error);
      setBundle(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartClick = () => {
    if (!bundle) return;
    
    if (userEmail) {
      addBundleToCart(userEmail);
    } else {
      setIsEmailPopupOpen(true);
    }
  };

  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    await addBundleToCart(email);
  };

  // ✅ Add bundle as SINGLE item to cart
  const addBundleToCart = async (email: string) => {
    if (!bundle) return;

    setAddingToCart(true);
    setCartMessage(null);

    try {
      const response = await fetch('/api/student/cart/add-bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: email,
          bundleId: bundle.id,
          bundleTitle: bundle.title,
          bundlePrice: bundle.discounted_price,
          bundleOriginalPrice: bundle.original_price,
          bundleDiscountPercentage: bundle.discount_percentage,
          coursesInBundle: bundle.courses || []
        })
      });

      const result = await response.json();

      if (result.success) {
        setInCart(true);
        await loadCartItems();
        setCartMessage({
          type: 'success',
          text: `🎉 Bundle "${bundle.title}" added! You pay only ${formatCurrency(bundle.discounted_price)} for ${bundle.total_courses} courses!`
        });
        setTimeout(() => setCartMessage(null), 4000);
      } else {
        if (result.error === 'Bundle already in cart') {
          setInCart(true);
          setCartMessage({
            type: 'error',
            text: 'Bundle is already in your cart'
          });
        } else {
          throw new Error(result.error || 'Failed to add bundle');
        }
      }
    } catch (error: any) {
      console.error('Error adding bundle to cart:', error);
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to add bundle to cart'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Remove bundle from cart
  const handleRemoveFromCart = async (cartId: string) => {
    if (!userEmail) return;

    setRemovingFromCart(cartId);
    try {
      const response = await fetch(
        `/api/student/cart/remove?id=${cartId}&email=${encodeURIComponent(userEmail)}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        setInCart(false);
        setCartMessage({
          type: 'success',
          text: 'Bundle removed from cart'
        });
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to remove bundle');
      }
    } catch (error: any) {
      console.error('Error removing bundle:', error);
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to remove bundle'
      });
    } finally {
      setRemovingFromCart(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'Rs 0';
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return 'Rs 0';
    }
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount).replace('PKR', 'Rs');
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently added';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Recently added';
    }
  };

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => {
    let price = item.is_bundle_item ? (item.bundle_discounted_price || 0) : item.course_price;
    if (price > 100000) price = price / 100;
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const handleCartBucketClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCartSidebar(true);
  };

  const handleViewCourseDetails = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const toggleCourseDetails = (index: number) => {
    setOpenCourseIndex(openCourseIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deepRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bundle Not Found</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-800">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const savingsAmount = bundle.original_price - bundle.discounted_price;
  const bundleImageUrl = bundle.image || '/placeholder-bundle.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
      {/* Email Popup */}
      <AnimatePresence mode="wait">
        {isEmailPopupOpen && bundle && (
          <EmailPopup
            isOpen={isEmailPopupOpen}
            onClose={() => setIsEmailPopupOpen(false)}
            onConfirm={handleEmailConfirm}
            bundleTitle={bundle.title}
            savedEmail={userEmail}
          />
        )}
      </AnimatePresence>

      {/* Cart Message Toast */}
      <AnimatePresence>
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[1001] ${
              cartMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {cartMessage.type === 'success' ? (
              <HiCheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <HiExclamation className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">{cartMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Bucket */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]"
        style={{ zIndex: Z_INDEX.CART_BUTTON }}
      >
        <motion.button
          onClick={handleCartBucketClick}
          className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-3 sm:p-4 rounded-l-full rounded-r-none shadow-2xl hover:shadow-3xl transition-all duration-300 group cursor-pointer flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiShoppingBag className="w-6 h-6" />
          {cartItems.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-white text-[#B11217] text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg border-2 border-[#B11217]"
            >
              {cartItems.length > 99 ? '99+' : cartItems.length}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCartSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartSidebar(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
            />
            
            <motion.div
              variants={slideInRightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto z-[1000]"
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Your Learning Bag</h2>
                      <p className="text-sm text-white/80">
                        {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCartSidebar(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <HiX className="w-5 h-5 text-white" />
                  </button>
                </div>
                {userEmail && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <HiMail className="w-4 h-4" />
                      <span className="truncate">{userEmail}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {cartLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_COLORS.deepRed }} />
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <HiShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bag is empty</h3>
                    <p className="text-gray-500 mb-6">Start exploring courses and bundles</p>
                    <button
                      onClick={() => setShowCartSidebar(false)}
                      className="px-6 py-2 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => {
                        const isBundle = item.is_bundle_item;
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`bg-gray-50 rounded-xl p-4 border ${
                              isBundle ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                            } hover:shadow-md transition-all`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-lg">
                                {isBundle ? (
                                  <HiGift className="w-5 h-5 text-green-600" />
                                ) : (
                                  <HiBookOpen className="w-5 h-5 text-[#1E3A8A]" />
                                )}
                              </div>
                              <div className="flex-1">
                                {isBundle && item.bundle_name && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mb-1">
                                    🎁 {item.bundle_name} Bundle
                                  </span>
                                )}
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.course_title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                  {isBundle ? (
                                    <span className="font-bold text-green-600 text-sm">
                                      {formatCurrency(item.bundle_discounted_price || item.course_price)}
                                    </span>
                                  ) : (
                                    <span className="font-bold text-[#B11217] text-sm">
                                      {formatCurrency(item.course_price)}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRemoveFromCart(item.id)}
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
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      

                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setShowCartSidebar(false);
                            router.push('/cartEnrollment');
                          }}
                          className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
                        >
                          Proceed to Enrollment
                        </button>
                        <button
                          onClick={() => setShowCartSidebar(false)}
                          className="w-full py-3 rounded-lg font-medium transition-all border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white"
                        >
                          Continue Browsing
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
        </div>

        {/* Bundle Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden md:flex">
            {/* Bundle Image */}
            <div className="md:w-2/5 relative">
              <img
                src={bundleImageUrl}
                alt={bundle.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dfp9qc0gu/image/upload/v1745412345/lms/course_images/default_course.png';
                }}
              />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold shadow-lg flex items-center">
                  <HiGift className="w-3 h-3 mr-1" />
                  Bundle
                </div>
              </div>
            </div>

            {/* Bundle Info */}
            <div className="md:w-3/5 p-6 flex flex-col justify-between">
              <div>
                <header className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {bundle.total_courses} Courses Included
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      Save {bundle.discount_percentage}%
                    </span>
                  </div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: BRAND_COLORS.darkNavy }}
                  >
                    {bundle.title}
                  </h1>
                  <p className="text-base text-gray-700">{bundle.description}</p>
                </header>

                <ul className="mb-4 text-gray-700 text-sm space-y-1">
                  <li className="flex items-center gap-2 before:content-['•'] before:text-green-500 before:mr-2">
                    <span className="font-medium">{bundle.total_courses} Professional Courses</span>
                    <span className="text-gray-500">in one bundle</span>
                  </li>
                  <li className="flex items-center gap-2 before:content-['•'] before:text-green-500 before:mr-2">
                    <span className="font-medium">Save {bundle.discount_percentage}%</span>
                    <span className="text-gray-500">compared to buying individually</span>
                  </li>
                  <li className="flex items-center gap-2 before:content-['•'] before:text-green-500 before:mr-2">
                    <span className="font-medium">Lifetime Access</span>
                    <span className="text-gray-500">to all courses</span>
                  </li>
                </ul>
              </div>

              {/* Price & CTAs */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: BRAND_COLORS.deepRed }}
                      >
                        {formatCurrency(bundle.discounted_price)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(bundle.original_price)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
                      <span
                        className="px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: `${BRAND_COLORS.deepRed}15`,
                          color: BRAND_COLORS.deepRed,
                        }}
                      >
                        Save {formatCurrency(savingsAmount)} ({bundle.discount_percentage}% OFF)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    {inCart ? (
                      <button
                        onClick={() => setShowCartSidebar(true)}
                        className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                        style={{
                          backgroundColor: '#10B981',
                          color: BRAND_COLORS.white,
                        }}
                      >
                        <HiCheck className="w-5 h-5" />
                        View in Bag
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCartClick}
                        disabled={addingToCart}
                        className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50"
                        style={{
                          backgroundColor: BRAND_COLORS.darkRoyalBlue,
                          color: BRAND_COLORS.white,
                        }}
                      >
                        {addingToCart ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <HiShoppingBag className="w-5 h-5" />
                        )}
                        {addingToCart ? 'Adding...' : 'Add Bundle to Bag'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const bundleItems = cartItems.filter(item => item.is_bundle_item === true);
                        if (bundleItems.length > 0) {
                          setShowCartSidebar(true);
                        } else {
                          handleAddToCartClick();
                        }
                      }}
                      className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-base shadow-md transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: BRAND_COLORS.deepRed,
                        color: BRAND_COLORS.white,
                      }}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Course Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Courses in Bundle with Dropdown */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-8 border border-gray-100 bg-white shadow-sm"
            >
              <h2
                className="text-2xl font-bold mb-6 flex items-center"
                style={{ color: BRAND_COLORS.darkNavy }}
              >
                <HiGift className="w-6 h-6 mr-3 text-green-600" />
                Courses in this Bundle ({bundle.total_courses})
              </h2>

              <div className="space-y-3">
                {bundle.courses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Course Header - Clickable */}
                    <button
                      onClick={() => toggleCourseDetails(index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IoMdArrowDropright 
                          className={`text-blue-900 w-5 h-5 transition-transform duration-300 ${
                            openCourseIndex === index ? 'rotate-90' : ''
                          }`} 
                        />
                        <div className="text-left">
                          <span className="font-medium text-gray-800">{course.title}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500">{course.duration || 'Flexible'}</span>
                            <span className="text-xs text-gray-500">{course.level || 'All Levels'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        
                        <HiChevronDown 
                          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                            openCourseIndex === index ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </button>

                    {/* Course Details - Dropdown Content */}
                    <AnimatePresence>
                      {openCourseIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-white border-t border-gray-200">
                            <div className="prose prose-sm max-w-none text-gray-600">
                              <p className="mb-2">
                                <span className="font-semibold">Course Description:</span>
                              </p>
                              <p className="text-sm mb-3">{course.description || 'No description available'}</p>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleViewCourseDetails(course.id)}
                                  className="inline-flex items-center gap-1 text-sm text-[#B11217] hover:underline"
                                >
                                  <HiEye className="w-4 h-4" />
                                  View Course Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Bundle Benefits / What You'll Get */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-8 border border-gray-100 bg-white shadow-sm mt-6"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center"
                style={{ color: BRAND_COLORS.darkNavy }}>
                <HiCheckCircle className="w-6 h-6 mr-3 text-green-600" />
                Bundle Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">Save {bundle.discount_percentage}% compared to buying courses individually</span>
                </div>
                <div className="flex items-start">
                  <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">Lifetime access to all {bundle.total_courses} courses</span>
                </div>
                <div className="flex items-start">
                  <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">Certificate for each completed course</span>
                </div>
                <div className="flex items-start">
                  <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">24/7 access to all learning materials</span>
                </div>
                <div className="flex items-start">
                  <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">Learn at your own pace</span>
                </div>
                <div className="flex items-start">
                  <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">Industry-recognized certification</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Bundle Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl shadow-md p-6 border border-gray-100 bg-white"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.darkNavy }}>
                <HiTag className="w-5 h-5 text-green-600" />
                Bundle Details
              </h3>
              <ul className="space-y-4 text-gray-700 text-base">
                <li className="flex items-start gap-3">
                  <HiGift className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{bundle.total_courses} Courses</div>
                    <div className="text-gray-500 text-sm">Total courses included</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HiTag className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{bundle.discount_percentage}% Discount</div>
                    <div className="text-gray-500 text-sm">Save {formatCurrency(savingsAmount)}</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HiAcademicCap className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Lifetime Access</div>
                    <div className="text-gray-500 text-sm">Learn at your own pace</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HiCheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Certificates Included</div>
                    <div className="text-gray-500 text-sm">For each completed course</div>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Why Buy Bundle Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl shadow-md p-6 border border-gray-100 bg-gradient-to-r from-green-50 to-white"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: BRAND_COLORS.darkNavy }}>
                <HiStar className="w-5 h-5 text-yellow-500" />
                Why Buy This Bundle?
              </h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Complete learning path - all skills in one package</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Save money compared to buying courses separately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Structured curriculum from beginner to advanced</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>One-time payment, lifetime access to all courses</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}