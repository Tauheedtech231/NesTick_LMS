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
  HiX
} from "react-icons/hi";
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
    priceFormatted: 'PKR 25,000',
    originalPrice: 30000,
    originalPriceFormatted: 'PKR 30,000',
    savings: 'Save PKR 5,000',
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
    title: 'Safety Inspector',
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
    price: 30000,
    priceFormatted: 'PKR 30,000',
    originalPrice: 35000,
    originalPriceFormatted: 'PKR 35,000',
    savings: 'Save PKR 5,000',
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
    priceFormatted: 'PKR 35,000',
    originalPrice: 40000,
    originalPriceFormatted: 'PKR 40,000',
    savings: 'Save PKR 5,000',
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

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // New state for cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState<string | null>(null);

  const courseId = params.id as string;

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
  }, []);

  // Check if course is already in cart when user and course are loaded
  useEffect(() => {
    if (user?.email && course) {
      checkCartStatus();
      loadCartItems(); // Load all cart items
    }
  }, [user, course]);

  const checkCartStatus = async () => {
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(user.email)}`);
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
    if (!user?.email) return;
    
    setCartLoading(true);
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(user.email)}`);
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
  const handleRemoveFromCart = async (cartId: string) => {
    if (!user) return;

    setRemovingFromCart(cartId);
    try {
      const response = await fetch(
        `/api/student/cart/remove?id=${cartId}&email=${encodeURIComponent(user.email)}`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        // Update cart items
        setCartItems(prev => prev.filter(item => item.id !== cartId));
        
        // If this was the current course, update inCart status
        const removedItem = cartItems.find(item => item.id === cartId);
        if (removedItem?.course_id === courseId) {
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
          priceFormatted: courseData.price ? `PKR ${courseData.price.toLocaleString()}` : 'Contact for pricing',
          originalPrice: courseData.original_price,
          originalPriceFormatted: courseData.original_price ? `PKR ${courseData.original_price.toLocaleString()}` : undefined,
          savings: courseData.original_price && courseData.price 
            ? `Save ${Math.round((1 - courseData.price/courseData.original_price) * 100)}%` 
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
      
      // Try localStorage as last resort
      try {
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const localCourse = allCourses.find((c: any) => c.id === courseId);

        if (localCourse) {
          const dynamicContent = getDefaultContent(localCourse);
          
          const mappedCourse: Course = {
            id: localCourse.id,
            title: localCourse.title,
            description: localCourse.description,
            longDescription: localCourse.longDescription || localCourse.description,
            duration: localCourse.duration || 'Flexible',
            students: localCourse.studentCapacity ? `Max ${localCourse.studentCapacity} per batch` : 'Limited seats',
            level: localCourse.level || 'All Levels',
            schedule: dynamicContent.schedule,
            location: dynamicContent.location,
            language: dynamicContent.language,
            trainingType: dynamicContent.trainingType,
            deliveryMode: dynamicContent.deliveryMode,
            startDate: 'Enroll now',
            highlights: dynamicContent.highlights,
            curriculum: dynamicContent.curriculum,
            requirements: dynamicContent.requirements,
            price: localCourse.price || 0,
            priceFormatted: localCourse.priceFormatted || 'Contact for pricing',
            originalPrice: localCourse.originalPrice,
            originalPriceFormatted: localCourse.originalPriceFormatted,
            savings: localCourse.savings,
            courseImage: localCourse.courseImage || localCourse.image,
            featured: localCourse.featured || false,
            rating: localCourse.rating || 4.5,
            reviews: localCourse.reviews || 0,
            studentsTrained: localCourse.studentsTrained || 0,
            category: localCourse.category
          };
          setCourse(mappedCourse);
        } else {
          setCourse(null);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setCourse(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/lms/auth/login?type=student');
      return;
    }

    if (!course) return;

    setAddingToCart(true);
    setCartMessage(null);

    try {
      const response = await fetch('/api/student/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: user.email,
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

  const formatCurrency = (amount: number) => {
    // Fix NaN issue by ensuring amount is a number
    const validAmount = Number(amount) || 0;
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(validAmount).replace('PKR', 'Rs');
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

  // Calculate cart total - FIXED NaN ISSUE
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = Number(item.course_price) || 0;
    return sum + price;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cart Message Alert */}
        <AnimatePresence>
          {cartMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                cartMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {cartMessage.type === 'success' ? (
                <HiCheck className="w-5 h-5" />
              ) : (
                <HiCheckCircle className="w-5 h-5" />
              )}
              <p>{cartMessage.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button and Cart Icon */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>

          {/* Cart Icon with Count */}
          {user && (
            <button
              onClick={() => setShowCartSidebar(true)}
              className="relative p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all group"
            >
              <HiShoppingCart className="w-6 h-6" style={{ color: BRAND_COLORS.deepRed }} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B11217] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Cart Sidebar - Slide from top with single close button */}
        <AnimatePresence>
          {showCartSidebar && user && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCartSidebar(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
              
              {/* Sidebar - Slides from top */}
              <motion.div
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 right-0 bg-white shadow-2xl z-50 overflow-y-auto"
                style={{ maxHeight: '80vh', margin: '0 auto', width: '90%', maxWidth: '600px', borderRadius: '0 0 20px 20px' }}
              >
                {/* Sidebar Header with Theme Colors and Single Close Button */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0B1C3D] to-[#1E3A8A] p-6 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <HiShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Your Cart
                        </h2>
                        <p className="text-sm text-white/80">
                          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCartSidebar(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    >
                      <HiX className="w-5 h-5 text-white/80 group-hover:text-white" />
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
                        <HiShoppingCart className="w-12 h-12" style={{ color: BRAND_COLORS.darkNavy }} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: BRAND_COLORS.darkNavy }}>
                        Your cart is empty
                      </h3>
                      <p className="text-gray-500 mb-6">Start adding courses to get started</p>
                      <button
                        onClick={() => setShowCartSidebar(false)}
                        className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:scale-105"
                        style={{ backgroundColor: BRAND_COLORS.deepRed }}
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {item.course_title}
                              </h3>
                              <p className="text-lg font-bold" style={{ color: BRAND_COLORS.deepRed }}>
                                {formatCurrency(item.course_price)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Added {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
                              disabled={removingFromCart === item.id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from cart"
                            >
                              {removingFromCart === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <HiTrash className="w-4 h-4" />
                              )}
                            </button>
                          </motion.div>
                        ))}
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
                            className="w-full py-3 rounded-lg text-white font-medium transition-all hover:scale-105 hover:shadow-lg"
                            style={{ backgroundColor: BRAND_COLORS.deepRed }}
                          >
                            Proceed to Checkout
                          </button>
                          <button
                            onClick={() => setShowCartSidebar(false)}
                            className="w-full py-3 rounded-lg font-medium transition-all border-2"
                            style={{ 
                              borderColor: BRAND_COLORS.darkRoyalBlue,
                              color: BRAND_COLORS.darkRoyalBlue,
                              backgroundColor: 'white'
                            }}
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
                        onClick={handleAddToCart}
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
          {/* Left Column - Curriculum */}
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

              <div className="space-y-4">
                {course.curriculum.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <IoMdArrowDropright className="text-blue-900 w-6 h-6 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-base">{item}</span>
                  </div>
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