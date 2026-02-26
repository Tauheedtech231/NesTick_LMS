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
  },
  {
    image: "https://images.pexels.com/photos/8961132/pexels-photo-8961132.jpeg",
    title: "Industrial Construction Skill Development",
    subtitle: "Practical Training for Technical Careers",
    description:
      "Hands-on technical training covering essential construction, installation, and industrial work practices.",
  },
  {
    image: "https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg",
    title: "Advanced Technical Trade Training",
    subtitle: "Learn Practical Skills That Matter",
    description:
      "Professionally structured training programs focused on technical trades, safety practices, and on-site readiness.",
  },
  {
    image: "https://images.pexels.com/photos/32467382/pexels-photo-32467382.jpeg",
    title: "Industry-Ready Technical Education",
    subtitle: "Built for Construction & Industrial Fields",
    description:
      "Skill-based education designed to support long-term careers in construction, safety, and technical industries.",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  // Pause auto-play on hover
  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Animation variants
  const slideVariants:Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    }),
  };

  const textVariants:Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }
    },
  };

  const subtitleVariants:Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }
    },
  };

  const descriptionVariants:Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
      }
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] bg-gradient-to-br from-[#0B1C3D] to-[#1E3A8A] overflow-hidden"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Background Pattern - Fixed positioning */}
      <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute inset-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Content Container - Full width with proper padding */}
      <div className="relative z-10 w-full h-full min-h-[100dvh] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content - Text */}
            <div className="text-white order-2 lg:order-1 w-full">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        staggerChildren: 0.15,
                        delayChildren: 0.1,
                      }
                    }
                  }}
                  className="w-full max-w-xl mx-auto lg:mx-0"
                >
                  {/* Subtitle */}
                  <motion.p
                    variants={subtitleVariants}
                    className="text-sm md:text-base font-medium text-[#B11217] uppercase tracking-wider mb-3"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>

                  {/* Title */}
                  <motion.h1
                    variants={textVariants}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight"
                  >
                    {slides[currentSlide].title}
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    variants={descriptionVariants}
                    className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 md:mb-8 leading-relaxed max-w-lg"
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    variants={textVariants}
                    className="flex flex-wrap gap-3 md:gap-4"
                  >
                    <Link
                      href="/courses"
                      className="px-5 py-2.5 md:px-6 md:py-3 bg-[#B11217] hover:bg-[#8e0e13] text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-sm md:text-base"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/about"
                      className="px-5 py-2.5 md:px-6 md:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                    >
                      Learn More
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Content - Image Card */}
            <div className="relative order-1 lg:order-2 w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#B11217]/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                
                {/* Image Card */}
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 backdrop-blur-sm">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentSlide}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="relative aspect-[4/3] w-full"
                    >
                      <Image
                        src={slides[currentSlide].image}
                        alt={slides[currentSlide].title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Subtle gradient at bottom only */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots - Always visible */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 md:gap-3 px-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative group touch-target"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Dot */}
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-[#B11217] scale-125 md:scale-150' 
                : 'bg-white/50 hover:bg-white/80'
            }`}>
              {/* Active Dot with Animation */}
              {currentSlide === index && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute inset-0 rounded-full bg-[#B11217]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </div>
            
            {/* Pulse Effect for Active Dot */}
            {currentSlide === index && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 rounded-full bg-[#B11217] pointer-events-none"
              />
            )}
          </button>
        ))}
      </div>

      {/* Progress Bar - Full width */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-1 bg-white/10">
        <motion.div
          key={currentSlide}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          className="h-full bg-gradient-to-r from-[#B11217] to-[#B11217]/50"
        />
      </div>

      {/* Touch Optimization Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .touch-target {
            min-width: 44px;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}