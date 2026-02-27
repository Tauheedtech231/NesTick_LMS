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
  const cards = gsap.utils.toArray<HTMLElement>(".journey-card");
  
  const animations = cards.map((card: HTMLElement, index: number) => {
    return gsap.fromTo(
      card,
      {
        opacity: 0,
        x: index % 2 === 0 ? -100 : 100,
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
      }
    );
  });

  // Cleanup function
  return () => {
    animations.forEach(animation => animation.kill());
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, []);
  return (
    <section className="relative bg-white py-28 px-6 md:px-16">
      <div ref={containerRef} className="max-w-6xl mx-auto relative">

        {/* Vertical Line */}
        <div className="absolute left-8 md:left-12 top-0 bottom-0 w-[3px] bg-[#E5E7EB]"></div>

        <div className="space-y-24">

          {journeyData.map((step, index) => (
            <div key={step.id} className="relative flex items-start">

              {/* Number Circle */}
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-2xl font-bold shadow-lg border-4 border-white">
                  {step.id.toString().padStart(2, "0")}
                </div>
              </div>

              {/* Card */}
              <div className="ml-12 md:ml-20 flex-1">
                <div className="journey-card bg-[#F4F6F8] border border-[#E5E7EB] rounded-3xl p-10 shadow-md hover:shadow-xl transition duration-300">

                  <h3 className="text-3xl md:text-4xl font-semibold text-[#1F2933] mb-4">
                    {step.title}
                  </h3>

                  <p className="text-lg text-[#1F2933]/80 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Accent Line */}
                  <div className="mt-6 h-1 w-16 bg-[#B11217] rounded-full"></div>

                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}