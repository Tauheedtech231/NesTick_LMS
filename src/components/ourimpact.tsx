'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaGraduationCap, FaCalendarAlt, FaBook } from 'react-icons/fa';
import { MdOutlineWorkspacePremium } from 'react-icons/md';
import { GiTeacher } from 'react-icons/gi';
// removed unused imports RiUserStarLine, BiTask

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { 
    label: 'Success Stories', 
    value: 168, 
    icon: <FaGraduationCap className="text-blue-500" />,
    description: 'Students achieved their career goals'
  },
  { 
    label: 'Trusted Tutors', 
    value: 678, 
    icon: <GiTeacher className="text-blue-500" />,
    description: 'Expert instructors guiding students'
  },
  { 
    label: 'Scheduled Events', 
    value: 347, 
    icon: <FaCalendarAlt className="text-blue-500" />,
    description: 'Live sessions & workshops conducted'
  },
  { 
    label: 'Available Courses', 
    value: 1912, 
    icon: <FaBook className="text-blue-500" />,
    description: 'Comprehensive learning materials'
  },
];

export default function OurImpact() {
  const statsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section entrance animation
      gsap.fromTo(sectionRef.current, 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Animate counters
      stats.forEach((_, idx) => {
        const counter = statsRef.current?.querySelectorAll('.counter')[idx];
        if (counter) {
          gsap.fromTo(
            counter,
            { innerText: 0 },
            {
              innerText: stats[idx].value,
              duration: 2.5,
              snap: { innerText: 1 },
              ease: 'power2.out',
              scrollTrigger: {
                trigger: counter,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });

      // Animate cards with staggered animation
      gsap.fromTo('.impact-card',
        { 
          y: 60,
          opacity: 0,
          scale: 0.9
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.impact-card',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Icon animation
      gsap.fromTo('.impact-icon',
        { 
          rotationY: 180,
          opacity: 0,
          scale: 0.5
        },
        {
          rotationY: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: '.impact-card',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

    }, statsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Subtitle */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MdOutlineWorkspacePremium className="text-lg" />
            <span>Our Achievements</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Impact</span>
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who have transformed their careers through our comprehensive learning platform
          </p>
        </div>

        {/* Stats Cards */}
        <div 
          ref={statsRef} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="impact-card group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 hover:-translate-y-2"
            >
              {/* Icon Container */}
              <div className="impact-icon mb-4 flex justify-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <div className="text-2xl">
                    {stat.icon}
                  </div>
                </div>
              </div>

              {/* Counter */}
              <div className="text-center mb-2">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white counter">
                  0
                </div>
                <div className="text-lg md:text-xl font-semibold text-blue-600 dark:text-blue-400">
                  +
                </div>
              </div>

              {/* Label */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                {stat.label}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                {stat.description}
              </p>

              {/* Animated Border Bottom */}
              <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>

     
      </div>
    </section>
  );
}