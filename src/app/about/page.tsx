'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdPlayArrow, MdKeyboardArrowDown, MdCheckCircle } from 'react-icons/md';
import StudentFeedback from '@/components/StudentFeedback';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/footer';

gsap.registerPlugin(ScrollTrigger);

// Types
interface AboutData {
  id: string;
  hero_heading: string;
  hero_description: string;
  hero_button_text: string;
  hero_button_link: string;
  hero_video_url: string;
  mission_title: string;
  vision_title: string;
  why_choose_heading: string;
  why_choose_subheading: string;
  mission_items: string[];
  vision_items: string[];
  why_choose_items: { title: string; description: string }[];
}

interface JourneyStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean | number;
}

interface JourneySettings {
  heading: string;
  heading_highlight: string;
  subheading: string;
}

// Shimmer Component
const Shimmer = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
  );
};

// Dynamic Journey Section Component (Real-time fetch)
const DynamicJourneySection = () => {
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [settings, setSettings] = useState<JourneySettings>({
    heading: 'Our',
    heading_highlight: 'Journey',
    subheading: 'A progressive path of growth, innovation, and commitment to excellence.'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const leftCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rightCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const circlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch journey data - Real time, no cache
  useEffect(() => {
    const fetchJourneyData = async () => {
      console.log('🔄 Fetching journey data real-time...');
      try {
        const [stepsRes, settingsRes] = await Promise.all([
          fetch('/api/management/journey/steps'),
          fetch('/api/management/journey/settings')
        ]);
        
        const stepsData = await stepsRes.json();
        const settingsData = await settingsRes.json();
        
        console.log('Journey API response:', { stepsData, settingsData });
        
        if (stepsData.success && stepsData.data) {
          // Filter only active steps and sort
          const activeSteps = stepsData.data.filter((s: JourneyStep) => s.is_active === true || s.is_active === 1);
          activeSteps.sort((a: JourneyStep, b: JourneyStep) => a.display_order - b.display_order);
          setJourneySteps(activeSteps);
        }
        
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data);
        }
      } catch (error) {
        console.error('Error fetching journey:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJourneyData();
  }, []);

  // GSAP Animations for Journey
  useEffect(() => {
    if (isLoading || journeySteps.length === 0) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (timelineRef.current) {
          gsap.fromTo(timelineRef.current,
            { height: 0 },
            { height: "100%", duration: 2, ease: "power2.inOut", scrollTrigger: { trigger: containerRef.current, start: "top 70%", end: "bottom 30%", scrub: 1.5 } }
          );
        }

        leftCardsRef.current.forEach((card, idx) => {
          if (!card) return;
          gsap.fromTo(card, { opacity: 0, x: -150 }, { opacity: 1, x: 0, duration: 1, delay: idx * 0.2, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" } });
        });

        rightCardsRef.current.forEach((card, idx) => {
          if (!card) return;
          gsap.fromTo(card, { opacity: 0, x: 150 }, { opacity: 1, x: 0, duration: 1, delay: idx * 0.2, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" } });
        });

        mobileCardsRef.current.forEach((card, idx) => {
          if (!card) return;
          gsap.fromTo(card, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, delay: idx * 0.15, ease: "power2.out", scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none reverse" } });
        });

        circlesRef.current.forEach((circle, idx) => {
          if (!circle) return;
          gsap.fromTo(circle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, delay: idx * 0.15, ease: "back.out(1.7)", scrollTrigger: { trigger: circle, start: "top 85%", toggleActions: "play none none reverse" } });
        });
      }, containerRef);
      return () => ctx.revert();
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoading, journeySteps]);

  if (isLoading) {
    return (
      <div className="relative bg-white py-8 md:py-16 px-4 overflow-hidden">
        <Shimmer />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-5 w-96 bg-gray-200 rounded-lg mx-auto mt-3 animate-pulse" />
          </div>
          <div className="relative">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-center mb-10">
                <div className="w-64 h-32 bg-gray-200 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (journeySteps.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto relative">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2933]">
          {settings.heading} <span className="text-[#B11217]">{settings.heading_highlight}</span>
        </h2>
        <p className="mt-3 text-[#1F2933]/70 max-w-2xl mx-auto text-sm sm:text-base px-4">
          {settings.subheading}
        </p>
      </div>

      <div className="relative">
        <div ref={timelineRef} className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-[3px] bg-gradient-to-b from-[#1E3A8A] via-[#B11217] to-[#1E3A8A] rounded-full" style={{ height: "0%", top: "0" }} />
        <div className="md:hidden absolute left-8 transform -translate-x-1/2 w-[3px] bg-gradient-to-b from-[#1E3A8A] via-[#B11217] to-[#1E3A8A] rounded-full" style={{ height: "100%", top: "0" }} />

        <div className="relative">
          {journeySteps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={step.id} className="relative flex items-center justify-center mb-10 md:mb-16 last:mb-0">
                <div className="hidden md:flex w-full items-center justify-center">
                  <div ref={(el) => { if (el) circlesRef.current[index] = el; }} className="absolute left-1/2 transform -translate-x-1/2 z-20">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-lg lg:text-xl font-bold border-4 border-white shadow-lg hover:scale-110 transition-transform duration-300">
                      {step.step_number}
                    </div>
                  </div>

                  {isEven && (
                    <div ref={(el) => { if (el) leftCardsRef.current[Math.floor(index/2)] = el; }} className="w-[calc(50%-60px)] mr-auto pr-8">
                      <div className="bg-gradient-to-br from-[#F4F6F8] to-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                        <h3 className="text-lg lg:text-xl font-semibold text-[#1F2933] mb-3 group-hover:text-[#1E3A8A] transition-colors duration-300">{step.title}</h3>
                        <p className="text-sm lg:text-base text-[#1F2933]/80 leading-relaxed">{step.description}</p>
                        <div className="mt-4 h-1 w-12 bg-[#B11217] rounded-full group-hover:w-20 transition-all duration-300"></div>
                      </div>
                    </div>
                  )}

                  {!isEven && (
                    <div ref={(el) => { if (el) rightCardsRef.current[Math.floor(index/2)] = el; }} className="w-[calc(50%-60px)] ml-auto pl-8">
                      <div className="bg-gradient-to-br from-[#F4F6F8] to-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                        <h3 className="text-lg lg:text-xl font-semibold text-[#1F2933] mb-3 group-hover:text-[#1E3A8A] transition-colors duration-300">{step.title}</h3>
                        <p className="text-sm lg:text-base text-[#1F2933]/80 leading-relaxed">{step.description}</p>
                        <div className="mt-4 h-1 w-12 bg-[#B11217] rounded-full group-hover:w-20 transition-all duration-300"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:hidden w-full pl-16 pr-4">
                  <div ref={(el) => { if (el) circlesRef.current[index] = el; }} className="absolute left-8 transform -translate-x-1/2 z-20">
                    <div className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-base font-bold border-3 border-white shadow-lg">{step.step_number}</div>
                  </div>
                  <div ref={(el) => { if (el) mobileCardsRef.current[index] = el; }} className="bg-gradient-to-br from-[#F4F6F8] to-white border border-[#E5E7EB] rounded-xl p-5 hover:shadow-md transition-all duration-300">
                    <h3 className="text-base font-semibold text-[#1F2933] mb-2">{step.title}</h3>
                    <p className="text-xs text-[#1F2933]/80 leading-relaxed">{step.description}</p>
                    <div className="mt-3 h-0.5 w-8 bg-[#B11217] rounded-full"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mt-6 md:mt-8">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default function AboutSection() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const missionVisionRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const whyChooseItemsRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Fetch about data - Real time, no cache
  useEffect(() => {
    const fetchAboutData = async () => {
      console.log('🔄 Fetching about page data real-time...');
      try {
        const response = await fetch('/api/management/about-pg');
        const data = await response.json();
        console.log('About API response:', data);
        
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

  // GSAP Animations (mission, vision, why choose only)
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (missionVisionRef.current) {
          gsap.fromTo(missionVisionRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: missionVisionRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
          );
        }

        if (whyChooseRef.current) {
          gsap.fromTo(whyChooseRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: whyChooseRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
          );
        }

        if (whyChooseItemsRef.current) {
          const items = whyChooseItemsRef.current.children;
          gsap.fromTo(items,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: whyChooseItemsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
          );
        }
      }, sectionRef);
      return () => ctx.revert();
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="relative w-full h-[380px] md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-800">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="h-12 w-64 bg-gray-300 rounded-lg mx-auto animate-pulse mb-4" />
            <div className="h-6 w-96 bg-gray-300 rounded-lg mx-auto animate-pulse mb-8" />
            <div className="h-10 w-40 bg-gray-300 rounded-full mx-auto animate-pulse" />
          </div>
        </div>

        <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto animate-pulse mb-2" />
              <div className="h-5 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </section>
      </>
    );
  }

  const missionItemsList = aboutData?.mission_items || [
    "Industry-aligned technical education",
    "Hands-on practical training",
    "Foster innovation and creativity",
    "Promote safety standards",
    "Develop professional ethics",
    "Prepare for real-world challenges"
  ];

  const visionItemsList = aboutData?.vision_items || [
    "Global recognition in technical education",
    "Community of skilled professionals",
    "Priority on safety and integrity",
    "Continuous innovation",
    "Industry partnership and collaboration",
    "Excellence in training delivery"
  ];

  const whyChooseItemsList = aboutData?.why_choose_items || [
    { title: "Industry-aligned curriculum with practical exposure", description: "Our curriculum is developed in collaboration with industry experts to ensure you learn exactly what employers need. Every course includes hands-on projects, real-world case studies, and practical workshops that simulate actual workplace scenarios." },
    { title: "Certified and experienced instructors", description: "Learn from professionals who have years of industry experience. Our instructors are certified experts in their fields who bring real-world knowledge to the classroom." },
    { title: "Focus on safety standards and professional ethics", description: "Safety is at the core of everything we teach. Our programs emphasize international safety standards, professional ethics, and industry best practices." },
    { title: "Career-oriented training and recognized certifications", description: "Our certifications are recognized by leading employers in the industry. We provide career counseling, resume building workshops, and interview preparation." }
  ];

  return (
    <>
      {/* Hero Section - No Animation */}
      <div className="relative w-full h-[380px] md:h-[450px] lg:h-[500px] overflow-hidden shadow-2xl" style={{ margin: 0, padding: 0 }}>
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src={aboutData?.hero_video_url || "/about.mp4"} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-between py-8 md:py-12 px-4">
          <div></div>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative">
              {aboutData?.hero_heading || "About Mansol Hab"}
              <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 md:w-40 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto mt-5 px-4">
              {aboutData?.hero_description || "Mansol is dedicated to shaping future-ready professionals through industry-aligned technical education. With a focus on safety, innovation, and hands-on learning, we empower students to excel in their chosen fields."}
            </p>
          </div>
          <div>
            <button className="bg-[#B11217] hover:bg-[#8e0e13] text-white font-semibold py-2.5 px-7 rounded-full text-base md:text-lg shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1 active:scale-95 cursor-pointer">
              {aboutData?.hero_button_text || "Explore Our Courses"}
            </button>
          </div>
        </div>
      </div>

      {/* Main About Section */}
      <section ref={sectionRef} id="about" className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100/10 to-transparent rounded-full translate-x-48 translate-y-48" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8 md:space-y-10">
          {/* Mission & Vision Section */}
          <div ref={missionVisionRef}>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Our <span className="text-[#B11217]">Mission & Vision</span>
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Driven by purpose and guided by vision, we strive to create a better future through education
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
              {/* Mission Column */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B11217] to-transparent rounded-full"></div>
                <div className="pl-6">
                  <h3 className="text-xl font-bold text-[#B11217] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#B11217] rounded-full animate-pulse"></span>
                    {aboutData?.mission_title || "Our Mission"}
                  </h3>
                  <div className="space-y-3">
                    {missionItemsList.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 group">
                        <MdCheckCircle className="text-[#B11217] text-lg flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                        <span className="text-gray-700 text-base group-hover:text-gray-900 transition-colors duration-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vision Column */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A8A] to-transparent rounded-full"></div>
                <div className="pl-6">
                  <h3 className="text-xl font-bold text-[#1E3A8A] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-pulse"></span>
                    {aboutData?.vision_title || "Our Vision"}
                  </h3>
                  <div className="space-y-3">
                    {visionItemsList.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 group">
                        <MdCheckCircle className="text-[#1E3A8A] text-lg flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                        <span className="text-gray-700 text-base group-hover:text-gray-900 transition-colors duration-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
            </div>
          </div>

          {/* Why Choose Section */}
          <div ref={whyChooseRef} className="py-4 sm:py-6 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="max-w-2xl mx-auto text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {aboutData?.why_choose_heading || "Why Choose Mansol"}
                </h3>
                <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
                  {aboutData?.why_choose_subheading || "We focus on academic excellence, student safety, and long-term development — building a foundation that prepares students for the future."}
                </p>
              </div>

              <div ref={whyChooseItemsRef} className="max-w-3xl mx-auto divide-y divide-gray-200">
                {whyChooseItemsList.map((item, index) => (
                  <div key={index} className="py-3">
                    <button onClick={() => toggleDropdown(index)} className="w-full flex items-start justify-between gap-3 text-left group cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#B11217] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                          <MdPlayArrow className="text-base" />
                        </div>
                        <span className="text-gray-800 font-medium text-sm sm:text-base group-hover:text-[#B11217] transition-colors duration-300">{item.title}</span>
                      </div>
                      <motion.div animate={{ rotate: openDropdown === index ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-gray-400 mt-1 group-hover:text-[#B11217] transition-colors duration-300 flex-shrink-0">
                        <MdKeyboardArrowDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {openDropdown === index && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                          <div className="pl-7 pr-2 pt-2 text-gray-600 text-xs sm:text-sm leading-relaxed border-l-2 border-[#B11217] ml-2">
                            {item.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Journey Section */}
          <DynamicJourneySection />

          {/* Student Feedback */}
          <StudentFeedback />
        </div>
      </section>
    
    </>
  );
}