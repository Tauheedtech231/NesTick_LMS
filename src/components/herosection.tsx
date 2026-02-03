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
    <section className="relative w-full h-screen overflow-hidden bg-gray-900">
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
        className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-16 z-20"
      >
        <div className="max-w-4xl">
          {/* Subtitle - Smaller heading */}
          <h2
            ref={subtitleRef}
            className="text-lg md:text-xl lg:text-2xl text-white/90 font-medium mb-2 md:mb-3 opacity-0"
          >
            {slides[current].subtitle}
          </h2>
          
          {/* Main Title - Responsive font sizes */}
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight opacity-0"
          >
            {slides[current].title}
          </h1>

          {/* Description - Concise text */}
          <p
            ref={descriptionRef}
            className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 md:mb-10 opacity-0"
          >
            {slides[current].description}
          </p>

          {/* Buttons Container */}
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 opacity-0"
          >
            {/* Primary CTA - Enroll Now */}
            <button
              onClick={() => window.location.href = '/enroll'}
              className="px-8 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-lg"
            >
              Enroll Now
            </button>
            
            {/* Secondary CTA - View Courses */}
            <button
              onClick={() => window.location.href = '/courses'}
              className="px-8 py-3 border-2 border-[#1E3A8A] text-white font-semibold rounded-lg hover:underline transition-all duration-300 hover:scale-105 text-lg"
            >
              View Courses
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <ChevronDown 
          size={36} 
          className="text-white/80 animate-float"
        />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && animateSlideTransition(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              current === index 
                ? "bg-white w-6 md:w-8" 
                : "bg-white/50 hover:bg-white/80"
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
      `}</style>
    </section>
  );
};

export default HeroSlider;