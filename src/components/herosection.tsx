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
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'tween', duration: 0.5, ease: 'easeOut' },
        opacity: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'tween', duration: 0.5, ease: 'easeIn' },
        opacity: { duration: 0.3 },
      },
    }),
  };

  const textVariants:Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: (delay: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full h-screen bg-gradient-to-br from-[#0B1C3D] to-[#1E3A8A] overflow-hidden"
      style={{
        margin: 0,
        padding: 0,
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        left: 0,
        right: 0,
      }}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,_white_1px,_transparent_0)] bg-[length:40px_40px]" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex items-center">
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content - Text */}
              <div className="text-white w-full">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentSlide}
                    className="w-full max-w-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Subtitle */}
                    <motion.p
                      custom={0}
                      initial="hidden"
                      animate="visible"
                      variants={textVariants}
                      className="text-sm md:text-base font-medium text-[#B11217] uppercase tracking-wider mb-2 md:mb-3"
                    >
                      {slides[currentSlide].subtitle}
                    </motion.p>

                    {/* Title */}
                    <motion.h1
                      custom={1}
                      initial="hidden"
                      animate="visible"
                      variants={textVariants}
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 leading-tight"
                    >
                      {slides[currentSlide].title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      custom={2}
                      initial="hidden"
                      animate="visible"
                      variants={textVariants}
                      className="text-sm sm:text-base md:text-lg text-gray-200 mb-4 md:mb-6 leading-relaxed max-w-lg"
                    >
                      {slides[currentSlide].description}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      custom={3}
                      initial="hidden"
                      animate="visible"
                      variants={textVariants}
                      className="flex flex-wrap gap-3 md:gap-4"
                    >
                      <Link
                        href="/courses"
                        className="px-5 py-2.5 md:px-6 md:py-3 bg-[#B11217] hover:bg-[#8e0e13] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm md:text-base"
                      >
                        Get Started
                      </Link>
                      <Link
                        href="/about"
                        className="px-5 py-2.5 md:px-6 md:py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-all duration-300 hover:scale-105 text-sm md:text-base"
                      >
                        Learn More
                      </Link>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Content - Image Card */}
              <div className="relative w-full flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#B11217]/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                  
                  {/* Image Card */}
                  <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 backdrop-blur-sm">
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
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group p-1.5"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-[#B11217] scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}