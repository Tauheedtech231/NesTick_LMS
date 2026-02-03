"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";

const slides = [
  {
    image: "/hero/tech1.jpg",
    title: "Professional Technical Courses",
    subtitle: "For Future Skills",
    description: "Learn practical skills in Safety, Civil, and Cybersecurity domains with certified courses designed for young learners."
  },
  {
    image: "/hero/tech2.jpg",
    title: "Build Your Career Foundation",
    subtitle: "Industry-Ready Training",
    description: "Master essential technical skills with hands-on projects and real-world applications."
  },
  {
    image: "/hero/tech3.jpg",
    title: "Expert-Led Learning Experience",
    subtitle: "Quality Education",
    description: "Learn from experienced professionals and gain industry-recognized certifications."
  },
  {
    image: "/hero/tech4.jpg",
    title: "Empower Your Future",
    subtitle: "Skill Development",
    description: "Develop practical knowledge in OSHA, Civil Engineering, and Cybersecurity for career success."
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const slideRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Animate slide transition with staggered elements
  const animateSlideTransition = useCallback((nextSlide: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const timeline = gsap.timeline({
      onComplete: () => {
        setCurrent(nextSlide);
        setIsAnimating(false);
      }
    });

    // Exit animation - fade out elements
    timeline
      .to(subtitleRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0)
      .to(titleRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.1)
      .to(descriptionRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.2)
      .to(buttonsRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.3)
      .to(slideRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0.3)
      .call(() => {
        // Reset positions before entering
        gsap.set([titleRef.current, subtitleRef.current, descriptionRef.current, buttonsRef.current], {
          y: 20,
          opacity: 0
        });
      })
      // Background fades in
      .to(slideRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.inOut"
      })
      // Staggered enter animation
      .to(subtitleRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out"
      }, "-=0.4")
      .to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out"
      }, "-=0.5")
      .to(descriptionRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .to(buttonsRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3");
  }, [isAnimating]);

  // Auto Slide Transition
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (current + 1) % slides.length;
      animateSlideTransition(next);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [current, animateSlideTransition]);

  // Initial animation on mount
  useEffect(() => {
    if (!subtitleRef.current || !titleRef.current || !descriptionRef.current || !buttonsRef.current) return;
    
    gsap.fromTo(
      [subtitleRef.current, titleRef.current, descriptionRef.current, buttonsRef.current],
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        delay: 0.5
      }
    );
  }, []);

  return (
    <section className="relative w-full h-[85vh] sm:h-[90vh] md:h-screen overflow-hidden bg-gray-900">
      {/* Background image with parallax effect */}
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src={slides[current].image}
          alt={slides[current].title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Blue overlay for text readability */}
        <div className="absolute inset-0 bg-blue-900/50" />
      </div>

      {/* Text Content Container */}
      <div
        ref={slideRef}
        className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-16 z-20"
      >
        <div className="max-w-4xl px-2 sm:px-0">
          {/* Subtitle - Smaller heading */}
          <h2
            ref={subtitleRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 font-medium mb-1 sm:mb-2 md:mb-3 opacity-0"
          >
            {slides[current].subtitle}
          </h2>
          
          {/* Main Title - Responsive font sizes */}
          <h1
            ref={titleRef}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight opacity-0"
          >
            {slides[current].title}
          </h1>

          {/* Description - Concise text */}
          <p
            ref={descriptionRef}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 opacity-0 line-clamp-3 sm:line-clamp-none"
          >
            {slides[current].description}
          </p>

          {/* Buttons Container */}
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 opacity-0"
          >
          
            
            {/* Secondary CTA - View Courses */}
            <button
              onClick={() => window.location.href = '/courses'}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 border-2 bg-[#F97316] text-white font-semibold rounded-lg hover:underline transition-all duration-300 hover:scale-105 text-sm sm:text-base md:text-lg w-full sm:w-auto"
            >
              View Courses
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on very small screens */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 hidden xs:block">
        <ChevronDown 
          size={24} 
          className="sm:size-8 text-white/80 animate-float"
        />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-1 sm:gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && animateSlideTransition(index)}
            className={`h-1 sm:h-2 md:h-3 rounded-full transition-all duration-300 ${
              current === index 
                ? "bg-white w-6 sm:w-8 md:w-10" 
                : "bg-white/50 hover:bg-white/80 w-4 sm:w-6 md:w-8"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isAnimating}
          />
        ))}
      </div>

      {/* Custom float animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        /* For very small screens */
        @media (max-height: 600px) {
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
        
        /* Responsive text line clamping */
        @media (max-width: 640px) and (max-height: 700px) {
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;