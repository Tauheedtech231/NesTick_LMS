"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Easing } from "framer-motion";
import type { Bundle, Course } from './types';
import { CartItem } from '@/lib/types';
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
  HiUserGroup,
  HiTag,
  HiGift,
  HiEye,
  HiOutlineGift
} from "react-icons/hi";
import { FaCartPlus } from "react-icons/fa";
import { MdKeyboardArrowDown } from 'react-icons/md';
import Link from "next/link";
import { useRouter } from "next/navigation";
import CoursesTab from "@/components/stats";
import { GraduationCap } from "lucide-react";
import CartSidebar from './CartSidebar';

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
interface ExtendedBundle extends Bundle {
  image?: string;
}

// Session Storage Keys
const SESSION_KEYS = {
  COURSES: 'courses_data',
  BUNDLES: 'bundles_data',
  TIMESTAMP: 'courses_timestamp'
};

// Cache expiry time (30 minutes in milliseconds)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Helper function to check if cache is valid
const isCacheValid = (timestamp: string | null): boolean => {
  if (!timestamp) return false;
  const cachedTime = parseInt(timestamp, 10);
  const now = Date.now();
  return (now - cachedTime) < CACHE_EXPIRY;
};

// Helper function to save data to session storage
const saveToSessionStorage = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }
};

// Helper function to get data from session storage
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

// Email Popup Component
const EmailPopup = ({ isOpen, onClose, onConfirm, courseTitle, savedEmail }: any) => {
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
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, savedEmail]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
      className="fixed inset-0 flex items-center justify-center p-4 cursor-pointer"
      style={{ zIndex: Z_INDEX.MODAL }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
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
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiMail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {savedEmail ? 'Confirm Your Email' : 'Enter Your Email'}
          </h3>
          <p className="text-sm text-blue-100">To add <span className="font-semibold">"{courseTitle}"</span> to bag</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none cursor-text ${
                  error ? 'border-red-300 bg-red-50' : isValid ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
                autoFocus={!savedEmail}
                readOnly={!!savedEmail}
              />
              {isValid && <HiCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />}
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all cursor-pointer ${
                isValid ? 'bg-gradient-to-r from-[#B11217] to-[#8f0e12] hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {savedEmail ? 'Confirm & Add to Bag' : 'Confirm'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Map icon strings to actual icon components
const getIconComponent = (iconName: string | null) => {
  const iconMap: { [key: string]: any } = {
    'HiWrench': HiWrench, 'HiShieldCheck': HiShieldCheck, 'HiFire': HiFire, 'HiBookOpen': HiBookOpen,
    'HiAcademicCap': HiAcademicCap, 'HiClock': HiClock, 'HiUserGroup': HiUserGroup, 'HiBadgeCheck': HiBadgeCheck,
    'HiCog': HiCog, 'HiBriefcase': HiBriefcase,
  };
  return iconMap[iconName || ''] || HiBookOpen;
};

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
const fadeInUpVariants = { initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -30, opacity: 0 } };
const scaleInVariants = { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 } };
const slideDownVariants = { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 } };
const staggerContainerVariants = { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const getTransition = (delay: number = 0) => ({ duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing, delay });
const springTransition = { type: "spring" as const, stiffness: 260, damping: 20, mass: 1 };

export default function CoursesPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [bundles, setBundles] = useState<ExtendedBundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<ExtendedBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [showFeatures, setShowFeatures] = useState(false);
  const [openFeature, setOpenFeature] = useState<string | null>(null);
  
  // Modal states
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBundleForCart, setSelectedBundleForCart] = useState<ExtendedBundle | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Welding", "Safety", "Pipe Fitter"]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState<{[key: string]: boolean}>({});
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [inCartStatus, setInCartStatus] = useState<{[key: string]: boolean}>({});
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [bundleAddedMessage, setBundleAddedMessage] = useState<{bundleId: string, discountedPrice: number} | null>(null);

  const features: FeatureItem[] = [
    {
      id: 'standards', icon: HiBadgeCheck, title: 'International Standards',
      shortDescription: 'Our programs follow global industry standards',
      longDescription: 'All our training programs are designed according to international standards...',
      iconColor: '#14B8A6', gradient: 'from-teal-400 to-teal-600',
      bullets: ['ISO 9001:2015 Certified Programs', 'OSHA Safety Standards Compliance', 'International Curriculum Alignment', 'Global Best Practices Integration']
    },
    {
      id: 'hands-on', icon: HiCog, title: 'Hands-on Training',
      shortDescription: 'Practical, workshop-based learning experience',
      longDescription: 'Our state-of-the-art workshops are equipped with industry-grade tools...',
      iconColor: '#2563EB', gradient: 'from-blue-500 to-blue-700',
      bullets: ['State-of-the-art Workshops', 'Real Project Experience', 'Industry-Grade Equipment', 'Practical Skill Development']
    },
    {
      id: 'certification', icon: HiBriefcase, title: 'Industry Certification',
      shortDescription: 'Get certified with employer-valued credentials',
      longDescription: 'Upon completion, students receive certification that is recognized by leading employers...',
      iconColor: '#9333EA', gradient: 'from-purple-500 to-purple-700',
      bullets: ['Employer-Recognized Certificates', 'Skill Validation & Assessment', 'Digital & Physical Credentials', 'Industry Partnership Network']
    }
  ];

  // Load data from session storage or fetch from API
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if we have cached data in session storage
      const cachedCourses = getFromSessionStorage(SESSION_KEYS.COURSES);
      const cachedBundles = getFromSessionStorage(SESSION_KEYS.BUNDLES);
      const cacheTimestamp = getFromSessionStorage(SESSION_KEYS.TIMESTAMP);
      
      const isCacheValidFlag = isCacheValid(cacheTimestamp);
      
      // If cache exists and is valid, use it immediately
      if (isCacheValidFlag && cachedCourses && cachedBundles) {
        console.log('Loading data from session storage cache');
        setAllCourses(cachedCourses);
        setFilteredCourses(cachedCourses);
        setBundles(cachedBundles);
        setFilteredBundles(cachedBundles);
        setLoading(false);
        setInitialLoadComplete(true);
        setTimeout(() => setShowFeatures(true), 500);
        
        // Still fetch fresh data in background to update cache
        fetchFreshData();
      } else {
        // No valid cache, fetch fresh data
        console.log('No valid cache found, fetching fresh data');
        await fetchFreshData();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setLoading(false);
    }
  };

  // Fetch fresh data from API and update cache
  const fetchFreshData = async () => {
    try {
      console.log('Fetching fresh data from API');
      
      // Fetch courses
      const coursesResponse = await fetch('/api/instructors/course');
      const coursesResult = await coursesResponse.json();
      
      if (!coursesResponse.ok) throw new Error(coursesResult.error || 'Failed to fetch courses');
      
      let coursesData: Course[] = [];
      if (coursesResult.success && coursesResult.data) {
        coursesData = coursesResult.data.map((course: any) => ({
          id: course.id, title: course.title, category: course.category || 'Technical Training',
          description: course.description || '', duration: course.duration || 'Flexible',
          students: `${course.student_capacity || 0}+ seats`, level: course.level || 'Beginner', highlights: [],
          price: course.price ? `PKR ${Number(course.price).toLocaleString()}` : 'Contact for price',
          originalPrice: course.original_price ? `PKR ${Number(course.original_price).toLocaleString()}` : null,
          savings: course.original_price && course.price ? `Save ${Math.round((1 - Number(course.price)/Number(course.original_price)) * 100)}%` : null,
          numericPrice: Number(course.price) || 0, icon: getIconComponent(course.icon), color: course.color || BRAND_COLORS.teal,
          image: course.image, courseImage: course.image, featured: false, rating: 4.5, reviews: 0,
          isPublished: course.status === 'published', instructorId: course.instructor_id, instructorName: course.instructor_name, createdAt: course.created_at
        }));
        
        const publishedCourses = coursesData.filter((c: Course) => c.isPublished);
        
        // Save to session storage
        saveToSessionStorage(SESSION_KEYS.COURSES, publishedCourses);
        
        // Update state
        setAllCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
      }
      
      // Fetch bundles
      const bundlesResponse = await fetch('/api/admin/bundles');
      const bundlesResult = await bundlesResponse.json();
      
      let bundlesData: ExtendedBundle[] = [];
      if (bundlesResult.success) {
        bundlesData = bundlesResult.data.filter((b: ExtendedBundle) => b.status === 'active');
        
        // Save to session storage
        saveToSessionStorage(SESSION_KEYS.BUNDLES, bundlesData);
        
        // Update state
        setBundles(bundlesData);
        setFilteredBundles(bundlesData);
      }
      
      // Save timestamp
      saveToSessionStorage(SESSION_KEYS.TIMESTAMP, Date.now().toString());
      
      setLoading(false);
      setInitialLoadComplete(true);
      setTimeout(() => setShowFeatures(true), 500);
      
    } catch (err) {
      console.error('Error fetching fresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
      setLoading(false);
    }
  };

  // Refetch data manually (for retry)
  const retryFetch = () => {
    fetchFreshData();
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) setUserEmail(savedEmail);
    
    // Load data on mount
    loadData();
  }, []);

  useEffect(() => {
    if (userEmail && initialLoadComplete) {
      fetchCartCount();
    }
  }, [userEmail, initialLoadComplete]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        setCartCount(result.data.count);
        const processedItems = (result.data.items || []).map((item: any) => {
          let price = item.course_price;
          if (typeof price === 'string') price = parseFloat(price.replace(/,/g, '')) || 0;
          if (price > 100000) price = price / 100;
          return { 
            id: item.id, 
            course_id: item.course_id, 
            course_title: item.course_title, 
            course_price: price, 
            created_at: item.created_at,
            is_bundle_item: item.is_bundle_item,
            bundle_name: item.bundle_name,
            bundle_id: item.bundle_id,
            bundle_discounted_price: item.bundle_discounted_price
          };
        });
        setCartItems(processedItems);
        const inCartMap: {[key: string]: boolean} = {};
        processedItems.forEach((item: CartItem) => { 
          if (!item.is_bundle_item) {
            inCartMap[item.course_id] = true;
          }
        });
        setInCartStatus(inCartMap);
      }
    } catch (error) { console.error('Error fetching cart:', error); }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setIsSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const allTitles = allCourses.map(c => c.title);
      const bundleTitles = bundles.map(b => b.title);
      setSuggestions([...allTitles, ...bundleTitles].filter(title => title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5));
    } else setSuggestions([]);
  }, [searchQuery, allCourses, bundles]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(allCourses);
      setFilteredBundles(bundles);
    } else {
      setFilteredCourses(allCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase())));
      setFilteredBundles(bundles.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.description.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  }, [searchQuery, allCourses, bundles]);

  const handleSearch = (query: string) => setSearchQuery(query);
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setIsSearchFocused(false);
    if (!recentSearches.includes(suggestion)) setRecentSearches(prev => [suggestion, ...prev.slice(0, 4)]);
  };
  const clearSearch = () => { setSearchQuery(""); inputRef.current?.focus(); };
  const handleImageError = (courseId: string) => setImageErrors(prev => ({ ...prev, [courseId]: true }));
  const toggleFeature = (featureId: string) => setOpenFeature(openFeature === featureId ? null : featureId);

  const handleViewBundleDetails = (bundleId: string) => {
    router.push(`/courses/bundles/${bundleId}`);
  };

  const handleAddToCartClick = (course: Course) => {
    setSelectedCourse(course);
    setSelectedBundleForCart(null);
    if (userEmail) addToCart(course, userEmail);
    else setIsEmailPopupOpen(true);
  };

  const handleAddBundleToCart = async (bundle: ExtendedBundle) => {
    setSelectedBundleForCart(bundle);
    setSelectedCourse(null);
    if (userEmail) await addBundleToCart(bundle, userEmail);
    else setIsEmailPopupOpen(true);
  };

  const addToCart = async (course: Course, email: string) => {
    setCartLoading(prev => ({ ...prev, [course.id]: true }));
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
        setCartMessage({ type: 'success', text: `"${course.title}" added to bag!` });
        setTimeout(() => setCartMessage(null), 3000);
      } else if (result.error === 'Course already in cart') {
        setInCartStatus(prev => ({ ...prev, [course.id]: true }));
        setCartMessage({ type: 'error', text: 'Course is already in your cart' });
      } else throw new Error(result.error);
    } catch (error: any) { setCartMessage({ type: 'error', text: error.message || 'Failed to add to bag' }); } 
    finally { setCartLoading(prev => ({ ...prev, [course.id]: false })); }
  };

  const addBundleToCart = async (bundle: ExtendedBundle, email: string) => {
    setCartLoading(prev => ({ ...prev, [`bundle_${bundle.id}`]: true }));
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
        setBundleAddedMessage({ bundleId: bundle.id, discountedPrice: bundle.discounted_price });
        setCartMessage({ 
          type: 'success', 
          text: `🎉 Bundle "${bundle.title}" added! You pay only ${formatCurrency(bundle.discounted_price)} for ${bundle.total_courses} courses!` 
        });
        
        if (bundle.courses) {
          const inCartMap = { ...inCartStatus };
          bundle.courses.forEach(course => {
            inCartMap[course.id] = true;
          });
          setInCartStatus(inCartMap);
        }
        
        setTimeout(() => setBundleAddedMessage(null), 5000);
      } else {
        setCartMessage({ type: 'error', text: result.error || 'Failed to add bundle to bag' });
      }
      setTimeout(() => setCartMessage(null), 4000);
    } catch (error: any) { 
      setCartMessage({ type: 'error', text: error.message || 'Failed to add bundle to bag' }); 
    } finally { 
      setCartLoading(prev => ({ ...prev, [`bundle_${bundle.id}`]: false })); 
    }
  };

  const handleRemoveFromCart = async (cartId: string, courseId: string) => {
    if (!userEmail) return;
    setRemovingFromCart(cartId);
    try {
      const response = await fetch(`/api/student/cart/remove?id=${cartId}&email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        setInCartStatus(prev => ({ ...prev, [courseId]: false }));
        await fetchCartCount();
        setCartMessage({ type: 'success', text: 'Item removed from cart' });
        setTimeout(() => setCartMessage(null), 3000);
      } else throw new Error(result.error);
    } catch (error: any) { setCartMessage({ type: 'error', text: error.message || 'Failed to remove item' }); } 
    finally { setRemovingFromCart(null); }
  };

  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    if (selectedBundleForCart) await addBundleToCart(selectedBundleForCart, email);
    else if (selectedCourse) await addToCart(selectedCourse, email);
    setSelectedBundleForCart(null); setSelectedCourse(null);
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return 'Rs 0';
    }
    let finalAmount = Number(amount);
    if (finalAmount > 1000000) {
      finalAmount = finalAmount / 100;
    }
    return new Intl.NumberFormat('en-PK', { 
      style: 'currency', 
      currency: 'PKR', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(finalAmount).replace('PKR', 'Rs');
  };
  
  const formatDate = (dateString: string) => {
    try { const date = new Date(dateString); return isNaN(date.getTime()) ? 'Recently added' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } 
    catch { return 'Recently added'; }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    if (item.is_bundle_item) return sum;
    return sum + (isNaN(Number(item.course_price)) ? 0 : Number(item.course_price));
  }, 0);

  const getBundleItems = () => {
    return cartItems.filter(item => item.is_bundle_item === true);
  };

  const getIndividualCourses = () => {
    return cartItems.filter(item => !item.is_bundle_item);
  };

  const handleProceedToEnrollment = () => {
    const bundleItems = getBundleItems();
    const individualCourses = getIndividualCourses();
    
    let url = '/cartEnrollment';
    const params = new URLSearchParams();
    
    if (bundleItems.length > 0 && bundleItems[0].bundle_id) {
      params.append('bundleId', bundleItems[0].bundle_id);
    }
    
    if (individualCourses.length > 0) {
      const courseIds = individualCourses.map(item => item.course_id).join(',');
      params.append('courseIds', courseIds);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    setShowCartSidebar(false);
    router.push(url);
  };

  const getAllItems = () => {
    const items: any[] = [];
    
    filteredBundles.forEach(bundle => {
      const discountedPriceNum = bundle.discounted_price;
      const originalPriceNum = bundle.original_price;
      const savingsAmount = originalPriceNum - discountedPriceNum;
      
      items.push({
        type: 'bundle',
        id: bundle.id,
        title: bundle.title,
        description: bundle.description,
        image: bundle.image || null,
        category: 'Bundle',
        price: formatCurrency(discountedPriceNum),
        priceRaw: discountedPriceNum,
        originalPrice: formatCurrency(originalPriceNum),
        originalPriceRaw: originalPriceNum,
        discount: bundle.discount_percentage,
        savingsAmount: savingsAmount,
        totalCourses: bundle.total_courses,
        data: bundle,
        isBundle: true,
        badge: `SAVE ${bundle.discount_percentage}%`,
        badgeColor: 'from-yellow-500 to-orange-500'
      });
    });
    
    filteredCourses.forEach(course => {
      items.push({
        type: 'course',
        id: course.id,
        title: course.title,
        description: course.description,
        image: course.image,
        category: course.category,
        price: course.price,
        originalPrice: course.originalPrice,
        duration: course.duration,
        numericPrice: course.numericPrice,
        isInCart: inCartStatus[course.id],
        data: course,
        isBundle: false,
        badge: 'Instructor Led',
        badgeColor: 'from-[#1E3A8A] to-[#1E3A8A]'
      });
    });
    
    return items.sort((a, b) => {
      if (a.type === 'bundle' && b.type !== 'bundle') return -1;
      if (a.type !== 'bundle' && b.type === 'bundle') return 1;
      return 0;
    });
  };

  const allItems = getAllItems();
  const totalResults = allItems.length;

  // Show loading state only on first load
  if (loading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND_COLORS.deepRed, borderTopColor: 'transparent' }}></div>
          </div>
          <p className="mt-4 text-gray-600">Loading courses and bundles...</p>
        </div>
      </div>
    );
  }

  if (error && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <HiBookOpen className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Content</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={retryFetch} className="px-6 py-2 bg-[#B11217] text-white rounded-lg cursor-pointer">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Email Popup */}
      <AnimatePresence>
        {isEmailPopupOpen && (selectedCourse || selectedBundleForCart) && (
          <EmailPopup isOpen={isEmailPopupOpen} onClose={() => { setIsEmailPopupOpen(false); setSelectedCourse(null); setSelectedBundleForCart(null); }} onConfirm={handleEmailConfirm} courseTitle={selectedBundleForCart?.title || selectedCourse?.title || ''} savedEmail={userEmail} />
        )}
      </AnimatePresence>

      {/* Cart Message Toast */}
      <AnimatePresence>
        {cartMessage && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[1001] cursor-default" style={{ backgroundColor: cartMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', color: cartMessage.type === 'success' ? '#166534' : '#991b1b', border: cartMessage.type === 'success' ? '1px solid #86efac' : '1px solid #fecaca' }}>
            {cartMessage.type === 'success' ? <HiCheckCircle className="w-5 h-5 text-green-500" /> : <HiExclamation className="w-5 h-5 text-red-500" />}
            <span className="font-medium">{cartMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Button */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]">
        <motion.button onClick={() => setShowCartSidebar(true)} className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-4 rounded-l-full rounded-r-none shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <HiShoppingBag className="w-6 h-6" />
          {cartCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-white text-[#B11217] text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg border-2 border-[#B11217] cursor-default">{cartCount > 99 ? '99+' : cartCount}</motion.span>}
        </motion.button>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCartSidebar}
        onClose={() => setShowCartSidebar(false)}
        cartItems={cartItems}
        cartTotal={cartTotal}
        removingFromCart={removingFromCart}
        onRemoveFromCart={handleRemoveFromCart}
        formatCurrency={formatCurrency}
        bundleAddedMessage={bundleAddedMessage}
        onProceedToEnrollment={handleProceedToEnrollment}
      />

      {/* Hero Section */}
      <div className="relative min-h-[550px] md:min-h-[650px] flex items-start justify-center pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C3D]/95 via-[#0B1C3D]/90 to-[#0B1C3D]/95"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mt-6 md:mt-10">
          <motion.div variants={fadeInUpVariants} initial="initial" animate="animate" transition={getTransition(0.2)}>
            <motion.div variants={scaleInVariants} className="inline-flex items-center px-3 md:px-4 py-1 md:py-2 rounded-full mb-4 md:mb-6 bg-white/10 backdrop-blur-sm border border-white/20">
              <HiStar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-yellow-400" />
              <span className="text-xs md:text-sm font-medium text-white">Instructor-Led Training Programs</span>
            </motion.div>
            <motion.h1 variants={fadeInUpVariants} className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Explore Our
              <span className="block mt-2 md:mt-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                Expert-Led Courses
              </span>
            </motion.h1>
            <motion.p className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-8 md:mb-10 text-gray-300 px-2">
              Browse through our collection of professional courses and discounted bundles
            </motion.p>
            <motion.div ref={searchRef} variants={fadeInUpVariants} className="max-w-2xl mx-auto relative px-2 sm:px-0">
              <div className="relative">
                <HiSearch className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <input 
                  ref={inputRef} 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => handleSearch(e.target.value)} 
                  onFocus={() => setIsSearchFocused(true)} 
                  placeholder="Search courses or bundles..." 
                  className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-10 md:pr-12 rounded-full border-2 border-white/30 bg-white/95 text-gray-800 focus:outline-none focus:border-teal-400 text-sm md:text-base shadow-xl cursor-text" 
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 cursor-pointer">
                    <HiX className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {isSearchFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
                  <motion.div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
                    {suggestions.length > 0 && (
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400">Suggestions</div>
                        {suggestions.map((s) => (
                          <button key={s} onClick={() => handleSuggestionClick(s)} className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl flex items-center cursor-pointer">
                            <HiSearch className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{s}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {recentSearches.length > 0 && (
                      <div className="p-2 border-t border-gray-100 bg-gray-50">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400">Recent</div>
                        <div className="flex flex-wrap gap-2 px-2">
                          {recentSearches.map((s) => (
                            <button key={s} onClick={() => handleSuggestionClick(s)} className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-xl text-xs md:text-sm text-gray-600 hover:shadow-md border border-gray-200 cursor-pointer">
                              <HiRecent className="w-2 h-2 md:w-3 md:h-3 inline mr-1" />
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-3 md:mt-4 flex flex-wrap justify-center gap-1.5 md:gap-2">
                <span className="text-xs md:text-sm text-gray-300">Popular:</span>
                {["Welding", "Safety", "Pipe Fitter", "Electrical", "Bundle"].map((t) => (
                  <button key={t} onClick={() => handleSuggestionClick(t)} className="px-2 md:px-3 py-0.5 md:py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white cursor-pointer">
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <div className="px-3 md:px-4 py-1.5 md:py-2 bg-[#1E3A8A]/10 rounded-full inline-block">
            <p className="text-xs md:text-sm text-[#1E3A8A] font-medium">
              {totalResults} Items Available
            </p>
          </div>
        </div>

        {searchQuery && (
          <p className="text-sm md:text-base text-gray-600 mb-6 text-center md:text-left">
            Found <span className="font-semibold text-[#B11217]">{totalResults}</span> items matching "<span className="font-medium">{searchQuery}</span>"
          </p>
        )}

        {/* Unified Grid - Bundles and Courses together */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {allItems.map((item) => {
            if (item.type === 'bundle') {
              const bundle = item.data;
              return (
                <div key={`bundle-${item.id}`} className="relative group bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer" onClick={() => handleViewBundleDetails(item.id)}>
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
                  <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg md:text-xl font-bold text-[#0B1C3D] mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="mb-4 p-2 md:p-3 bg-red-50 rounded-lg">
                      <span className="text-[10px] md:text-xs text-gray-400 line-through">{item.originalPrice}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl md:text-2xl font-bold text-[#B11217]">{item.price}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-green-600 mt-1">
                        Save PKR {item.savingsAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewBundleDetails(item.id); }} 
                        className="flex-1 py-2 md:py-2.5 px-2 md:px-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs md:text-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HiEye className="w-3 h-3 md:w-4 md:h-4" /> View Details
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddBundleToCart(bundle); }} 
                        disabled={cartLoading[`bundle_${bundle.id}`]} 
                        className="flex-1 py-2 md:py-2.5 px-2 md:px-3 rounded-lg font-medium text-white text-xs md:text-sm flex items-center justify-center gap-1 cursor-pointer"
                        style={{ backgroundColor: '#B11217' }}
                      >
                        {cartLoading[`bundle_${bundle.id}`] ? 
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 
                          <><HiShoppingBag className="w-3 h-3 md:w-4 md:h-4" /> Add to Bag</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              const course = item.data;
              return (
                <div key={`course-${item.id}`} className="relative group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="relative h-40 md:h-56 overflow-hidden bg-gray-100">
                    {course.image && !imageErrors[course.id] ? 
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={() => handleImageError(course.id)} /> : 
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <HiBookOpen className="w-12 h-12 md:w-20 md:h-20 text-gray-300" />
                      </div>
                    }
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 px-1.5 md:px-3 py-0.5 md:py-1 rounded-full bg-white/90">
                      <span className="text-[9px] md:text-xs font-medium" style={{ color: course.color || BRAND_COLORS.teal }}>{course.category}</span>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 flex flex-col flex-grow">
                    <h3 className="text-base md:text-xl font-bold text-[#0B1C3D] mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">{course.description}</p>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2 mb-3 md:mb-4">
                      <div className="flex items-center text-[10px] md:text-xs text-gray-500 bg-gray-50 p-1.5 md:p-2 rounded-lg">
                        <HiClock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 text-[#1E3A8A]" />
                        {course.duration}
                      </div>
                      <div className="flex items-center text-[10px] md:text-xs text-gray-500 bg-gray-50 p-1.5 md:p-2 rounded-lg">
                        <HiBadgeCheck className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 text-[#1E3A8A]" />
                        Certificate
                      </div>
                    </div>
                    <div className="border-t pt-3 md:pt-4 mt-auto">
                      <div className="mb-2 md:mb-3">
                        <span className="text-lg md:text-2xl font-bold text-[#B11217]">{course.price}</span>
                        {course.originalPrice && <span className="text-[10px] md:text-sm text-gray-400 line-through ml-1 md:ml-2">{course.originalPrice}</span>}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/courses/${course.id}`} className="flex-1 py-1.5 md:py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs md:text-sm text-center cursor-pointer">
                          Details
                        </Link>
                        {item.isInCart ? 
                          <button 
                            onClick={() => { const cartItem = cartItems.find(i => i.course_id === course.id && !i.is_bundle_item); if (cartItem) handleRemoveFromCart(cartItem.id, course.id); }} 
                            className="flex-1 py-1.5 md:py-2.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 text-xs md:text-sm cursor-pointer"
                          >
                            Remove
                          </button> : 
                          <button 
                            onClick={() => handleAddToCartClick(course)} 
                            disabled={cartLoading[course.id]} 
                            className="flex-1 py-1.5 md:py-2.5 rounded-lg font-medium text-white text-xs md:text-sm cursor-pointer"
                            style={{ backgroundColor: '#B11217' }}
                          >
                            {cartLoading[course.id] ? 
                              <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 
                              'Add to Bag'
                            }
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {allItems.length === 0 && (
          <div className="text-center py-12">
            <HiBookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-sm md:text-base text-gray-500 mb-4">Try adjusting your search terms</p>
            <button onClick={clearSearch} className="px-4 md:px-6 py-1.5 md:py-2 bg-[#1E3A8A] text-white rounded-lg text-sm md:text-base cursor-pointer">
              Clear Search
            </button>
          </div>
        )}

        {/* Why Choose Us Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={showFeatures ? { opacity: 1, y: 0 } : {}} 
          transition={{ duration: 0.6, delay: 0.3 }} 
          className="mt-12 md:mt-20 relative rounded-2xl md:rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0">
            <img src="https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1C3D]/95 to-[#0B1C3D]/95"></div>
          </div>
          <div className="relative z-10 py-12 md:py-16 px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white mb-8 md:mb-12">Why Choose Our Programs?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.id} className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all">
                    <button onClick={() => toggleFeature(feature.id)} className="w-full p-4 md:p-6 text-left cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="p-1.5 md:p-2 bg-white/10 rounded-lg md:rounded-xl">
                            <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: feature.iconColor }} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-base md:text-lg font-semibold text-white">{feature.title}</h3>
                            <p className="text-xs md:text-sm text-gray-200">{feature.shortDescription}</p>
                          </div>
                        </div>
                        <motion.div animate={{ rotate: openFeature === feature.id ? 180 : 0 }}>
                          <MdKeyboardArrowDown className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                        </motion.div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFeature === feature.id && (
                        <motion.div variants={slideDownVariants} initial="initial" animate="animate" exit="exit" className="overflow-hidden">
                          <div className="p-4 md:p-6 bg-white/20 backdrop-blur-md border-t border-white/20">
                            <p className="text-xs md:text-sm text-white mb-3 md:mb-4">{feature.longDescription}</p>
                            <div className="space-y-1.5 md:space-y-2">
                              {feature.bullets.map((bullet, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-200">
                                  <HiCheckCircle className="w-3 h-3 md:w-4 md:h-4" style={{ color: feature.iconColor }} />
                                  <span>{bullet}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
      <CoursesTab />
    </div>
  );
}