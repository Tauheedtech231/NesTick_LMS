"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  HiClock, 
  HiUserGroup, 
  HiAcademicCap, 
  HiCheckCircle,
  HiArrowRight,
  HiBookOpen,
  HiShieldCheck,
  HiOutlineFire as HiWrench,
  HiFire,
  HiStar,
  HiChartBar
} from "react-icons/hi";
import Link from "next/link";

// Brand Colors
const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#1FB6CB'
};

// Course Data with Unsplash images
const courses = [
  {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    category: 'Technical Training',
    description: 'Master industrial pipe fitting techniques with hands-on training on cutting, threading, and installation following international standards.',
    duration: '8 Weeks',
    students: 'Max 20 per batch',
    level: 'Beginner to Advanced',
    highlights: [
      'Learn pipe cutting, threading, and installation',
      'Blueprint reading and interpretation',
      'Pipe system design and layout',
      'Safety protocols and standards',
      'Hands-on workshop training',
      'Industry certification preparation'
    ],
    price: 'PKR 25,000',
    originalPrice: 'PKR 30,000',
    savings: 'Save PKR 5,000',
    icon: HiWrench,
    color: BRAND_COLORS.teal,
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    featured: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    category: 'Safety Training',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    duration: '6 Weeks',
    students: 'Max 15 per batch',
    level: 'Intermediate',
    highlights: [
      'OSHA standards and regulations',
      'Site inspection methodologies',
      'Risk assessment techniques',
      'Safety documentation',
      'Emergency response planning',
      'Certification exam preparation'
    ],
    price: 'PKR 30,000',
    originalPrice: 'PKR 35,000',
    savings: 'Save PKR 5,000',
    icon: HiShieldCheck,
    color: BRAND_COLORS.darkRoyalBlue,
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    featured: true,
    rating: 4.9,
    reviews: 89
  },
  {
    id: 'welding',
    title: 'Professional Welding',
    category: 'Technical Training',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    duration: '10 Weeks',
    students: 'Max 12 per batch',
    level: 'Beginner to Professional',
    highlights: [
      'MIG, TIG, and Arc welding techniques',
      'Metal identification and preparation',
      'Weld quality inspection',
      'Safety equipment usage',
      'Industry-standard certification',
      'Portfolio development'
    ],
    price: 'PKR 35,000',
    originalPrice: 'PKR 40,000',
    savings: 'Save PKR 5,000',
    icon: HiFire,
    color: BRAND_COLORS.deepRed,
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    featured: true,
    rating: 4.7,
    reviews: 156
  }
];

export default function CoursesPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: `${BRAND_COLORS.darkRoyalBlue}15` }}>
            <HiStar className="w-4 h-4 mr-2" style={{ color: BRAND_COLORS.darkRoyalBlue }} />
            <span className="text-sm font-semibold" style={{ color: BRAND_COLORS.darkRoyalBlue }}>
              Industry-Focused Training
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
            Technical & Safety Training Programs
          </h1>
          
          <p className="text-lg max-w-3xl mx-auto mb-8" style={{ color: BRAND_COLORS.darkGrey }}>
            Mansol Hab School of Skills Development offers industry-focused technical and safety training programs 
            designed to meet international standards.
          </p>

        <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4 sm:gap-6 mb-12">
  {/* Item 1 */}
  <div className="w-full flex justify-center sm:w-auto">
    <div className="flex items-center gap-2 w-64">
      <HiCheckCircle className="w-5 h-5 shrink-0" style={{ color: BRAND_COLORS.teal }} />
      <span className="font-medium text-center">
        International Standards
      </span>
    </div>
  </div>

  {/* Item 2 */}
  <div className="w-full flex justify-center sm:w-auto">
    <div className="flex items-center gap-2 w-64">
      <HiCheckCircle className="w-5 h-5 shrink-0" style={{ color: BRAND_COLORS.teal }} />
      <span className="font-medium text-center">
        Hands-on Training
      </span>
    </div>
  </div>

  {/* Item 3 */}
  <div className="w-full flex justify-center sm:w-auto">
    <div className="flex items-center gap-2 w-64">
      <HiCheckCircle className="w-5 h-5 shrink-0" style={{ color: BRAND_COLORS.teal }} />
      <span className="font-medium text-center">
        Industry Certification
      </span>
    </div>
  </div>
</div>

        </motion.div>

        {/* Courses Grid - Fixed Height Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {courses.map((course, index) => (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setHoveredCard(course.id)}
      onMouseLeave={() => setHoveredCard(null)}
      className="relative group flex flex-col"
    >
      {/* Featured Badge */}
      {course.featured && (
        <div className="absolute top-4 left-4 z-10">
          <div
            className="px-3 py-1 rounded-full flex items-center"
            style={{
              backgroundColor: BRAND_COLORS.deepRed,
              color: BRAND_COLORS.white,
            }}
          >
            <HiStar className="w-3 h-3 mr-1" />
            <span className="text-xs font-semibold">Featured</span>
          </div>
        </div>
      )}

      {/* Course Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-gray-100 transition-all duration-300 group-hover:shadow-2xl flex flex-col">
        
        {/* ✅ UPDATED IMAGE SECTION */}
        <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 rounded-full backdrop-blur-sm bg-white/90">
              <span
                className="text-xs font-semibold"
                style={{ color: course.color }}
              >
                {course.category}
              </span>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Title & Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: BRAND_COLORS.darkNavy }}
              >
                {course.title}
              </h3>

              <div className="flex items-center mb-3">
                <div className="flex items-center mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(course.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: BRAND_COLORS.darkGrey }}
                >
                  {course.rating} ({course.reviews} reviews)
                </span>
              </div>
            </div>

            <course.icon
              className="w-8 h-8 flex-shrink-0 ml-3"
              style={{ color: course.color }}
            />
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center">
              <HiClock
                className="w-3 h-3 mr-1"
                style={{ color: BRAND_COLORS.darkRoyalBlue }}
              />
              <span className="text-xs text-gray-600">
                {course.duration}
              </span>
            </div>

            <div className="flex items-center">
              <HiUserGroup
                className="w-3 h-3 mr-1"
                style={{ color: BRAND_COLORS.darkRoyalBlue }}
              />
              <span className="text-xs text-gray-600">
                {course.students}
              </span>
            </div>

            <div className="flex items-center">
              <HiAcademicCap
                className="w-3 h-3 mr-1"
                style={{ color: BRAND_COLORS.darkRoyalBlue }}
              />
              <span className="text-xs text-gray-600">
                {course.level}
              </span>
            </div>

            <div className="flex items-center">
              <HiBookOpen
                className="w-3 h-3 mr-1"
                style={{ color: BRAND_COLORS.darkRoyalBlue }}
              />
              <span className="text-xs text-gray-600">
                Certification
              </span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center">
                  <span
                    className="text-xl font-bold"
                    style={{ color: BRAND_COLORS.deepRed }}
                  >
                    {course.price}
                  </span>

                  {course.originalPrice && (
                    <span className="text-xs text-gray-500 line-through ml-2">
                      {course.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`/courses/${course.id}`}
              className="block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
              style={{
                backgroundColor:
                  hoveredCard === course.id
                    ? BRAND_COLORS.darkRoyalBlue
                    : BRAND_COLORS.deepRed,
                color: BRAND_COLORS.white,
              }}
            >
              <span className="flex items-center justify-center text-sm">
                View Course Details
                <HiArrowRight className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  ))}
</div>


        {/* Info Section */}
       <motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.6 }}
  className="mt-16 rounded-2xl shadow-lg p-8"
  style={{ 
    backgroundColor: BRAND_COLORS.darkNavy,
    border: `1px solid ${BRAND_COLORS.darkRoyalBlue}`
  }}
>
  <div className="text-center max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold mb-6 text-white">
      What Makes Mansol Hab School Different
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Certificates */}
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Recognized & Practical Certificates
        </h3>
        <p className="text-gray-300">
          Our certificates reflect real skills, valued by employers in construction, safety, and technical industries.
        </p>
      </div>

      {/* Trainers */}
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Experienced Trainers
        </h3>
        <p className="text-gray-300">
          Learn hands-on skills from industry professionals who guide you through practical challenges, not just theory.
        </p>
      </div>

      {/* Career Support */}
      <div className="text-center p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Career Guidance & Support
        </h3>
        <p className="text-gray-300">
          We help students explore career paths, prepare for job opportunities, and succeed in technical fields.
        </p>
      </div>

    </div>
  </div>
</motion.div>
      </div>
    </div>
  );
}