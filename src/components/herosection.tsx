"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";

const slides = [
  {
    image:
      "https://images.pexels.com/photos/247823/pexels-photo-247823.jpeg",
    title: "Welcome to MANSOL LMS",
    subtitle: "Premium Learning Platform",
    description:
      "Learn from the best instructors and boost your skills with our comprehensive courses",
  },
  {
    image:
      "https://images.pexels.com/photos/8199602/pexels-photo-8199602.jpeg",
    title: "Transform Your Career",
    subtitle: "Industry-Ready Skills",
    description:
      "Master industry-relevant technologies with hands-on projects and real-world applications",
  },
  {
    image:
     "https://images.pexels.com/photos/7683730/pexels-photo-7683730.jpeg",
    title: "Join Our Learning Community",
    subtitle: "Connect & Grow Together",
    description:
      "Collaborate with peers and get guidance from expert mentors worldwide",
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Split title into purple and white parts
  const splitTitle = (title: string) => {
    const words = title.split(" ");
    const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(" ");
    const secondHalf = words.slice(Math.ceil(words.length / 2)).join(" ");
    return { firstHalf, secondHalf };
  };

  // Animate slide transition with staggered elements
  const animateSlideTransition = (nextSlide: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const timeline = gsap.timeline({
      onComplete: () => {
        setCurrent(nextSlide);
        setIsAnimating(false);
      }
    });

    // Exit animation - elements slide out to left
    timeline
      // Subtitle exits left
      .to(subtitleRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
      }, 0)
      // Title exits right
      .to(titleRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
      }, 0.1)
      // Description exits left
      .to(descriptionRef.current, {
        x: -80,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.1)
      // Button exits right
      .to(buttonRef.current, {
        x: 80,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      }, 0.1)
      // Background fades
      .to(slideRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut"
      }, 0.3)
      // Enter animation with new content
      .call(() => {
        // Reset positions before entering
        gsap.set([titleRef.current, subtitleRef.current, descriptionRef.current, buttonRef.current], {
          x: 0,
          opacity: 0
        });
      })
      // Background fades in
      .to(slideRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.inOut"
      })
      // Staggered enter animation from opposite sides
      // Subtitle enters from right
      .to(subtitleRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out"
      }, "-=0.3")
      // Title enters from left
      .to(titleRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power2.out"
      }, "-=0.5")
      // Description enters from right
      .to(descriptionRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      // Button enters from left
      .to(buttonRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");
  };

  // Auto Slide Transition
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (current + 1) % slides.length;
      animateSlideTransition(next);
    }, 6000);
    return () => clearInterval(interval);
  }, [current, isAnimating]);

  // Background Parallax
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 25;
      const y = (e.clientY / innerHeight - 0.5) * 25;
      gsap.to(bgRef.current, { x, y, duration: 1, ease: "power2.out" });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Initial animation on mount
  useEffect(() => {
    gsap.fromTo(
      [subtitleRef.current, titleRef.current, descriptionRef.current, buttonRef.current],
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
    <section className="relative w-full h-screen overflow-hidden bg-[#F5F5F5]">
      {/* Background with overlay */}
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src={slides[current].image}
          alt={slides[current].title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Text Content */}
      <div
        ref={slideRef}
        className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-20"
      >
        {/* Subtitle - Purple with slide animation */}
        <h2
          ref={subtitleRef}
          className="text-lg md:text-2xl text-[#DA2F6B] font-semibold mb-2 opacity-0"
        >
          {slides[current].subtitle}
        </h2>
        
        {/* Title - Half Purple, Half White with slide animation */}
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-2xl opacity-0"
        >
          <span className="text-[#6B21A8]">
            {splitTitle(slides[current].title).firstHalf}
          </span>
          {" "}
          <span className="text-white">
            {splitTitle(slides[current].title).secondHalf}
          </span>
        </h1>

        {/* Description - White with slide animation */}
        <p
          ref={descriptionRef}
          className="text-lg md:text-xl text-white max-w-2xl bg-black/20 backdrop-blur-sm rounded-lg p-4 opacity-0"
        >
          {slides[current].description}
        </p>

        {/* Primary Button with animation */}
        <button
          ref={buttonRef}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-[#6B21A8] to-[#8B5CF6] hover:from-[#5B1890] hover:to-[#7C3AED] text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl opacity-0"
        >
          Explore Courses
        </button>
      </div>

      {/* Scroll Icon with fade animation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <ChevronDown 
          size={36} 
          className="text-white opacity-80 animate-float"
        />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && animateSlideTransition(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              current === index 
                ? "bg-white w-6" 
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Custom animations in style tag */}
      <style jsx>{`
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