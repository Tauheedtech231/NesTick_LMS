'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Award, Briefcase, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin only on client side
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Trainer {
  id: number;
  name: string;
  role: string;
  expertise: string;
  experience: string;
  image: string;
  certifications: string[];
  studentsTrained: string;
  trainingStyle: string;
}

const trainers: Trainer[] = [
  {
    id: 1,
    name: 'Raza Hassan Zaheer',
    role: 'Mechanical Trade Trainer',
    expertise: 'Specialized in industrial mechanical systems, machine operations, and maintenance protocols with 12+ years of hands-on experience',
    experience: '12+ years',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1374&auto=format&fit=crop&w=400&h=400',
    certifications: ['Certified Mechanical Engineer', 'ISO 9001 Lead Auditor', 'Industrial Safety Specialist', 'Machine Operations Expert'],
    studentsTrained: '850+',
    trainingStyle: 'Practical hands-on with real industrial equipment'
  },
  {
    id: 2,
    name: 'Muhammad Waseem',
    role: 'Welding Trade Trainer',
    expertise: 'Expert in MIG, TIG, and Arc welding techniques with focus on industrial applications and structural welding',
    experience: '8+ years',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376&auto=format&fit=crop&w=400&h=400',
    certifications: ['AWS Certified Welding Inspector', 'Pressure Vessel Welding Specialist', 'Structural Welding Expert', 'Advanced Welding Instructor'],
    studentsTrained: '620+',
    trainingStyle: 'Precision-focused with quality control emphasis'
  },
  {
    id: 3,
    name: 'Muhammad Nouman Zain',
    role: 'HSE Trainer',
    expertise: 'Comprehensive health, safety, and environmental training with OSHA compliance focus and risk management',
    experience: '10+ years',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop&w=400&h=400',
    certifications: ['NEBOSH Certified', 'OSHA 30-Hour Trainer', 'Environmental Management Specialist', 'Risk Assessment Expert'],
    studentsTrained: '1100+',
    trainingStyle: 'Regulatory compliance with practical scenarios'
  },
  {
    id: 4,
    name: 'Ali Raza',
    role: 'Pipe Fitting Expert',
    expertise: 'Industrial pipe fitting, installation specialist with expertise in high-pressure systems',
    experience: '9+ years',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop&w=400&h=400',
    certifications: ['Certified Pipe Fitter', 'ASME B31.3 Specialist', 'Industrial Piping Expert', 'Blueprint Reading Specialist'],
    studentsTrained: '730+',
    trainingStyle: 'Detailed technical with blueprint interpretation'
  },
];

export default function TrainersSlider() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subHeadingRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!isMounted) return;

    const ctx = gsap.context(() => {
      // Clear existing animations
      gsap.set([headingRef.current, subHeadingRef.current, badgeRef.current], { 
        clearProps: "all" 
      });

      // Badge animation - fade in
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current,
          {
            opacity: 0,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: badgeRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Main heading animation - from left
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          {
            x: -80,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }

      // Subheading animation - from right
      if (subHeadingRef.current) {
        gsap.fromTo(subHeadingRef.current,
          {
            x: 80,
            opacity: 0
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: subHeadingRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMounted]);

  const handleTrainerClick = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handlePrevTrainer = () => {
    setCurrentIndex((prev) => (prev === 0 ? trainers.length - 1 : prev - 1));
  };

  const handleNextTrainer = () => {
    setCurrentIndex((prev) => (prev === trainers.length - 1 ? 0 : prev + 1));
  };

  const handlePrevPopup = () => {
    if (!selectedTrainer) return;
    const currentIndex = trainers.findIndex(t => t.id === selectedTrainer.id);
    const prevIndex = currentIndex === 0 ? trainers.length - 1 : currentIndex - 1;
    setSelectedTrainer(trainers[prevIndex]);
  };

  const handleNextPopup = () => {
    if (!selectedTrainer) return;
    const currentIndex = trainers.findIndex(t => t.id === selectedTrainer.id);
    const nextIndex = currentIndex === trainers.length - 1 ? 0 : currentIndex + 1;
    setSelectedTrainer(trainers[nextIndex]);
  };

  const getVisibleTrainers = () => {
    if (typeof window === 'undefined') {
      // Default for SSR
      return trainers.slice(0, 3);
    }
    
    const visibleCount = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    const trainersList = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % trainers.length;
      trainersList.push(trainers[index]);
    }
    
    return trainersList;
  };

  const [visibleTrainers, setVisibleTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    if (!isMounted) return;
    
    setVisibleTrainers(getVisibleTrainers());

    const handleResize = () => {
      setVisibleTrainers(getVisibleTrainers());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, isMounted]);

  // Loading skeleton
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 rounded-full mb-4 bg-gray-200 animate-pulse w-32 h-8"></div>
            <div className="h-12 bg-gray-200 animate-pulse w-96 mx-auto mb-4 rounded"></div>
            <div className="h-6 bg-gray-200 animate-pulse w-64 mx-auto rounded"></div>
          </div>
          
          <div className="flex justify-center gap-6 py-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-64">
                <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-2xl mb-4"></div>
                <div className="text-center">
                  <div className="h-6 bg-gray-200 animate-pulse w-40 mx-auto mb-2 rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse w-32 mx-auto rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div ref={badgeRef} className="inline-block px-4 py-2 rounded-full mb-4 bg-red-50">
            <span className="text-sm font-semibold text-red-700">
              Expert Faculty
            </span>
          </div>
          
          <h1 ref={headingRef} className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Meet Our <span className="text-red-700">Trainers</span>
          </h1>
          
          <p ref={subHeadingRef} className="text-base text-gray-600 max-w-2xl mx-auto">
            Click on any trainer to view their professional details and expertise
          </p>
        </div>

        <div className="relative py-8">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevTrainer}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 lg:-left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200"
            aria-label="Previous trainers"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={handleNextTrainer}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 lg:-right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200"
            aria-label="Next trainers"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Trainers Grid */}
          <div className="flex justify-center gap-6 md:gap-8 py-8 px-12">
            {visibleTrainers.map((trainer, index) => (
              <div
                key={`${trainer.id}-${index}`}
                onClick={() => handleTrainerClick(trainer)}
                className="cursor-pointer group flex-shrink-0"
              >
                <div className="relative w-64 md:w-72">
                  {/* Square Image Container */}
                  <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto mb-4">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={trainer.image}
                        alt={trainer.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 256px, 288px"
                        priority={index === 0}
                      />
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <span className="text-white font-semibold text-sm">View Details →</span>
                      </div>
                    </div>
                    
                    {/* Experience badge */}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="flex items-center gap-1 bg-red-700 text-white px-4 py-1.5 rounded-full shadow-lg">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-semibold">
                          {trainer.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center px-4 pt-6">
                    <h3 className="font-bold text-lg mb-1 text-gray-900">
                      {trainer.name}
                    </h3>
                    <p className="text-sm font-medium text-blue-900">
                      {trainer.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {trainers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Popup Modal */}
        {isPopupOpen && selectedTrainer && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closePopup}
          >
            <div 
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 md:h-56 bg-gradient-to-r from-blue-900 to-gray-900">
                <button
                  onClick={closePopup}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Square Image in Popup */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                      <Image
                        src={selectedTrainer.image}
                        alt={selectedTrainer.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 128px, 160px"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-6 md:px-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                    {selectedTrainer.name}
                  </h2>
                  <div className="text-lg font-semibold mb-3 text-blue-900">
                    {selectedTrainer.role}
                  </div>
                  <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedTrainer.experience}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{selectedTrainer.studentsTrained} trained</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-700" />
                    <h3 className="font-semibold text-gray-900">Expertise</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedTrainer.expertise}
                  </p>
                </div>

                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-red-700" />
                    <h4 className="font-semibold text-gray-900">Training Style</h4>
                  </div>
                  <p className="text-gray-600">{selectedTrainer.trainingStyle}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-red-700" />
                    <h3 className="font-semibold text-gray-900">Certifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTrainer.certifications.map((cert, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white"
                      >
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-900" />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevPopup}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors"
                  >
                    ← Previous Trainer
                  </button>
                  
                  <div className="flex gap-2">
                    {trainers.map((trainer) => (
                      <button
                        key={trainer.id}
                        onClick={() => setSelectedTrainer(trainer)}
                        className={`h-2 rounded-full transition-all ${
                          selectedTrainer.id === trainer.id
                            ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Select ${trainer.name}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextPopup}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors"
                  >
                    Next Trainer →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}