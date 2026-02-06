'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      const elementsToClear = [
        headingRef.current, 
        descriptionRef.current, 
        imageRef.current,
        contentRef.current
      ].filter(Boolean) as HTMLElement[];
      
      if (elementsToClear.length > 0) {
        gsap.set(elementsToClear, { clearProps: "all" });
      }

      // Section entrance
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

      // Heading animation
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
            }
          }
        );
      }

      // Description animation
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

      // Image animation
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
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
              trigger: imageRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Content animation
      if (contentRef.current) {
        gsap.fromTo(contentRef.current.children,
          {
            y: 40,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contentRef.current,
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
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full -translate-x-32 -translate-y-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100/10 to-transparent rounded-full translate-x-48 translate-y-48" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with unique underline */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-block relative">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl md:text-4xl font-bold text-[#1E3A8A] mb-6 relative z-10"
            >
              Empowering Young Minds with Technical Skills
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full" />
          </div>

          <div ref={descriptionRef} className="max-w-4xl mx-auto mt-10">
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed px-4">
              TechSafe Education delivers practical, industry-focused technical education.
              We emphasize hands-on learning and real-world skills in Safety, Civil Engineering,
              and Cybersecurity to prepare students for professional success.
            </p>
          </div>
        </div>

        {/* Main content - Split layout with unique design */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image section - Left side */}
          <div className="lg:w-1/2">
            <div 
              ref={imageRef}
              className="relative group"
            >
              {/* Main image container */}
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1C3D]/40 via-transparent to-transparent z-10" />
                <Image
                  src="https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg"
                  alt="Students learning technical skills at TechSafe Education"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  quality={90}
                />
                
                {/* Overlay with unique design */}
                
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-blue-300 rounded-tl-2xl opacity-60" />
              <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-2 border-r-2 border-red-300 rounded-br-2xl opacity-60" />
            </div>
          </div>

          {/* Content section - Right side */}
         <div className="lg:w-1/2">
  <div ref={contentRef} className="h-full flex flex-col justify-center">
    {/* Main heading */}
    <div className="mb-8">
      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
        Why Choose TechSafe Education?
        <span className="absolute -bottom-1 left-0 w-24 h-1 bg-red-700 rounded-full" />
      </h3>
      <p className="text-gray-700 text-lg">
        We focus on quality, safety, and long-term value for students.
      </p>
    </div>

 {/* Benefits list */}
<div className="space-y-4 mb-10">
  {[
    "Industry-aligned curriculum with practical exposure",
    "Certified and experienced instructors",
    "Focus on safety standards and professional ethics",
    "Career-oriented training and recognized certifications"
  ].map((item, index) => (
    <div
      key={index}
      className="flex items-start gap-3 p-2"
    >
      {/* Simple marker */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-3 h-3 rounded-full bg-red-700" />
      </div>

      {/* Text */}
      <span className="text-gray-800 font-medium text-base">
        {item}
      </span>
    </div>
  ))}
</div>

  </div>
</div>

        </div>

      
      </div>
    </section>
  );
}