'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MdPlayArrow } from 'react-icons/md';

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
  const whyChooseListRef = useRef<HTMLUListElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const journeyContentRef = useRef<HTMLDivElement>(null);
  const feedbackSliderRef = useRef<HTMLDivElement>(null);
  
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
        whyChooseListRef.current,
        journeyRef.current,
        journeyContentRef.current,
        feedbackSliderRef.current,
      ], { clearProps: "all" });

      // --- "About Mansol" Heading animation from LEFT ---
      if (headingAboutRef.current) {
        gsap.fromTo(headingAboutRef.current,
          { x: -150, opacity: 0 },
          {
            x: 0,
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

      // --- Overview description animation from RIGHT with slightly smaller font ---
      if (overviewRef.current) {
        gsap.fromTo(overviewRef.current,
          { x: 150, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
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

      // Why Choose section with list stagger
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

      // Why Choose list items stagger with subtle animation
      if (whyChooseListRef.current) {
        gsap.fromTo(whyChooseListRef.current.children,
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: whyChooseListRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Journey section with left/right/bottom animations for content
      if (journeyRef.current && journeyContentRef.current) {
        // Background image fade in
        gsap.fromTo(journeyRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: journeyRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Content children animations: left, right, bottom
        const children = journeyContentRef.current.children;
        if (children.length) {
          gsap.fromTo(children,
            { 
              y: (i) => i === 2 ? 60 : 0,
              x: (i) => i === 0 ? -80 : (i === 1 ? 80 : 0),
              opacity: 0 
            },
            {
              y: 0,
              x: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: journeyRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      }

      // Student Feedback slider (continuous right-to-left with orbiting effect)
      if (feedbackSliderRef.current) {
        const slider = feedbackSliderRef.current;
        const cards = gsap.utils.toArray('.feedback-card');
        const totalWidth = (cards.length * 280) + ((cards.length - 1) * 24);
        
        // Clone cards for seamless loop - with type assertion
        cards.forEach((card) => {
          const clone = (card as HTMLElement).cloneNode(true);
          slider.appendChild(clone);
        });

        gsap.set(slider, { x: 0 });

        // Main continuous sliding
        gsap.to(slider, {
          x: -totalWidth,
          duration: 45,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: (x) => {
              const position = parseFloat(x);
              if (position <= -totalWidth) {
                return "0px";
              }
              return x;
            }
          }
        });

        // Orbiting/radial effect on each card (gentle rotation and movement) - with type assertion
        cards.forEach((card) => {
          gsap.to(card as HTMLElement, {
            rotation: 2,
            x: '+=3',
            y: '+=2',
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            modifiers: {
              x: (x) => `${parseFloat(x)}px`,
              y: (y) => `${parseFloat(y)}px`
            }
          });
        });
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
        {/* --- About Mansol Heading at the TOP with left animation --- */}
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

        {/* --- Hero Section with reduced desktop height --- */}
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

        {/* --- Mission & Vision Cards (no images) --- */}
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

        {/* --- Why Choose Section with MdPlayArrow icons --- */}
        <div ref={whyChooseRef}>
          <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-xl border border-blue-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 relative inline-block">
              Why Choose TechSafe Education?
              <span className="absolute -bottom-1 left-0 w-24 h-1 bg-red-700 rounded-full" />
            </h3>
            <p className="text-gray-700 text-base mb-8 max-w-3xl">
              We focus on quality, safety, and long-term value for students.
            </p>

            <ul ref={whyChooseListRef} className="space-y-4 max-w-2xl">
              {[
                "Industry-aligned curriculum with practical exposure",
                "Certified and experienced instructors",
                "Focus on safety standards and professional ethics",
                "Career-oriented training and recognized certifications",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 p-2 group">
                  <MdPlayArrow className="flex-shrink-0 mt-1 text-[#B11217] text-xl transform transition-transform group-hover:translate-x-1" />
                  <span className="text-gray-800 font-medium text-sm md:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Our Journey Section with background image --- */}
        <div
          ref={journeyRef}
          className="relative rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg"
              alt="Journey background"
              fill
              className="object-cover"
              quality={85}
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div ref={journeyContentRef} className="relative z-10 py-16 px-6 md:py-20 md:px-10 text-white">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 relative inline-block w-full">
              Our Journey
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#B11217] to-transparent rounded-full" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#B11217] text-center transform transition-all hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2">2018</div>
                <h4 className="text-lg font-semibold text-white mb-2">Foundation</h4>
                <p className="text-gray-100 text-sm">Started with a mission to bridge the skill gap in technical education.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#B11217] text-center transform transition-all hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2">2021</div>
                <h4 className="text-lg font-semibold text-white mb-2">Expansion</h4>
                <p className="text-gray-100 text-sm">Opened two new campuses and launched online certification programs.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-l-4 border-[#B11217] text-center transform transition-all hover:scale-105 hover:bg-white/20">
                <div className="text-4xl font-bold text-white mb-2">2024</div>
                <h4 className="text-lg font-semibold text-white mb-2">1,000+ Alumni</h4>
                <p className="text-gray-100 text-sm">Celebrating a decade of excellence and industry partnerships.</p>
              </div>
            </div>

            <div className="mt-10 text-center max-w-3xl mx-auto bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <p className="text-gray-100 italic text-sm md:text-base">
                From a small classroom to a thriving community — our journey reflects our commitment to shaping future-ready professionals.
              </p>
            </div>
          </div>
        </div>

        {/* --- Student Feedback Section at the bottom --- */}
        <div className="overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] text-center mb-10 relative inline-block w-full">
            Student Feedback
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#B11217] rounded-full" />
          </h3>

          <div className="relative w-full overflow-hidden">
            <div
              ref={feedbackSliderRef}
              className="flex gap-6 will-change-transform"
              style={{ width: 'max-content' }}
            >
              <div className="feedback-card bg-white p-6 rounded-2xl shadow-xl w-64 flex-shrink-0 border-t-2 border-blue-200 transform transition-all hover:scale-105">
                <div className="text-4xl mb-3">👩‍🎓</div>
                <p className="text-gray-700 text-sm italic">“The hands-on training gave me confidence to work on real projects. Truly life-changing!”</p>
                <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Priya K.</p>
              </div>
              <div className="feedback-card bg-white p-6 rounded-2xl shadow-xl w-64 flex-shrink-0 border-t-2 border-blue-200 transform transition-all hover:scale-105">
                <div className="text-4xl mb-3">👨‍🎓</div>
                <p className="text-gray-700 text-sm italic">“Instructors are industry experts who care about your growth. Best decision ever.”</p>
                <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Rahul M.</p>
              </div>
              <div className="feedback-card bg-white p-6 rounded-2xl shadow-xl w-64 flex-shrink-0 border-t-2 border-blue-200 transform transition-all hover:scale-105">
                <div className="text-4xl mb-3">👩‍💻</div>
                <p className="text-gray-700 text-sm italic">“The safety focus and ethics taught here set Mansol apart. Highly recommend!”</p>
                <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Anjali S.</p>
              </div>
              <div className="feedback-card bg-white p-6 rounded-2xl shadow-xl w-64 flex-shrink-0 border-t-2 border-blue-200 transform transition-all hover:scale-105">
                <div className="text-4xl mb-3">👨‍🏫</div>
                <p className="text-gray-700 text-sm italic">“Great environment and supportive mentors. I landed my dream job thanks to Mansol.”</p>
                <p className="mt-4 font-bold text-[#1E3A8A] text-sm">— Vikram S.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}