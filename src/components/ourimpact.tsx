'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdOutlineArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const whyChooseContentRef = useRef<HTMLDivElement>(null);
  
  // State for dropdown in Why Choose section
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Why Choose items with detailed descriptions
  const whyChooseItems = [
    {
      title: "Industry-aligned curriculum with practical exposure",
      description: "Our curriculum is developed in collaboration with industry experts to ensure you learn exactly what employers need. Every course includes hands-on projects, real-world case studies, and practical workshops that simulate actual workplace scenarios. You'll graduate with a portfolio of work that demonstrates your skills to potential employers."
    },
    {
      title: "Certified and experienced instructors",
      description: "Learn from professionals who have years of industry experience. Our instructors are certified experts in their fields who bring real-world knowledge to the classroom. They don't just teach theory - they share practical insights, industry secrets, and mentor you throughout your learning journey."
    },
    {
      title: "Focus on safety standards and professional ethics",
      description: "Safety is at the core of everything we teach. Our programs emphasize international safety standards, professional ethics, and industry best practices. You'll learn how to maintain safe work environments, follow proper protocols, and make ethical decisions in your professional career."
    },
    {
      title: "Career-oriented training and recognized certifications",
      description: "Our certifications are recognized by leading employers in the industry. We provide career counseling, resume building workshops, and interview preparation to help you land your dream job. Many of our graduates have gone on to work with top companies in their fields."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      const elementsToClear = [
        headingRef.current, 
        descriptionRef.current, 
        missionRef.current,
        visionRef.current,
        whyChooseContentRef.current
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
              start: 'top 85%',
              end: 'bottom 50%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Heading animation - from BOTTOM
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            y: 40,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Description animation - from BOTTOM with slight delay
      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          {
            y: 30,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: descriptionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Mission animation - from left with optimized timing
      if (missionRef.current) {
        gsap.fromTo(missionRef.current,
          {
            x: -30,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: missionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Vision animation - from right with optimized timing
      if (visionRef.current) {
        gsap.fromTo(visionRef.current,
          {
            x: 30,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: visionRef.current,
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
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/95 to-white/95" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with unique underline - Animated from BOTTOM */}
        <div className="text-center mb-12">
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

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Mission Card */}
          <div
            ref={missionRef}
            className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-l-4 border-[#B11217] hover:shadow-2xl transition-all duration-300"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 relative inline-block">
              Our Mission
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              To equip young learners with industry-relevant technical skills through hands-on training, 
              fostering innovation, safety, and professional ethics that prepare them for real-world challenges.
            </p>
          </div>

          {/* Vision Card */}
          <div
            ref={visionRef}
            className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-r-4 border-[#1E3A8A] hover:shadow-2xl transition-all duration-300"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 relative inline-block">
              Our Vision
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              To become a globally recognized hub for technical education, creating a community of 
              skilled professionals who prioritize safety, integrity, and continuous innovation.
            </p>
          </div>
        </div>

        {/* Why Choose Section - with Clickable Dropdowns */}
        <div className="mb-16">
          <div ref={whyChooseContentRef} className="max-w-4xl mx-auto">
            {/* Main heading */}
            <div className="mb-8 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
                Why Choose TechSafe Education?
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-red-700 rounded-full" />
              </h3>
              <p className="text-gray-700 text-lg">
                We focus on quality, safety, and long-term value for students.
              </p>
            </div>

            {/* Benefits list with clickable dropdowns */}
            <div className="space-y-3 mt-8">
              {whyChooseItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300"
                >
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <MdOutlineArrowRight className="flex-shrink-0 text-[#B11217] text-2xl transform transition-transform group-hover:translate-x-1" />
                      <span className="text-gray-800 font-medium text-base md:text-lg">{item.title}</span>
                    </div>
                    
                    {/* Dropdown Arrow */}
                    <motion.div
                      animate={{ rotate: openDropdown === index ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <MdKeyboardArrowDown 
                        className={`w-6 h-6 ${openDropdown === index ? 'text-[#B11217]' : 'text-gray-400'} transition-colors duration-300`} 
                      />
                    </motion.div>
                  </button>

                  {/* Dropdown Content with smooth animation */}
                  <AnimatePresence>
                    {openDropdown === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-gray-200">
                          <div className="bg-gradient-to-br from-blue-50/80 to-white p-5 rounded-lg">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-10 text-center">
              <button
                className="px-8 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#0B1C3D] text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => window.location.href = '/courses'}
              >
                Explore Our Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}