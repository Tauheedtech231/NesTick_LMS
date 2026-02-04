'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Award, Briefcase, Clock, CheckCircle } from 'lucide-react';

const trainers = [
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
  {
    id: 5,
    name: 'Ayesha Khan',
    role: 'Safety Compliance Officer',
    expertise: 'Workplace safety regulations, compliance training, and audit preparation',
    experience: '7+ years',
    image: 'https://images.unsplash.com/photo-1581579431539-9a45e56b61db?q=80&w=1376&auto=format&fit=crop&w=400&h=400',
    certifications: ['OSHA Certified', 'Safety Management Expert', 'Compliance Auditor', 'Incident Investigation Specialist'],
    studentsTrained: '950+',
    trainingStyle: 'Audit-focused with documentation skills'
  },
  {
    id: 6,
    name: 'Muhammad Shahid',
    role: 'Industrial Welding Instructor',
    expertise: 'Advanced welding techniques for industrial applications and fabrication',
    experience: '11+ years',
    image: 'https://images.unsplash.com/photo-1569510914741-59c7c54c2c8f?q=80&w=1374&auto=format&fit=crop&w=400&h=400',
    certifications: ['Advanced Welding Instructor', 'Fabrication Specialist', 'Quality Control Expert', 'Metallurgy Basics'],
    studentsTrained: '890+',
    trainingStyle: 'Advanced techniques with quality assurance'
  },
];

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933'
};

export default function TrainersSlider() {
  const [selectedTrainer, setSelectedTrainer] = useState<typeof trainers[0] | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const keyframes = [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-50%)' }
    ];

    const options: KeyframeAnimationOptions = {
      duration: 40000,
      iterations: Infinity,
      easing: 'linear'
    };

    animationRef.current = slider.animate(keyframes, options);

    const handleMouseEnter = () => {
      animationRef.current?.pause();
    };

    const handleMouseLeave = () => {
      animationRef.current?.play();
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      animationRef.current?.cancel();
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleTrainerClick = (trainer: typeof trainers[0]) => {
    setSelectedTrainer(trainer);
    setIsPopupOpen(true);
    animationRef.current?.pause();
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setTimeout(() => {
      animationRef.current?.play();
    }, 300);
  };

  const handlePrevTrainer = () => {
    if (!selectedTrainer) return;
    const currentIndex = trainers.findIndex(t => t.id === selectedTrainer.id);
    const prevIndex = currentIndex === 0 ? trainers.length - 1 : currentIndex - 1;
    setSelectedTrainer(trainers[prevIndex]);
  };

  const handleNextTrainer = () => {
    if (!selectedTrainer) return;
    const currentIndex = trainers.findIndex(t => t.id === selectedTrainer.id);
    const nextIndex = currentIndex === trainers.length - 1 ? 0 : currentIndex + 1;
    setSelectedTrainer(trainers[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-red-50">
            <span className="text-sm font-semibold text-red-700">
              Expert Faculty
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Meet Our <span className="text-red-700">Trainers</span>
          </h1>
          
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Click on any trainer to view their professional details and expertise
          </p>
        </div>

        <div className="relative overflow-hidden py-8">
          <div 
            ref={sliderRef}
            className="flex gap-6 md:gap-8 py-8"
          >
            {[...trainers, ...trainers].map((trainer, index) => (
              <div
                key={`${trainer.id}-${index}`}
                onClick={() => handleTrainerClick(trainer)}
                className="flex-shrink-0 cursor-pointer group"
              >
                <div className="relative w-64 md:w-72">
                  <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto mb-4">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={trainer.image}
                        alt={trainer.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 256px, 288px"
                      />
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <span className="text-white font-semibold text-sm">View Details →</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center px-4">
                    <h3 className="font-bold text-lg mb-1 text-gray-900">
                      {trainer.name}
                    </h3>
                    <p className="text-sm font-medium mb-2 text-blue-900">
                      {trainer.role}
                    </p>
                    <div className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{trainer.experience}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        

        {isPopupOpen && selectedTrainer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="relative h-48 md:h-56 bg-gradient-to-r from-blue-900 to-gray-900">
                <button
                  onClick={closePopup}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative w-32 h-32 md:w-40 md:h-40">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                      <Image
                        src={selectedTrainer.image}
                        alt={selectedTrainer.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 128px, 160px"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-6 md:px-8">
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

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-700" />
                    <h3 className="font-semibold text-gray-900">Expertise</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedTrainer.expertise}
                  </p>
                </div>

                <div className="mb-8 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-red-700" />
                    <h4 className="font-semibold text-gray-900">Training Style</h4>
                  </div>
                  <p className="text-gray-600">{selectedTrainer.trainingStyle}</p>
                </div>

                <div className="mb-8">
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

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevTrainer}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors"
                  >
                    ← Previous Trainer
                  </button>
                  
                  <div className="flex gap-2">
                    {trainers.map((trainer) => (
                      <button
                        key={trainer.id}
                        onClick={() => setSelectedTrainer(trainer)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedTrainer.id === trainer.id
                            ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNextTrainer}
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