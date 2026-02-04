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

  // Auto slide every 5 seconds (changed from 6 seconds)
  useEffect(() => {
    slideInterval.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Changed to 5000ms (5 seconds)

    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, []);

  // Optional: Add manual navigation controls
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
    <section className="relative w-full h-screen overflow-hidden mt-16">
  {/* Slides */}
  {slides.map((slide, index) => (
    <div
      key={index}
      className={`absolute inset-0 transition-opacity duration-1000 ${
        index === current ? "opacity-100 z-20" : "opacity-0 z-10"
      }`}
    >
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority={index === 0}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>
    </div>
  ))}

  {/* Text content */}
  <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 lg:px-16 z-30 text-center">
    <div className="max-w-4xl">
      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl text-[#F4F6F8] font-medium mb-3 drop-shadow-lg">
        {slides[current].subtitle}
      </h2>

      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
        {slides[current].title}
      </h1>

      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#E5E7EB] max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow-lg">
        {slides[current].description}
      </p>

      {/* CTA */}
      <button
        onClick={() => (window.location.href = "/courses")}
        className="px-8 sm:px-10 py-3 sm:py-4 bg-[#B11217] text-white font-semibold rounded-lg hover:bg-[#8E0E12] transition-all duration-300 hover:scale-105 shadow-lg"
      >
        Explore Courses
      </button>

      <p className="mt-6 text-xs sm:text-sm text-[#F4F6F8]/80 drop-shadow-md">
        Trusted • Certified • Industry-Aligned
      </p>
    </div>
  </div>
</section>

  );
}