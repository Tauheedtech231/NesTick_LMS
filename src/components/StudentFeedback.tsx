"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: number;
  name: string;
  role: string;
  image: string;
  feedback: string;
}

const students: Student[] = [
  {
    id: 1,
    name: "Ahmed Raza",
    role: "Site Engineer",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80",
    feedback:
      "The construction management course gave me practical insights that I apply daily on site. The project planning modules were exceptional.",
  },
  {
    id: 2,
    name: "Fatima Khalid",
    role: "Civil Engineer",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
    feedback:
      "Learning about modern construction techniques and safety standards through this platform helped me advance in my career.",
  },
  {
    id: 3,
    name: "Usman Chaudhry",
    role: "Project Manager",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
    feedback:
      "The structural analysis courses are top-notch. I've implemented many concepts in my ongoing infrastructure projects.",
  },
  {
    id: 4,
    name: "Sana Tariq",
    role: "Architect",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
    feedback:
      "The BIM and 3D modeling courses transformed my design workflow. Highly recommended for construction professionals.",
  },
];

export default function StudentFeedback() {
  const [selected, setSelected] = useState<Student | null>(null);
  const [mounted, setMounted] = useState(false);
  const [circleSize, setCircleSize] = useState(500);

  useEffect(() => {
    setMounted(true);
    
    const calculateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      if (vw >= 1024) {
        const minSize = Math.min(vw * 0.45, vh * 0.7, 700);
        setCircleSize(minSize);
      } else {
        const minSize = Math.min(vw * 0.8, vh * 0.4, 450);
        setCircleSize(minSize);
      }
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, []);

  const brandColors = {
    darkNavy: '#0B1C3D',
    darkRoyalBlue: '#1E3A8A',
    deepRed: '#B11217',
    teal: '#14B8A6',
    lightGrey: '#F4F6F8',
    softGrey: '#E5E7EB',
  };

  if (!mounted) return null;

  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  
  const ringSizes = {
    large: isDesktop ? circleSize * 1.3 : circleSize * 1.2,
    medium: circleSize,
    small: isDesktop ? circleSize * 0.75 : circleSize * 0.7,
    orbit: isDesktop ? circleSize * 0.75 : circleSize * 0.7
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-start lg:justify-center bg-white text-gray-900 py-12 lg:py-8 overflow-hidden">
      {/* Full White Background - No pattern */}
      <div className="absolute inset-0 w-full h-full bg-white"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Center Content */}
        <div className="text-center max-w-2xl px-4 mb-8 lg:mb-12 mt-8 lg:mt-0">
          <div className="inline-block px-4 py-2 rounded-full mb-4 lg:mb-6 bg-[#F4F6F8] border border-[#E5E7EB]">
            <span className="text-xs lg:text-sm font-semibold text-[#B11217]">
              Industry Professionals
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl  font-bold tracking-tight text-[#0B1C3D]">
            Construction & Civil Engineering
          </h2>
          <p className="mt-3 lg:mt-4 text-sm sm:text-base lg:text-lg text-gray-600">
            Real feedback from industry professionals using our construction training platform.
          </p>
        </div>

        {/* Orbit Container */}
        <div className="relative w-full flex items-center justify-center overflow-visible min-h-[350px] sm:min-h-[400px] lg:min-h-[500px]">
          <div 
            className="relative flex items-center justify-center"
            style={{ 
              width: ringSizes.large,
              height: ringSizes.large
            }}
          >
            {/* Ring 1 - Largest - Black */}
            <div 
              className="absolute rounded-full border border-black/20"
              style={{ 
                width: ringSizes.large,
                height: ringSizes.large
              }}
            ></div>
            
            {/* Ring 2 - Middle - Black */}
            <div 
              className="absolute rounded-full border border-black/15"
              style={{ 
                width: ringSizes.medium,
                height: ringSizes.medium
              }}
            ></div>
            
            {/* Ring 3 - Smallest - Black */}
            <div 
              className="absolute rounded-full border border-black/10"
              style={{ 
                width: ringSizes.small,
                height: ringSizes.small
              }}
            ></div>
            
            {/* Rotating Orbit with Student Images */}
            <div 
              className="absolute"
              style={{ 
                width: ringSizes.orbit,
                height: ringSizes.orbit
              }}
            >
              <motion.div 
                className="relative w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                {students.map((student, index) => {
                  const angle = (index / students.length) * 360;
                  const radius = ringSizes.orbit / 2;

                  return (
                    <div
                      key={student.id}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
                        transformOrigin: '0 0',
                      }}
                    >
                      <motion.button
                        onClick={() => setSelected(student)}
                        className="relative rounded-full border-4 border-white shadow-xl hover:scale-110 transition duration-300 pointer-events-auto"
                        style={{ 
                          width: isDesktop ? Math.min(90, ringSizes.orbit * 0.2) : Math.min(70, ringSizes.orbit * 0.2),
                          height: isDesktop ? Math.min(90, ringSizes.orbit * 0.2) : Math.min(70, ringSizes.orbit * 0.2),
                          borderColor: '#000000',
                          marginLeft: isDesktop ? -45 : -35,
                          marginTop: isDesktop ? -45 : -35
                        }}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={student.image}
                          alt={student.name}
                          fill
                          className="rounded-full object-cover"
                          sizes={isDesktop ? "90px" : "70px"}
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-[#B11217] opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top gradient bar - Construction theme */}
              <div className="h-2 bg-gradient-to-r from-[#0B1C3D] via-[#1E3A8A] to-[#B11217]"></div>
              
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-[#B11217] transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8">
                {/* Profile Image */}
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#B11217] animate-pulse"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white">
                    <Image
                      src={selected.image}
                      alt={selected.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-[#0B1C3D] mb-1">
                  {selected.name}
                </h3>
                <p className="text-[#B11217] font-medium text-sm mb-4">
                  {selected.role}
                </p>

                {/* Quote icon */}
                <div className="text-4xl text-[#1E3A8A]/20 mb-2"></div>

                <p className="text-gray-700 leading-relaxed mb-6 relative">
                  {selected.feedback}
                </p>

                {/* Decorative dots - Construction theme */}
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0B1C3D]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#1E3A8A]"></div>
                  <div className="w-2 h-2 rounded-full bg-[#B11217]"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}