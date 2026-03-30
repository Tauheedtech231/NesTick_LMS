"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { 
  HiClock, 
 
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
  HiExclamation,
  HiCheck,
  HiTrash,
  HiShoppingBag,
  HiUserGroup
} from "react-icons/hi";
import { FaCartPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from 'react-icons/md';
import Link from "next/link";
import { useRouter } from "next/navigation";
import CoursesTab from "@/components/stats";
import { GraduationCap } from "lucide-react";

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

// Z-index constants for better maintainability
const Z_INDEX = {
  BASE: 1,
  NAVBAR: 100,
  DROPDOWN: 110,
  BACKDROP: 150,
  MOBILE_MENU: 200,
  CART_BUTTON: 999,      // Cart button stays above navbar
  CART_SIDEBAR: 1000,     // Cart sidebar highest priority
  CART_BACKDROP: 999,     // Cart backdrop
  TOAST: 1001,            // Toast messages highest
  MODAL: 2000
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
  created_at: string;
}

// Email Popup Props
interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  courseTitle: string;
  savedEmail?: string;
}

// Email Popup Component - FIXED z-index
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
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: Z_INDEX.MODAL }}
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
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
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

// Map icon strings to actual icon components
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

// Feature item interface
interface FeatureItem {
  id: string;
  icon: any;
  title: string;
  shortDescription: string;
  longDescription: string;
  iconColor: string;
  gradient: string;
  bullets: string[];
}

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
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [showFeatures, setShowFeatures] = useState(false);
  const [openFeature, setOpenFeature] = useState<string | null>(null);
  
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

  // Cart states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState<{[key: string]: boolean}>({});
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [inCartStatus, setInCartStatus] = useState<{[key: string]: boolean}>({});
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  // Feature items - define outside component or use useMemo
  const features: FeatureItem[] = [
    {
      id: 'standards',
      icon: HiBadgeCheck,
      title: 'International Standards',
      shortDescription: 'Our programs follow global industry standards',
      longDescription: 'All our training programs are designed according to international standards including ISO, OSHA, and industry-specific regulations. We ensure our curriculum meets global benchmarks, making our graduates competitive in the international job market.',
      iconColor: '#14B8A6',
      gradient: 'from-teal-400 to-teal-600',
      bullets: [
        'ISO 9001:2015 Certified Programs',
        'OSHA Safety Standards Compliance',
        'International Curriculum Alignment',
        'Global Best Practices Integration'
      ]
    },
    {
      id: 'hands-on',
      icon: HiCog,
      title: 'Hands-on Training',
      shortDescription: 'Practical, workshop-based learning experience',
      longDescription: 'Our state-of-the-art workshops are equipped with industry-grade tools and equipment. Students get real hands-on experience working on actual projects, simulating real-world scenarios they will encounter in their careers.',
      iconColor: '#2563EB',
      gradient: 'from-blue-500 to-blue-700',
      bullets: [
        'State-of-the-art Workshops',
        'Real Project Experience',
        'Industry-Grade Equipment',
        'Practical Skill Development'
      ]
    },
    {
      id: 'certification',
      icon: HiBriefcase,
      title: 'Industry Certification',
      shortDescription: 'Get certified with employer-valued credentials',
      longDescription: 'Upon completion, students receive certification that is recognized by leading employers in the construction, manufacturing, and safety sectors. Our certificates validate your skills and increase your employability.',
      iconColor: '#9333EA',
      gradient: 'from-purple-500 to-purple-700',
      bullets: [
        'Employer-Recognized Certificates',
        'Skill Validation & Assessment',
        'Digital & Physical Credentials',
        'Industry Partnership Network'
      ]
    }
  ];

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Fetch cart count when user is available
  useEffect(() => {
    if (userEmail) {
      fetchCartCount();
    }
  }, [userEmail]);

  // FIXED: Properly parse cart items and normalize prices
  const fetchCartCount = async () => {
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        setCartCount(result.data.count);
        
        // Process cart items to normalize prices (divide by 100 if too large)
        const processedItems = (result.data.items || []).map((item: any) => {
          let price = item.course_price;
          
          // Parse price to number if it's a string
          if (typeof price === 'string') {
            price = parseFloat(price.replace(/,/g, '')) || 0;
          }
          
          // Normalize price: if price > 100000, divide by 100 (fix for 3,400,000 -> 34,000)
          if (price > 100000) {
            price = price / 100;
          }
          
          return {
            id: item.id,
            course_id: item.course_id,
            course_title: item.course_title,
            course_price: price,
            created_at: item.created_at
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all courses from instructor_course table
      const response = await fetch('/api/instructors/course');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch courses');
      }
      
      if (result.success && result.data) {
        // Extract numeric price
        const coursesWithIcons = result.data.map((course: any) => {
          let numericPrice = 0;
          if (course.price) {
            const priceMatch = String(course.price).match(/\d+/g);
            if (priceMatch) {
              numericPrice = parseInt(priceMatch.join(''));
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
        
        // Filter to show only published courses
        const publishedCourses = coursesWithIcons.filter((course: Course) => course.isPublished);
        
        setAllCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
      } else {
        throw new Error('Invalid response format');
      }
      
      // Show features after courses load
      setTimeout(() => setShowFeatures(true), 500);
      
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
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

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(allCourses);
    } else {
      const filtered = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.level.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
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

  const toggleFeature = (featureId: string) => {
    setOpenFeature(openFeature === featureId ? null : featureId);
  };

  const retryFetch = () => {
    fetchCourses();
  };

  // Open email popup for add to cart
  const handleAddToCartClick = (course: Course) => {
    setSelectedCourse(course);
    
    if (userEmail) {
      // Email already exists, directly add to cart
      addToCart(course, userEmail);
    } else {
      // Open email popup
      setIsEmailPopupOpen(true);
    }
  };

  // Handle email confirmation and add to cart
  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    
    if (!selectedCourse) return;
    
    // Save email for future use
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    
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

  // Format currency - FIXED: Handle large numbers and ensure proper display
  const formatCurrency = (amount: number) => {
    // Check if amount is valid number
    if (isNaN(amount) || amount === null || amount === undefined) {
      return 'Rs 0';
    }
    
    // Ensure amount is a number and normalize if needed
    let finalAmount = Number(amount);
    
    // If amount is too large (> 100000), divide by 100 (fix for 3,400,000 -> 34,000)
    if (finalAmount > 100000) {
      finalAmount = finalAmount / 100;
    }
    
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(finalAmount).replace('PKR', 'Rs');
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

  // Calculate cart total - FIXED: Normalize prices and ensure correct sum
  const cartTotal = cartItems.reduce((sum, item) => {
    let price = item.course_price || 0;
    
    // Ensure price is a number
    price = Number(price);
    
    // Normalize if too large
    if (price > 100000) {
      price = price / 100;
    }
    
    return sum + (isNaN(price) ? 0 : price);
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

      {/* Cart Message Toast - FIXED: Highest z-index */}
      <AnimatePresence mode="wait">
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ 
              zIndex: Z_INDEX.TOAST,
              backgroundColor: cartMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: cartMessage.type === 'success' ? '#166534' : '#991b1b',
              border: cartMessage.type === 'success' ? '1px solid #86efac' : '1px solid #fecaca'
            }}
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

      {/* Cart Bucket - Right Side - FIXED: Higher z-index than navbar */}
     <div
  className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]"
  style={{ zIndex: Z_INDEX.CART_BUTTON }}
>
  <motion.button
    onClick={() => setShowCartSidebar(true)}
    className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-3 sm:p-4 rounded-l-full rounded-r-none shadow-2xl hover:shadow-3xl transition-all duration-300 group flex items-center justify-center"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <HiShoppingBag className="w-6 h-6" />

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

      {/* Cart Sidebar - FIXED: Highest z-index to appear above everything */}
      <AnimatePresence>
  {showCartSidebar && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowCartSidebar(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: Z_INDEX.CART_BACKDROP }}
      />
      
      {/* Cart Sidebar */}
      <motion.div
        variants={slideInRightVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
        style={{ zIndex: Z_INDEX.CART_SIDEBAR }}
      >
        {/* Sidebar Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6" style={{ zIndex: Z_INDEX.CART_SIDEBAR + 1 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Selected Courses
                </h2>
                <p className="text-sm text-white/80">
                  {cartItems.length} {cartItems.length === 1 ? 'Course Selected' : 'Courses Selected'}
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
        </div>

        {/* Selected Courses List */}
        <div className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Courses Selected
              </h3>
              <p className="text-gray-500 mb-6">
                Start exploring courses to add to your learning journey
              </p>
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
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                            {item.course_title}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">
                            Added {formatDate(item.created_at)}
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

              {/* Enrollment Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Enrollment Fee</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Courses</span>
                    <span className="font-semibold text-gray-900">{cartItems.length}</span>
                  </div>
                </div>

                {/* Action Buttons */}
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

      {/* Hero Section */}
      <div className="relative min-h-[650px] flex items-start justify-center pt-32 pb-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C3D]/95 via-[#0B1C3D]/90 to-[#0B1C3D]/95"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-10">
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            transition={getTransition(0.2)}
          >
            {/* Badge */}
            <motion.div
              variants={scaleInVariants}
              initial="initial"
              animate="animate"
              transition={springTransition}
              className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <HiStar className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                Instructor-Led Training Programs
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={getTransition(0.4)}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
            >
              Explore Our
              <span className="block mt-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                Expert-Led Courses
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={getTransition(0.5)}
              className="text-lg md:text-xl max-w-3xl mx-auto mb-10 px-4 text-gray-300"
            >
              Browse through our collection of professional courses created by expert instructors
            </motion.p>

            {/* Search Section */}
            <motion.div
              ref={searchRef}
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              transition={getTransition(0.6)}
              className="max-w-2xl mx-auto relative px-4"
            >
              <div className="relative group">
                {/* Search Input */}
                <div className="relative flex items-center">
                  <HiSearch className="absolute left-5 w-5 h-5 text-gray-400" />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search for courses... (e.g., Welding, Safety, Pipe Fitter)"
                    className="w-full h-14 pl-12 pr-12 rounded-full border-2 border-white/30 bg-white/95 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all duration-300 text-base md:text-lg shadow-xl"
                  />
                  
                  {searchQuery && (
                    <motion.button
                      variants={scaleInVariants}
                      initial="initial"
                      animate="animate"
                      exit={scaleInVariants.exit}
                      onClick={clearSearch}
                      className="absolute right-5 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <HiX className="w-4 h-4 text-gray-400" />
                    </motion.button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence mode="wait">
                  {isSearchFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
                    <motion.div
                      key="search-suggestions"
                      variants={fadeInUpVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                      style={{ zIndex: 60 }}
                    >
                      {/* Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-400">
                            Suggestions
                          </div>
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors flex items-center"
                            >
                              <HiSearch className="w-4 h-4 mr-3 text-gray-400" />
                              <span className="text-gray-700">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-400">
                            Recent Searches
                          </div>
                          <div className="flex flex-wrap gap-2 px-2">
                            {recentSearches.map((search) => (
                              <button
                                key={search}
                                onClick={() => handleSuggestionClick(search)}
                                className="px-4 py-2 bg-white rounded-xl text-sm text-gray-600 hover:shadow-md border border-gray-200 transition-all flex items-center"
                              >
                                <HiRecent className="w-3 h-3 mr-1" />
                                {search}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Popular Tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm text-gray-300">Popular:</span>
                {["Welding", "Safety", "Pipe Fitter", "Electrical"].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Instructor Badge */}
        <div className="mb-8 flex items-center justify-center">
          <div className="px-4 py-2 bg-[#1E3A8A]/10 rounded-full">
            <p className="text-sm text-[#1E3A8A] font-medium">
              {allCourses.length} Instructor-Led Courses Available
            </p>
          </div>
        </div>

        {/* Search Results Info */}
        <AnimatePresence mode="wait">
          {searchQuery && (
            <motion.div
              key="search-results"
              variants={fadeInUpVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={getTransition()}
              className="mb-6"
            >
              <p className="text-gray-600">
                Found <span className="font-semibold text-[#B11217]">{filteredCourses.length}</span> courses matching "<span className="font-medium">{searchQuery}</span>"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Courses Grid - FIXED: Card sizes increased */}
        <motion.div 
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => {
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
                  {/* Instructor Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05, ...springTransition }}
                    className="absolute -top-2 -left-2 z-10"
                  >
                    <div className="px-3 py-1 rounded-full bg-[#1E3A8A] text-white text-xs font-semibold shadow-lg flex items-center">
                      <HiAcademicCap className="w-3 h-3 mr-1" />
                      Instructor Led
                    </div>
                  </motion.div>

                  {/* Course Card - FIXED: Increased size and better spacing */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
  {/* Image - Fixed height */}
  <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100 flex-shrink-0">
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
        <HiBookOpen className="w-20 h-20 text-gray-300" />
      </div>
    )}
    
    {/* Category Badge */}
    <div className="absolute top-3 right-3">
      <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
        <span className="text-xs font-medium" style={{ color: course.color || BRAND_COLORS.teal }}>
          {course.category}
        </span>
      </div>
    </div>

    {/* Featured Badge - Optional */}
    {course.featured && (
      <div className="absolute top-3 left-3">
        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold shadow-lg flex items-center">
          <HiStar className="w-3 h-3 mr-1" />
          Featured
        </div>
      </div>
    )}
  </div>

  {/* Content - Flex column with equal spacing */}
  <div className="p-6 flex flex-col flex-grow">
    {/* Title and Icon - Fixed height for 2 lines */}
    <div className="flex items-start justify-between mb-3 min-h-[3.5rem]">
      <h3 className="text-xl font-bold text-[#0B1C3D] line-clamp-2 flex-1">
        {course.title}
      </h3>
      <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0 ml-2">
        <Icon className="w-5 h-5" style={{ color: course.color || BRAND_COLORS.teal }} />
      </div>
    </div>

  

    {/* Description - Fixed height for 2 lines */}
    <div className="mb-4 min-h-[2.5rem]">
      <p className="text-sm text-gray-600 line-clamp-2">
        {course.description || 'No description available'}
      </p>
    </div>

    {/* Meta Info - Grid with equal height items */}
    <div className="grid grid-cols-2 gap-3 mb-4">
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

    {/* Price and Actions - Always at bottom */}
    <div className="border-t border-gray-100 pt-4 mt-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#B11217]">
              {(course.price)}
            </span>
            {course.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
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
          className="flex-1 py-3 px-4 rounded-lg font-medium text-center transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm flex items-center justify-center min-h-[2.75rem]"
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
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 text-sm flex items-center justify-center min-h-[2.75rem]"
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
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 text-white text-sm flex items-center justify-center min-h-[2.75rem]"
            style={{
              backgroundColor: hoveredCard === course.id ? '#1E3A8A' : '#B11217',
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
            })
          ) : (
            <motion.div
              variants={fadeInUpVariants}
              className="col-span-full text-center py-12"
            >
              <HiBookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
              <button
                onClick={clearSearch}
                className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#0B1C3D] transition-colors"
              >
                Clear Search
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={showFeatures ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] as Easing }}
          className="mt-20 relative rounded-3xl overflow-hidden"
        >
          {/* Background overlay */}
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C3D]/95 via-[#0B1C3D]/90 to-[#0B1C3D]/95"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 py-16 px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Why Choose Our Instructor-Led Programs?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300"
                  >
                    {/* Feature Header */}
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className="w-full p-6 text-left transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-white/10 rounded-xl">
                            <Icon className="w-6 h-6" style={{ color: feature.iconColor }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-gray-200">
                              {feature.shortDescription}
                            </p>
                          </div>
                        </div>
                        
                        {/* Dropdown Arrow */}
                        <motion.div
                          animate={{ rotate: openFeature === feature.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <MdKeyboardArrowDown className={`w-6 h-6 ${openFeature === feature.id ? 'text-white' : 'text-gray-300'} transition-colors`} />
                        </motion.div>
                      </div>
                    </button>

                    {/* Dropdown Description */}
                    <AnimatePresence mode="wait">
                      {openFeature === feature.id && (
                        <motion.div
                          key={feature.id}
                          variants={slideDownVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as Easing }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-white/20 backdrop-blur-md border-t border-white/20">
                            <p className="text-sm text-white leading-relaxed mb-4">
                              {feature.longDescription}
                            </p>
                            
                            <div className="space-y-2">
                              {feature.bullets.map((bullet: string, idx: number) => (
                                <div key={idx} className="flex items-center text-xs text-gray-200">
                                  <HiCheckCircle className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: feature.iconColor }} />
                                  <span>{bullet}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CoursesTab Component */}
      <div >
        <CoursesTab />
      </div>
    </div>
  );
}