'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdPlayArrow, MdKeyboardArrowDown } from 'react-icons/md';
import StudentFeedback from '@/components/StudentFeedback';
import JourneySection from './JourneySection';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const headingAboutRef = useRef<HTMLHeadingElement>(null);
  const overviewRef = useRef<HTMLParagraphElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const whyChooseItemsRef = useRef<HTMLDivElement>(null);
  
  // State for dropdown in Why Choose section
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

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
        heroImageRef.current,
        heroContentRef.current,
        heroButtonRef.current,
        headingAboutRef.current,
        overviewRef.current,
        missionRef.current,
        visionRef.current,
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

      // --- Impressive Hero Section Animation ---
      if (heroRef.current && heroImageRef.current && heroContentRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        });

        // Image zoom and fade
        tl.fromTo(heroImageRef.current,
          { scale: 1.2, opacity: 0, filter: 'blur(10px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power2.out' }
        )
        // Content slide up with stagger
        .fromTo(heroContentRef.current,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'back.out(1.2)' },
          '-=0.8'
        )
        // Button pop with rotation
        .fromTo(heroButtonRef.current,
          { scale: 0, rotation: -15, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
          '-=0.5'
        );
      }

      // Mission card (from left)
      if (missionRef.current) {
        gsap.fromTo(missionRef.current,
          { x: -100, opacity: 0, rotateY: -15 },
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: missionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Vision card (from right)
      if (visionRef.current) {
        gsap.fromTo(visionRef.current,
          { x: 100, opacity: 0, rotateY: 15 },
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: visionRef.current,
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

      <div className="max-w-7xl mx-auto relative z-10 space-y-20 md:space-y-28">
        {/* --- About Mansol Heading from BOTTOM --- */}
        <div className="text-center max-w-4xl mx-auto">
          <h2
            ref={headingAboutRef}
            className="text-3xl md:text-4xl font-bold text-[#1E3A8A] inline-block relative mb-4"
          >
            About Mansol
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
          </h2>
          <p
            ref={overviewRef}
            className="text-base md:text-lg text-gray-700 leading-relaxed mt-6 px-4"
          >
            Mansol is dedicated to shaping future-ready professionals through industry-aligned technical education. With a focus on safety, innovation, and hands-on learning, we empower students to excel in their chosen fields.
          </p>
        </div>

        {/* --- Hero Section --- */}
        <div ref={heroRef} className="relative rounded-3xl overflow-hidden shadow-2xl">
          <div ref={heroImageRef} className="relative h-[300px] md:h-[380px] lg:h-[420px] w-full">
            <Image
              src="https://images.pexels.com/photos/33925031/pexels-photo-33925031.jpeg"
              alt="TechSafe Education hero"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              quality={95}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div ref={heroContentRef}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                Empowering Young Minds with Technical Skills
              </h1>
              <p className="text-base md:text-lg text-white/90 max-w-3xl mx-auto">
                Industry-focused training in Safety, Civil Engineering, and Cybersecurity
              </p>
            </div>
            <div ref={heroButtonRef} className="mt-6">
              <button className="bg-[#B11217] hover:bg-[#8e0e13] text-white font-semibold py-2.5 px-6 rounded-full text-base shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                Explore Our Courses
              </button>
            </div>
          </div>
        </div>

        {/* --- Mission & Vision Cards --- */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div
            ref={missionRef}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-l-4 border-[#B11217] transform transition-all hover:scale-105 hover:shadow-2xl"
          >
            <h3 className="text-xl md:text-2xl font-bold text-[#1E3A8A] mb-4 relative inline-block">
              Our Mission
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-base leading-relaxed">
              To equip young learners with industry-relevant technical skills through hands-on training, fostering innovation, safety, and professional ethics that prepare them for real-world challenges.
            </p>
          </div>

          <div
            ref={visionRef}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-r-4 border-[#1E3A8A] transform transition-all hover:scale-105 hover:shadow-2xl"
          >
            <h3 className="text-xl md:text-2xl font-bold text-[#1E3A8A] mb-4 relative inline-block">
              Our Vision
              <span className="absolute -bottom-1 left-0 w-16 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-base leading-relaxed">
              To become a globally recognized hub for technical education, creating a community of skilled professionals who prioritize safety, integrity, and continuous innovation.
            </p>
          </div>
        </div>

        {/* --- Why Choose Section with Clickable Dropdowns --- */}
        <div ref={whyChooseRef}>
          <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl border border-blue-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 relative inline-block">
              Why Choose Mansol?
              <span className="absolute -bottom-1 left-0 w-24 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-base mb-8 max-w-3xl">
              We focus on quality, safety, and long-term value for students.
            </p>

            <div ref={whyChooseItemsRef} className="space-y-3 max-w-3xl">
              {whyChooseItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white/50">
                  {/* Clickable Header */}
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/80 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <item.icon className="flex-shrink-0 text-[#B11217] text-xl transform transition-transform group-hover:scale-110" />
                      <span className="text-gray-800 font-medium text-sm md:text-base">{item.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: openDropdown === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MdKeyboardArrowDown className={`w-6 h-6 ${openDropdown === index ? 'text-[#B11217]' : 'text-gray-400'} transition-colors`} />
                    </motion.div>
                  </button>

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {openDropdown === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-gray-200">
                          <div className="bg-gradient-to-br from-blue-50/50 to-white p-4 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">
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
          </div>
        </div>

        {/* --- Journey Section Component --- */}
        <JourneySection />

        {/* --- Student Feedback Component --- */}
        <StudentFeedback />
      </div>
    </section>
  );
}