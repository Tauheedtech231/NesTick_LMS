'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, BookOpen, Users, Award, Play, Pause, Mail, Calendar, Clock } from 'lucide-react';

const tutors = [
  {
    id: 1,
    name: 'Dr. Edward Bowman',
    role: 'Senior Safety Consultant',
    courses: 12,
    rating: 4.9,
    students: 2400,
    experience: '8+ years',
    specialization: 'Workplace Safety',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1374&auto=format&fit=crop',
    bio: 'Expert in workplace safety with extensive experience in industrial safety management and risk assessment.',
    availability: 'Mon, Wed, Fri',
    responseTime: '2 hours',
    languages: ['English', 'Spanish']
  },
  {
    id: 2,
    name: 'Prof. Denise Wood',
    role: 'Industrial Hygiene Expert',
    courses: 8,
    rating: 4.7,
    students: 1800,
    experience: '6+ years',
    specialization: 'Health & Safety',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1376&auto=format&fit=crop',
    bio: 'Specialized in industrial hygiene and occupational health with a focus on preventive measures.',
    availability: 'Tue, Thu, Sat',
    responseTime: '1 hour',
    languages: ['English', 'French']
  },
  {
    id: 3,
    name: 'Dr. Samuel Lee',
    role: 'Risk Assessment Director',
    courses: 10,
    rating: 4.8,
    students: 2100,
    experience: '7+ years',
    specialization: 'Risk Management',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop',
    bio: 'Focused on risk management strategies and safety protocol development for various industries.',
    availability: 'Mon-Fri',
    responseTime: '3 hours',
    languages: ['English', 'Mandarin']
  },
  {
    id: 4,
    name: 'Dr. Olivia Harris',
    role: 'Fire Safety Professor',
    courses: 15,
    rating: 5.0,
    students: 3200,
    experience: '12+ years',
    specialization: 'Fire Safety Engineering',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1374&auto=format&fit=crop',
    bio: 'Renowned fire safety expert with academic and practical experience in fire prevention engineering.',
    availability: 'Weekdays',
    responseTime: '4 hours',
    languages: ['English', 'German']
  },
  {
    id: 5,
    name: 'Michael Chen',
    role: 'Construction Safety Manager',
    courses: 9,
    rating: 4.8,
    students: 1900,
    experience: '5+ years',
    specialization: 'Construction Safety',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop',
    bio: 'Construction safety specialist with hands-on experience in large-scale industrial projects.',
    availability: 'Mon, Tue, Thu',
    responseTime: '2 hours',
    languages: ['English', 'Cantonese']
  },
];

export default function TutorSlider() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(tutors[0]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % tutors.length);
    setSelectedTutor(tutors[(current + 1) % tutors.length]);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + tutors.length) % tutors.length);
    setSelectedTutor(tutors[(current - 1 + tutors.length) % tutors.length]);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
    setSelectedTutor(tutors[index]);
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % tutors.length;
        setSelectedTutor(tutors[next]);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [current, isAutoPlaying]);

  // Update selected tutor when current changes
  useEffect(() => {
    setSelectedTutor(tutors[current]);
  }, [current]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleBookSession = () => {
    setShowBookingModal(true);
  };

  const handleViewProfile = () => {
    alert(`Navigating to ${selectedTutor.name}'s profile page`);
  };

  const handleContactTutor = () => {
    alert(`Opening contact form for ${selectedTutor.name}`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < Math.floor(rating) 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div 
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Meet Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Expert Tutors</span>
            </motion.h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              Learn from industry professionals with years of experience and proven teaching methodologies
            </p>
            
            {/* Auto-play control */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAutoPlay}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause size={16} />
                    <span>Pause Auto-play</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Play Auto-play</span>
                  </>
                )}
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Slide {current + 1} of {tutors.length}
              </div>
            </div>
          </div>

          <div 
            className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left: Animated Tutor Image */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative h-72 md:h-80 lg:h-96 flex justify-center items-center">
                {/* Background Decoration */}
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-70 animate-pulse delay-1000"></div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTutor.id}
                    initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 cursor-pointer group"
                    onClick={handleViewProfile}
                  >
                    {/* Main Image */}
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-800 group-hover:border-blue-400 transition-all duration-300">
                      <Image 
                        src={selectedTutor.image} 
                        alt={selectedTutor.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        priority
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-white text-center">
                          <p className="font-semibold text-sm">View Profile</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Experience Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg z-10">
                      <span className="text-xs font-bold">{selectedTutor.experience}</span>
                    </div>
                    
                    {/* Specialization Tag */}
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg border z-10">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {selectedTutor.specialization}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {tutors.map((tutor, index) => (
                  <button
                    key={tutor.id}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === current 
                        ? 'bg-blue-600 scale-125' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to tutor ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Tutor Details */}
            <div className="w-full lg:w-1/2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTutor.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
                >
                  {/* Navigation Arrows */}
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={prevSlide}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg"
                      aria-label="Previous tutor"
                    >
                      <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{current + 1}</span>
                      <span>of</span>
                      <span className="font-medium">{tutors.length}</span>
                    </div>
                    
                    <button
                      onClick={nextSlide}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-lg"
                      aria-label="Next tutor"
                    >
                      <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Tutor Information */}
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedTutor.name}
                    </h2>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg mb-3">
                      {selectedTutor.role}
                    </p>

                    {/* Bio */}
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                      {selectedTutor.bio}
                    </p>

                    {/* Rating and Stats */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        {renderStars(selectedTutor.rating)}
                        <span className="text-base font-semibold text-gray-900 dark:text-white">
                          {selectedTutor.rating}/5
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>Avg. response: {selectedTutor.responseTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-gray-900 dark:text-white">{selectedTutor.courses}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Courses</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-gray-900 dark:text-white">{selectedTutor.students.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Students</div>
                      </div>
                      <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                        <div className="text-base font-bold text-gray-900 dark:text-white">{selectedTutor.rating}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Availability</h4>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {selectedTutor.availability}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Languages</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedTutor.languages.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBookSession}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Calendar size={16} />
                        Book Session
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContactTutor}
                        className="flex-1 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Mail size={16} />
                        Contact
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Tutor List for Mobile */}
          <div className="mt-6 lg:hidden">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center">
              Browse All Tutors
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              {tutors.map((tutor, index) => (
                <button
                  key={tutor.id}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                    index === current
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mb-1">
                    <Image
                      src={tutor.image}
                      alt={tutor.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white text-center">
                    {tutor.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Book Session with {selectedTutor.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                Select your preferred date and time for a one-on-one session.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm">
                    <option>9:00 AM - 10:00 AM</option>
                    <option>10:00 AM - 11:00 AM</option>
                    <option>2:00 PM - 3:00 PM</option>
                    <option>4:00 PM - 5:00 PM</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      alert('Session booked successfully!');
                    }}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    Confirm Booking
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