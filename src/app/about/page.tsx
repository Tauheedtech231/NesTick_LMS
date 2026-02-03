'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  HiAcademicCap, 
  HiBookOpen, 
  HiShieldCheck, 
  HiUserGroup,
  HiCheckCircle,
  HiHand,
  HiLightBulb,
  HiHeart
} from "react-icons/hi";

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  { 
    label: 'Student Community', 
    value: 12500,
    description: 'Active students learning technical skills',
    icon: HiUserGroup,
    color: 'text-blue-600'
  },
  { 
    label: 'Technical Courses', 
    value: 45,
    description: 'Comprehensive technical training programs',
    icon: HiBookOpen,
    color: 'text-orange-600'
  },
  { 
    label: 'Certified Students', 
    value: 8500,
    description: 'Successfully certified young professionals',
    icon: HiShieldCheck,
    color: 'text-green-600'
  },
  { 
    label: 'Expert Instructors', 
    value: 120,
    description: 'Industry-experienced teaching staff',
    icon: HiAcademicCap,
    color: 'text-purple-600'
  },
];

const whyChoosePoints = [
  {
    title: 'Industry-recognized certifications',
    icon: HiCheckCircle,
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    dotColor: 'bg-[#1E3A8A]'
  },
  {
    title: 'Hands-on practical training',
    icon: HiHand,
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
    dotColor: 'bg-[#F97316]'
  },
  {
    title: 'Experienced industry professionals as instructors',
    icon: HiAcademicCap,
    color: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-600'
  },
  {
    title: 'Modern equipment and learning facilities',
    icon: HiLightBulb,
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
    dotColor: 'bg-purple-600'
  },
  {
    title: 'Personalized attention and mentorship',
    icon: HiHeart,
    color: 'bg-pink-100',
    textColor: 'text-pink-800',
    dotColor: 'bg-pink-600'
  },
  {
    title: 'Job placement assistance',
    icon: HiCheckCircle,
    color: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    dotColor: 'bg-indigo-600'
  }
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLUListElement>(null);
  const imageRowRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const [animatedValues, setAnimatedValues] = useState(statsData.map(() => 0));

  // Create refs array properly
  const pointRefs = useRef<(HTMLLIElement | null)[]>([]);
  
  // Initialize refs arrays
  useEffect(() => {
    pointRefs.current = pointRefs.current.slice(0, whyChoosePoints.length);
  }, []);

  const setPointRef = (index: number) => (el: HTMLLIElement | null) => {
    pointRefs.current[index] = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      const elementsToClear = [
        headingRef.current, 
        descriptionRef.current, 
        imageRef.current,
        missionRef.current,
        whyChooseRef.current,
        imageRowRef.current,
        statsRef.current,
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

      // Mission section animation - from bottom
      if (missionRef.current) {
        gsap.fromTo(missionRef.current,
          {
            y: 50,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: missionRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Image animation - from bottom with scale
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          {
            y: 100,
            opacity: 0,
            scale: 0.9,
            rotateX: 10
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Why choose points - staggered from right
      const validPointRefs = pointRefs.current.filter(Boolean) as HTMLElement[];
      if (validPointRefs.length > 0) {
        gsap.fromTo(validPointRefs,
          {
            x: 60,
            opacity: 0,
            scale: 0.9
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: whyChooseRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Stats animation - simple fade in from bottom
      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          {
            y: 40,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Counter animations for stats
        statsData.forEach((stat, idx) => {
          const target = { value: 0 };
          gsap.to(target, {
            value: stat.value,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              setAnimatedValues(prev => {
                const newValues = [...prev];
                newValues[idx] = Math.floor(target.value);
                return newValues;
              });
            },
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      }

      // Image row animation - staggered from bottom
      if (imageRowRef.current) {
        const imageItems = imageRowRef.current.querySelectorAll('.image-item');
        gsap.fromTo(imageItems,
          {
            y: 100,
            opacity: 0,
            scale: 0.95
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: imageRowRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  return (
    <section 
      ref={sectionRef}
      id='about'
      className="relative py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header - Smaller Heading */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 
            ref={headingRef}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6"
          >
            Empowering Young Minds with <span className="text-[#1E3A8A]">Technical Skills</span>
          </h2>
          
          <div 
            ref={descriptionRef}
            className="max-w-3xl mx-auto"
          >
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              TechSafe Education provides quality technical education for students. 
              We focus on practical skills and hands-on learning.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              Our courses in Safety, Civil Engineering, and Cybersecurity prepare students 
              with industry-ready skills and certifications.
            </p>
          </div>
        </div>

        {/* Main Content - Image & Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center mb-12 sm:mb-16 md:mb-24">
          {/* Image Container */}
          <div 
            ref={imageRef}
            className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl order-2 lg:order-1"
          >
            <Image
              src="/about/tech-lab.jpg"
              alt="Students learning technical skills in modern lab"
              width={600}
              height={400}
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
            {/* Image overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          {/* Text Content */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 order-1 lg:order-2">
            <div ref={missionRef}>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                To create technically skilled professionals who can contribute meaningfully to society.
              </p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                To become the leading technical education provider for school students.
              </p>
            </div>

            {/* Why Choose TechSafe Education */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900">
                Why Choose Us?
              </h4>

              <ul ref={whyChooseRef} className="list-none space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                {whyChoosePoints.map((point, index) => (
                  <li
                    key={index}
                    ref={setPointRef(index)}
                    className="relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-1.5 sm:before:w-2 sm:before:h-2 before:bg-[#F97316] before:rounded-full before:transition-all before:duration-300 hover:before:scale-125 hover:before:bg-[#EA580C]"
                  >
                    {point.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Display - Simple, without cards */}
        <div ref={statsRef} className="mb-12 sm:mb-16 md:mb-24">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8 md:mb-10">
            Our impact
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {statsData.map((stat, idx) => (
              <div
                key={idx}
                className="text-center"
              >
                {/* Animated Number */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A]">
                    {formatNumber(animatedValues[idx])}
                  </span>
                  {stat.value >= 1000 && (
                    <span className="text-lg sm:text-xl md:text-2xl font-semibold text-[#F97316]">+</span>
                  )}
                </div>

                {/* Label */}
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                  {stat.label}
                </h4>

                {/* Description - Hidden on mobile, shown on larger screens */}
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Image Row */}
        <div ref={imageRowRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg group image-item">
            <Image
              src="/about/students-groups.jpg"
              alt="Group of students collaborating"
              width={600}
              height={300}
              className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
              <p className="font-semibold text-base sm:text-lg">Collaborative Learning</p>
              <p className="text-xs sm:text-sm">Team projects and group activities</p>
            </div>
          </div>
          
          <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg group image-item">
            <Image
              src="/about/practical-trainings.jpg"
              alt="Students doing practical work"
              width={600}
              height={300}
              className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
              <p className="font-semibold text-base sm:text-lg">Hands-On Experience</p>
              <p className="text-xs sm:text-sm">Practical skill development</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements with animation */}
      <div className="absolute top-4 left-4 w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-blue-100/20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-orange-100/20 blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Smooth scroll indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"></div>
    </section>
  );
}