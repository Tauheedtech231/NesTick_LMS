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
  HiShoppingCart
} from "react-icons/hi";
import { MdKeyboardArrowDown } from 'react-icons/md';
import Link from "next/link";
import CoursesTab from "@/components/stats";

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
}

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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [showFeatures, setShowFeatures] = useState(false);
  const [openFeature, setOpenFeature] = useState<string | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Welding", "Safety", "Pipe Fitter"]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cart states
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [cartLoading, setCartLoading] = useState(false);

  // Feature items
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

  // Load user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    }
  }, []);

  // Fetch cart count when user is available
  useEffect(() => {
    if (user?.email) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    setCartLoading(true);
    try {
      const response = await fetch(`/api/student/cart?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();
      if (result.success) {
        setCartCount(result.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    } finally {
      setCartLoading(false);
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
        // Map icons to components and format for display
        const coursesWithIcons = result.data.map((course: any) => ({
          id: course.id,
          title: course.title,
          category: course.category || 'Technical Training',
          description: course.description || '',
          duration: course.duration || 'Flexible',
          students: `${course.student_capacity || 0}+ seats`,
          level: course.level || 'Beginner',
          highlights: [],
          price: course.price ? `PKR ${course.price.toLocaleString()}` : 'Contact for price',
          originalPrice: course.original_price ? `PKR ${course.original_price.toLocaleString()}` : null,
          savings: course.original_price && course.price ? `Save ${Math.round((1 - course.price/course.original_price) * 100)}%` : null,
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
        }));
        
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
      {/* Header with Cart Icon */}
      <div className="fixed top-0 right-0 z-50 p-4 md:p-6">
        <Link
          href="/lms/Student_Portal/cart"
          className="relative inline-flex items-center justify-center p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          style={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(177,18,23,0.1)'
          }}
        >
          <HiShoppingCart className="w-6 h-6 text-[#B11217] group-hover:scale-110 transition-transform duration-300" />
          
          {/* Cart Count Badge */}
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-[#B11217] text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg"
            >
              {cartLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                cartCount > 99 ? '99+' : cartCount
              )}
            </motion.span>
          )}
        </Link>
      </div>

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
                      className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
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

        {/* Courses Grid */}
        <motion.div 
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
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

                {/* Course Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-shadow duration-300 hover:shadow-2xl">
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
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
                        <HiBookOpen className="w-16 h-16 text-gray-300" />
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
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title and Icon */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-[#0B1C3D] line-clamp-1">
                        {course.title}
                      </h3>
                      <course.icon className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: course.color || BRAND_COLORS.teal }} />
                    </div>

                    {/* Instructor Name */}
                    <p className="text-xs text-gray-500 mb-2">
                      by {course.instructorName || 'Instructor'}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <HiStar
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.floor(course.rating)
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        ({course.reviews})
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center text-xs text-gray-500">
                        <HiClock className="w-3 h-3 mr-1 text-[#1E3A8A]" />
                        {course.duration}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <HiUserGroup className="w-3 h-3 mr-1 text-[#1E3A8A]" />
                        {course.students}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <HiAcademicCap className="w-3 h-3 mr-1 text-[#1E3A8A]" />
                        {course.level}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <HiBadgeCheck className="w-3 h-3 mr-1 text-[#1E3A8A]" />
                        Certificate
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#B11217]">
                              {course.price.replace('PKR', '').trim()}
                            </span>
                            {course.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {course.originalPrice.replace('PKR', '').trim()}
                              </span>
                            )}
                          </div>
                          {course.savings && (
                            <p className="text-xs text-green-600 mt-1">{course.savings}</p>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/courses/${course.id}`}
                        className="block w-full py-2.5 px-4 rounded-lg font-medium text-center transition-all duration-300 group"
                        style={{
                          backgroundColor: hoveredCard === course.id ? '#1E3A8A' : '#B11217',
                          color: 'white'
                        }}
                      >
                        <span className="flex items-center justify-center text-sm">
                          View Details
                          <HiArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
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
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] as Easing }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  {/* Feature Header */}
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className="w-full p-6 text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
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
                            {feature.bullets.map((bullet, idx) => (
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
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CoursesTab Component */}
      <div className="mt-16">
        <CoursesTab />
      </div>
    </div>
  );
}