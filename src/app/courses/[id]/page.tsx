"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiCheckCircle,
  HiArrowLeft,
  HiOutlineCash,
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
  HiChevronDown  // Add this for dropdown
} from "react-icons/hi";
import { FaCartPlus } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import { MdLanguage } from "react-icons/md";
import { Loader2 } from "lucide-react";
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

// Z-index constants - MUST match navbar
const Z_INDEX = {
  BASE: 1,
  NAVBAR: 100,           // Navbar z-index
  DROPDOWN: 110,
  BACKDROP: 150,
  MOBILE_MENU: 200,
  CART_BUTTON: 999,      // Cart button above navbar
  CART_SIDEBAR: 1000,    // Cart sidebar highest
  CART_BACKDROP: 999,    // Cart backdrop
  TOAST: 1001,           // Toast messages
  MODAL: 2000            // Email popup
};

// Email Popup Component - FIXED z-index
interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => void;
  courseTitle: string;
}

const EmailPopup = ({ isOpen, onClose, onConfirm, courseTitle }: EmailPopupProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setEmail('');
      setError('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
            Enter Your Email
          </h3>
          <p className="text-sm text-blue-100">
            To add <span className="font-semibold">"{courseTitle}"</span> to cart
          </p>
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
                autoFocus
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
              Confirm
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            We'll use this email to manage your cart. No spam, ever.
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Published Courses Data (fallback)
const publishedCoursesData = {
  'pipe-fitter': {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    category: 'Technical Training',
    description: 'Master industrial pipe fitting techniques with comprehensive hands-on training on cutting, threading, and installation following international standards.',
    longDescription: 'This comprehensive 8-week program covers everything from basic pipe fitting concepts to advanced industrial applications. You will learn to read blueprints, design pipe systems, and implement safety protocols according to international standards.',
    duration: '8 Weeks',
    students: 'Max 20 per batch',
    level: 'Beginner to Advanced',
    schedule: 'Monday to Friday, 9 AM - 1 PM',
    location: 'Main Campus, Karachi',
    language: 'English & Urdu',
    startDate: '15th March 2024',
    highlights: [
      'Learn pipe cutting, threading, and installation',
      'Blueprint reading and interpretation',
      'Pipe system design and layout',
      'Safety protocols and standards',
      'Hands-on workshop training',
      'Industry certification preparation'
    ],
    curriculum: [
      'Week 1-2: Introduction to Pipe Fitting & Safety',
      'Week 3-4: Pipe Materials & Tools',
      'Week 5-6: Pipe Cutting & Threading Techniques',
      'Week 7: System Design & Layout',
      'Week 8: Practical Projects & Certification'
    ],
    requirements: [
      'Basic education (Matriculation)',
      'Physical fitness for workshop activities',
      'Safety gear will be provided'
    ],
    price: 25000,
    priceFormatted: 'Rs 25,000',
    originalPrice: 30000,
    originalPriceFormatted: 'Rs 30,000',
    savings: 'Save Rs 5,000',
    icon: HiOutlineWrench,
    color: BRAND_COLORS.teal,
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    featured: true,
    rating: 4.8,
    reviews: 124,
    studentsTrained: 500,
    trainingType: 'Hands-on training',
    deliveryMode: 'On-Campus'
  },
  'safety-inspector': {
    id: 'safety-inspector',
    title: 'OSHA Safety Inspector',
    category: 'Safety Training',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    longDescription: 'Become a certified Safety Inspector with our 6-week intensive program. Learn to conduct site inspections, assess risks, and implement safety protocols according to OSHA and international standards.',
    duration: '6 Weeks',
    students: 'Max 15 per batch',
    level: 'Intermediate',
    schedule: 'Tuesday to Saturday, 2 PM - 6 PM',
    location: 'Safety Training Center, Lahore',
    language: 'English & Urdu',
    startDate: '20th March 2024',
    highlights: [
      'OSHA standards and regulations',
      'Site inspection methodologies',
      'Risk assessment techniques',
      'Safety documentation',
      'Emergency response planning',
      'Certification exam preparation'
    ],
    curriculum: [
      'Week 1: Introduction to Safety Standards',
      'Week 2: Site Inspection Protocols',
      'Week 3: Risk Assessment Methods',
      'Week 4: Safety Documentation',
      'Week 5: Emergency Procedures',
      'Week 6: Certification Exam Prep'
    ],
    requirements: [
      'Minimum Intermediate education',
      'Background in construction or industry',
      'Basic computer skills'
    ],
    price: 34000,
    priceFormatted: 'Rs 34,000',
    originalPrice: 40000,
    originalPriceFormatted: 'Rs 40,000',
    savings: 'Save Rs 6,000',
    icon: HiOutlineShieldCheck,
    color: BRAND_COLORS.darkRoyalBlue,
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    featured: true,
    rating: 4.9,
    reviews: 89,
    studentsTrained: 320,
    trainingType: 'Theory & Practical',
    deliveryMode: 'On-Campus'
  },
  'welding': {
    id: 'welding',
    title: 'Professional Welding',
    category: 'Technical Training',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    longDescription: 'Master professional welding techniques with our 10-week comprehensive program. From basic metal joining to advanced industrial welding, gain hands-on experience with modern equipment under expert guidance.',
    duration: '10 Weeks',
    students: 'Max 12 per batch',
    level: 'Beginner to Professional',
    schedule: 'Monday to Thursday, 10 AM - 4 PM',
    location: 'Welding Workshop, Islamabad',
    language: 'English & Urdu',
    startDate: '25th March 2024',
    highlights: [
      'MIG, TIG, and Arc welding techniques',
      'Metal identification and preparation',
      'Weld quality inspection',
      'Safety equipment usage',
      'Industry-standard certification',
      'Portfolio development'
    ],
    curriculum: [
      'Week 1-2: Welding Fundamentals & Safety',
      'Week 3-4: Arc Welding Techniques',
      'Week 5-6: MIG Welding Mastery',
      'Week 7-8: TIG Welding Skills',
      'Week 9: Advanced Welding Projects',
      'Week 10: Certification & Portfolio'
    ],
    requirements: [
      'Basic education (Matriculation)',
      'Protective gear will be provided',
      'Good hand-eye coordination'
    ],
    price: 35000,
    priceFormatted: 'Rs 35,000',
    originalPrice: 40000,
    originalPriceFormatted: 'Rs 40,000',
    savings: 'Save Rs 5,000 (13%)',
    icon: HiOutlineCash,
    color: BRAND_COLORS.deepRed,
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    featured: true,
    rating: 4.7,
    reviews: 156,
    studentsTrained: 450,
    trainingType: 'Hands-on workshop',
    deliveryMode: 'On-Campus'
  }
};

// Default content for instructor-created courses
const getDefaultContent = (course: any) => {
  const category = course.category || 'General';
  const level = course.level || 'All Levels';
  
  // Generate dynamic content based on course properties
  return {
    schedule: course.schedule || 'Flexible Schedule (Self-paced)',
    location: course.location || 'Online',
    language: course.language || 'English',
    trainingType: course.trainingType || getTrainingTypeByCategory(category),
    deliveryMode: course.deliveryMode || getDeliveryModeByCategory(category),
    highlights: course.highlights || getDefaultHighlights(category, level),
    curriculum: course.curriculum || getDefaultCurriculum(course.title, course.duration),
    requirements: course.requirements || getDefaultRequirements(level)
  };
};

// Helper functions to generate dynamic content based on course category
const getTrainingTypeByCategory = (category: string): string => {
  const types: { [key: string]: string } = {
    'Technical Training': 'Hands-on workshop training',
    'Safety Training': 'Theory & practical demonstrations',
    'Web Development': 'Project-based learning',
    'Mobile Development': 'Hands-on coding sessions',
    'Data Science': 'Practical data analysis',
    'Design': 'Creative workshop sessions',
    'Marketing': 'Case study based learning',
    'Business': 'Interactive business simulations',
    'Management': 'Real-world management scenarios',
    'Soft Skills': 'Interactive role-playing sessions'
  };
  return types[category] || 'Interactive learning sessions';
};

const getDeliveryModeByCategory = (category: string): string => {
  const modes: { [key: string]: string } = {
    'Technical Training': 'On-Campus',
    'Safety Training': 'On-Campus',
    'Web Development': 'Online',
    'Mobile Development': 'Online',
    'Data Science': 'Hybrid',
    'Design': 'Online',
    'Marketing': 'Online',
    'Business': 'Hybrid',
    'Management': 'Hybrid',
    'Soft Skills': 'Online'
  };
  return modes[category] || 'Online';
};

const getDefaultHighlights = (category: string, level: string): string[] => {
  const baseHighlights = [
    'Comprehensive curriculum',
    'Expert instructors',
    'Hands-on projects',
    'Industry certification'
  ];

  const categoryHighlights: { [key: string]: string[] } = {
    'Technical Training': [
      'Practical workshop sessions',
      'Industry-standard equipment',
      'Real-world projects',
      'Job-ready skills'
    ],
    'Safety Training': [
      'OSHA standards compliance',
      'Site inspection training',
      'Emergency protocols',
      'Safety certification'
    ],
    'Web Development': [
      'Build real websites',
      'Modern frameworks',
      'Portfolio projects',
      'Industry best practices'
    ],
    'Mobile Development': [
      'iOS & Android apps',
      'App store deployment',
      'UI/UX principles',
      'Cross-platform development'
    ]
  };

  return categoryHighlights[category] || baseHighlights;
};

const getDefaultCurriculum = (title: string, duration: string): string[] => {
  const weeks = parseInt(duration) || 8;
  const curriculum: string[] = [];
  
  for (let i = 1; i <= weeks; i++) {
    if (i === 1) {
      curriculum.push(`Week ${i}: Introduction to ${title}`);
    } else if (i === weeks) {
      curriculum.push(`Week ${i}: Final Project & Certification`);
    } else {
      curriculum.push(`Week ${i}: Core Concepts & Practice`);
    }
  }
  
  return curriculum;
};

const getDefaultRequirements = (level: string): string[] => {
  const base = ['Basic computer skills', 'Internet access'];
  
  if (level === 'Beginner') {
    return ['No prior experience required', ...base];
  } else if (level === 'Intermediate') {
    return ['Basic knowledge of the field', 'Some practical experience', ...base];
  } else if (level === 'Advanced') {
    return ['Strong foundation in the field', 'Professional experience preferred', ...base];
  }
  
  return ['No prior experience required', ...base];
};

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  duration: string;
  students: string;
  level: string;
  schedule: string;
  location: string;
  language: string;
  trainingType: string;
  deliveryMode: string;
  startDate?: string;
  highlights: string[];
  curriculum: string[];
  requirements: string[];
  price: number;
  priceFormatted: string;
  originalPrice?: number;
  originalPriceFormatted?: string;
  savings?: string;
  icon?: any;
  color?: string;
  image?: string;
  courseImage?: string;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  studentsTrained?: number;
  category?: string;
}

interface CartItem {
  id: string;
  course_id: string;
  course_title: string;
  course_price: number;
  created_at: string;
}

// Animation variants
const slideInRightVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 }
};

const fadeInUpVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
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
  
  // NEW: Curriculum dropdown state
  const [openCurriculumIndex, setOpenCurriculumIndex] = useState<number | null>(null);

  const courseId = params.id as string;

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Check if course is already in cart when email and course are loaded
  useEffect(() => {
    if (userEmail && course) {
      checkCartStatus();
      loadCartItems();
    }
  }, [userEmail, course]);

  const checkCartStatus = async () => {
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(userEmail)}`);
      const result = await response.json();
      if (result.success) {
        const inCart = result.data.items.some((item: any) => item.course_id === courseId);
        setInCart(inCart);
      }
    } catch (error) {
      console.error('Error checking cart:', error);
    }
  };

  // Load all cart items
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

  // Remove item from cart
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
        
        // If this was the current course, update inCart status
        if (courseId === course?.id) {
          setInCart(false);
        }

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

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      
      // First try to fetch from API (instructor-created courses)
      const response = await fetch(`/api/instructors/course/${courseId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        const courseData = result.data.course;
        
        // Get dynamic content based on course properties
        const dynamicContent = getDefaultContent(courseData);
        
        // Map API course to expected structure
        const mappedCourse: Course = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          longDescription: courseData.longDescription || courseData.description,
          duration: courseData.duration || 'Flexible',
          students: courseData.studentCapacity ? `Max ${courseData.studentCapacity} per batch` : 'Limited seats',
          level: courseData.level || 'All Levels',
          schedule: dynamicContent.schedule,
          location: dynamicContent.location,
          language: dynamicContent.language,
          trainingType: dynamicContent.trainingType,
          deliveryMode: dynamicContent.deliveryMode,
          startDate: 'Enroll now',
          highlights: dynamicContent.highlights,
          curriculum: dynamicContent.curriculum,
          requirements: dynamicContent.requirements,
          price: courseData.price || 0,
          priceFormatted: courseData.price ? `Rs ${courseData.price.toLocaleString()}` : 'Contact for pricing',
          originalPrice: courseData.original_price,
          originalPriceFormatted: courseData.original_price ? `Rs ${courseData.original_price.toLocaleString()}` : undefined,
          savings: courseData.original_price && courseData.price 
            ? `Save Rs ${(courseData.original_price - courseData.price).toLocaleString()} (${Math.round((1 - courseData.price/courseData.original_price) * 100)}%)` 
            : undefined,
          courseImage: courseData.image,
          featured: false,
          rating: 4.5,
          reviews: 0,
          studentsTrained: 0,
          category: courseData.category
        };
        setCourse(mappedCourse);
      } else {
        // Fallback to published courses
        const publishedCourse = publishedCoursesData[courseId as keyof typeof publishedCoursesData];
        if (publishedCourse) {
          setCourse(publishedCourse as Course);
        } else {
          setCourse(null);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartClick = () => {
    if (!course) return;
    
    if (userEmail) {
      // Email already exists, directly add to cart
      addToCart(userEmail);
    } else {
      // Open email popup
      setIsEmailPopupOpen(true);
    }
  };

  const handleEmailConfirm = async (email: string) => {
    setIsEmailPopupOpen(false);
    
    // Save email for future use
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    
    // Add to cart
    await addToCart(email);
  };

  const addToCart = async (email: string) => {
    if (!course) return;

    setAddingToCart(true);
    setCartMessage(null);

    try {
      const response = await fetch('/api/student/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: email,
          courseId: course.id,
          courseTitle: course.title,
          coursePrice: course.price || 0
        })
      });

      const result = await response.json();

      if (result.success) {
        setInCart(true);
        // Reload cart items
        await loadCartItems();
        setCartMessage({
          type: 'success',
          text: 'Course added to cart successfully!'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setCartMessage(null), 3000);
      } else {
        if (result.error === 'Course already in cart') {
          setInCart(true);
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
      setAddingToCart(false);
    }
  };

  const handleEnrollNow = () => {
    router.push(`/courses/${courseId}/enrollment`);
  };

  // FIXED: Normalize price to prevent doubling
  const normalizePrice = (price: any): number => {
    if (!price) return 0;
    
    // Convert to number
    let numPrice = Number(price);
    if (isNaN(numPrice)) return 0;
    
    // If price is too large (> 100000), divide by 100
    // This fixes the 3,400,000 -> 34,000 issue
    if (numPrice > 100000) {
      numPrice = numPrice / 100;
    }
    
    return numPrice;
  };

  // FIXED: Format currency properly
  const formatCurrency = (amount: any) => {
    const normalizedAmount = normalizePrice(amount);
    return `Rs ${normalizedAmount.toLocaleString()}`;
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

  // Calculate cart total - FIXED: Normalize each price
  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + normalizePrice(item.course_price);
  }, 0);

  // FIXED: Handle cart bucket click - make sure it opens the sidebar
  const handleCartBucketClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Cart bucket clicked'); // Debug log
    setShowCartSidebar(true);
  };

  // Toggle curriculum dropdown
  const toggleCurriculum = (index: number) => {
    setOpenCurriculumIndex(openCurriculumIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deepRed mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-800">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Determine image source
  const courseImageUrl = course.courseImage || course.image || '/placeholder-course.jpg';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
      {/* Email Popup */}
      <AnimatePresence mode="wait">
        {isEmailPopupOpen && course && (
          <EmailPopup
            isOpen={isEmailPopupOpen}
            onClose={() => setIsEmailPopupOpen(false)}
            onConfirm={handleEmailConfirm}
            courseTitle={course.title}
          />
        )}
      </AnimatePresence>

      {/* Cart Message Alert - FIXED z-index */}
      <AnimatePresence>
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
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

      {/* Cart Bucket - Right Side - FIXED: z-index 999 (above navbar's 100) */}
     <div
  className="fixed right-0 top-1/2 -translate-y-1/2 z-[99999]"
  style={{ zIndex: Z_INDEX.CART_BUTTON }}
>
  <motion.button
    onClick={handleCartBucketClick}
    className="relative bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white p-3 sm:p-4 rounded-l-full rounded-r-none shadow-2xl hover:shadow-3xl transition-all duration-300 group cursor-pointer flex items-center justify-center"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    aria-label="Open shopping cart"
  >
    <FaCartPlus className="w-6 h-6" />

    {/* Cart Count Badge */}
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

      {/* Cart Sidebar - FIXED: z-index 1000 (highest) */}
      <AnimatePresence>
        {showCartSidebar && (
          <>
            {/* Backdrop - FIXED z-index */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartSidebar(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              style={{ zIndex: Z_INDEX.CART_BACKDROP }}
            />
            
            {/* Cart Sidebar - FIXED z-index */}
            <motion.div
              variants={slideInRightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
              style={{ zIndex: Z_INDEX.CART_SIDEBAR }}
            >
              {/* Sidebar Header - FIXED z-index */}
              <div 
                className="sticky top-0 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6"
                style={{ zIndex: Z_INDEX.CART_SIDEBAR + 1 }}
              >
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
                        {cartItems.length} {cartItems.length === 1 ? 'Course' : 'Courses'}
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

              {/* Cart Items */}
              <div className="p-6">
                {cartLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_COLORS.deepRed }} />
                  </div>
                ) : cartItems.length === 0 ? (
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
                      onClick={() => setShowCartSidebar(false)}
                      className="px-6 py-2 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => {
                        const isCurrentCourse = item.course_id === courseId;
                        const normalizedPrice = normalizePrice(item.course_price);
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`bg-gray-50 rounded-xl p-4 border ${
                              isCurrentCourse ? 'border-[#B11217] border-2' : 'border-gray-200'
                            } hover:shadow-md transition-all`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {item.course_title}
                                  </h3>
                                  {isCurrentCourse && (
                                    <span className="px-2 py-0.5 bg-[#B11217] text-white text-xs rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                  Added {formatDate(item.created_at)}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#B11217] text-sm">
                                    {formatCurrency(normalizedPrice)}
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

                    {/* Cart Summary - FIXED: Show normalized total */}
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
                          <span className="font-semibold text-gray-900">{cartItems.length}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setShowCartSidebar(false);
                            router.push('/checkout');
                          }}
                          className="w-full py-3 bg-gradient-to-r from-[#B11217] to-[#8f0e12] text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
                        >
                          Proceed to Checkout
                        </button>
                        <button
                          onClick={() => setShowCartSidebar(false)}
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

        {/* Course Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden md:flex">
            {/* Course Image */}
            <div className="md:w-2/5 relative">
              <img
                src={courseImageUrl}
                alt={course.title}
                className="w-full h-64 md:h-full object-cover"
              />
              {course.featured && (
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold shadow-lg flex items-center">
                    <HiStar className="w-3 h-3 mr-1" />
                    Featured
                  </div>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="md:w-3/5 p-6 flex flex-col justify-between">
              <div>
                <header className="mb-4">
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: BRAND_COLORS.darkNavy }}
                  >
                    {course.title}
                  </h1>
                  <p className="text-base text-gray-700">{course.description}</p>
                </header>

                <ul className="mb-4 text-gray-700 text-sm space-y-1">
                  {[
                    { label: 'Duration', value: course.duration },
                    { label: 'Class Size', value: course.students },
                    { label: 'Level', value: course.level },
                    { label: 'Starts', value: course.startDate },
                  ].map((stat) => (
                    <li
                      key={stat.label}
                      className="flex items-center gap-2 before:content-['•'] before:text-gray-400 before:mr-2"
                    >
                      <span className="font-medium">{stat.value}</span>
                      <span className="text-gray-500">{stat.label}</span>
                    </li>
                  ))}
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
                        {course.priceFormatted}
                      </span>
                      {course.originalPriceFormatted && (
                        <span className="text-sm text-gray-500 line-through">
                          {course.originalPriceFormatted}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
                      {course.savings && (
                        <span
                          className="px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${BRAND_COLORS.deepRed}15`,
                            color: BRAND_COLORS.deepRed,
                          }}
                        >
                          {course.savings}
                        </span>
                      )}
                      <span>{course.studentsTrained?.toLocaleString() || 0} students trained</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    {/* Add to Cart Button */}
                    {inCart ? (
                      <button
                        onClick={() => setShowCartSidebar(true)}
                        className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: '#10B981',
                          color: BRAND_COLORS.white,
                        }}
                      >
                        <HiCheck className="w-5 h-5" />
                        View in Cart
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCartClick}
                        disabled={addingToCart}
                        className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{
                          backgroundColor: BRAND_COLORS.darkRoyalBlue,
                          color: BRAND_COLORS.white,
                        }}
                      >
                        {addingToCart ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <HiShoppingCart className="w-5 h-5" />
                        )}
                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                      </button>
                    )}

                    {/* Enroll Now Button */}
                    <button
                      onClick={handleEnrollNow}
                      className="flex-1 md:flex-none px-6 py-3 rounded-lg font-bold text-base shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
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
          {/* Left Column - Curriculum with Dropdown */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-8 border border-gray-100"
            >
              <h2
                className="text-2xl font-bold mb-6 flex items-center"
                style={{ color: BRAND_COLORS.darkNavy }}
              >
                <HiCheckCircle className="w-6 h-6 mr-3" style={{ color: BRAND_COLORS.darkNavy }} />
                Course Curriculum
              </h2>

              <div className="space-y-3">
                {course.curriculum.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Curriculum Header - Clickable */}
                    <button
                      onClick={() => toggleCurriculum(index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IoMdArrowDropright 
                          className={`text-blue-900 w-5 h-5 transition-transform duration-300 ${
                            openCurriculumIndex === index ? 'rotate-90' : ''
                          }`} 
                        />
                        <span className="font-medium text-gray-800">{item}</span>
                      </div>
                      <HiChevronDown 
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                          openCurriculumIndex === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Curriculum Details - Dropdown Content */}
                    <AnimatePresence>
                      {openCurriculumIndex === index && (
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
                                <span className="font-semibold">What you'll learn in this module:</span>
                              </p>
                              <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Core concepts and fundamentals</li>
                                <li>Hands-on practical exercises</li>
                                <li>Industry best practices</li>
                                <li>Assessment and quizzes</li>
                              </ul>
                              <p className="mt-3 text-xs text-gray-400">
                                * Detailed syllabus available upon enrollment
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* What You'll Learn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-8 border border-gray-100 mt-6"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center"
                style={{ color: BRAND_COLORS.darkNavy }}>
                <HiCheckCircle className="w-6 h-6 mr-3" style={{ color: course.color || BRAND_COLORS.teal }} />
                What You&apos;ll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.teal }} />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Course Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl shadow-md p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Course Details
              </h3>
              <ul className="space-y-4 text-gray-700 text-base">
                <li className="flex items-start gap-3">
                  <HiClock className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{course.schedule}</div>
                    <div className="text-gray-500 text-sm">Schedule</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HiLocationMarker className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{course.location}</div>
                    <div className="text-gray-500 text-sm">Location</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MdLanguage className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{course.language}</div>
                    <div className="text-gray-500 text-sm">Language</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HiAcademicCap className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{course.trainingType}</div>
                    <div className="text-gray-500 text-sm">Training Type</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <HiUserGroup className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{course.deliveryMode}</div>
                    <div className="text-gray-500 text-sm">Delivery Mode</div>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Requirements Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl shadow-md p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
                Requirements
              </h3>
              <ul className="space-y-3 text-gray-700 text-base">
                {course.requirements.map((req, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 before:content-['•'] before:text-blue-900 before:text-xl before:mt-1 before:font-bold"
                  >
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}