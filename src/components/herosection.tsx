"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto slide every 5 seconds
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, []);

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrent(index);
    // Reset interval when manually navigating
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
  };

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden pt-16 md:pt-20">
      {/* Slides - REDUCED Z-INDEX to not overlap navbar */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-0" : "opacity-0 z-0"
          }`}
        >
          {/* Responsive image container */}
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center scale-105 sm:scale-100"
              sizes="100vw"
              priority={index === 0}
              quality={90}
              style={{
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Dark overlay - REDUCED Z-INDEX */}
          <div className="absolute inset-0 bg-black/60 sm:bg-black/50 md:bg-black/40 z-0"></div>
        </div>
      ))}

      {/* Text content - Z-INDEX 10 (below navbar's z-50) */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-16 z-10 text-center pointer-events-none">
        <div className="max-w-4xl w-full pointer-events-auto">
          <h2 className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[#F4F6F8] font-medium mb-1 sm:mb-2 md:mb-3 drop-shadow-lg px-2">
            {slides[current].subtitle}
          </h2>

          <h1 className="text-sm xs:text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-1 sm:mb-2 md:mb-3 lg:mb-4 leading-tight drop-shadow-2xl px-2">
            {slides[current].title}
          </h1>

          <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[#E5E7EB] max-w-2xl mx-auto mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-relaxed drop-shadow-lg px-2">
            {slides[current].description}
          </p>

          {/* CTA Button */}
          <button
            onClick={() => (window.location.href = "/courses")}
            className="px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 py-1.5 xs:py-2 sm:py-2.5 md:py-3 lg:py-4 bg-[#B11217] text-white text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-semibold rounded-lg hover:bg-[#8E0E12] transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Explore Courses
          </button>

          <p className="mt-2 xs:mt-3 sm:mt-4 md:mt-5 lg:mt-6 text-[8px] xs:text-[10px] sm:text-xs md:text-sm text-[#F4F6F8]/80 drop-shadow-md px-2">
            Trusted • Certified • Industry-Aligned
          </p>
        </div>
      </div>

      {/* Navigation dots - Z-INDEX 15 */}
      <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-15 flex space-x-1 xs:space-x-1.5 sm:space-x-2 md:space-x-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === current
                ? "bg-white w-2 xs:w-2.5 sm:w-3 md:w-4 lg:w-5 h-0.5 xs:h-1 sm:h-1.5 md:h-2"
                : "bg-white/50 hover:bg-white/80 w-1 xs:w-1.5 sm:w-2 h-0.5 xs:h-1 sm:h-1.5 md:h-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}