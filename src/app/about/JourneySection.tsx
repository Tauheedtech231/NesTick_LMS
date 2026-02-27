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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".journey-card",
        {
          opacity: 0,
          y: 40, // vertical animation (better for mobile)
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-white py-16 md:py-24 px-4 md:px-16 overflow-hidden">
      <div
        ref={containerRef}
        className="max-w-5xl mx-auto relative"
      >
        {/* Vertical Line */}
        <div className="hidden md:block absolute left-10 top-0 bottom-0 w-[3px] bg-[#E5E7EB]"></div>

        <div className="space-y-14 md:space-y-20">
          {journeyData.map((step) => (
            <div
              key={step.id}
              className="relative flex flex-col md:flex-row items-start md:items-center"
            >
              {/* Number Circle */}
              <div className="relative z-10 mb-4 md:mb-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg md:text-xl font-bold shadow-md border-4 border-white">
                  {step.id.toString().padStart(2, "0")}
                </div>
              </div>

              {/* Card */}
              <div className="md:ml-12 flex-1 w-full">
                <div className="journey-card bg-[#F4F6F8] border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition duration-300">
                  
                  <h3 className="text-xl md:text-2xl font-semibold text-[#1F2933] mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm md:text-base text-[#1F2933]/80 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-4 h-1 w-12 bg-[#B11217] rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}