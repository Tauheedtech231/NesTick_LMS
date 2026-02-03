// app/courses/components/CourseCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string; // Changed from specific types to string
  category: string;
  fees: number;
  image: string;
}

export default function CourseCard({
  id,
  title,
  description,
  duration,
  level,
  category,
  fees,
  image,
}: CourseCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleEnrollClick = () => {
    // Store selected course in localStorage
    const courseData = {
      id,
      title,
      description,
      duration,
      level,
      category,
      fees,
      image,
    };
    localStorage.setItem('selectedCourse', JSON.stringify(courseData));
    
    // Navigate to course detail page
    router.push(`/courses/${id}`);
  };

  // Helper function to get badge color based on level
  const getLevelBadgeColor = () => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('matric')) {
      return 'bg-green-100 text-green-800';
    }
    if (levelLower.includes('intermediate')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 
                 transition-all duration-300 hover:shadow-2xl hover:border-blue-200 
                 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Course Image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <Image
          src={`/courses/${image}`}
          alt={title}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-[#1E3A8A] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
        {/* Level Badge */}
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getLevelBadgeColor()}`}>
            {level}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2 h-12">
          {description}
        </p>

        {/* Course Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Duration */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">Duration</div>
              <div className="text-sm font-semibold text-gray-900">{duration}</div>
            </div>
          </div>

          {/* Fees */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">Fees</div>
              <div className="text-sm font-semibold text-gray-900">PKR {fees.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Enroll Button */}
        <button
          onClick={handleEnrollClick}
          className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold 
                   py-3 px-4 rounded-lg transition-all duration-300 
                   hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}