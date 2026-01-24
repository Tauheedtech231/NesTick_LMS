'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MapPin, GraduationCap, Briefcase, Globe, CheckCircle } from 'lucide-react';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);

  // Auto slide function
  const autoSlide = () => {
    setCurrent(prev => {
      const next = (prev + 1) % tutors.length;
      return next;
    });
  };

  // Start continuous auto play with faster speed
  useEffect(() => {
    const speed = window.innerWidth < 768 ? 2000 : 2500;
    const interval = setInterval(autoSlide, speed);
    setIntervalRef(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Update selected tutor when current changes
  useEffect(() => {
    setSelectedTutor(tutors[current]);
  }, [current]);

  // Handle tutor click
  const handleTutorClick = (tutor: typeof tutors[0]) => {
    setSelectedTutor(tutor);
    setCurrent(tutors.findIndex(t => t.id === tutor.id));
    setShowInfoPopup(true);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  // Close info popup
  const closeInfoPopup = () => {
    setShowInfoPopup(false);
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

      {/* Continuous Slider */}
      <div className="relative w-full overflow-hidden py-8">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
        
        {/* Infinite Slider Track */}
        <motion.div
          className="flex gap-6 md:gap-8"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              duration: window.innerWidth < 768 ? 15 : 20,
              ease: "linear"
            }
          }}
        >
          {[...tutors, ...tutors].map((tutor, idx) => (
            <motion.div
              key={`${tutor.id}-${idx}`}
              className="flex-shrink-0 cursor-pointer group"
              whileHover={{ scale: 1.03 }}
              onClick={() => handleTutorClick(tutor)}
            >
              <div className="relative w-60 h-60 md:w-72 md:h-72">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6B21A8]/10 to-[#DA2F6B]/10 rounded-full blur-lg group-hover:blur-xl transition-all duration-500" />
                
                {/* Tutor Image */}
                <div className="relative w-full h-full rounded-full overflow-hidden border border-gray-800 group-hover:border-[#DA2F6B] transition-all duration-300">
                  <Image
                    src={tutor.image}
                    alt={tutor.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">{tutor.name}</h3>
                    <p className="text-[#DA2F6B] text-xs">{tutor.role}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-gray-300 text-xs">{tutor.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center items-center gap-3 mb-8">
        {tutors.map((tutor, index) => (
          <button
            key={tutor.id}
            onClick={() => goToSlide(index)}
            className="group relative"
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current 
                ? 'bg-[#DA2F6B] scale-125' 
                : 'bg-gray-700 group-hover:bg-gray-600'
            }`} />
            {/* Show name on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {tutor.name.split(' ')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Info Popup - Clean Design without cards/shadows */}
      <AnimatePresence>
        {showInfoPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={closeInfoPopup}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Logo and Name */}
              <div className="sticky top-0 bg-black p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B21A8] to-[#DA2F6B] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">L</span>
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

              {/* Content - No cards, no shadows */}
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Image */}
                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden">
                      <Image
                        src={selectedTutor.image}
                        alt={selectedTutor.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Quick Info - No boxes */}
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

                {/* Tutor List in Popup */}
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
                          selectedTutor.id === tutor.id ? 'border border-[#DA2F6B]' : 'border border-gray-700'
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

                {/* Dots in Popup */}
                <div className="mt-6 flex justify-center gap-2">
                  {tutors.map((tutor, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedTutor(tutors[index]);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        selectedTutor.id === tutor.id
                          ? 'bg-[#DA2F6B]'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}