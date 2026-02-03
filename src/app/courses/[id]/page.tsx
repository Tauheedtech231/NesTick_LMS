// app/courses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {  CheckCircle, } from 'lucide-react';
import EnrollmentForm from '@/components/EnrollmentForm';

// Course data (in real app, this would come from API)
const courseDatabase = {
  'osha-safety': {
    id: 'osha-safety',
    title: 'OSHA Workplace Safety',
    description: 'Comprehensive training in workplace safety protocols, hazard identification, and regulatory compliance for industrial environments.',
    fullDescription: `This course provides in-depth knowledge of Occupational Safety and Health Administration (OSHA) standards and regulations. Students will learn practical safety measures, risk assessment techniques, and emergency response procedures essential for maintaining safe working environments.

Key learning outcomes include understanding workplace hazards, implementing safety protocols, conducting safety inspections, and developing emergency response plans. The course combines theoretical knowledge with practical applications through case studies and simulations.`,
    duration: '6 Weeks',
    level: 'Intermediate',
    category: 'Safety',
    fees: 15000,
    image: 'osha.jpg',
    syllabus: [
      'Introduction to OSHA Standards',
      'Workplace Hazard Identification',
      'Personal Protective Equipment (PPE)',
      'Emergency Response Procedures',
      'Safety Inspections & Audits',
      'Accident Prevention Techniques',
      'Regulatory Compliance',
      'Case Studies & Practical Applications'
    ],
    prerequisites: ['Matriculation Certificate', 'Basic English Proficiency'],
    learningOutcomes: [
      'Understand OSHA regulations and standards',
      'Identify workplace hazards',
      'Implement safety protocols',
      'Conduct safety inspections',
      'Develop emergency response plans'
    ]
  },
  'civil-engineering': {
    id: 'civil-engineering',
    title: 'Civil Engineering Basics',
    description: 'Introduction to civil engineering principles, materials, and construction techniques.',
    fullDescription: `This course introduces students to fundamental civil engineering concepts, including structural analysis, material properties, and construction methodologies. Through hands-on projects and theoretical learning, students will understand the basics of civil infrastructure development.

Topics covered include surveying techniques, material testing, structural design principles, and construction site management. The course emphasizes practical applications and real-world scenarios.`,
    duration: '8 Weeks',
    level: 'Matric',
    category: 'Engineering',
    fees: 12000,
    image: 'civil.jpg',
    syllabus: [
      'Introduction to Civil Engineering',
      'Surveying Techniques',
      'Construction Materials',
      'Structural Basics',
      'Site Management',
      'Safety in Construction',
      'Project Planning'
    ],
    prerequisites: ['Matriculation Certificate'],
    learningOutcomes: [
      'Understand civil engineering principles',
      'Learn basic surveying techniques',
      'Identify construction materials',
      'Apply safety protocols'
    ]
  },
  'cybersecurity': {
    id: 'cybersecurity',
    title: 'Cybersecurity Fundamentals',
    description: 'Understand basic cybersecurity concepts, threats, and protection mechanisms.',
    fullDescription: `This course provides foundational knowledge in cybersecurity, covering essential concepts of digital security, threat identification, and protection mechanisms. Students will learn about common cyber threats, security protocols, and defense strategies.

The curriculum includes hands-on labs, real-world scenarios, and practical exercises to develop skills in threat detection, security implementation, and incident response.`,
    duration: '10 Weeks',
    level: 'Intermediate',
    category: 'IT & Tech',
    fees: 18000,
    image: 'cybersecurity.jpg',
    syllabus: [
      'Cybersecurity Basics',
      'Network Security',
      'Threat Identification',
      'Encryption Techniques',
      'Security Protocols',
      'Incident Response',
      'Ethical Hacking Basics'
    ],
    prerequisites: ['Basic Computer Knowledge', 'Matriculation Certificate'],
    learningOutcomes: [
      'Understand cybersecurity fundamentals',
      'Identify common cyber threats',
      'Implement basic security measures',
      'Learn incident response procedures'
    ]
  }
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [course, setCourse] = useState<any>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const courseId = params.id as string;
    const courseData = courseDatabase[courseId as keyof typeof courseDatabase];
    
    if (courseData) {
      setCourse(courseData);
      
      // Store selected course in localStorage
      localStorage.setItem('selectedCourse', JSON.stringify(courseData));
    } else {
      router.push('/courses');
    }
    
    setLoading(false);
  }, [params.id, router]);

  const handleEnrollmentSuccess = () => {
    // Navigate to voucher page (you can create a separate route for this)
    // For now, we'll show an alert
    alert('Enrollment successful! Proceeding to payment voucher...');
    // In real app: router.push('/courses/enrollment/voucher');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600 mb-6">The course you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold rounded-lg transition-colors"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Course Hero Section */}
       <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
      
      {/* Course Image */}
      <div className="lg:w-1/3 relative h-64 lg:h-80 rounded-2xl overflow-hidden shadow-xl">
        <Image
          src={`/courses/${course.image}`}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
          {course.category}
        </span>
      </div>

      {/* Course Info */}
      <div className="lg:w-2/3 flex flex-col gap-6">
        {/* Title & Description */}
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
            {course.level} Level
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{course.title}</h1>
          <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
            {course.description}
          </p>
        </div>

     

        {/* Price & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-white/20">
          <div>
            <div className="text-sm text-blue-200 mb-1">Course Fees</div>
            <div className="text-3xl font-bold">PKR {course.fees.toLocaleString()}</div>
            <div className="text-sm text-blue-200">Includes all study materials</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsEnrollmentOpen(true)}
              className="px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
            >
              Enroll Now
            </button>
            <button
              onClick={() => router.push("/courses")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg backdrop-blur-sm transition-colors duration-200"
            >
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Course Overview */}
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Overview</h2>
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{course.fullDescription}</p>
                </div>
              </section>

              {/* Syllabus */}
             <section>
  <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Syllabus</h2>

  <ol className="list-decimal list-inside space-y-3 text-gray-800">
    {course.syllabus.map((item: string, index: number) => (
      <li key={index} className="text-base leading-relaxed">
        {item}
      </li>
    ))}
  </ol>
</section>


              {/* Learning Outcomes */}
             <section>
  <h2 className="text-3xl font-bold text-gray-900 mb-6">Learning Outcomes</h2>

  <ul className="space-y-3">
    {course.learningOutcomes.map((outcome: string, index: number) => (
      <li key={index} className="flex items-start gap-3">
        {/* Custom check icon */}
        <span className="flex-shrink-0 mt-1">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </span>

        {/* Outcome text */}
        <span className="text-gray-700 text-base leading-relaxed">{outcome}</span>
      </li>
    ))}
  </ul>
</section>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Details Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Course Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold text-gray-900">{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold text-gray-900">{course.category}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Study Mode:</span>
                    <span className="font-semibold text-gray-900">Hybrid</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-semibold text-gray-900">English/Urdu</span>
                  </div>
                </div>
              </div>

            

            
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Form Modal */}
      <EnrollmentForm
        isOpen={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
        onSuccess={handleEnrollmentSuccess}
        course={{
          id: course.id,
          title: course.title,
          fees: course.fees,
        }}
      />
    </>
  );
}