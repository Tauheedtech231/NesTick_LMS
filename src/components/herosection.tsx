"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80",
    title: "Welcome to MANSOL LMS",
    subtitle: "Premium Learning Platform",
    description:
      "Learn from the best instructors and boost your skills with our comprehensive courses",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1467&q=80",
    title: "Transform Your Career",
    subtitle: "Industry-Ready Skills",
    description:
      "Master industry-relevant technologies with hands-on projects and real-world applications",
  },
  {
    image:
      "https://images.unsplash.com/photo-1522881193457-37ae97c905bf?auto=format&fit=crop&w=1470&q=80",
    title: "Join Our Learning Community",
    subtitle: "Connect & Grow Together",
    description:
      "Collaborate with peers and get guidance from expert mentors worldwide",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Auto Slide Transition
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (current + 1) % slides.length;
      gsap.to(slideRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => setCurrent(next),
      });
      gsap.to(slideRef.current, {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 1,
        ease: "power2.inOut",
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [current]);

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

  // Blue Circle Cursor + Smoke Trail (keep system cursor visible)
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Move glowing circle
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: "power2.out",
        });

        // Create smoke trail particle
        const smoke = document.createElement("span");
        smoke.style.position = "fixed";
        smoke.style.left = `${e.clientX}px`;
        smoke.style.top = `${e.clientY}px`;
        smoke.style.width = "10px";
        smoke.style.height = "10px";
        smoke.style.borderRadius = "50%";
        smoke.style.background = "rgba(0, 150, 255, 0.4)";
        smoke.style.boxShadow = "0 0 20px rgba(0,150,255,0.5)";
        smoke.style.pointerEvents = "none";
        smoke.style.zIndex = "9998";
        smoke.style.transform = "translate(-50%, -50%)";
        smoke.style.animation = "smoke 1.2s ease-out forwards";
        document.body.appendChild(smoke);
        setTimeout(() => smoke.remove(), 1200);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src={slides[current].image}
          alt={slides[current].title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />
      </div>

      {/* Text */}
      <div
        ref={slideRef}
        className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-20"
      >
        <h2 className="text-lg md:text-2xl text-blue-400 font-semibold mb-2">
          {slides[current].subtitle}
        </h2>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
          {slides[current].title}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
          {slides[current].description}
        </p>

        <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105">
          Explore Courses
        </button>
      </div>

      {/* Scroll Icon */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <ChevronDown size={36} className="text-white opacity-80" />
      </div>

      {/* Glowing Blue Circle */}
      <div
        ref={cursorRef}
        className="fixed w-6 h-6 rounded-full bg-blue-400/70 shadow-[0_0_25px_rgba(0,150,255,0.8)] pointer-events-none z-[9999]"
        style={{
          transform: "translate(-50%, -50%)",
          transition: "transform 0.15s ease-out",
        }}
      />

      {/* Smoke animation */}
      <style jsx>{`
        @keyframes smoke {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0);
          }
          50% {
            opacity: 0.4;
            transform: translate(-50%, -60%) scale(2);
            filter: blur(3px);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -90%) scale(3);
            filter: blur(6px);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;
