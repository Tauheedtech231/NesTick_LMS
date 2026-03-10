'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const slides = [
  {
    image: "https://images.pexels.com/photos/6245621/pexels-photo-6245621.jpeg",
    title: "Workplace Safety & Compliance Training",
    subtitle: "Skills Aligned with International Standards",
    description:
      "Industry-focused safety education designed to prepare professionals for real construction and industrial environments.",
    cta: "Explore Safety Courses",
    ctaLink: "/courses?category=safety"
  },
  {
    image: "https://images.pexels.com/photos/8961132/pexels-photo-8961132.jpeg",
    title: "Industrial Construction Skill Development",
    subtitle: "Practical Training for Technical Careers",
    description:
      "Hands-on technical training covering essential construction, installation, and industrial work practices.",
    cta: "View Construction Programs",
    ctaLink: "/courses?category=construction"
  },
  {
    image: "https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg",
    title: "Advanced Technical Trade Training",
    subtitle: "Learn Practical Skills That Matter",
    description:
      "Professionally structured training programs focused on technical trades, safety practices, and on-site readiness.",
    cta: "Start Learning Today",
    ctaLink: "/courses"
  },
  {
    image: "https://images.pexels.com/photos/32467382/pexels-photo-32467382.jpeg",
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
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAutoPlaying && !isHovered) {
      autoPlayRef.current = setInterval(() => {
        setDirection(1);
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

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Optimized animation variants
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      scale: 1.1,
      opacity: 0,
    }),
    center: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
    exit: (direction: number) => ({
      scale: 1.1,
      opacity: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const textVariants: Variants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      filter: "blur(10px)"
    },
    visible: (delay: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        delay: delay * 0.15,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
    exit: {
      y: -20,
      opacity: 0,
      filter: "blur(10px)",
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      y: 20
    },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: delay * 0.1,
      },
    }),
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const overlayVariants: Variants = {
    initial: { opacity: 0.4 },
    animate: { 
      opacity: [0.4, 0.45, 0.4],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotVariants: Variants = {
    initial: { scale: 1 },
    active: {
      scale: [1, 1.3, 1],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants: Variants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: {
      scale: [1, 2, 2.5],
      opacity: [0.5, 0.3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        left: 0,
        right: 0,
      }}
      onMouseEnter={() => {
        pauseAutoPlay();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        resumeAutoPlay();
        setIsHovered(false);
      }}
    >
      {/* Background Images with Ken Burns Effect */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          
          {/* Enhanced gradient overlay for better text readability */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle particle effect */}
      <motion.div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main Content Container - Centered */}
      <div className="relative mt-10 w-full h-full flex items-center justify-center">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[600px]">
              {/* Text Content - Centered */}
              <div className="text-white w-full max-w-4xl mx-auto text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    className="w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Subtitle with centered icon */}
                    <motion.div
                      custom={0}
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-center justify-center gap-2 mb-4 md:mb-5"
                    >
                      <motion.div 
                        className="w-1 h-6 bg-[#B11217] rounded-full"
                        animate={{ 
                          height: [20, 24, 20],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <p className="text-xs sm:text-sm md:text-base font-medium text-[#B11217] uppercase tracking-[0.2em]">
                        {slides[currentSlide].subtitle}
                      </p>
                      <motion.div 
                        className="w-1 h-6 bg-[#B11217] rounded-full"
                        animate={{ 
                          height: [20, 24, 20],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      custom={1}
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight text-center"
                    >
                      {slides[currentSlide].title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      custom={2}
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 md:mb-10 leading-relaxed max-w-3xl mx-auto"
                    >
                      {slides[currentSlide].description}
                    </motion.p>

                    {/* CTA Buttons - Centered with smooth animations */}
                    <motion.div
                      custom={3}
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex flex-wrap gap-4 md:gap-6 justify-center"
                    >
                      <motion.div
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        custom={3}
                      >
                        <Link
                          href={slides[currentSlide].ctaLink}
                          className="group relative px-6 py-3 md:px-8 md:py-4 bg-[#B11217] text-white font-semibold rounded-lg overflow-hidden shadow-lg hover:shadow-xl text-sm md:text-base block"
                        >
                          <span className="relative z-10">{slides[currentSlide].cta}</span>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-[#8e0e13] to-[#B11217]"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />
                        </Link>
                      </motion.div>

                      <motion.div
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        whileTap="tap"
                        custom={4}
                      >
                        <Link
                          href="/about"
                          className="px-6 py-3 md:px-8 md:py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base block"
                        >
                          Learn More
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots - Centered with smooth animations */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4 md:gap-5">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className="group relative py-2"
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              variants={dotVariants}
              initial="initial"
              animate={currentSlide === index ? "active" : "initial"}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-[#B11217]' 
                  : 'bg-white/50 group-hover:bg-white/80'
              }`}
            />
            {currentSlide === index && (
              <motion.div
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-0 rounded-full border border-[#B11217]"
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Scroll Indicator - Right side */}
      <motion.div
        className="absolute bottom-8 right-8 z-20 hidden lg:block"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <motion.span 
            className="text-xs uppercase tracking-wider"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll
          </motion.span>
          <motion.div 
            className="w-0.5 h-8 bg-gradient-to-b from-white/60 to-transparent"
            animate={{ 
              height: [20, 32, 20],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}