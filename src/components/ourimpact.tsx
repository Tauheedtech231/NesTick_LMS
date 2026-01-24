'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  { 
    label: 'Community Members', 
    value: 165489,
    description: 'Active community of safety professionals'
  },
  { 
    label: 'International Courses', 
    value: 200,
    description: 'Globally recognized certification programs'
  },
  { 
    label: 'Registered Members', 
    value: 2000000,
    description: 'Professionals trained worldwide'
  },
  { 
    label: 'Awards Won', 
    value: 578,
    description: 'Recognition for excellence in safety education'
  },
];

export default function OurImpact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  
  // Create refs for each stat dynamically
  const statRef1 = useRef<HTMLDivElement>(null);
  const statRef2 = useRef<HTMLDivElement>(null);
  const statRef3 = useRef<HTMLDivElement>(null);
  const statRef4 = useRef<HTMLDivElement>(null);
  
  const [animatedValues, setAnimatedValues] = useState(statsData.map(() => 0));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      gsap.set([
        headingRef.current, 
        descriptionRef.current, 
        statRef1.current,
        statRef2.current,
        statRef3.current,
        statRef4.current,
        yearRef.current,
        contactRef.current
      ], { clearProps: "all" });

      // Background fade in
      gsap.fromTo(sectionRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Heading slide in from left
      gsap.fromTo(headingRef.current,
        {
          x: -100,
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
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Description slide in from right
      gsap.fromTo(descriptionRef.current,
        {
          x: 100,
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

      // Stats staggered slide in with counter animations
      const statRefs = [statRef1, statRef2, statRef3, statRef4];
      
      statRefs.forEach((statRef, idx) => {
        if (statRef.current) {
          // Alternate left/right slide based on index
          const fromX = idx % 2 === 0 ? -80 : 80;
          
          gsap.fromTo(statRef.current,
            {
              x: fromX,
              opacity: 0,
              scale: 0.9
            },
            {
              x: 0,
              opacity: 1,
              scale: 1,
              duration: 1,
              ease: 'power3.out',
              delay: idx * 0.1,
              scrollTrigger: {
                trigger: statRef.current,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );

          // Counter animation for each stat
          const statValue = statsData[idx].value;
          const target = { value: 0 };
          
          gsap.to(target, {
            value: statValue,
            duration: 2.5,
            ease: 'power2.out',
            onUpdate: () => {
              setAnimatedValues(prev => {
                const newValues = [...prev];
                newValues[idx] = Math.floor(target.value);
                return newValues;
              });
            },
            scrollTrigger: {
              trigger: statRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          });
        }
      });

      // Years experience slide in from bottom
      gsap.fromTo(yearRef.current,
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: yearRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Contact info slide in from top
      gsap.fromTo(contactRef.current,
        {
          y: -50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#1F2937] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Main Heading */}
          <h2 
            ref={headingRef}
            className="text-4xl md:text-5xl font-bold text-white mb-6 opacity-0"
          >
            About <span className="text-[#6B21A8]">MANSOL HAB</span>
          </h2>
          
          {/* Description */}
          <div 
            ref={descriptionRef}
            className="max-w-3xl mx-auto opacity-0"
          >
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              MANSOL HAB Trainings is a premier educational institution dedicated to providing top-quality 
              safety education that empowers professionals to excel in their careers and evolve into 
              responsible, capable safety experts.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our modern training approach and expert faculty create a vibrant learning environment 
              for global safety standards. Since 2005, we have been shaping the future of safety 
              professionals worldwide.
            </p>
          </div>
        </div>

        {/* Stats Display */}
        <div className="relative">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              ref={statRef1}
              className="relative group opacity-0"
            >
              {/* Simple number display */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-4xl md:text-5xl font-bold text-white">
                    {formatNumber(animatedValues[0])}
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#DA2F6B]">+</div>
                </div>
              </div>

              {/* Label */}
              <h3 className="text-lg font-semibold text-white text-center mb-3">
                {statsData[0].label}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-400 text-center">
                {statsData[0].description}
              </p>

              {/* Simple divider */}
              <div className="mt-6 h-0.5 w-12 bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div
              ref={statRef2}
              className="relative group opacity-0"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-4xl md:text-5xl font-bold text-white">
                    {formatNumber(animatedValues[1])}
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#DA2F6B]">+</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white text-center mb-3">
                {statsData[1].label}
              </h3>

              <p className="text-sm text-gray-400 text-center">
                {statsData[1].description}
              </p>

              <div className="mt-6 h-0.5 w-12 bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div
              ref={statRef3}
              className="relative group opacity-0"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-4xl md:text-5xl font-bold text-white">
                    {formatNumber(animatedValues[2])}
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#DA2F6B]">+</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white text-center mb-3">
                {statsData[2].label}
              </h3>

              <p className="text-sm text-gray-400 text-center">
                {statsData[2].description}
              </p>

              <div className="mt-6 h-0.5 w-12 bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div
              ref={statRef4}
              className="relative group opacity-0"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-4xl md:text-5xl font-bold text-white">
                    {formatNumber(animatedValues[3])}
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#DA2F6B]">+</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white text-center mb-3">
                {statsData[3].label}
              </h3>

              <p className="text-sm text-gray-400 text-center">
                {statsData[3].description}
              </p>

              <div className="mt-6 h-0.5 w-12 bg-gradient-to-r from-[#6B21A8] to-[#DA2F6B] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>

        {/* Years of Experience */}
        <div 
          ref={yearRef}
          className="mt-20 text-center opacity-0"
        >
          <div className="inline-block border border-gray-700 rounded-lg px-8 py-6">
            <div className="text-2xl font-bold text-white mb-2">
              Since <span className="text-[#F59E0B]">2005</span>
            </div>
            <div className="text-gray-400">
              18+ Years of Excellence in Safety Education
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div 
          ref={contactRef}
          className="mt-16 text-center border-t border-gray-800 pt-10 opacity-0"
        >
          <div className="text-gray-400">
            <p className="mb-4">For more information about our programs and certifications</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <div className="text-white font-medium">Call: <span className="text-[#6B21A8]">03224700200</span></div>
              <div className="text-gray-400 hidden sm:block">•</div>
              <div className="text-white font-medium">Email: <span className="text-[#6B21A8]">info@mansolhab.com</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}