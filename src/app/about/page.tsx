'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdPlayArrow, MdKeyboardArrowDown, MdCheckCircle, MdArrowForward } from 'react-icons/md';
import StudentFeedback from '@/components/StudentFeedback';
import JourneySection from './JourneySection';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const headingAboutRef = useRef<HTMLHeadingElement>(null);
  const overviewRef = useRef<HTMLParagraphElement>(null);
  const missionVisionRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const whyChooseItemsRef = useRef<HTMLDivElement>(null);
  
  // State for dropdown in Why Choose section
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  // Mission & Vision items with checkbox style
  const missionItems = [
    "Industry-aligned technical education",
    "Hands-on practical training",
    "Foster innovation and creativity",
    "Promote safety standards",
    "Develop professional ethics",
    "Prepare for real-world challenges"
  ];

  const visionItems = [
    "Global recognition in technical education",
    "Community of skilled professionals",
    "Priority on safety and integrity",
    "Continuous innovation",
    "Industry partnership and collaboration",
    "Excellence in training delivery"
  ];

  // Why Choose items with detailed descriptions
  const whyChooseItems = [
    {
      title: "Industry-aligned curriculum with practical exposure",
      description: "Our curriculum is developed in collaboration with industry experts to ensure you learn exactly what employers need. Every course includes hands-on projects, real-world case studies, and practical workshops that simulate actual workplace scenarios. You'll graduate with a portfolio of work that demonstrates your skills to potential employers.",
      icon: MdPlayArrow
    },
    {
      title: "Certified and experienced instructors",
      description: "Learn from professionals who have years of industry experience. Our instructors are certified experts in their fields who bring real-world knowledge to the classroom. They don't just teach theory - they share practical insights, industry secrets, and mentor you throughout your learning journey.",
      icon: MdPlayArrow
    },
    {
      title: "Focus on safety standards and professional ethics",
      description: "Safety is at the core of everything we teach. Our programs emphasize international safety standards, professional ethics, and industry best practices. You'll learn how to maintain safe work environments, follow proper protocols, and make ethical decisions in your professional career.",
      icon: MdPlayArrow
    },
    {
      title: "Career-oriented training and recognized certifications",
      description: "Our certifications are recognized by leading employers in the industry. We provide career counseling, resume building workshops, and interview preparation to help you land your dream job. Many of our graduates have gone on to work with top companies in their fields.",
      icon: MdPlayArrow
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      gsap.set([
        heroRef.current,
        heroVideoRef.current,
        heroContentRef.current,
        heroButtonRef.current,
        headingAboutRef.current,
        overviewRef.current,
        missionVisionRef.current,
        whyChooseRef.current,
        whyChooseItemsRef.current,
      ], { clearProps: "all" });

      // --- "About Mansol" Heading animation from BOTTOM ---
      if (headingAboutRef.current) {
        gsap.fromTo(headingAboutRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingAboutRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // --- Overview description animation from BOTTOM with delay ---
      if (overviewRef.current) {
        gsap.fromTo(overviewRef.current,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: overviewRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // --- Impressive Hero Section Animation with Video - FULL WIDTH NO MARGINS ---
      if (heroRef.current && heroVideoRef.current && heroContentRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        });

        // Video zoom and fade
        tl.fromTo(heroVideoRef.current,
          { scale: 1.3, opacity: 0, filter: 'blur(15px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power2.out' }
        )
        // Heading from LEFT
        .fromTo(headingAboutRef.current,
          { x: -200, opacity: 0, rotate: -5 },
          { x: 0, opacity: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.5)' },
          '-=1.2'
        )
        // Overview from RIGHT
        .fromTo(overviewRef.current,
          { x: 200, opacity: 0, rotate: 5 },
          { x: 0, opacity: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.5)' },
          '-=0.9'
        )
        // Button from BOTTOM with bounce
        .fromTo(heroButtonRef.current,
          { y: 150, opacity: 0, scale: 0.5 },
          { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'elastic.out(1, 0.5)' },
          '-=0.7'
        );
      }

      // Mission & Vision section entrance
      if (missionVisionRef.current) {
        gsap.fromTo(missionVisionRef.current,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: missionVisionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Why Choose section entrance
      if (whyChooseRef.current) {
        gsap.fromTo(whyChooseRef.current,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: whyChooseRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Why Choose items staggered animation
      if (whyChooseItemsRef.current) {
        const items = whyChooseItemsRef.current.children;
        gsap.fromTo(items,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: whyChooseItemsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* FULL WIDTH Hero Section with Video - NO MARGINS, NO PADDING */}
      <div
        ref={heroRef}
        className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden shadow-2xl"
        style={{ margin: 0, padding: 0 }}
      >
        {/* Background Video */}
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/about.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/50" /> {/* Dark overlay */}

        {/* Content Overlay - Centered with mobile top margin */}
       <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 mt-24 md:mt-0">
  <h2
    ref={headingAboutRef}
    className="text-4xl md:text-5xl lg:text-6xl font-bold text-white inline-block relative mt-8 md:mt-0"
  >
    About Mansol
    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-40 h-1.5 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
  </h2>

  <p
    ref={overviewRef}
    className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto mt-6 px-4"
  >
    Mansol is dedicated to shaping future-ready professionals through industry-aligned technical education. With a focus on safety, innovation, and hands-on learning, we empower students to excel in their chosen fields.
  </p>

  <div ref={heroButtonRef} className="mt-8">
    <button className="bg-[#B11217] hover:bg-[#8e0e13] text-white font-semibold py-3 px-8 rounded-full text-lg shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:rotate-1 active:scale-95">
      Explore Our Courses
    </button>
  </div>
</div>
      </div>

      {/* Rest of the section with padding */}
      <section
        ref={sectionRef}
        id="about"
        className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-100/10 to-transparent rounded-full translate-x-48 translate-y-48" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-12 md:space-y-16">
          {/* --- Mission & Vision Section - NO CARDS, MODERN MINIMALIST LAYOUT --- */}
          <div ref={missionVisionRef}>
            {/* Main Heading */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                Our <span className="text-[#B11217]">Mission & Vision</span>
              </h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Driven by purpose and guided by vision, we strive to create a better future through education
              </p>
            </div>

            {/* Mission & Vision - Side by side without cards */}
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission Column */}
              <div className="relative">
                {/* Decorative line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B11217] to-transparent rounded-full"></div>
                <div className="pl-6">
                  <h3 className="text-xl font-bold text-[#B11217] mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#B11217] rounded-full animate-pulse"></span>
                    Our Mission
                  </h3>
                  <div className="space-y-4">
                    {missionItems.map((item, index) => (
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
                {/* Decorative line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A8A] to-transparent rounded-full"></div>
                <div className="pl-6">
                  <h3 className="text-xl font-bold text-[#1E3A8A] mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-pulse"></span>
                    Our Vision
                  </h3>
                  <div className="space-y-4">
                    {visionItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 group">
                        <MdCheckCircle className="text-[#1E3A8A] text-lg flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                        <span className="text-gray-700 text-base group-hover:text-gray-900 transition-colors duration-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom decorative element */}
            <div className="flex justify-center mt-8">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
            </div>
          </div>

          {/* --- Why Choose Section with Clickable Dropdowns - REDUCED GAP --- */}
          <div ref={whyChooseRef} className="py-8 sm:py-10 px-4">
            {/* Center Wrapper */}
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="max-w-2xl mx-auto text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  Why Choose <span className="text-[#B11217]">Mansol</span>
                </h3>
                <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
                  We focus on academic excellence, student safety, and long-term
                  development — building a foundation that prepares students for the future.
                </p>
              </div>

              {/* Accordion */}
              <div
                ref={whyChooseItemsRef}
                className="max-w-3xl mx-auto divide-y divide-gray-200"
              >
                {whyChooseItems.map((item, index) => (
                  <div key={index} className="py-4">
                    {/* Header */}
                    <button
                      onClick={() => toggleDropdown(index)}
                      className="w-full flex items-start justify-between gap-3 text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-[#B11217] transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                          <item.icon className="text-base" />
                        </div>
                        <span className="text-gray-800 font-medium text-sm sm:text-base group-hover:text-[#B11217] transition-colors duration-300">
                          {item.title}
                        </span>
                      </div>

                      <motion.div
                        animate={{ rotate: openDropdown === index ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-gray-400 mt-1 group-hover:text-[#B11217] transition-colors duration-300 flex-shrink-0"
                      >
                        <MdKeyboardArrowDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    {/* Content */}
                    <AnimatePresence initial={false}>
                      {openDropdown === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-7 pr-2 pt-3 text-gray-600 text-xs sm:text-sm leading-relaxed border-l-2 border-[#B11217] ml-2">
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

          {/* --- Journey Section Component - REDUCED MARGIN --- */}
          
            <JourneySection />
          

          {/* --- Student Feedback Component - REDUCED MARGIN --- */}
          
            <StudentFeedback />
          
        </div>
      </section>
    </>
  );
}