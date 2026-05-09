'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Define slide type
interface HeroImage {
  id?: string;
  image_url: string;
  image_type: 'desktop' | 'mobile';
  display_order: number;
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  slide_order: number;
  is_active: boolean;
  desktop_images: HeroImage[];
  mobile_images: HeroImage[];
}

// Shimmer Component
const Shimmer = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
};

export default function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/management/hero-slides');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setSlides(data.data);
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
      } finally {
        // Add minimum loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    fetchSlides();
  }, []);

  // Check screen size for responsive images
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (slides.length === 0) return;
    
    if (isAutoPlaying && !isHovered) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isHovered, slides.length]);

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  const getImageSource = (slide: Slide): string => {
    const images = isMobile ? slide.mobile_images : slide.desktop_images;
    if (images && images.length > 0) {
      return images[0].image_url;
    }
    return isMobile 
      ? "https://images.pexels.com/photos/6059068/pexels-photo-6059068.jpeg"
      : "https://images.pexels.com/photos/5125783/pexels-photo-5125783.jpeg";
  };

  // Shimmer loading state
  if (isLoading) {
    return (
      <section className="relative w-full h-[70vh] sm:h-[80vh]  overflow-hidden bg-gray-900">
        {/* Shimmer Background */}
        <div className="absolute inset-0">
          <Shimmer />
        </div>
        
        {/* Shimmer Content Overlay */}
        <div className="relative z-10 w-full h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl w-full space-y-4">
            {/* Subtitle Shimmer */}
            <div className="h-4 w-48 bg-gray-700 rounded-full mx-auto animate-pulse" />
            
            {/* Title Shimmer */}
            <div className="space-y-3">
              <div className="h-10 w-3/4 bg-gray-700 rounded-lg mx-auto animate-pulse" />
              <div className="h-10 w-2/3 bg-gray-700 rounded-lg mx-auto animate-pulse" />
            </div>
            
            {/* Description Shimmer */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <div className="h-4 w-full bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-700 rounded-lg mx-auto animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-700 rounded-lg mx-auto animate-pulse" />
            </div>
            
            {/* Buttons Shimmer */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-center pt-4">
              <div className="w-full max-w-[180px] h-12 bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-full max-w-[180px] h-12 bg-gray-700/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No slides state
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[70vh] sm:h-[80vh]  flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-lg">No slides available</p>
          <p className="text-sm text-gray-400 mt-2">Please add slides from admin panel</p>
        </div>
      </div>
    );
  }

  // Animation variants
  const imageVariants: Variants = {
    enter: { opacity: 0, scale: 1.05 },
    center: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: { duration: 1, ease: "easeInOut" },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const textVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const subtitleVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      y: -15,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-[70vh] sm:h-[80vh] lg:h-screen overflow-hidden"
      onMouseEnter={() => {
        pauseAutoPlay();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        resumeAutoPlay();
        setIsHovered(false);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={getImageSource(slides[currentSlide])}
            alt={slides[currentSlide].title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="max-w-4xl text-white"
          >
            <motion.p 
              variants={subtitleVariants}
              className="text-xs sm:text-sm text-[#B11217] uppercase mb-3 tracking-wider"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.h1 
              variants={textVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p 
              variants={textVariants}
              className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto"
            >
              {slides[currentSlide].description}
            </motion.p>

            <motion.div 
              variants={textVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center justify-center mt-[3rem]"
            >
              <Link
                href={slides[currentSlide].cta_link}
                className="w-full max-w-[180px] sm:w-auto text-center px-5 py-3 bg-[#B11217] text-white font-semibold rounded-lg hover:bg-[#8e0e13] transition-all duration-300 text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {slides[currentSlide].cta_text}
              </Link>

              <Link
                href="/about"
                className="w-full max-w-[180px] sm:w-auto text-center px-5 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-all duration-300 text-sm md:text-base hover:scale-105"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute bottom-6 right-6 z-20 hidden lg:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-1 text-white/60">
          <span className="text-[10px] uppercase tracking-wider">Scroll</span>
          <div className="w-0.5 h-6 bg-gradient-to-b from-white to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}