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
  const statsContainerRef = useRef<HTMLDivElement>(null);
  
  const [animatedValues, setAnimatedValues] = useState(statsData.map(() => 0));

  // Create refs array properly
  const statCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize refs array
  useEffect(() => {
    statCardRefs.current = statCardRefs.current.slice(0, statsData.length);
  }, []);

  const setStatCardRef = (index: number) => (el: HTMLDivElement | null) => {
    statCardRefs.current[index] = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      const elementsToClear = [
        headingRef.current, 
        descriptionRef.current, 
        imageRef.current,
        statsContainerRef.current,
        ...statCardRefs.current.filter(Boolean)
      ].filter(Boolean) as HTMLElement[];
      
      if (elementsToClear.length > 0) {
        gsap.set(elementsToClear, { clearProps: "all" });
      }

      // Section background fade in
      if (sectionRef.current) {
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
      }

      // Heading slide in from left
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            x: -50,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headingRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Description slide in from right
      if (descriptionRef.current) {
        gsap.fromTo(descriptionRef.current,
          {
            x: 50,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
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

      // Image slide in from left with fade
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          {
            x: -50,
            opacity: 0,
            scale: 0.95
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: imageRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Stats staggered animation
      const validStatRefs = statCardRefs.current.filter(Boolean) as HTMLElement[];
      if (validStatRefs.length > 0 && statsContainerRef.current) {
        gsap.fromTo(validStatRefs,
          {
            y: 30,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsContainerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Counter animations for stats
      if (statsContainerRef.current) {
        statsData.forEach((stat, idx) => {
          const target = { value: 0 };
          gsap.to(target, {
            value: stat.value,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              setAnimatedValues(prev => {
                const newValues = [...prev];
                newValues[idx] = Math.floor(target.value);
                return newValues;
              });
            },
            scrollTrigger: {
              trigger: statsContainerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          });
        });
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
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            ref={headingRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6"
          >
            Empowering Young Minds with <span className="text-[#1E3A8A]">Technical Expertise</span>
          </h2>
          
          <div 
            ref={descriptionRef}
            className="max-w-3xl mx-auto"
          >
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              TechSafe Education is dedicated to providing high-quality technical education for Class 10–12 students. 
              We believe in hands-on learning and practical skill development to prepare young minds for successful careers.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our comprehensive courses in OSHA Safety, Civil Engineering, and Cybersecurity are designed with 
              industry requirements in mind, ensuring our students gain real-world skills and recognized certifications.
            </p>
          </div>
        </div>

        {/* Main Content - Image & Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-24">
          {/* Image Container */}
          <div 
            ref={imageRef}
            className="relative rounded-2xl overflow-hidden shadow-xl"
          >
            <Image
              src="/about/tech-lab.jpg"
              alt="Students learning technical skills in modern lab"
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
              priority
            />
            {/* Image overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />
          </div>

          {/* Text Content */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Our Mission & Vision
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                To create a generation of technically skilled professionals who can contribute 
                meaningfully to society. We focus on practical knowledge and industry-relevant 
                training that bridges the gap between classroom learning and real-world applications.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our vision is to become the leading technical education provider for school students, 
                empowering them with skills that open doors to promising careers and higher education opportunities.
              </p>
            </div>

            {/* Why Choose TechSafe Education - Human-Made Dots */}
            <div className="space-y-4">
  <h4 className="text-xl font-semibold text-gray-900">
    Why Choose TechSafe Education?
  </h4>

  <ul className="list-none space-y-2 text-base text-gray-700">
    {whyChoosePoints.map((point, index) => (
      <li
        key={index}
        className="relative pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-2 before:h-2 before:bg-orange-500 before:rounded-full"
      >
        {point.title}
      </li>
    ))}
  </ul>
</div>


          
          </div>
        </div>

        {/* Stats Display */}
        <div ref={statsContainerRef}>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">
            Our Impact & Reach
          </h3>
          
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
  {statsData.map((stat, idx) => {
    

    return (
      <div
        key={idx}
        ref={setStatCardRef(idx)}
        className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 md:p-8 transition-transform duration-300 hover:scale-[1.02] group overflow-hidden"
      >
        

        {/* Animated Number */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {formatNumber(animatedValues[idx])}
          </span>
          {stat.value >= 1000 && (
            <span className="text-lg md:text-xl font-semibold text-orange-500">+</span>
          )}
        </div>

        {/* Label */}
        <h4 className="text-md md:text-lg font-semibold text-gray-800 mb-2">
          {stat.label}
        </h4>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {stat.description}
        </p>

        {/* Decorative underline accent */}
        <span
          className={`block mt-4 h-0.5 w-12 rounded-full ${stat.color} transition-all duration-300 group-hover:w-16`}
        ></span>
      </div>
    );
  })}
</div>

        </div>

        {/* Additional Image Row */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="relative rounded-xl overflow-hidden shadow-lg group">
            <Image
              src="/about/students-groups.jpg"
              alt="Group of students collaborating"
              width={600}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold text-lg">Collaborative Learning</p>
              <p className="text-sm">Team projects and group activities</p>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-lg group">
            <Image
              src="/about/practical-trainings.jpg"
              alt="Students doing practical work"
              width={600}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold text-lg">Hands-On Experience</p>
              <p className="text-sm">Practical skill development</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-blue-100/20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-orange-100/20 blur-xl"></div>
    </section>
  );
}