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
  HiShoppingCart,
  HiMail,
  HiCheck,
  HiExclamation,
  HiTrash,
  HiShoppingBag,
  HiCurrencyRupee
} from "react-icons/hi";
import { FaCartPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from 'react-icons/md';
import Link from "next/link";
import { useRouter } from "next/navigation";

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
}

// Cart item interface
interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  added_at: string;
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
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-[100001]"
      >
        {/* Header with gradient */}
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
            To add <span className="font-semibold">"{courseTitle}"</span> to cart
          </p>
          {savedEmail && (
            <p className="text-xs text-blue-200 mt-2">
              Using saved email: {savedEmail}
            </p>
          )}
        </div>

        {/* Form */}
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
              {savedEmail ? 'Confirm & Add to Cart' : 'Confirm'}
            </button>
          </div>

          {/* Privacy note */}
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

// Transition settings
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
  const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [showFeatures, setShowFeatures] = useState(false);
  
  // Email popup state
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Welding", "Safety", "Pipe Fitter"]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cart states with API
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState<{[key: string]: boolean}>({});
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [inCartStatus, setInCartStatus] = useState<{[key: string]: boolean}>({});
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);
  
  // Cart sidebar state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load saved email from localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Save email to localStorage whenever it changes
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchCartCount();
    }
  }, [userEmail]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/instructors/course');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch courses');
      }
      
      if (result.success && result.data) {
        const coursesWithIcons = result.data.map((course: any) => {
          let numericPrice = 0;
          if (course.price) {
            // Extract numeric value from price string
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
        
        const publishedCourses = coursesWithIcons.filter((course: Course) => course.isPublished);
        // Show first 6 courses
        const firstSixCourses = publishedCourses.slice(0, 6);
        
        setAllCourses(publishedCourses);
        setDisplayCourses(firstSixCourses);
      } else {
        throw new Error('Invalid response format');
      }
      
      setTimeout(() => setShowFeatures(true), 500);
      
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

const fetchCartCount = async () => {
  if (!userEmail) return;
  
  try {
    const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
    const result = await response.json();
    if (result.success) {
      setCartCount(result.data.count);
      
      // Process cart items to ensure prices are numbers
      const processedItems = (result.data.items || []).map((item: any) => {
        let price: number = 0;
        const rawPrice = item.course_price;
        
        // Handle different price formats
        if (typeof rawPrice === 'string') {
          // Remove commas and convert to number
          const numericStr = rawPrice.replace(/,/g, '');
          price = parseFloat(numericStr);
          
          // Check if price seems too large (like 3,400,000 instead of 34,000)
          // If it's > 100,000 and your actual prices are in thousands, divide by 100
          if (price > 100000) {
            price = price / 100;
          }
        } else if (typeof rawPrice === 'number') {
          price = rawPrice;
          // If number is too large, divide by 100
          if (price > 100000) {
            price = price / 100;
          }
        }
        
        return {
          id: item.id,
          course_id: item.course_id,
          course_title: item.course_title,
          course_price: isNaN(price) ? 0 : price,
          added_at: item.added_at
        };
      });
      
      setCartItems(processedItems);
      
      // Update in cart status
      const inCartMap: {[key: string]: boolean} = {};
      if (processedItems.length > 0) {
        processedItems.forEach((item: CartItem) => {
          inCartMap[item.course_id] = true;
        });
      }
      setInCartStatus(inCartMap);
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
  }
};

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const allTitles = allCourses.map(c => c.title);
      const filtered = allTitles.filter(title => 
        title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allCourses]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setIsSearchFocused(false);
    
    if (!recentSearches.includes(suggestion)) {
      setRecentSearches(prev => [suggestion, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleImageError = (courseId: string) => {
    setImageErrors(prev => ({ ...prev, [courseId]: true }));
  };

  const retryFetch = () => {
    fetchCourses();
  };

  // Open email popup for add to cart - only if email doesn't exist
  const handleAddToCartClick = (course: Course) => {
    if (userEmail) {
      // If email already exists, add directly to cart without popup
      addToCart(course, userEmail);
    } else {
      // If no email, show popup
      setSelectedCourse(course);
      setIsEmailPopupOpen(true);
    }
  };

  // Handle email confirmation and add to cart
  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    
    if (!selectedCourse) return;
    
    // Save email for future use
    setUserEmail(email);
    
    // Add to cart
    await addToCart(selectedCourse, email);
  };

  // Add to cart API call
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
        await fetchCartCount(); // Refresh cart count
        
        setCartMessage({
          type: 'success',
          text: 'Course added to cart successfully!'
        });
        
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        if (result.error === 'Course already in cart') {
          setInCartStatus(prev => ({ ...prev, [course.id]: true }));
          setCartMessage({
            type: 'error',
            text: 'Course is already in your cart'
          });
        } else {
          throw new Error(result.error || 'Failed to add to cart');
        }
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartMessage({
        type: 'error',
        text: error.message || 'Failed to add to cart'
      });
    } finally {
      setCartLoading(prev => ({ ...prev, [course.id]: false }));
      setSelectedCourse(null);
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
        // Update cart items
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        
        // Update in cart status
        setInCartStatus(prev => ({ ...prev, [courseId]: false }));
        
        // Refresh cart count
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

  // Navigate to cart
  const goToCart = () => {
    router.push('/lms/Student_Portal/cart');
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
      return 'Rs0';
    }
    
    // Ensure amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return 'Rs0';
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
// Calculate cart total safely
const cartTotal = cartItems.reduce((sum, item) => {
  // Ensure item.course_price is treated as a number
  const price = typeof item.course_price === 'number' ? item.course_price : 0;
  
  // If price is too large, normalize it
  let finalPrice = price;
  if (finalPrice > 100000) {
    finalPrice = finalPrice / 100;
  }
  
  return sum + (isNaN(finalPrice) ? 0 : finalPrice);
}, 0);

  if (loading) {
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
            Loading instructor courses...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <HiBookOpen className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Courses</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={retryFetch}
            className="px-6 py-2 bg-[#B11217] text-white rounded-lg hover:bg-[#8f0e12] transition-colors"
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
        {isEmailPopupOpen && selectedCourse && (
          <EmailPopup
            isOpen={isEmailPopupOpen}
            onClose={() => {
              setIsEmailPopupOpen(false);
              setSelectedCourse(null);
            }}
            onConfirm={handleEmailConfirm}
            courseTitle={selectedCourse.title}
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
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100001] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
              cartMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
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

      {/* Cart Bucket - Right Side */}
   <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]">
  <motion.button
    onClick={() => setIsCartOpen(true)}
    className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-3 sm:p-4 rounded-l-full rounded-r-none shadow-2xl hover:shadow-3xl transition-all duration-300 group flex items-center justify-center"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <FaCartPlus className="w-6 h-6" />

    {/* Cart Count Badge */}
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            
            {/* Cart Sidebar */}
            <motion.div
              variants={slideInRightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
              style={{ 
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 99999
              }}
            >
              {/* Sidebar Header */}
              <div className="sticky top-0 z-[100000] bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <HiShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Your Cart
                      </h2>
                      <p className="text-sm text-white/80">
                        {cartCount} {cartCount === 1 ? 'Course' : 'Courses'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <HiX className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaCartPlus className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start adding courses to get started
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-6 py-2 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Continue Shopping
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
                                <p className="text-xs text-gray-500 mb-2">
                                  Added {formatDate(item.added_at)}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#B11217] text-sm">
                                    {formatCurrency(item.course_price)}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveFromCart(item.id, item.course_id)}
                                    disabled={removingFromCart === item.id}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                    {/* Cart Summary */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(cartTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Total Items</span>
                          <span className="font-semibold text-gray-900">{cartCount}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setIsCartOpen(false);
                            router.push('/checkout');
                          }}
                          className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
                        >
                          Proceed to Checkout
                        </button>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="w-full py-3 rounded-lg font-medium transition-all border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white"
                        >
                          Continue Shopping
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

      {/* Hero Section */}
      <div className="relative min-h-[400px] flex items-center justify-center pt-20 pb-16 overflow-hidden bg-gradient-to-br from-[#0B1C3D] via-[#1E3A8A] to-[#B11217]">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Floating Shapes */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-3xl backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full backdrop-blur-sm"
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <HiAcademicCap className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                Featured Courses
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
            >
              Top Instructor-Led
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Training Programs
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-200 max-w-2xl mx-auto"
            >
              Discover our most popular courses taught by industry experts. 
              Limited seats available for each program.
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Badge */}
        <div className="mb-8 flex items-center justify-center">
          <div className="px-4 py-2 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] rounded-full shadow-lg">
            <p className="text-sm text-white font-medium flex items-center">
              <HiStar className="w-4 h-4 mr-1 text-yellow-400" />
              {displayCourses.length} Featured Courses Available
              <HiStar className="w-4 h-4 ml-1 text-yellow-400" />
            </p>
          </div>
        </div>

        {/* Courses Grid - Now showing 6 courses */}
        <motion.div 
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {displayCourses.length > 0 ? (
            displayCourses.map((course, index) => {
              const Icon = course.icon;
              const isInCart = inCartStatus[course.id];
              const isLoading = cartLoading[course.id];
              
              return (
                <motion.div
                  key={course.id}
                  variants={fadeInUpVariants}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredCard(course.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="relative group"
                >
                  {/* Featured Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05, ...springTransition }}
                    className="absolute -top-2 -left-2 z-10"
                  >
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold shadow-lg flex items-center">
                      <HiStar className="w-3 h-3 mr-1" />
                      Featured
                    </div>
                  </motion.div>

                  {/* Course Card */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
  {/* Image - Fixed height */}
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

    {/* Featured Badge (if featured) */}
    {course.featured && (
      <div className="absolute top-3 left-3 z-10">
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold shadow-lg flex items-center">
          <HiStar className="w-3 h-3 mr-1" />
          Featured
        </div>
      </div>
    )}
  </div>

  {/* Content - Flexible height with flex-grow */}
  <div className="p-5 flex flex-col flex-grow">
    {/* Title and Icon - Fixed height for 2 lines */}
    <div className="flex items-start justify-between mb-3 min-h-[3.5rem]">
      <h3 className="text-lg font-bold text-[#0B1C3D] line-clamp-2 flex-1">
        {course.title}
      </h3>
      <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0 ml-2">
        <Icon className="w-5 h-5" style={{ color: course.color || BRAND_COLORS.teal }} />
      </div>
    </div>

    

 

    {/* Description - Fixed height for 2 lines with truncation */}
    <div className="mb-4 min-h-[2.5rem]">
      <p className="text-sm text-gray-600 line-clamp-2">
        {course.description || 'No description available'}
      </p>
    </div>

    {/* Meta Info - Grid with equal height items */}
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg min-h-[2.5rem]">
        <HiClock className="w-3 h-3 mr-1 text-[#1E3A8A] flex-shrink-0" />
        <span className="truncate">{course.duration || 'Flexible'}</span>
      </div>
      <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg min-h-[2.5rem]">
        <HiUserGroup className="w-3 h-3 mr-1 text-[#1E3A8A] flex-shrink-0" />
        <span className="truncate">{course.students || 'Limited seats'}</span>
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

    {/* Price and Actions - Always at bottom */}
    <div className="border-t border-gray-100 pt-4 mt-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#B11217]">
              {(course.price)}
            </span>
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {(course.originalPrice)}
              </span>
            )}
          </div>
          {course.savings && (
            <p className="text-xs text-green-600 mt-1 font-medium">
              {course.savings}
            </p>
          )}
        </div>
      </div>

      {/* Buttons - Equal width and height */}
      <div className="flex gap-2">
        {/* View Details Button */}
        <Link
          href={`/courses/${course.id}`}
          className="flex-1 py-2.5 px-3 rounded-lg font-medium text-center transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center justify-center min-h-[2.75rem]"
        >
          <span>Details</span>
          <HiArrowRight className="w-4 h-4 ml-1" />
        </Link>

        {/* Add to Cart / Remove from Cart Button */}
        {isInCart ? (
          <button
            onClick={() => {
              const cartItem = cartItems.find(item => item.course_id === course.id);
              if (cartItem) {
                handleRemoveFromCart(cartItem.id, course.id);
              }
            }}
            disabled={removingFromCart === cartItems.find(item => item.course_id === course.id)?.id}
            className="flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center justify-center min-h-[2.75rem]"
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
            onClick={() => handleAddToCartClick(course)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-3 rounded-lg font-medium transition-all duration-300 text-white text-sm flex items-center justify-center min-h-[2.75rem]"
            style={{
              backgroundColor: hoveredCard === course.id ? '#1E3A8A' : '#B11217',
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <HiShoppingCart className="w-4 h-4 mr-1" />
                <span>Add to Cart</span>
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
            })
          ) : (
            <motion.div
              variants={fadeInUpVariants}
              className="col-span-full text-center py-12"
            >
              <HiBookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses available</h3>
              <p className="text-gray-500">Please check back later for new courses</p>
            </motion.div>
          )}
        </motion.div>

        {/* View All Courses Link */}
        {allCourses.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-[#1E3A8A] text-white rounded-xl hover:bg-[#0B1C3D] transition-all duration-300 group"
            >
              <span>View All {allCourses.length} Courses</span>
              <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}