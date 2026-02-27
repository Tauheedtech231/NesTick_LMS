"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface JourneyStep {
  id: number;
  title: string;
  description: string;
}

const journeyData: JourneyStep[] = [
  {
    id: 1,
    title: "Foundation & Vision",
    description:
      "Our school was established with a mission to deliver quality education rooted in discipline, innovation, and character building.",
  },
  {
    id: 2,
    title: "Academic Excellence",
    description:
      "Structured curriculum, certified faculty, and performance monitoring systems were introduced for consistent academic growth.",
  },
  {
    id: 3,
    title: "Digital Transformation",
    description:
      "Smart classrooms, LMS integration, and internship tracking improved student engagement and efficiency.",
  },
  {
    id: 4,
    title: "Global Expansion",
    description:
      "Partnerships, skill-based programs, and infrastructure upgrades prepare students for global opportunities.",
  },
];

export default function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const leftCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rightCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline line animation
      gsap.fromTo(
        timelineRef.current,
        { height: 0 },
        {
          height: "100%",
          duration: 2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1.5,
          },
        }
      );

      // Left cards animation (from left) - Desktop only
      leftCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, x: -150 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: index * 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Right cards animation (from right) - Desktop only
      rightCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, x: 150 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: index * 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Mobile cards animation (from bottom) - Mobile only
      mobileCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Circle animations
      circlesRef.current.forEach((circle, index) => {
        gsap.fromTo(
          circle,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: circle,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-white py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div ref={containerRef} className="max-w-6xl mx-auto relative">
        
        {/* Section Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2933]">
            Our Journey
          </h2>
          <p className="mt-3 text-[#1F2933]/70 max-w-2xl mx-auto text-sm sm:text-base px-4">
            A progressive path of growth, innovation, and commitment to excellence.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Center Vertical Line - Hidden on mobile */}
          <div 
            ref={timelineRef}
            className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-[3px] bg-gradient-to-b from-[#1E3A8A] via-[#B11217] to-[#1E3A8A] rounded-full"
            style={{ height: "0%", top: "0" }}
          />

          {/* Mobile Vertical Line */}
          <div 
            className="md:hidden absolute left-8 transform -translate-x-1/2 w-[3px] bg-gradient-to-b from-[#1E3A8A] via-[#B11217] to-[#1E3A8A] rounded-full"
            style={{ height: "100%", top: "0" }}
          />

          {/* Journey Steps */}
          <div className="relative">
            {journeyData.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.id}
                  className="relative flex items-center justify-center mb-12 md:mb-20 last:mb-0"
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:flex w-full items-center justify-center">
                    {/* Center Circle */}
                    <div 
                      ref={(el) => {
                        if (el) circlesRef.current[index] = el;
                      }}
                      className="absolute left-1/2 transform -translate-x-1/2 z-20"
                    >
                      <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg lg:text-xl font-bold border-4 border-white shadow-lg hover:scale-110 transition-transform duration-300">
                        {step.id.toString().padStart(2, "0")}
                      </div>
                    </div>

                    {/* Left Card - Even indices (0,2) */}
                    {isEven && (
                      <div 
                        ref={(el) => {
                          if (el) leftCardsRef.current[Math.floor(index/2)] = el;
                        }}
                        className="w-[calc(50%-60px)] mr-auto pr-8"
                      >
                        <div className="journey-card bg-gradient-to-br from-[#F4F6F8] to-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                          <h3 className="text-lg lg:text-xl font-semibold text-[#1F2933] mb-3 group-hover:text-[#1E3A8A] transition-colors duration-300">
                            {step.title}
                          </h3>
                          <p className="text-sm lg:text-base text-[#1F2933]/80 leading-relaxed">
                            {step.description}
                          </p>
                          <div className="mt-4 h-1 w-12 bg-[#B11217] rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                      </div>
                    )}

                    {/* Right Card - Odd indices (1,3) */}
                    {!isEven && (
                      <div 
                        ref={(el) => {
                          if (el) rightCardsRef.current[Math.floor(index/2)] = el;
                        }}
                        className="w-[calc(50%-60px)] ml-auto pl-8"
                      >
                        <div className="journey-card bg-gradient-to-br from-[#F4F6F8] to-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                          <h3 className="text-lg lg:text-xl font-semibold text-[#1F2933] mb-3 group-hover:text-[#1E3A8A] transition-colors duration-300">
                            {step.title}
                          </h3>
                          <p className="text-sm lg:text-base text-[#1F2933]/80 leading-relaxed">
                            {step.description}
                          </p>
                          <div className="mt-4 h-1 w-12 bg-[#B11217] rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden w-full pl-16 pr-4">
                    {/* Mobile Circle */}
                    <div 
                      ref={(el) => {
                        if (el) circlesRef.current[index] = el;
                      }}
                      className="absolute left-8 transform -translate-x-1/2 z-20"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-base font-bold border-3 border-white shadow-lg">
                        {step.id.toString().padStart(2, "0")}
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div 
                      ref={(el) => {
                        if (el) mobileCardsRef.current[index] = el;
                      }}
                      className="bg-gradient-to-br from-[#F4F6F8] to-white border border-[#E5E7EB] rounded-xl p-5 hover:shadow-md transition-all duration-300"
                    >
                      <h3 className="text-base font-semibold text-[#1F2933] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#1F2933]/80 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="mt-3 h-0.5 w-8 bg-[#B11217] rounded-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Decorative Element */}
        <div className="flex justify-center mt-8 md:mt-12">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full"></div>
        </div>
      </div>
    </section>
  );
}