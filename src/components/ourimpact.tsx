'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdOutlineArrowRight, MdKeyboardArrowDown } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// Types
interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  display_order: number;
}

interface AboutData {
  id: string;
  heading: string;
  description: string;
  mission_title: string;
  mission_description: string;
  vision_title: string;
  vision_description: string;
  cta_text: string;
  cta_link: string;
  background_image: string | null;
  why_choose_items: WhyChooseItem[];
}

// Shimmer Component
const Shimmer = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
  );
};

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const whyChooseContentRef = useRef<HTMLDivElement>(null);
  
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/management/about');
        const data = await response.json();
        if (data.success && data.data) {
          setAboutData(data.data);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // GSAP Animations (only when data is loaded)
  useEffect(() => {
    if (isLoading || !aboutData) return;

    const ctx = gsap.context(() => {
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

      if (sectionRef.current) {
        gsap.fromTo(sectionRef.current,
          { opacity: 0, y: 30 },
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

      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          { y: 40, opacity: 0 },
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

      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          { y: 30, opacity: 0 },
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

      if (missionRef.current) {
        gsap.fromTo(missionRef.current,
          { x: -30, opacity: 0 },
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

      if (visionRef.current) {
        gsap.fromTo(visionRef.current,
          { x: 30, opacity: 0 },
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
  }, [isLoading, aboutData]);

  // Loading state with Shimmer
  if (isLoading) {
    return (
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[600px]">
        <div className="absolute inset-0 z-0">
          <Shimmer />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Heading Shimmer */}
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded-lg mx-auto mt-2 animate-pulse" />
            <div className="mt-10 space-y-2">
              <div className="h-20 w-full max-w-4xl mx-auto bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-20 w-5/6 max-w-4xl mx-auto bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Mission & Vision Shimmer */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            <div className="bg-white/90 rounded-2xl p-8 h-64 animate-pulse" />
            <div className="bg-white/90 rounded-2xl p-8 h-64 animate-pulse" />
          </div>

          {/* Why Choose Shimmer */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded-lg mx-auto mt-2 animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5 bg-white/80 h-20 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No data state
  if (!aboutData) {
    return (
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="text-center">
          <p className="text-gray-500">No about section data available</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      id="about"
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={aboutData.background_image || "https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg"}
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
        {/* Header with unique underline */}
        <div className="text-center mb-12">
          <div className="inline-block relative">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl md:text-4xl font-bold text-[#1E3A8A] mb-6 relative z-10"
            >
              {aboutData.heading}
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full" />
          </div>

          <div ref={descriptionRef} className="max-w-4xl mx-auto mt-10">
            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed px-4">
              {aboutData.description}
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
              {aboutData.mission_title}
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {aboutData.mission_description}
            </p>
          </div>

          {/* Vision Card */}
          <div
            ref={visionRef}
            className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-r-4 border-[#1E3A8A] hover:shadow-2xl transition-all duration-300"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-4 relative inline-block">
              {aboutData.vision_title}
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              {aboutData.vision_description}
            </p>
          </div>
        </div>

        {/* Why Choose Section */}
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
              {aboutData.why_choose_items.map((item, index) => (
                <div
                  key={item.id}
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

                  {/* Dropdown Content */}
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
                className="px-8 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#0B1C3D] text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => window.location.href = aboutData.cta_link}
              >
                {aboutData.cta_text}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}