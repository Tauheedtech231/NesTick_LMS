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
  const sectionRef = useRef<HTMLDivElement>(null); // Add this line

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

  // Simplified animation variants - lighter and more performant
  const slideVariants:Variants = {
    enter: (direction: number) => ({
      opacity: 0,
    }),
    center: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
    exit: (direction: number) => ({
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    }),
  };

  const textVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: (delay: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: "easeOut",
      },
    }),
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={() => {
        pauseAutoPlay();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        resumeAutoPlay();
        setIsHovered(false);
      }}
    >
      {/* Background Images with simple fade */}
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
          
          {/* Simple gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content - Centered */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-white w-full max-w-4xl mx-auto text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Subtitle */}
                  <motion.div
                    custom={0}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center justify-center gap-2 mb-4"
                  >
                    <div className="w-1 h-5 bg-[#B11217] rounded-full" />
                    <p className="text-xs sm:text-sm font-medium text-[#B11217] uppercase tracking-wider">
                      {slides[currentSlide].subtitle}
                    </p>
                    <div className="w-1 h-5 bg-[#B11217] rounded-full" />
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    custom={1}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-center"
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
                    className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 leading-relaxed max-w-2xl mx-auto"
                  >
                    {slides[currentSlide].description}
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    custom={3}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-wrap gap-3 justify-center"
                  >
                    <Link
                      href={slides[currentSlide].ctaLink}
                      className="px-5 py-2.5 md:px-6 md:py-3 bg-[#B11217] text-white font-semibold rounded-lg hover:bg-[#8e0e13] transition-colors duration-300 text-sm md:text-base shadow-lg"
                    >
                      {slides[currentSlide].cta}
                    </Link>

                    <Link
                      href="/about"
                      className="px-5 py-2.5 md:px-6 md:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-colors duration-300 text-sm md:text-base"
                    >
                      Learn More
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots - Simplified */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center">
        <div className="flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative p-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-[#B11217] w-4' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Indicator - Simplified */}
      <motion.div
        className="absolute bottom-6 right-6 z-20 hidden lg:block"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-1 text-white/60">
          <span className="text-[10px] uppercase tracking-wider">Scroll</span>
          <div className="w-0.5 h-6 bg-gradient-to-b from-white to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}