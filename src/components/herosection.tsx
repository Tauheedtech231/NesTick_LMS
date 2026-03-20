'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Define slide type for better TypeScript support
interface Slide {
  desktopImage?: string;
  mobileImage?: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    desktopImage: "https://images.pexels.com/photos/5125783/pexels-photo-5125783.jpeg",
    mobileImage: "https://images.pexels.com/photos/6059068/pexels-photo-6059068.jpeg",
    title: "Workplace Safety & Compliance Training",
    subtitle: "Skills Aligned with International Standards",
    description:
      "Industry-focused safety education designed to prepare professionals for real construction and industrial environments.",
    cta: "Explore Safety Courses",
    ctaLink: "/courses?category=safety"
  },
  {
    desktopImage: "https://images.pexels.com/photos/4956920/pexels-photo-4956920.jpeg",
    mobileImage: "https://images.pexels.com/photos/6474476/pexels-photo-6474476.jpeg",
    title: "Industrial Construction Skill Development",
    subtitle: "Practical Training for Technical Careers",
    description:
      "Hands-on technical training covering essential construction, installation, and industrial work practices.",
    cta: "View Construction Programs",
    ctaLink: "/courses?category=construction"
  },
  {
    desktopImage: "https://images.pexels.com/photos/8960987/pexels-photo-8960987.jpeg",
    mobileImage: "https://images.pexels.com/photos/9242801/pexels-photo-9242801.jpeg",
    title: "Advanced Technical Trade Training",
    subtitle: "Learn Practical Skills That Matter",
    description:
      "Professionally structured training programs focused on technical trades, safety practices, and on-site readiness.",
    cta: "Start Learning Today",
    ctaLink: "/courses"
  },
  {
    desktopImage: "https://images.pexels.com/photos/5298215/pexels-photo-5298215.jpeg",
    mobileImage:"https://images.pexels.com/photos/4956912/pexels-photo-4956912.jpeg",
    title: "Industry-Ready Technical Education",
    subtitle: "Built for Construction & Industrial Fields",
    description:
      "Skill-based education designed to support long-term careers in construction, safety, and technical industries.",
    cta: "Join Now",
    ctaLink: "/register"
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Check screen size for responsive images
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
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
  }, [isAutoPlaying, isHovered]);

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  // Get the appropriate image source based on screen size
  const getImageSource = (slide: Slide): string => {
    if (isMobile) {
      return slide.mobileImage || "https://images.pexels.com/photos/8961031/pexels-photo-8961031.jpeg";
    }
    return slide.desktopImage || slide.mobileImage || "https://images.pexels.com/photos/8961031/pexels-photo-8961031.jpeg";
  };

  // Smooth crossfade animation for images
  const imageVariants: Variants = {
    enter: {
      opacity: 0,
      scale: 1.05,
    },
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  // Smooth text animation with staggered children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const subtitleVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      y: -15,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
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
      {/* Background Images with Smooth Crossfade */}
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

      {/* Center Content with Smooth Text Animation */}
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
            {/* Subtitle */}
            <motion.p 
              variants={subtitleVariants}
              className="text-xs sm:text-sm text-[#B11217] uppercase mb-3 tracking-wider"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {/* Heading */}
            <motion.h1 
              variants={textVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              {slides[currentSlide].title}
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={textVariants}
              className="mt-4 text-sm sm:text-base md:text-lg text-gray-200 max-w-2xl mx-auto"
            >
              {slides[currentSlide].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons with Smooth Entrance */}
     <AnimatePresence mode="wait">
  <motion.div 
    key={`buttons-${currentSlide}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="absolute bottom-8 sm:bottom-12 w-full flex justify-center items-center z-10 px-4"
  >
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center">
      
      <Link
        href={slides[currentSlide].ctaLink}
        className="w-full max-w-[180px] sm:w-auto text-center px-5 py-3 bg-[#B11217] text-white font-semibold rounded-lg hover:bg-[#8e0e13] transition-all duration-300 text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105 mb-5 sm:mb-0 "
      >
        {slides[currentSlide].cta}
      </Link>

      <Link
        href="/about"
        className="w-full max-w-[180px] sm:w-auto text-center px-5 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-all duration-300 text-sm md:text-base hover:scale-105"
      >
        Learn More
      </Link>

    </div>
  </motion.div>
</AnimatePresence>

      {/* Scroll Indicator with Smooth Animation */}
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