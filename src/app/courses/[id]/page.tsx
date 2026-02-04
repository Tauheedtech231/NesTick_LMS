"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  
  HiCheckCircle,
  HiArrowLeft,

  HiOutlineCash,
 
  HiOutlineShieldCheck,
  HiOutlineFire as HiOutlineWrench,
  
} from "react-icons/hi";
import Link from "next/link";
import { IoMdArrowDropright } from "react-icons/io";
/* eslint-disable */

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

// Course Data
const coursesData = {
  'pipe-fitter': {
    id: 'pipe-fitter',
    title: 'Pipe Fitter',
    category: 'Technical Training',
    description: 'Master industrial pipe fitting techniques with comprehensive hands-on training on cutting, threading, and installation following international standards.',
    longDescription: 'This comprehensive 8-week program covers everything from basic pipe fitting concepts to advanced industrial applications. You will learn to read blueprints, design pipe systems, and implement safety protocols according to international standards.',
    duration: '8 Weeks',
    students: 'Max 20 per batch',
    level: 'Beginner to Advanced',
    schedule: 'Monday to Friday, 9 AM - 1 PM',
    location: 'Main Campus, Karachi',
    startDate: '15th March 2024',
    highlights: [
      'Learn pipe cutting, threading, and installation',
      'Blueprint reading and interpretation',
      'Pipe system design and layout',
      'Safety protocols and standards',
      'Hands-on workshop training',
      'Industry certification preparation'
    ],
    curriculum: [
      'Week 1-2: Introduction to Pipe Fitting & Safety',
      'Week 3-4: Pipe Materials & Tools',
      'Week 5-6: Pipe Cutting & Threading Techniques',
      'Week 7: System Design & Layout',
      'Week 8: Practical Projects & Certification'
    ],
    requirements: [
      'Basic education (Matriculation)',
      'Physical fitness for workshop activities',
      'Safety gear will be provided'
    ],
    price: 'PKR 25,000',
    originalPrice: 'PKR 30,000',
    savings: 'Save PKR 5,000',
    icon: HiOutlineWrench,
    color: BRAND_COLORS.teal,
    image: "https://images.pexels.com/photos/6124242/pexels-photo-6124242.jpeg",
    featured: true,
    rating: 4.8,
    reviews: 124,
    studentsTrained: 500
  },
  'safety-inspector': {
    id: 'safety-inspector',
    title: 'Safety Inspector',
    category: 'Safety Training',
    description: 'Professional safety inspection training for construction and industrial environments with OSHA certification preparation.',
    longDescription: 'Become a certified Safety Inspector with our 6-week intensive program. Learn to conduct site inspections, assess risks, and implement safety protocols according to OSHA and international standards.',
    duration: '6 Weeks',
    students: 'Max 15 per batch',
    level: 'Intermediate',
    schedule: 'Tuesday to Saturday, 2 PM - 6 PM',
    location: 'Safety Training Center, Lahore',
    startDate: '20th March 2024',
    highlights: [
      'OSHA standards and regulations',
      'Site inspection methodologies',
      'Risk assessment techniques',
      'Safety documentation',
      'Emergency response planning',
      'Certification exam preparation'
    ],
    curriculum: [
      'Week 1: Introduction to Safety Standards',
      'Week 2: Site Inspection Protocols',
      'Week 3: Risk Assessment Methods',
      'Week 4: Safety Documentation',
      'Week 5: Emergency Procedures',
      'Week 6: Certification Exam Prep'
    ],
    requirements: [
      'Minimum Intermediate education',
      'Background in construction or industry',
      'Basic computer skills'
    ],
    price: 'PKR 30,000',
    originalPrice: 'PKR 35,000',
    savings: 'Save PKR 5,000',
    icon: HiOutlineShieldCheck,
    color: BRAND_COLORS.darkRoyalBlue,
    image: "https://images.pexels.com/photos/34082713/pexels-photo-34082713.jpeg",
    featured: true,
    rating: 4.9,
    reviews: 89,
    studentsTrained: 320
  },
  'welding': {
    id: 'welding',
    title: 'Professional Welding',
    category: 'Technical Training',
    description: 'Comprehensive welding training covering MIG, TIG, and Arc welding techniques for industrial applications.',
    longDescription: 'Master professional welding techniques with our 10-week comprehensive program. From basic metal joining to advanced industrial welding, gain hands-on experience with modern equipment under expert guidance.',
    duration: '10 Weeks',
    students: 'Max 12 per batch',
    level: 'Beginner to Professional',
    schedule: 'Monday to Thursday, 10 AM - 4 PM',
    location: 'Welding Workshop, Islamabad',
    startDate: '25th March 2024',
    highlights: [
      'MIG, TIG, and Arc welding techniques',
      'Metal identification and preparation',
      'Weld quality inspection',
      'Safety equipment usage',
      'Industry-standard certification',
      'Portfolio development'
    ],
    curriculum: [
      'Week 1-2: Welding Fundamentals & Safety',
      'Week 3-4: Arc Welding Techniques',
      'Week 5-6: MIG Welding Mastery',
      'Week 7-8: TIG Welding Skills',
      'Week 9: Advanced Welding Projects',
      'Week 10: Certification & Portfolio'
    ],
    requirements: [
      'Basic education (Matriculation)',
      'Protective gear will be provided',
      'Good hand-eye coordination'
    ],
    price: 'PKR 35,000',
    originalPrice: 'PKR 40,000',
    savings: 'Save PKR 5,000',
    icon: HiOutlineCash,
    color: BRAND_COLORS.deepRed,
    image: "https://images.pexels.com/photos/7650512/pexels-photo-7650512.jpeg",
    featured: true,
    rating: 4.7,
    reviews: 156,
    studentsTrained: 450
  }
};

// Instructor Data
const instructors = [
  {
    name: 'Engr. Ali Raza',
    role: 'Senior Pipe Fitting Expert',
    experience: '15 years',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'Former chief engineer at Pakistan Steel Mills'
  },
  {
    name: 'Ms. Ayesha Khan',
    role: 'Safety Compliance Officer',
    experience: '12 years',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'OSHA certified safety professional'
  },
  {
    name: 'Engr. Muhammad Shahid',
    role: 'Welding Specialist',
    experience: '18 years',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    description: 'International welding certification holder'
  }
];

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
 
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const courseId = params.id as string;
  const course = coursesData[courseId as keyof typeof coursesData];

  useEffect(() => {
    if (course) {
      setSelectedCourse(course);
    }
  }, [course]);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h2>
          <Link href="/courses" className="text-blue-600 hover:text-blue-800">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const handleEnrollNow = () => {
    router.push(`/courses/${courseId}/enrollment`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
        </div>

        {/* Course Hero Section */}
       <motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mb-12"
>
  <div className=" bg-white shadow-md rounded-2xl  border border-gray-100 overflow-hidden md:flex">
    {/* Course Image */}
    <div className="md:w-2/5 relative">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-64 md:h-full object-cover"
      />
      
    </div>

    {/* Course Info */}
<div className="md:w-3/5 p-6 flex flex-col justify-between">
  {/* Course Header */}
  <div>
    <header className="mb-4">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: BRAND_COLORS.darkNavy }}
      >
        {course.title}
      </h1>
      <p className="text-base text-gray-700">{course.description}</p>
    </header>

    {/* Stats List with subtle dots */}
    <ul className="mb-4 text-gray-700 text-sm space-y-1">
      {[
        { label: 'Duration', value: course.duration },
        { label: 'Class Size', value: course.students },
        { label: 'Level', value: course.level },
        { label: 'Starts', value: course.startDate },
      ].map((stat) => (
        <li
          key={stat.label}
          className="flex items-center gap-2 before:content-['•'] before:text-gray-400 before:mr-2"
        >
          <span className="font-medium">{stat.value}</span>
          <span className="text-gray-500">{stat.label}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* Price & CTA */}
  <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className="text-2xl font-bold"
          style={{ color: BRAND_COLORS.deepRed }}
        >
          {course.price}
        </span>
        {course.originalPrice && (
          <span className="text-sm text-gray-500 line-through">
            {course.originalPrice}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600">
        {course.savings && (
          <span
            className="px-2 py-0.5 rounded-full font-semibold"
            style={{
              backgroundColor: `${BRAND_COLORS.deepRed}15`,
              color: BRAND_COLORS.deepRed,
            }}
          >
            {course.savings}
          </span>
        )}
        <span>{course.studentsTrained.toLocaleString()} students trained</span>
      </div>
    </div>

    <button
      onClick={handleEnrollNow}
      className="px-6 py-3 rounded-lg font-bold text-base shadow transition-transform duration-200 transform hover:scale-105 active:scale-95"
      style={{
        backgroundColor: BRAND_COLORS.deepRed,
        color: BRAND_COLORS.white,
      }}
    >
      Enroll Now
    </button>
  </div>
</div>



  </div>
</motion.section>


        {/* Course Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Curriculum */}
          <div className="lg:col-span-2">
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-2xl p-8 border border-gray-100"
>
  <h2
    className="text-2xl font-bold mb-6 flex items-center"
    style={{ color: BRAND_COLORS.darkNavy }}
  >
    <HiCheckCircle className="w-6 h-6 mr-3" style={{ color: BRAND_COLORS.darkNavy }} />
    Course Curriculum
  </h2>

  <div className="space-y-4">
    {course.curriculum.map((item, index) => (
      <div key={index} className="flex items-start gap-3">
        {/* Check-circle for curriculum */}
        <IoMdArrowDropright className="text-blue-900 w-6 h-6 mt-1 flex-shrink-0" />
        {/* Curriculum text */}
        <span className="text-gray-700 text-base">{item}</span>
      </div>
    ))}
  </div>
</motion.div>



            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className=" rounded-2xl  p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center"
                style={{ color: BRAND_COLORS.darkNavy }}>
                <HiCheckCircle className="w-6 h-6 mr-3" style={{ color: course.color }} />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <HiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: BRAND_COLORS.teal }} />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

       {/* Right Column - Sidebar */}
<div className="space-y-6">
  {/* Course Details Card */}
 <motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  className="rounded-2xl shadow-md p-6 border border-gray-100"
>
  <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
    Course Details
  </h3>
  <ul className="space-y-3 text-gray-700 text-base">
    <li className="flex items-start gap-3 before:content-['•'] before:text-blue-900 before:text-xl before:mt-1 before:font-bold">
      <div>
        <div className="font-medium">{course.schedule}</div>
        <div className="text-gray-500">Schedule</div>
      </div>
    </li>
    <li className="flex items-start gap-3 before:content-['•'] before:text-blue-900 before:text-xl before:mt-1 before:font-bold">
      <div>
        <div className="font-medium">{course.location}</div>
        <div className="text-gray-500">Location</div>
      </div>
    </li>
    <li className="flex items-start gap-3 before:content-['•'] before:text-blue-900 before:text-xl before:mt-1 before:font-bold">
      <div>
        <div className="font-medium">English & Urdu</div>
        <div className="text-gray-500">Language</div>
      </div>
    </li>
  </ul>
</motion.div>


  {/* Requirements Card */}
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="rounded-2xl shadow-md p-6 border border-gray-100"
>
  <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_COLORS.darkNavy }}>
    Requirements
  </h3>
  <ul className="space-y-3 text-gray-700 text-base">
    {course.requirements.map((req, index) => (
      <li
        key={index}
        className="flex items-start gap-3 before:content-['•'] before:text-blue-900 before:text-xl before:mt-1 before:font-bold"
      >
        {req}
      </li>
    ))}
  </ul>
</motion.div>

</div>

        </div>

      </div>
    </div>
  );
}