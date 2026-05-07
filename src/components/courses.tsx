"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { 
  HiClock, 
  HiUserGroup, 
  HiAcademicCap, 
  HiCheckCircle,
  HiArrowRight,
  HiBookOpen,
  HiShieldCheck,
  HiOutlineFire as HiWrench,
  HiFire,
  HiStar,
  HiSearch,
  HiX,
  HiClock as HiRecent,
  HiBadgeCheck,
  HiCog,
  HiBriefcase,
  HiMail,
  HiCheck,
  HiExclamation,
  HiTrash,
  HiShoppingBag,
  HiCurrencyRupee,
  HiUser,
  HiTag,
  HiGift,
  HiEye,
  HiOutlineGift,
  HiInformationCircle
} from "react-icons/hi";
import { FaCartPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from 'react-icons/md';
import Link from "next/link";
import { useRouter } from "next/navigation";

/* eslint-disable */

// Session Storage Keys
const SESSION_KEYS = {
  COURSES: 'courses_data_v2',
  BUNDLES: 'bundles_data_v2',
  TIMESTAMP: 'courses_timestamp_v2'
};

// Cache expiry time (30 minutes)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Helper functions for session storage
const saveToSessionStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }
};

const getFromSessionStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }
  return null;
};

const isCacheValid = (timestamp: string | null): boolean => {
  if (!timestamp) return false;
  const cachedTime = parseInt(timestamp, 10);
  const now = Date.now();
  return (now - cachedTime) < CACHE_EXPIRY;
};

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
  teal: '#14B8A6'
};

// Interface for course structure
interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  students: string;
  level: string;
  highlights: string[];
  price: string;
  originalPrice?: string | null;
  savings?: string | null;
  icon: any;
  color: string | null;
  image: string | null;
  courseImage?: string | null;
  featured: boolean;
  rating: number;
  reviews: number;
  isPublished: boolean;
  instructorId: string;
  instructorName: string;
  createdAt: string;
  numericPrice?: number;
  iconName?: string | null;
}

// Bundle Interface
interface Bundle {
  image: string | Blob | undefined;
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  total_courses: number;
  courses: Course[];
  status: 'active' | 'inactive';
  created_at: string;
}

// Cart item interface
interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  added_at: string;
  is_bundle_item?: boolean;
  bundle_name?: string;
  bundle_discounted_price?: number;
}

// Combined item for display
interface DisplayItem {
  type: 'course' | 'bundle';
  id: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: number;
  totalCourses?: number;
  image?: string | null;
  category: string;
  duration?: string;
  level?: string;
  icon?: any;
  color?: string | null;
  data: Course | Bundle;
  badge: string;
  badgeColor: string;
  isInCart?: boolean;
  numericPrice?: number;
}

// Email Popup Props
interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  courseTitle: string;
  savedEmail?: string;
}

// Email Popup Component
const EmailPopup = ({ isOpen, onClose, onConfirm, courseTitle, savedEmail }: EmailPopupProps) => {
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
      className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
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
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-[100001]"
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
            To add <span className="font-semibold">"{courseTitle}"</span> to bag
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
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all duration-300 cursor-pointer
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
const fadeInUpVariants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -30, opacity: 0 }
};

const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const scaleInVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

const slideDownVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 }
};

const slideInRightVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 }
};

const staggerContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const fadeInDownVariants = {
  initial: { y: -30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
};

const getTransition = (delay: number = 0) => ({
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1] as Easing,
  delay
});

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
  mass: 1
};

export default function CoursesPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allBundles, setAllBundles] = useState<Bundle[]>([]);
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  
  // Email popup state
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Cart states with API
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState<{[key: string]: boolean}>({});
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [inCartStatus, setInCartStatus] = useState<{[key: string]: boolean}>({});
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);
  
  // Cart sidebar state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Save email to localStorage
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail]);

  // Load data from cache or fetch fresh
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check cache
      const cachedCourses = getFromSessionStorage(SESSION_KEYS.COURSES);
      const cachedBundles = getFromSessionStorage(SESSION_KEYS.BUNDLES);
      const cacheTimestamp = getFromSessionStorage(SESSION_KEYS.TIMESTAMP);
      const isCacheValidFlag = isCacheValid(cacheTimestamp);
      
      if (isCacheValidFlag && cachedCourses && cachedBundles) {
        console.log('Loading courses and bundles from session storage cache');
        const hydratedCourses = (cachedCourses as Course[]).map((course: Course) => ({
          ...course,
          icon: getIconComponent(course.iconName || (typeof course.icon === 'string' ? course.icon : null))
        }));
        setAllCourses(hydratedCourses);
        setAllBundles(cachedBundles);
        setLoading(false);
        setInitialLoadComplete(true);
        
        // Fetch fresh data in background
        fetchFreshData();
      } else {
        console.log('No valid cache found, fetching fresh data');
        await fetchFreshData();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setLoading(false);
    }
  };
  
  // Fetch fresh data from API
  const fetchFreshData = async () => {
    try {
      console.log('Fetching fresh courses and bundles from API');
      
      // Fetch courses
      const coursesResponse = await fetch('/api/instructors/course');
      const coursesResult = await coursesResponse.json();
      
      let coursesData: Course[] = [];
      if (coursesResponse.ok && coursesResult.success && coursesResult.data) {
        coursesData = coursesResult.data.map((course: any) => {
          let numericPrice = 0;
          if (course.price) {
            const priceStr = String(course.price).replace(/[^0-9]/g, '');
            if (priceStr) {
              numericPrice = parseInt(priceStr);
            }
          }
          
          return {
            id: course.id,
            title: course.title,
            category: course.category || 'Technical Training',
            description: course.description || '',
            duration: course.duration || 'Flexible',
            students: `${course.student_capacity || 0}+ seats`,
            level: course.level || 'Beginner',
            highlights: [],
            price: course.price ? `PKR ${Number(course.price).toLocaleString()}` : 'Contact for price',
            originalPrice: course.original_price ? `PKR ${Number(course.original_price).toLocaleString()}` : null,
            savings: course.original_price && course.price ? `Save ${Math.round((1 - Number(course.price)/Number(course.original_price)) * 100)}%` : null,
            numericPrice: numericPrice,
            iconName: course.icon || null,
            icon: getIconComponent(course.icon),
            color: course.color || BRAND_COLORS.teal,
            image: course.image,
            courseImage: course.image,
            featured: false,
            rating: 4.5,
            reviews: 0,
            isPublished: course.status === 'published',
            instructorId: course.instructor_id,
            instructorName: course.instructor_name,
            createdAt: course.created_at
          };
        });
        
        const publishedCourses = coursesData.filter((course: Course) => course.isPublished);
        
        // Save to cache
        saveToSessionStorage(SESSION_KEYS.COURSES, publishedCourses);
        setAllCourses(publishedCourses);
      }
      
      // Fetch bundles
      const bundlesResponse = await fetch('/api/admin/bundles');
      const bundlesResult = await bundlesResponse.json();
      
      let bundlesData: Bundle[] = [];
      if (bundlesResult.success) {
        bundlesData = bundlesResult.data.filter((b: Bundle) => b.status === 'active');
        
        // Save to cache
        saveToSessionStorage(SESSION_KEYS.BUNDLES, bundlesData);
        setAllBundles(bundlesData);
      }
      
      // Save timestamp
      saveToSessionStorage(SESSION_KEYS.TIMESTAMP, Date.now().toString());
      
      setLoading(false);
      setInitialLoadComplete(true);
      
    } catch (err) {
      console.error('Error fetching fresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setLoading(false);
    }
  };
  
  // Manual retry function
  const retryFetch = () => {
    fetchFreshData();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (userEmail && initialLoadComplete) {
      fetchCartCount();
    }
  }, [userEmail, initialLoadComplete]);

  // Combine courses and bundles into display items
  useEffect(() => {
    const items: DisplayItem[] = [];
    
    // Add all active bundles
    allBundles.forEach(bundle => {
      items.push({
        type: 'bundle',
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        price: formatCurrency(bundle.discounted_price),
        originalPrice: formatCurrency(bundle.original_price),
        discount: bundle.discount_percentage,
        totalCourses: bundle.total_courses,
        category: 'Bundle',
        data: bundle,
        badge: `SAVE ${bundle.discount_percentage}%`,
        badgeColor: 'from-yellow-500 to-orange-500',
        isInCart: false
      });
    });
    
    // Add published courses
    allCourses.forEach(course => {
      items.push({
        type: 'course',
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        originalPrice: course.originalPrice || undefined,
        image: course.image,
        category: course.category,
        duration: course.duration,
        level: course.level,
        icon: course.icon,
        color: course.color,
        data: course,
        badge: 'Instructor Led',
        badgeColor: 'from-[#1E3A8A] to-[#1E3A8A]',
        isInCart: inCartStatus[course.id],
        numericPrice: course.numericPrice
      });
    });
    
    setDisplayItems(items);
  }, [allCourses, allBundles, inCartStatus]);

  const fetchCartCount = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        setCartCount(result.data.count);
        
        const processedItems = (result.data.items || []).map((item: any) => {
          let price: number = 0;
          const rawPrice = item.course_price;
          
          if (typeof rawPrice === 'string') {
            const numericStr = rawPrice.replace(/,/g, '');
            price = parseFloat(numericStr);
            if (price > 100000) {
              price = price / 100;
            }
          } else if (typeof rawPrice === 'number') {
            price = rawPrice;
            if (price > 100000) {
              price = price / 100;
            }
          }
          
          return {
            id: item.id,
            course_id: item.course_id,
            course_title: item.course_title,
            course_price: isNaN(price) ? 0 : price,
            added_at: item.added_at,
            is_bundle_item: item.is_bundle_item,
            bundle_name: item.bundle_name,
            bundle_discounted_price: item.bundle_discounted_price
          };
        });
        
        setCartItems(processedItems);
        
        const inCartMap: {[key: string]: boolean} = {};
        if (processedItems.length > 0) {
          processedItems.forEach((item: CartItem) => {
            inCartMap[item.course_id] = true;
          });
        }
        setInCartStatus(inCartMap);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Handle bundle view details - redirect to bundle details page
  const handleViewBundleDetails = (bundleId: string) => {
    router.push(`/courses/bundles/${bundleId}`);
  };

  // Open email popup for add to cart
  const handleAddToCartClick = (item: DisplayItem) => {
    if (userEmail) {
      if (item.type === 'course') {
        addToCart(item.data as Course, userEmail);
      } else {
        addBundleToCart(item.data as Bundle, userEmail);
      }
    } else {
      setSelectedItem(item);
      setIsEmailPopupOpen(true);
    }
  };

  // Handle email confirmation and add to cart
  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    
    if (!selectedItem) return;
    
    setUserEmail(email);
    if (selectedItem.type === 'course') {
      await addToCart(selectedItem.data as Course, email);
    } else {
      await addBundleToCart(selectedItem.data as Bundle, email);
    }
  };

  // Add to cart API call for single course
  const addToCart = async (course: Course, email: string) => {
    setCartLoading(prev => ({ ...prev, [course.id]: true }));
    setCartMessage(null);

    try {
      const response = await fetch('/api/student/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: email,
          courseId: course.id,
          courseTitle: course.title,
          coursePrice: course.numericPrice || 0
        })
      });

      const result = await response.json();

      if (result.success) {
        setInCartStatus(prev => ({ ...prev, [course.id]: true }));
        await fetchCartCount();
        
        setCartMessage({
          type: 'success',
          text: `"${course.title}" added to bag!`
        });
        
        setTimeout(() => setCartMessage(null), 3000);
      } else if (result.error === 'Course already in cart') {
        setInCartStatus(prev => ({ ...prev, [course.id]: true }));
        setCartMessage({
          type: 'error',
          text: 'Course is already in your cart'
        });
      } else {
        throw new Error(result.error || 'Failed to add to bag');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to add to bag'
      });
    } finally {
      setCartLoading(prev => ({ ...prev, [course.id]: false }));
      setSelectedItem(null);
    }
  };

  // Add bundle as a SINGLE item to cart
  const addBundleToCart = async (bundle: Bundle, email: string) => {
    setCartLoading(prev => ({ ...prev, [`bundle_${bundle.id}`]: true }));
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
        await fetchCartCount();
        
        setCartMessage({
          type: 'success',
          text: `🎉 Bundle "${bundle.title}" added! You only pay ${formatCurrency(bundle.discounted_price)} for ${bundle.total_courses} courses! (Save ${bundle.discount_percentage}%)`
        });
        
        // Mark all courses in bundle as "in cart" for UI
        if (bundle.courses) {
          const inCartMap = { ...inCartStatus };
          bundle.courses.forEach(course => {
            inCartMap[course.id] = true;
          });
          setInCartStatus(inCartMap);
        }
      } else {
        throw new Error(result.error || 'Failed to add bundle');
      }
    } catch (error: any) {
      console.error('Error adding bundle to cart:', error);
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to add bundle to bag'
      });
    } finally {
      setCartLoading(prev => ({ ...prev, [`bundle_${bundle.id}`]: false }));
      setSelectedItem(null);
    }
  };

  // Remove from cart
  const handleRemoveFromCart = async (cartId: string, courseId: string) => {
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
        setInCartStatus(prev => ({ ...prev, [courseId]: false }));
        await fetchCartCount();

        setCartMessage({
          type: 'success',
          text: 'Item removed from cart'
        });
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to remove item');
      }
    } catch (error: any) {
      console.error('Error removing item:', error);
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to remove item'
      });
    } finally {
      setRemovingFromCart(null);
    }
  };

  const getIconComponent = (iconName: string | null) => {
    const iconMap: { [key: string]: any } = {
      'HiWrench': HiWrench,
      'HiShieldCheck': HiShieldCheck,
      'HiFire': HiFire,
      'HiBookOpen': HiBookOpen,
      'HiAcademicCap': HiAcademicCap,
      'HiClock': HiClock,
      'HiUserGroup': HiUserGroup,
      'HiBadgeCheck': HiBadgeCheck,
      'HiCog': HiCog,
      'HiBriefcase': HiBriefcase,
    };
    
    return iconMap[iconName || ''] || HiBookOpen;
  };

  // Format currency safely
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

  // Format date properly
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

  // Calculate cart total safely
  const cartTotal = cartItems.reduce((sum, item) => {
    let price = typeof item.course_price === 'number' ? item.course_price : 0;
    let finalPrice = price;
    if (finalPrice > 100000) {
      finalPrice = finalPrice / 100;
    }
    return sum + (isNaN(finalPrice) ? 0 : finalPrice);
  }, 0);

  // Group cart items by bundle to show bundle savings
  const getBundleSavingsInfo = () => {
    const bundleGroups: { [key: string]: { bundleName: string, discountedPrice: number, items: CartItem[], originalTotal: number } } = {};
    
    cartItems.forEach(item => {
      if (item.is_bundle_item && item.bundle_name) {
        if (!bundleGroups[item.bundle_name]) {
          bundleGroups[item.bundle_name] = {
            bundleName: item.bundle_name,
            discountedPrice: item.bundle_discounted_price || 0,
            items: [],
            originalTotal: 0
          };
        }
        bundleGroups[item.bundle_name].items.push(item);
        bundleGroups[item.bundle_name].originalTotal += item.course_price;
      }
    });
    
    return bundleGroups;
  };

  const bundleGroups = getBundleSavingsInfo();

  // Handle proceed to enrollment with bundleId
  const handleProceedToEnrollment = () => {
    const bundleItems = cartItems.filter(item => item.is_bundle_item === true);
    const individualCourses = cartItems.filter(item => !item.is_bundle_item);
    
    let url = '/cartEnrollment';
    const params = new URLSearchParams();
    
    if (bundleItems.length > 0 && bundleItems[0].bundle_name) {
      const bundleId = allBundles.find(b => b.title === bundleItems[0].bundle_name)?.id;
      if (bundleId) {
        params.append('bundleId', bundleId);
      }
    }
    
    if (individualCourses.length > 0) {
      const courseIds = individualCourses.map(item => item.course_id).join(',');
      params.append('courseIds', courseIds);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    setIsCartOpen(false);
    router.push(url);
  };

  // Show loading only on first load
  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <motion.div 
          variants={scaleInVariants}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div 
              className="absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: BRAND_COLORS.deepRed, borderTopColor: 'transparent' }}
            ></div>
          </div>
          <motion.p 
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-600"
          >
            Loading courses and bundles...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <HiBookOpen className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Content</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={retryFetch}
            className="px-6 py-2 bg-[#B11217] text-white rounded-lg hover:bg-[#8f0e12] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Email Popup */}
      <AnimatePresence mode="wait">
        {isEmailPopupOpen && selectedItem && (
          <EmailPopup
            isOpen={isEmailPopupOpen}
            onClose={() => {
              setIsEmailPopupOpen(false);
              setSelectedItem(null);
            }}
            onConfirm={handleEmailConfirm}
            courseTitle={selectedItem.title}
            savedEmail={userEmail}
          />
        )}
      </AnimatePresence>

      {/* Cart Message Toast */}
      <AnimatePresence mode="wait">
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100001] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm ${
              cartMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {cartMessage.type === 'success' ? (
              <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <HiExclamation className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{cartMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Bucket - Right Side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]">
        <motion.button
          onClick={() => setIsCartOpen(true)}
          className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-3 sm:p-4 rounded-l-full rounded-r-none shadow-2xl hover:shadow-3xl transition-all duration-300 group flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />

          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-white text-[#B11217] text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg border-2 border-[#B11217]"
            >
              {cartCount > 99 ? '99+' : cartCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] cursor-pointer"
            />

            <motion.div
              variants={slideInRightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto z-[99999]"
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <HiShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Your Learning Bag</h2>
                      <p className="text-sm text-white/80">
                        {cartCount} {cartCount === 1 ? 'Item Selected' : 'Items Selected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <HiX className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {userEmail && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <HiUser className="w-4 h-4" />
                      <span className="truncate">{userEmail}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <HiShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your bag is empty</h3>
                    <p className="text-gray-500 mb-6">Explore courses and bundles to start learning</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all cursor-pointer"
                    >
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => {
                        const course = allCourses.find(c => c.id === item.course_id);
                        const Icon = course?.icon || HiBookOpen;

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Icon className="w-5 h-5" style={{ color: course?.color || BRAND_COLORS.teal }} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                  {item.course_title}
                                </h3>
                                
                                {/* Bundle Badge */}
                                {item.is_bundle_item && item.bundle_name && (
                                  <div className="mb-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                      <HiGift className="w-3 h-3" />
                                      {item.bundle_name}
                                    </span>
                                  </div>
                                )}
                                
                                <p className="text-xs text-gray-400 mb-2">Added on {formatDate(item.added_at)}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    {item.is_bundle_item && item.bundle_discounted_price ? (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-green-600 text-sm">
                                          {formatCurrency(item.bundle_discounted_price)}
                                        </span>
                                        
                                      </div>
                                    ) : (
                                      <span className="font-bold text-[#B11217] text-sm">
                                        {formatCurrency(item.course_price)}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveFromCart(item.id, item.course_id)}
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
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-1">
                          <span className="text-red-500">•</span>
                          If you add courses from bundle then you only pay the bundle price which is much lower than the sum of individual course prices.
                          <span className="text-red-500">•</span>
                        </p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleProceedToEnrollment}
                          className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                        >
                          Proceed to Enrollment
                        </button>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-full py-3 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-lg font-medium hover:bg-[#1E3A8A] hover:text-white transition-all cursor-pointer"
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Badge */}
        <motion.div
          variants={fadeInDownVariants}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] rounded-full shadow-lg">
            <HiStar className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              {displayItems.length} Items Available ({allBundles.length} Bundles, {allCourses.length} Courses)
            </span>
            <HiStar className="w-4 h-4 ml-2 text-yellow-400" />
          </div>
        </motion.div>

        {/* Centered Heading */}
        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1C3D] mb-3">
            Explore Our <span className="text-[#B11217]">Courses & Bundles</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Choose from our selection of expert-led courses and discounted bundles designed to help you succeed
          </p>
        </motion.div>

        {/* Items Grid */}
        <motion.div 
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => {
              const isInCart = item.type === 'course' ? inCartStatus[item.id] : false;
              const isLoading = cartLoading[item.type === 'course' ? item.id : `bundle_${item.id}`];
              
              if (item.type === 'bundle') {
                const bundle = item.data as Bundle;
                return (
                  <motion.div
                    key={`bundle-${item.id}`}
                    variants={fadeInUpVariants}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="relative group cursor-pointer"
                    onClick={() => handleViewBundleDetails(item.id)}
                  >
                    {/* Bundle Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
                      {/* Image / Icon */}
                      <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-r from-yellow-50 to-orange-50 flex-shrink-0">
                        {bundle.image ? (
                          <img
                            src={bundle.image}
                            alt={bundle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dfp9qc0gu/image/upload/v1745412345/lms/course_images/default_course.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiOutlineGift className="w-20 h-20 text-yellow-500 opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                            <span className="text-xs font-medium text-[#B11217]">
                              {item.totalCourses} Courses
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-3 min-h-[3.5rem]">
                          <h3 className="text-lg font-bold text-[#0B1C3D] line-clamp-2 flex-1">
                            {item.title}
                          </h3>
                          <div className="p-2 bg-yellow-50 rounded-lg flex-shrink-0 ml-2">
                            <HiGift className="w-5 h-5 text-yellow-500" />
                          </div>
                        </div>

                        <div className="mb-4 min-h-[2.5rem]">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mb-4 p-3 bg-red-50 rounded-lg">
                          <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-2xl font-bold text-[#B11217]">{item.price}</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Save PKR {((bundle.original_price - bundle.discounted_price)).toLocaleString()}
                          </p>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-auto">
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleViewBundleDetails(item.id); }} 
                              className="flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center justify-center cursor-pointer"
                            >
                              <HiEye className="w-4 h-4 mr-1" />
                              <span>View Details</span>
                            </button>

                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddToCartClick(item); }}
                              disabled={isLoading}
                              className="flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-300 text-white text-sm flex items-center justify-center cursor-pointer"
                              style={{
                                backgroundColor: hoveredCard === item.id ? '#1E3A8A' : '#B11217',
                              }}
                            >
                              {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <HiShoppingBag className="w-4 h-4 mr-1" />
                                  <span>Add to Bag</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              } else {
                const course = item.data as Course;
                const Icon = course.icon || HiBookOpen;
                
                return (
                  <motion.div
                    key={`course-${item.id}`}
                    variants={fadeInUpVariants}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing, delay: index * 0.05 }}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="relative group"
                  >
                    {/* Course Card */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 flex-shrink-0">
                        {course.image && !imageErrors[course.id] ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={() => handleImageError(course.id)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Icon className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                            <span className="text-xs font-medium" style={{ color: course.color || BRAND_COLORS.teal }}>
                              {course.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-start justify-between mb-3 min-h-[3.5rem]">
                          <h3 className="text-lg font-bold text-[#0B1C3D] line-clamp-2 flex-1">
                            {course.title}
                          </h3>
                          <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0 ml-2">
                            <Icon className="w-5 h-5" style={{ color: course.color || BRAND_COLORS.teal }} />
                          </div>
                        </div>

                        <div className="mb-4 min-h-[2.5rem]">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description || 'No description available'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg min-h-[2.5rem]">
                            <HiClock className="w-3 h-3 mr-1 text-[#1E3A8A] flex-shrink-0" />
                            <span className="truncate">{course.duration || 'Flexible'}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg min-h-[2.5rem]">
                            <HiAcademicCap className="w-3 h-3 mr-1 text-[#1E3A8A] flex-shrink-0" />
                            <span className="truncate">{course.level || 'All Levels'}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg min-h-[2.5rem]">
                            <HiBadgeCheck className="w-3 h-3 mr-1 text-[#1E3A8A] flex-shrink-0" />
                            <span>Certificate</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4 mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-[#B11217]">{course.price}</span>
                                {course.originalPrice && (
                                  <span className="text-xs text-gray-400 line-through">{course.originalPrice}</span>
                                )}
                              </div>
                              {course.savings && (
                                <p className="text-xs text-green-600 mt-1 font-medium">{course.savings}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              href={`/courses/${course.id}`}
                              className="flex-1 py-2.5 px-3 rounded-lg font-medium text-center transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center justify-center cursor-pointer"
                            >
                              <span>Details</span>
                              <HiArrowRight className="w-4 h-4 ml-1" />
                            </Link>

                            {isInCart ? (
                              <button
                                onClick={() => {
                                  const cartItem = cartItems.find(item => item.course_id === course.id);
                                  if (cartItem) {
                                    handleRemoveFromCart(cartItem.id, course.id);
                                  }
                                }}
                                disabled={removingFromCart === cartItems.find(item => item.course_id === course.id)?.id}
                                className="flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center justify-center cursor-pointer"
                              >
                                {removingFromCart === cartItems.find(item => item.course_id === course.id)?.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <HiTrash className="w-4 h-4 mr-1" />
                                    <span>Remove</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddToCartClick(item)}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-300 text-white text-sm flex items-center justify-center cursor-pointer"
                                style={{
                                  backgroundColor: hoveredCard === item.id ? '#1E3A8A' : '#B11217',
                                }}
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <HiShoppingBag className="w-4 h-4 mr-1" />
                                    <span>Add to Bag</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })
          ) : (
            <motion.div
              variants={fadeInUpVariants}
              className="col-span-full text-center py-12"
            >
              <HiBookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No content available</h3>
              <p className="text-gray-500 mb-4">Please check back later for courses and bundles</p>
            </motion.div>
          )}
        </motion.div>

        {/* Explore All Courses Button */}
        {allCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#0B1C3D] text-white rounded-xl hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <span>Explore All {allCourses.length} Courses</span>
              <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}