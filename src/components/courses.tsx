"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Star, 
  Clock, 
  Search, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Award,
  Shield,
  Flame,
  Zap,
  Heart,
  MessageSquare
} from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// MANSOL HAB courses data (real data only)
const coursesData = [
  {
    id: 1,
    title: "IOSH: Institution of Occupational Safety and Health",
    description: "International safety certification recognized worldwide for workplace safety professionals",
    category: "Safety Certification",
    duration: "4 weeks",
    level: "Intermediate",
    rating: null,
    originalPrice: "Rs44,000",
    currentPrice: "Rs40,000",
    discount: "Rs4,000 OFF",
    instructor: "Masol Hab",
    featured: true,
    certification: "International"
  },
  {
    id: 2,
    title: "Basic First Aid Training",
    description: "Essential first aid skills for workplace and home emergency situations",
    category: "First Aid",
    duration: "2 weeks",
    level: "Beginner",
    rating: null,
    originalPrice: "Rs20,000",
    currentPrice: "Rs18,000",
    discount: "Rs2,000 OFF",
    instructor: "Masol Hab",
    featured: false,
    certification: "National"
  },
  {
    id: 3,
    title: "Integrated Safety & Compliance Training (7 in 1)",
    description: "Comprehensive safety training covering 7 critical areas of workplace compliance",
    category: "Safety Compliance",
    duration: "8 weeks",
    level: "Advanced",
    rating: null,
    originalPrice: "Rs165,000",
    currentPrice: "Rs140,000",
    discount: "Rs25,000 OFF",
    instructor: "Masol Hab",
    featured: true,
    certification: "International"
  },
  {
    id: 4,
    title: "Basic Orientation of Safety & Health (BOSH)",
    description: "Fundamental occupational safety training for workplace compliance and awareness",
    category: "Safety Foundation",
    duration: "3 weeks",
    level: "Beginner",
    rating: null,
    originalPrice: "Rs20,000",
    currentPrice: "Rs16,000",
    discount: "Rs4,000 OFF",
    instructor: "Masol Hab",
    featured: false,
    certification: "National"
  },
  {
    id: 5,
    title: "Fire Safety – OSHAcademy (USA)",
    description: "USA certified fire safety training program for industrial and commercial settings",
    category: "Fire Safety",
    duration: "3 weeks",
    level: "Intermediate",
    rating: 5.0,
    originalPrice: "Rs20,000",
    currentPrice: "Rs18,000",
    discount: "Rs2,000 OFF",
    instructor: "Masol Hab",
    featured: true,
    certification: "USA Certified"
  },
  {
    id: 6,
    title: "OSHA – General Industry 30 Hrs (USA)",
    description: "30-hour OSHA general industry safety training with international certification",
    category: "OSHA Training",
    duration: "6 weeks",
    level: "Intermediate",
    rating: 4.7,
    originalPrice: "Rs50,000",
    currentPrice: "Rs40,000",
    discount: "Rs10,000 OFF",
    instructor: "Masol Hab",
    featured: false,
    certification: "USA Certified"
  },
  {
    id: 7,
    title: "Hole Watcher – OSHAcademy (USA)",
    description: "Specialized training for confined space safety and hole watching procedures",
    category: "Safety Specialization",
    duration: "2 weeks",
    level: "Intermediate",
    rating: null,
    originalPrice: "Rs20,000",
    currentPrice: "Rs18,000",
    discount: "Rs2,000 OFF",
    instructor: "Masol Hab",
    featured: false,
    certification: "USA Certified"
  },
  {
    id: 8,
    title: "Permit to Work System – OSHAcademy (USA)",
    description: "Complete PTW system implementation training for high-risk work environments",
    category: "Safety Systems",
    duration: "3 weeks",
    level: "Advanced",
    rating: 4.8,
    originalPrice: "Rs25,000",
    currentPrice: "Rs20,000",
    discount: "Rs5,000 OFF",
    instructor: "Masol Hab",
    featured: true,
    certification: "USA Certified"
  }
];

const categories = [
  { name: "All", count: coursesData.length, icon: Shield, color: "from-gray-600 to-gray-800" },
  { name: "Safety Certification", count: 2, icon: Award, color: "from-[#6B21A8] to-purple-600" },
  { name: "First Aid", count: 1, icon: Heart, color: "from-[#DA2F6B] to-pink-600" },
  { name: "Fire Safety", count: 1, icon: Flame, color: "from-orange-500 to-orange-600" },
  { name: "OSHA Training", count: 3, icon: Shield, color: "from-blue-500 to-blue-600" },
  { name: "Safety Systems", count: 1, icon: Award, color: "from-green-500 to-green-600" },
];

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const PopularCourses = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileSliderIndex, setMobileSliderIndex] = useState(0);
  const [cardsAnimations, setCardsAnimations] = useState<(() => void)[]>([]);
  
  const sectionRef = useRef<HTMLElement>(null);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const waveRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const headingCharsRef = useRef<HTMLSpanElement[]>([]);

  // Filter courses based on category, level, and search
  useEffect(() => {
    let filtered = coursesData;

    if (activeCategory !== "All") {
      filtered = filtered.filter(course => course.category === activeCategory);
    }

    if (activeLevel !== "All Levels") {
      filtered = filtered.filter(course => course.level === activeLevel);
    }

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [activeCategory, activeLevel, searchQuery]);

  // Optimized GSAP animations with proper cleanup
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section entrance animation
      if (sectionRef.current) {
        gsap.fromTo(sectionRef.current, 
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Heading character animation
      if (headingRef.current) {
        
        const chars = headingCharsRef.current;
        
        chars.forEach((char, index) => {
          if (char) {
            gsap.fromTo(char,
              { opacity: 0, x: -30, rotationY: 90 },
              {
                opacity: 1,
                x: 0,
                rotationY: 0,
                duration: 0.6,
                delay: index * 0.05,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: headingRef.current,
                  start: "top 85%",
                  toggleActions: "play none none none",
                }
              }
            );
          }
        });
      }

      // Subtitle animation
      const subtitle = document.querySelector('.section-subtitle');
      if (subtitle) {
        gsap.fromTo(subtitle,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            ease: "power3.out",
            scrollTrigger: {
              trigger: subtitle,
              start: "top 90%",
              toggleActions: "play none none none",
            }
          }
        );
      }

      // Cards animations
      const cards = cardsRef.current.filter(Boolean);
      const newAnimations: (() => void)[] = [];

      cards.forEach((card, index) => {
        if (!card) return;

        // Initial state
        gsap.set(card, {
          opacity: 0,
          y: 80,
          scale: 0.9,
          rotationY: 5
        });

        // Scroll animation
        ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotationY: 0,
              duration: 0.8,
              delay: index * 0.08,
              ease: "power3.out"
            });
          },
          once: true
        });

        // Hover animations with cleanup function
        const handleMouseEnter = () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out"
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        };

        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        // Store cleanup function
        newAnimations.push(() => {
          card.removeEventListener('mouseenter', handleMouseEnter);
          card.removeEventListener('mouseleave', handleMouseLeave);
        });
      });

      setCardsAnimations(newAnimations);

      // Categories animation
      const categoryButtons = document.querySelectorAll('.category-btn');
      gsap.fromTo(categoryButtons,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: '.category-btn',
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // Wave animation
      if (waveRef.current) {
        gsap.to(waveRef.current, {
          y: 40,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          }
        });
      }

    }, sectionRef); // Context scope

    return () => {
      // Cleanup all animations
      ctx.revert();
      
      // Cleanup card event listeners
      cardsAnimations.forEach(cleanup => cleanup());
      setCardsAnimations([]);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCourses]);

  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize heading characters refs
  useEffect(() => {
    if (headingRef.current) {
      const headingText = "Our Courses";
      headingRef.current.innerHTML = '';
      headingCharsRef.current = [];
      
      headingText.split('').forEach((char) => {
        const span = document.createElement('span');
        span.className = 'inline-block';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = '0';
        span.style.transform = 'translateX(-30px) rotateY(90deg)';
        
        headingRef.current?.appendChild(span);
        headingCharsRef.current.push(span);
      });
    }
  }, []);

  // Mobile slider navigation
  const nextSlide = () => {
    if (mobileSliderRef.current) {
      const scrollAmount = mobileSliderRef.current.clientWidth;
      mobileSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setMobileSliderIndex(prev => Math.min(prev + 1, categories.length - 1));
    }
  };

  const prevSlide = () => {
    if (mobileSliderRef.current) {
      const scrollAmount = mobileSliderRef.current.clientWidth;
      mobileSliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setMobileSliderIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const addToCardsRef = useCallback((el: HTMLDivElement | null, index: number) => {
    cardsRef.current[index] = el;
  }, []);



  const getLevelColor = (level: string) => {
    const colors = {
      Beginner: "bg-green-100 text-green-800 border border-green-200",
      Intermediate: "bg-blue-100 text-blue-800 border border-blue-200",
      Advanced: "bg-purple-100 text-purple-800 border border-purple-200"
    };
    return colors[level as keyof typeof colors];
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={`${
              i < Math.floor(rating) 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  const resetFilters = () => {
    setActiveCategory("All");
    setActiveLevel("All Levels");
    setSearchQuery("");
    setIsFilterOpen(false);
  };

  // Course images based on category
  const getCourseImage = (category: string) => {
    const images = {
      "Safety Certification": "/abc.jpg",
      "First Aid": "/basic_first_aid.jpg",
      "Fire Safety": "/integrated_safety.jpg",
      "Safety Compliance": "/Bosh.jpg",
      "Safety Foundation": "/OSHA.png",
      "OSHA Training": "/Hole_watcher.jpg",
      "Safety Specialization": "/Hole_watcher.jpg",
      "Safety Systems": "/Hole_watcher.jpg"
    };
    return images[category as keyof typeof images] || "/abc.jpg";
  };

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-br from-[#F5F5F5] to-white py-12 px-3 sm:px-4 lg:px-6 overflow-hidden"
    >
      {/* Animated Wave Background */}
      <div ref={waveRef} className="absolute top-0 left-0 right-0 h-40 overflow-hidden opacity-10 z-0">
        <svg 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path 
            fill="#6B21A8"
            d="M0,0 Q180,100 360,0 T720,0 T1080,100 T1440,0 L1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#6B21A8]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#DA2F6B]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Message */}
       

        {/* Header Section */}
        <div className="text-center mb-10">
          <span className="text-[#DA2F6B] font-semibold text-base uppercase tracking-wider mb-3 block section-subtitle">
            Professional Safety Training
          </span>
          
          {/* Main Heading with character animation */}
          <h1 
            ref={headingRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6"
          />
          
          <p className="text-lg text-[#4B5563] max-w-3xl mx-auto mb-8 leading-relaxed">
            Complete International Certifications for professional development and career advancement
          </p>

          {/* Search Bar and Filter Button */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4B5563]" size={20} />
                <input
                  type="text"
                  placeholder="Search safety courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-3 focus:ring-[#6B21A8] focus:border-transparent transition-all duration-300 text-base"
                />
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-2 text-base text-[#1F2937] hover:bg-gray-50"
              >
                <Filter size={20} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1F2937] text-lg">Filters</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-[#1F2937] mb-3">Level</label>
                <div className="flex flex-wrap gap-3">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setActiveLevel(level)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeLevel === level
                          ? "bg-[#6B21A8] text-white shadow-lg"
                          : "bg-gray-100 text-[#4B5563] hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border-2 border-gray-300 text-[#4B5563] rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-[#6B21A8] text-white rounded-lg text-base font-medium hover:bg-[#5B1890] transition-colors shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Category Slider */}
        <div className="md:hidden mb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1F2937] text-base">Categories</h3>
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                disabled={mobileSliderIndex === 0}
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextSlide}
                disabled={mobileSliderIndex === categories.length - 1}
                className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
          <div
            ref={mobileSliderRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3"
            style={{ scrollBehavior: 'smooth' }}
          >
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`category-btn flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 border snap-center w-[120px] ${
                    activeCategory === category.name
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                      : "bg-white text-[#1F2937] border-gray-200 hover:border-[#6B21A8] hover:shadow-md"
                  }`}
                >
                  <IconComponent size={24} className="mb-2" />
                  <span className="font-medium text-sm text-center">{category.name}</span>
                  <span className={`text-xs mt-1 ${
                    activeCategory === category.name 
                      ? "text-white/80" 
                      : "text-[#4B5563]"
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Category Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`category-btn flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-300 border ${
                  activeCategory === category.name
                    ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-xl`
                    : "bg-white text-[#1F2937] border-gray-200 hover:border-[#6B21A8] hover:shadow-lg"
                }`}
              >
                <IconComponent size={28} className="mb-3" />
                <span className="font-semibold text-sm text-center leading-tight">{category.name}</span>
                <span className={`text-sm mt-1.5 ${
                  activeCategory === category.name 
                    ? "text-white/80" 
                    : "text-[#4B5563]"
                }`}>
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="text-base text-[#4B5563]">
            <span className="font-semibold text-[#1F2937]">{filteredCourses.length}</span> courses found
            {searchQuery && (
              <span> for <span className="font-medium text-[#DA2F6B]">{searchQuery}</span></span>
            )}
            {activeLevel !== "All Levels" && (
              <span> • <span className="font-medium text-[#6B21A8]">{activeLevel}</span></span>
            )}
          </div>
          {(activeCategory !== "All" || activeLevel !== "All Levels" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-sm text-[#6B21A8] hover:text-[#5B1890] font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              ref={(el) => addToCardsRef(el, index)}
              className="group bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#6B21A8]/40 transform-gpu flex flex-col h-full min-h-[480px]"
              style={{ minWidth: "280px" }}
            >
              {/* Course Image */}
              <div className="relative h-44 flex-shrink-0 overflow-hidden">
                <Image
                  src={getCourseImage(course.category)}
                  alt={course.title}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index < 4}
                />
                <div className="absolute inset-0" />
              </div>

              {/* Course Content */}
              <div className="flex flex-col flex-1 p-5">
                {/* Level */}
                <div className="mb-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                {/* Course Title */}
                <h3 className="font-bold text-[#1F2937] text-lg mb-3 line-clamp-2 leading-tight group-hover:text-[#6B21A8] transition-colors">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-[#4B5563] text-sm leading-relaxed mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Details */}
                <div className="space-y-3 mb-5 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#6B21A8] to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      MH
                    </div>
                    <div className="text-sm text-[#4B5563]">
                      By <span className="font-semibold text-[#1F2937]">{course.instructor}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#4B5563] text-sm">
                      <Clock size={16} className="text-[#6B21A8]" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    {renderStars(course.rating)}
                  </div>
                </div>

                {/* Price Section */}
                <div className="mb-5">
                  <div className="flex items-end gap-3">
                    <div className="text-xl font-bold text-[#1F2937]">{course.currentPrice}</div>
                    <div className="text-sm text-[#4B5563] line-through">{course.originalPrice}</div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    const contactSection = document.getElementById("contact");
                    contactSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#6B21A8] to-[#7C3AED] hover:from-[#5B1890] hover:to-[#6D28D9] text-white font-semibold rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl active:scale-95 group flex items-center justify-center gap-3"
                >
                  <MessageSquare size={18} />
                  Inquiry Now
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-[#6B21A8]/10 to-[#DA2F6B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={28} className="text-[#6B21A8]" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">No courses found</h3>
            <p className="text-[#4B5563] text-base mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No safety courses match "${searchQuery}". Try a different search term.`
                : "No courses available with current filters. Please try different filters."
              }
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3.5 bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] hover:from-[#5B1890] hover:to-[#C81E5A] text-white font-semibold rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              View All Safety Courses
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCourses;