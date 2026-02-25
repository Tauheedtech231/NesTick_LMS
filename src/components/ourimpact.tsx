'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdOutlineArrowRight } from 'react-icons/md';

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const journeyContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      const elementsToClear = [
        headingRef.current, 
        descriptionRef.current, 
        contentRef.current,
        missionRef.current,
        visionRef.current,
        journeyRef.current,
        journeyContentRef.current
      ].filter(Boolean) as HTMLElement[];
      
      if (elementsToClear.length > 0) {
        gsap.set(elementsToClear, { clearProps: "all" });
      }

      // Section entrance
      if (sectionRef.current) {
        gsap.fromTo(sectionRef.current,
          { 
            opacity: 0,
            y: 50
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

      // Heading animation
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            y: 30,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      // Description animation
      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          {
            y: 40,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: descriptionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Mission animation - from left
      if (missionRef.current) {
        gsap.fromTo(missionRef.current,
          {
            x: -50,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: missionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Vision animation - from right
      if (visionRef.current) {
        gsap.fromTo(visionRef.current,
          {
            x: 50,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: visionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Content animation - Why Choose items stagger
      if (contentRef.current) {
        gsap.fromTo(contentRef.current.children,
          {
            y: 20,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Journey section entrance
      if (journeyRef.current) {
        gsap.fromTo(journeyRef.current,
          {
            y: 60,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: journeyRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Journey content staggered animation
      if (journeyContentRef.current) {
        gsap.fromTo(journeyContentRef.current.children,
          {
            y: 30,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: journeyContentRef.current,
              start: 'top 80%',
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
        {/* Header with unique underline */}
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

        {/* Why Choose Section - Full width, no image */}
        <div className="mb-20">
          <div ref={contentRef} className="max-w-4xl mx-auto">
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

            {/* Benefits list with MdOutlineArrowRight icons */}
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {[
                "Industry-aligned curriculum with practical exposure",
                "Certified and experienced instructors",
                "Focus on safety standards and professional ethics",
                "Career-oriented training and recognized certifications"
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 group hover:bg-white/70 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  {/* Arrow icon */}
                  <MdOutlineArrowRight className="flex-shrink-0 mt-1 text-[#B11217] text-2xl transform group-hover:translate-x-1 transition-transform" />

                  {/* Text */}
                  <span className="text-gray-800 font-medium text-base">
                    {item}
                  </span>
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

        {/* Our Journey Section */}
        <div ref={journeyRef} className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Journey Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg"
              alt="Journey background"
              fill
              className="object-cover"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1C3D]/90 to-[#1E3A8A]/90" />
          </div>

          {/* Journey Content */}
          <div ref={journeyContentRef} className="relative z-10 py-16 px-6 md:py-20 md:px-10 text-white">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 relative inline-block w-full">
              Our Journey
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Milestone 1 */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#B11217] text-center transform transition-all hover:scale-105 hover:bg-white/20">
                <div className="text-5xl font-bold text-white mb-2">2018</div>
                <h4 className="text-xl font-semibold text-white mb-2">Foundation</h4>
                <p className="text-gray-200 text-sm">Started with a mission to bridge the skill gap in technical education with just 20 students.</p>
              </div>

              {/* Milestone 2 */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#B11217] text-center transform transition-all hover:scale-105 hover:bg-white/20">
                <div className="text-5xl font-bold text-white mb-2">2021</div>
                <h4 className="text-xl font-semibold text-white mb-2">Expansion</h4>
                <p className="text-gray-200 text-sm">Opened two new campuses in Lahore and Rawalpindi, launched online certification programs.</p>
              </div>

              {/* Milestone 3 */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#B11217] text-center transform transition-all hover:scale-105 hover:bg-white/20">
                <div className="text-5xl font-bold text-white mb-2">2024</div>
                <h4 className="text-xl font-semibold text-white mb-2">1,000+ Alumni</h4>
                <p className="text-gray-200 text-sm">Celebrating excellence with over 1000 graduates placed in leading companies.</p>
              </div>
            </div>

            {/* Additional journey description */}
            <div className="mt-10 text-center max-w-3xl mx-auto bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <p className="text-white italic text-base md:text-lg">
                From a small classroom to a thriving community — our journey reflects our commitment 
                to shaping future-ready professionals through quality technical education.
              </p>
            </div>

            {/* Stats Row */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">6+</div>
                <div className="text-sm text-gray-300">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-sm text-gray-300">Alumni Network</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4</div>
                <div className="text-sm text-gray-300">Campuses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">15+</div>
                <div className="text-sm text-gray-300">Industry Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}