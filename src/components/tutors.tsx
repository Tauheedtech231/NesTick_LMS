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
  id: string;
  name: string;
  role: string;
  expertise: string;
  experience: string;
  image_url: string;
  certifications: string[];
  students_trained: string;  // Changed from studentsTrained
  training_style: string;     // Changed from trainingStyle
  display_order: number;
  is_active: boolean | number;
}

interface FacultySettings {
  badge_text: string;
  heading_prefix: string;
  heading_highlight: string;
  description: string;
}

// Shimmer Component
const Shimmer = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
  );
};

export default function TrainersSlider() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [settings, setSettings] = useState<FacultySettings>({
    badge_text: 'Expert Faculty',
    heading_prefix: 'Meet Our',
    heading_highlight: 'Trainers',
    description: 'Click on any trainer to view their professional details and expertise'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subHeadingRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trainers
        const trainersResponse = await fetch('/api/management/trainers');
        const trainersData = await trainersResponse.json();
        console.log('Trainers data:', trainersData); // Debug log
        if (trainersData.success) {
          setTrainers(trainersData.data);
        }

        // Fetch settings
        const settingsResponse = await fetch('/api/management/trainers/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (badgeRef.current) {
          gsap.fromTo(badgeRef.current,
            { opacity: 0, y: 20 },
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

        if (headingRef.current) {
          gsap.fromTo(headingRef.current,
            { x: -80, opacity: 0 },
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

        if (subHeadingRef.current) {
          gsap.fromTo(subHeadingRef.current,
            { x: -60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              delay: 0.2,
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
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading]);

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
    const currentIdx = trainers.findIndex(t => t.id === selectedTrainer.id);
    const prevIndex = currentIdx === 0 ? trainers.length - 1 : currentIdx - 1;
    setSelectedTrainer(trainers[prevIndex]);
  };

  const handleNextPopup = () => {
    if (!selectedTrainer) return;
    const currentIdx = trainers.findIndex(t => t.id === selectedTrainer.id);
    const nextIndex = currentIdx === trainers.length - 1 ? 0 : currentIdx + 1;
    setSelectedTrainer(trainers[nextIndex]);
  };

  const getVisibleTrainers = () => {
    if (typeof window === 'undefined' || trainers.length === 0) {
      return [];
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
    if (isLoading || trainers.length === 0) return;
    
    setVisibleTrainers(getVisibleTrainers());

    const handleResize = () => {
      setVisibleTrainers(getVisibleTrainers());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, isLoading, trainers]);

  // Get active trainers (is_active = true)
 // Get active trainers - FIXED (accepts both 1 and true)
const activeTrainers = trainers.filter(t => t.is_active === 1 || t.is_active === true);

  // Loading skeleton with Shimmer
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4 relative overflow-hidden">
        <Shimmer />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-12 text-center">
            <div className="inline-block px-4 py-2 rounded-full mb-4 bg-gray-200 animate-pulse w-32 h-8"></div>
            <div className="h-12 bg-gray-200 animate-pulse w-96 mb-4 rounded mx-auto"></div>
            <div className="h-6 bg-gray-200 animate-pulse w-64 rounded mx-auto"></div>
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

  if (activeTrainers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h2 className="text-2xl font-semibold text-gray-700">No Trainers Available</h2>
          <p className="text-gray-500 mt-2">Check back later for our expert faculty members.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div ref={badgeRef} className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#1E3A8A' }}>
            <span className="text-sm font-semibold text-white">
              {settings.badge_text}
            </span>
          </div>
          
          <h1 ref={headingRef} className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {settings.heading_prefix} <span className="text-[#1E3A8A]">{settings.heading_highlight}</span>
          </h1>
          
          <p ref={subHeadingRef} className="text-base text-gray-600 max-w-2xl mx-auto">
            {settings.description}
          </p>
        </div>

        <div className="relative py-8">
          {/* Navigation Buttons */}
          {activeTrainers.length > 1 && (
            <>
              <button
                onClick={handlePrevTrainer}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 lg:-left-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200 cursor-pointer"
                aria-label="Previous trainers"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={handleNextTrainer}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 lg:-right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 border border-gray-200 cursor-pointer"
                aria-label="Next trainers"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

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
                        src={trainer.image_url}
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
                      <div className="flex items-center gap-1 bg-[#1E3A8A] text-white px-4 py-1.5 rounded-full shadow-lg">
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
                    <p className="text-sm font-medium text-[#1E3A8A]">
                      {trainer.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          {activeTrainers.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {activeTrainers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    index === currentIndex
                      ? 'w-8 bg-[#1E3A8A]'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
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
              <div className="relative h-48 md:h-56 bg-gradient-to-r from-[#1E3A8A] to-[#0B1C3D]">
                <button
                  onClick={closePopup}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20 cursor-pointer"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Square Image in Popup */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                      <Image
                        src={selectedTrainer.image_url}
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
                  <div className="text-lg font-semibold mb-3 text-[#1E3A8A]">
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
                      <span>{selectedTrainer.students_trained} trained</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#1E3A8A]" />
                    <h3 className="font-semibold text-gray-900">Expertise</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedTrainer.expertise}
                  </p>
                </div>

                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                    <h4 className="font-semibold text-gray-900">Training Style</h4>
                  </div>
                  <p className="text-gray-600">{selectedTrainer.training_style}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-[#1E3A8A]" />
                    <h3 className="font-semibold text-gray-900">Certifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTrainer.certifications && selectedTrainer.certifications.map((cert, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white"
                      >
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#1E3A8A]" />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevPopup}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                  >
                    ← Previous Trainer
                  </button>
                  
                  <div className="flex gap-2">
                    {activeTrainers.map((trainer) => (
                      <button
                        key={trainer.id}
                        onClick={() => setSelectedTrainer(trainer)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          selectedTrainer.id === trainer.id
                            ? 'w-8 bg-[#1E3A8A]'
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Select ${trainer.name}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextPopup}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] transition-colors cursor-pointer"
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