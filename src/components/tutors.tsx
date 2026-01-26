'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MapPin, GraduationCap, Briefcase, Globe, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const tutors = [
  {
    id: 1,
    name: 'Dr. Edward Bowman',
    role: 'Senior Safety Consultant',
    specialization: 'Workplace Safety',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop',
    bio: 'Expert in workplace safety with extensive experience in industrial safety management and risk assessment. Over 8 years of professional training experience.',
    experience: '8+ years',
    responseTime: '2 hours',
    languages: ['English', 'Spanish'],
    location: 'New York, USA',
    education: 'PhD in Safety Engineering',
    certifications: ['OSHA Certified', 'ISO 45001 Lead Auditor', 'Certified Safety Professional'],
    expertise: ['Risk Assessment', 'Safety Management Systems', 'Industrial Safety']
  },
  {
    id: 2,
    name: 'Prof. Denise Wood',
    role: 'Industrial Hygiene Expert',
    specialization: 'Health & Safety',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376&auto=format&fit=crop',
    bio: 'Specialized in industrial hygiene and occupational health with a focus on preventive measures. Trained over 1800 professionals globally.',
    experience: '6+ years',
    responseTime: '1 hour',
    languages: ['English', 'French'],
    location: 'London, UK',
    education: 'MSc in Occupational Health',
    certifications: ['CIH Certified', 'NEBOSH Diploma', 'Occupational Hygienist'],
    expertise: ['Industrial Hygiene', 'Chemical Safety', 'Health Risk Assessment']
  },
  {
    id: 3,
    name: 'Dr. Samuel Lee',
    role: 'Risk Assessment Director',
    specialization: 'Risk Management',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop',
    bio: 'Focused on risk management strategies and safety protocol development for various industries. Expert in implementing safety standards.',
    experience: '7+ years',
    responseTime: '3 hours',
    languages: ['English', 'Mandarin'],
    location: 'Singapore',
    education: 'PhD in Risk Management',
    certifications: ['CRSP Certified', 'Project Management Professional', 'Risk Manager'],
    expertise: ['Risk Analysis', 'Safety Audits', 'Compliance Management']
  },
  {
    id: 4,
    name: 'Dr. Olivia Harris',
    role: 'Fire Safety Professor',
    specialization: 'Fire Safety Engineering',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1374&auto=format&fit=crop',
    bio: 'Renowned fire safety expert with academic and practical experience in fire prevention engineering. Published researcher and industry consultant.',
    experience: '12+ years',
    responseTime: '4 hours',
    languages: ['English', 'German'],
    location: 'Berlin, Germany',
    education: 'PhD in Fire Safety Engineering',
    certifications: ['NFPA Certified', 'Fire Protection Specialist', 'Fire Safety Engineer'],
    expertise: ['Fire Prevention', 'Emergency Planning', 'Building Safety Codes']
  },
  {
    id: 5,
    name: 'Michael Chen',
    role: 'Construction Safety Manager',
    specialization: 'Construction Safety',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop',
    bio: 'Construction safety specialist with hands-on experience in large-scale industrial projects. Focus on practical safety implementations.',
    experience: '5+ years',
    responseTime: '2 hours',
    languages: ['English', 'Cantonese'],
    location: 'Hong Kong',
    education: 'MEng in Construction Safety',
    certifications: ['CSP Certified', 'LEED Green Associate', 'Construction Safety Officer'],
    expertise: ['Site Safety', 'Equipment Safety', 'Contractor Management']
  },
];

export default function TutorSlider() {
  const [current, setCurrent] = useState(0);
  const [selectedTutor, setSelectedTutor] = useState(tutors[0]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized smooth animation with proper restart
  useEffect(() => {
    if (sliderRef.current && !isPausedRef.current) {
      const duration = isMobile ? 15 : 20;
      
      const keyframes = [
        { transform: 'translateX(0%)' },
        { transform: 'translateX(-50%)' }
      ];

      const options: KeyframeAnimationOptions = {
        duration: duration * 1000,
        iterations: Infinity,
        easing: 'linear'
      };

      const animation = sliderRef.current.animate(keyframes, options);

      // Pause animation when mouse enters
      const handleMouseEnter = () => {
        isPausedRef.current = true;
        animation.pause();
      };

      const handleMouseLeave = () => {
        isPausedRef.current = false;
        animation.play();
      };

      sliderRef.current.addEventListener('mouseenter', handleMouseEnter);
      sliderRef.current.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        animation.cancel();
        sliderRef.current?.removeEventListener('mouseenter', handleMouseEnter);
        sliderRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isMobile, animationKey]);

  // Auto slide function for dots
  const autoSlide = () => {
    if (!isPausedRef.current) {
      setCurrent(prev => {
        const next = (prev + 1) % tutors.length;
        return next;
      });
    }
  };

  // Start auto slide for dots
  useEffect(() => {
    const interval = setInterval(autoSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle tutor click
  const handleTutorClick = (tutor: typeof tutors[0]) => {
    setSelectedTutor(tutor);
    setCurrent(tutors.findIndex(t => t.id === tutor.id));
    setShowInfoPopup(true);
    isPausedRef.current = true;
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    isPausedRef.current = true;
    setTimeout(() => {
      isPausedRef.current = false;
      setAnimationKey(prev => prev + 1);
    }, 1000);
  };

  const nextSlide = () => {
    const next = (current + 1) % tutors.length;
    goToSlide(next);
  };

  const prevSlide = () => {
    const prev = current === 0 ? tutors.length - 1 : current - 1;
    goToSlide(prev);
  };

  // Close info popup
  const closeInfoPopup = () => {
    setShowInfoPopup(false);
    isPausedRef.current = false;
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#1F2937] py-8 px-4 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
          Expert <span className="text-[#DA2F6B]">Tutors</span>
        </h1>
        <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
          Meet our industry-leading safety experts
        </p>
      </div>

      {/* Continuous Slider with CSS Animation */}
      <div className="relative w-full overflow-hidden py-8 group">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/90 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black/90 to-transparent z-10" />
        
        {/* Smooth Infinite Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-6 md:gap-8"
          key={animationKey}
        >
          {[...tutors, ...tutors].map((tutor, idx) => (
            <div
              key={`${tutor.id}-${idx}`}
              className="flex-shrink-0 cursor-pointer group relative"
              onClick={() => handleTutorClick(tutor)}
            >
              <div className="relative w-60 h-60 md:w-72 md:h-72">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6B21A8]/10 to-[#DA2F6B]/10 rounded-full blur-lg group-hover:blur-xl transition-all duration-500" />
                
                {/* Tutor Image */}
                <div className="relative w-full h-full rounded-full overflow-hidden border border-gray-800 group-hover:border-[#DA2F6B] transition-all duration-300 transform group-hover:scale-105">
                  <Image
                    src={tutor.image}
                    alt={tutor.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 240px, 288px"
                  />
                  
                  {/* Overlay with Bottom Center Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                    {/* Name and Role - Centered */}
                    <div className="text-center">
                      <h3 className="text-white font-bold text-lg md:text-xl mb-1">{tutor.name}</h3>
                      <p className="text-[#DA2F6B] text-sm md:text-base font-medium mb-2">{tutor.role}</p>
                      
                      {/* Specialization */}
                      <p className="text-gray-300 text-xs md:text-sm mb-3">{tutor.specialization}</p>
                      
                      {/* Location - Centered */}
                      <div className="flex items-center justify-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-gray-300 text-xs md:text-sm">{tutor.location}</span>
                      </div>
                      
                      {/* Experience - Centered */}
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Briefcase size={12} className="text-gray-400" />
                        <span className="text-gray-300 text-xs md:text-sm">{tutor.experience}</span>
                      </div>
                    </div>
                    
                    {/* Click Instruction */}
                    <div className="mt-4 text-center">
                      <span className="text-xs text-[#DA2F6B] font-semibold">
                        Click for details →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fixed Text Below Image */}
              <div className="mt-4 text-center">
                <h3 className="text-white font-semibold text-base mb-1">{tutor.name}</h3>
                <p className="text-[#DA2F6B] text-sm">{tutor.specialization}</p>
                <button 
                  onClick={() => handleTutorClick(tutor)}
                  className="mt-2 text-xs text-gray-400 hover:text-[#DA2F6B] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation with active indicator */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex justify-center items-center gap-3">
          {tutors.map((tutor, index) => (
            <button
              key={tutor.id}
              onClick={() => goToSlide(index)}
              className="group relative"
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current 
                  ? 'bg-[#DA2F6B] scale-125 ring-2 ring-[#DA2F6B]/30' 
                  : 'bg-gray-700 group-hover:bg-gray-600'
              }`} />
              {/* Show name on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tutor.name}
              </div>
            </button>
          ))}
        </div>
        
        {/* Current Tutor Info */}
        <div className="text-center">
          <div className="text-white font-medium text-lg">{tutors[current].name}</div>
          <div className="text-[#DA2F6B] text-sm">{tutors[current].role}</div>
        </div>
      </div>

      {/* Info Popup */}
      <AnimatePresence>
        {showInfoPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            onClick={closeInfoPopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-black p-4 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B21A8] to-[#DA2F6B] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{selectedTutor.name}</div>
                    <div className="text-[#DA2F6B] text-sm">{selectedTutor.role}</div>
                  </div>
                </div>
                <button
                  onClick={closeInfoPopup}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Image */}
                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border border-gray-700">
                      <Image
                        src={selectedTutor.image}
                        alt={selectedTutor.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>Location</span>
                        </div>
                        <div className="text-white pl-6">{selectedTutor.location}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Briefcase className="w-4 h-4" />
                          <span>Experience</span>
                        </div>
                        <div className="text-white pl-6">{selectedTutor.experience}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Globe className="w-4 h-4" />
                          <span>Languages</span>
                        </div>
                        <div className="text-white pl-6">{selectedTutor.languages.join(', ')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">Professional Bio</div>
                      <p className="text-white leading-relaxed text-sm">{selectedTutor.bio}</p>
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">Education</div>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-4 h-4 text-[#6B21A8]" />
                        <span className="text-white">{selectedTutor.education}</span>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">Specialization</div>
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-[#6B21A8]" />
                        <span className="text-white">{selectedTutor.specialization}</span>
                      </div>
                    </div>

                    {/* Expertise Areas */}
                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">Areas of Expertise</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTutor.expertise?.map((area, idx) => (
                          <div
                            key={idx}
                            className="text-white text-sm px-3 py-1.5 border border-gray-700 rounded-full"
                          >
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm">Certifications</div>
                      <div className="space-y-2">
                        {selectedTutor.certifications?.map((cert, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-[#DA2F6B]" />
                            <span className="text-white text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tutor Navigation in Popup */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <div className="text-gray-400 text-sm mb-4">All Expert Tutors</div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {tutors.map((tutor) => (
                      <button
                        key={tutor.id}
                        onClick={() => {
                          setSelectedTutor(tutor);
                        }}
                        className={`flex flex-col items-center p-2 transition-all duration-300 ${
                          selectedTutor.id === tutor.id
                            ? 'text-[#DA2F6B]'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <div className={`relative w-10 h-10 rounded-full overflow-hidden mb-1 ${
                          selectedTutor.id === tutor.id ? 'border-2 border-[#DA2F6B]' : 'border border-gray-700'
                        }`}>
                          <Image
                            src={tutor.image}
                            alt={tutor.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs">
                          {tutor.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={closeInfoPopup}
                    className="px-6 py-2 bg-[#DA2F6B] text-white rounded-lg font-medium hover:bg-[#C81E5A] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}