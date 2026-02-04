'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  HiCheckCircle,
  HiHand,
  HiAcademicCap,
  HiLightBulb,
  HiHeart,
  HiBriefcase
} from "react-icons/hi";

gsap.registerPlugin(ScrollTrigger);

const whyChoosePoints = [
  {
    title: 'Industry-recognized certifications',
    icon: HiCheckCircle,
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  {
    title: 'Hands-on practical training',
    icon: HiHand,
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  {
    title: 'Experienced industry professionals',
    icon: HiAcademicCap,
    color: 'bg-green-100',
    textColor: 'text-green-800',
  },
  {
    title: 'Modern equipment and facilities',
    icon: HiLightBulb,
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  {
    title: 'Personalized mentorship',
    icon: HiHeart,
    color: 'bg-pink-100',
    textColor: 'text-pink-800',
  },
  {
    title: 'Job placement assistance',
    icon: HiBriefcase,
    color: 'bg-indigo-100',
    textColor: 'text-indigo-800',
  }
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Create refs array properly
  const pointRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize refs arrays
  useEffect(() => {
    pointRefs.current = pointRefs.current.slice(0, whyChoosePoints.length);
  }, []);

  const setPointRef = (index: number) => (el: HTMLDivElement | null) => {
    pointRefs.current[index] = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      const elementsToClear = [
        headingRef.current, 
        descriptionRef.current, 
        cardRef.current,
        ...pointRefs.current.filter(Boolean)
      ].filter(Boolean) as HTMLElement[];
      
      if (elementsToClear.length > 0) {
        gsap.set(elementsToClear, { clearProps: "all" });
      }

      // Smooth entrance for entire section
      if (sectionRef.current) {
        gsap.fromTo(sectionRef.current,
          { 
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Heading animation - from left
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            x: -80,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              markers: false
            }
          }
        );
      }

      // Description animation - from right
      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          {
            x: 80,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            delay: 0.2,
            scrollTrigger: {
              trigger: descriptionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Card animation - from bottom
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          {
            y: 80,
            opacity: 0,
            scale: 0.95
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Why choose points - staggered animation
      const validPointRefs = pointRefs.current.filter(Boolean) as HTMLElement[];
      if (validPointRefs.length > 0) {
        gsap.fromTo(validPointRefs,
          {
            x: 40,
            opacity: 0,
            scale: 0.9
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
  ref={sectionRef}
  id="about"
  className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
>
  <div className="max-w-7xl mx-auto">

    {/* Header */}
    <div className="text-center mb-10 sm:mb-14 md:mb-20">
      <h2
        ref={headingRef}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-4"
      >
        Empowering Young Minds with Technical Skills
      </h2>

      <div ref={descriptionRef} className="max-w-3xl mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
          TechSafe Education delivers practical, industry-focused technical education.
          We emphasize hands-on learning and real-world skills in Safety, Civil Engineering,
          and Cybersecurity to prepare students for professional success.
        </p>
      </div>
    </div>

    {/* Main Card */}
    <div
      ref={cardRef}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg"
    >
      <div className="flex flex-col lg:flex-row min-h-[450px]">

        {/* Image */}
        <div className="lg:w-1/2 relative h-64 sm:h-72 md:h-80 lg:h-auto">
          <Image
            src="https://images.pexels.com/photos/35872219/pexels-photo-35872219.jpeg"
            alt="Students learning technical skills"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1C3D]/30 to-transparent" />

          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full">
            <span className="text-sm font-semibold text-[#1E3A8A]">
              Modern Learning Facility
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Why Choose TechSafe Education?
          </h3>

          <p className="text-gray-600 text-sm sm:text-base mb-6">
            We focus on quality, safety, and long-term value for students.
          </p>

          {/* Dot List (No Icons) */}
          <ul className="space-y-3 text-sm sm:text-base text-gray-800">
            <li className="flex items-start gap-3">
              <span className="text-[#B11217] mt-1">•</span>
              Industry-aligned curriculum with practical exposure
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B11217] mt-1">•</span>
              Certified and experienced instructors
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B11217] mt-1">•</span>
              Focus on safety standards and professional ethics
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#B11217] mt-1">•</span>
              Career-oriented training and recognized certifications
            </li>
          </ul>

          {/* Footer Info */}
          <div className="mt-8 pt-5 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Trusted by students • Industry supported • Skill-focused education
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

  );
}